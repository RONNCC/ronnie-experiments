import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  chapters,
  lessons,
  decisions,
  glossary,
  route,
  sources,
  casePackages,
} from "../content/book.mjs";
import { renderText } from "../build-text.mjs";
import {
  implied,
  coverage,
  fundingGap,
  money,
  pct,
  readStudy,
  emptyStudy,
  reviewIds,
  glossaryText,
} from "../logic.mjs";
const ids = lessons.map((l) => l.id);

test("six ordered chapters with complete, independently addressable lessons", () => {
  assert.deepEqual(
    chapters.map((c) => c.id),
    ["A", "B", "C", "D", "E", "F"],
  );
  assert.equal(lessons.length, 31);
  assert.equal(new Set(ids).size, ids.length);
  for (const l of lessons) {
    for (const k of ["definition", "why", "example", "desk", "trap", "deeper"])
      assert.ok(l[k].length > 25, `${l.id}/${k}`);
    assert.equal(l.apply.length, 5);
    assert.equal(new Set(l.apply.slice(1, 4)).size, 3);
    assert.equal(l.pitch.length, 2);
    assert.ok(l.terms.length);
    for (const ref of l.refs) assert.ok(Object.hasOwn(sources, ref));
  }
});
test("all twelve decisions contain the alternatives, fit, three sentences, challenge and critique", () => {
  assert.equal(decisions.length, 12);
  assert.equal(new Set(decisions.map((d) => d.id)).size, 12);
  for (const d of decisions) {
    assert.ok(d.question);
    assert.equal(d.options.length, 3);
    for (const pair of d.options)
      assert.ok(pair.length === 2 && pair[1].length > 25);
    assert.ok(d.fit);
    assert.equal(d.say.length, 3);
    assert.ok(d.challenge && d.answer);
    assert.equal(d.checks.length, 3);
    assert.ok(d.miss);
    assert.ok(ids.includes(d.lesson));
  }
});
test("the hour totals sixty minutes and every route stop resolves", () => {
  assert.equal(
    route.reduce((s, r) => s + r.minutes, 0),
    60,
  );
  const links = new Set([
    ...ids.map((id) => "lesson/" + id),
    ...decisions.map((d) => "decision/" + d.id),
    "review",
    "case",
    "decisions",
  ]);
  for (const r of route)
    for (const [path] of r.links) assert.ok(links.has(path), path);
});
test("glossary is copyable, ordered, and its terms point to valid lessons", () => {
  assert.equal(
    glossary.length,
    new Set(glossary.map((g) => g.term.toLowerCase())).size,
  );
  assert.ok(glossary.length >= 90);
  for (const g of glossary) assert.ok(ids.includes(g.lesson));
  assert.equal(glossaryText(glossary).split("\n").length, glossary.length);
  assert.match(glossaryText(glossary), /FAR — Floor area ratio/);
});
test("River North packages are not spliced; same-source arithmetic and differences", () => {
  const [a, b] = casePackages;
  assert.deepEqual(
    [a.units, a.cost, a.noi, b.units, b.cost, b.noi],
    [180, 47300000, 2600000, 200, 50000000, 2500000],
  );
  assert.equal(b.units - a.units, 20);
  assert.equal(b.cost - a.cost, 2700000);
  assert.equal(b.noi - a.noi, -100000);
  assert.equal(money(implied(a).perUnit), "$262,778");
  assert.equal(money(implied(b).perUnit), "$250,000");
  assert.equal(pct(implied(a).yieldPct), "5.50%");
  assert.equal(pct(implied(b).yieldPct), "5.00%");
  assert.equal(implied({ units: 0, cost: 0, noi: 3 }).yieldPct, null);
  assert.equal(implied({ units: null, cost: 10, noi: null }).perUnit, null);
});
test("coverage never invents debt service; funding gap distinguishes unknown, zero and surplus", () => {
  assert.equal(coverage(2500000, 2000000), 1.25);
  assert.equal(coverage(0, 1), 0);
  for (const n of [null, NaN, 0, -1, Infinity])
    assert.equal(coverage(25, n), null);
  assert.equal(fundingGap(50, [30, 19]), 1);
  assert.equal(fundingGap(50, [30, 20]), 0);
  assert.equal(fundingGap(50, [30, 21]), -1);
  assert.equal(fundingGap(50, [0, 0]), 50);
  for (const s of [[], [null, 0], [0, NaN], [-1, 0]])
    assert.equal(fundingGap(50, s), null);
});
test("review returns three distinct terms prioritizing missed, then studied, then baseline", () => {
  assert.deepEqual(reviewIds(emptyStudy(), ids), ["hud", "local", "noi"]);
  const s = {
    ...emptyStudy(),
    review: ["nonsense", "coverage", "coverage"],
    studied: ["hud", "tract", "yield"],
  };
  assert.deepEqual(reviewIds(s, ids), ["coverage", "yield", "tract"]);
});
test("storage failures or corrupted local state cannot prevent reading", () => {
  for (const raw of ["{", "null", "2"])
    assert.deepEqual(readStudy({ getItem: () => raw }, "x"), emptyStudy());
  assert.deepEqual(
    readStudy(
      {
        getItem() {
          throw Error("blocked");
        },
      },
      "x",
    ),
    emptyStudy(),
  );
  const s = readStudy(
    {
      getItem: () =>
        JSON.stringify({
          studied: ["hud", "hud", 2],
          drafts: { ok: "own words", bad: 3 },
          rubrics: { ok: [0, 0, 8], bad: {} },
          answers: { hud: 2, other: 9 },
          last: 4,
        }),
    },
    "x",
  );
  assert.deepEqual(s.studied, ["hud"]);
  assert.deepEqual(s.drafts, { ok: "own words" });
  assert.deepEqual(s.rubrics, { ok: [0] });
  assert.deepEqual(s.answers, { hud: 2 });
  assert.equal(s.last, "");
});
test("downloadable full edition is current and includes the case caveats, decision desk and source ledger", () => {
  const text = fs.readFileSync(
    new URL("../TEXTBOOK.md", import.meta.url),
    "utf8",
  );
  assert.equal(text, renderText());
  assert.match(text, /not a legal zoning determination/);
  assert.match(text, /Public Law 119-21/);
  assert.match(text, /Neither|neither/);
  assert.match(text, /not a funding|not zero/);
  assert.match(text, /No underlying agreement/);
  for (const l of lessons) assert.ok(text.includes(l.deeper));
  for (const d of decisions) assert.ok(text.includes(d.say.join(" ")));
});
test("gallery registration and self-contained assets", () => {
  const entries = JSON.parse(
    fs.readFileSync(new URL("../../../experiments.json", import.meta.url)),
  );
  const matches = entries.filter((e) => e.id === "multifamily-fieldbook");
  assert.equal(matches.length, 1);
  assert.equal(matches[0].path, "experiments/multifamily-fieldbook/");
  const html = fs.readFileSync(
    new URL("../index.html", import.meta.url),
    "utf8",
  );
  for (const m of html.matchAll(/(?:href|src)="([^"#]+)"/g))
    assert.ok(fs.existsSync(new URL("../" + m[1], import.meta.url)), m[1]);
  assert.ok(
    fs.existsSync(new URL("../assets/LICENSE-geist.txt", import.meta.url)),
  );
});
