import * as THREE from "three";
import { createCoatMaterials, createEyeMaterial, SHELL_PARTS } from "./fur.js";
import { STALK_PATH, INTEREST } from "./room.js";

const UP = new THREE.Vector3(0, 1, 0);
const SPEED = 0.125;
const CYCLE = 1.28;
const SWING = 0.38;
const OFFSET = { LF: 0, RH: 0.25, RF: 0.5, LH: 0.75 };

const _v = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _q2 = new THREE.Quaternion();
const _m = new THREE.Matrix4();

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function damp(current, target, lambda, dt) {
  return THREE.MathUtils.damp(current, target, lambda, dt);
}

function wrapAngle(a) {
  const t = Math.PI * 2;
  return ((a + Math.PI) % t + t) % t - Math.PI;
}

function orientOutward(geo) {
  geo.computeVertexNormals();
  const pos = geo.attributes.position;
  const norm = geo.attributes.normal;
  if (!pos || !norm || pos.count === 0) return geo;
  const center = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    center.x += pos.getX(i);
    center.y += pos.getY(i);
    center.z += pos.getZ(i);
  }
  center.multiplyScalar(1 / pos.count);
  let dotSum = 0;
  const step = Math.max(1, Math.floor(pos.count / 24));
  for (let i = 0; i < pos.count; i += step) {
    _v.set(pos.getX(i) - center.x, pos.getY(i) - center.y, pos.getZ(i) - center.z);
    _v2.set(norm.getX(i), norm.getY(i), norm.getZ(i));
    dotSum += _v.dot(_v2);
  }
  if (dotSum < 0 && geo.index) {
    const idx = geo.index;
    for (let i = 0; i < idx.count; i += 3) {
      const tmp = idx.getX(i);
      idx.setX(i, idx.getX(i + 2));
      idx.setX(i + 2, tmp);
    }
    geo.computeVertexNormals();
  }
  return geo;
}

function limbGeometry(r0, r1, length, segs = 9) {
  const pts = [new THREE.Vector2(0, 0)];
  const n = 5;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const r = r0 + (r1 - r0) * t;
    const belly = Math.sin(t * Math.PI) * ((r0 + r1) * 0.5) * 0.2;
    pts.push(new THREE.Vector2(Math.max(0.0012, r + belly), t * length));
  }
  pts.push(new THREE.Vector2(0, length));
  const geo = new THREE.LatheGeometry(pts, segs);
  return orientOutward(geo);
}

function tagAlongY(geo, t0, t1) {
  const pos = geo.attributes.position;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const span = Math.max(1e-5, maxY - minY);
  const arr = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const along = t0 + ((pos.getY(i) - minY) / span) * (t1 - t0);
    arr[i * 2] = along;
    arr[i * 2 + 1] = along;
  }
  geo.setAttribute("patCoord", new THREE.BufferAttribute(arr, 2));
  return geo;
}

function coat(mesh, part) {
  mesh.userData.fur = true;
  mesh.userData.part = part;
  mesh.castShadow = true;
  mesh.receiveShadow = false;
  return mesh;
}

function bakeCoat(root) {
  root.updateWorldMatrix(true, true);
  const rootInv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const v = new THREE.Vector3();
  const n = new THREE.Vector3();
  root.traverse((obj) => {
    if (!obj.isMesh || !obj.userData.fur || !obj.geometry) return;
    const geo = obj.geometry;
    const pos = geo.attributes.position;
    const norm = geo.attributes.normal;
    if (!norm) {
      geo.computeVertexNormals();
    }
    const normals = geo.attributes.normal;
    const mat = new THREE.Matrix4().multiplyMatrices(rootInv, obj.matrixWorld);
    const nmat = new THREE.Matrix3().getNormalMatrix(mat);
    const rest = new Float32Array(pos.count * 3);
    const restN = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(mat);
      rest[i * 3] = v.x;
      rest[i * 3 + 1] = v.y;
      rest[i * 3 + 2] = v.z;
      n.fromBufferAttribute(normals, i).applyMatrix3(nmat).normalize();
      restN[i * 3] = n.x;
      restN[i * 3 + 1] = n.y;
      restN[i * 3 + 2] = n.z;
    }
    geo.setAttribute("catRest", new THREE.BufferAttribute(rest, 3));
    geo.setAttribute("catRestN", new THREE.BufferAttribute(restN, 3));
    const parts = new Float32Array(pos.count);
    parts.fill(obj.userData.part ?? 0);
    geo.setAttribute("partId", new THREE.BufferAttribute(parts, 1));
    if (!geo.attributes.patCoord) {
      geo.setAttribute("patCoord", new THREE.BufferAttribute(new Float32Array(pos.count * 2), 2));
    }
  });
}

function addShells(root, shells) {
  const meshes = [];
  root.traverse((obj) => {
    if (obj.isMesh && obj.userData.fur && SHELL_PARTS.has(obj.userData.part)) meshes.push(obj);
  });
  for (const mesh of meshes) {
    shells.forEach((mat, i) => {
      const shell = new THREE.Mesh(mesh.geometry, mat);
      shell.castShadow = false;
      shell.receiveShadow = false;
      shell.renderOrder = 1 + i;
      shell.userData.shell = true;
      mesh.add(shell);
    });
  }
}

function solve2(origin, target, L1, L2, pole, jointOut, endOut) {
  _v.copy(target).sub(origin);
  let dist = _v.length();
  const max = L1 + L2 - 1e-4;
  const min = Math.abs(L1 - L2) + 1e-4;
  if (dist < 1e-5) {
    _v.set(0, -min, 0);
    dist = min;
  } else if (dist > max) {
    _v.multiplyScalar(max / dist);
    dist = max;
  } else if (dist < min) {
    _v.multiplyScalar(min / dist);
    dist = min;
  }
  endOut.copy(origin).add(_v);
  const dir = _v.clone().normalize();
  const cosA = clamp((L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist), -1, 1);
  const angle = Math.acos(cosA);
  const bend = pole.clone().addScaledVector(dir, -pole.dot(dir));
  if (bend.lengthSq() < 1e-8) {
    bend.set(1, 0, 0).addScaledVector(dir, -dir.x);
    if (bend.lengthSq() < 1e-8) bend.set(0, 0, 1);
  }
  bend.normalize();
  const axis = _v3.crossVectors(dir, bend).normalize();
  dir.applyAxisAngle(axis, angle);
  jointOut.copy(origin).addScaledVector(dir, L1);
}

