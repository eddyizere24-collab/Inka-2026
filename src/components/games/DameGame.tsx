import React, { useState, useEffect, useCallback } from 'react';
import { Crown, RotateCcw, MessageSquare, Award } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { SettlementBar } from './SettlementBar';
import { calculateDameAdvantage } from '../../utils/settlement';
import { sounds } from '../../utils/sound';

type PieceColor = 'red' | 'black'; // red = Player A, black = Player B

interface Piece {
  id: string;
  color: PieceColor;
  isKing: boolean;
  row: number;
  col: number;
}

export const DameGame: React.FC = () => {
  const { currentMatch, updateMatchAdvantage, settleMatch, setCurrentMatch } = usePlatform();

  // 10 pieces per player as specified in Concept Document Section 3.2 & Appendix C.13
  // Placed on dark squares:
  // Player B (Black/Top): 10 pieces
  // (0,1), (0,3), (0,5), (0,7) [4 pieces]
  // (1,0), (1,2), (1,4), (1,6) [4 pieces]
  // (2,1), (2,3)               [2 pieces] -> Total 10 pieces!
  // Player A (Red/Bottom): 10 pieces
  // (5,4), (5,6)               [2 pieces]
  // (6,1), (6,3), (6,5), (6,7) [4 pieces]
  // (7,0), (7,2), (7,4), (7,6) [4 pieces] -> Total 10 pieces!
  const getInitialPieces = (): Piece[] => {
    const pieces: Piece[] = [];
    let idCounter = 1;

    // Black pieces (Player B, top) - 10 pieces
    const blackCoords = [
      [0, 1], [0, 3], [0, 5], [0, 7],
      [1, 0], [1, 2], [1, 4], [1, 6],
      [2, 1], [2, 3],
    ];
    blackCoords.forEach(([r, c]) => {
      pieces.push({ id: `b-${idCounter++}`, color: 'black', isKing: false, row: r, col: c });
    });

    // Red pieces (Player A, bottom) - 10 pieces
    const redCoords = [
      [5, 4], [5, 6],
      [6, 1], [6, 3], [6, 5], [6, 7],
      [7, 0], [7, 2], [7, 4], [7, 6],
    ];
    redCoords.forEach(([r, c]) => {
      pieces.push({ id: `r-${idCounter++}`, color: 'red', isKing: false, row: r, col: c });
    });

    return pieces;
  };

  const [pieces, setPieces] = useState<Piece[]>(getInitialPieces);
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [validMoves, setValidMoves] = useState<{ row: number; col: number; jumpedPiece?: Piece }[]>([]);
  const [capturedByA, setCapturedByA] = useState<number>(0);
  const [capturedByB, setCapturedByB] = useState<number>(0);
  const [turn, setTurn] = useState<'A' | 'B'>('A'); // A = Red (User), B = Black (Opponent)
  const [isSimulatedOpponentTurn, setIsSimulatedOpponentTurn] = useState<boolean>(false);
  const [isPassAndPlay, setIsPassAndPlay] = useState<boolean>(false);

  // Advantage calculation handled inside executeMove upon piece capture

  const getPieceAt = useCallback((row: number, col: number) => {
    return pieces.find((p) => p.row === row && p.col === col);
  }, [pieces]);

  // Compute legal moves for a piece
  const getMovesForPiece = useCallback((piece: Piece) => {
    const moves: { row: number; col: number; jumpedPiece?: Piece }[] = [];
    const directions: number[][] = [];

    if (piece.isKing) {
      directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
    } else if (piece.color === 'red') {
      // Moves up towards row 0
      directions.push([-1, -1], [-1, 1]);
    } else {
      // Moves down towards row 7
      directions.push([1, -1], [1, 1]);
    }

    // Regular moves
    for (const [dr, dc] of directions) {
      const nr = piece.row + dr;
      const nc = piece.col + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        if (!getPieceAt(nr, nc)) {
          moves.push({ row: nr, col: nc });
        }
      }
    }

    // Jump moves (over opponent)
    const jumpDirs = piece.isKing
      ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
      : piece.color === 'red'
      ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] // Checkers allows backward capture in classic rules
      : [[1, -1], [1, 1], [-1, -1], [-1, 1]];

    for (const [dr, dc] of jumpDirs) {
      const midR = piece.row + dr;
      const midC = piece.col + dc;
      const landR = piece.row + dr * 2;
      const landC = piece.col + dc * 2;

      if (landR >= 0 && landR < 8 && landC >= 0 && landC < 8) {
        const midPiece = getPieceAt(midR, midC);
        const landPiece = getPieceAt(landR, landC);

        if (midPiece && midPiece.color !== piece.color && !landPiece) {
          moves.push({ row: landR, col: landC, jumpedPiece: midPiece });
        }
      }
    }

    return moves;
  }, [getPieceAt]);

  const handleSquareClick = (row: number, col: number) => {
    if (currentMatch?.status !== 'playing') return;
    if (turn === 'B' && !isPassAndPlay) return; // Wait for opponent

    const clickedPiece = getPieceAt(row, col);
    const expectedColor = turn === 'A' ? 'red' : 'black';

    // If clicked own piece, select it
    if (clickedPiece && clickedPiece.color === expectedColor) {
      setSelectedPiece(clickedPiece);
      setValidMoves(getMovesForPiece(clickedPiece));
      return;
    }

    // If destination square is valid
    if (selectedPiece) {
      const move = validMoves.find((m) => m.row === row && m.col === col);
      if (move) {
        executeMove(selectedPiece, move);
      }
    }
  };

  const executeMove = (
    piece: Piece,
    move: { row: number; col: number; jumpedPiece?: Piece }
  ) => {
    let newPieces = pieces.filter((p) => p.id !== piece.id);

    // If jumped over a piece, capture it
    if (move.jumpedPiece) {
      newPieces = newPieces.filter((p) => p.id !== move.jumpedPiece!.id);
      const newCapA = piece.color === 'red' ? capturedByA + 1 : capturedByA;
      const newCapB = piece.color === 'black' ? capturedByB + 1 : capturedByB;
      setCapturedByA(newCapA);
      setCapturedByB(newCapB);
      sounds.playCapture();

      const isWinA = newCapA >= 10;
      const isWinB = newCapB >= 10;
      const { leader, w } = calculateDameAdvantage(newCapA, newCapB, isWinA, isWinB);
      updateMatchAdvantage(leader, w);

      if (isWinA) {
        settleMatch(`Decisive Victory by ${currentMatch?.playerA.name} (All 10 pieces captured)`);
      } else if (isWinB) {
        settleMatch(`Decisive Victory by ${currentMatch?.playerB.name} (All 10 pieces captured)`);
      }
    } else {
      sounds.playMove();
    }

    // Check king promotion
    const isNowKing =
      piece.isKing ||
      (piece.color === 'red' && move.row === 0) ||
      (piece.color === 'black' && move.row === 7);

    newPieces.push({
      ...piece,
      row: move.row,
      col: move.col,
      isKing: isNowKing,
    });

    setPieces(newPieces);
    setSelectedPiece(null);
    setValidMoves([]);

    const nextTurn = turn === 'A' ? 'B' : 'A';
    setTurn(nextTurn);
  };

  // Automated friendly opponent move (if not pass-and-play)
  useEffect(() => {
    if (turn === 'B' && !isPassAndPlay && currentMatch?.status === 'playing') {
      setIsSimulatedOpponentTurn(true);
      const timer = setTimeout(() => {
        const blackPieces = pieces.filter((p) => p.color === 'black');
        let availableMoves: { piece: Piece; move: { row: number; col: number; jumpedPiece?: Piece } }[] = [];

        for (const p of blackPieces) {
          const mList = getMovesForPiece(p);
          for (const m of mList) {
            availableMoves.push({ piece: p, move: m });
          }
        }

        // Prioritize jump captures
        const jumpMoves = availableMoves.filter((am) => am.move.jumpedPiece);
        const chosen = jumpMoves.length > 0
          ? jumpMoves[Math.floor(Math.random() * jumpMoves.length)]
          : availableMoves[Math.floor(Math.random() * availableMoves.length)];

        if (chosen) {
          executeMove(chosen.piece, chosen.move);
        }
        setIsSimulatedOpponentTurn(false);
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [turn, isPassAndPlay, currentMatch?.status, pieces, getMovesForPiece]);

  if (!currentMatch) return null;

  return (
    <div className="space-y-6">
      {/* Live Settlement Bar HUD */}
      <SettlementBar
        match={currentMatch}
        turn={turn}
        onStop={() => settleMatch(`Voluntary stop by ${currentMatch.playerA.name}`)}
        onTimeout={(p) => {
          sounds.playInkaChime();
          // Apply slight penalty or timeout
        }}
      />

      {/* Match Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Board Area */}
        <div className="lg:col-span-3 flex flex-col items-center">
          {/* Mode Switcher: Pass & Play vs Live Online Opponent */}
          <div className="w-full max-w-xl flex items-center justify-between mb-3 px-1 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200">Dame: 10 Pieces Per Player</span>
              <span className="text-slate-500">·</span>
              <span>8×8 Board</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={isPassAndPlay}
                  onChange={(e) => setIsPassAndPlay(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-amber-500"
                />
                <span>Pass & Play / 2-Player Seat</span>
              </label>
            </div>
          </div>

          {/* Checkerboard */}
          <div className="relative p-4 bg-[#231b14] border-4 border-[#3e2c1c] rounded-2xl shadow-2xl">
            <div className="grid grid-cols-8 grid-rows-8 w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] border border-[#1b130a] rounded-lg overflow-hidden">
              {Array.from({ length: 8 }).map((_, r) =>
                Array.from({ length: 8 }).map((_, c) => {
                  const isDarkSquare = (r + c) % 2 === 1;
                  const piece = getPieceAt(r, c);
                  const isSelected = selectedPiece?.id === piece?.id;
                  const isValidMove = validMoves.some((m) => m.row === r && m.col === c);

                  return (
                    <button
                      key={`${r}-${c}`}
                      type="button"
                      onClick={() => handleSquareClick(r, c)}
                      aria-label={`Square ${r},${c} ${piece ? piece.color + ' piece' : ''}`}
                      className={`relative flex items-center justify-center transition-colors ${
                        isDarkSquare ? 'bg-[#503623]' : 'bg-[#e5d3b3]'
                      } ${isValidMove ? 'ring-4 ring-amber-400/80 ring-inset cursor-pointer' : ''}`}
                    >
                      {/* Highlight move dot */}
                      {isValidMove && !piece && (
                        <div className="w-4 h-4 rounded-full bg-amber-400/60 shadow-md animate-pulse" />
                      )}

                      {/* Piece rendering */}
                      {piece && (
                        <div
                          className={`w-[32px] h-[32px] sm:w-[44px] sm:h-[44px] rounded-full shadow-lg flex items-center justify-center transition-transform ${
                            piece.color === 'red'
                              ? 'bg-gradient-to-b from-amber-500 to-amber-700 border-2 border-amber-300 text-amber-100'
                              : 'bg-gradient-to-b from-slate-700 to-slate-900 border-2 border-slate-500 text-slate-200'
                          } ${isSelected ? 'scale-110 ring-4 ring-white' : 'hover:scale-105'}`}
                        >
                          {piece.isKing ? (
                            <Crown className="w-5 h-5 text-amber-200 fill-amber-300" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-white/20" />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Turn status overlay pill */}
            <div className="mt-3 flex items-center justify-between text-xs text-slate-300 px-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span>
                  {currentMatch.playerA.name}: Captured <strong>{capturedByA}</strong> / 10
                </span>
              </div>
              <div className="font-mono text-amber-400">
                {isSimulatedOpponentTurn ? 'Opponent calculating move...' : `Turn: ${turn === 'A' ? currentMatch.playerA.name : currentMatch.playerB.name}`}
              </div>
              <div className="flex items-center gap-2">
                <span>
                  {currentMatch.playerB.name}: Captured <strong>{capturedByB}</strong> / 10
                </span>
                <div className="w-3 h-3 rounded-full bg-slate-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Match Sidebar: Match details, formula recap, and post-game spectator feedback */}
        <div className="space-y-4">
          <div className="p-4 bg-[#141a22] border border-slate-800 rounded-xl space-y-3">
            <h4 className="text-sm font-bold text-slate-200 font-display">
              Settlement Invariant (Section 7.3)
            </h4>
            <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
              <p>
                As captures occur, the advantage variable <code>w</code> updates:
              </p>
              <div className="p-2.5 bg-[#0e131a] rounded-lg font-mono text-[11px] text-amber-300 space-y-1">
                <div>Net Difference: {Math.abs(capturedByA - capturedByB)} pieces</div>
                <div>Advantage (w): {currentMatch.w.toFixed(2)}</div>
                <div>Current Holding: {currentMatch.holdingA.toFixed(2)} inka</div>
              </div>
              <p className="text-[11px] text-slate-500">
                Notice: Kings count equally in the inka valuation formula per platform specification.
              </p>
            </div>
          </div>

          {/* Post-match summary or spectator comments if settled */}
          {currentMatch.status === 'settled' ? (
            <div className="p-4 bg-emerald-950/30 border border-emerald-800/50 rounded-xl text-emerald-200 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 font-display font-bold text-sm">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Match Concluded & Settled</span>
              </div>
              <p className="text-xs text-slate-300">
                {currentMatch.settlementReason}
              </p>
              <div className="p-3 bg-[#10141a] rounded-lg text-xs font-mono text-amber-300 flex justify-between">
                <span>Final Holding:</span>
                <strong className="text-white">{currentMatch.holdingA.toFixed(2)} Inka</strong>
              </div>

              {/* Reveal spectator comments (Section 8.3 & Appendix A) */}
              <div className="pt-2 border-t border-emerald-900/60">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 mb-2">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Spectator Feedback (Now Revealed):</span>
                </div>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {currentMatch.comments.map((c) => (
                    <div key={c.id} className="text-[11px] bg-[#161c24] p-2 rounded border border-slate-800">
                      <span className="font-semibold text-slate-300">{c.author}:</span>{' '}
                      <span className="text-slate-400">{c.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setCurrentMatch(null)}
                className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
              >
                Return to Lobby
              </button>
            </div>
          ) : (
            <div className="p-4 bg-[#141a22] border border-slate-800 rounded-xl text-xs text-slate-400 space-y-2">
              <div className="font-semibold text-slate-200">Spectator Room Status</div>
              <p>
                {currentMatch.spectatorsCount} people are watching this match live. Under platform rules,
                spectator comments are withheld until completion to eliminate outside advice.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
