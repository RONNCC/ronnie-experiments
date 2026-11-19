const shapeViews = {
  standard: ['Front view of a standard tunnel surrounding the table', 'Standard bore: the housing surrounds the table on all sides in this front view.'],
  wide: ['Front view of a wider tunnel surrounding the same table', 'Wide bore: there is more room around the table, but the housing still surrounds it.'],
  open: ['Front view of two plates above and below the table with open sides', 'Open-sided: the sides are accessible, but the plates still limit vertical clearance.'],
};

const shape = document.querySelector('#shape');
const geometry = document.querySelector('#geometry');
const magnet = geometry.querySelector('.magnet');
const plates = geometry.querySelector('.plates');
function updateShape() {
  const [description, explanation] = shapeViews[shape.value];
  magnet.setAttribute('r', shape.value === 'wide' ? '69' : '59');
  magnet.toggleAttribute('hidden', shape.value === 'open');
  plates.toggleAttribute('hidden', shape.value !== 'open');
  geometry.setAttribute('aria-label', description);
  document.querySelector('#shape-note').textContent = explanation;
}
shape.addEventListener('change', updateShape);
updateShape();

// Keep the irregular offsets identical; only the added central rise changes.
const baseline = [92, 77, 97, 80, 94, 81, 99, 79, 95, 78, 96, 78, 91];
const pattern = [0, 0, 0, 0, 6, 16, 23, 16, 6, 0, 0, 0, 0];
const signal = document.querySelector('#signal');
function updateSignal() {
  const strong = signal.value === 'strong';
  const points = baseline.map((y, i) => `${10 + i * 25},${y - pattern[i] * (strong ? 3 : 1)}`);
  document.querySelector('#trace').setAttribute('points', points.join(' '));
  document.querySelector('#signal-plot').setAttribute('aria-label', strong
    ? 'A pronounced central rise, with the same random variation'
    : 'A small central rise partly masked by random variation');
  document.querySelector('#signal-note').textContent = strong
    ? 'Stronger signal: the same bumps are present, but the central rise is clearer.'
    : 'Weaker signal: the central rise is hard to separate from nearby bumps.';
}
signal.addEventListener('change', updateSignal);
updateSignal();

for (const controls of document.querySelectorAll('[data-controls]')) controls.hidden = false;
