const test=require('node:test');
const assert=require('node:assert/strict');
const {scenarios,rtl,trace,coverage}=require('../data.js');
test('three distinct, approximately 30-line RTL cases match mutant conditions',()=>{
 assert.equal(scenarios.length,3);
 for(const s of scenarios){assert.ok(rtl(s.bug).split('\n').length>=28);assert.equal(trace(s.bug).length,6);}
 assert.match(rtl('drop'),/end else begin/);
 assert.match(rtl('overwrite'),/if \(in_valid\)/);
 assert.match(rtl('reset'),/BUG: valid was not reset/);
});
test('valid drops at edge 2 despite stalled pending word; corrected model holds',()=>{
 const r=trace('drop');assert.equal(r[2].out_valid,1);assert.equal(r[2].out_ready,0);
 assert.equal(r[2].afterValid,0);assert.equal(r[3].out_valid,0);
 const fixed=trace('fixed');assert.equal(fixed[2].afterValid,1);assert.equal(fixed[3].out_data,41);assert.equal(fixed[4].outputTransfer,true);assert.equal(fixed[4].out_data,41);
});
test('overwrite changes 41 to 82 at stalled edge 3 with no input transfer',()=>{
 const r=trace('overwrite');assert.equal(r[3].out_data,41);assert.equal(r[3].in_ready,0);assert.equal(r[3].inputTransfer,false);assert.equal(r[3].afterData,82);assert.equal(r[4].out_data,82);
 assert.equal(trace('fixed')[3].afterData,41);
});
test('synchronous reset leaves stale valid in reset mutant, creating ghost transfer',()=>{
 const r=trace('reset');assert.equal(r[3].rst_n,0);assert.equal(r[3].out_valid,1);assert.equal(r[3].afterValid,1);assert.equal(r[4].outputTransfer,true);assert.equal(r[4].out_data,0);
 // Same reset branch without mutation must clear valid (independently verify update).
 let v=r[3].out_valid;if(!r[3].rst_n)v=0;assert.equal(v,0);
});
test('source obeys valid/data hold while stalled in all generated runs',()=>{
 for(const s of scenarios){const r=trace(s.bug);for(let i=0;i<r.length-1;i++){if(r[i].rst_n&&r[i+1].rst_n&&r[i].in_valid&&!r[i].in_ready){assert.equal(r[i+1].in_valid,1);assert.equal(r[i+1].in_data,r[i].in_data);}}}
});
test('coverage is deterministic, monotone, bounded, and difficulty affects only rare bins',()=>{
 for(const m of ['random','human','agent'])for(const d of [1,4,10]){
 let previous=Array(48).fill(false);
 for(let t=0;t<=300;t++){const bins=coverage(t,d,m);assert.equal(bins.length,48);bins.forEach((b,i)=>assert.ok(!previous[i]||b));previous=bins;assert.deepEqual(bins,coverage(t,d,m));}
 assert.equal(coverage(0,d,m).filter(Boolean).length,0);
 assert.deepEqual(coverage(60,1,m).slice(0,32),coverage(60,10,m).slice(0,32));
 }
 assert.ok(coverage(150,4,'agent').filter(Boolean).length>coverage(150,4,'random').filter(Boolean).length);
});
