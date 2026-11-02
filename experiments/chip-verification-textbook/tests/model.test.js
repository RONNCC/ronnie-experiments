'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {FIFO, coverage, evidence, excluded} = require('../model.js');

test('empty has no bypass, even with valid and ready high', () => {
  const f = new FIFO(); const r = f.step({valid:true, ready:true, data:42});
  assert.equal(r.push,true); assert.equal(r.pop,false); assert.equal(r.outValid,false);
  assert.deepEqual(r.after,[42]);
});
test('full simultaneous replacement consumes OLD head and holds occupancy', () => {
  const f = new FIFO(); [10,20,30,40].forEach(data=>f.step({valid:true,data}));
  assert.equal(f.read,0); assert.equal(f.write,0);
  const r=f.step({valid:true,ready:true,data:50});
  assert.equal(r.oldHead,10); assert.equal(r.push,true); assert.equal(r.pop,true);
  assert.deepEqual(r.after,[20,30,40,50]); assert.equal(f.read,1); assert.equal(f.write,1);
});
test('full backpressure and reset dominance', () => {
  const f = new FIFO(); [1,2,3,4].forEach(data=>f.step({valid:true,data}));
  const stalled=f.step({valid:true,data:5});
  assert.equal(stalled.inReady,false); assert.equal(stalled.push,false); assert.deepEqual(stalled.after,[1,2,3,4]);
  const r=f.step({valid:true,ready:true,reset:true,data:9});
  assert.equal(r.push,false); assert.equal(r.pop,false); assert.equal(r.inReady,false); assert.equal(r.outValid,false);
  assert.deepEqual(r.after,[]); assert.equal(f.read,0); assert.equal(f.write,0);
});
test('all occupancy/offer combinations follow explicit truth table', () => {
  for(let n=0;n<=4;n++) for(const valid of [false,true]) for(const ready of [false,true]) {
    const f=new FIFO(); for(let i=0;i<n;i++) f.step({valid:true,data:i});
    const r=f.step({valid,ready,data:99});
    const pop=n>0 && ready, push=valid && (n<4 || pop);
    assert.equal(r.pop,pop); assert.equal(r.push,push); assert.equal(r.after.length,n+Number(push)-Number(pop));
    assert.equal(excluded.has(`${r.state}:${r.event}`),false);
  }
});
test('long deterministic streams preserve ordering and wrap for depths 1..7', () => {
  let seed=1234567;
  function random(){seed=(1664525*seed+1013904223)>>>0;return seed/2**32;}
  for(let depth=1;depth<=7;depth++) {
    const f=new FIFO(depth); let expected=[],accepted=0,removed=0;
    for(let cycle=0;cycle<4000;cycle++) {
      const valid=random()<.7,ready=random()<.6,reset=random()<.01,data=cycle%256;
      const n=expected.length,r=f.step({valid,ready,reset,data});
      if(reset) {expected=[];accepted=0;removed=0;}
      else {
        const take=n>0&&ready, put=valid&&(n<depth||take);
        assert.equal(r.pop,take);assert.equal(r.push,put);
        if(take){assert.equal(r.oldHead,expected[0]);expected=expected.slice(1);removed++;}
        if(put){expected=[...expected,data];accepted++;}
      }
      assert.deepEqual(f.queue,expected); assert.equal(f.read,removed%depth); assert.equal(f.write,accepted%depth);
      assert.ok(f.queue.length<=depth);
    }
  }
});
test('input validation is atomic', () => {
  const f=new FIFO(); for(const data of [-1,256,NaN,2.2]) assert.throws(()=>f.step({data}),RangeError);
  assert.equal(f.cycle,0);assert.deepEqual(f.queue,[]);assert.throws(()=>new FIFO(0),RangeError);
});
test('coverage raw and reachable denominators are distinct', () => {
  const hits=new Set(['empty:idle','empty:push','interior:idle','interior:push','interior:pop','interior:both','full:idle','full:pop','full:both']);
  assert.deepEqual(coverage(hits,false),{counted:9,denominator:12,percent:75});
  assert.deepEqual(coverage(hits,true),{counted:9,denominator:9,percent:100});
});
test('evidence gate abstains on missing or truncated evidence', () => {
  const all={spec:true,run:true,wave:true,source:true,reproduced:true,truncated:false};
  assert.equal(evidence(all).level,'supported');
  for(const key of ['spec','run','wave']) assert.equal(evidence({...all,[key]:false}).level,'abstain');
  assert.equal(evidence({...all,truncated:true}).level,'abstain');
  assert.equal(evidence({...all,source:false}).level,'hypothesis');
  assert.equal(evidence({...all,reproduced:false}).level,'hypothesis');
});

