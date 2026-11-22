// Generate the self-contained reading edition from the same lessons as the web app.
import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import {
  chapters,
  decisions,
  route,
  sources,
  interviewCard,
  projectBoundary,
  glossary,
  casePackages,
} from "./content/book.mjs";
import { implied, money, pct } from "./logic.mjs";

export function renderText() {
  const lines = [
    "# The multifamily fieldbook",
    "Parcel Press · Washington field series · Volume 01",
    "A textbook for the product owner of coretsu-houses. Work from the public map to a defensible investment memo, one concept at a time.",
    `**Evidence boundary.** ${projectBoundary}`,
    "## How to use the hour",
    "Start by explaining three older terms from memory. On your first visit try Fair Market Rent, parcel and net operating income. On later visits use terms you missed. For each lesson: recall, apply, then give a 30-second investor answer. Grade the application against the key. Judge your spoken answer by whether it answers the question, names the evidence and avoids the meeting mistake.",
  ];
  lines.push(
    "### If the interview starts now",
    interviewCard.opening,
    ...interviewCard.checks.map(([q, a]) => `**${q}** ${a}`),
  );
  let start = 0;
  for (const r of route) {
    lines.push(
      `**Minutes ${start}–${start + r.minutes}: ${r.title}.** ${r.note} Read: ${r.links.map(([, name]) => name).join("; ")}.`,
    );
    start += r.minutes;
  }
  lines.push(
    "## Contents",
    ...chapters.map(
      (c) =>
        `**${c.id}. ${c.title}** — ${c.lessons.map((l) => l.concept).join(" · ")}`,
    ),
    "**Workbook:** Twelve product decisions · River North case lab · Copyable glossary · Primary verification desk",
  );
  for (const c of chapters) {
    lines.push(`## Chapter ${c.id} · ${c.title}`, c.intro);
    for (const [i, l] of c.lessons.entries()) {
      lines.push(
        `### ${c.id}${i + 1}. ${l.title}`,
        l.definition,
        `**Why it matters.** ${l.why}`,
        `**Illustrative worked example.** ${l.example}`,
        `**At the product desk.** ${l.desk}`,
        `**Meeting mistake.** ${l.trap}`,
        `**Drill down.** ${l.deeper}`,
      );
      if (l.refs.length)
        lines.push(
          `**Primary checks:** ${l.refs.map((id) => sources[id][0]).join("; ")}. See the verification desk.`,
        );
      lines.push(
        `**Quiz — answer before reading the key**\n\n1. Recall: Explain ${l.concept.toLowerCase()} in one sentence.\n2. Apply: ${l.apply[0]}\n3. Investor, 30 seconds: ${l.pitch[0]}`,
        `**Answer key.** Recall: ${l.definition} Apply: ${l.apply[1]} ${l.apply[4]} Investor example: “${l.pitch[1]}”`,
        `**Add to your glossary:**\n\n${l.terms.map(([t, m]) => `- ${t}: ${m}`).join("\n")}`,
      );
    }
  }
  lines.push(
    "## Decision desk",
    "For each decision, give the strongest case against your choice before defending it. Write your answer in your own words before uncovering the sample.",
  );
  for (const [i, d] of decisions.entries())
    lines.push(
      `### Decision ${i + 1}. ${d.title}`,
      d.question,
      `**Alternatives and strongest cases**\n\n${d.options.map(([n, r]) => `- **${n}:** ${r}`).join("\n")}`,
      `**Product fit.** ${d.fit}`,
      "**Your rehearsal:** I chose ____ over ____ because ____. It matters to the deal because ____. Before relying on it, I would verify ____.",
      `**Three-sentence answer.** “${d.say.join(" ")}”`,
      `**Tough follow-up:** ${d.challenge}\n\n${d.answer}`,
      `**Self-critique (one point per criterion you actually said):**\n\n${d.checks.map((s) => `- ${s}`).join("\n")}\n\n**Meeting mistake:** ${d.miss}`,
    );
  lines.push(
    "## Case lab · River North",
    "The brief supplies these packages. Source versions, dates, periods, approval status and whether income is stabilized were not supplied. The final two columns are calculations, not document claims. Do not splice sources.",
    `| Package | Units | Total cost | Net operating income | Cost / unit | Conditional yield on cost |\n|---|---:|---:|---:|---:|---:|\n${casePackages.map((p) => `| ${p.label} | ${p.units} | ${money(p.cost)} | ${money(p.noi)} | ${money(implied(p).perUnit)} | ${pct(implied(p).yieldPct)} |`).join("\n")}`,
    "From summary to model: +20 units, +$2.7 million cost and −$100,000 operating income. If annual stabilized income and total development cost align, the implied yield drops about 0.50 percentage points. No market value, loan terms or equity cash-flow schedule were supplied. A market cap rate, debt coverage and equity return cannot be established.",
    "**Teaching exercise only.** Assume the model’s $2.5 million is eligible annual income and invent a $2 million annual debt payment: coverage = 1.25×. Separately, assume $30 million debt and $19 million equity are the only sources against $50 million of uses: $1 million shortfall. Remove the assumed inputs and both results are unknown, not zero.",
    "**Resolution request:** obtain each dated unit schedule, the corresponding plan and approval record, an all-in cost estimate for that scope and an operating statement or projection with its period and reserve treatment. Record any working override as an attributed correction or estimate.",
    "## Copy-paste glossary",
    glossary.map((g) => `- **${g.term}:** ${g.meaning}`).join("\n"),
    "## Primary verification desk",
    "[VERIFY] For current law, lender requirements, boundaries and usage rights, consult the primary record for the actual place, date and transaction. These destinations are not assertions that a live policy or agreement has been verified.",
    ...Object.values(sources).map(
      ([name, note, url]) =>
        `- ${url ? `[${name}](${url})` : `**${name}**`}: ${note}`,
    ),
  );
  return lines.join("\n\n") + "\n";
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  writeFileSync(new URL("./TEXTBOOK.md", import.meta.url), renderText());
