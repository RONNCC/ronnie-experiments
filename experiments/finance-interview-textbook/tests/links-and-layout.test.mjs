import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { references, studyPaths } from '../references.js';
import { caseRegistry } from '../cases/capstones.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');

test('static page resources, anchors, downloads and role-capstone links resolve locally',()=>{
  const html=read('index.html');
  for(const resource of ['styles.css','app.js'])assert.ok(fs.existsSync(path.join(root,resource)),`${resource} exists`);
  const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
  for(const [,href] of html.matchAll(/\bhref="#([^\"]+)"/g))assert.ok(ids.has(href),`static anchor #${href}`);
  for(const pathSpec of studyPaths)assert.ok(caseRegistry.some(c=>c.id===pathSpec.capstone),`${pathSpec.name} capstone`);
  for(const c of caseRegistry){assert.ok(fs.existsSync(path.join(root,c.inputs)),`${c.id} inputs`);assert.ok(fs.existsSync(path.join(root,c.outputs)),`${c.id} outputs`);}
  const css=read('styles.css');assert.match(css,/@media\s*\(max-width:\s*390px\)/);assert.match(css,/@media\s*\(max-width:\s*620px\)/);assert.match(css,/\.case-result td::before/);assert.match(css,/overflow-wrap:anywhere/);
});

test('each source reference has an exact HTTPS URL; primary-source licensing and case notes are linked',()=>{
  for(const [key,item] of Object.entries(references)){const url=new URL(item.url);assert.equal(url.protocol,'https:',key);assert.ok(url.hostname.includes('.'),key);assert.ok(item.name&&item.supports,key);}
  assert.match(references.finraSeries7.url,/finra\.org\/registration-exams-ce\/qualification-exams\/series7/);
  assert.match(references.nasaaSeries66.url,/nasaa\.org\/exams\/general-exam-information\/series-66-exam-content-outline/);
  assert.ok(fs.existsSync(path.join(root,'cases/README.md')));
});
