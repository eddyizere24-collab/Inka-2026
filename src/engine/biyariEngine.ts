/**
 * INKA Biyari (8-Ball Pool) Authoritative Rule Engine
 * Implements standard WPA 8-ball championship rules:
 * - 16 balls (Cue ball, 1-7 Solids, 8 Black Ball, 9-15 Stripes)
 * - Break shot: legal rack collision
 * - Group assignment: first legal ball potted (Solids vs Stripes)
 * - Foul / Scratch triggers Ball-in-Hand
 * - First contact rule: cue ball must contact player's assigned group first
 * - 8-Ball endgame: pocket calling required
 * - Loss on early 8-ball, wrong pocket 8-ball, or 8-ball potted on scratch
 * - Win on 8-ball legally potted into called pocket after all 7 group balls are cleared
 */

export type BallGroup = 'solid' | 'stripe';

export interface BiyariShotEvaluation {
  isBreakShot: boolean;
  assignedGroupA: BallGroup | null;
  assignedGroupB: BallGroup | null;
  pottedA: number;
  pottedB: number;
  cueBallScratched: boolean;
  firstContactBallNumber: number | null;
  pottedBalls: number[]; // Numbers of balls potted on this shot
  calledPocketId: number | null;
  targetPocketForEight: number | null;
  activeTurn: 'A' | 'B';
}

export interface BiyariShotOutcome {
  foul: boolean;
  foulReason?: string;
  ballInHand: boolean;
  nextTurn: 'A' | 'B';
  assignedGroupA: BallGroup | null;
  assignedGroupB: BallGroup | null;
  isGameOver: boolean;
  winner: 'A' | 'B' | null;
  winReason?: string;
  lossReason?: string;
}

export function evaluateBiyariShot(shot: BiyariShotEvaluation): BiyariShotOutcome {
  const {
    isBreakShot,
    cueBallScratched,
    firstContactBallNumber,
    pottedBalls,
    calledPocketId,
    targetPocketForEight,
    activeTurn,
  } = shot;

  let assignedA = shot.assignedGroupA;
  let assignedB = shot.assignedGroupB;
  let foul = false;
  let foulReason: string | undefined;

  const currentGroup = activeTurn === 'A' ? assignedA : assignedB;
  const currentPottedCount = activeTurn === 'A' ? shot.pottedA : shot.pottedB;
  const opponentTurn = activeTurn === 'A' ? 'B' : 'A';

  // 1. Check Scratch
  if (cueBallScratched) {
    foul = true;
    foulReason = 'Cue ball scratched into pocket';
  }

  // 2. Check 8-ball potted scenarios
  const eightBallPotted = pottedBalls.includes(8);
  if (eightBallPotted) {
    // 8-ball potted on scratch -> Immediate loss
    if (cueBallScratched) {
      return {
        foul: true,
        foulReason: '8-ball potted on scratch',
        ballInHand: false,
        nextTurn: opponentTurn,
        assignedGroupA: assignedA,
        assignedGroupB: assignedB,
        isGameOver: true,
        winner: opponentTurn,
        lossReason: '8-ball potted on scratch (Loss)',
      };
    }

    // 8-ball potted before clearing all 7 group balls -> Immediate loss
    if (currentPottedCount < 7) {
      return {
        foul: true,
        foulReason: '8-ball potted before clearing group balls',
        ballInHand: false,
        nextTurn: opponentTurn,
        assignedGroupA: assignedA,
        assignedGroupB: assignedB,
        isGameOver: true,
        winner: opponentTurn,
        lossReason: `8-ball potted early with ${7 - currentPottedCount} balls remaining (Loss)`,
      };
    }

    // 8-ball potted in wrong pocket -> Loss
    if (calledPocketId === null || (targetPocketForEight !== null && targetPocketForEight !== calledPocketId)) {
      return {
        foul: true,
        foulReason: '8-ball potted in uncalled pocket',
        ballInHand: false,
        nextTurn: opponentTurn,
        assignedGroupA: assignedA,
        assignedGroupB: assignedB,
        isGameOver: true,
        winner: opponentTurn,
        lossReason: '8-ball potted in wrong or uncalled pocket (Loss)',
      };
    }

    // Legal 8-ball victory!
    return {
      foul: false,
      ballInHand: false,
      nextTurn: activeTurn,
      assignedGroupA: assignedA,
      assignedGroupB: assignedB,
      isGameOver: true,
      winner: activeTurn,
      winReason: '8-ball legally pocketed into called pocket (Victory)',
    };
  }

  // 3. First contact check (if balls are assigned)
  if (!isBreakShot && currentGroup !== null && firstContactBallNumber !== null) {
    const isSolid = firstContactBallNumber >= 1 && firstContactBallNumber <= 7;
    const isStripe = firstContactBallNumber >= 9 && firstContactBallNumber <= 15;
    const isEight = firstContactBallNumber === 8;

    if (currentPottedCount < 7) {
      // Must hit own group ball first
      if ((currentGroup === 'solid' && !isSolid) || (currentGroup === 'stripe' && !isStripe)) {
        foul = true;
        foulReason = 'Wrong ball first contact';
      }
    } else {
      // On 8-ball, must hit 8-ball first
      if (!isEight) {
        foul = true;
        foulReason = 'Must hit 8-ball first when on the 8';
      }
    }
  }

  // 4. No contact foul
  if (firstContactBallNumber === null) {
    foul = true;
    foulReason = 'Cue ball failed to contact any ball';
  }

  // 5. Group assignment on first legal non-break potting
  if (!isBreakShot && assignedA === null) {
    const solidPotted = pottedBalls.some((n) => n >= 1 && n <= 7);
    const stripePotted = pottedBalls.some((n) => n >= 9 && n <= 15);

    if (solidPotted && !stripePotted) {
      assignedA = activeTurn === 'A' ? 'solid' : 'stripe';
      assignedB = activeTurn === 'A' ? 'stripe' : 'solid';
    } else if (stripePotted && !solidPotted) {
      assignedA = activeTurn === 'A' ? 'stripe' : 'solid';
      assignedB = activeTurn === 'A' ? 'solid' : 'stripe';
    }
  }

  // 6. Turn continuation or switch
  let ownBallPotted = false;
  if (currentGroup !== null) {
    ownBallPotted = pottedBalls.some((n) =>
      currentGroup === 'solid' ? n >= 1 && n <= 7 : n >= 9 && n <= 15
    );
  } else {
    ownBallPotted = pottedBalls.some((n) => (n >= 1 && n <= 7) || (n >= 9 && n <= 15));
  }

  const ballInHand = foul;
  const continueTurn = !foul && ownBallPotted;
  const nextTurn = continueTurn ? activeTurn : opponentTurn;

  return {
    foul,
    foulReason,
    ballInHand,
    nextTurn,
    assignedGroupA: assignedA,
    assignedGroupB: assignedB,
    isGameOver: false,
    winner: null,
  };
}
