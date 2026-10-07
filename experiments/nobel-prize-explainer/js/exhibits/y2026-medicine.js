/* 2026 Medicine — Optogenetics: fire neurons with a flashlight, wiggle the whiskers. */
import { exhibitShell, makeCanvas, toggle, button, loop, el, caption, statBox, controlsPanel, TAU, clamp, lerp } from '../kit.js';

/* a small brain circuit: x,y in fractions; type: chr = light-sensitive (Chr2+), motor = whisker output */
const NEURONS = [
  { id: 0, x: 0.16, y: 0.24, chr: true }, { id: 1, x: 0.16, y: 0.52, chr: true },
  { id: 2, x: 0.16, y: 0.78, chr: true }, { id: 3, x: 0.36, y: 0.20, chr: false },
  { id: 4, x: 0.38, y: 0.44, chr: true }, { id: 5, x: 0.36, y: 0.68, chr: false },
  { id: 6, x: 0.56, y: 0.30, chr: true }, { id: 7, x: 0.56, y: 0.56, chr: true },
  { id: 8, x: 0.72, y: 0.20, chr: false }, { id: 9, x: 0.74, y: 0.46, chr: true, motor: true },
  { id: 10, x: 0.72, y: 0.72, chr: false }, { id: 11, x: 0.88, y: 0.38, chr: false, motor: true },
];
const EDGES = [[0, 3], [0, 4], [1, 4], [1, 5], [2, 5], [3, 6], [4, 6], [4, 7], [5, 7], [6, 8], [6, 9], [7, 9], [7, 10], [8, 11], [9, 11], [10, 11]];

