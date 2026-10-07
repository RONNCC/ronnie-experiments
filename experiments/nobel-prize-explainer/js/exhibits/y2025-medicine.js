/* 2025 Medicine — Regulatory T cells: peacekeepers of the immune patrol. */
import { exhibitShell, makeCanvas, toggle, slider, loop, el, caption, meter, statBox, controlsPanel, TAU, clamp, lerp } from '../kit.js';

export default function render(root) {
  const body = exhibitShell(root, {
    title: 'When the guards go missing',
    hint: 'Purple T-cells hunt invaders — sometimes one goes rogue. Blue Tregs talk them down. Switch them off and watch.',
  });

  let tregsOn = true;
  let pressure = 0.5;      // pathogen spawn rate
  let tissue = [], bugs = [], killers = [], tregs = [], flashes = [];
  let killedByImmune = 0, selfHits = 0;
  let health = 1;

  const grid = el('div', { class: 'sim-grid side' });
  body.append(grid);
  const { ctx, W: CW, H } = makeCanvas(grid, 400);
  const panel = controlsPanel(grid);

  toggle(panel, { label: 'Regulatory T cells (peacekeepers)', on: tregsOn, onChange: v => { tregsOn = v; } });
  slider(panel, {
    label: 'Invader pressure', min: 0, max: 1, step: 0.05, value: pressure,
    fmt: v => v < 0.3 ? 'quiet' : v < 0.7 ? 'busy' : 'under siege', onInput: v => { pressure = v; }
  });

  const healthM = meter(panel, { label: 'Tissue health', color: 'var(--ok)', value: 1 });
  const readouts = el('div', { class: 'readout' });
  panel.append(readouts);
  const stKill = statBox(readouts, { label: 'Invaders destroyed' });
  const stSelf = statBox(readouts, { label: 'Own cells destroyed (autoimmune)' });

  caption(panel, 'Sakaguchi discovered the blue cells in 1995: remove them from healthy mice and autoimmunity erupts. Brunkow & Ramsdell found their master gene, FOXP3 — break it and the immune army burns the body down (IPEX syndrome in humans). Medicine now tunes this dial: more Tregs for autoimmunity and transplants, fewer to unleash attacks on cancer.');

  let w = 800, h = 400;
  const spawnTissue = () => ({ x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0, ph: Math.random() * TAU, hp: 1 });
  const spawnBug = () => {
    const side = Math.floor(Math.random() * 4);
    const p = { x: side === 0 ? -10 : side === 1 ? w + 10 : Math.random() * w, y: side === 2 ? -10 : side === 3 ? h + 10 : Math.random() * h, vx: 0, vy: 0, ph: Math.random() * TAU };
    return p;
  };
  const spawnKiller = () => ({ x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0, rogue: 0, ph: Math.random() * TAU });
  const spawnTreg = () => ({ x: Math.random() * w, y: Math.random() * h, ph: Math.random() * TAU });

  // seed
  for (let i = 0; i < 26; i++) tissue.push(spawnTissue());
  for (let i = 0; i < 4; i++) killers.push(spawnKiller());
  for (let i = 0; i < 3; i++) tregs.push(spawnTreg());

  loop((dt, t) => {
    w = CW(); h = H();
    ctx.fillStyle = '#05070d'; ctx.fillRect(0, 0, w, h);

    // spawn pathogens
    if (Math.random() < dt * (0.8 + pressure * 3.2)) bugs.push(spawnBug());
    bugs = bugs.slice(-110);

    const steer = (e, tx, ty, spd, k = 3) => {
      const dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy) || 1;
      e.vx = lerp(e.vx, dx / d * spd, dt * k); e.vy = lerp(e.vy, dy / d * spd, dt * k);
    };
    const wander = (e, spd) => {
      e.vx = lerp(e.vx, Math.cos(t * 0.6 + e.ph) * spd, dt * 1.2);
      e.vy = lerp(e.vy, Math.sin(t * 0.8 + e.ph) * spd, dt * 1.2);
    };
    const move = (e, bounce = true) => {
      e.x += e.vx * dt; e.y += e.vy * dt;
      if (bounce) {
        if (e.x < 8) { e.x = 8; e.vx = Math.abs(e.vx); }
        if (e.x > w - 8) { e.x = w - 8; e.vx = -Math.abs(e.vx); }
        if (e.y < 8) { e.y = 8; e.vy = Math.abs(e.vy); }
        if (e.y > h - 8) { e.y = h - 8; e.vy = -Math.abs(e.vy); }
      }
    };

    /* tissue cells drift; bugs eat them */
    for (let i = tissue.length - 1; i >= 0; i--) {
      const c = tissue[i];
      wander(c, 8); move(c);
      if (c.hp < 1) c.hp = Math.min(1, c.hp + dt * 0.05);
      // draw
      const rr = 9 + Math.sin(t * 2 + c.ph) * 1.2;
      ctx.fillStyle = `rgba(52,211,153,${0.16 + c.hp * 0.2})`;
      ctx.beginPath(); ctx.arc(c.x, c.y, rr, 0, TAU); ctx.fill();
      ctx.strokeStyle = `rgba(52,211,153,${0.5 * c.hp + 0.2})`; ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.fillStyle = `rgba(52,211,153,${0.5 * c.hp})`;
      ctx.beginPath(); ctx.arc(c.x, c.y, 3, 0, TAU); ctx.fill();
    }

    /* pathogens seek tissue */
    for (let i = bugs.length - 1; i >= 0; i--) {
      const b = bugs[i];
      let tgt = null, bd = 1e9;
      for (const c of tissue) { const d = (c.x - b.x) ** 2 + (c.y - b.y) ** 2; if (d < bd) { bd = d; tgt = c; } }
      if (tgt) steer(b, tgt.x, tgt.y, 34 + pressure * 20);
      move(b, false);
      if (b.x < -30 || b.x > w + 30 || b.y < -30 || b.y > h + 30) { bugs.splice(i, 1); continue; }
      // bite
      if (tgt && bd < 150) {
        tgt.hp -= dt * 0.8;
        if (tgt.hp <= 0) {
          tissue.splice(tissue.indexOf(tgt), 1);
          selfHits; // (invader kill, not autoimmune — hit health via tissue count)
          flashes.push({ x: tgt.x, y: tgt.y, r: 4, col: 'rgba(52,211,153,', t0: t });
          bugs.splice(i, 1); continue;
        }
      }
      // draw spiky
      ctx.fillStyle = '#fb7185';
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(t * 2 + b.ph);
      ctx.beginPath();
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * TAU;
        ctx.lineTo(Math.cos(a) * (k % 2 ? 4 : 8), Math.sin(a) * (k % 2 ? 4 : 8));
      }
      ctx.closePath(); ctx.fill(); ctx.restore();
    }

    /* killer T cells: hunt bugs; occasionally go rogue and hunt tissue */
    for (const k of killers) {
      if (k.rogue <= 0 && Math.random() < dt * 0.05) k.rogue = 1; // rogue event (rare)
      if (k.rogue > 0) {
        k.rogue += dt;
        let tgt = null, bd = 1e9;
        for (const c of tissue) { const d = (c.x - k.x) ** 2 + (c.y - k.y) ** 2; if (d < bd) { bd = d; tgt = c; } }
        if (tgt) steer(k, tgt.x, tgt.y, 46);
        if (tgt && bd < 150) {
          tgt.hp -= dt * 1.6;
          if (tgt.hp <= 0) {
            tissue.splice(tissue.indexOf(tgt), 1);
            selfHits++; stSelf.set(String(selfHits));
            flashes.push({ x: tgt.x, y: tgt.y, r: 4, col: 'rgba(251,146,60,', t0: t });
          }
        }
        // Tregs convert rogue back when close
        if (tregsOn) {
          for (const tr of tregs) {
            if ((tr.x - k.x) ** 2 + (tr.y - k.y) ** 2 < 70 * 70) {
              k.rogue = 0;
              flashes.push({ x: k.x, y: k.y, r: 6, col: 'rgba(125,211,252,', t0: t });
              break;
            }
          }
        }
      } else {
        let tgt = null, bd = 1e9;
        for (const b of bugs) { const d = (b.x - k.x) ** 2 + (b.y - k.y) ** 2; if (d < bd) { bd = d; tgt = b; } }
        if (tgt) steer(k, tgt.x, tgt.y, 52); else wander(k, 22);
        if (tgt && bd < 140) {
          bugs.splice(bugs.indexOf(tgt), 1);
          killedByImmune++; stKill.set(String(killedByImmune));
          flashes.push({ x: tgt.x, y: tgt.y, r: 5, col: 'rgba(192,132,252,', t0: t });
        }
      }
      move(k);
      // draw hunter
      const rogue = k.rogue > 0;
      ctx.fillStyle = rogue ? '#fb923c' : '#c084fc';
      ctx.beginPath(); ctx.arc(k.x, k.y, 7, 0, TAU); ctx.fill();
      ctx.strokeStyle = rogue ? 'rgba(251,146,60,.5)' : 'rgba(192,132,252,.4)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(k.x, k.y, 10 + Math.sin(t * 4) * 2, 0, TAU); ctx.stroke();
      if (rogue) {
        ctx.fillStyle = '#fff'; ctx.font = '800 10px -apple-system,sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('!', k.x, k.y + 3); ctx.textAlign = 'left';
      }
    }

    /* tregs wander */
    if (tregsOn) {
      for (const tr of tregs) {
        wander(tr, 26); move(tr);
        ctx.fillStyle = '#7dd3fc';
        ctx.beginPath(); ctx.arc(tr.x, tr.y, 6, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(125,211,252,.25)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(tr.x, tr.y, 70, 0, TAU); ctx.stroke(); // calming radius
        ctx.fillStyle = 'rgba(125,211,252,.9)'; ctx.font = '800 9px -apple-system,sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('Treg', tr.x, tr.y + 3); ctx.textAlign = 'left';
      }
    }

    /* flashes */
    for (let i = flashes.length - 1; i >= 0; i--) {
      const f = flashes[i];
      const age = t - f.t0;
      if (age > 0.8) { flashes.splice(i, 1); continue; }
      ctx.strokeStyle = f.col + (0.8 - age) + ')'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r + age * 40, 0, TAU); ctx.stroke();
    }

    /* health = living tissue fraction; slowly regrow */
    if (tissue.length < 30 && Math.random() < dt * 0.35 * health) tissue.push(spawnTissue());
    health = clamp(tissue.length / 26, 0, 1);
    healthM.set(health);

    if (health < 0.45) {
      ctx.fillStyle = 'rgba(251,113,133,.85)'; ctx.font = '700 13px -apple-system,sans-serif';
      ctx.fillText(tregsOn ? '⚠ under siege' : '⚠ AUTOIMMUNE CRISIS — the army is attacking its own body', 14, 24);
    }
  });
}
