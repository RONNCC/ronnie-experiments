# Chip Design, Beyond Verification — From RTL to Tapeout

A systems textbook for software and AI engineers. Public-source research edition · 2 November 2026 · Volume 2 of the chip series.

**Volume 1 covered checking chips; this volume covers designing them.** The companion book, [Chip Verification — From Software to Silicon](../chip-verification-textbook/), teaches how teams gather evidence that a design keeps its promises: testbenches, assertions, coverage, CDC, regressions. Read it if you want the checking side. This book covers everything else in chip design — writing the design itself, organizing the team, synthesizing it, physically building it, taping it out, choosing a foundry, paying for it, and deciding where AI tools genuinely help today. Where a checking detail matters to a design decision, we point back to Volume 1 instead of re-teaching it. And when you want the map of the software these teams actually run day to day, the companion reference [The Chip Design Software Landscape](../eda-tools-explorer/) is an interactive field guide to EDA tools by pipeline stage and license.

No hardware background is assumed. Every term is defined the first time it appears, examples are deliberately tiny enough to audit, and every technique is presented with its limits. All cost figures are labeled: either publicly reported estimates with wide error bars, or industry rules of thumb that engineers quote for teaching. None are quotes or vendor benchmarks. Nothing here is private, proprietary, or company-strategy information. The four interactive demos are deterministic local models — no tracking, no forms, no external assets.

## Start here: the whole chip in 20 minutes

A chip is a manufactured electrical circuit: millions to billions of tiny switches (transistors) wired into structures that calculate answers and remember values. **Designing** one means deciding that structure and describing it precisely enough to manufacture. This chapter is the map of that journey. We will walk the whole pipeline once — architecture, RTL, verification, synthesis, physical design, tapeout, bring-up — with one rule: at every stage, name what is being decided, what artifact comes out, and what it costs to be wrong here.

**The pipeline at a glance.** A design moves forward through these stages and loops back whenever a stage finds a problem:

<div class="circuit" aria-hidden="true"><span>ARCHITECTURE</span><b>→</b><span>RTL</span><b>→</b><span>VERIFY</span><b>→</b><span>SYNTHESIS</span><b>→</b><span>PHYSICAL</span><b>→</b><span>TAPEOUT</span><b>→</b><span>BRING-UP</span></div>

**Architecture and specification.** Product intent becomes a written promise: what the chip does, which interfaces it speaks, how fast, at what power and cost. The artifact is a specification and a microarchitecture document. Cheap stage, expensive stage to skip.

**RTL design.** Engineers describe the circuit in a hardware description language — for most digital teams, SystemVerilog. This description at the **register-transfer level** (RTL) says which values are remembered each clock tick and how they compute the next values. It is the central design artifact of the whole flow. Chapter 5 is about writing it well.

**Verification.** Teams build independent models and tests to gather evidence that the RTL keeps the specification's promises. This is the largest engineering effort in a modern project — Volume 1's entire subject. As a designer you will live inside this loop daily.

**Synthesis.** A program called a synthesis tool compiles RTL into a **netlist**: a network of standard logic gates (AND, OR, flip-flops) from the foundry's library. Constraints — the clock speed you need, paths that may be slow on purpose — guide the tool. Timing reports come back, and design work iterates against them. Chapter 9.

**Physical design.** The netlist becomes physical rectangles: blocks get placed on the die, wires routed between them, a clock tree built so the tick reaches every register at nearly the same instant. Then the layout is checked against thousands of manufacturing rules. Chapters 10–12.

**Tapeout.** The final layout is frozen and sent to the foundry as a GDSII file — literally the descendant of magnetic tape, which is why the verb is "tape out". Photomasks are made, wafers processed, chips packaged. Chapter 11.

**Bring-up.** Real chips come back to a lab. Engineers power them for the first time, check the clock and reset tree, load simple firmware, and run the same promises from the specification against actual silicon. Bugs here are the expensive kind.

**What to remember.** Every stage converts an abstract promise into a more concrete artifact, and every stage can discover that an earlier promise was wrong. The whole rest of this book is detail under this map. If you only remember one number: industry rule of thumb says a bug caught while editing RTL costs 1x to fix, one caught after implementation work about 10x, and one that reaches silicon about 100x. It is folklore with a wide error bar — but the direction is exactly right.

<!-- LAB-B -->

### How people do this today

**Workflow.** A product team writes requirements; an architecture team turns them into a microarchitecture spec with interface and budget tables; block owners write RTL and test plans in parallel; weekly integration drops merge blocks into the SoC; physical-design engineers run implementation continuously, not at the end. The pipeline picture is sequential; the calendar is not.

**Tools.** Requirements live in wikis and review docs; performance models are Python or C++; RTL goes through lint, simulation, and synthesis smoke runs inside CI-like regression systems; schedules are tracked in ordinary project tools. Nothing here is exotic — the exotic part is the cost of being wrong.

**Pain points.** Handoffs are documents, and documents drift. A block that "passes its own tests" can still violate an assumption the system relied on. And the flow is serial in accountability but parallel in reality: late physical-design surprises bounce work back to RTL teams who thought they were done.

## Reading routes

This book is designed to be read in three different orders. Each route below lists its chapters and one exit artifact — something you should be able to produce at the end, not just recognize. Times are reading suggestions, not measured learning guarantees.

**Route 1 — the software engineer (about 2 hours).** You write code and run CI for a living. Read chapter 3 (how teams actually work — the closest thing to an org-and-CI map), chapter 5 (RTL as a strange, parallel kind of programming), chapter 7 (HLS — C in, circuits out), chapter 9 (synthesis as a compiler with cost models you already understand), and chapter 15 (where AI tooling stands). Exit artifact: explain to a fellow engineer why "the tests passed" and "the chip works" are different claims, in terms of build stages they know.

**Route 2 — the new grad or career switcher (about 3 hours).** Go in order: chapters 3, 4, 5, 6, 8, 9, 10, 11. That is one complete pass down the pipeline from team structure to first power-on, with the design-writing and checking chapters in between. Exit artifact: narrate one bug — say, a counter that misses its wrap — from the moment it is written to the stage where it would be caught, naming the tool at each stage.

**Route 3 — the product-minded reader (about 2 hours).** Start with money and supply: chapter 12 (foundries and what "3nm" really means), chapter 13 (chiplets and packaging), chapter 14 (when custom silicon pays for itself), then chapter 3 for the team mechanics that drive schedules, then chapter 15 (the AI claims, read honestly). Exit artifact: a one-page make-vs-buy sketch for a hypothetical accelerator, including NRE, volume assumptions, and one honest risk.

**How to use this book.** The fifteen teaching chapters — Start here through chapter 15 — each open in plain words with a concrete example, add depth, and close with a "How people do this today" box: the real workflow, the tools people actually run, and the top pain points. That is fifteen teaching chapters and fifteen boxes; the two reference sections (glossary and sources) close with the review checklist and the evidence ledger instead. The four demos are deterministic teaching models — click them, break them, and read their disclosed limits. The glossary at the back has one-line definitions and examples for every term used here. Printing includes every chapter and every answer box.

### How people do this today

**Workflow.** On real teams nobody reads a book linearly: new engineers are given the two or three chapters that match their block plus a mentor, and revisit the rest when a problem sends them here. Design reviews, not reading order, set the pace.

**Tools.** Internal wikis, onboarding checklists, recorded design reviews, and a senior engineer who answers Slack questions remain the de facto curriculum at most companies.

**Pain points.** Knowledge concentrates in a few heads, and when they leave mid-project the vocabulary of a block can leave with them. Shared, written maps like this one are the cheap insurance.

## 3. How chip teams actually work

A chip project is an organization problem wearing a circuit costume. The classic structure is a pipeline of specialized teams — architects, RTL designers, design verification (DV) engineers, physical design (PD) engineers, DFT, and firmware — handing artifacts to one another. Understanding this structure explains almost every schedule you will ever see quoted.

**In everyday words.** Specialists serially own stages of one artifact. The handoffs are documents and files; rework loops are the norm; the whole machine is measured by one brutal event: whether the first manufactured chips work.