export default function render(root) {
  const body = exhibitShell(root, {
    title: 'The brain, operated by flashlight',
    hint: 'Drag the blue light onto glowing neurons — only those fire. Watch the signal cross the circuit and twitch the whiskers.',
  });

  const fired = new Map();      // id -> time of last spike
  const pulses = [];            // {edge:[a,b], t:0..1}
  const light = { x: 0.2, y: 0.3, on: false };
  let silencerMode = false;     // yellow light = inhibit (halorhodopsin)
  const silenced = new Map();   // id -> until time
  let whisks = 0, spikes = 0;

  const grid = el('div', { class: 'sim-grid side' });
  body.append(grid);
  const { wrap, ctx, W: CW, H } = makeCanvas(grid, 400);
  const panel = controlsPanel(grid);

  toggle(panel, { label: '🔦 Blue light = EXCITE (channelrhodopsin)', on: !silencerMode, onChange: v => { silencerMode = !v; } });
  const rd = el('div', { class: 'readout' }); panel.append(rd);
  const stSpikes = statBox(rd, { label: 'Neurons fired by light' });
  const stWhisk = statBox(rd, { label: 'Whisker twitches' });
  caption(panel, 'Yellow-tinted neurons express the algae protein <b>channelrhodopsin</b>: blue light opens their ion channel and they spike — with millisecond precision, cell by cell. That\'s Hegemann & Nagel\'s molecule in Deisseroth\'s hands. In 2007 the team illuminated motor-cortex neurons and a mouse twitched its whiskers on cue — proof you can write commands into the brain with light. (Toggle to yellow light for the complementary trick: silencing neurons.)');

  wrap.style.cursor = 'none';
  wrap.addEventListener('pointermove', (e) => {
    const r = wrap.getBoundingClientRect();
    light.x = (e.clientX - r.left) / r.width; light.y = (e.clientY - r.top) / r.height;
  });
  wrap.addEventListener('pointerenter', () => light.on = true);
  wrap.addEventListener('pointerleave', () => light.on = false);

  loop((dt, t) => {
    const w = CW(), h = H();
    ctx.fillStyle = '#05070d'; ctx.fillRect(0, 0, w, h);

    const pos = (n) => [n.x * w * 0.86 + w * 0.04, n.y * h * 0.86 + h * 0.06];

    /* light logic */
    if (light.on) {
      for (const n of NEURONS) {
        if (!n.chr) continue;
        const [x, y] = pos(n);
        const d = Math.hypot(x - light.x * w, y - light.y * h);
        if (d < 46) {
          if (!silencerMode) {
            const last = fired.get(n.id) || -1;
            if (t - last > 0.55) {
              fired.set(n.id, t); spikes++; stSpikes.set(String(spikes));
              for (const e of EDGES) if (e[0] === n.id) pulses.push({ a: e[0], b: e[1], t: 0 });
            }
          } else {
            silenced.set(n.id, t + 1.1); // inhibit for ~1s after leaving the light
          }
        }
      }
    }

    /* pulses travel along edges */
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i]; p.t += dt * 1.7;
      if (p.t >= 1) {
        pulses.splice(i, 1);
        const nB = NEURONS[p.b];
        const silT = silenced.get(nB.id) || -1;
        if (t < silT) continue; // inhibited: signal dies here
        const last = fired.get(nB.id) || -1;
        if (t - last > 0.3) {
          fired.set(nB.id, t);
          for (const e of EDGES) if (e[0] === nB.id) pulses.push({ a: e[0], b: e[1], t: 0 });
          if (nB.motor) { whisks++; stWhisk.set(String(whisks)); whiskKick = 1; }
        }
        continue;
      }
    }

    /* draw edges */
    ctx.lineWidth = 1.4;
    for (const [a, b] of EDGES) {
      const [x1, y1] = pos(NEURONS[a]); const [x2, y2] = pos(NEURONS[b]);
      ctx.strokeStyle = 'rgba(93,106,134,.5)';
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
    /* draw pulses */
    for (const p of pulses) {
      const [x1, y1] = pos(NEURONS[p.a]); const [x2, y2] = pos(NEURONS[p.b]);
      const x = lerp(x1, x2, p.t), y = lerp(y1, y2, p.t);
      ctx.fillStyle = '#fde68a';
      ctx.beginPath(); ctx.arc(x, y, 3.4, 0, TAU); ctx.fill();
      const g = ctx.createRadialGradient(x, y, 0, x, y, 12);
      g.addColorStop(0, 'rgba(253,230,138,.5)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 12, 0, TAU); ctx.fill();
    }

    /* draw neurons */
    for (const n of NEURONS) {
      const [x, y] = pos(n);
      const tf = fired.get(n.id);
      const recentSil = (silenced.get(n.id) || -1) > t;
      const recent = tf !== undefined && (t - tf) < 0.3;
      // soma
      ctx.fillStyle = recentSil ? '#33415e' : (n.chr ? (recent ? '#fef08a' : '#eab308') : (recent ? '#c7d2fe' : '#475069'));
      ctx.beginPath(); ctx.arc(x, y, recent ? 11 : 8.5, 0, TAU); ctx.fill();
      ctx.strokeStyle = n.chr ? 'rgba(250,204,21,.4)' : 'rgba(148,163,184,.25)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y, 12.5, 0, TAU); ctx.stroke();
      if (recent) {
        ctx.strokeStyle = 'rgba(253,230,138,.8)';
        ctx.beginPath(); ctx.arc(x, y, 12 + (t - tf) * 60, 0, TAU); ctx.stroke();
      }
      if (recentSil) {
        ctx.strokeStyle = 'rgba(251,191,36,.6)'; ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.arc(x, y, 14, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      }
      if (n.motor) {
        ctx.fillStyle = 'rgba(238,242,255,.8)'; ctx.font = '700 9px -apple-system,sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('MOTOR', x, y - 17); ctx.textAlign = 'left';
      }
    }

    /* the flashlight beam */
    if (light.on) {
      const lx = light.x * w, ly = light.y * h;
      const col = silencerMode ? '253,224,71' : '125,211,252';
      const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, 52);
      g.addColorStop(0, `rgba(${col},.4)`); g.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(lx, ly, 52, 0, TAU); ctx.fill();
      ctx.strokeStyle = `rgba(${col},.9)`; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(lx, ly, 46, 0, TAU); ctx.stroke();
      ctx.fillStyle = `rgba(${col},1)`;
      ctx.font = '600 10px -apple-system,sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(silencerMode ? 'yellow: silence' : 'blue: fire', lx, ly + 62); ctx.textAlign = 'left';
    }

    /* ---- whisker readout (right area) ---- */
    whiskKick = Math.max(0, whiskKick - dt * 3);
    const mx = w * 0.9, my = h * 0.62;
    // snout
    ctx.fillStyle = '#2a3350';
    ctx.beginPath(); ctx.ellipse(mx, my, 16, 13, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#f472b6';
    ctx.beginPath(); ctx.arc(mx + 14, my, 3.4, 0, TAU); ctx.fill();
    // whiskers
    ctx.strokeStyle = 'rgba(238,242,255,.85)'; ctx.lineWidth = 1.4;
    for (let i = -2; i <= 2; i++) {
      const baseA = -0.5 + i * 0.22;
      const kick = whiskKick * Math.sin(t * 26 + i) * 0.3;
      ctx.beginPath(); ctx.moveTo(mx + 8, my - 2 + i * 1.5);
      ctx.quadraticCurveTo(mx + 26, my + baseA * 30, mx + 44, my + (baseA + kick * 0.4) * 46);
      ctx.stroke();
    }
    ctx.fillStyle = whiskKick > 0.2 ? '#fde68a' : 'rgba(151,163,189,.7)';
    ctx.font = '600 10px -apple-system,sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(whiskKick > 0.2 ? 'twitch!' : 'mouse whiskers', mx + 14, my + 34);
    ctx.textAlign = 'left';

    // labels
    ctx.fillStyle = 'rgba(151,163,189,.8)'; ctx.font = '11px -apple-system,sans-serif';
    ctx.fillText('yellow neurons = carry the algae light-switch  ·  grey = ordinary', 14, h - 12);
  });

  let whiskKick = 0;
}
