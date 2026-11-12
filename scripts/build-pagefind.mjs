#!/usr/bin/env node
/**
 * Builds the static Pagefind full-text search bundle (`./pagefind/`) across all
 * registered experiments in `experiments.json` — indexing visible HTML structure
 * (preserving heading `#id` anchors for deep section links), non-duplicate
 * Markdown prose, and human-readable content strings inside data `.js` modules.
 *
 * Usage:
 *   node scripts/build-pagefind.mjs
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const MANIFEST_PATH = path.join(REPO_ROOT, "experiments.json");
const OUTPUT_DIR = path.join(REPO_ROOT, "pagefind");

const SKIP_DIRS = new Set([
  "vendor",
  "node_modules",
  "tests",
  "__tests__",
  "scripts",
  "assets",
  ".git"
]);

const SKIP_MD_FILES = new Set(["NOTICE.md", "REVIEW.md", "LICENSE.md"]);

async function loadPagefind() {
  try {
    return await import("pagefind");
  } catch (_) {
    const cacheDir = path.join(os.tmpdir(), "ronnie-experiments-pagefind-1.6.0");
    const entry = path.join(cacheDir, "node_modules", "pagefind", "lib", "index.js");
    if (!fs.existsSync(entry)) {
      fs.mkdirSync(cacheDir, { recursive: true });
      execFileSync(
        "npm",
        ["install", "--prefix", cacheDir, "--no-audit", "--no-fund", "pagefind@1.6.0"],
        { stdio: "inherit" }
      );
    }
    return await import(pathToFileURL(entry).href);
  }
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeForDedupe(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/<[^>]+>/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Character-by-character JS lexer that extracts string & non-interpolated template
 * literal chunks while ignoring comments and code tokens between quotes.
 */
function extractJsStringLiterals(code) {
  const literals = [];
  const len = code.length;
  let i = 0;

  while (i < len) {
    const ch = code[i];
    const next = code[i + 1];

    // Line comment
    if (ch === "/" && next === "/") {
      i += 2;
      while (i < len && code[i] !== "\n") i++;
      continue;
    }

    // Block comment
    if (ch === "/" && next === "*") {
      i += 2;
      while (i < len && !(code[i] === "*" && code[i + 1] === "/")) i++;
      i += 2;
      continue;
    }

    // Single or double quoted string
    if (ch === '"' || ch === "'") {
      const quote = ch;
      i++;
      let buf = "";
      let valid = true;
      while (i < len && code[i] !== quote) {
        if (code[i] === "\n" || code[i] === "\r") {
          valid = false;
          break;
        }
        if (code[i] === "\\") {
          const esc = code[i + 1];
          if (esc === "n" || esc === "r" || esc === "t") buf += " ";
          else if (esc) buf += esc;
          i += 2;
          continue;
        }
        buf += code[i];
        i++;
      }
      i++; // closing quote
      if (valid && buf.length >= 14) literals.push(buf);
      continue;
    }

    // Template literal (collect static text segments; split around `${...}`)
    if (ch === "`") {
      i++;
      let seg = "";
      while (i < len && code[i] !== "`") {
        if (code[i] === "\\") {
          const esc = code[i + 1];
          if (esc === "n" || esc === "r" || esc === "t") seg += " ";
          else if (esc) seg += esc;
          i += 2;
          continue;
        }
        if (code[i] === "$" && code[i + 1] === "{") {
          if (seg.trim().length >= 14) literals.push(seg);
          seg = " ";
          i += 2;
          let depth = 1;
          while (i < len && depth > 0) {
            if (code[i] === "{") depth++;
            else if (code[i] === "}") depth--;
            else if (code[i] === '"' || code[i] === "'" || code[i] === "`") {
              const q = code[i++];
              while (i < len && code[i] !== q) {
                if (code[i] === "\\") i += 2;
                else i++;
              }
            }
            i++;
          }
          continue;
        }
        seg += code[i];
        i++;
      }
      i++; // closing backtick
      if (seg.trim().length >= 14) literals.push(seg);
      continue;
    }

    i++;
  }

  return literals;
}