function pointBone(bone, targetWorld) {
  bone.parent.updateWorldMatrix(true, false);
  _v.copy(bone.position).applyMatrix4(bone.parent.matrixWorld);
  _v2.copy(targetWorld).sub(_v);
  if (_v2.lengthSq() < 1e-10) return;
  _v2.normalize();
  _q.setFromUnitVectors(UP, _v2);
  bone.parent.getWorldQuaternion(_q2);
  bone.quaternion.copy(_q2.invert()).multiply(_q);
}

function setWorldPosition(obj, worldPos) {
  obj.parent.updateWorldMatrix(true, false);
  obj.position.copy(worldPos);
  obj.parent.worldToLocal(obj.position);
}

function setWorldQuaternion(obj, worldQ) {
  obj.parent.getWorldQuaternion(_q2);
  obj.quaternion.copy(_q2.invert()).multiply(worldQ);
}

function slinkSwing(t) {
  const u = clamp(t, 0, 1);
  let h;
  if (u < 0.14) h = (u / 0.14) * 0.05;
  else if (u < 0.56) {
    const s = (u - 0.14) / 0.42;
    const e = s * s * (3 - 2 * s);
    h = 0.05 + 0.8 * e;
  } else if (u < 0.78) h = 0.85 + ((u - 0.56) / 0.22) * 0.07;
  else h = 0.92 + ((u - 0.78) / 0.22) * 0.08;

  let y;
  if (u < 0.14) y = Math.sin((u / 0.14) * Math.PI * 0.5) * 0.007;
  else if (u < 0.56) y = 0.007 + Math.sin(((u - 0.14) / 0.42) * Math.PI) * 0.011;
  else if (u < 0.78) y = 0.008 + Math.sin(u * 52) * 0.001;
  else y = 0.008 * (1 - (u - 0.78) / 0.22);

  let pitch;
  if (u < 0.18) pitch = (u / 0.18) * 0.5;
  else if (u < 0.7) pitch = 0.5;
  else pitch = 0.5 * (1 - (u - 0.7) / 0.3);
  return { h, y, pitch };
}

function projectEllipsoid(point, center, radius, scale, lift = 0.0022) {
  _v.copy(point).sub(center);
  _v.divide(scale).normalize().multiplyScalar(radius + lift).multiply(scale);
  return center.clone().add(_v);
}

function markingTube(points, radius, material) {
  const curve = new THREE.CatmullRomCurve3(points);
  const geo = new THREE.TubeGeometry(curve, Math.max(8, points.length * 4), radius, 5, false);
  const mesh = new THREE.Mesh(geo, material);
  return coat(mesh, 7);
}

function bodyGeometry() {
  const sections = [
    { z: -0.168, y: 0.078, rx: 0.03, ry: 0.028 },
    { z: -0.125, y: 0.08, rx: 0.05, ry: 0.04 },
    { z: -0.06, y: 0.078, rx: 0.054, ry: 0.041 },
    { z: 0.01, y: 0.08, rx: 0.05, ry: 0.039 },
    { z: 0.07, y: 0.086, rx: 0.058, ry: 0.044 },
    { z: 0.115, y: 0.09, rx: 0.055, ry: 0.045 },
    { z: 0.155, y: 0.096, rx: 0.04, ry: 0.034 },
    { z: 0.182, y: 0.104, rx: 0.028, ry: 0.026 },
  ];
  const radial = 22;
  const positions = [];
  const indices = [];
  const frames = sections.map((s, i) => {
    const c = new THREE.Vector3(0, s.y, s.z);
    const prev = sections[Math.max(0, i - 1)];
    const next = sections[Math.min(sections.length - 1, i + 1)];
    const tangent = new THREE.Vector3(0, next.y - prev.y, next.z - prev.z).normalize();
    const side = new THREE.Vector3().crossVectors(tangent, UP);
    if (side.lengthSq() < 1e-8) side.set(1, 0, 0);
    side.normalize();
    const frameUp = new THREE.Vector3().crossVectors(side, tangent).normalize();
    return { c, side, frameUp, s };
  });
  frames.forEach(({ c, side, frameUp, s }) => {
    for (let j = 0; j < radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const ex = Math.cos(a) * s.rx;
      let ey = Math.sin(a) * s.ry;
      if (ey < 0) ey *= 0.9;
      positions.push(
        c.x + side.x * ex + frameUp.x * ey,
        c.y + side.y * ex + frameUp.y * ey,
        c.z + side.z * ex + frameUp.z * ey
      );
    }
  });
  for (let i = 0; i < sections.length - 1; i++) {
    for (let j = 0; j < radial; j++) {
      const j2 = (j + 1) % radial;
      const a = i * radial + j;
      const b = i * radial + j2;
      const c = (i + 1) * radial + j;
      const d = (i + 1) * radial + j2;
      indices.push(a, c, b, b, c, d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  return orientOutward(geo);
}

function earGeometry() {
  const rows = 8;
  const cols = 6;
  const positions = [];
  const indices = [];
  for (let r = 0; r <= rows; r++) {
    const v = r / rows;
    const halfW = 0.02 * Math.pow(1 - v, 0.62);
    const y = v * 0.062;
    const cup = Math.sin(v * Math.PI) * 0.007;
    for (let c = 0; c <= cols; c++) {
      const u = (c / cols) * 2 - 1;
      const x = u * halfW;
      const z = -Math.pow(Math.abs(u), 1.25) * 0.006 - cup * (1 - u * u * 0.25);
      positions.push(x, y, z);
    }
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const a = r * (cols + 1) + c;
      const b = a + 1;
      const d = a + (cols + 1);
      const e = d + 1;
      indices.push(a, d, b, b, d, e);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function buildEar(side, mats) {
  const group = new THREE.Group();
  group.name = side < 0 ? "earL" : "earR";
  const outerGeo = earGeometry();
  tagAlongY(outerGeo, 0, 1);
  const outer = new THREE.Mesh(outerGeo, mats.fur);
  coat(outer, 4);
  if (side < 0) {
    outerGeo.scale(-1, 1, 1);
    orientOutward(outerGeo);
    tagAlongY(outerGeo, 0, 1);
  }
  group.add(outer);

  const inner = new THREE.Mesh(earGeometry(), mats.earInner);
  inner.scale.set(side < 0 ? -0.78 : 0.78, 0.78, 0.78);
  inner.position.set(0, 0.004, -0.0035);
  inner.castShadow = false;
  group.add(inner);

  const ridgeMat = new THREE.MeshStandardMaterial({ color: 0xc47878, roughness: 0.6 });
  for (const x of [-0.004, 0.004]) {
    const ridge = new THREE.Mesh(new THREE.CapsuleGeometry(0.0008, 0.02, 2, 4), ridgeMat);
    ridge.position.set(side < 0 ? -x : x, 0.03, -0.004);
    ridge.castShadow = false;
    group.add(ridge);
  }

  const tuft = new THREE.Mesh(
    new THREE.ConeGeometry(0.004, 0.012, 5),
    mats.fur
  );
  coat(tuft, 7);
  tuft.position.set(0, 0.066, -0.001);
  tuft.geometry.translate(0, 0.004, 0);
  group.add(tuft);

  const base = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), mats.fur);
  coat(base, 4);
  base.scale.set(1.1, 0.45, 0.7);
  base.position.set(0, 0.004, 0.002);
  group.add(base);

  group.position.set(side * 0.03, 0.046, 0.006);
  group.rotation.z = side * -0.42;
  group.rotation.x = -0.22;
  return group;
}

function buildEye(side, mats, eyeMat) {
  const pivot = new THREE.Group();
  pivot.position.set(side * 0.02, 0.009, 0.044);
  pivot.rotation.y = side * -0.32;
  pivot.rotation.x = 0.08;

  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.011, 22, 16), eyeMat);
  ball.castShadow = false;
  pivot.add(ball);

  const cornea = new THREE.Mesh(new THREE.SphereGeometry(0.0117, 16, 12), mats.cornea);
  cornea.castShadow = false;
  pivot.add(cornea);

  const glint = new THREE.Mesh(new THREE.SphereGeometry(0.0023, 8, 6), mats.catchlight);
  glint.position.set(-0.0032, 0.0042, 0.0096);
  glint.castShadow = false;
  pivot.add(glint);

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.0111, 0.0015, 6, 18),
    new THREE.MeshStandardMaterial({ color: 0x1a120e, roughness: 0.7 })
  );
  rim.position.z = 0.003;
  rim.castShadow = false;
  pivot.add(rim);

  const lid = new THREE.Mesh(new THREE.SphereGeometry(0.0123, 14, 10), mats.fur);
  coat(lid, 1);
  lid.scale.set(1.05, 0.62, 0.48);
  lid.position.set(0, 0.0076, 0.005);
  pivot.add(lid);

  return { pivot, lid };
}

