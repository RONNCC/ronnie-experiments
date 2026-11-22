/**
 * Startup equity offer calculator: pure math, no DOM.
 *
 * Model in one paragraph: a grant (shares, percent, or dollar value) sits on a
 * fully diluted cap table. Each future round sells new preferred shares
 * (raise / post-money of the company) and may top up the option pool inside
 * the pre-money, both of which dilute every existing holder. At exit, a
 * liquidation waterfall pays preferred holders first (1x by default,
 * non-participating unless told otherwise, all series pari passu); each
 * non-participating series converts to common when that pays it more. What
 * is left per common share, minus your strike for options, times your vested
 * shares, is your pre-tax payout.
 *
 * Everything here is deterministic and covered by tests/logic.test.mjs.
 */

export const MAX_ROUNDS = 6;

/* ------------------------------------------------------------------ *
 * Parsing and formatting
 * ------------------------------------------------------------------ */

const SUFFIX = { k: 1e3, m: 1e6, mm: 1e6, b: 1e9, bn: 1e9, t: 1e12 };

/**
 * Parse loose human input: "1,234", "$1.2M", "62m", "500k", "1.5bn", "12%".
 * Returns NaN for anything that is not a single finite number.
 */
export function parseAmount(raw) {
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : NaN;
  if (raw == null) return NaN;
  const cleaned = String(raw).trim().toLowerCase().replace(/[$,\s_]/g, "").replace(/%$/, "");
  if (!cleaned) return NaN;
  const match = cleaned.match(/^(-?\d*\.?\d+(?:e[+-]?\d+)?)(k|mm|m|bn|b|t)?$/);
  if (!match) return NaN;
  const value = Number(match[1]) * (match[2] ? SUFFIX[match[2]] : 1);
  return Number.isFinite(value) ? value : NaN;
}

