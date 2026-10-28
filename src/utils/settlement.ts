/**
 * Rwandan Skill-Games Platform
 * Settlement Engine & Mathematical Rules
 * Reference: Rwandan Skill-Games Platform Concept Document Section 7 & 13.5
 */

export interface SettlementResult {
  holdingA: number;
  holdingB: number;
  deltaA: number;
  deltaB: number;
  leader: 'A' | 'B' | null;
  w: number;
  totalPool: number;
}

/**
 * Calculates inka holdings according to the platform settlement formula:
 * If A leads:
 *   A holds a + (w * b)
 *   B holds b * (1 - w)
 * If B leads:
 *   B holds b + (w * a)
 *   A holds a * (1 - w)
 * If tied / w = 0:
 *   A holds a, B holds b
 */
export function calculateSettlement(
  stakeA: number,
  stakeB: number,
  leader: 'A' | 'B' | null,
  w: number
): SettlementResult {
  const safeStakeA = Math.max(0, stakeA);
  const safeStakeB = Math.max(0, stakeB);
  const totalPool = safeStakeA + safeStakeB;

  // Clamp w to [0, 1]
  const clampedW = Math.max(0, Math.min(1, Math.round(w * 1000) / 1000));

  if (!leader || clampedW === 0) {
    return {
      holdingA: safeStakeA,
      holdingB: safeStakeB,
      deltaA: 0,
      deltaB: 0,
      leader: null,
      w: 0,
      totalPool,
    };
  }

  let holdingA: number;
  let holdingB: number;

  if (leader === 'A') {
    holdingA = safeStakeA + clampedW * safeStakeB;
    holdingB = safeStakeB * (1 - clampedW);
  } else {
    holdingB = safeStakeB + clampedW * safeStakeA;
    holdingA = safeStakeA * (1 - clampedW);
  }

  // Round to 2 decimal places (hundredths of an inka as specified in Section 7.5)
  holdingA = Math.round(holdingA * 100) / 100;
  holdingB = Math.round(holdingB * 100) / 100;

  // Guarantee pool conservation against minor rounding
  const currentSum = holdingA + holdingB;
  if (Math.abs(currentSum - totalPool) > 0.0001) {
    if (leader === 'A') {
      holdingB = Math.round((totalPool - holdingA) * 100) / 100;
    } else {
      holdingA = Math.round((totalPool - holdingB) * 100) / 100;
    }
  }

  return {
    holdingA,
    holdingB,
    deltaA: Math.round((holdingA - safeStakeA) * 100) / 100,
    deltaB: Math.round((holdingB - safeStakeB) * 100) / 100,
    leader,
    w: clampedW,
    totalPool,
  };
}

/**
 * Dame advantage calculator:
 * Each side starts with 10 pieces (total 20 pieces).
 * King pieces are treated equally in inka valuation (Doc Section 7.6 & Appendix C.13).
 */
export function calculateDameAdvantage(
  capturedByA: number,
  capturedByB: number,
  isDecisiveWinA = false,
  isDecisiveWinB = false
): { leader: 'A' | 'B' | null; w: number } {
  if (isDecisiveWinA) return { leader: 'A', w: 1.0 };
  if (isDecisiveWinB) return { leader: 'B', w: 1.0 };

  const netDiff = capturedByA - capturedByB;
  if (netDiff === 0) return { leader: null, w: 0 };

  if (netDiff > 0) {
    // A leads
    const w = Math.min(1.0, netDiff / 10);
    return { leader: 'A', w: Math.round(w * 100) / 100 };
  } else {
    // B leads
    const w = Math.min(1.0, Math.abs(netDiff) / 10);
    return { leader: 'B', w: Math.round(w * 100) / 100 };
  }
}

/**
 * Igisoro advantage calculator:
 * Total seeds = 64. Let p be fraction of seeds on player's side or captured.
 * Formula from Doc Section 7.6: w = |2p - 1|
 */
export function calculateIgisoroAdvantage(
  seedsA: number,
  seedsB: number,
  isDecisiveWinA = false,
  isDecisiveWinB = false
): { leader: 'A' | 'B' | null; w: number } {
  if (isDecisiveWinA) return { leader: 'A', w: 1.0 };
  if (isDecisiveWinB) return { leader: 'B', w: 1.0 };

  const total = seedsA + seedsB;
  if (total === 0) return { leader: null, w: 0 };

  const pA = seedsA / total;
  const rawW = Math.abs(2 * pA - 1);
  const w = Math.round(rawW * 100) / 100;

  if (seedsA > seedsB) {
    return { leader: 'A', w };
  } else if (seedsB > seedsA) {
    return { leader: 'B', w };
  }
  return { leader: null, w: 0 };
}

/**
 * Biyari (Eight-ball) advantage calculator:
 * Each side has 7 target balls. Legal potting advances towards decisive win.
 * Sinking the 8-ball cleanly gives w = 1.0.
 */
export function calculateBiyariAdvantage(
  pottedA: number,
  pottedB: number,
  eightBallWonA = false,
  eightBallWonB = false
): { leader: 'A' | 'B' | null; w: number } {
  if (eightBallWonA) return { leader: 'A', w: 1.0 };
  if (eightBallWonB) return { leader: 'B', w: 1.0 };

  const netDiff = pottedA - pottedB;
  if (netDiff === 0) return { leader: null, w: 0 };

  if (netDiff > 0) {
    const w = Math.min(0.9, netDiff / 7);
    return { leader: 'A', w: Math.round(w * 100) / 100 };
  } else {
    const w = Math.min(0.9, Math.abs(netDiff) / 7);
    return { leader: 'B', w: Math.round(w * 100) / 100 };
  }
}