function buildPaw(side, isHind, mats) {
  const group = new THREE.Group();
  const toes = new THREE.Group();
  const fur = mats.fur;
  const main = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), fur);
  coat(main, 5);
  main.scale.set(isHind ? 0.016 : 0.017, 0.01, isHind ? 0.022 : 0.024);
  main.position.set(0, 0.011, 0.006);
  group.add(main);

  const spreads = [-1.5, -0.5, 0.5, 1.5];
  spreads.forEach((s) => {
    const toe = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), fur);
    coat(toe, 5);
    toe.scale.set(0.0064, 0.0052, 0.0082);
    toe.position.set(s * 0.0062, 0.0082, 0.024);
    toes.add(toe);
    const bean = new THREE.Mesh(new THREE.SphereGeometry(1, 7, 5), mats.pad);
    bean.scale.set(0.0042, 0.0022, 0.005);
    bean.position.set(s * 0.0062, 0.0022, 0.023);
    bean.castShadow = false;
    group.add(bean);
  });
  group.add(toes);
  const palm = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), mats.pad);
  palm.scale.set(0.009, 0.0032, 0.011);
  palm.position.set(0, 0.0024, 0.008);
  palm.castShadow = false;
  group.add(palm);
  if (!isHind) {
    const carpal = new THREE.Mesh(new THREE.SphereGeometry(1, 6, 5), mats.pad);
    carpal.scale.set(0.004, 0.002, 0.005);
    carpal.position.set(side * 0.004, 0.004, -0.006);
    group.add(carpal);
  }
  group.userData.toes = toes;
  return group;
}

function addWhisker(parent, origin, dir, length, droop, mats) {
  const n = dir.clone().normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const bin = new THREE.Vector3().crossVectors(up, n);
  if (bin.lengthSq() < 1e-8) bin.set(0, 0, 1);
  bin.normalize();
  const vup = new THREE.Vector3().crossVectors(n, bin).normalize();
  const pts = [];
  for (let i = 0; i <= 5; i++) {
    const t = i / 5;
    pts.push(
      origin
        .clone()
        .addScaledVector(n, length * t)
        .addScaledVector(vup, -droop * t * t)
        .addScaledVector(bin, Math.sin(t * Math.PI) * 0.0015)
    );
  }
  const mesh = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 5, 0.00105, 4, false),
    mats.whisker
  );
  mesh.castShadow = false;
  parent.add(mesh);
}