export function formatMoney(value, { compact = true, cents = false } = {}) {
  if (!Number.isFinite(value)) return "n/a";
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (compact && abs >= 1e3) {
    const units = [
      [1e12, "T"],
      [1e9, "B"],
      [1e6, "M"],
      [1e3, "k"]
    ];
    for (const [size, unit] of units) {
      if (abs >= size) {
        const scaled = abs / size;
        const digits = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
        return `${sign}$${trimZeros(scaled.toFixed(digits))}${unit}`;
      }
    }
  }
  if (cents || (abs > 0 && abs < 100 && !Number.isInteger(abs))) {
    const digits = abs > 0 && abs < 0.01 ? 4 : 2;
    return `${sign}$${abs.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
  }
  return `${sign}$${Math.round(abs).toLocaleString("en-US")}`;
}

export function formatShares(value) {
  if (!Number.isFinite(value)) return "n/a";
  return Math.round(value).toLocaleString("en-US");
}

/** Percent with enough decimals that small stakes stay readable. */
export function formatPercent(fraction, minDigits) {
  if (!Number.isFinite(fraction)) return "n/a";
  const pct = fraction * 100;
  const abs = Math.abs(pct);
  let digits = abs === 0 ? 0 : abs < 0.01 ? 4 : abs < 1 ? 3 : abs < 10 ? 2 : 1;
  if (minDigits != null) digits = Math.max(digits, minDigits);
  return `${pct.toFixed(digits)}%`;
}

function trimZeros(text) {
  return text.includes(".") ? text.replace(/\.?0+$/, "") : text;
}

/* ------------------------------------------------------------------ *
 * Vesting
 * ------------------------------------------------------------------ */

const STEP_MONTHS = { monthly: 1, quarterly: 3, annual: 12 };

/**
 * Fraction of the grant vested after `months` of service.
 * Nothing vests before the cliff; at the cliff the accrued portion lands at
 * once; afterwards vesting accrues in whole steps of the chosen frequency.
 */
export function vestedFraction({ months, vestYears = 4, cliffMonths = 12, frequency = "monthly" }) {
  if (!(vestYears > 0)) throw new RangeError("vestYears must be positive");
  if (!(cliffMonths >= 0)) throw new RangeError("cliffMonths must be zero or more");
  const step = STEP_MONTHS[frequency];
  if (!step) throw new RangeError(`unknown vesting frequency: ${frequency}`);
  const total = vestYears * 12;
  const m = Math.max(0, Number(months) || 0);
  if (m >= total) return 1;
  if (m < cliffMonths) return 0;
  const accrued = Math.floor(m / step + 1e-9) * step;
  return Math.min(1, Math.max(accrued, Math.min(cliffMonths, total)) / total);
}

/* ------------------------------------------------------------------ *
 * Grant resolution
 * ------------------------------------------------------------------ */

/**
 * Turn the offer letter into a share count.
 *   mode "shares":  amount is a share count
 *   mode "percent": amount is a percent of fully diluted shares (0.25 means 0.25%)
 *   mode "value":   amount is a dollar value quoted at `quotePrice` per share
 */
export function resolveGrantShares({ mode, amount, fdShares, quotePrice }) {
  if (!(amount >= 0)) throw new RangeError("grant amount must be zero or more");
  if (mode === "shares") return amount;
  if (mode === "percent") {
    if (!(fdShares > 0)) throw new RangeError("fully diluted shares must be positive");
    return (amount / 100) * fdShares;
  }
  if (mode === "value") {
    if (!(quotePrice > 0)) throw new RangeError("quote price must be positive");
    return amount / quotePrice;
  }
  throw new RangeError(`unknown grant mode: ${mode}`);
}

/* ------------------------------------------------------------------ *
 * Cap table projection
 * ------------------------------------------------------------------ */

/**
 * Build today's cap table and project it through future rounds.
 *
 * @param {object} p
 * @param {number} p.fdShares          fully diluted shares today (includes the pool)
 * @param {number} p.yourShares        your grant
 * @param {number} p.postMoney         last round post-money valuation
 * @param {number} p.raisedToDate      liquidation preference already outstanding
 * @param {number} p.investorPct       percent of FD shares held by preferred today
 * @param {number} [p.prefMultiple=1]  multiple applied to future rounds
 * @param {Array}  p.rounds            [{ name, raise, preMoney, poolTopUp }]
 *                                     poolTopUp is a percent of post-money,
 *                                     created inside the pre-money.
 */
export function projectCapTable({
  fdShares,
  yourShares,
  postMoney,
  raisedToDate = 0,
  investorPct = 0,
  prefMultiple = 1,
  rounds = []
}) {
  if (!(fdShares > 0)) throw new RangeError("fully diluted shares must be positive");
  if (!(yourShares >= 0)) throw new RangeError("your shares must be zero or more");
  if (!(postMoney > 0)) throw new RangeError("post-money valuation must be positive");
  if (!(raisedToDate >= 0)) throw new RangeError("raised to date must be zero or more");
  if (!(investorPct >= 0 && investorPct < 100)) throw new RangeError("investor ownership must be between 0 and 100");
  if (!(prefMultiple >= 0)) throw new RangeError("preference multiple must be zero or more");
  if (rounds.length > MAX_ROUNDS) throw new RangeError(`at most ${MAX_ROUNDS} future rounds`);

  const series = [];
  const existingPrefShares = (investorPct / 100) * fdShares;
  if (existingPrefShares > 0 || raisedToDate > 0) {
    series.push({ name: "Earlier preferred", shares: existingPrefShares, preference: raisedToDate });
  }

  const stages = [
    snapshot({
      name: "Today",
      fdShares,
      yourShares,
      postMoney,
      pricePerShare: postMoney / fdShares,
      dilution: 0,
      raise: 0,
      preMoney: null,
      poolAdded: 0,
      series
    })
  ];

  let S = fdShares;
  rounds.forEach((round, i) => {
    const name = round.name || `Round ${i + 1}`;
    const raise = Number(round.raise);
    const preMoney = Number(round.preMoney);
    const poolPct = Number(round.poolTopUp || 0);
    if (!(raise > 0)) throw new RangeError(`${name}: raise must be positive`);
    if (!(preMoney > 0)) throw new RangeError(`${name}: pre-money must be positive`);
    if (!(poolPct >= 0 && poolPct < 100)) throw new RangeError(`${name}: pool top-up must be between 0 and 100`);

    const post = preMoney + raise;
    const investorFrac = raise / post;
    const poolFrac = poolPct / 100;
    const keptFrac = 1 - investorFrac - poolFrac;
    if (!(keptFrac > 0)) throw new RangeError(`${name}: raise plus pool top-up leaves nothing for existing holders`);

    const postShares = S / keptFrac;
    const newPref = postShares * investorFrac;
    const poolAdded = postShares * poolFrac;
    series.push({ name, shares: newPref, preference: raise * prefMultiple });

    S = postShares;
    stages.push(
      snapshot({
        name,
        fdShares: S,
        yourShares,
        postMoney: post,
        pricePerShare: post / S,
        dilution: 1 - keptFrac,
        raise,
        preMoney,
        poolAdded,
        series
      })
    );
  });

  return stages;
}

function snapshot({ name, fdShares, yourShares, postMoney, pricePerShare, dilution, raise, preMoney, poolAdded, series }) {
  const copy = series.map((s) => ({ ...s }));
  const preferredShares = copy.reduce((sum, s) => sum + s.shares, 0);
  return {
    name,
    fdShares,
    yourShares,
    ownership: yourShares / fdShares,
    postMoney,
    pricePerShare,
    dilution,
    raise,
    preMoney,
    poolAdded,
    preferredShares,
    commonShares: fdShares - preferredShares,
    totalPreference: copy.reduce((sum, s) => sum + s.preference, 0),
    series: copy
  };
}

/* ------------------------------------------------------------------ *
 * Liquidation waterfall
 * ------------------------------------------------------------------ */

/**
 * Split an exit between preferred series and common.
 *
 * Non-participating (default): each series takes the larger of its preference
 * or its as-converted share. Series convert in order of preference per share
 * (cheapest first). Unconverted series are paid pari passu; if the exit does
 * not cover them, they split it in proportion to their preferences and common
 * gets nothing.
 *
 * Participating: every series takes its preference first, then shares what is
 * left pro rata with common as if converted (no cap).
 *
 * Unissued pool shares are counted as common (fully diluted view), which
 * slightly understates per-share value when part of the pool is never granted.
 *
 * @returns {{ perCommonShare:number, toCommon:number, toPreferred:number,
 *             series:Array<{name:string, payout:number, converted:boolean}> }}
 */
export function waterfall({ exitValue, commonShares, series = [], participating = false }) {
  if (!(commonShares > 0)) throw new RangeError("common shares must be positive");
  const E = Math.max(0, Number(exitValue) || 0);
  const list = series
    .filter((s) => s.shares > 0 || s.preference > 0)
    .map((s) => ({ name: s.name, shares: Math.max(0, s.shares), preference: Math.max(0, s.preference) }));
  const totalPref = list.reduce((sum, s) => sum + s.preference, 0);
  const totalPrefShares = list.reduce((sum, s) => sum + s.shares, 0);

  if (E === 0) {
    return { perCommonShare: 0, toCommon: 0, toPreferred: 0, series: list.map((s) => ({ name: s.name, payout: 0, converted: false })) };
  }

  if (participating && E <= totalPref) {
    return {
      perCommonShare: 0,
      toCommon: 0,
      toPreferred: E,
      series: list.map((s) => ({ name: s.name, payout: totalPref > 0 ? (E * s.preference) / totalPref : 0, converted: false }))
    };
  }

  if (participating) {
    const x = (E - totalPref) / (commonShares + totalPrefShares);
    return {
      perCommonShare: x,
      toCommon: x * commonShares,
      toPreferred: E - x * commonShares,
      series: list.map((s) => ({ name: s.name, payout: s.preference + x * s.shares, converted: false }))
    };
  }

  // Non-participating: sort by conversion threshold and find the largest
  // converting prefix whose last member is still better off converting.
  const order = list
    .map((s, idx) => ({ ...s, idx, threshold: s.shares > 0 ? s.preference / s.shares : Infinity }))
    .sort((a, b) => a.threshold - b.threshold);
  const n = order.length;
  let chosenK = 0;
  let chosenX = 0;
  let chosenHeld = totalPref;
  for (let k = n; k >= 0; k -= 1) {
    let heldPref = 0;
    for (let j = k; j < n; j += 1) heldPref += order[j].preference;
    let convShares = 0;
    for (let j = 0; j < k; j += 1) convShares += order[j].shares;
    const x = E > heldPref ? (E - heldPref) / (commonShares + convShares) : 0;
    if (k === 0 || x >= order[k - 1].threshold) {
      chosenK = k;
      chosenX = x;
      chosenHeld = heldPref;
      break;
    }
  }

  // Unconverted series are paid in full, or pro rata to preference when the
  // exit does not cover them all.
  const coverage = chosenHeld > 0 ? Math.min(1, E / chosenHeld) : 1;
  const payouts = new Array(n);
  order.forEach((s, j) => {
    const converted = j < chosenK;
    payouts[s.idx] = { name: s.name, payout: converted ? chosenX * s.shares : s.preference * coverage, converted };
  });
  const toCommon = chosenX * commonShares;
  return { perCommonShare: chosenX, toCommon, toPreferred: E - toCommon, series: payouts };
}

/* ------------------------------------------------------------------ *
 * Your payout
 * ------------------------------------------------------------------ */

export function payoutPerShare({ perCommonShare, grantType, strike = 0 }) {
  if (grantType === "rsu") return perCommonShare;
  return Math.max(0, perCommonShare - strike);
}

/**
 * Pre-tax cash you receive at an exit of `exitValue` happening after `stage`.
 */
export function yourExitPayout({ stage, exitValue, vestedShares, grantType, strike, participating }) {
  const w = waterfall({ exitValue, commonShares: stage.commonShares, series: stage.series, participating });
  const perShare = payoutPerShare({ perCommonShare: w.perCommonShare, grantType, strike });
  return { payout: perShare * vestedShares, perCommonShare: w.perCommonShare, perShare, waterfall: w };
}

/**
 * Smallest exit value at which your payout reaches `target`.
 * Payout is non-decreasing in exit value, so bisection is safe.
 * Returns null when no exit up to `ceiling` gets there.
 */
export function breakEvenExit({ target, stage, vestedShares, grantType, strike, participating, ceiling = 1e15 }) {
  if (!(target > 0)) return 0;
  const f = (E) => yourExitPayout({ stage, exitValue: E, vestedShares, grantType, strike, participating }).payout;
  if (f(ceiling) < target) return null;
  let lo = 0;
  let hi = ceiling;
  for (let i = 0; i < 200 && hi - lo > hi * 1e-12; i += 1) {
    const mid = (lo + hi) / 2;
    if (f(mid) >= target) hi = mid;
    else lo = mid;
  }
  return hi;
}

/* ------------------------------------------------------------------ *
 * Full scenario
 * ------------------------------------------------------------------ */

export const EXAMPLE = Object.freeze({
  grantType: "options",
  grantMode: "shares",
  grantAmount: 48000,
  strike: 1.37,
  fmv: 1.37,
  vestYears: 4,
  cliffMonths: 12,
  frequency: "monthly",
  fdShares: 12400000,
  postMoney: 58900000,
  raisedToDate: 14200000,
  investorPct: 38,
  prefMultiple: 1,
  participating: false,
  rounds: [
    { name: "Series B", raise: 30000000, preMoney: 120000000, poolTopUp: 5 },
    { name: "Series C", raise: 65000000, preMoney: 310000000, poolTopUp: 3 }
  ],
  exitStage: 2,
  exitValue: 900000000,
  yearsToExit: 5,
  yearsStay: 4,
  salary: 172000,
  marketSalary: 215000
});

/**
 * Run the whole model from one flat input object (the shape of EXAMPLE).
 */
export function computeScenario(input) {
  const i = { ...EXAMPLE, ...input };
  const grantType = i.grantType === "rsu" ? "rsu" : "options";
  const strike = grantType === "rsu" ? 0 : Math.max(0, Number(i.strike) || 0);
  const todayPrice = i.postMoney / i.fdShares;

  const shares = resolveGrantShares({
    mode: i.grantMode,
    amount: i.grantAmount,
    fdShares: i.fdShares,
    quotePrice: todayPrice
  });

  const stages = projectCapTable({
    fdShares: i.fdShares,
    yourShares: shares,
    postMoney: i.postMoney,
    raisedToDate: i.raisedToDate,
    investorPct: i.investorPct,
    prefMultiple: i.prefMultiple,
    rounds: i.rounds
  });

  const exitIndex = Math.min(Math.max(0, Math.round(i.exitStage)), stages.length - 1);
  const exitStage = stages[exitIndex];

  if (!(i.yearsToExit >= 0)) throw new RangeError("years until exit must be zero or more");
  if (!(i.yearsStay > 0)) throw new RangeError("years you stay must be positive");

  const serviceYears = Math.min(i.yearsStay, i.yearsToExit);
  const vestVesting = { vestYears: i.vestYears, cliffMonths: i.cliffMonths, frequency: i.frequency };
  const vestedAtExit = vestedFraction({ months: serviceYears * 12, ...vestVesting });
  const vestedWhenLeaving = vestedFraction({ months: i.yearsStay * 12, ...vestVesting });
  const vestedShares = shares * vestedAtExit;

  const common = { stage: exitStage, vestedShares, grantType, strike, participating: !!i.participating };
  const exit = yourExitPayout({ ...common, exitValue: i.exitValue });

  const salaryGap = Math.max(0, (i.marketSalary || 0) - (i.salary || 0));
  const cashForgone = salaryGap * i.yearsStay;
  const breakEven = cashForgone > 0 ? breakEvenExit({ ...common, target: cashForgone }) : 0;

  const fmv = Math.max(0, Number(i.fmv) || 0);
  const perShareAtPreferred = payoutPerShare({ perCommonShare: todayPrice, grantType, strike });
  const perShareAtFmv = payoutPerShare({ perCommonShare: fmv, grantType, strike });

  const multiples = [0.25, 0.5, 1, 2, 5, 10];
  const scenarioRows = multiples.map((m) => {
    const value = exitStage.postMoney * m;
    const r = yourExitPayout({ ...common, exitValue: value });
    return { label: `${m}x last post money`, multiple: m, exitValue: value, ...pick(r) };
  });

  return {
    input: i,
    grantType,
    strike,
    shares,
    todayPrice,
    stages,
    exitIndex,
    exitStage,
    ownershipToday: stages[0].ownership,
    ownershipAtExit: exitStage.ownership,
    keptFraction: exitStage.ownership / (stages[0].ownership || 1),
    vestedAtExit,
    vestedShares,
    vestedWhenLeaving,
    exit: pick(exit),
    waterfallAtExit: exit.waterfall,
    perYear: exit.payout / i.yearsStay,
    totalAnnualComp: (i.salary || 0) + exit.payout / i.yearsStay,
    salaryGap,
    cashForgone,
    breakEven,
    paperValuePreferred: perShareAtPreferred * shares,
    paperValueFmv: perShareAtFmv * shares,
    exerciseCostTotal: grantType === "rsu" ? 0 : shares * strike,
    exerciseCostOnLeaving: grantType === "rsu" ? 0 : shares * vestedWhenLeaving * strike,
    spreadOnLeavingAtFmv: grantType === "rsu" ? shares * vestedWhenLeaving * fmv : shares * vestedWhenLeaving * Math.max(0, fmv - strike),
    scenarioRows
  };
}

function pick(r) {
  return { payout: r.payout, perCommonShare: r.perCommonShare, perShare: r.perShare };
}

/**
 * Sample payout across exit values on a log scale, for the chart.
 */
export function payoutCurve({ stage, vestedShares, grantType, strike, participating, minExit, maxExit, points = 160 }) {
  if (!(minExit > 0) || !(maxExit > minExit)) throw new RangeError("need 0 < minExit < maxExit");
  const out = [];
  const a = Math.log(minExit);
  const b = Math.log(maxExit);
  for (let k = 0; k < points; k += 1) {
    const E = Math.exp(a + ((b - a) * k) / (points - 1));
    out.push({ exitValue: E, payout: yourExitPayout({ stage, exitValue: E, vestedShares, grantType, strike, participating }).payout });
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * Share links
 * ------------------------------------------------------------------ */

export function encodeState(state) {
  const json = JSON.stringify(state);
  const b64 = typeof btoa === "function" ? btoa(unescape(encodeURIComponent(json))) : Buffer.from(json, "utf8").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeState(token) {
  try {
    const b64 = String(token).replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "===".slice((b64.length + 3) % 4);
    const json = typeof atob === "function" ? decodeURIComponent(escape(atob(padded))) : Buffer.from(padded, "base64").toString("utf8");
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
