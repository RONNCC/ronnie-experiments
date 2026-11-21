/**
 * Pure arithmetic for "How the US Healthcare System Works".
 * No DOM access here so every function can be unit tested in Node.
 * All money results are rounded to whole cents so totals stay exact.
 */

const CENT = 100;

/** Round to cents, avoiding IEEE dust such as 220 * 0.2 = 44.00000000000001. */
export function roundToCents(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 0;
  return Math.round((amount + Number.EPSILON) * CENT) / CENT;
}

/**
 * Format a USD amount for display. Never rounds a small non-zero amount down
 * to "$0.00": any non-zero amount below half a cent is shown as "<$0.01".
 */
export function formatUsd(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "$0.00";
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);
  if (abs === 0) return "$0.00";
  if (abs < 0.005) return `${sign}<$0.01`;
  return `${sign}$${abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Total yearly cost of a health plan year, given the plan's cost sharing and
 * the allowed charges the household actually uses.
 *
 * Model (in-network, single person):
 *   annualPremium   = monthlyPremium * 12
 *   deductiblePaid  = min(annualAllowed, deductible)
 *   coinsurance     = roundToCents((annualAllowed - deductiblePaid) * coinsurancePercent / 100)
 *   outOfPocket     = min(outOfPocketMax, deductiblePaid + coinsurance)
 *   insurerPaid     = annualAllowed - outOfPocket
 *   totalYearlyCost = annualPremium + outOfPocket
 *
 * All inputs are clamped at zero; coinsurancePercent is also clamped to 100.
 */
export function computeAnnualCost({ monthlyPremium, deductible, coinsurancePercent, outOfPocketMax, annualAllowed }) {
  const premium = Math.max(0, Number(monthlyPremium) || 0);
  const ded = Math.max(0, Number(deductible) || 0);
  const coins = Math.min(100, Math.max(0, Number(coinsurancePercent) || 0)) / 100;
  const oopCap = Math.max(0, Number(outOfPocketMax) || 0);
  const allowed = Math.max(0, Number(annualAllowed) || 0);

  const annualPremium = roundToCents(premium * 12);
  const deductiblePaid = roundToCents(Math.min(allowed, ded));
  const remainderAfterDeductible = roundToCents(allowed - deductiblePaid);
  const coinsurancePaid = roundToCents(remainderAfterDeductible * coins);
  const uncappedOutOfPocket = roundToCents(deductiblePaid + coinsurancePaid);
  const outOfPocket = roundToCents(Math.min(oopCap, uncappedOutOfPocket));
  const insurerPaid = roundToCents(allowed - outOfPocket);
  const totalYearlyCost = roundToCents(annualPremium + outOfPocket);

  return {
    annualPremium,
    deductiblePaid,
    remainderAfterDeductible,
    coinsurancePaid,
    uncappedOutOfPocket,
    outOfPocket,
    insurerPaid,
    totalYearlyCost,
    outOfPocketMaxApplied: uncappedOutOfPocket > oopCap,
    deductibleMet: allowed >= ded
  };
}

/**
 * The worked example in Chapter 11: one broken wrist ("Maya's" episode).
 * Employer PPO, $1,500 deductible with $500 already met this year,
 * 20% coinsurance after the deductible, $6,000 out-of-pocket maximum
 * with the same $500 counted toward it.
 *
 * Claims are applied in the order the plan processes them (by receipt date):
 * ambulance, X-ray, ER facility, ER physician, orthopedic follow-up.
 * The ER physician group was out of network; under the No Surprises Act the
 * plan pays it at the in-network allowed amount and the patient owes only
 * in-network cost sharing.
 */
export function computeBrokenArmEpisode() {
  const claims = [
    { service: "Ground ambulance", charge: 1500, allowed: 900 },
    { service: "X-ray, wrist (2 views)", charge: 900, allowed: 320 },
    { service: "ER facility fee", charge: 4800, allowed: 2400 },
    { service: "ER physician (out-of-network, No Surprises Act)", charge: 1100, allowed: 700 },
    { service: "Orthopedic follow-up and cast", charge: 1200, allowed: 650 }
  ];

  const deductibleBefore = 1500;
  const deductibleAlreadyMet = 500;
  let deductibleRemaining = deductibleBefore - deductibleAlreadyMet; // 1000
  const coinsuranceRate = 0.2;
  const outOfPocketMax = 6000;
  const priorOutOfPocket = 500;
  let oopRoom = outOfPocketMax - priorOutOfPocket; // 5500, never reached in this episode

  const lines = claims.map((claim) => {
    const toDeductible = roundToCents(Math.min(claim.allowed, deductibleRemaining));
    deductibleRemaining = roundToCents(deductibleRemaining - toDeductible);
    const remainder = roundToCents(claim.allowed - toDeductible);
    const coinsurance = roundToCents(remainder * coinsuranceRate);
    let patientCoinsurance = coinsurance;
    if (roundToCents(toDeductible + patientCoinsurance) > oopRoom) {
      // Out-of-pocket maximum caps this line; the tracker keeps it exact.
      patientCoinsurance = roundToCents(Math.max(0, oopRoom - toDeductible));
    }
    oopRoom = roundToCents(oopRoom - toDeductible - patientCoinsurance);
    const patient = roundToCents(toDeductible + patientCoinsurance);
    const insurer = roundToCents(claim.allowed - patient);
    return {
      service: claim.service,
      charge: claim.charge,
      allowed: claim.allowed,
      toDeductible,
      patientCoinsurance,
      patient,
      insurer
    };
  });

  const totals = lines.reduce(
    (acc, line) => {
      acc.charge = roundToCents(acc.charge + line.charge);
      acc.allowed = roundToCents(acc.allowed + line.allowed);
      acc.toDeductible = roundToCents(acc.toDeductible + line.toDeductible);
      acc.patient = roundToCents(acc.patient + line.patient);
      acc.insurer = roundToCents(acc.insurer + line.insurer);
      return acc;
    },
    { charge: 0, allowed: 0, toDeductible: 0, patient: 0, insurer: 0 }
  );

  return {
    claims: lines,
    totals,
    writtenOff: roundToCents(totals.charge - totals.allowed),
    deductibleUsed: totals.toDeductible,
    priorOutOfPocket,
    yearToDateOutOfPocket: roundToCents(priorOutOfPocket + totals.patient),
    outOfPocketMax,
    outOfPocketRoomLeft: roundToCents(outOfPocketMax - (priorOutOfPocket + totals.patient))
  };
}