function buildHead(mats, eyeMat) {
  const head = new THREE.Group();
  head.name = "head";
  head.position.set(0, 0.108, 0.176);

  const craniumCenter = new THREE.Vector3(0, 0.016, 0.018);
  const craniumScale = new THREE.Vector3(1.08, 0.9, 1.1);
  const craniumR = 0.046;
  const cranium = new THREE.Mesh(new THREE.SphereGeometry(craniumR, 28, 20), mats.fur);
  coat(cranium, 1);
  cranium.scale.copy(craniumScale);
  cranium.position.copy(craniumCenter);
  head.add(cranium);

  const cheekCenters = [];
  for (const s of [-1, 1]) {
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.024, 16, 12), mats.fur);
    coat(cheek, 1);
    cheek.scale.set(1.12, 0.78, 1.18);
    cheek.position.set(s * 0.028, -0.006, 0.03);
    head.add(cheek);
    cheekCenters.push(cheek.position.clone());
  }

  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.022, 18, 14), mats.fur);
  coat(muzzle, 1);
  muzzle.scale.set(1.28, 0.7, 1.02);
  muzzle.position.set(0, -0.01, 0.05);
  head.add(muzzle);

  const brow = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 8), mats.fur);
  coat(brow, 1);
  brow.scale.set(1.35, 0.32, 0.62);
  brow.position.set(0, 0.02, 0.042);
  head.add(brow);

  const chin = new THREE.Mesh(new THREE.SphereGeometry(0.015, 12, 10), mats.fur);
  coat(chin, 8);
  chin.scale.set(1.05, 0.62, 0.85);
  chin.position.set(0, -0.026, 0.048);
  head.add(chin);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.0072, 12, 10), mats.nose);
  nose.scale.set(1.15, 0.72, 0.85);
  nose.position.set(0, -0.012, 0.068);
  nose.castShadow = true;
  head.add(nose);
  const nostrilMat = new THREE.MeshStandardMaterial({ color: 0x2a1214, roughness: 0.4 });
  for (const s of [-1, 1]) {
    const nostril = new THREE.Mesh(new THREE.SphereGeometry(0.0018, 6, 5), nostrilMat);
    nostril.position.set(s * 0.0026, -0.0132, 0.073);
    head.add(nostril);
  }
  const philtrum = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.0007, 0.008, 2, 4),
    nostrilMat
  );
  philtrum.position.set(0, -0.02, 0.066);
  head.add(philtrum);
  const mouth = new THREE.Mesh(
    new THREE.TorusGeometry(0.006, 0.0007, 4, 10, Math.PI),
    nostrilMat
  );
  mouth.position.set(0, -0.026, 0.06);
  mouth.rotation.x = Math.PI / 2.4;
  mouth.rotation.z = Math.PI;
  head.add(mouth);

  const spotMat = new THREE.MeshStandardMaterial({ color: 0x1c130f, roughness: 0.75 });
  const whiskerRows = [
    { y: 0.004, z: 0.012, yaw: 0.18, pitch: 0.02, len: 0.072, droop: 0.004 },
    { y: 0.0, z: 0.016, yaw: 0.02, pitch: 0.1, len: 0.086, droop: 0.008 },
    { y: -0.005, z: 0.014, yaw: -0.16, pitch: 0.24, len: 0.074, droop: 0.012 },
    { y: -0.009, z: 0.01, yaw: -0.32, pitch: 0.38, len: 0.058, droop: 0.014 },
  ];
  for (const s of [-1, 1]) {
    for (const w of whiskerRows) {
      const origin = new THREE.Vector3(s * 0.02, -0.01 + w.y, 0.052 + w.z);
      const dir = new THREE.Vector3(s, Math.sin(w.pitch) * 0.35, 0.15).normalize();
      dir.applyAxisAngle(UP, s * w.yaw);
      addWhisker(head, origin, dir, w.len, w.droop, mats);
      const spot = new THREE.Mesh(new THREE.SphereGeometry(0.0016, 5, 4), spotMat);
      spot.position.copy(origin);
      head.add(spot);
    }
    for (const k of [0, 1]) {
      const origin = new THREE.Vector3(s * (0.018 + k * 0.006), 0.02, 0.04);
      const dir = new THREE.Vector3(s * 0.35, 0.78, 0.28).normalize();
      addWhisker(head, origin, dir, 0.028 - k * 0.004, 0.002, mats);
    }
  }

  const ears = [buildEar(-1, mats), buildEar(1, mats)];
  ears.forEach((ear) => head.add(ear));
  const eyes = [buildEye(-1, mats, eyeMat), buildEye(1, mats, eyeMat)];
  eyes.forEach((eye) => head.add(eye.pivot));

  const mRaw = [
    [-0.02, 0.01, 0.046],
    [-0.012, 0.034, 0.04],
    [-0.003, 0.016, 0.05],
    [0, 0.011, 0.052],
    [0.003, 0.016, 0.05],
    [0.012, 0.034, 0.04],
    [0.02, 0.01, 0.046],
  ].map((p) => projectEllipsoid(new THREE.Vector3(...p), craniumCenter, craniumR, craniumScale, 0.0024));
  head.add(markingTube(mRaw, 0.0025, mats.fur));
  for (const s of [-1, 1]) {
    const peak = projectEllipsoid(
      new THREE.Vector3(s * 0.012, 0.034, 0.04),
      craniumCenter,
      craniumR,
      craniumScale,
      0.0024
    );
    const up = projectEllipsoid(
      new THREE.Vector3(s * 0.016, 0.048, 0.02),
      craniumCenter,
      craniumR,
      craniumScale,
      0.002
    );
    head.add(markingTube([peak, up], 0.0021, mats.fur));
    const cheekC = new THREE.Vector3(s * 0.028, -0.006, 0.03);
    const cheekS = new THREE.Vector3(1.12, 0.78, 1.18);
    const stripes = [0.004, -0.004, -0.011].map((y, i) => {
      const a = projectEllipsoid(new THREE.Vector3(s * 0.02, y, 0.046), cheekC, 0.024, cheekS, 0.0016);
      const b = projectEllipsoid(
        new THREE.Vector3(s * 0.04, y - 0.004, 0.02 - i * 0.004),
        cheekC,
        0.024,
        cheekS,
        0.0016
      );
      return markingTube([a, b], 0.0017, mats.fur);
    });
    stripes.forEach((mesh) => head.add(mesh));
    const liner = [
      new THREE.Vector3(s * 0.03, 0.008, 0.046),
      new THREE.Vector3(s * 0.042, 0.004, 0.024),
      new THREE.Vector3(s * 0.048, 0.008, 0.004),
    ].map((p) => projectEllipsoid(p, craniumCenter, craniumR, craniumScale, 0.002));
    head.add(markingTube(liner, 0.0018, mats.fur));
  }

  return { head, ears, eyes };
}

function buildLeg(spec, mats) {
  const pivot = new THREE.Group();
  pivot.position.copy(spec.pivot);
  const bone1 = new THREE.Group();
  pivot.add(bone1);
  const geo1 = limbGeometry(spec.r1a, spec.r1b, spec.L1, spec.isHind ? 10 : 9);
  tagAlongY(geo1, 0, spec.isHind ? 0.42 : 0.48);
  const mesh1 = new THREE.Mesh(geo1, mats.fur);
  coat(mesh1, 2);
  bone1.add(mesh1);

  const bone2 = new THREE.Group();
  bone2.position.y = spec.L1;
  bone1.add(bone2);
  const geo2 = limbGeometry(spec.r2a, spec.r2b, spec.L2, 8);
  tagAlongY(geo2, spec.isHind ? 0.42 : 0.48, spec.isHind ? 0.78 : 1);
  const mesh2 = new THREE.Mesh(geo2, mats.fur);
  coat(mesh2, 2);
  bone2.add(mesh2);

  let bone3 = null;
  if (spec.L3) {
    bone3 = new THREE.Group();
    bone3.position.y = spec.L2;
    bone2.add(bone3);
    const geo3 = limbGeometry(spec.r3a, spec.r3b, spec.L3, 7);
    tagAlongY(geo3, 0.78, 1);
    const mesh3 = new THREE.Mesh(geo3, mats.fur);
    coat(mesh3, 2);
    bone3.add(mesh3);
  }

  const braceletParent = bone3 || bone2;
  const braceletY = bone3 ? spec.L3 * 0.15 : spec.L2 * 0.82;
  const bracelet = new THREE.Mesh(
    new THREE.TorusGeometry((bone3 ? spec.r3a : spec.r2b) + 0.0015, 0.0022, 6, 14),
    mats.fur
  );
  coat(bracelet, 7);
  bracelet.rotation.x = Math.PI / 2;
  bracelet.position.y = braceletY;
  braceletParent.add(bracelet);

  const paw = buildPaw(spec.side, spec.isHind, mats);
  return {
    name: spec.name,
    label: spec.label,
    side: spec.side,
    isHind: spec.isHind,
    lateral: spec.lateral,
    lead: spec.lead,
    pivot,
    bone1,
    bone2,
    bone3,
    L1: spec.L1,
    L2: spec.L2,
    L3: spec.L3 || 0,
    poleLocal: spec.poleLocal.clone().normalize(),
    hockLocal: spec.hockLocal ? spec.hockLocal.clone() : null,
    ankleLocal: spec.ankleLocal.clone(),
    paw,
    toes: paw.userData.toes,
    contact: new THREE.Vector3(),
    swingFrom: new THREE.Vector3(),
    swingTo: new THREE.Vector3(),
    lastPlant: new THREE.Vector3(),
    swinging: false,
    swingT: 0,
    homeSet: false,
  };
}

