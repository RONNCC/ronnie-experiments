/* Pure educational models for the four Volume 2 demos.
   No network, storage, HDL simulation, or model calls. Deterministic teaching models
   with disclosed simplifications; nothing here is a tool output or a price quote. */
(function (root) {
  'use strict';
  function integerIn(value, lo, hi, label) {
    if (!Number.isInteger(value) || value < lo || value > hi) throw new RangeError(`${label} must be an integer ${lo}..${hi}`);
  }
  // ===== Demo A: RTL playground (cycle-accurate four-state teaching model) =====
  // Each row reports values AFTER that rising edge; en/rst_n shown are the values
  // sampled at the edge. Uninitialized registers hold 'X'; X + 1 stays X.
  function counterTrace({width = 4, resetValue = 0, enableMode = 'always', breakIt = false, cycles = 12} = {}) {
    integerIn(width, 2, 8, 'Width'); integerIn(resetValue, 0, 255, 'Reset value'); integerIn(cycles, 1, 40, 'Cycle count');
    if (!['always', 'alt', 'gated'].includes(enableMode)) throw new RangeError('Unknown enable mode');
    const mask = (1 << width) - 1;
    if (resetValue > mask) throw new RangeError('Reset value does not fit the width');
    const rows = [];
    let count = 'X';
    for (let t = 0; t < cycles; t++) {
      const rst_n = breakIt ? 1 : (t === 0 ? 0 : 1);
      const en = enableMode === 'always' ? 1 : enableMode === 'alt' ? (t % 2 === 0 ? 1 : 0) : (t < 4 ? 1 : 0);
      if (!rst_n) count = resetValue;
      else if (en) count = count === 'X' ? 'X' : (count + 1) & mask;
      rows.push({cycle: t + 1, rst_n, en, count});
    }
    return {kind: 'counter', rows, width, breakIt};
  }
  function trafficTrace({green = 2, yellow = 1, red = 2, breakIt = false, cycles = 12} = {}) {
    integerIn(green, 1, 4, 'Green length'); integerIn(yellow, 1, 4, 'Yellow length'); integerIn(red, 1, 4, 'Red length');
    integerIn(cycles, 1, 40, 'Cycle count');
    const rows = [];
    let state = 'G', timer = 0;
    for (let t = 0; t < cycles; t++) {
      const rst_n = t === 0 ? 0 : 1; // Every session starts with one reset edge.
      if (!rst_n) { state = 'G'; timer = 0; }
      else {
        const dur = state === 'G' ? green : state === 'Y' ? yellow : red;
        if (timer + 1 >= dur) {
          timer = 0;
          if (state === 'G') state = breakIt ? 'G' : 'Y'; // breakIt: the G->Y arc is missing.
          else if (state === 'Y') state = 'R';
          else state = 'G';
        } else timer += 1;
      }
      rows.push({cycle: t + 1, rst_n, state, timer});
    }
    return {kind: 'traffic', rows, breakIt};
  }
  function rtlCode({example = 'counter', params = {}} = {}) {
    if (example === 'counter') {
      const width = params.width ?? 4, resetValue = params.resetValue ?? 0, breakIt = Boolean(params.breakIt);
      return `// 4-bit-style counter with enable · width ${width} · synthesizable teaching example
module counter_en #(parameter WIDTH = ${width}) (
  input  wire             clk,
  input  wire             rst_n,      // active-low synchronous reset
  input  wire             en,
  output reg  [WIDTH-1:0] count
);
  always @(posedge clk) begin
${breakIt
  ? '    // BUG: the reset branch is gone. The register powers up\n    // undefined (X in simulation) and X + 1 stays X.\n    if (en)\n      count <= count + 1\'b1;'
  : `    if (!rst_n)\n      count <= WIDTH\'d${resetValue};     // deterministic start\n    else if (en)\n      count <= count + 1\'b1;         // holds when en is low`}
  end
endmodule`;
    }
    const green = params.green ?? 2, yellow = params.yellow ?? 1, red = params.red ?? 2, breakIt = Boolean(params.breakIt);
    return `// Traffic-light FSM · G ${green} / Y ${yellow} / R ${red} cycles · synthesizable teaching example
module traffic_light (
  input  wire       clk,
  input  wire       rst_n,
  output reg  [1:0] state     // 00 G, 01 Y, 10 R
);
  reg [1:0] timer;
  always @(posedge clk) begin
    if (!rst_n) begin state <= 2'b00; timer <= 0; end
    else case (state)
      2'b00: if (timer == ${green - 1}) begin
        timer <= 0;
${breakIt
  ? '        // BUG: the green-to-yellow arc is missing, so the\n        // machine is stuck in green forever.\n        state <= 2\'b00;'
  : '        state <= 2\'b01;             // G -> Y'}
      end else timer <= timer + 1;
      2'b01: if (timer == ${yellow - 1}) begin timer <= 0; state <= 2'b10; end else timer <= timer + 1;
      2'b10: if (timer == ${red - 1})   begin timer <= 0; state <= 2'b00; end else timer <= timer + 1;
      default: begin state <= 2'b00; timer <= 0; end // safe fallback
    endcase
  end
endmodule`;
  }
  // ===== Demo B: pipeline cost explorer =====
  const pipelineStages = [
    {id: 'spec', name: 'Spec & architecture', escape: 1,
      catches: ['Interface widths or handshake rules nobody agreed on', 'Throughput or latency targets that the architecture cannot meet', 'Corner cases left undefined ("what happens on simultaneous push and pop?")'],
      tools: ['Design documents and spreadsheets', 'Performance models in Python or C++', 'Architecture review meetings'],
      escapeNote: 'A document edit and a meeting. This is the cheapest place to be wrong.'},
    {id: 'rtl', name: 'RTL design', escape: 1,
      catches: ['Obvious logic mistakes while writing and reading code', 'Latch inferences, width mismatches, missing branches (compiler and lint warnings)', 'Reset and enable mistakes spotted in self-review'],
      tools: ['SystemVerilog in an editor or IDE', 'Linters (Spyglass, HAL, Verilator lint)', 'Synthesis smoke runs'],
      escapeNote: 'An edit and a re-run of quick checks. Still the 1x zone.'},
    {id: 'dv', name: 'Functional verification', escape: 1,
      catches: ['Logic, protocol, ordering and boundary bugs', 'Corner cases the designer never imagined', 'Regressions that break after a later change'],
      tools: ['Simulators (VCS, Xcelium, Questa, Verilator)', 'UVM testbenches and formal tools (Jasper, VC Formal)', 'Coverage and regression dashboards'],
      escapeNote: 'Bug hunts here are minutes to days. This is where the 1x still holds.'},
    {id: 'synthesis', name: 'Synthesis & timing', escape: 10,
      catches: ['Unsynthesizable constructs, surprise latches or huge logic cones', 'Clock constraints that miss false paths or multicycle paths', 'Timing that cannot close at the target frequency'],
      tools: ['Synthesis (Design Compiler, Fusion Compiler, Genus)', 'Static timing analysis (PrimeTime, Tempus)', 'Constraint files (SDC)'],
      escapeNote: 'Rule of thumb: fixing design bugs found after implementation work has begun costs about 10x the RTL edit loop.'},
    {id: 'pd', name: 'Physical design', escape: 10,
      catches: ['Routing congestion, IR drop and clock-skew surprises', 'DRC/LVS violations against the foundry rules', 'Parasitic effects that break assumptions made in RTL'],
      tools: ['Place-and-route (Innovus, Fusion Compiler, ICC2)', 'Signoff STA and extraction (PrimeTime, StarRC)', 'Physical verification (Calibre, ICV, Pegasus)'],
      escapeNote: 'Still around 10x while the design is pre-mask, but each fix now drags timing and physical re-closure behind it.'},
    {id: 'tapeout', name: 'Tapeout & masks', escape: 100,
      catches: ['Everything signoff was supposed to prove', 'Manufacturing-rule edge cases the foundry review flags', 'Last-chance checklist items: version mismatches, wrong ECO netlist'],
      tools: ['GDSII stream-out and tapeout automation', 'Mask shops and foundry tapeout portals', 'MPW shuttle schedules (MOSIS, Europractice, CyberShuttle)'],
      escapeNote: 'Rule of thumb: once wafers are started, a functional bug costs about 100x its RTL-edit price — masks, fab time and a re-spin.'},
    {id: 'bringup', name: 'Bring-up & product', escape: 100,
      catches: ['Power-up and clocking problems', 'Bugs that only real silicon and real firmware expose', 'Field failures under real workloads and corners'],
      tools: ['Lab benches, scopes and protocol analyzers', 'ATE test programs and board firmware', 'Silicon debug via scan and embedded logic analysis'],
      escapeNote: 'The 100x zone (or worse): a re-spin is months of fab time plus lost product windows.'}
  ];
  function stageDetail(id) {
    const found = pipelineStages.find(s => s.id === id);
    if (!found) throw new RangeError('Unknown stage');
    return found;
  }
  // ===== Demo C: HLS side-by-side (precomputed, representative teaching output) =====
  function hlsVariant({unroll = 1, pipeline = false} = {}) {
    if (![1, 2, 8].includes(unroll)) throw new RangeError('Unroll must be 1, 2 or 8');
    const n = 8;
    const pragmas = [];
    if (unroll > 1) pragmas.push(`#pragma HLS UNROLL factor=${unroll}`);
    if (pipeline) pragmas.push('#pragma HLS PIPELINE II=1');
    const cCode = `// vector add: c[i] = a[i] + b[i], N = 8
void vecadd(int a[8], int b[8], int c[8]) {
  for (int i = 0; i < 8; i++) {
${pragmas.map(p => '    ' + p).join('\n')}${pragmas.length ? '\n' : ''}    c[i] = a[i] + b[i];
  }
}`;
    const adds = unroll;
    const iter = n / unroll;
    const latency = pipeline ? n + 2 : iter + 2; // disclosed toy schedule: 2 cycles of fill/drain overhead
    const ii = pipeline ? 1 : latency;
    let rtlCode;
    if (pipeline && unroll === 1) {
      rtlCode = `// Representative pipelined output (abridged): one adder, II = 1.
module vecadd_pipe (input clk, input [15:0] a, b, input in_valid,
                    output reg [15:0] c, output reg out_valid);
  reg [15:0] a_q, b_q;             // pipeline register stage
  always @(posedge clk) begin
    a_q <= a;  b_q <= b;           // stage 1: register the operands
    c   <= a_q + b_q;              // stage 2: registered sum
    out_valid <= in_valid;         // valid rides along the pipe
  end
endmodule
// Scheduler: new operands every cycle (II = 1).`;
    } else if (unroll === 8) {
      rtlCode = `// Representative fully-unrolled output (abridged): ${adds} adders in parallel.
module vecadd_unroll8 (input clk, input [127:0] a, b,   // 8 x 16-bit packed
                       output reg [127:0] c);
  always @(posedge clk) begin
    c[ 15:  0] <= a[ 15:  0] + b[ 15:  0];   // adder 1
    c[ 31: 16] <= a[ 31: 16] + b[ 31: 16];   // adder 2
    // ... adders 3-7 identical ...
    c[127:112] <= a[127:112] + b[127:112];   // adder 8
  end
endmodule
// Scheduler: all 8 elements in one pass; latency = 1 compute + 1 register.`;
    } else if (unroll === 2) {
      rtlCode = `// Representative 2-way unrolled output (abridged): ${adds} adders, ${iter} passes.
module vecadd_unroll2 (input clk, input [31:0] a, b,   // 2 x 16-bit packed
                       output reg [31:0] c, output reg [2:0] idx);
  always @(posedge clk) begin
    c[15: 0] <= a[15: 0] + b[15: 0];         // adder 1
    c[31:16] <= a[31:16] + b[31:16];         // adder 2
    idx <= idx + 1;                          // ${iter} passes over the array
  end
endmodule`;
    } else {
      rtlCode = `// Representative baseline output (abridged): one adder, sequential loop.
module vecadd_seq (input clk, input start, input [15:0] a, b,
                   output reg [15:0] c, output reg [2:0] i, output reg done);
  always @(posedge clk) begin
    if (start) begin i <= 0; done <= 0; end
    else if (i < 8) begin
      c <= a + b;                // one adder reused ${iter} times
      i <= i + 1;                // ${iter} loop passes + fill/drain
    end else done <= 1;
  end
endmodule`;
    }
    return {
      cCode, rtlCode, unroll, pipeline, adds, latency, ii,
      area: adds + (pipeline ? 0.5 : 0),
      note: pipeline
        ? 'Pipeline pragma: steady-state throughput is one element per cycle; registers ride along the loop body.'
        : unroll > 1
          ? `Unroll factor ${unroll}: ${adds} adders work in parallel; latency shrinks, area grows.`
          : 'Baseline: one adder reused for every element. Smallest and slowest.'
    };
  }
  // ===== Demo D: node economics explorer (simplified, disclosed estimates) =====
  const nodePresets = [
    {name: '28nm',  wafer: 3000,  nre: 10e6,  d0: 0.002,  note: 'Mature planar workhorse; public wafer price ~$3k.'},
    {name: '7nm',   wafer: 9500,  nre: 20e6,  d0: 0.004,  note: 'First EUV layers; public wafer price ~$9.5k.'},
    {name: '5nm',   wafer: 18500, nre: 40e6,  d0: 0.006,  note: 'EUV-dominant; public wafer price ~$18.5k.'},
    {name: '3nm',   wafer: 20000, nre: 80e6,  d0: 0.008,  note: 'GAA-era pricing; public wafer price ~$20k.'},
    {name: '2nm',   wafer: 30000, nre: 150e6, d0: 0.012,  note: 'Reported N2 wafer price ~$30k; NRE for complex SoCs reported far higher.'}
  ];
  function nodeEconomics({dieArea = 100, waferPrice = 18500, volume = 100000, nre = 40e6, defectDensity = 0.006} = {}) {
    if (!Number.isFinite(dieArea) || dieArea < 1 || dieArea > 800) throw new RangeError('Die area must be 1..800 mm^2');
    if (!Number.isFinite(waferPrice) || waferPrice < 500 || waferPrice > 50000) throw new RangeError('Wafer price must be 500..50000');
    if (!Number.isFinite(volume) || volume < 1000 || volume > 50000000) throw new RangeError('Volume must be 1,000..50,000,000');
    if (!Number.isFinite(nre) || nre < 0 || nre > 1e9) throw new RangeError('NRE must be 0..1,000,000,000');
    if (!Number.isFinite(defectDensity) || defectDensity < 0 || defectDensity > 0.05) throw new RangeError('Defect density must be 0..0.05 per mm^2');
    const diameter = 300;
    const gross = Math.max(1, Math.floor(Math.PI * (diameter / 2) ** 2 / dieArea - Math.PI * diameter / Math.sqrt(2 * dieArea)));
    const yieldRate = Math.exp(-defectDensity * dieArea); // Poisson; disclosed teaching model
    const good = gross * yieldRate;
    const perDie = waferPrice / good;
    const nrePerChip = nre / volume;
    return {dieArea, waferPrice, volume, nre, defectDensity, gross, yieldRate, good, perDie, nrePerChip, allIn: perDie + nrePerChip};
  }
  const api = {counterTrace, trafficTrace, rtlCode, pipelineStages, stageDetail, hlsVariant, nodePresets, nodeEconomics};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ChipDesignModels = api;
})(typeof window !== 'undefined' ? window : globalThis);
