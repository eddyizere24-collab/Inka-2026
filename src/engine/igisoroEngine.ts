/**
 * INKA Igisoro Authoritative Rule Engine
 * Implements Rwandan Igisoro (4x8 mancala variant):
 * - 4 rows x 8 columns = 32 pits
 * - 64 seeds total (strictly conserved across every move)
 * - Row 0 & 1: Player B territory (North)
 * - Row 2 & 3: Player A territory (South)
 * - Rows 1 & 2 are the front battle rows where Gusiba (capture) occurs
 * - Counter-clockwise circular sowing on player's 16 pits
 * - Must have at least 2 seeds in a pit to sow
 * - Gusiba: last seed lands in occupied front pit + opponent opposing front pit has seeds -> capture both front and back
 * - Loss condition: all seeds eliminated or no pit has >= 2 seeds (kubura umuti)
 */

export type IgisoroBoard = number[][]; // 4 rows x 8 cols

export interface PitPosition {
  r: number;
  c: number;
}

/**
 * Creates the standard initial 64-seed Igisoro board.
 * In tournament Igisoro, seeds are arranged symmetrically:
 * 4 seeds in each pit of row 1 (Player B front row, 8x4 = 32)
 * 4 seeds in each pit of row 2 (Player A front row, 8x4 = 32)
 * Total: 64 seeds exactly.
 */
export function createInitialIgisoroBoard(): IgisoroBoard {
  return [
    [0, 0, 0, 0, 0, 0, 0, 0], // Row 0: Player B Back
    [4, 4, 4, 4, 4, 4, 4, 4], // Row 1: Player B Front (32 seeds)
    [4, 4, 4, 4, 4, 4, 4, 4], // Row 2: Player A Front (32 seeds)
    [0, 0, 0, 0, 0, 0, 0, 0], // Row 3: Player A Back
  ];
}

/**
 * Validates the strict total seed conservation invariant.
 */
export function countTotalSeeds(board: IgisoroBoard): number {
  let sum = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 8; c++) {
      sum += board[r][c];
    }
  }
  return sum;
}

/**
 * Returns seeds owned by Player A (rows 2, 3) and Player B (rows 0, 1).
 */
export function getIgisoroSeedCounts(board: IgisoroBoard): { seedsA: number; seedsB: number } {
  let seedsA = 0;
  let seedsB = 0;
  for (let c = 0; c < 8; c++) {
    seedsB += board[0][c] + board[1][c];
    seedsA += board[2][c] + board[3][c];
  }
  return { seedsA, seedsB };
}

/**
 * Counter-clockwise circular path for Player A (rows 2 and 3).
 * Sowing goes right along front row 2 (0..7), then left along back row 3 (7..0).
 */
export function getPlayerAPath(): PitPosition[] {
  const path: PitPosition[] = [];
  for (let c = 0; c < 8; c++) path.push({ r: 2, c });
  for (let c = 7; c >= 0; c--) path.push({ r: 3, c });
  return path;
}

/**
 * Counter-clockwise circular path for Player B (rows 0 and 1).
 * Sowing goes left along front row 1 (7..0), then right along back row 0 (0..7).
 */
export function getPlayerBPath(): PitPosition[] {
  const path: PitPosition[] = [];
  for (let c = 7; c >= 0; c--) path.push({ r: 1, c });
  for (let c = 0; c < 8; c++) path.push({ r: 0, c });
  return path;
}

/**
 * Checks if a player has any legal move (at least one pit with >= 2 seeds).
 */
export function hasLegalIgisoroMove(board: IgisoroBoard, player: 'A' | 'B'): boolean {
  const rows = player === 'A' ? [2, 3] : [0, 1];
  for (const r of rows) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] >= 2) return true;
    }
  }
  return false;
}

export interface SowResult {
  newBoard: IgisoroBoard;
  capturedCount: number;
  capturedPositions: PitPosition[];
  landingPit: PitPosition;
  isGameOver: boolean;
  winner: 'A' | 'B' | null;
  reason: string | null;
}

/**
 * Pure authoritative sowing function that executes a move and applies Gusiba captures.
 */
