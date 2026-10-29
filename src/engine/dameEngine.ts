/**
 * INKA Dame (Checkers) Authoritative Rule Engine
 * Implements strict rules:
 * - 8x8 board with 10 pieces per side
 * - Mandatory capture priority (if any capture is available, only captures are legal)
 * - Chained multi-capture jumps (must continue jumping if landing position allows another capture)
 * - King (Umwamikazi) promotion when reaching opponent back rank
 * - Terminal state detection: win by elimination or when opponent has no legal moves
 */

export interface DamePiece {
  id: number;
  color: 'red' | 'black'; // red = Player A, black = Player B
  row: number;
  col: number;
  isKing: boolean;
}

export interface DameMove {
  row: number;
  col: number;
  jumpedPiece?: DamePiece;
}

export interface LegalAction {
  piece: DamePiece;
  move: DameMove;
}

export function createInitialDamePieces(): DamePiece[] {
  const pieces: DamePiece[] = [];
  let id = 1;

  // Player A (Red) starts on bottom rows 5, 6, 7 (10 pieces on dark squares)
  const redPositions = [
    [7, 0], [7, 2], [7, 4], [7, 6],
    [6, 1], [6, 3], [6, 5], [6, 7],
    [5, 0], [5, 2],
  ];
  for (const [r, c] of redPositions) {
    pieces.push({ id: id++, color: 'red', row: r, col: c, isKing: false });
  }

  // Player B (Black) starts on top rows 0, 1, 2 (10 pieces on dark squares)
  const blackPositions = [
    [0, 1], [0, 3], [0, 5], [0, 7],
    [1, 0], [1, 2], [1, 4], [1, 6],
    [2, 1], [2, 3],
  ];
  for (const [r, c] of blackPositions) {
    pieces.push({ id: id++, color: 'black', row: r, col: c, isKing: false });
  }

  return pieces;
}

export function getPieceAt(pieces: DamePiece[], row: number, col: number): DamePiece | undefined {
  return pieces.find((p) => p.row === row && p.col === col);
}

/**
 * Computes all available moves and captures for a specific piece.
 */
export function getAvailableMovesForPiece(piece: DamePiece, pieces: DamePiece[]): DameMove[] {
  const moves: DameMove[] = [];
  const directions: [number, number][] = [];

  if (piece.isKing) {
    directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
  } else if (piece.color === 'red') {
    directions.push([-1, -1], [-1, 1]); // Advances upward
  } else {
    directions.push([1, -1], [1, 1]); // Advances downward
  }

  // Non-jump step moves
  for (const [dr, dc] of directions) {
    const nr = piece.row + dr;
    const nc = piece.col + dc;
    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      if (!getPieceAt(pieces, nr, nc)) {
        moves.push({ row: nr, col: nc });
      }
    }
  }

  // Jump / Capture moves (All pieces can capture forwards or backwards)
  const jumpDirs: [number, number][] = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  for (const [dr, dc] of jumpDirs) {
    const midR = piece.row + dr;
    const midC = piece.col + dc;
    const landR = piece.row + dr * 2;
    const landC = piece.col + dc * 2;

    if (landR >= 0 && landR < 8 && landC >= 0 && landC < 8) {
      const midPiece = getPieceAt(pieces, midR, midC);
      const landPiece = getPieceAt(pieces, landR, landC);

      if (midPiece && midPiece.color !== piece.color && !landPiece) {
        moves.push({ row: landR, col: landC, jumpedPiece: midPiece });
      }
    }
  }

  return moves;
}

/**
 * Gets jump-only moves for a piece (used for chained captures).
 */
export function getJumpMovesForPiece(piece: DamePiece, pieces: DamePiece[]): DameMove[] {
  return getAvailableMovesForPiece(piece, pieces).filter((m) => m.jumpedPiece != null);
}

/**
 * Computes all legal actions for the current turn.
 * Enforces MANDATORY CAPTURE: if any piece has a capture, ONLY captures are legal!
 */
export function getAllLegalActions(pieces: DamePiece[], activeColor: 'red' | 'black'): LegalAction[] {
  const playerPieces = pieces.filter((p) => p.color === activeColor);
  const allActions: LegalAction[] = [];

  for (const p of playerPieces) {
    const moves = getAvailableMovesForPiece(p, pieces);
    for (const m of moves) {
      allActions.push({ piece: p, move: m });
    }
  }

  // Check if any capture is available
  const captures = allActions.filter((a) => a.move.jumpedPiece != null);
  if (captures.length > 0) {
    // Mandatory capture rule: only capture moves are legal!
    return captures;
  }

  return allActions;
}

/**
 * Executes a move on the board state.
 * Returns the updated pieces, whether it was a capture, whether promotion occurred,
 * and whether the piece can continue jumping (chained multi-capture).
 */
export function applyDameMove(
  pieces: DamePiece[],
  pieceId: number,
  move: DameMove
): {
  newPieces: DamePiece[];
  wasCapture: boolean;
  capturedPiece?: DamePiece;
  newlyCrowned: boolean;
  canContinueChain: boolean;
  movedPiece: DamePiece;
} {
  const piece = pieces.find((p) => p.id === pieceId);
  if (!piece) throw new Error(`Piece with id ${pieceId} not found`);

  let newPieces = pieces.filter((p) => p.id !== pieceId);
  let wasCapture = false;
  let capturedPiece: DamePiece | undefined;

  if (move.jumpedPiece) {
    wasCapture = true;
    capturedPiece = move.jumpedPiece;
    newPieces = newPieces.filter((p) => p.id !== move.jumpedPiece!.id);
  }

  // King promotion
  const becomesKing =
    piece.isKing ||
    (piece.color === 'red' && move.row === 0) ||
    (piece.color === 'black' && move.row === 7);
  const newlyCrowned = !piece.isKing && becomesKing;

  const movedPiece: DamePiece = {
    ...piece,
    row: move.row,
    col: move.col,
    isKing: becomesKing,
  };

  newPieces.push(movedPiece);

  // If was capture and NOT just crowned, check if the piece can continue jumping
  let canContinueChain = false;
  if (wasCapture && !newlyCrowned) {
    const followUpJumps = getJumpMovesForPiece(movedPiece, newPieces);
    canContinueChain = followUpJumps.length > 0;
  }

  return {
    newPieces,
    wasCapture,
    capturedPiece,
    newlyCrowned,
    canContinueChain,
    movedPiece,
  };
}

/**
 * Checks whether the game has reached a terminal state for the active player.
 */
export function checkDameTerminalState(
  pieces: DamePiece[],
  activeTurnColor: 'red' | 'black'
): {
  isOver: boolean;
  winner: 'A' | 'B' | 'draw' | null;
  reason: 'elimination' | 'no_legal_moves' | null;
} {
  const redCount = pieces.filter((p) => p.color === 'red').length;
  const blackCount = pieces.filter((p) => p.color === 'black').length;

  if (redCount === 0) {
    return { isOver: true, winner: 'B', reason: 'elimination' };
  }
  if (blackCount === 0) {
    return { isOver: true, winner: 'A', reason: 'elimination' };
  }

  const legalActions = getAllLegalActions(pieces, activeTurnColor);
  if (legalActions.length === 0) {
    // Current player is blocked and has no legal moves -> loses the match!
    const winner = activeTurnColor === 'red' ? 'B' : 'A';
    return { isOver: true, winner, reason: 'no_legal_moves' };
  }

  return { isOver: false, winner: null, reason: null };
}
