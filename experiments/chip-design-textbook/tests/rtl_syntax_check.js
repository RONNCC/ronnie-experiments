/* Real syntax check of every RTL variant the playground can generate (tests/model.test.js
   only asserts strings; this parses the code with a Verilog frontend). Checker preference:
   iverilog > verilator > yowasp-yosys. Prints SKIP and exits 0 when none is installed.
   Run: node tests/rtl_syntax_check.js */
'use strict';
const {execFileSync} = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {rtlCode} = require('../model.js');

const variants = [
  {example: 'counter', params: {width: 2, resetValue: 0}},
  {example: 'counter', params: {width: 4, resetValue: 3}},
  {example: 'counter', params: {width: 8, resetValue: 255}},
  {example: 'counter', params: {width: 4, breakIt: true}},
  {example: 'traffic', params: {green: 1, yellow: 1, red: 1}},
  {example: 'traffic', params: {green: 4, yellow: 2, red: 3}},
  {example: 'traffic', params: {green: 2, breakIt: true}},
];
function which(cmd) {
  try { return execFileSync('which', [cmd], {stdio: 'pipe'}).toString().trim(); } catch { return null; }
}
function findChecker() {
  // cwd matters: WASM-based checkers (yowasp-yosys) can only see their own working directory.
  if (which('iverilog')) return {name: 'iverilog', run: (file, cwd) => execFileSync('iverilog', ['-g2012', '-t', 'null', '-o', os.devnull, file], {stdio: 'pipe', cwd})};
  if (which('verilator')) return {name: 'verilator', run: (file, cwd) => execFileSync('verilator', ['--lint-only', '-Wno-fatal', file], {stdio: 'pipe', cwd})};
  if (which('yowasp-yosys')) return {name: 'yowasp-yosys', run: (file, cwd) => execFileSync('yowasp-yosys', ['-p', `read_verilog -sv ${file}`], {stdio: 'pipe', cwd})};
  return null;
}
const checker = findChecker();
if (!checker) {
  console.log('SKIP: no Verilog frontend found (tried iverilog, verilator, yowasp-yosys). String tests still cover the generated RTL.');
  process.exit(0);
}
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rtl-syntax-'));
try {
  variants.forEach((variant, i) => {
    let code = rtlCode(variant);
    // Uniquify module names so one folder can hold every variant.
    code = code.replace(/module counter_en/, `module counter_en_v${i}`).replace(/module traffic_light/, `module traffic_light_v${i}`);
    const file = path.join(dir, `variant_${i}.sv`);
    fs.writeFileSync(file, code);
    checker.run(`variant_${i}.sv`, dir);
    console.log(`OK: ${variant.example} variant ${i} (${JSON.stringify(variant.params)}) parses with ${checker.name}.`);
  });
  console.log(`PASS: all ${variants.length} generated RTL variants are syntactically valid (${checker.name}).`);
} catch (error) {
  console.error(`FAIL: ${checker.name} rejected a generated variant:\n${error.stdout || ''}${error.stderr || ''}${error.message}`);
  process.exit(1);
} finally {
  fs.rmSync(dir, {recursive: true, force: true});
}