function buildTail(mats) {
  const root = new THREE.Group();
  root.position.set(0, 0.084, -0.15);
  root.quaternion.setFromUnitVectors(UP, new THREE.Vector3(0.04, -0.2, -1).normalize());
  const segs = [];
  let prev = root;
  const n = 8;
  const len = 0.033;
  for (let i = 0; i < n; i++) {
    const t0 = i / n;
    const t1 = (i + 1) / n;
    const g = new THREE.Group();
    if (i > 0) g.position.y = len * 0.92;
    prev.add(g);
    const r0 = Math.max(0.0032, 0.015 * (1 - t0 * 0.8));
    const r1 = Math.max(0.0026, 0.015 * (1 - t1 * 0.8));
    const geo = limbGeometry(r0, r1, len, 8);
    tagAlongY(geo, t0, t1);
    const mesh = new THREE.Mesh(geo, mats.fur);
    coat(mesh, 3);
    g.add(mesh);
    segs.push({
      group: g,
      x: 0.05 + (i / n) * 0.1,
      z: Math.sin(i * 0.45) * 0.1,
      vx: 0,
      vz: 0,
    });
    prev = g;
  }
  return { root, segs };
}

function locationName(pos) {
  if (pos.z < -0.82 && pos.x > -0.85 && pos.x < 0.7) return "through the moonbeam";
  if (pos.x > 0.72) return "along the sofa";
  if (pos.z > 0.55) return "across the rug";
  if (pos.x < -0.95) return "past the plant";
  if (pos.z < -0.7) return "under the window";
  return "across the floor";
}