export function executeIgisoroSow(
  board: IgisoroBoard,
  startR: number,
  startC: number,
  player: 'A' | 'B'
): SowResult {
  // Check ownership
  const isPlayerA = startR >= 2;
  if ((player === 'A' && !isPlayerA) || (player === 'B' && isPlayerA)) {
    throw new Error('Cannot sow opponent pit');
  }

  // Must have >= 2 seeds
  if (board[startR][startC] < 2) {
    throw new Error('Must have at least 2 seeds to sow');
  }

  const path = player === 'A' ? getPlayerAPath() : getPlayerBPath();
  let currentIdx = path.findIndex((p) => p.r === startR && p.c === startC);
  if (currentIdx === -1) throw new Error('Pit not found in player path');

  // Clone board
  const liveBoard: IgisoroBoard = board.map((row) => [...row]);
  let seedsInHand = liveBoard[startR][startC];
  liveBoard[startR][startC] = 0;

  // Sow seeds one by one along the circular path
  while (seedsInHand > 0) {
    currentIdx = (currentIdx + 1) % path.length;
    const target = path[currentIdx];
    liveBoard[target.r][target.c] += 1;
    seedsInHand -= 1;
  }

  const landingPit = path[currentIdx];

  // Gusiba Capture Rule:
  // If the last seed drops into an occupied front-row pit (Row 2 for A, Row 1 for B, now containing >= 2 seeds),
  // and the opponent's opposing front-row pit has >= 1 seed:
  let capturedCount = 0;
  const capturedPositions: PitPosition[] = [];

  if (player === 'A' && landingPit.r === 2 && liveBoard[2][landingPit.c] > 1) {
    const oppCol = landingPit.c;
    if (liveBoard[1][oppCol] > 0) {
      capturedCount += liveBoard[1][oppCol];
      liveBoard[1][oppCol] = 0;
      capturedPositions.push({ r: 1, c: oppCol });

      // Capture behind in back row 0 as well if opposing front was captured
      if (liveBoard[0][oppCol] > 0) {
        capturedCount += liveBoard[0][oppCol];
        liveBoard[0][oppCol] = 0;
        capturedPositions.push({ r: 0, c: oppCol });
      }
    }
  } else if (player === 'B' && landingPit.r === 1 && liveBoard[1][landingPit.c] > 1) {
    const oppCol = landingPit.c;
    if (liveBoard[2][oppCol] > 0) {
      capturedCount += liveBoard[2][oppCol];
      liveBoard[2][oppCol] = 0;
      capturedPositions.push({ r: 2, c: oppCol });

      // Capture behind in back row 3 as well if opposing front was captured
      if (liveBoard[3][oppCol] > 0) {
        capturedCount += liveBoard[3][oppCol];
        liveBoard[3][oppCol] = 0;
        capturedPositions.push({ r: 3, c: oppCol });
      }
    }
  }

  // Add captured seeds to landing pit (conservation of seeds)
  if (capturedCount > 0) {
    liveBoard[landingPit.r][landingPit.c] += capturedCount;
  }

  // Check terminal conditions for opponent
  const nextPlayer = player === 'A' ? 'B' : 'A';
  const { seedsA, seedsB } = getIgisoroSeedCounts(liveBoard);

  let isGameOver = false;
  let winner: 'A' | 'B' | null = null;
  let reason: string | null = null;

  if (seedsB === 0) {
    isGameOver = true;
    winner = 'A';
    reason = 'Player B seeds completely eliminated';
  } else if (seedsA === 0) {
    isGameOver = true;
    winner = 'B';
    reason = 'Player A seeds completely eliminated';
  } else if (!hasLegalIgisoroMove(liveBoard, nextPlayer)) {
    isGameOver = true;
    winner = player; // Opponent is blocked with no pit having >= 2 seeds
    reason = `Player ${nextPlayer} has no legal move (no pit with >= 2 seeds)`;
  }

  return {
    newBoard: liveBoard,
    capturedCount,
    capturedPositions,
    landingPit,
    isGameOver,
    winner,
    reason,
  };
}
