import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialDamePieces,
  getAllLegalActions,
  applyDameMove,
  checkDameTerminalState,
  getAvailableMovesForPiece,
} from './dameEngine.ts';
import {
  createInitialIgisoroBoard,
  countTotalSeeds,
  executeIgisoroSow,
  hasLegalIgisoroMove,
  getIgisoroSeedCounts,
} from './igisoroEngine.ts';
import { evaluateBiyariShot } from './biyariEngine.ts';

// ==========================================
// DAME (CHECKERS) RULE ENGINE TESTS
// ==========================================

test('Dame Engine: Initial board has exactly 10 red and 10 black pieces', () => {
  const pieces = createInitialDamePieces();
  const red = pieces.filter((p) => p.color === 'red');
  const black = pieces.filter((p) => p.color === 'black');

  assert.equal(red.length, 10, 'Player A must have exactly 10 pieces');
  assert.equal(black.length, 10, 'Player B must have exactly 10 pieces');
  assert.equal(pieces.every((p) => !p.isKing), true, 'No piece starts as king');
});

test('Dame Engine: Mandatory capture rule enforces captures over regular moves', () => {
  // Setup scenario where a red piece can capture a black piece
  const pieces = [
    { id: 1, color: 'red' as const, row: 5, col: 2, isKing: false },
    { id: 2, color: 'black' as const, row: 4, col: 3, isKing: false },
    { id: 3, color: 'red' as const, row: 7, col: 0, isKing: false }, // Has regular move only
  ];

  const actions = getAllLegalActions(pieces, 'red');
  assert.ok(actions.length > 0);
  assert.ok(actions.every((a) => a.move.jumpedPiece != null), 'All legal actions must be captures when a capture is available');
  assert.equal(actions[0].piece.id, 1, 'Only the capturing piece has legal actions');
  assert.equal(actions[0].move.row, 3);
  assert.equal(actions[0].move.col, 4);
});

test('Dame Engine: King promotion on reaching opponent back rank', () => {
  const pieces = [
    { id: 1, color: 'red' as const, row: 1, col: 2, isKing: false },
  ];

  const result = applyDameMove(pieces, 1, { row: 0, col: 1 });
  assert.equal(result.newlyCrowned, true, 'Piece advancing to row 0 must be promoted to King');
  assert.equal(result.movedPiece.isKing, true);
});

test('Dame Engine: Chained multi-capture detects consecutive jump', () => {
  // Red piece at (5, 0) can jump black at (4, 1) to land at (3, 2),
  // then from (3, 2) can immediately jump another black at (2, 3) to land at (1, 4)
  const pieces = [
    { id: 1, color: 'red' as const, row: 5, col: 0, isKing: false },
    { id: 2, color: 'black' as const, row: 4, col: 1, isKing: false },
    { id: 3, color: 'black' as const, row: 2, col: 3, isKing: false },
  ];

  const firstStep = applyDameMove(pieces, 1, { row: 3, col: 2, jumpedPiece: pieces[1] });
  assert.equal(firstStep.wasCapture, true);
  assert.equal(firstStep.canContinueChain, true, 'Must detect chained multi-capture opportunity');

  const secondStep = applyDameMove(firstStep.newPieces, firstStep.movedPiece.id, {
    row: 1,
    col: 4,
    jumpedPiece: firstStep.newPieces.find((p) => p.id === 3),
  });
  assert.equal(secondStep.wasCapture, true);
  assert.equal(secondStep.canContinueChain, false, 'No more captures remain');
});

test('Dame Engine: Terminal checkmate when opponent is blocked (0 legal moves)', () => {
  // Red has pieces, black has a piece completely trapped
  const pieces = [
    { id: 1, color: 'black' as const, row: 0, col: 1, isKing: false },
    { id: 2, color: 'red' as const, row: 1, col: 0, isKing: false },
    { id: 3, color: 'red' as const, row: 1, col: 2, isKing: false },
    // Put blockers so black cannot jump
    { id: 4, color: 'red' as const, row: 2, col: 3, isKing: false },
  ];

  const terminalState = checkDameTerminalState(pieces, 'black');
  assert.equal(terminalState.isOver, true, 'Blocked player with no legal moves must lose');
  assert.equal(terminalState.winner, 'A', 'Player A must win when Black is blocked');
  assert.equal(terminalState.reason, 'no_legal_moves');
});

// ==========================================
// IGISORO RULE ENGINE TESTS
// ==========================================

test('Igisoro Engine: Total seed conservation is strictly invariant at 64 seeds', () => {
  const board = createInitialIgisoroBoard();
  assert.equal(countTotalSeeds(board), 64, 'Initial board must have exactly 64 seeds');

  // Perform multiple sowing moves and verify conservation
  const move1 = executeIgisoroSow(board, 2, 0, 'A');
  assert.equal(countTotalSeeds(move1.newBoard), 64, 'Total seeds must remain exactly 64 after Player A move');

  const move2 = executeIgisoroSow(move1.newBoard, 1, 7, 'B');
  assert.equal(countTotalSeeds(move2.newBoard), 64, 'Total seeds must remain exactly 64 after Player B move');
});

