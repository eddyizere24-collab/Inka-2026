import React, { useState, useEffect, useCallback } from 'react';
import { Crown, MessageSquare, Award, ShieldCheck, HeartHandshake } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { GameHud } from './GameHud';
import { calculateDameAdvantage } from '../../utils/matchScoring';
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
  const { currentMatch, updateMatchScore, concludeMatch, setCurrentMatch, t } = usePlatform();

  // 10 pieces per player as specified for Rwandan Dame:
  // Placed on dark squares of 8x8 board
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
      directions.push([-1, -1], [-1, 1]); // Moves up
    } else {
      directions.push([1, -1], [1, 1]); // Moves down
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
      ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
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
    if (turn === 'B' && !isPassAndPlay) return;

    const clickedPiece = getPieceAt(row, col);
    const expectedColor = turn === 'A' ? 'red' : 'black';

    // Select own piece
    if (clickedPiece && clickedPiece.color === expectedColor) {
      setSelectedPiece(clickedPiece);
      setValidMoves(getMovesForPiece(clickedPiece));
      return;
    }

    // Move to valid destination
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
      const scoreResult = calculateDameAdvantage(newCapA, newCapB, isWinA, isWinB);
      updateMatchScore(scoreResult);

      if (isWinA) {
        concludeMatch(t.dameVictoryReason.replace('{player}', currentMatch?.playerA.name ?? ''), false, 'A');
      } else if (isWinB) {
        concludeMatch(t.dameVictoryReason.replace('{player}', currentMatch?.playerB.name ?? ''), false, 'B');
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

        const jumpMoves = availableMoves.filter((am) => am.move.jumpedPiece);
        const chosen = jumpMoves.length > 0
          ? jumpMoves[Math.floor(Math.random() * jumpMoves.length)]
          : availableMoves[Math.floor(Math.random() * availableMoves.length)];

        if (chosen) {
          executeMove(chosen.piece, chosen.move);
        }
        setIsSimulatedOpponentTurn(false);
      }, 1100);

      return () => clearTimeout(timer);
    }
  }, [turn, isPassAndPlay, currentMatch?.status, pieces, getMovesForPiece]);

  if (!currentMatch) return null;

  return (
    <div className="space-y-6">
      {/* Live Game HUD */}
      <GameHud
        match={currentMatch}
        turn={turn}
        customStatsA={
          <span className="text-emerald-400 font-mono">
            {t.dame_captures}: {capturedByA}/10
          </span>
        }
        customStatsB={
          <span className="text-cyan-400 font-mono">
            {t.dame_captures}: {capturedByB}/10
          </span>
        }
        onTimeout={(p) => {
          sounds.playTimerWarning();
        }}
      />

      {/* Match Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Board Area */}
        <div className="lg:col-span-3 flex flex-col items-center">
          {/* Mode Switcher */}
          <div className="w-full max-w-xl flex items-center justify-between mb-3 px-1 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200">{t.dameSubtitle}</span>
              <span className="text-slate-500">·</span>
              <span>{t.dameBoardLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={isPassAndPlay}
                  onChange={(e) => setIsPassAndPlay(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-500 cursor-pointer"
                />
                <span>{t.passAndPlayLabel}</span>
              </label>
            </div>
          </div>

          {/* Checkerboard */}
          <div className="relative p-3 sm:p-4 bg-[#1e2736] border-4 border-[#2c394d] rounded-2xl shadow-2xl">
            <div className="grid grid-cols-8 grid-rows-8 w-[320px] h-[320px] sm:w-[480px] sm:h-[480px] border border-[#141b27] rounded-lg overflow-hidden">
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
                      aria-label={t.squareAccessibleLabel.replace('{row}', String(r + 1)).replace('{col}', String(c + 1)).replace('{piece}', piece ? t.pieceLabel : '')}
                      className={`relative flex items-center justify-center transition-colors ${
                        isDarkSquare ? 'bg-[#1b2636]' : 'bg-[#e2e8f0]'
                      } ${isValidMove ? 'ring-4 ring-emerald-400/80 ring-inset cursor-pointer' : ''}`}
                    >
                      {/* Highlight move dot */}
                      {isValidMove && !piece && (
                        <div className="w-4 h-4 rounded-full bg-emerald-400/70 shadow-md animate-pulse" />
                      )}

                      {/* Piece rendering */}
                      {piece && (
                        <div
                          className={`w-[28px] h-[28px] sm:w-[42px] sm:h-[42px] rounded-full shadow-lg flex items-center justify-center transition-transform ${
                            piece.color === 'red'
                              ? 'bg-gradient-to-b from-emerald-500 to-teal-700 border-2 border-emerald-300 text-white'
                              : 'bg-gradient-to-b from-slate-700 to-slate-950 border-2 border-slate-500 text-slate-200'
                          } ${isSelected ? 'scale-110 ring-4 ring-white' : 'hover:scale-105'}`}
                        >
                          {piece.isKing ? (
                            <Crown className="w-5 h-5 text-amber-300 fill-amber-300" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-white/30" />
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
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>
                  {currentMatch.playerA.name}: <strong>{capturedByA}</strong> / 10
                </span>
              </div>
              <div className="font-mono text-emerald-400 font-medium">
                {isSimulatedOpponentTurn ? t.opponentCalculatingMove : `${t.turnLabel}: ${turn === 'A' ? currentMatch.playerA.name : currentMatch.playerB.name}`}
              </div>
              <div className="flex items-center gap-2">
                <span>
                  {currentMatch.playerB.name}: <strong>{capturedByB}</strong> / 10
                </span>
                <div className="w-3 h-3 rounded-full bg-slate-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Match Sidebar */}
        <div className="space-y-4">
          <div className="p-4 bg-[#141a24] border border-slate-800 rounded-xl space-y-3">
            <h4 className="text-sm font-bold text-slate-200 font-display flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t.fair_play}</span>
            </h4>
            <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
              <p>{t.zero_wagering_rule}</p>
              <div className="p-2.5 bg-[#0e131b] rounded-lg font-mono text-[11px] text-emerald-300 space-y-1">
                <div>{t.netCaptureDifference}: {Math.abs(capturedByA - capturedByB)} {t.piecesUnit}</div>
                <div>{t.skillAdvantageLabel} (w): {(currentMatch.advantage * 100).toFixed(0)}%</div>
                <div>{t.leaderLabel}: {currentMatch.leader ? (currentMatch.leader === 'A' ? currentMatch.playerA.name : currentMatch.playerB.name) : t.levelStanding}</div>
              </div>
              <p className="text-[11px] text-slate-500">
                {t.freeSkillCompetitionNotice}
              </p>
            </div>
          </div>

          {/* Post-match summary or spectator comments if concluded */}
          {currentMatch.status === 'concluded' ? (
            <div className="p-4 bg-emerald-950/40 border border-emerald-700/60 rounded-xl text-emerald-200 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 font-display font-bold text-sm">
                <Award className="w-5 h-5 text-emerald-400" />
                <span>{t.matchConcluded}</span>
              </div>
              <p className="text-xs text-slate-300">
                {currentMatch.concludeReason || t.matchFinishedHonorMessage}
              </p>
              <div className="p-3 bg-[#10151d] rounded-lg text-xs font-mono text-emerald-300 flex justify-between">
                <span>{t.honorPointsAwarded}:</span>
                <strong className="text-white">+10 {t.honorPointsLabel}</strong>
              </div>

              {/* Reveal spectator comments */}
              <div className="pt-2 border-t border-emerald-800/60">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 mb-2">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.spectators_watching} ({currentMatch.comments.length}):</span>
                </div>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {currentMatch.comments.map((c) => (
                    <div key={c.id} className="text-[11px] bg-[#161c24] p-2 rounded border border-slate-800">
                      <span className="font-semibold text-emerald-300">{c.author}:</span>{' '}
                      <span className="text-slate-300">{c.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setCurrentMatch(null)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors cursor-pointer"
              >
                {t.backToLobby}
              </button>
            </div>
          ) : (
            <div className="p-4 bg-[#141a24] border border-slate-800 rounded-xl text-xs text-slate-400 space-y-2">
              <div className="font-semibold text-slate-200">{t.live_spectators}</div>
              <p>
                {currentMatch.spectatorsCount} {t.spectators_watching}. {t.spectator_comments_hidden}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
