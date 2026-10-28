/**
 * INKA Match Scoring & Advantage Engine
 * Pure skill advantage, score tracking, and sportsmanship honor system.
 * Free of all wagering, stakes, or monetary transfers.
 */

export interface MatchScoreResult {
  leader: 'A' | 'B' | null;
  advantage: number; // 0 to 1.0
  w: number; // alias for advantage
  scoreA: number;
  scoreB: number;
  isDecisiveWin: boolean;
  winner: 'A' | 'B' | null;
}

/**
 * Calculates Dame advantage based purely on captured pieces out of 10.
 * Decisive win occurs when all 10 pieces of a side are captured.
 */
export function calculateDameAdvantage(
  capturedByA: number,
  capturedByB: number,
  isDecisiveWinA = false,
  isDecisiveWinB = false
): MatchScoreResult {
  const safeCapA = Math.max(0, Math.min(10, capturedByA));
  const safeCapB = Math.max(0, Math.min(10, capturedByB));

  if (isDecisiveWinA || safeCapA >= 10) {
    return {
      leader: 'A',
      advantage: 1.0,
      w: 1.0,
      scoreA: 10,
      scoreB: safeCapB,
      isDecisiveWin: true,
      winner: 'A',
    };
  }

  if (isDecisiveWinB || safeCapB >= 10) {
    return {
      leader: 'B',
      advantage: 1.0,
      w: 1.0,
      scoreA: safeCapA,
      scoreB: 10,
      isDecisiveWin: true,
      winner: 'B',
    };
  }

  const netDiff = safeCapA - safeCapB;
  if (netDiff === 0) {
    return {
      leader: null,
      advantage: 0,
      w: 0,
      scoreA: safeCapA,
      scoreB: safeCapB,
      isDecisiveWin: false,
      winner: null,
    };
  }

  const leader = netDiff > 0 ? 'A' : 'B';
  const advantage = Math.min(0.95, Math.round((Math.abs(netDiff) / 10) * 100) / 100);

  return {
    leader,
    advantage,
    w: advantage,
    scoreA: safeCapA,
    scoreB: safeCapB,
    isDecisiveWin: false,
    winner: null,
  };
}

/**
 * Calculates Igisoro advantage based on Rwandan seed proportion formula:
 * Total seeds = 64. Let p be the fraction of seeds controlled by Player A.
 * Advantage w = |2p - 1|.
 */
export function calculateIgisoroAdvantage(
  seedsA: number,
  seedsB: number,
  isDecisiveWinA = false,
  isDecisiveWinB = false
): MatchScoreResult {
  if (isDecisiveWinA || seedsB <= 0) {
    return {
      leader: 'A',
      advantage: 1.0,
      w: 1.0,
      scoreA: 64,
      scoreB: 0,
      isDecisiveWin: true,
      winner: 'A',
    };
  }

  if (isDecisiveWinB || seedsA <= 0) {
    return {
      leader: 'B',
      advantage: 1.0,
      w: 1.0,
      scoreA: 0,
      scoreB: 64,
      isDecisiveWin: true,
      winner: 'B',
    };
  }

  const total = seedsA + seedsB;
  if (total === 0 || seedsA === seedsB) {
    return {
      leader: null,
      advantage: 0,
      w: 0,
      scoreA: seedsA,
      scoreB: seedsB,
      isDecisiveWin: false,
      winner: null,
    };
  }

  const pA = seedsA / total;
  const rawW = Math.abs(2 * pA - 1);
  const advantage = Math.round(rawW * 100) / 100;
  const leader = seedsA > seedsB ? 'A' : 'B';

  return {
    leader,
    advantage,
    w: advantage,
    scoreA: seedsA,
    scoreB: seedsB,
    isDecisiveWin: false,
    winner: null,
  };
}

/**
 * Calculates Biyari (Eight-ball) advantage based on the seven-ball groups.
 * A player must clear their seven group balls before legally winning with the 8-ball.
 */
export function calculateBiyariAdvantage(
  pottedA: number,
  pottedB: number,
  eightBallWonA = false,
  eightBallWonB = false
): MatchScoreResult {
  if (eightBallWonA) {
    return {
      leader: 'A',
      advantage: 1.0,
      w: 1.0,
      scoreA: Math.max(pottedA, 7),
      scoreB: pottedB,
      isDecisiveWin: true,
      winner: 'A',
    };
  }

  if (eightBallWonB) {
    return {
      leader: 'B',
      advantage: 1.0,
      w: 1.0,
      scoreA: pottedA,
      scoreB: Math.max(pottedB, 7),
      isDecisiveWin: true,
      winner: 'B',
    };
  }

  const netDiff = pottedA - pottedB;
  if (netDiff === 0) {
    return {
      leader: null,
      advantage: 0,
      w: 0,
      scoreA: pottedA,
      scoreB: pottedB,
      isDecisiveWin: false,
      winner: null,
    };
  }

  const leader = netDiff > 0 ? 'A' : 'B';
  const advantage = Math.min(0.9, Math.round((Math.abs(netDiff) / 7) * 100) / 100);

  return {
    leader,
    advantage,
    w: advantage,
    scoreA: pottedA,
    scoreB: pottedB,
    isDecisiveWin: false,
    winner: null,
  };
}

/**
 * Honor points calculation for sporting behavior.
 * Replaces inka monetary payout with sportsmanship honor rewards.
 */
export function calculateHonorReward(
  result: 'win' | 'loss' | 'draw' | 'conclude',
  sportsmanshipRating: number
): number {
  switch (result) {
    case 'win':
      return 15 + Math.round(sportsmanshipRating * 2);
    case 'draw':
    case 'conclude':
      return 10 + Math.round(sportsmanshipRating * 2);
    case 'loss':
      return 8 + Math.round(sportsmanshipRating * 1.5);
  }
}
