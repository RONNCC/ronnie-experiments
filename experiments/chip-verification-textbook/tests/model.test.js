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