const CODE_NOISE_PATTERNS = [
  "function(",
  "=>",
  "document.",
  "window.",
  "querySelector",
  "getElementById",
  "addEventListener",
  "classList.",
  "setAttribute(",
  "createElementNS",
  "stroke-width",
  "viewBox=",
  "rgba(",
  "hsla(",
  "var(--",
  "linear-gradient(",
  "http://",
  "https://",
  "gl_Position",
  "gl_FragColor",
  "diffuseColor",
  "transformedNormal",
  "geometryNormal",
  "#include <",
  "void main(",
  "Float32Array",
  "requestAnimationFrame",
  "localStorage."
];

function filterHumanProse(rawLiterals, existingNormText) {
  const seen = new Set();
  const kept = [];

  for (const raw of rawLiterals) {
    const cleaned = raw
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (cleaned.length < 16 || cleaned.length > 4000) continue;
    if (CODE_NOISE_PATTERNS.some(pat => cleaned.includes(pat))) continue;
    // Skip CSS selector / path-like strings
    if (/^[.#/[a-z0-9_-]+$/i.test(cleaned)) continue;
    if (/^[MLHVCSQTAZ0-9 ,.-]+$/i.test(cleaned)) continue;

    const words = cleaned.match(/[A-Za-z][A-Za-z0-9'-]{1,}/g) || [];
    if (words.length < 3) continue;

    let alphaSpace = 0;
    for (let i = 0; i < cleaned.length; i++) {
      const c = cleaned.charCodeAt(i);
      if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122) || c === 32) {
        alphaSpace++;
      }
    }
    if (alphaSpace / cleaned.length < 0.74) continue;

    const norm = normalizeForDedupe(cleaned);
    if (norm.length < 14 || seen.has(norm)) continue;
    if (existingNormText && existingNormText.includes(norm)) continue;

    seen.add(norm);
    kept.push(cleaned);
  }

  return kept;
}

function cleanHtmlBody(rawHtml) {
  const bodyMatch = rawHtml.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch ? bodyMatch[1] : rawHtml;

  // Strip executable/styling/vector blocks while keeping structural headings & prose
  body = body
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");

  return body;
}

function extractMarkdownParagraphs(mdText, existingNormText) {
  const blocks = mdText
    .replace(/```[\s\S]*?```/g, " ")
    .split(/\n{2,}/);

  const kept = [];
  const seen = new Set();

  for (const block of blocks) {
    const cleaned = block
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[*_`>|~]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (cleaned.length < 25) continue;
    const norm = normalizeForDedupe(cleaned);
    if (norm.length < 20 || seen.has(norm)) continue;
    if (existingNormText && existingNormText.includes(norm)) continue;
    seen.add(norm);
    kept.push(cleaned);
  }

  return kept;
}

function walkExperimentFiles(dir) {
  const jsFiles = [];
  const mdFiles = [];

  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) walk(full);
      } else if (entry.isFile()) {
        if (
          entry.name.endsWith(".js") &&
          !entry.name.endsWith(".min.js") &&
          !entry.name.includes(".test.") &&
          !entry.name.includes(".spec.")
        ) {
          jsFiles.push(full);
        } else if (entry.name.endsWith(".md") && !SKIP_MD_FILES.has(entry.name)) {
          mdFiles.push(full);
        }
      }
    }
  }

  if (fs.existsSync(dir)) walk(dir);
  return { jsFiles: jsFiles.sort(), mdFiles: mdFiles.sort() };
}

function buildSynthesizedHtmlForExperiment(item) {
  const relDir = item.path.replace(/^\/+|\/+$/g, "");
  const expDir = path.join(REPO_ROOT, relDir);
  const indexHtmlPath = path.join(expDir, "index.html");

  let rawHtml = "";
  if (fs.existsSync(indexHtmlPath)) {
    rawHtml = fs.readFileSync(indexHtmlPath, "utf8");
  }

  const cleanedBody = cleanHtmlBody(rawHtml);
  const existingNorm = normalizeForDedupe(
    `${item.title} ${item.description} ${(item.tags || []).join(" ")} ${cleanedBody}`
  );

  // Extract inline <script> prose + external .js module prose
  const inlineScripts = [];
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(rawHtml)) !== null) {
    inlineScripts.push(match[1]);
  }

  const { jsFiles, mdFiles } = walkExperimentFiles(expDir);
  const rawLiterals = [];
  for (const inlineCode of inlineScripts) {
    rawLiterals.push(...extractJsStringLiterals(inlineCode));
  }
  for (const jsFile of jsFiles) {
    const code = fs.readFileSync(jsFile, "utf8");
    rawLiterals.push(...extractJsStringLiterals(code));
  }
  const jsProse = filterHumanProse(rawLiterals, existingNorm);

  // Only index non-duplicate Markdown paragraphs (avoids double-indexing printable TEXTBOOK.md mirrors)
  const mdProse = [];
  for (const mdFile of mdFiles) {
    const mdText = fs.readFileSync(mdFile, "utf8");
    mdProse.push(...extractMarkdownParagraphs(mdText, existingNorm));
  }

  const tagsMarkup = (item.tags || [])
    .map(t => `<span data-pagefind-filter="tag">${escapeHtml(t)}</span>`)
    .join(" ");

  const supplementalParagraphs = [...jsProse, ...mdProse]
    .map(p => `<p>${escapeHtml(p)}</p>`)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(item.title)}</title>
</head>
<body>
  <main data-pagefind-body>
    <span data-pagefind-meta="id" hidden>${escapeHtml(item.id)}</span>
    <span data-pagefind-meta="category" hidden>${escapeHtml(item.category)}</span>
    <span data-pagefind-filter="category" hidden>${escapeHtml(item.category)}</span>
    <div hidden>${tagsMarkup}</div>
    <h1>${escapeHtml(item.title)}</h1>
    <p data-pagefind-weight="3">${escapeHtml(item.description)}</p>
    <div data-pagefind-weight="2">${(item.tags || []).map(escapeHtml).join(" · ")}</div>
    ${supplementalParagraphs ? `<section aria-label="Interactive content">${supplementalParagraphs}</section>` : ""}
    <article>
      ${cleanedBody}
    </article>
  </main>
</body>
</html>`;
}

async function main() {
  const experiments = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  const pagefind = await loadPagefind();

  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }

  const { index, errors: initErrors } = await pagefind.createIndex();
  if (initErrors && initErrors.length > 0) {
    throw new Error(`Failed to initialize Pagefind index: ${initErrors.join("; ")}`);
  }

  let indexedCount = 0;
  for (const item of experiments) {
    const relDir = item.path.replace(/^\/+|\/+$/g, "");
    const sourcePath = `${relDir}/index.html`;
    const content = buildSynthesizedHtmlForExperiment(item);
    const { errors } = await index.addHTMLFile({ url: `/${relDir}/`, content, sourcePath });
    if (errors && errors.length > 0) {
      throw new Error(`Pagefind error on ${item.id}: ${errors.join("; ")}`);
    }
    indexedCount++;
  }

  const { errors: writeErrors } = await index.writeFiles({ outputPath: OUTPUT_DIR });
  if (writeErrors && writeErrors.length > 0) {
    throw new Error(`Pagefind writeFiles failed: ${writeErrors.join("; ")}`);
  }

  await pagefind.close();
  console.log(`Built Pagefind index for ${indexedCount} experiments -> ${path.relative(REPO_ROOT, OUTPUT_DIR)}/`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
