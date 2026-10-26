import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { caseRegistry, calculateCase, csvForOutput, parseCsv } from '../cases/capstones.js';
const root = path.dirname(fileURLToPath(import.meta.url));
for (const testCase of caseRegistry) {
  const inputPath = path.join(root, '..', testCase.inputs);
  const outputPath = path.join(root, '..', testCase.outputs);
  const inputRows = parseCsv(fs.readFileSync(inputPath, 'utf8'));
  const output = csvForOutput(calculateCase(testCase, inputRows));
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output);
  console.log(`wrote ${path.relative(root, outputPath)}`);
}