**Concrete example.** A DV engineer finds that a queue drops a word when two transfers happen on one clock tick (Volume 1's running example). The fix is a one-line RTL change — but the block is already in physical design, so the line change re-runs synthesis and timing for the whole block: days of compute and signoff for one line. The bug cost 1x to write and roughly 10x to fix late. That asymmetry is the economics of the entire industry.

**The handoffs.** Architecture hands DV and RTL a specification; RTL hands synthesis an integrated design; PD hands the foundry a signoff-clean layout; firmware and validation teams receive packaged chips months later. Every handoff is lossy. A classic failure mode is *forced rework*: PD reports that a block cannot meet its timing budget at the planned clock speed, which forces RTL restructuring (say, another pipeline stage), which invalidates verification work in flight. Teams do not "force rework" out of malice — each team optimizes its own constraints, and the constraints collide.

**Why first-pass success is rare.** The industry tracks a metric called **first-pass silicon success**: the fraction of tapeouts whose first manufactured chips are functionally correct and manufacturable without a re-spin. The 2026 Siemens EDA / Wilson Research Group Functional Verification Study reports that only 5% of surveyed IC/ASIC projects achieved first-silicon success — down from 14.4% in their 2024 study, and far below the ~30% figure researchers cite historically. The same body of work reports that logic and functional errors remain the primary cause of ASIC re-spins. Read those numbers with care: survey participation and methodology shifted in 2024, the metric measures project self-reporting rather than defect counts, and no study traces individual bugs back to their origin stage. But the direction is unmistakable and matches every engineer's lived experience: a small fraction of tapeouts are right the first time, and most failures trace to spec and logic bugs that earlier-stage work could have caught.

**What to remember.** The org chart is a pipeline with lossy handoffs, rework flows backward, and success is measured by a rare event. Everything downstream — tools, AI assistants, process rules — exists to move bug discovery earlier, where fixes cost 1x instead of 10x or 100x.

### How people do this today

**Workflow.** Programs run in multi-week integration cadences: blocks merge, regressions run nightly, failures get triaged by area, and a weekly cross-team meeting decides which fire to fight. "Signoff" is a negotiated release gate, not a single tool run.

**Tools.** Bug trackers (Jira and friends), regression farms on internal compute clusters or the cloud, dashboards of test and coverage status, and version control for everything from RTL to constraint files. Schedule risk is tracked in ordinary project-management tools.

**Pain points.** Late integration surprises, asymmetric information between design and PD, and "verification hero culture" — schedules that only close because a handful of engineers absorb the overruns. The survey numbers above say the industry has not fixed this.

## 4. Specification and microarchitecture

Before RTL, someone must decide what the circuit promises. A **specification** states externally visible behavior: interfaces, timing, throughput, latency, power and performance targets. A **microarchitecture** document states the internal plan: which pipeline stages exist, how deep the queues are, what gets shared, what happens on corner cases. Together they are the contract everything downstream checks against.

**In everyday words.** The spec is what the chip promises its neighbors; the microarchitecture is how it keeps those promises. Both are written down, because "what we all understood" is not a contract.

**Concrete example.** A tiny audio block must accept a sample word every 40 microseconds and hand each word to a converter in arrival order, even if the converter stalls. That single sentence fixes an interface (valid/ready handshake), a throughput budget (one word per 40 μs), a latency bound, and an ordering rule. From it follow real design decisions: how many queue slots (buffering for stalls), what happens when the queue is full (backpressure or drop — spec must say), and how the block resets.

**Budgets are design tools.** Software engineers know capacity planning; chip teams do it at cycle precision. If a memory read takes 3 cycles and the product needs one result per cycle, the microarchitecture must show parallelism (pipelining or multiple banks) or the spec must bend. Writing this arithmetic down early is the entire job: area, power, and performance (the industry's **PPA** triangle) trade against each other, and every choice is cheaper now than later. A larger queue is area for tolerance of stalls; a deeper pipeline is performance for latency and design complexity; a higher clock is power for speed.

**Interfaces are load-bearing.** Most integration bugs are not arithmetic mistakes — they are disagreements about interfaces. Who asserts what, in which order, what happens on simultaneous events, what a reset flushes. (Volume 1's FIFO chapters show exactly how much contract detail a "simple" queue hides.) Software engineers will recognize this as API design with two twists: the API is physical, and every message has a cycle count attached.

**Limits of the technique.** A design document cannot prove the RTL matches it; it can only make mismatch *findable*. Specifications written too early freeze wrong guesses; written too late, they rubber-stamp existing code. The honest state is a living contract with version history, reviewed at every interface change.

### How people do this today

**Workflow.** Architecture writes a one-pager per block plus an interface control document (ICD); design reviews argue about clocks, resets, and corner cases; budgets (latency, throughput, area estimates, power envelopes) are tabulated and tracked against later implementation reality.

**Tools.** Documents and spreadsheets, cycle-accurate Python or C++ performance models, waveform viewers for exploring candidate architectures in simulation, and sometimes early "paper RTL" experiments to test a risky idea.

**Pain points.** Spec documents rot relative to the code; corner cases hide in prose; and organizations under pressure schedule "spec by RTL" — where the spec is reverse-engineered from the implementation, which is exactly when verification loses its oracle.

## 5. RTL design in practice

RTL is code, but a strange kind: it describes many small machines that all run at once, updated by a shared clock tick. In SystemVerilog, a **module** is a circuit unit with typed ports; **registers** (`reg`) hold values across ticks; **nonblocking assignments** (`<=`) say "compute with the old values of everyone, then update together at the edge" — which is how hardware actually behaves. A description is **synthesizable** when a synthesis tool can map it to gates; some legal SystemVerilog (delays, file I/O) is only for testbenches and cannot become a circuit.

**In everyday words.** RTL lists remembered values and the logic that computes their next values. Everything happens concurrently; the tick synchronizes updates.

**Concrete example.** A counter with an enable, the design from Demo A below:

```systemverilog
always @(posedge clk) begin
  if (!rst_n)
    count <= '0;          // reset dominates the tick
  else if (en)
    count <= count + 1'b1; // holds when en is low
end
```

Read it as: *at every rising edge of `clk`, if reset is active the count becomes zero; otherwise if `en` is high the count increments.* The order of `if`/`else if` is priority: reset beats enable. That priority is design intent, stated structurally.

**Datapath and control.** Most blocks split into a **datapath** (wide, regular structures that move and transform values — adders, multipliers, queues) and **control** (a finite-state machine, or **FSM**, that decides which datapath operations happen each tick). An FSM is a register holding a *state* plus logic computing the *next state* from inputs. The traffic-light machine in Demo A is the teaching version; real ones hide inside every block.

**Pipelines.** To run faster, designers split a long computation into **stages** separated by registers, so each tick a new item enters and (once full) one result leaves. Throughput rises; latency becomes stages × tick period; and the trade-off shows up as hardware — stage registers plus whatever the split requires. Chapter 9 returns to the timing arithmetic.

**Common idioms and their traps.** Reset a register and you get deterministic startup — skip it and the register powers up undefined (Demo A's "break it" toggle shows the waveform consequence; Volume 1's lifecycle chapter covers the physical side). Forgetting a branch in combinational `always` blocks makes the tool infer a **latch** — unintended storage. Using blocking assignments (`=`) for registers can make simulation disagree with the hardware. Width mismatches (`count + 1'b1` vs `count + 1`) quietly change semantics. Linters catch most of this; treat warnings as errors.

**What to remember.** RTL is a concurrency description read left-to-right as priority. Datapath + control + registers + reset + constraints equals a block. If the code cannot say what happens on a simultaneous event, the code is incomplete.

<!-- LAB-A -->

### How people do this today

**Workflow.** Designers write RTL against the microarchitecture doc, run lint and a quick synthesis smoke build on every commit, self-review with checklists (resets, widths, FSM defaults), and hand to DV with a test plan. The code-review culture of software engineering applies almost unchanged — the diff is just measured in gates.

**Tools.** SystemVerilog in ordinary editors or vendor IDEs; linters such as Spyglass, HAL, or Verilator's lint mode; simulators for smoke tests; Gerrit or GitHub-style review; IP libraries for standard blocks (memory controllers, PCIe, USB) licensed from vendors or built in-house.

**Pain points.** Style divergence between merged teams; "it passes simulation" mistaken for "it synthesizes sanely"; and reset/enable bugs, which remain the single most common first-silicon embarrassments.

## 6. Design for test and debug

A chip is a slab of silicon with no keyboard and no debugger. **Design for test (DFT)** is the discipline of adding structures *during design* so that manufacturing can test the finished chip and engineers can debug it. Designers add it early because retrofitting is close to impossible.

**In everyday words.** DFT builds hidden hatches into the circuit: a way to force values in, read values out, and check the wiring itself.

**Concrete example.** A **scan chain**: every flip-flop gets a second mode. In test mode, all registers in the chip connect end-to-end into one long shift register. A tester shifts a pattern in, lets the circuit compute for one tick, then shifts the results out and compares them to expectation. Suddenly internal state is reachable — controllability and observability, the two things a lab bench otherwise lacks.

**The main structures.** **ATPG** (automatic test pattern generation) is software that computes which patterns to shift through scan chains to expose manufacturing defects — broken wires, shorted transistors — with high coverage of possible physical faults. **Memory BIST** (built-in self-test) puts a tiny test sequencer next to every memory on the die: memories are dense and defect-prone, so they test themselves at power-on or during manufacturing test. **Logic BIST** does the same for random logic on chips that must self-test in the field (automotive is the classic customer). **Boundary scan** (the JTAG standard, IEEE 1149.1) adds a shift path around the chip's pins so boards can be tested after soldering. And **embedded logic analysis** structures — think a tiny on-chip oscilloscope or Volume 1's waveform capture — let bring-up engineers grab internal signal histories once the chip is running.

**Why verification people care.** DFT structures are themselves design blocks with their own RTL, constraints, and corner cases (test modes change clocks and resets). Manufacturing test then *uses* the promises from functional verification: production tests run the same firmware smoke suite plus scan patterns. Fab test economics drive design decisions: every second of tester time is real money at volume, so designers argue about pattern counts the way software teams argue about CI minutes.

**Limits.** Scan observes state at ticks, not analog behavior; BIST finds memory defects, not architectural bugs; test patterns prove manufacturing health, not that the design implements the spec. Those remain functional verification's job (Volume 1). And DFT costs area and power — typically a few percent of the die — and schedule time.

**What to remember.** Testability is a design requirement, not an afterthought. Scan for controllability, BIST for memories, JTAG for boards, embedded analysis for bring-up — and none of them prove the design does what the spec says.

### How people do this today

**Workflow.** A DFT architect sets the test strategy at RTL freeze-minus; scan insertion is an automated step inside synthesis; ATPG runs on the netlist and reports fault coverage; the foundry and test house review pattern counts and test time before tapeout.

**Tools.** TestMAX/Tessent-class DFT tools integrated with synthesis, ATPG engines, memory-compiler-generated BIST, JTAG controllers from IP vendors, and logic-analyzers-on-chip from the FPGA/ASIC debug tool ecosystem.

**Pain points.** Test-time cost at volume is fiercely negotiated; test-mode clocking interacts badly with power-management features if unplanned; and debug access is routinely under-designed until the first bring-up, when it is too late to change.

## 7. High-level synthesis

**High-level synthesis (HLS)** compiles C or C++ into RTL. You write the algorithm; the tool schedules operations into clock cycles, binds them to hardware units, and emits SystemVerilog you can then verify, synthesize, and place like hand-written RTL. The appeal is obvious to software engineers: algorithmic productivity in a familiar language.

**In everyday words.** HLS is a compiler whose backend emits circuits instead of machine code. Pragmas — special comment-lines like `#pragma HLS PIPELINE` — tell it how aggressively to parallelize.

**Concrete example.** Demo C below is eight adds: `c[i] = a[i] + b[i]`. Sequential baseline: one adder, eight loop passes. Unroll ×8: eight adders, one pass. Pipeline II=1: one adder processing one element per cycle. Same C; three different chips. The pragma is the design decision.

**What HLS does well.** Compute-dense blocks with regular loops — DSP filters, image pipelines, crypto, matrix kernels — where design space exploration matters: a tool can sweep unroll/pipeline/array-partition configurations faster than a human can write RTL variants. Productivity gains are real and repeatedly reported for these shapes of workloads. Datapath-heavy designs with modest control are the sweet spot.

**What HLS does badly — and the LLM twist.** Historically the output was the problem: HLS-generated RTL is machine-shaped, with tangled FSMs and signal names nobody can review, and its QoR (quality of results — area, timing, frequency) lagged hand-tuned RTL enough that engineers routinely spent weeks fixing pragmas and restructuring C to steer the tool. This "hand tuning" tax limited HLS to teams with specialists. What is changing in 2025–2026 is public research showing language models can help with exactly that tuning: benchmarks like HLS-Eval (94 designs, tasks like pragma insertion and HLS-specific refactoring, evaluated against Vitis HLS) and datasets like ForgeHLS (459,850 design variants from 846 kernels with pragma sweeps) give models measurable feedback loops — the HLS tool itself grades attempts, so search and fine-tuning work. In ForgeHLS, a fine-tuned 7B model's pragma-insertion pass rate rose from 19% to 69%. Earlier lines of work (C2HLSC, HLSPilot, LHS) showed LLMs refactoring C into HLS-legal forms and using synthesis feedback for latency/area trade-offs. Read this as: the tuning loop is being automated first, because it has cheap ground truth. It does not follow that HLS output is now reviewable or that human architecture choices are automated.

**What to remember.** HLS trades control for productivity on regular datapaths; pragmas are the steering wheel; the tuning loop is where LLMs are earning real, benchmarked gains this year. And the output is still silicon-bound RTL that needs the same verification as hand-written code.

<!-- LAB-C -->

### How people do this today

**Workflow.** Algorithm engineers write C++ and a golden C testbench; HLS specialists sweep pragmas and review tool reports; the emitted RTL goes through ordinary verification and implementation — often with a manual "RTL cleanup" pass for anything that will be maintained long-term.

**Tools.** AMD Vitis HLS, Siemens Catapult, Cadence Stratus; open-source options like PandA-Bambu and EPFL's Dynamatic for research and teaching; the vendor's own C-simulation and co-simulation for functional checking.

**Pain points.** QoR gaps versus hand RTL in control-heavy designs; unreadable generated code that is hard to debug in verification; and pragma search spaces that explode combinatorially — which is precisely why LLM-guided tuning is getting attention.

## 8. Formal verification at scale

**Formal verification** proves properties about a design by exploring its state space mathematically instead of running random tests. Volume 1 teaches the mechanics (assertions, assumptions, vacuity) from the verification side; this chapter is about where formal fits in a *design* flow and where it does not scale.

**In everyday words.** Simulation tries stories you thought of. Formal checks every possible story — under the assumptions you stated — within the limits of the state space it can actually explore.

**Concrete example.** Small blocks with crisp invariants are formal's home turf: "this arbiter never grants two requesters at once", "this FIFO never hangs: if input keeps offering and output keeps accepting, every word eventually leaves", "this packet engine never emits a duplicate or reordered flit". These are universal statements with short proofs over small state spaces. A design team writes them as the block's contract and runs proofs continuously alongside simulation.

**Why it explodes — width, then state.** Formal hardness comes from two separate places. First, arithmetic width. A 64-bit multiplier is purely combinational — it has no state at all — yet it is the classic hard case for proof engines. Its Boolean structure is enormous (thousands of partial-product and adder steps), and the blowup is provable: Bryant showed in 1986 that binary decision diagrams for multiplication grow exponentially with bit width under any variable ordering, and SAT solvers can grind indefinitely on multiplier equivalence without multiplier-specific reasoning. Second, sequential depth: every remembered bit doubles the reachable states to explore, and unrolling cycles into a SAT formula grows it with each added step. Big numerical datapaths, deep memories, and long pipelines defeat unbounded proofs by attacking both dimensions at once. Engineers respond by proving *small contracts* (interface properties, control FSMs) and leaving data-heavy behavior to simulation — a **hybrid flow**.

**Hybrid flows in practice.** Formal is used as a targeted superpower: connectivity checks (is every register driven? does every reset reach its loads?), bounded proofs on control slices, and "app" proofs on protocol blocks. Simulation and emulation carry the bulk. Formal also acts as a debug oracle: when a simulation failure is hard to reproduce, a formal tool can sometimes produce a minimal counterexample trace. Volume 1's formal chapter covers vacuity and assumption hygiene — the design-side lesson is complementary: pick properties that are *small and universal*, and be explicit about what you assumed.

**Limits.** A proof is only as good as the property set and assumptions — prove the wrong contract and you have a rigorous irrelevance. Unbounded proofs are rare past small blocks; bounded proofs say "no bug within N cycles", which is a different claim. And formal runs can take days or fail inconclusively — "unknown" is a real result.

**What to remember.** Formal wins on small blocks with crisp invariants; it loses to data width and state depth; mature flows use it surgically and rely on simulation for the rest. Never confuse "proven under assumptions" with "correct".

### How people do this today

**Workflow.** Block owners write interface properties at design time; a formal specialist triages which are unbounded-provable, which bounded; regression runs proofs nightly; counterexamples feed the same bug tracker as simulation failures.

**Tools.** JasperGold (Cadence), VC Formal (Synopsys), OneSpin (Siemens), and open-source solvers (Yosys + SymbiYosys) for small blocks; the tools' own debug viewers for counterexample traces.

**Pain points.** Compute cost and inconclusive runs; property-writing is a scarce skill; and the "assumption gap" — proofs that hold because assumptions quietly exclude the real workload.

## 9. Synthesis: RTL to gates

**Synthesis** is the compiler pass from RTL to a netlist of standard cells — the AND/OR/inverter/flip-flop building blocks of a specific foundry technology. Along the way it optimizes aggressively: constant propagation, logic sharing, restructuring for speed or area. It is where code becomes a cost model.

**In everyday words.** A synthesis tool reads your RTL and the foundry's cell library, and rewrites your logic as the cheapest/fastest network of real gates that behaves the same — judged against your constraints.

**Concrete example.** You wrote `count <= count + 1`. Synthesis sees a 32-bit incrementer and maps it to a chain of full adders plus 32 flip-flops from the library, each with a measured delay. Now the arithmetic is real: a carry that ripples through 32 bits has a measurable, possibly fatal, delay at your target clock.

**Constraints are the spec you give the tool.** A constraints file (industry-standard format: **SDC**, Synopsys Design Constraints) answers: what clocks exist and how fast; which paths between clock domains are intentionally asynchronous (**false paths**); which paths are allowed multiple cycles (**multicycle paths**); input/output delays at chip boundaries. Get constraints wrong and the tool optimizes the wrong thing — the classic failure is a "timing-clean" report that excluded the paths that actually matter. Constraints are code: reviewed, versioned, and a common source of silent bugs.

**Timing reports drive the loop.** Static timing analysis (STA) — covered with tools like PrimeTime or Tempus — computes, for every register-to-register path, whether data arrives before the next tick with margin (**slack**). Negative slack is a failing path. The design loop is then mechanical: read the worst paths, decide whether to fix by restructuring logic (shorten that path), pipelining (split it), or relaxing the constraint (if it is wrong). Chapter 10's physical effects feed the same loop with better delay numbers.

**What synthesis does not do.** It does not verify function (wrong RTL synthesizes beautifully). It does not know about wires until physical design annotates real wire delays. And its "quality" is a PPA triangle: you can have area, performance, or power — pick, or specify priorities in constraints.

**What to remember.** Synthesis is a constraint-driven compiler from behavior to gates. Timing reports are its error messages, and the design iterates against them. A wrong constraint is worse than a slow path.

### How people do this today

**Workflow.** Designers run cheap synthesis ("compile") per commit for sanity; full synthesis with real constraints runs nightly; weekly QoR reviews compare area/frequency/power against the budget table from chapter 4; failing paths get design changes or constraint fixes, never ignored.

**Tools.** Synopsys Design Compiler / Fusion Compiler, Cadence Genus, open-source Yosys for small blocks and teaching; STA with PrimeTime or Tempus; constraints in SDC held in version control.

**Pain points.** Constraint debt (wrong false paths discovered at signoff); QoR surprises when an IP block's estimates meet integration reality; and tool-runtime growth as designs scale.

## 10. Physical design

Physical design (**PD**) turns the netlist into physical layout: a floorplan positions blocks, placement assigns each standard cell a coordinate, clock tree synthesis (**CTS**) builds the distribution network that delivers the tick to every register at nearly the same time, and routing wires everything up. Then the layout is checked against the foundry's manufacturing rules and against the original netlist.

**In everyday words.** PD is the moving-crew-and-electrician phase: decide where every box sits, wire it, and prove the wiring matches the plan and the factory can build it.

**Concrete example.** **Clock skew**: if the tick reaches register A 30 picoseconds later than register B, data racing from A to B can violate setup or hold timing (Volume 1's clock chapter defines both). CTS exists to make those arrival times nearly equal across millions of registers. A poorly balanced clock tree can fail timing in ways no RTL change fixes — the fix is physical.

**The main stages.** *Floorplanning* allocates area to blocks and places memories and I/O pads — done well it matches the design's traffic patterns; done badly, routing congestion later forces block re-shapes. *Placement* and *routing* are enormous optimization problems (cells and nets in the millions) run by tools that cost more than most software budgets. *Parasitics extraction* then computes the real resistance and capacitance of every wire — and real wire delay is often most of the total path delay. *Signoff* re-runs timing with these real numbers and checks two physical rules every foundry enforces: **DRC** (design rule check — can this shape be manufactured?) and **LVS** (layout versus schematic — does the wiring match the netlist?). Only then does the design go to tapeout.

**Why PD bounces work back to RTL.** The pessimistic estimates of chapter 9 become real numbers, and the gap is where surprises live: a block that fit its timing budget in synthesis fails after extraction; a congested region forces cell movement that breaks clock balance; power delivery (**IR drop**) sags in a hot region and slows local gates. Each surprise is an **ECO** (engineering change order) — the industry verb for "controlled late patch" — and ECOs loop back through verification. This is chapter 3's forced rework, mechanized.

**What to remember.** Floorplan, place, clock tree, route, extract, verify against the fab's rules. Real wires dominate delay; clock balance is physics; and "signoff" is the promise that the layout can be manufactured and matches the verified netlist.

### How people do this today

**Workflow.** Implementation runs continuously on integration branches: floorplan early, incremental place-and-route after each RTL drop, timing closure sprints toward tapeout, with ECO loops between PD and design teams managed as a negotiation.

**Tools.** Synopsys Fusion Compiler / IC Compiler II, Cadence Innovus, Siemens Aprisa; signoff STA in PrimeTime; extraction with StarRC-class tools; physical verification with Calibre (Siemens), ICV (Synopsys) or Pegasus; IR/thermal analysis with RedHawk-class tools.

**Pain points.** Late ECO loops are the schedule killers; congestion discovered after placement; and the cost of compute — full-chip runs take days on large farms.

## 11. Tapeout and bring-up

**Tapeout** is the point of no return: the layout is frozen, converted to a GDSII stream file (the geometric database the mask shop consumes), and sent to the foundry. **Photomasks** — the optical stencils used to print each layer — are manufactured, wafers processed, dies packaged. Weeks to months later, physical chips return for **bring-up**: first power, first clock, first firmware.

**In everyday words.** Tapeout is shipping the design to the factory; bring-up is the unboxing where you find out what you actually made.

**Concrete example.** A university team wants a tiny 4 mm² chip on a mature 65 nm process. A full mask set would dwarf the project's budget — so they join a **multi-project wafer (MPW) shuttle**: a run shared by many designs, each paying for a slice of the shared mask. Public programs (MOSIS in the US, Europractice in Europe, CMC in Canada, foundry shuttles like TSMC's CyberShuttle) have served this model for decades; reported shuttle slot prices range from a few thousand dollars at mature nodes to $100,000+ at 7 nm, versus $0.8–1.5M for a full 28 nm mask set and $10–20M at 3 nm (public estimates — foundries do not publish prices). The open-source-silicon era added more access: Efabless's ChipIgnite offered ~$10k SkyWater-130nm runs until the company shut down in March 2025; Tiny Tapeout, which depended on it, continued through other fabs such as IHP. Access to silicon got cheaper, then partially contracted — the economics of chapter 14 in action.

**What happens when the chips come back.** Packaged parts land on a board. Bring-up engineers check power rails and clock generation first, then use the DFT hooks from chapter 6 (scan, JTAG, embedded logic analysis) to establish that the chip is alive and controllable, then run firmware and the specification's tests against real hardware. A **re-spin** — fixing the bug, new masks, new wafers — is the punishment for what bring-up finds. That is the orders-of-magnitude claim: a bug that needed a re-spin cost mask sets, fab time (months), packaging, and a delayed product; the same bug in RTL cost an edit. The 1x/10x/100x rule of thumb from chapter 1 exists because of this stage.

**What to remember.** Tapeout is irreversible spend; MPW shuttles are the affordable on-ramp; bring-up is where design promises meet physics; and everything in chapters 3–10 exists to make bring-up boring.

### How people do this today

**Workflow.** Tapeout week is a checklist ritual: frozen version hashes, signoff reports archived, foundry review meetings, GDSII checksums verified. Bring-up then runs as a planned campaign — power, clocks, scan test, JTAG enumeration, firmware smoke, then the full validation suite borrowed from pre-silicon verification.

**Tools.** Tapeout automation and stream-out utilities, mask-shop portals, board bring-up benches with scopes and power analyzers, ATE (automated test equipment) programs for manufacturing test, and the same waveform/trace tooling used in simulation, now fed by real hardware.

**Pain points.** The "silicon is back and nothing works" scenario — usually a reset, clock, or power-sequencing issue rather than deep logic; test-time cost per part at volume; and re-spin politics, since every re-spin re-litigates the project's business case.

## 12. Foundries and process nodes

A **foundry** is a factory that manufactures chips designed by other companies (the **fabless** model — most of the industry). A **process node** is the recipe: transistor structures, materials, design rules, and a **PDK** (process design kit) — the library of standard cells, models, and rule decks designers build against. Choosing where to manufacture is one of the most consequential and most opaque decisions in the business.

**In everyday words.** The foundry is the fab; the node is the recipe generation; the PDK is the recipe's API. Your chip is only as real as that API.

**The landscape today (public information).** TSMC is the dominant player: industry trackers put its foundry revenue share at about 72.5% in Q2 2026, with Samsung Foundry around 6%. Intel Foundry is investing heavily to catch up (its 18A-class process ramping primarily for Intel's own products, with external customers being a stated goal), and Rapidus in Japan targets 2nm-class production later this decade. The concentration is self-reinforcing: leading-edge capacity costs tens of billions in annual capital spending (TSMC's 2026 capex guide is public at roughly $60–64B), and only very high-volume demand justifies it.

**What "3nm" actually means.** Almost nothing physical. Node names stopped corresponding to any measurable transistor dimension around the 2000s; "3nm" is a generation label for a bundle of transistor innovations (FinFET transistors at older nodes, gate-all-around/nanosheet transistors at the newest), with real differentiators being transistor density, power, and the PDK's economics. Two foundries' same-named nodes are not equivalent. When someone says "we're on 3nm", parse it as "we're on a leading-edge generation", then ask about density and power, not the number.

**Pricing, honestly.** Foundries do not publish wafer or mask prices; numbers circulate via industry reporting. Publicly reported figures for 300 mm wafers cluster around $3,000 at 28 nm, ~$9,500 at 7 nm, ~$16–20k at 5 nm and 3 nm, and ~$30,000 at 2 nm (reported by Tom's Hardware and TrendForce; treat all as estimates). Mask sets run from roughly $1M at 28 nm to $10–20M at 3 nm. Demo D lets you play the arithmetic these figures feed.

**Why leading-edge access concentrates.** It is a capital, ecosystem, and yield problem at once: the fab costs billions, the PDK and IP ecosystem must be re-qualified every generation, and early yields on big leading-edge dies are the industry's most expensive open secret. Most chips in the world are not leading-edge — mature nodes (28 nm and older) carry enormous volume in analog, power, RF, microcontrollers, and automotive.

**What to remember.** Foundry choice is supply-chain strategy; node names are marketing; PDKs are the real interface; and the prices you see in public are estimates with error bars wider than most software budgets.

<!-- LAB-D -->

### How people do this today

**Workflow.** Companies pick a foundry relationship years ahead, tape in on shuttle runs first, then commit to full production; PDK updates are adopted deliberately (each one re-opens timing and DRC qualification); capacity and pricing are negotiated directly and under NDA.

**Tools.** The foundry's PDK and rule decks, signoff tools certified per PDK release, multi-vendor PPA comparison flows, and internal cost models far more detailed than Demo D.

**Pain points.** Capacity allocation during shortage (2020–2023 is still a vivid memory); PDK churn breaking qualified flows; and the single-source concentration risk that a72% market share implies.

## 13. Advanced packaging and chiplets

For decades, a chip meant one die. **Advanced packaging** breaks that assumption: multiple dies — **chiplets** — are assembled in one package, wired together on a **silicon interposer** (a thin silicon layer carrying fine wires, the "2.5D" style) or stacked ("3D"), with high-bandwidth memory (HBM) mounted alongside. The industry is disaggregating the monolith.

**In everyday words.** Chiplets are LEGO bricks of silicon: build small pieces separately, connect them in one package, and stop betting everything on one giant die.

**Concrete example.** A big AI accelerator exceeds the **reticle limit** — the maximum area (~800 mm²) a lithography scanner can print in one exposure. Splitting into four ~400 mm² compute chiplets plus memory stacks is not just possible; it is the standard answer. And Demo D's yield math explains why: yield falls exponentially with die area, so four small dies with good yield can beat one huge die with poor yield — at the cost of interconnect bandwidth and packaging complexity.

**The pieces.** *Interposers and bridges* carry the die-to-die wires; TSMC's CoWoS-class packaging is the best-known production example (and capacity for it became a bottleneck during the AI buildout). *HBM* stacks memory dies vertically beside the compute die for extreme bandwidth. *Die-to-die interfaces* are being standardized — UCIe (Universal Chiplet Interconnect Express) is the open standard consortium effort; vendors also have proprietary links. *OSATs* (outsourced assembly and test houses) and the foundries' own packaging lines do the assembly.

**Why the industry splits big dies.** Yield (above), economics (reuse: one I/O chiplet shared across products), incremental upgrades (swap one chiplet without re-taping the others), and the reticle limit itself. The trade-offs are real: die-to-die links consume power and area; thermal density rises; testing becomes a multi-die problem (known-good-die economics); and system verification now spans dies whose teams may not share a spec template.

**What to remember.** Disaggregation is a yield-and-economics decision as much as a technical one; interposers and standards like UCIe are the wiring; packaging has become a first-class design stage, not an afterthought.

### How people do this today

**Workflow.** Architecture decides the die partition early (it fixes floorplan and interfaces); chiplets are designed as separate projects with their own verification; assembly and test planning starts before tapeout; known-good-die screening is part of the cost model.

**Tools.** 3DIC-aware implementation flows (3DIC Compiler-class), package substrate design tools, HBM PHY IP, UCIe/proprietary die-link IP, and thermal/mechanical co-simulation.

**Pain points.** Known-good-die economics (a dead chiplet kills the package); thermal hotspots from stacked dies; and multi-vendor chiplet integration, where two dies verified separately must interoperate at speed.

## 14. The economics of custom silicon

Designing a chip is a bet: spend a large, fixed **NRE** (non-recurring engineering — the whole program: people, EDA licenses, IP, masks) to get a part that is cheaper, faster, or lower-power per unit at volume. The decision framework is arithmetic, and every software engineer who has done build-vs-buy already knows its shape.

**In everyday words.** Custom silicon is a fixed cost against a per-unit saving. Volume decides the argument.

**Concrete example.** From Demo D's model: a 100 mm² 5nm part with public-estimate midpoints might land around $15–25 in wafer cost per good die before packaging, against a program NRE in the tens of millions (complex leading-edge SoCs are reported far higher — $500M+ figures circulate for the largest). At 1M units, NRE adds tens of dollars per chip; at 100M units, pennies. The same chip is a bad idea and a great idea at different volumes — which is why "is this workload stable and large?" is the real question.

**When it makes sense.** Sustained, high volume (tens of millions of units is a common rule of thumb); stable algorithms (a frozen workload like video encode or inference serving); and per-unit value in power, performance, or cost that off-the-shelf parts cannot hit. When it does not: volatile requirements, small volumes, or workloads still moving — an FPGA or GPU stays flexible; many teams prototype on FPGA first and commit to ASIC only after the workload stabilizes.

**The vertical-integration wave (public information).** The clearest modern cases are the hyperscalers: AWS builds Graviton (CPU), Trainium (training) and Inferentia (inference); Google builds TPU; Microsoft has announced Maia (accelerator) and Cobalt (CPU); Meta has MTIA; Tesla builds its Dojo program. Startups attack the same logic from the other side — Groq, Cerebras, Tenstorrent, Etched and many others pursue workload-specific accelerators. The pattern is uniform: when a workload is enormous and stable (serving models, transcoding, networking), owning the silicon captures value that merchant chips leave on the table. Public product claims here are vendor claims, not benchmarks.

**What to remember.** NRE is fixed; savings are per-unit; volume and stability of the workload decide. The industry's vertical-integration trend is this arithmetic applied to the largest workloads on earth.

### How people do this today

**Workflow.** Product and finance teams model NRE, wafer and packaging cost, and volume scenarios; architecture does a "make vs buy vs FPGA" review; programs typically gate silicon commitment on workload evidence, then run one shuttle before volume commitment.

**Tools.** Internal cost models (Demo D's shape, with more detail), vendor IP catalogs and licensing quotes, FPGA prototyping boards, and spreadsheet scenarios — the decision tool of record is usually a spreadsheet.

**Pain points.** Optimistic volume forecasts inflating the business case; NRE creep from IP and verification; and schedule slip, which pushes revenue right without pushing NRE left.

## 15. AI in the loop today

This chapter is a status check, not a forecast: where AI tools actually help chip teams *right now*, with every performance number attributed to whoever claimed it. The honest frame: EDA is a unusually good domain for AI agents because outputs can be graded by real tools — compilers accept or reject RTL, simulators pass or fail, timing reports contain numbers. Claims in this space are testable in principle; the question is which have been tested in public.

**In everyday words.** AI has moved from autocomplete on RTL to long-running agent workflows that the big EDA vendors are shipping into evaluation. The demo-vs-deployed line is the whole story.

**What the big EDA vendors have announced (public, 2026).** Synopsys announced its AgentEngineer portfolio and Autopilot orchestration platform in September 2026 — long-running agents across verification, implementation, analog, manufacturing and simulation — reporting 50+ customer engagements, with general availability planned for the end of 2026 and a stated model of human-defined guardrails. At DAC 2026 it demoed a fully autonomous design-verification workflow claiming "up to 50x faster time-to-validated RTL" and +20% coverage *versus its own stated baseline* (workflows without AgentEngineer, with NVIDIA), plus autonomous debug/implementation workflows on Microsoft Discovery with AMD evaluating, reporting 25–40% debug-cycle-time reduction in early evaluation. Cadence presented its Super Agent portfolio — ChipStack (verification), ViraStack (custom/analog), InnoStack (implementation), AuraStack (PCB/packaging) under the AgentStack orchestration framework — with ChipStack "Level 5" in early access for H2 2026 and a 40x RTL-validation claim from a Computex demo on selected production blocks. Siemens announced self-verifying agents in its Fuse EDA AI Agent system and characterization speedups for Solido. These are vendor announcements with vendor-chosen baselines; none were generally available at announcement time, and independent comparisons do not yet exist.

**Research: generation and tuning.** The public research record is broad: RTL generation benchmarks (VerilogEval, RTLLM) and open datasets/models (RTLCoder, RTLFixer for build-failure repair) show LLMs can produce working small RTL; HLS-side work (C2HLSC, HLSPilot, LHS, HLS-Eval, ForgeHLS — chapter 7) shows models improving pragma tuning when a tool provides the reward signal. The consistent finding across this literature: performance is strongest on small, well-specified blocks, collapses on large or vague tasks, and improves most when the model sits in a loop with real EDA tools. That is an engineering result, not a revolution: the loop does the checking.

**Demo vs deployed — a candid scoreboard.** *Deployed in everyday work:* lint triage, log and regression analysis, code search and summarization, documentation, test-plan drafting. *In evaluation/early access:* the agentic verification and closure workflows above, vendor copilots embedded in tools. *Research:* end-to-end RTL generation from natural language, autonomous architecture exploration. The gap between a Computex demo and a tapeout that relies on the tool is where honesty lives: nobody has published a first-pass-silicon success-rate comparison between AI-assisted and conventional teams — and chapter 3's numbers say first-pass success is the metric that matters.

**What to remember.** AI is genuinely helping at the edges of the flow today; agentic claims are vendor-stated, scoped to chosen baselines, and not yet deployed generally; and the durable pattern is model-plus-tool-loop, with the tool holding the ground truth. When you evaluate a claim, ask: measured on what, compared to what, and did anything tape out?

### How people do this today

**Workflow.** Teams pilot AI features on non-critical blocks first, measure against their own baselines (debug time, closure time), and keep human signoff on anything that reaches silicon. The serious internal work is data plumbing: making design history, waveforms, and regressions queryable enough for tools to learn from.

**Tools.** The vendors' copilots and agent platforms (above), code-focused LLMs for RTL drafts inside the ordinary review loop, and internal RAG/search over design docs and bug history. Evaluation harnesses are usually homegrown.

**Pain points.** Unverifiable vendor multipliers; IP confidentiality blocking training data; hallucinated RTL that looks plausible in review; and the measurement gap — few teams have baselined their own flow well enough to know if a tool helped.

## Glossary and a final review checklist

Plain words first, jargon second. Every entry is one line of meaning plus one tiny example. Terms with deeper treatment link to their chapter; verification mechanics live in [Volume 1](../chip-verification-textbook/).

**Chip.** A manufactured electrical circuit with millions to billions of transistors. Example: the processor in your phone.

**Transistor.** A tiny electrically controlled switch. Example: billions of them wired into logic and memory on one die.

**Die.** One chip's rectangle of silicon, cut from a wafer. Example: a 100 mm² die holds the whole design.

**Wafer.** A thin disc of silicon that many dies are printed on together. Example: a 300 mm wafer carries dozens of large dies or thousands of small ones.

**Spec (specification).** The written promise of what the chip does externally. Example: "accepts one word every 40 μs, in order".

**Microarchitecture.** The internal plan for keeping the spec's promises. Example: "a 4-deep queue feeding a 3-stage pipeline".

**RTL (register-transfer level).** A code style describing remembered values and how they update each clock tick. Example: `count <= count + 1'b1`.

**HDL (hardware description language).** The programming language family for circuits. Example: SystemVerilog is the mainstream one for digital design.

**SystemVerilog.** The mainstream HDL and verification language. Example: `always @(posedge clk)` blocks describe tick-driven behavior.

**Module.** A circuit unit with ports, like a function with wires. Example: `counter_en` with clk, rst_n, en, count ports.

**Port.** A wire entering or leaving a module. Example: `en` is an input that enables counting.

**Register.** A value remembered across clock ticks. Example: the count in a counter.

**Flip-flop.** The standard one-bit register element. Example: 32 flip-flops hold a 32-bit counter.

**Latch.** Unintended storage inferred when a combinational block misses a branch. Example: a missing `else` that silently holds the old value.

**Combinational logic.** Output determined by current inputs only. Example: an adder's sum bits.

**Sequential logic.** Output that depends on remembered state. Example: a counter.

**Clock.** The shared tick that synchronizes updates. Example: a 1 GHz clock ticks a billion times a second.

**Clock edge.** The tick's instant of sampling and updating. Example: `posedge clk` is the rising edge.

**Reset.** A signal that forces known starting values. Example: `rst_n` active low puts count at zero.

**Nonblocking assignment (`<=`).** "Update together at the edge, using old values." Example: two registers swap values correctly in one tick.

**Synthesizable.** RTL describable as real gates. Example: the counter is; `#10` delays are not — those are testbench-only.

**Datapath.** The wide, regular part that moves and transforms values. Example: an 8-way adder array.

**Control (FSM).** The state machine deciding what happens each tick. Example: a traffic light cycling G → Y → R.

**FSM (finite-state machine).** A register of state plus next-state logic. Example: idle → load → done.

**Pipeline.** Computation split into stages separated by registers for throughput. Example: a 3-stage pipeline emits one result per tick.

**Stage.** One pipeline segment. Example: decode is stage 2 of 3.

**Latency.** Ticks from input to its result. Example: 3-stage pipeline at 1 ns/tick has 3 ns latency.

**Throughput.** Results per unit time. Example: one result per tick.

**Initiation interval (II).** Cycles between accepting new work (HLS/pipeline term). Example: II=1 accepts one element per cycle.

**Ready/valid.** A handshake protocol for transferring data. Example: transfer happens when both `valid` and `ready` are high at the edge.

**FIFO (first in, first out).** A queue in hardware. Example: a 4-deep buffer between producer and consumer.

**Backpressure.** A receiver slowing a sender via the handshake. Example: `ready` low holds the producer's word.

**Interface.** The wires and rules connecting two units. Example: a bus with request and response channels.

**IP (intellectual property block).** A licensed pre-built design block. Example: a PCIe controller you buy rather than write.

**Bus.** Shared wires carrying multiple kinds of traffic. Example: request, address, data, response channels.

**SoC (system on chip).** A chip combining CPU, memory, I/O and accelerators. Example: a phone application processor.

**Microcontroller.** A small CPU-plus-peripherals chip for control tasks. Example: the chip in a washing machine.

**Synthesis.** Compiling RTL into gates from a library. Example: `count + 1` becomes a carry chain of standard cells.

**Netlist.** The synthesized network of gates and flip-flops. Example: 12,000 cells implementing the block.

**Standard cell.** A pre-designed logic gate from the foundry library. Example: a 2-input NAND with known delay.

**Library.** The catalog of standard cells with their timing and power data. Example: the 5nm library your PDK ships.

**Constraint.** Instructions to synthesis about clocks and allowed exceptions. Example: "target 1 GHz, but this debug path may be slow".

**SDC (Synopsys Design Constraints).** The standard constraint file format. Example: `create_clock -period 1.0` declares a 1 GHz clock.

**False path.** A path intentionally excluded from timing analysis. Example: two unrelated clocks crossing through a synchronizer.

**Multicycle path.** A path allowed more than one tick. Example: a slow result consumed two cycles later.

**Critical path.** The slowest path deciding the maximum clock. Example: a 32-bit carry chain sets the frequency ceiling.

**Slack.** Timing margin on a path; negative means failing. Example: -0.2 ns slack must be fixed before tapeout.

**STA (static timing analysis).** Checking every path's arrival time without running vectors. Example: PrimeTime reports every failing path.

**PPA.** Power, performance, area — the design trade triangle. Example: clocking faster costs power and area.

**Frequency.** The clock rate a design achieves. Example: closing timing at 2 GHz.

**Setup time.** Data must be stable before the sampling edge. Example: Volume 1's timing chapter.

**Hold time.** Data must stay stable just after the edge. Example: violated when a fast path races the clock.

**Clock skew.** Different arrival times of the same tick. Example: register A gets the tick 30 ps later than B.

**Clock tree.** The distribution network delivering the tick evenly. Example: a balanced tree of buffers.

**Pipeline register.** A register inserted to split a long path. Example: cutting a 2 ns path into two 1 ns halves.

**Floorplan.** Deciding where blocks and memories sit on the die. Example: memories along the edge nearest their I/O.

**Placement.** Assigning each standard cell a coordinate. Example: cells of one block clustered to shorten wires.

**Routing.** Creating the wires between cells. Example: a router solves millions of connections across metal layers.

**Congestion.** More wires demanded than a region can route. Example: 120% demand over a macro forces re-floorplanning.

**Parasitics.** Real resistance and capacitance of manufactured wires. Example: a long wire adds 15 ps of delay.

**Extraction.** Computing parasitics from the layout. Example: StarRC-class tools annotate real wire delays.

**DRC (design rule check).** Checking shapes against the fab's manufacturing rules. Example: minimum metal spacing violations.

**LVS (layout versus schematic).** Checking that the layout's wiring matches the netlist. Example: a missing via is caught here.

**Signoff.** The final proof set before tapeout. Example: timing, DRC, LVS all clean on the frozen version.

**ECO (engineering change order).** A controlled late patch. Example: swapping one gate after timing analysis, re-verified narrowly.

**Power gating.** Turning off a block's power when idle. Example: a sleeping radio block draws leakage only.

**Clock gating.** Stopping a block's clock when idle. Example: reduces switching power on an idle datapath.

**Leakage power.** Power drawn even when nothing switches. Example: a modern SoC's baseline draw at idle.

**Dynamic power.** Power from transistors switching. Example: a busy GPU's power scales with activity.

**IR drop.** Voltage sag through the power grid under load. Example: a hot region's gates slow down from lower voltage.

**DFT (design for test).** Design-time structures for manufacturing test and debug. Example: scan chains added to every register.

**Scan chain.** Registers linked into a shift path for testing. Example: shift a pattern in, tick once, shift results out.

**ATPG (automatic test pattern generation).** Software computing manufacturing-test patterns. Example: patterns achieving 98% stuck-at fault coverage.

**BIST (built-in self-test).** On-chip test sequencers. Example: memory BIST runs at power-on.

**JTAG.** The boundary-scan standard (IEEE 1149.1) for board-level test. Example: a board tests its solder joints through JTAG.

**Observability.** Ability to see internal state. Example: embedded logic analysis captures internal waveforms.

**Controllability.** Ability to set internal state. Example: scan lets a tester drive any register value.

**Bring-up.** First power-on and debug of real chips. Example: checking power rails before any firmware runs.

**Tapeout.** Freezing and sending the layout to the foundry. Example: GDSII stream-out is the final artifact.

**GDSII.** The geometric database the mask shop reads. Example: the frozen layout, checksummed and archived.

**Mask / reticle.** The optical stencil set used to print a layer. Example: a 3nm mask set runs 85–100 masks.

**MPW (multi-project wafer).** A shuttle run sharing one mask set among many designs. Example: a $20k slot versus a $1M full mask set.

**Re-spin.** Making new masks to fix a bug. Example: the same fix that cost 1x in RTL costs ~100x here (rule of thumb).

**First-pass silicon success.** First manufactured chips work without a re-spin. Example: the 2026 Wilson/Siemens study reports 5% of surveyed IC/ASIC projects.

**Foundry.** A factory manufacturing others' chips. Example: TSMC, Samsung, Intel Foundry.

**Fabless.** A company designing but not manufacturing chips. Example: most of the industry's chip designers.

**IDM (integrated device manufacturer).** A company that both designs and fabricates. Example: Intel historically, in part.

**PDK (process design kit).** The foundry's design API: cells, models, rules. Example: the SkyWater 130nm open PDK.

**Process node.** A recipe generation, named by marketing. Example: "3nm" is a generation label, not a dimension.

**FinFET.** The 3D transistor shape used from ~2010s nodes. Example: the fin structure in 7nm-class processes.

**GAA (gate-all-around).** The newest transistor shape (nanosheets). Example: 2nm-class processes.

**EUV (extreme ultraviolet lithography).** The newest printing light source. Example: critical layers at 5nm and below.

**Yield.** Fraction of dies that work. Example: 70% yield means 7 of 10 dies are good.

**Defect density.** Manufacturing defects per unit area. Example: Demo D's Poisson model input.

**NRE (non-recurring engineering).** One-time program cost before volume. Example: people, EDA tools, IP, masks.

**Wafer price.** What the foundry charges per wafer. Example: publicly reported ~$20k at 3nm — estimates only.

**Cost per good die.** Wafer cost divided by working dies. Example: Demo D computes it live.

**Chiplet.** One of several dies assembled in one package. Example: a compute chiplet plus an I/O chiplet.

**Interposer.** A silicon layer wiring dies together in one package. Example: TSMC CoWoS-class 2.5D assembly.

**HBM (high-bandwidth memory).** Stacked memory dies beside the compute die. Example: AI accelerators pair compute chiplets with HBM stacks.

**UCIe.** The open die-to-die interconnect standard for chiplets. Example: two vendors' chiplets speaking one link.

**2.5D / 3D packaging.** Dies side-by-side on an interposer / stacked vertically. Example: HBM is 3D; GPU+HBM is 2.5D.

**OSAT.** Outsourced assembly-and-test house. Example: packaging partners alongside the fab.

**Reticle limit.** Largest area one lithography exposure prints (~800 mm²). Example: bigger designs must split into chiplets.

**HLS (high-level synthesis).** Compiling C/C++ into RTL. Example: a FIR filter written as a C loop.

**Pragma.** A directive steering HLS. Example: `#pragma HLS PIPELINE II=1`.

**Loop unrolling.** Replicating loop body hardware for parallelism. Example: unroll ×8 → eight adders.

**Array partitioning.** Splitting a C array into parallel memory banks. Example: two banks feed two unrolled lanes.

**QoR (quality of results).** Measured area/timing/power of a generated design. Example: HLS QoR versus hand RTL.

**Formal verification.** Proving properties over all reachable states. Example: "the arbiter never grants two winners at once".

**Invariant.** A property that must hold in every state. Example: "occupancy never exceeds depth".

**State space.** All possible states a design can reach. Example: grows exponentially with register count.

**Vacuity.** A property passing because its trigger never happened. Example: Volume 1's formal chapter.

**Assertion.** A statement of expected behavior checked by tools. Example: `assert (count <= 4)` at every edge.

**Lint.** Static style and sanity checking of code. Example: width-mismatch warnings before any simulation.

**CDC (clock domain crossing).** Safe transfer between different clocks. Example: Volume 1's pulse-loss lab.

**FPGA.** A reprogrammable chip for prototyping or low-volume products. Example: verify the design before committing to an ASIC.

**Emulation.** Running the design on specialized fast hardware. Example: booting firmware pre-silicon.

**Simulation.** Running the design as a software model. Example: Volume 1's whole subject.

**Testbench.** Harness that drives and checks a design. Example: the producer/consumer scripts of Volume 1.

**Checker.** Independent logic comparing behavior to the contract. Example: the FIFO ordering checker in Volume 1.

**Re-spin risk.** The business risk of needing new masks. Example: chapter 3's first-pass statistics.

**Rule of thumb.** A teaching estimate with no precision guarantee. Example: the 1x/10x/100x cost ladder.

### Final review checklist

You have finished Volume 2 when you can, without looking back:

1. Draw the spec-to-silicon pipeline and name one artifact and one cost-of-error at each stage.
2. Explain why first-pass silicon success is rare, with the survey figures and their caveats attached.
3. Read a five-line SystemVerilog counter and say which values are remembered, which logic is combinational, and what the reset does at which edge.
4. Describe what scan chains, memory BIST, and JTAG each give you — and what none of them prove.
5. Say what HLS pragmas do (unroll, pipeline, array partition), name one workload where HLS shines and one where it struggles, and cite one public LLM-for-HLS result with its actual number.
6. Name three invariants formal can prove on a small block and explain why a 64-bit multiplier defeats it.
7. Interpret "negative slack on a register-to-register path" and name the three responses: restructure, pipeline, or fix the constraint.
8. List the physical-design stages and explain why real wire delay and clock skew bounce work back to RTL.
9. Explain an MPW shuttle and give the rough public cost difference between a shuttle slot and a full mask set.
10. Say what "3nm" actually means, and why it is not a dimension.
11. Use Demo D's arithmetic to argue for or against a custom chip at a stated volume.
12. Distinguish a vendor's agentic-EDA claim from a deployed, independently measured result — and say which is which for at least two announcements.

## Sources and evidence boundaries

This book uses only public sources. Labels below mark the evidence class of each claim: [primary] vendor or consortium's own announcement; [press] industry reporting of third-party data; [research] public papers; [standard] formal specifications; [open] open-source project docs; [estimate] widely-circulated figures with wide error bars; [rule of thumb] teaching folklore, not measurement. Nothing here comes from private sources, NDA material, or company-internal strategy.

**First-pass success and team dynamics.**
[press] SemiEngineering, ["First-Time Silicon Success Plummets"](https://semiengineering.com/first-time-silicon-success-plummets/) and ["Tape-Out Failures Are The Tip Of The Iceberg"](https://semiengineering.com/tape-out-failures-are-the-tip-of-the-iceberg/) — reports of the 2024 Siemens EDA / Wilson Research Group Functional Verification Study (14% first-silicon success; historically ~30%; 75% of projects behind schedule), quoting Harry Foster. [primary] [2024 study video series](https://verificationacademy.com/topics/planning-measurement-and-analysis/2024-siemens-eda-and-wilson-research-group-functional-verification-study/) on Siemens Verification Academy. [press] The 2026 study figures (5% first-silicon success for surveyed IC/ASIC projects; logic/functional errors still the primary cause of respins) are reported from Foster's September 2026 analysis via [secondary coverage](https://alpinumconsulting.com/blogs/verification/first-silicon-success-soc-use-case-verification/). Caveat carried in chapter 3: the survey's recruitment changed in 2024; the metric is project self-report; no study traces individual bugs to origin stages.

**Foundries, nodes, wafer and mask costs.** [press] Foundry-share figures (TSMC ~72.5%, Samsung ~5.9%, Q2 2026) are TrendForce data as reported in industry coverage, e.g. [TSMC vs Samsung, 2Q26](https://www.neoteo.com/en/tsmc-widens-its-foundry-lead-over-samsung). [press] [TSMC 2nm wafer price reporting](https://tech-insider.org/ca/tsmc-2nm-wafer-price-2026/) (Tom's Hardware / TrendForce figures: N2 ~$30k, N3 $18–20k, N5 ~$16k). [estimate] Mask-set and NRE ranges (28nm $0.8–1.5M masks / 3nm $10–20M; program NRE figures in Demo D) are public cost-model compilations citing IBS-style estimates, e.g. [photomask supply-chain overview](https://semiconductorx.com/semiconductor-photomasks.html) and [foundry engagement guide](https://siliconanalysts.com/guide/foundry-engagement); foundries do not publish prices and every such figure should be treated as ±50% or worse.

**Tapeout, MPW, bring-up.** [press] [Tiny Tapeout on the Efabless shutdown](https://tinytapeout.com/news/efabless-shutsdown/) (March 2025; ChipIgnite ~$10k SkyWater-130nm; IHP continuity). [open] Shuttle programs: [MOSIS](https://www.mosis.com/), [Europractice](https://europractice-ic.com/), foundry CyberShuttle programs. [rule of thumb] The 1x / 10x / 100x cost-of-escape ladder is industry folklore used for teaching and planning; it is not a measured price from any published project.

**EDA tools and flows.** [open] [Verilator](https://verilator.org/guide/latest/overview.html), [Yosys](https://yosyshq.net/yosys/), [OpenROAD](https://theopenroadproject.org/), [KLayout](https://www.klayout.de/), [SkyWater PDK](https://github.com/google/skywater-pdk). Vendor tools named in the "today" boxes (Synopsys, Cadence, Siemens product names) are public product names, used here descriptively without endorsement or private knowledge. [standard] IEEE 1149.1 (JTAG, boundary scan); SDC is the public constraint-format convention.

**HLS and LLM research.** [research] [HLS-Eval (arXiv:2504.12268)](https://arxiv.org/abs/2504.12268) — 94-design LLM-for-HLS benchmark with Vitis HLS integration. [research] [ForgeHLS (arXiv:2507.03255v3)](https://arxiv.org/html/2507.03255v3) — 459,850-design dataset (846 kernels); LoRA-tuned LLaMA3-7B pragma pass rate 19% → 69%. [research] Named lines of work C2HLSC, HLSPilot, LHS, RTLCoder, RTLFixer, VerilogEval and RTLLM are public papers/benchmarks; the survey by Abu-Karam/Hao-class work and the 2025 spec-to-RTL survey literature bound the claims in chapters 7 and 15. [research] R. E. Bryant, "Graph-Based Algorithms for Boolean Function Manipulation" (IEEE Transactions on Computers, 1986) — the classic result that BDDs for multiplication grow exponentially with bit width, cited in chapter 8.

**Agentic EDA announcements (2026).** [primary] Synopsys: [AgentEngineer and Autopilot, 28 Sep 2026](https://news.synopsys.com/2026-09-28-Synopsys-Powers-Autonomous-Engineering-with-a-Broad-Portfolio-of-Long-Horizon-Agents-and-Autopilot-Platform) and [Synopsys–TSMC agentic collaboration, 23 Sep 2026](https://news.synopsys.com/2026-09-23-Synopsys-and-TSMC-Partner-to-Accelerate-AI-Systems-Innovation-with-Agentic-AI-and-Advanced-Design). [primary] Cadence Super Agents (ChipStack/ViraStack/InnoStack/AuraStack/AgentStack) and Siemens Fuse EDA AI Agent / Solido announcements, per vendor keynotes at CadenceLIVE and DAC 2026. [press] Announced figures ("up to 50x time-to-validated RTL", "+20% coverage", "25–40% debug-cycle-time reduction", "40x RTL validation on selected blocks") are vendor claims against vendor-chosen baselines, as summarized in [analyst coverage](https://futurumgroup.com/insights/synopsys-cadence-and-siemens-take-agentic-chip-design-autonomous-at-dac/) and [technical press](https://nerdleveltech.com/autonomous-chip-design-agents-synopsys-cadence-siemens); none were generally available at announcement and no independent comparison exists. Chapter 15's demo-vs-deployed distinctions are this book's reading of those public announcements.

**What this book is not.** Not a vendor benchmark, not a cost quote, not tapeout advice for a real program, and not a claim about any company's internal processes. The four demos are deterministic teaching models with disclosed simplifications (see each demo's limits note). Where numbers appear without a bracketed label above, treat them as textbook arithmetic, not world data.
