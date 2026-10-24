// Pure teaching models for the design lab. No provider or customer data is used.
export const PRESETS = Object.freeze({
  support: { effect: "write", risk: "high", path: "known", freshness: "live" },
  code: { effect: "write", risk: "moderate", path: "open", freshness: "live" },
  evidence: { effect: "read", risk: "high", path: "known", freshness: "static" },
  gateway: { effect: "read", risk: "moderate", path: "known", freshness: "live" },
  disaster: { effect: "read", risk: "high", path: "known", freshness: "live" },
  port: { effect: "write", risk: "high", path: "known", freshness: "live" },
  security: { effect: "write", risk: "high", path: "open", freshness: "live" },
  voice: { effect: "write", risk: "high", path: "known", freshness: "live" },
});

const CHAPTER = Object.freeze({ support: 14, code: 15, evidence: 16, gateway: 17, disaster: 18, port: 19, security: 20, voice: 21 });
const TESTS = Object.freeze({
  support: "Ownership mismatch, policy change, duplicate refund, and a timeout after commit.",
  code: "Hidden tests, a malicious README, flaky baselines, and restart during a test run.",
  evidence: "Passage recall, ACL/revocation, amendments, citation support, and abstention.",
  gateway: "Paired task quality, quota pressure, cache isolation, and mid-stream provider failure.",
  disaster: "As-of replay, rare-event precision, sensor outage, lead time, and operator load.",
  port: "Hard-constraint feasibility, stale approval, concurrent ETA changes, and partial publication.",
  security: "Poisoned logs, target identity, unauthorized containment attempts, and reviewer load.",
  voice: "Noisy entity correction, barge-in during tools, unknown write, and human handoff.",
});

export function recommendArchitecture({ scenario, effect, risk, path, freshness }) {
  if (!Object.hasOwn(PRESETS, scenario) || !["read", "write"].includes(effect) ||
      !["moderate", "high"].includes(risk) || !["known", "open"].includes(path) ||
      !["static", "live"].includes(freshness)) {
    throw new RangeError("Unknown architecture constraint");
  }

  let title;
  let reason;
  switch (scenario) {
    case "disaster":
      title = "Calibrated prediction + alert policy";
      reason = "The difficult part is base-rate-aware prediction and response capacity. Start with threshold/statistical baselines; a model may explain evidence but should not independently broadcast an alert.";
      break;
    case "port":
      title = "Constraint solver + versioned dispatch";
      reason = "Safety and berth compatibility are hard constraints; the model can parse disruptions and explain a feasible plan. A free-form agent is not a scheduling certificate.";
      break;
    case "gateway":
      title = "Typed adapter + eval-backed router";
      reason = "Begin with one measured adapter. Add routing, quotas, and failover only when workloads justify it; the gateway never grants business permissions.";
      break;
    case "evidence":
      title = path === "open" ? "Bounded research agent + permissioned retrieval" : "Permissioned retrieval + typed extraction";
      reason = "The value comes from authorized, fresh, verifiable passages. Use a bounded search loop only when the evidence path cannot be pre-enumerated.";
      break;
    case "code":
      title = path === "open" ? "Sandboxed, bounded coding agent" : "Scripted patch workflow + tests";
      reason = "Unknown file paths justify a search-and-edit loop; known repetitive edits can use a simpler workflow. Executed tests and a reviewed diff are the proof.";
      break;
    case "voice":
      title = "Turn controller + scoped action workflow";
      reason = "Speech uncertainty and interruption change the control plane. Keep confirmation and committed transactions separate from provisional audio.";
      break;
    case "security":
      title = "Evidence triage + approval-gated controller";
      reason = "Investigation may be open-ended; containment authority must remain in a narrow, independently checked service.";
      break;
    default:
      title = effect === "read" ? "Authenticated read + policy retrieval" :
        path === "open" ? "Bounded agent inside an action workflow" : "Explicit workflow + domain policy";
      reason = effect === "read" ?
        "A read-only assistant can begin with authorized lookup and evidence-backed explanation; no action agent is required." :
        "Language judgment helps understand the request. Domain code, approvals, and receipts own the world-changing transition.";
  }

  const data = freshness === "live" ?
    "Read the authoritative service at decision/action time; record the source version and do not treat a cached summary as current state." :
    "Use versioned sources with tenant ACL at retrieval and fetch time; preserve source spans and effective dates.";
  const gate = effect === "read" ?
    "Read-only tools still enforce principal, tenant, and object permissions; do not expose a write capability." :
    risk === "high" ?
      "Exact-payload approval (often human), fresh policy/ownership check, idempotent commit, receipt, and UNKNOWN reconciliation." :
      "Server-side policy, explicit confirmation where needed, idempotent commit and receipt; escalate when authority is uncertain.";
  const test = TESTS[scenario] + (effect === "write" ? " Inspect external postconditions, not only the final text." : " Include unauthorized decoy sources.");
  return { title, reason, data, gate, test, chapter: CHAPTER[scenario] };
}

// Bounds keep user-entered values finite and arithmetic within safe integer scale.
const LIMITS = Object.freeze({
  sessions: 10_000_000, calls: 100, peakPercent: 100, meanSeconds: 3600,
  inputTokens: 1_000_000, outputTokens: 1_000_000,
  inputPrice: 1000, outputPrice: 1000,
  stablePercent: 100, hitPercent: 100, cacheFactorPercent: 100,
});

export function calculateCapacity(values) {
  for (const [name, max] of Object.entries(LIMITS)) {
    const value = values[name];
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > max) {
      throw new RangeError(`${name} must be a finite number between 0 and ${max}`);
    }
  }
  const callsPerDay = values.sessions * values.calls;
  const peakRps = callsPerDay * (values.peakPercent / 100) / 3600;
  const inputMultiplier = 1 - (values.stablePercent / 100) * (values.hitPercent / 100) * (1 - values.cacheFactorPercent / 100);
  const costPerCall = (values.inputTokens * inputMultiplier * values.inputPrice + values.outputTokens * values.outputPrice) / 1_000_000;
  const dailyCost = callsPerDay * costPerCall;
  const result = {
    callsPerDay, peakRps, meanConcurrency: peakRps * values.meanSeconds,
    inputTPM: peakRps * values.inputTokens * 60,
    outputTPM: peakRps * values.outputTokens * 60,
    inputMultiplier, costPerCall, dailyCost, monthlyCost: dailyCost * 30,
  };
  if (Object.values(result).some(value => !Number.isSafeInteger(Math.trunc(value)))) {
    throw new RangeError("Result is too large to display safely");
  }
  return result;
}