export function createTabby() {
  const mats = createCoatMaterials();
  const eyeMat = createEyeMaterial();
  const root = new THREE.Group();
  root.name = "tabby";
  const torso = new THREE.Group();
  root.add(torso);

  const body = new THREE.Mesh(bodyGeometry(), mats.fur);
  coat(body, 0);
  torso.add(body);

  const dorsalPts = [
    new THREE.Vector3(0, 0.118, -0.13),
    new THREE.Vector3(0, 0.13, -0.04),
    new THREE.Vector3(0, 0.138, 0.05),
    new THREE.Vector3(0, 0.142, 0.12),
    new THREE.Vector3(0, 0.134, 0.162),
  ];
  torso.add(markingTube(dorsalPts, 0.0034, mats.fur));

  const neckBase = new THREE.Vector3(0, 0.1, 0.16);
  const headJoint = new THREE.Vector3(0, 0.108, 0.176);
  const neckLen = neckBase.distanceTo(headJoint) + 0.02;
  const neck = new THREE.Mesh(limbGeometry(0.026, 0.02, neckLen, 10), mats.fur);
  coat(neck, 0);
  neck.position.copy(neckBase);
  neck.quaternion.setFromUnitVectors(UP, headJoint.clone().sub(neckBase).normalize());
  torso.add(neck);

  const built = buildHead(mats, eyeMat);
  torso.add(built.head);
  const tail = buildTail(mats);
  torso.add(tail.root);

  const frontPole = new THREE.Vector3(0.35, -0.25, -1).normalize();
  const hindPole = new THREE.Vector3(0.25, 0.15, 1).normalize();
  const legs = {
    LF: buildLeg({
      name: "LF",
      label: "left forepaw",
      side: -1,
      isHind: false,
      pivot: new THREE.Vector3(-0.048, 0.088, 0.1),
      L1: 0.068,
      L2: 0.078,
      r1a: 0.022,
      r1b: 0.016,
      r2a: 0.015,
      r2b: 0.011,
      poleLocal: frontPole.clone().multiply(new THREE.Vector3(1, 1, 1)),
      ankleLocal: new THREE.Vector3(0, 0.015, -0.008),
      lateral: 0.006,
      lead: 0.05,
    }, mats),
    RF: null,
    LH: buildLeg({
      name: "LH",
      label: "left hind paw",
      side: -1,
      isHind: true,
      pivot: new THREE.Vector3(-0.04, 0.08, -0.1),
      L1: 0.072,
      L2: 0.086,
      L3: 0.046,
      r1a: 0.03,
      r1b: 0.018,
      r2a: 0.016,
      r2b: 0.012,
      r3a: 0.011,
      r3b: 0.0095,
      poleLocal: hindPole.clone(),
      hockLocal: new THREE.Vector3(0, 0.042, -0.016),
      ankleLocal: new THREE.Vector3(0, 0.015, -0.006),
      lateral: 0.008,
      lead: -0.008,
    }, mats),
    RH: null,
  };
  legs.LF.poleLocal.set(-0.55, -0.2, -1).normalize();
  legs.RF = buildLeg({
    name: "RF",
    label: "right forepaw",
    side: 1,
    isHind: false,
    pivot: new THREE.Vector3(0.048, 0.088, 0.1),
L1: legs.LF.L1,
      L2: legs.LF.L2,
      r1a: 0.022,
      r1b: 0.016,
      r2a: 0.015,
      r2b: 0.011,
    poleLocal: new THREE.Vector3(0.55, -0.2, -1),
    ankleLocal: legs.LF.ankleLocal.clone(),
    lateral: 0.006,
    lead: 0.05,
  }, mats);
  legs.LH.poleLocal.set(-0.4, 0.2, 1).normalize();
  legs.RH = buildLeg({
    name: "RH",
    label: "right hind paw",
    side: 1,
    isHind: true,
    pivot: new THREE.Vector3(0.04, 0.08, -0.1),
L1: legs.LH.L1,
      L2: legs.LH.L2,
      L3: legs.LH.L3,
      r1a: 0.03,
      r1b: 0.018,
      r2a: 0.016,
      r2b: 0.012,
      r3a: 0.011,
      r3b: 0.0095,
    poleLocal: new THREE.Vector3(0.4, 0.2, 1),
    hockLocal: legs.LH.hockLocal.clone(),
    ankleLocal: legs.LH.ankleLocal.clone(),
    lateral: 0.008,
    lead: -0.008,
  }, mats);

  Object.values(legs).forEach((leg) => {
    torso.add(leg.pivot);
    root.add(leg.paw);
  });

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.18, 28),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.004;
  shadow.renderOrder = 1;
  root.add(shadow);

  bakeCoat(root);
  addShells(root, mats.shells);

  const curve = new THREE.CatmullRomCurve3(STALK_PATH, true, "centripetal", 0.5);
  const pathLen = curve.getLength();
  let bestU = 0;
  let bestD = Infinity;
  for (let i = 0; i <= 240; i++) {
    const u = i / 240;
    const d = curve.getPointAt(u).distanceTo(INTEREST.moonbeam);
    if (d < bestD) {
      bestD = d;
      bestU = u;
    }
  }

  const state = {
    distance: bestU * pathLen,
    gaitTime: 0.64 * CYCLE,
    yaw: 0,
    prevYaw: 0,
    yawRate: 0,
    time: 0,
    frozen: false,
    pendingFreeze: false,
    freezeLeft: 0,
    nextFreeze: 6.5,
    frozenNearMoon: false,
    blink: 0,
    blinkClosing: false,
    nextBlink: 1.6,
    doubleBlink: false,
    earL: 0,
    earR: 0,
    earTargetL: 0,
    earTargetR: 0,
    nextEar: 1.2,
    lookYaw: 0,
    lookPitch: 0.12,
    status: "Reaching with the left forepaw",
    detail: "3 paws down",
    phase: "reaching",
    forward: new THREE.Vector3(0, 0, 1),
    right: new THREE.Vector3(1, 0, 0),
    focus: new THREE.Vector3(),
  };

  function bodyFrame() {
    const u = (state.distance % pathLen) / pathLen;
    const pos = curve.getPointAt(u);
    const tangent = curve.getTangentAt(u);
    const ahead = curve.getPointAt((u + 0.035) % 1);
    return { pos, tangent, ahead, u };
  }

  function placeRoot(pos, yaw) {
    root.position.set(pos.x, 0, pos.z);
    root.rotation.y = yaw;
    state.forward.set(Math.sin(yaw), 0, Math.cos(yaw));
    state.right.set(Math.cos(yaw), 0, -Math.sin(yaw));
  }

  function legPhase(name, cycleT) {
    return (cycleT - OFFSET[name] + 1) % 1;
  }

  function anyActiveSwing(cycleT) {
    return Object.keys(OFFSET).some((name) => legPhase(name, cycleT) < SWING * 0.82);
  }

  function predictLand(leg, forward, right) {
    const pivot = new THREE.Vector3();
    leg.pivot.getWorldPosition(pivot);
    const swingDur = SWING * CYCLE;
    const predict = SPEED * swingDur * 0.9;
    const land = pivot.clone();
    land.y = 0;
    land.addScaledVector(forward, leg.lead + predict);
    land.addScaledVector(right, leg.side * leg.lateral);
    if (leg.isHind) {
      const front = leg.side < 0 ? legs.LF : legs.RF;
      if (front.lastPlant.lengthSq() > 0.0001) {
        _v.copy(front.lastPlant);
        _v.y = 0;
        _v.addScaledVector(right, leg.side * 0.01);
        if (_v.distanceTo(land) < 0.16) land.lerp(_v, 0.45);
      }
    }
    const flat = pivot.clone();
    flat.y = 0;
    const delta = land.clone().sub(flat);
    delta.y = 0;
    const maxH = leg.isHind ? 0.105 : 0.115;
    if (delta.length() > maxH) land.copy(flat).addScaledVector(delta.normalize(), maxH);
    land.y = 0;
    return land;
  }

  function beginSwing(leg, forward, right) {
    leg.swinging = true;
    leg.swingFrom.copy(leg.contact);
    leg.swingTo.copy(predictLand(leg, forward, right));
  }

  function solveLeg(leg, torsoQuat) {
    const pivot = new THREE.Vector3();
    leg.pivot.getWorldPosition(pivot);
    const ankle = leg.contact.clone().add(_v.copy(leg.ankleLocal).applyQuaternion(torsoQuat));
    const pole = _v2.copy(leg.poleLocal).applyQuaternion(torsoQuat).normalize();
    if (leg.isHind) {
      const hock = ankle.clone().add(_v.copy(leg.hockLocal).applyQuaternion(torsoQuat));
      const hipToHock = hock.distanceTo(pivot);
      const maxHS = leg.L1 + leg.L2 - 0.002;
      if (hipToHock > maxHS) {
        hock.lerp(pivot.clone().lerp(ankle, 0.5), (hipToHock - maxHS) / hipToHock);
      }
      const stifle = new THREE.Vector3();
      const hockEnd = new THREE.Vector3();
      solve2(pivot, hock, leg.L1, leg.L2, pole, stifle, hockEnd);
      pointBone(leg.bone1, stifle);
      pointBone(leg.bone2, hockEnd);
      pointBone(leg.bone3, ankle);
    } else {
      const elbow = new THREE.Vector3();
      const wrist = new THREE.Vector3();
      solve2(pivot, ankle, leg.L1, leg.L2, pole, elbow, wrist);
      pointBone(leg.bone1, elbow);
      pointBone(leg.bone2, wrist);
    }

    const swing = leg.swinging ? slinkSwing(leg.swingT) : null;
    const up = new THREE.Vector3(0, 1, 0);
    const fwd = state.forward.clone();
    if (swing) {
      const axis = new THREE.Vector3().crossVectors(up, fwd).normalize();
      fwd.applyAxisAngle(axis, -swing.pitch);
      up.applyAxisAngle(axis, -swing.pitch);
    }
    const right = new THREE.Vector3().crossVectors(up, fwd);
    if (right.lengthSq() < 1e-8) right.set(1, 0, 0);
    right.normalize();
    fwd.crossVectors(right, up).normalize();
    _m.makeBasis(right, up, fwd);
    _q.setFromRotationMatrix(_m);
    setWorldPosition(leg.paw, leg.contact);
    setWorldQuaternion(leg.paw, _q);
    const spread = swing && leg.swingT > 0.55 && leg.swingT < 0.9 ? 1.08 : 1;
    if (leg.toes) leg.toes.scale.x = spread;
  }

  function updateTail(dt, moving) {
    const h = Math.min(dt, 0.033);
    tail.segs.forEach((seg, i) => {
      const t = i / (tail.segs.length - 1);
      let targetX = 0.04 + t * 0.16;
      let targetZ = Math.sin(i * 0.55) * 0.08;
      targetZ += -state.yawRate * (1 - t) * 0.55;
      targetZ += Math.sin(state.time * 1.25 + i * 0.7) * 0.035 * t * (moving ? 1 : 0.25);
      if (!moving && i >= tail.segs.length - 3) {
        targetZ += Math.sin(state.time * 18 + i * 1.7) * 0.18 * ((i - (tail.segs.length - 3)) / 2);
      }
      seg.vx += (targetX - seg.x) * 26 * h;
      seg.vz += (targetZ - seg.z) * 26 * h;
      seg.vx *= Math.exp(-7.5 * h);
      seg.vz *= Math.exp(-7.5 * h);
      seg.x = clamp(seg.x + seg.vx * h, -0.4, 0.8);
      seg.z = clamp(seg.z + seg.vz * h, -0.7, 0.7);
      seg.group.rotation.x = seg.x;
      seg.group.rotation.z = seg.z;
    });
  }

  function updateBlink(dt) {
    if (state.time > state.nextBlink && state.blink === 0 && !state.blinkClosing) {
      state.blinkClosing = true;
    }
    if (state.blinkClosing) {
      state.blink = Math.min(1, state.blink + dt / 0.055);
      if (state.blink >= 1) state.blinkClosing = false;
    } else if (state.blink > 0) {
      state.blink = Math.max(0, state.blink - dt / 0.08);
      if (state.blink === 0) {
        if (state.doubleBlink) {
          state.doubleBlink = false;
          state.blinkClosing = true;
        } else {
          state.doubleBlink = Math.random() < 0.28;
          state.nextBlink = state.time + 2.4 + Math.random() * 3.6;
        }
      }
    }
    const openY = 0.0076;
    const shutY = 0.001;
    built.eyes.forEach((eye) => {
      eye.lid.position.y = openY + (shutY - openY) * state.blink;
      eye.lid.position.z = 0.005 + state.blink * 0.003;
    });
    eyeMat.uniforms.uBlink.value = state.blink;
  }

  function updateEars(dt, attentive) {
    if (state.time > state.nextEar) {
      state.nextEar = state.time + 1.6 + Math.random() * 2.8;
      if (Math.random() < 0.5) state.earTargetL = (Math.random() - 0.3) * 0.45;
      else state.earTargetR = (Math.random() - 0.3) * 0.45;
    }
    state.earTargetL = damp(state.earTargetL, attentive ? -0.08 : 0, 2.2, dt);
    state.earTargetR = damp(state.earTargetR, attentive ? -0.08 : 0, 2.2, dt);
    state.earL = damp(state.earL, state.earTargetL, 8, dt);
    state.earR = damp(state.earR, state.earTargetR, 8, dt);
    built.ears[0].rotation.x = -0.22 + state.earL;
    built.ears[1].rotation.x = -0.22 + state.earR;
  }

  function updateHead(dt, lookAt, attentive) {
    torso.updateWorldMatrix(true, false);
    built.head.parent.updateWorldMatrix(true, false);
    const local = built.head.parent.worldToLocal(lookAt.clone()).sub(built.head.position);
    let yaw = Math.atan2(local.x, local.z);
    let pitch = -Math.atan2(local.y, Math.hypot(local.x, local.z));
    pitch += 0.1;
    if (attentive) pitch -= 0.04;
    yaw = clamp(yaw, -0.42, 0.42);
    pitch = clamp(pitch, -0.12, 0.32);
    state.lookYaw = damp(state.lookYaw, yaw, 5.5, dt);
    state.lookPitch = damp(state.lookPitch, pitch, 5.5, dt);
    built.head.rotation.y = state.lookYaw;
    built.head.rotation.x = state.lookPitch;
    const pupil = state.frozen ? 0.62 : attentive ? 0.4 : 0.24;
    eyeMat.uniforms.uPupil.value = damp(eyeMat.uniforms.uPupil.value, pupil, 3, dt);
  }

  function syncGait(cycleT, forward, right, initializing) {
    Object.values(legs).forEach((leg) => {
      const phase = legPhase(leg.name, cycleT);
      const inSwing = phase < SWING;
      if (inSwing) {
        if (!leg.swinging) {
          if (!leg.homeSet) {
            const pivot = new THREE.Vector3();
            leg.pivot.getWorldPosition(pivot);
            leg.contact.copy(pivot);
            leg.contact.y = 0;
            leg.contact.addScaledVector(forward, leg.isHind ? -0.03 : -0.02);
            leg.contact.addScaledVector(right, leg.side * leg.lateral);
            leg.lastPlant.copy(leg.contact);
            leg.homeSet = true;
          }
          beginSwing(leg, forward, right);
        }
        leg.swingT = phase / SWING;
        const s = slinkSwing(leg.swingT);
        leg.contact.lerpVectors(leg.swingFrom, leg.swingTo, s.h);
        leg.contact.y = s.y;
      } else if (leg.swinging || !leg.homeSet) {
        if (leg.swinging) {
          leg.contact.copy(leg.swingTo);
          leg.contact.y = 0;
          leg.lastPlant.copy(leg.contact);
          leg.swinging = false;
        } else {
          const pivot = new THREE.Vector3();
          leg.pivot.getWorldPosition(pivot);
          const since = (phase - SWING) / (1 - SWING);
          leg.contact.copy(pivot);
          leg.contact.y = 0;
          leg.contact.addScaledVector(forward, leg.lead - since * SPEED * CYCLE * (1 - SWING));
          leg.contact.addScaledVector(right, leg.side * leg.lateral);
          leg.lastPlant.copy(leg.contact);
          leg.homeSet = true;
        }
        if (initializing) leg.homeSet = true;
      }
    });
  }

  // Initial pose, in the moonbeam, one forepaw already reaching.
  {
    const frame = bodyFrame();
    const yaw = Math.atan2(frame.tangent.x, frame.tangent.z);
    state.yaw = yaw;
    state.prevYaw = yaw;
    placeRoot(frame.pos, yaw);
    root.updateMatrixWorld(true);
    const cycleT = (state.gaitTime / CYCLE) % 1;
    syncGait(cycleT, state.forward, state.right, true);
    const torsoQuat = new THREE.Quaternion();
    torso.getWorldQuaternion(torsoQuat);
    Object.values(legs).forEach((leg) => solveLeg(leg, torsoQuat));
  }

  function update(dt, input) {
    const pace = input.pace ?? 1;
    const paused = !!input.paused;
    const liveDt = paused ? 0 : Math.min(dt, 0.05);
    const moveDt = liveDt * pace;
    state.time += liveDt;

    const crouch = input.crouch ?? 0.68;
    const lift = (0.52 - crouch) * 0.04;
    torso.position.y = damp(torso.position.y, lift, 4, liveDt || 0.016);

    const nearMoon = root.position.distanceTo(INTEREST.moonbeam) < 0.55;
    if (!state.frozen && !paused) {
      if (state.time > state.nextFreeze) state.pendingFreeze = true;
      if (nearMoon && !state.frozenNearMoon && state.time > 4) state.pendingFreeze = true;
      if (!nearMoon) state.frozenNearMoon = false;
    }

    const cycleTnow = (state.gaitTime / CYCLE) % 1;
    if (state.pendingFreeze && !anyActiveSwing(cycleTnow)) {
      state.frozen = true;
      state.pendingFreeze = false;
      state.freezeLeft = 1.5 + Math.random() * 1.3;
      state.frozenNearMoon = nearMoon;
      state.nextFreeze = state.time + 9 + Math.random() * 6;
    }
    if (state.frozen) {
      state.freezeLeft -= liveDt;
      if (state.freezeLeft <= 0) state.frozen = false;
    }

    const moving = moveDt > 0 && !state.frozen;
    if (moving) {
      state.distance += SPEED * moveDt;
      state.gaitTime += moveDt;
    }

    const frame = bodyFrame();
    const targetYaw = Math.atan2(frame.tangent.x, frame.tangent.z);
    const yawDelta = wrapAngle(targetYaw - state.yaw);
    const follow = 1 - Math.exp(-(moving ? 4.5 : 2) * (liveDt || 0.016));
    state.yaw += yawDelta * follow;
    state.yawRate = damp(state.yawRate, liveDt > 0 ? yawDelta / Math.max(liveDt, 1e-4) : 0, 4, liveDt || 0.016);
    placeRoot(frame.pos, state.yaw);
    root.updateMatrixWorld(true);

    const cycleT = (state.gaitTime / CYCLE) % 1;
    syncGait(cycleT, state.forward, state.right, false);

    let shift = 0;
    let active = null;
    Object.values(legs).forEach((leg) => {
      if (!leg.swinging) return;
      shift += leg.side < 0 ? 1 : -1;
      if (!active || leg.swingT < active.swingT) active = leg;
    });
    torso.rotation.z = damp(torso.rotation.z, shift * -0.035, 5, liveDt || 0.016);
    torso.position.x = damp(torso.position.x, shift * 0.006, 5, liveDt || 0.016);
    const breath = 1 + Math.sin(state.time * 1.65) * (state.frozen ? 0.006 : 0.009);
    body.scale.set(1, breath, 1 + (breath - 1) * 0.4);
    root.updateMatrixWorld(true);

    const torsoQuat = new THREE.Quaternion();
    torso.getWorldQuaternion(torsoQuat);
    Object.values(legs).forEach((leg) => {
      if (!leg.swinging) {
        const pivot = new THREE.Vector3();
        leg.pivot.getWorldPosition(pivot);
        const flat = pivot.clone();
        flat.y = 0;
        const delta = leg.contact.clone().sub(flat);
        delta.y = 0;
        const maxH = leg.isHind ? 0.1 : 0.112;
        if (delta.length() > maxH) {
          leg.contact.copy(flat).addScaledVector(delta.normalize(), maxH);
          leg.contact.y = 0;
        }
      }
      solveLeg(leg, torsoQuat);
    });

    const moth = input.moth;
    const mouse = input.mouse;
    const ahead = frame.ahead.clone();
    ahead.y = 0.07;
    let look = ahead;
    let attentive = false;
    if (moth && root.position.distanceTo(moth) < 1.8) {
      const toMoth = moth.clone().sub(root.position);
      toMoth.y = 0;
      if (toMoth.dot(state.forward) > 0.15 || state.frozen) {
        look = moth.clone();
        attentive = true;
      }
    } else if (mouse && root.position.distanceTo(mouse) < 0.7) {
      look = mouse.clone().lerp(ahead, 0.45);
    }
    if (state.frozen) {
      look = (moth && root.position.distanceTo(moth) < 2.4 ? moth : ahead).clone();
      look.x += Math.sin(state.time * 0.7) * 0.06;
      attentive = true;
    }

    updateHead(liveDt || 0.016, look, attentive || state.frozen);
    updateEars(liveDt || 0.016, attentive || state.frozen);
    updateBlink(liveDt || 0.016);
    updateTail(liveDt || 0.016, moving);
    built.head.getWorldPosition(state.focus);

    const support = Object.values(legs).filter((leg) => !leg.swinging).length;
    let phase = "creeping";
    let line = `Creeping ${locationName(root.position)}`;
    if (state.frozen) {
      phase = "frozen";
      line = nearMoon ? "Frozen in the moonbeam" : `Still ${locationName(root.position)}`;
    } else if (active) {
      if (active.swingT < 0.56) phase = "reaching";
      else if (active.swingT < 0.8) phase = "hovering";
      else phase = "placing";
      const verb = phase === "reaching" ? "Reaching with" : phase === "hovering" ? "Hovering" : "Placing";
      line = `${verb} the ${active.label}`;
    }
    state.phase = phase;
    state.status = line;
    state.detail = state.frozen
      ? "Tail tip twitching · pupils wide"
      : `${support} paws down · ${locationName(root.position)}`;

    const shine = attentive || state.frozen ? 0.55 : 0.22;
    eyeMat.uniforms.uShine.value = damp(eyeMat.uniforms.uShine.value, shine, 2, liveDt || 0.016);

    return {
      phase,
      line,
      detail: state.detail,
      frozen: state.frozen,
      focus: state.focus,
      yaw: state.yaw,
      forward: state.forward,
      right: state.right,
      position: root.position,
    };
  }

  return {
    object: root,
    eyeMat,
    update,
    get focus() {
      return state.focus;
    },
  };
}