const {hiddenOrdering, cdcPulse, agentBudget} = require('../model.js');
test('all labeled reducer statements can run while the ordering bug escapes smoke', () => {
  const smoke=hiddenOrdering();
  assert.equal(smoke.statementPercent,100);assert.equal(smoke.orderingBin,false);assert.equal(smoke.verdict,'pass');
  const ordered=hiddenOrdering({suite:'ordering'});
  assert.equal(ordered.statementPercent,100);assert.equal(ordered.orderingBin,true);assert.equal(ordered.verdict,'fail');
  assert.deepEqual(ordered.outputs,[20,10]);assert.deepEqual(ordered.expected,[10,20]);
  assert.equal(hiddenOrdering({suite:'ordering',checker:false}).verdict,'unchecked');
  assert.equal(hiddenOrdering({suite:'ordering',mutant:false}).verdict,'pass');
});
test('CDC default pulse loss and well-spaced toggle recovery', () => {
  assert.equal(cdcPulse().delivered.length,0);
  assert.deepEqual(cdcPulse().offers,[4,24,44,64,84,104]);
  assert.equal(cdcPulse({mode:'toggle'}).delivered.length,6);
});
test('CDC open-loop toggles alias; acknowledged protocol refuses busy offers', () => {
  const opts={src:2,dst:12,phase:1,spacing:1};
  assert.equal(cdcPulse({...opts,mode:'toggle'}).delivered.length,0);
  const r=cdcPulse({...opts,mode:'handshake'});
  assert.equal(r.accepted.length,1);assert.equal(r.delivered.length,1);assert.equal(r.busy,5);assert.equal(r.missed,0);
});
test('CDC exact coincident edges sample the old source level', () => {
  const r=cdcPulse({src:4,dst:4,phase:0,width:1,spacing:3});
  assert.equal(r.samples.find(s=>s.t===4).input,0); // source just launches
  assert.equal(r.samples.find(s=>s.t===8).input,1); // source just deasserts
  assert.equal(r.samples.find(s=>s.t===8).q2,0);
  assert.equal(r.samples.find(s=>s.t===12).event,true);
});
test('CDC sweep conserves offered/accepted events; handshake drains accepted requests', () => {
  let cases=0;
  for(let src=2;src<=6;src++)for(let dst=2;dst<=9;dst++)for(let phase=0;phase<dst;phase++)for(let spacing=1;spacing<=4;spacing++)for(const mode of ['pulse','toggle','handshake']) {
    const r=cdcPulse({src,dst,phase,spacing,mode});cases++;
    assert.equal(r.offers.length,r.accepted.length+r.busy);
    assert.ok(r.delivered.length<=r.accepted.length);
    if(mode==='handshake') assert.equal(r.missed,0);
  }
  console.log(`CDC swept ${cases} clock/phase/spacing/scheme combinations`);
});
test('CDC rejects illegal controls and merged high pulses deliver one rising event', () => {
  assert.throws(()=>cdcPulse({src:0}),RangeError);assert.throws(()=>cdcPulse({dst:10,phase:10}),RangeError);
  assert.throws(()=>cdcPulse({width:3,spacing:2}),RangeError);assert.throws(()=>cdcPulse({phase:NaN}),RangeError);
  assert.equal(cdcPulse({src:4,dst:2,phase:1,width:2,spacing:2}).delivered.length,1);
});
test('budget fully supported synthetic recipes and independent evidence ablations', () => {
  const r=agentBudget({rounds:4,licenseBudget:4});
  assert.equal(r.supported,8);assert.equal(r.bugs,4);assert.equal(r.reproducers,4);assert.equal(r.license,3.25);
  assert.equal(r.calls,19);assert.equal(r.cost,.76);
  const noCheck=agentBudget({rounds:6,licenseBudget:8,checker:false});
  assert.equal(noCheck.bugs,0);assert.equal(noCheck.reproducers,0);
  const noSpec=agentBudget({rounds:6,licenseBudget:8,retrieval:false});
  assert.equal(noSpec.bugs,1); // wrap recipe deliberately does not require spec retrieval
});
test('budget cap, free-license infra cases, and parallel time without quality changes', () => {
  const zero=agentBudget({rounds:4,licenseBudget:0});
  assert.equal(zero.license,0);assert.equal(zero.bugs,0);assert.equal(zero.supported,3);
  for(let cap=0;cap<=4;cap+=.25) assert.ok(agentBudget({rounds:4,licenseBudget:cap}).license<=cap);
  const serial=agentBudget({rounds:4,licenseBudget:4,workers:1}), parallel=agentBudget({rounds:4,licenseBudget:4,workers:4});
  assert.equal(serial.bugs,parallel.bugs);assert.equal(serial.calls,parallel.calls);assert.equal(serial.license,parallel.license);
  assert.ok(parallel.makespan<serial.makespan);
  assert.throws(()=>agentBudget({rounds:0}),RangeError);assert.throws(()=>agentBudget({licenseBudget:NaN}),RangeError);
});
