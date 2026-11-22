// Small original plates in the visual language of an architectural field manual.
const drawings = {
  A: `<path d="m63 40 49-22 49 22z" fill="#acc2ae"/><path d="m72 38 40-16 40 16z" fill="#d8e4d4"/><path d="M65 40h95v6H65z" fill="#c7d8c5"/>${[72, 92, 112, 132, 149].map((x) => `<path d="M${x} 46h7v31h-7z" fill="#c1d3bf"/><path d="M${x + 2} 48v27m-4 2h11"/>`).join("")}<path d="M66 78h94v5H66zm-6 5h106v5H60z" fill="#cadbc8"/><path d="M52 89h122M112 15V9h17l-4 4 4 3h-17"/>`,
  B: `<g stroke-linejoin="round"><path d="m45 63 53-29 73 28-52 31z" fill="#bdc8ac"/><path d="m45 58 53-30 73 29-52 31z" fill="#e2e7d1"/><path d="m46 49 52-29 74 29-53 30z" fill="#bfcdaf"/><path d="m57 49 39-21 61 23-38 21z" stroke-dasharray="3 2"/><path d="m96 28 3 18-26 11m26-11 39 15"/><path d="m95 44 18-10 26 10-18 11z" fill="#8ba385"/><path d="M106 36V19l15-8 15 6v17l-15 9z" fill="#b3c4a7"/><path d="m106 19 15 6 15-8m-15 8v18"/></g>`,
  C: `<path d="M57 86h111M62 19v67" stroke-dasharray="2 3"/><path d="M68 40h19v46H68z" fill="#91b3a4"/><path d="M95 40h18v14H95z" fill="#ccdbcc"/><path d="M120 54h17v12h-17z" fill="#ccdbcc"/><path d="M145 66h17v20h-17z" fill="#779d89"/><path d="M87 40h8m18 14h7m17 12h8" stroke-dasharray="2 2"/><path d="M69 31h16m14 9V29h12m13 22v-8h8m13 16h15"/>`,
  D: `<path d="M54 82h116M62 85V20"/><path d="m66 72 23-17 17 8 24-28 26-9" stroke-width="3"/><path d="m68 79 26-7 24-6 34-18" stroke-dasharray="3 3"/>${[
    [89, 55],
    [106, 63],
    [130, 35],
    [156, 26],
  ]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#c5d6bf"/>`)
    .join("")}<path d="m146 26 13-2-4 12"/>`,
  E: `<path d="M59 86h108M81 85V26h9v59m-9-4 9-8-9-7 9-7-9-7 9-7-9-7 9-7"/><path d="M63 26h93v7H63z" fill="#bbcab3"/><path d="m63 26 23-14 65 14m-65-14v14m58 7v18l-5 5-5-3"/><path d="m108 65 22-11 26 10-22 12z" fill="#c8d7bc"/><path d="M108 65v14l26 10 22-12V64m-22 12v13" fill="#a7bf9f"/>`,
  F: `<path d="m72 27 72-7 6 64-72 7z" fill="#b4cbbd"/><path d="M79 18h63l9 10v52H79z" fill="#d8e4d8"/><path d="M142 18v11h9M88 36h41m-41 8h28m-28 10h30m-30 10h23"/><circle cx="140" cy="63" r="14" fill="#a2bda8"/><path d="m133 63 5 5 10-12" stroke-width="2.3"/>`,
};
export function plate(id, i) {
  return `<div class="plate tint-${id}" aria-hidden="true"><span class="plate-id">FIG. 0${i + 1}</span><svg viewBox="0 0 224 104" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${drawings[id]}</svg><span class="plate-cross">+</span></div>`;
}
const paths = {
  target: "M2 12h5m10 0h5M12 2v5m0 10v5m6-10a6 6 0 1 1-12 0 6 6 0 0 1 12 0",
  arrow: "M4 12h15m-6-6 6 6-6 6",
  back: "M20 12H5m6 6-6-6 6-6",
  diag: "M6 18 18 6M7 6h11v11",
  clock: "M12 6v6l4 2m6-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  book: "M3 5c4-1 6-1 9 1 3-2 5-2 9-1v14c-4-1-6-1-9 1-3-2-5-2-9-1zM12 6v14",
  check: "m4 12 5 5 11-11",
  search: "M20 20l-5-5m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
  file: "M5 3h10l4 4v14H5zM14 3v5h5M8 12h8m-8 4h6",
  copy: "M8 8h12v13H8zM16 8V3H3v13h5",
  layers: "m2 8 10-5 10 5-10 5zM2 12l10 5 10-5M2 16l10 5 10-5",
  pin: "M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0zm-5 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0",
};
export const icon = (name) =>
  `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]}"/></svg>`;
