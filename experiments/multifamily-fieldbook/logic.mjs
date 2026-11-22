// All amounts are dollars. No zero-filling missing evidence or crossing document packages.
const positive = (n) => Number.isFinite(n) && n > 0;
export function implied(pkg) {
  return {
    perUnit:
      Number.isFinite(pkg.cost) && positive(pkg.units)
        ? pkg.cost / pkg.units
        : null,
    yieldPct:
      Number.isFinite(pkg.noi) && positive(pkg.cost)
        ? (100 * pkg.noi) / pkg.cost
        : null,
  };
}
export function coverage(income, annualPayment) {
  return Number.isFinite(income) && positive(annualPayment)
    ? income / annualPayment
    : null;
}
export function fundingGap(uses, sources) {
  return Number.isFinite(uses) &&
    uses >= 0 &&
    sources.length &&
    sources.every((n) => Number.isFinite(n) && n >= 0)
    ? uses - sources.reduce((a, b) => a + b, 0)
    : null;
}
export const emptyStudy = () => ({
  studied: [],
  review: [],
  answers: {},
  drafts: {},
  rubrics: {},
  last: "",
});
export function readStudy(store, key) {
  const fresh = emptyStudy();
  try {
    const s = JSON.parse(store.getItem(key));
    if (!s || typeof s !== "object") return fresh;
    for (const k of ["studied", "review"])
      if (Array.isArray(s[k]))
        fresh[k] = [...new Set(s[k].filter((v) => typeof v === "string"))];
    const entries = (k) =>
      s[k] && typeof s[k] === "object" && !Array.isArray(s[k])
        ? Object.entries(s[k])
        : [];
    fresh.answers = Object.fromEntries(
      entries("answers").filter(([, v]) => [0, 1, 2].includes(v)),
    );
    fresh.drafts = Object.fromEntries(
      entries("drafts")
        .filter(([, v]) => typeof v === "string")
        .map(([id, v]) => [id, v.slice(0, 2400)]),
    );
    fresh.rubrics = Object.fromEntries(
      entries("rubrics")
        .filter(([, v]) => Array.isArray(v))
        .map(([id, v]) => [
          id,
          [...new Set(v.filter((n) => [0, 1, 2].includes(n)))],
        ]),
    );
    if (typeof s.last === "string") fresh.last = s.last;
  } catch {
    /* Private browsing, disabled storage or an old/corrupt entry. */
  }
  return fresh;
}
export function reviewIds(study, allIds) {
  const candidates = [
    ...study.review,
    ...[...study.studied].reverse(),
    "hud",
    "local",
    "noi",
    ...allIds,
  ];
  return [...new Set(candidates.filter((id) => allIds.includes(id)))].slice(
    0,
    3,
  );
}
export function glossaryText(entries) {
  return entries.map((g) => `${g.term} — ${g.meaning}`).join("\n");
}
export const money = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
export const pct = (n) => `${n.toFixed(2)}%`;
