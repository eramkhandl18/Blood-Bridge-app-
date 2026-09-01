import {
  BloodGroup,
  BloodComponent,
  UrgencyLevel,
  DemandRequest,
  InventoryBatch,
  Donor,
  MatchCandidate,
  MatchingWeights,
} from '../types';

export const DEFAULT_WEIGHTS: MatchingWeights = {
  urgency: 40,
  compatibility: 25,
  etaDistance: 15,
  fefoExpiry: 10,
  quantityCoverage: 10,
};

/**
 * Checks clinical transfusion compatibility between donor/inventory blood group
 * and recipient blood group based on component type.
 */
export function checkTransfusionCompatibility(
  donorGroup: BloodGroup,
  recipientGroup: BloodGroup,
  component: BloodComponent
): {
  isCompatible: boolean;
  verdict: 'EXACT_MATCH' | 'COMPATIBLE_SUBSTITUTE' | 'UNIVERSAL_DONOR' | 'INCOMPATIBLE';
  details: string;
} {
  if (donorGroup === recipientGroup) {
    return {
      isCompatible: true,
      verdict: 'EXACT_MATCH',
      details: `Identical ABO/Rh match (${donorGroup} to ${recipientGroup}).`,
    };
  }

  // Plasma (FFP) & Cryoprecipitate compatibility (AB is universal donor, O is universal recipient)
  if (component === 'Fresh Frozen Plasma' || component === 'Cryoprecipitate') {
    const plasmaRules: Record<string, BloodGroup[]> = {
      // Recipient ABO without Rh (plasma compatibility is ABO dependent)
      O: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'], // O can receive any plasma
      A: ['A+', 'A-', 'AB+', 'AB-'],
      B: ['B+', 'B-', 'AB+', 'AB-'],
      AB: ['AB+', 'AB-'], // AB can only receive AB plasma
    };

    const recipientBase = recipientGroup.replace(/[+-]/, '');
    const allowedDonors = plasmaRules[recipientBase] || [];
    const isCompatible = allowedDonors.includes(donorGroup);

    if (donorGroup.startsWith('AB')) {
      return {
        isCompatible: true,
        verdict: 'UNIVERSAL_DONOR',
        details: `${donorGroup} is Universal Plasma Donor for ${recipientGroup}.`,
      };
    }

    return {
      isCompatible,
      verdict: isCompatible ? 'COMPATIBLE_SUBSTITUTE' : 'INCOMPATIBLE',
      details: isCompatible
        ? `Compatible plasma substitute (${donorGroup} for ${recipientGroup}).`
        : `Clinically incompatible plasma antibodies (${donorGroup} to ${recipientGroup}).`,
    };
  }

  // Red Blood Cells (RBC) & Whole Blood & Platelets
  const rbcCompatibility: Record<BloodGroup, BloodGroup[]> = {
    'O-': ['O-'],
    'O+': ['O-', 'O+'],
    'A-': ['O-', 'A-'],
    'A+': ['O-', 'O+', 'A-', 'A+'],
    'B-': ['O-', 'B-'],
    'B+': ['O-', 'O+', 'B-', 'B+'],
    'AB-': ['O-', 'A-', 'B-', 'AB-'],
    'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  };

  const allowed = rbcCompatibility[recipientGroup] || [];
  const isCompatible = allowed.includes(donorGroup);

  if (donorGroup === 'O-') {
    return {
      isCompatible: true,
      verdict: 'UNIVERSAL_DONOR',
      details: `O- Universal Red Blood Cell Donor suitable for ${recipientGroup}.`,
    };
  }

  return {
    isCompatible,
    verdict: isCompatible ? 'COMPATIBLE_SUBSTITUTE' : 'INCOMPATIBLE',
    details: isCompatible
      ? `Clinically compatible alternative (${donorGroup} for ${recipientGroup}).`
      : `Clinically INCOMPATIBLE (${donorGroup} cannot be transfused to ${recipientGroup} due to agglutination risk).`,
  };
}

/**
 * Calculates days between today and expiry date.
 */
export function getDaysToExpiry(expiryDateStr: string): number {
  const now = new Date();
  const exp = new Date(expiryDateStr);
  const diffTime = exp.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculates approximate ETA in minutes based on distance in km.
 * Assumes emergency transit with siren (~40-50 km/h average in metro).
 */
export function calculateEtaMinutes(distanceKm: number, isEmergency = true): number {
  const speedKmh = isEmergency ? 45 : 30;
  const dispatchPreparationMinutes = 5;
  const transitTime = Math.ceil((distanceKm / speedKmh) * 60);
  return Math.max(8, dispatchPreparationMinutes + transitTime);
}

/**
 * Core Smart Matching Engine with transparent weighted scoring:
 * Urgency 40% | Compatibility 25% | ETA 15% | Expiry FEFO 10% | Quantity 10%
 */
export function rankMatches(
  demand: DemandRequest,
  inventoryBatches: InventoryBatch[],
  donors: Donor[],
  weights: MatchingWeights = DEFAULT_WEIGHTS
): MatchCandidate[] {
  const candidates: MatchCandidate[] = [];
  const remainingNeeded = demand.unitsRequested - demand.unitsFulfilled;

  if (remainingNeeded <= 0) return [];

  // 1. Process Blood Bank Inventory Batches
  for (const batch of inventoryBatches) {
    const availableUnits = batch.unitsAvailable - batch.unitsReserved;
    if (availableUnits <= 0) continue;
    if (batch.component !== demand.component) continue;

    // Compatibility check (Hard filter: incompatible candidates NEVER enter scoring)
    const comp = checkTransfusionCompatibility(batch.bloodGroup, demand.bloodGroup, demand.component);
    if (!comp.isCompatible) continue;

    // Calculate distance & ETA (mocked based on coords or random deterministic)
    const distanceKm = Number((2.5 + (batch.bloodBankName.length % 7) * 2.1).toFixed(1));
    const etaMinutes = calculateEtaMinutes(distanceKm, demand.urgency === 'CRITICAL_TRAUMA');
    const daysToExpiry = getDaysToExpiry(batch.expiryDate);

    // Skip if already expired
    if (daysToExpiry < 0) continue;

    // Weighted Scoring calculations:
    // Urgency Score (weight % of total)
    let urgencyRatio = 0.5;
    if (demand.urgency === 'CRITICAL_TRAUMA') urgencyRatio = 1.0;
    else if (demand.urgency === 'HIGH_SURGERY') urgencyRatio = 0.8;
    else urgencyRatio = 0.55;
    const urgencyScore = Number((urgencyRatio * weights.urgency).toFixed(1));

    // Compatibility Score
    let compRatio = 0.8;
    if (comp.verdict === 'EXACT_MATCH') compRatio = 1.0;
    else if (comp.verdict === 'UNIVERSAL_DONOR') compRatio = 0.9;
    else compRatio = 0.75;
    const compatibilityScore = Number((compRatio * weights.compatibility).toFixed(1));

    // ETA / Distance Score (Lower ETA = higher score)
    let etaRatio = 0.3;
    if (etaMinutes <= 15) etaRatio = 1.0;
    else if (etaMinutes <= 25) etaRatio = 0.85;
    else if (etaMinutes <= 40) etaRatio = 0.7;
    else if (etaMinutes <= 60) etaRatio = 0.5;
    else etaRatio = 0.3;
    const etaScore = Number((etaRatio * weights.etaDistance).toFixed(1));

    // FEFO Expiry Score (Near expiry within safe window receives HIGHEST priority to reduce wastage!)
    let expiryRatio = 0.4;
    if (daysToExpiry <= 4) expiryRatio = 1.0; // High FEFO priority!
    else if (daysToExpiry <= 10) expiryRatio = 0.8;
    else if (daysToExpiry <= 20) expiryRatio = 0.6;
    else expiryRatio = 0.4;
    const expiryScore = Number((expiryRatio * weights.fefoExpiry).toFixed(1));

    // Quantity Coverage Score
    const coverageRatio = Math.min(1.0, availableUnits / remainingNeeded);
    const quantityScore = Number((coverageRatio * weights.quantityCoverage).toFixed(1));

    const totalScore = Math.min(
      100,
      Math.round(urgencyScore + compatibilityScore + etaScore + expiryScore + quantityScore)
    );

    const explanation = `Ranked with score ${totalScore}/100: ${comp.details} Available ${availableUnits} units at ${batch.bloodBankName} (ETA ~${etaMinutes} mins, ${daysToExpiry} days shelf life - FEFO optimized).`;

    candidates.push({
      id: `match-inv-${batch.id}`,
      type: 'BLOOD_BANK_STOCK',
      sourceId: batch.bloodBankId,
      sourceName: batch.bloodBankName,
      bloodGroup: batch.bloodGroup,
      component: batch.component,
      unitsAvailable: availableUnits,
      distanceKm,
      etaMinutes,
      daysToExpiry,
      score: totalScore,
      breakdown: {
        urgencyScore,
        compatibilityScore,
        etaScore,
        expiryScore,
        quantityScore,
      },
      compatibilityVerdict: comp.verdict,
      explanation,
      batchId: batch.id,
    });
  }

  // 2. Process Eligible Donors (Donor Fallback pool)
  for (const donor of donors) {
    if (!donor.eligible || !donor.optInEmergencyAlerts) continue;

    const comp = checkTransfusionCompatibility(donor.bloodGroup, demand.bloodGroup, demand.component);
    if (!comp.isCompatible) continue;

    const distanceKm = donor.distanceKm || 4.2;
    const etaMinutes = calculateEtaMinutes(distanceKm, false) + 15; // +15 mins donor prep & arrival

    let urgencyRatio = demand.urgency === 'CRITICAL_TRAUMA' ? 1.0 : 0.75;
    const urgencyScore = Number((urgencyRatio * weights.urgency).toFixed(1));

    let compRatio = comp.verdict === 'EXACT_MATCH' ? 1.0 : 0.85;
    const compatibilityScore = Number((compRatio * weights.compatibility).toFixed(1));

    let etaRatio = etaMinutes <= 30 ? 0.9 : etaMinutes <= 50 ? 0.7 : 0.4;
    const etaScore = Number((etaRatio * weights.etaDistance).toFixed(1));

    // Fresh donation = 0 days shelf age, baseline FEFO
    const expiryScore = Number((0.5 * weights.fefoExpiry).toFixed(1));
    const quantityScore = Number((0.6 * weights.quantityCoverage).toFixed(1)); // 1 donor unit

    const totalScore = Math.min(
      95,
      Math.round(urgencyScore + compatibilityScore + etaScore + expiryScore + quantityScore)
    );

    const explanation = `Opt-in registered donor (${donor.bloodGroup}) located ~${distanceKm}km away in ${donor.location.approximateArea}. Verified eligible.`;

    candidates.push({
      id: `match-donor-${donor.id}`,
      type: 'DONOR_FALLBACK',
      sourceId: donor.id,
      sourceName: `${donor.name} (Verified Donor)`,
      bloodGroup: donor.bloodGroup,
      component: demand.component,
      unitsAvailable: 1,
      distanceKm,
      etaMinutes,
      daysToExpiry: 42,
      score: totalScore,
      breakdown: {
        urgencyScore,
        compatibilityScore,
        etaScore,
        expiryScore,
        quantityScore,
      },
      compatibilityVerdict: comp.verdict,
      explanation,
      donorId: donor.id,
    });
  }

  // Sort descending by score
  return candidates.sort((a, b) => b.score - a.score);
}
