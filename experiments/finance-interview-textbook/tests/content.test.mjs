import test from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { references } from '../references.js';
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const tracks=['investment-banking','private-credit','private-equity','hedge-funds','sales-trading','equity-research','wealth-management'];
async function load(folder,slug){return (await import(pathToFileURL(path.join(root,folder,`${slug}.js`)))).default;}

test('the original edition still contains the same seven tracks and all 70 distinct topics',async()=>{
  const all=[];for(const slug of tracks)all.push(...await load('tracks',slug));
  assert.equal(all.length,70);assert.equal(new Set(all.map(t=>t.id)).size,70);
  for(const slug of tracks){const entries=all.filter(t=>t.id.startsWith(`${slug}-`));assert.equal(entries.length,10,`${slug} topic count`);for(const topic of entries){const words=text=>String(text).trim().split(/\s+/).length;assert.ok(words(topic.explanation)>=200&&words(topic.explanation)<=300,`${topic.id} 200–300-word base explanation`);assert.ok(topic.questions.length>=3,`${topic.id} base interview questions`);assert.ok(topic.questions.every(q=>words(q.a)>=80&&words(q.a)<=150),`${topic.id} 80–150-word base answers`);assert.ok(Array.isArray(topic.example?.steps)&&topic.example.steps.length>=4,`${topic.id} four-step arithmetic example`);assert.ok(topic.example&&topic.framework&&topic.selfCheck,`${topic.id} original material`);}}
});

test('every original topic has three distinct named dives, two rigorous follow-ups, a diagnostic and sourced claims',async()=>{
  const original=[];const extensions=[];const judgments=[];const boundaries=[];for(const slug of tracks){original.push(...await load('tracks',slug));extensions.push(...await load('advanced',slug));judgments.push(...await load('advanced/judgment',slug));boundaries.push(...await load('advanced/boundaries',slug));}const extras=await load('advanced/boundaries','extra');
  assert.equal(extensions.length,70);assert.equal(new Set(extensions.map(t=>t.id)).size,70);
  assert.equal(judgments.length,70);assert.equal(new Set(judgments.map(t=>t.id)).size,70);
  assert.equal(boundaries.length,70);assert.equal(new Set(boundaries.map(t=>t.id)).size,70);
  assert.deepEqual(extensions.map(x=>x.id).sort(),original.map(x=>x.id).sort());
  assert.deepEqual(judgments.map(x=>x.id).sort(),original.map(x=>x.id).sort());
  assert.deepEqual(boundaries.map(x=>x.id).sort(),original.map(x=>x.id).sort());
  assert.equal(new Set(extras.map(x=>x.id)).size,extras.length);assert.ok(extras.every(x=>original.some(t=>t.id===x.id)));
  const judgmentById=new Map(judgments.map(x=>[x.id,x.judgmentLab]));
  const extraById=new Map(extras.map(x=>[x.id,x.extra]));
  const boundaryById=new Map(boundaries.map(x=>[x.id,[x.boundary,extraById.get(x.id)].filter(Boolean).join(' ')]));
  const bodies=[];const topicWordCounts=[];
  for(const item of extensions){
    assert.equal(item.deepDives.length,3,`${item.id} dive count`);assert.equal(new Set(item.deepDives.map(d=>d.title)).size,3,`${item.id} named dives`);
    for(const dive of item.deepDives){assert.ok(dive.title.length>8&&dive.body.split(/\s+/).length>=25,`${item.id}: substantive ${dive.title}`);bodies.push(dive.body);}
    assert.equal(item.followUps.length,2,`${item.id} follow-up count`);
    for(const q of item.followUps){assert.ok(q.q.endsWith('?'),`${item.id} is a question`);assert.ok(q.a.split(/\s+/).length>=35,`${item.id} rigorous answer`);bodies.push(q.a);}
    assert.ok(item.diagnostic.prompt.length>30&&item.diagnostic.answer.split(/\s+/).length>=35&&item.diagnostic.rubric.length>30,`${item.id} diagnostic + solution + rubric`);
    assert.ok(judgmentById.get(item.id)?.split(/\s+/).length>=90,`${item.id} decision-grade judgment lab`);bodies.push(judgmentById.get(item.id));
    assert.ok(boundaryById.get(item.id)?.split(/\s+/).length>=45,`${item.id} technical boundary note`);bodies.push(boundaryById.get(item.id));
    assert.ok(item.sources.length>0,`${item.id} sources`);
    for(const source of item.sources){const ref=references[source.ref];assert.ok(ref,`${item.id} reference key ${source.ref}`);assert.match(ref.url,/^https:\/\//);assert.ok(new URL(ref.url).hostname.includes('.'));assert.ok(source.claim.length>=15);}
    const newText=[...item.deepDives.flatMap(d=>[d.title,d.body]),...item.followUps.flatMap(q=>[q.q,q.a]),item.diagnostic.prompt,item.diagnostic.answer,item.diagnostic.rubric,judgmentById.get(item.id),boundaryById.get(item.id),...item.sources.map(s=>s.claim)].join(' ');
    topicWordCounts.push(newText.split(/\s+/).length);
  }
  assert.equal(new Set(bodies).size,bodies.length,'deep dive, answer and judgment bodies are not repeated verbatim');
  assert.ok(topicWordCounts.reduce((sum,count)=>sum+count,0)/topicWordCounts.length>=600,'advanced additions average at least 600 words per topic including sources and named sections');assert.ok(Math.min(...topicWordCounts)>=600,'every topic meets the 600-word advanced coverage target');
});

test('core source notes contain exact HTTPS URLs and checked licensing caveats are explicit',async()=>{
  for(const [key,ref] of Object.entries(references)){assert.equal(new URL(ref.url).protocol,'https:',key);assert.ok(ref.supports.length>15,key);}
  const wm=await load('advanced','wealth-management');const license=wm.find(x=>x.id==='wealth-management-10');
  assert.match(license.deepDives[1].body,/Securities Industry Essentials \(SIE\)/);assert.match(license.deepDives[1].body,/sponsored by a FINRA member firm/);assert.match(license.deepDives[2].body,/corequisite/);assert.match(license.deepDives[2].body,/jurisdiction-specific requirements differ/);
});
