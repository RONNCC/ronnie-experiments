/* Shared, deterministic teaching models; no Bronco proprietary data. */
(function(root){
'use strict';
const scenarios = [
 {name:'01 · The disappearing word', bug:'drop', answer:0, symptom:'A stalled word disappears before the receiver accepts it.', explanation:'At edge 2, out_valid=1 and out_ready=0. There is no transfer. The buggy else clears out_valid anyway, losing word 41. Hold valid and data until a handshake. Replace the final else with “else if (out_ready)”.'},
 {name:'02 · The changing word', bug:'overwrite', answer:1, symptom:'The output word changes while the receiver is stalled.', explanation:'At edge 3, the buffer holds 41 and out_ready=0, so in_ready=0. The producer legally offers 82 and holds it. The buggy load condition tests in_valid alone and overwrites 41 without accepting a transfer. Load only on in_valid && in_ready.'},
 {name:'03 · The ghost after reset', bug:'reset', answer:2, symptom:'An old word survives a reset and is consumed afterward.', explanation:'Edge 3 asserts synchronous active-low reset. The buggy reset branch clears data but not out_valid. After the edge, valid stays high with data 0, and edge 4 consumes a ghost word. Reset must clear out_valid; clearing data is optional when valid=0.'}
];
function rtl(bug){return `module skid_word (
  input logic clk, rst_n,
  input logic in_valid,
  output logic in_ready,
  input logic [7:0] in_data,
  output logic out_valid,
  input logic out_ready,
  output logic [7:0] out_data
);
  // One-entry registered buffer.
  // Transfer: valid && ready at rising edge.
  // Producer holds data while stalled.
  // Reset is synchronous, active low.
  assign in_ready = !out_valid || out_ready;

  always_ff @(posedge clk) begin
    if (!rst_n) begin
      ${bug==='reset'?'// BUG: valid was not reset':'out_valid <= 1\'b0;'}
      out_data <= 8'd0;
    end else begin
      if (${bug==='overwrite'?'in_valid':'in_valid && in_ready'}) begin
        out_data <= in_data;
        out_valid <= 1'b1;
      end ${bug==='drop'?'else begin':'else if (out_ready) begin'}
        out_valid <= 1'b0;
      end
      // Otherwise hold registered state.
    end
  end
endmodule`;}
function trace(bug){
 // Begin after a drain edge (rst_n=1, in_valid=0, out_ready=1).
 // That edge establishes valid=0 even in the reset mutant; inactive data is arbitrary.
 let v=0,d=0; const rows=[];
 // Inputs sampled immediately before each edge. Source respects backpressure.
 const inputs=bug==='reset'?[[0,0,0,0],[1,1,41,0],[1,0,0,0],[0,0,0,0],[1,0,0,1],[1,0,0,1]]:[[0,0,0,0],[1,1,41,0],[1,0,0,0],[1,1,82,0],[1,1,82,1],[1,0,0,1]];
 inputs.forEach(([rst,iv,id,ready],edge)=>{
  const ir=Number(!v||ready); const row={edge,rst_n:rst,in_valid:iv,in_ready:ir,out_valid:v,out_ready:ready,out_data:d,in_data:id};
  row.inputTransfer=!!(rst&&iv&&ir); row.outputTransfer=!!(rst&&v&&ready);
  if(!rst){if(bug!=='reset')v=0; d=0;}else if(iv&&(bug==='overwrite'||ir)){v=1;d=id;}else if(bug==='drop'||ready)v=0;
  row.afterValid=v;row.afterData=d;rows.push(row);
 });return rows;
}
function coverage(tests,difficulty,method){
 // 48 reachable bins, each with fixed pseudo-random hit threshold.
 // Closed-form hazard model: no wall-clock speed or correctness claims.
 return Array.from({length:48},(_,i)=>{
 const rare=i>=32; const base=rare?0.012/ difficulty:0.16;
 const rate=method==='random'?base:method==='human'?(rare?0.038/difficulty:0.13):(rare?0.085/difficulty:0.14);
 const threshold=0.15+((i*37+11)%97)/97*2.8;
 return tests*rate>=threshold;
 });
}
const api={scenarios,rtl,trace,coverage}; if(typeof module!=='undefined')module.exports=api;else root.BRONCO=api;
})(typeof window==='undefined'?globalThis:window);