test('Igisoro Engine: Rejects sowing from pit with less than 2 seeds', () => {
  const board = createInitialIgisoroBoard();
  board[2][0] = 1; // Set pit to 1 seed

  assert.throws(
    () => executeIgisoroSow(board, 2, 0, 'A'),
    /at least 2 seeds/,
    'Must reject sowing a pit with only 1 seed'
  );
});

test('Igisoro Engine: Gusiba captures front and back row opponent seeds', () => {
  const board = createInitialIgisoroBoard();
  // Clear board and place specific tactical test scenario
  for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) board[r][c] = 0;

  // Player A pit at row 2 col 0 has 2 seeds.
  // Path for A: (2, 0) -> (2, 1) -> (2, 2)...
  // Last seed lands at (2, 2).
  board[2][0] = 2;
  board[2][2] = 1; // Landing pit has 1 seed already, so after sowing it will have 2 seeds!

  // Opponent B opposing pits at col 2:
  board[1][2] = 3; // Opponent front row
  board[0][2] = 2; // Opponent back row
  // Give Player B another pit so B is not blocked immediately
  board[1][5] = 4;

  const result = executeIgisoroSow(board, 2, 0, 'A');
  assert.equal(result.capturedCount, 5, 'Must capture front (3) + back (2) = 5 seeds');
  assert.equal(result.newBoard[1][2], 0, 'Opponent front pit must be emptied');
  assert.equal(result.newBoard[0][2], 0, 'Opponent back pit must be emptied');
  assert.equal(result.newBoard[2][2], 1 + 1 + 5, 'Landing pit receives sown seed + 5 captured seeds = 7');
});

test('Igisoro Engine: Player loses when possessing no pit with >= 2 seeds', () => {
  const board = createInitialIgisoroBoard();
  for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) board[r][c] = 0;

  // Player A has playable pits
  board[2][0] = 4;
  board[2][1] = 4;

  // Player B only has single seeds (no pit has >= 2)
  board[0][0] = 1;
  board[1][1] = 1;

  assert.equal(hasLegalIgisoroMove(board, 'B'), false, 'Player B with only 1 seed per pit has no legal moves');
  assert.equal(hasLegalIgisoroMove(board, 'A'), true, 'Player A with 4 seeds in pits has legal moves');
});

// ==========================================
// BIYARI (8-BALL POOL) RULE ENGINE TESTS
// ==========================================

test('Biyari Engine: Scratch fouls trigger Ball-in-Hand', () => {
  const evaluation = evaluateBiyariShot({
    isBreakShot: false,
    assignedGroupA: 'solid',
    assignedGroupB: 'stripe',
    pottedA: 3,
    pottedB: 2,
    cueBallScratched: true,
    firstContactBallNumber: 1,
    pottedBalls: [1],
    calledPocketId: null,
    targetPocketForEight: null,
    activeTurn: 'A',
  });

  assert.equal(evaluation.foul, true);
  assert.equal(evaluation.ballInHand, true, 'Scratch must award Ball-in-Hand');
  assert.equal(evaluation.nextTurn, 'B', 'Turn switches to opponent on foul');
});

test('Biyari Engine: Early 8-ball potting triggers immediate loss', () => {
  const evaluation = evaluateBiyariShot({
    isBreakShot: false,
    assignedGroupA: 'solid',
    assignedGroupB: 'stripe',
    pottedA: 5, // Player A has only potted 5/7 solids
    pottedB: 4,
    cueBallScratched: false,
    firstContactBallNumber: 8,
    pottedBalls: [8],
    calledPocketId: 1,
    targetPocketForEight: 1,
    activeTurn: 'A',
  });

  assert.equal(evaluation.isGameOver, true);
  assert.equal(evaluation.winner, 'B', 'Opponent wins when 8-ball is potted early');
  assert.ok(evaluation.lossReason?.includes('Loss'));
});

test('Biyari Engine: Legal 8-ball in called pocket after clearing group awards victory', () => {
  const evaluation = evaluateBiyariShot({
    isBreakShot: false,
    assignedGroupA: 'solid',
    assignedGroupB: 'stripe',
    pottedA: 7, // All 7 solids already potted!
    pottedB: 4,
    cueBallScratched: false,
    firstContactBallNumber: 8,
    pottedBalls: [8],
    calledPocketId: 3,
    targetPocketForEight: 3, // Potted in the called pocket!
    activeTurn: 'A',
  });

  assert.equal(evaluation.isGameOver, true);
  assert.equal(evaluation.winner, 'A', 'Player A wins on legal 8-ball victory');
  assert.equal(evaluation.foul, false);
});

test('Biyari Engine: Wrong-pocket 8-ball triggers loss', () => {
  const evaluation = evaluateBiyariShot({
    isBreakShot: false,
    assignedGroupA: 'solid',
    assignedGroupB: 'stripe',
    pottedA: 7,
    pottedB: 4,
    cueBallScratched: false,
    firstContactBallNumber: 8,
    pottedBalls: [8],
    calledPocketId: 2,
    targetPocketForEight: 5, // Potted in pocket 5 instead of called pocket 2!
    activeTurn: 'A',
  });

  assert.equal(evaluation.isGameOver, true);
  assert.equal(evaluation.winner, 'B', 'Potting 8-ball in wrong pocket is a loss');
});
