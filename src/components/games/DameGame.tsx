import React, { useState, useEffect, useCallback } from 'react';
import { Crown, MessageSquare, Award, ShieldCheck, Sparkles, Swords } from 'lucide-react';
import { usePlatform, getLocalizedCommentText } from '../../context/PlatformContext';
import { GameHud } from './GameHud';
import { calculateDameAdvantage } from '../../utils/matchScoring';
import { sounds } from '../../utils/sound';

type PieceColor = 'red' | 'black'; // red = Player A (Emerald), black = Player B (Obsidian)

interface Piece {
  id: string;
  color: PieceColor;
  isKing: boolean;
  row: number;
  col: number;
}

interface Move {
  row: number;
  col: number;
  jumpedPiece?: Piece;
  subsequentJumps?: Move[];
}

export const DameGame: React.FC = () => {
  const { currentMatch, updateMatchScore, concludeMatch, setCurrentMatch, lang, t } = usePlatform();

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

    // Red/Emerald pieces (Player A, bottom) - 10 pieces
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
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [capturedByA, setCapturedByA] = useState<number>(0);
  const [capturedByB, setCapturedByB] = useState<number>(0);
  const [turn, setTurn] = useState<'A' | 'B'>('A'); // A = Red (User), B = Black (Opponent)
  const [isSimulatedOpponentTurn, setIsSimulatedOpponentTurn] = useState<boolean>(false);
  const [isPassAndPlay, setIsPassAndPlay] = useState<boolean>(false);
  const [lastMove, setLastMove] = useState<{ fromR: number; fromC: number; toR: number; toC: number } | null>(null);
  const [newlyCrownedId, setNewlyCrownedId] = useState<string | null>(null);

  const getPieceAt = useCallback((row: number, col: number) => {
    return pieces.find((p) => p.row === row && p.col === col);
  }, [pieces]);

  // Compute legal moves and captures for a piece
  const getMovesForPiece = useCallback((piece: Piece) => {
    const moves: Move[] = [];
    const directions: number[][] = [];

    if (piece.isKing) {
      directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
    } else if (piece.color === 'red') {
      directions.push([-1, -1], [-1, 1]); // Advances up
    } else {
      directions.push([1, -1], [1, 1]); // Advances down
    }

    // Regular non-jump moves
    for (const [dr, dc] of directions) {
      const nr = piece.row + dr;
      const nc = piece.col + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        if (!getPieceAt(nr, nc)) {
          moves.push({ row: nr, col: nc });
        }
      }
    }

    // Jump / Capture moves (All pieces can jump forward or backward over opponent)
    const jumpDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

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
      const moves = getMovesForPiece(clickedPiece);
      setValidMoves(moves);
      return;
    }

    // Move selected piece to destination
    if (selectedPiece) {
      const move = validMoves.find((m) => m.row === row && m.col === col);
      if (move) {
        executeMove(selectedPiece, move);
      }
    }
  };

  const executeMove = (piece: Piece, move: Move) => {
    const fromR = piece.row;
    const fromC = piece.col;
    let newPieces = pieces.filter((p) => p.id !== piece.id);

    // If jumped over a piece, capture it
    let wasCapture = false;
    let newCapA = capturedByA;
    let newCapB = capturedByB;

    if (move.jumpedPiece) {
      wasCapture = true;
      newPieces = newPieces.filter((p) => p.id !== move.jumpedPiece!.id);
      if (piece.color === 'red') {
        newCapA += 1;
        setCapturedByA(newCapA);
      } else {
        newCapB += 1;
        setCapturedByB(newCapB);
      }
      sounds.playCapture();

      const isWinA = newCapA >= 10;
      const isWinB = newCapB >= 10;
      const scoreResult = calculateDameAdvantage(newCapA, newCapB, isWinA, isWinB);
      updateMatchScore(scoreResult);

      if (isWinA) {
        concludeMatch(t.dameVictoryReason.replace('{player}', currentMatch?.playerA.name ?? ''), false, 'A');
        return;
      } else if (isWinB) {
        concludeMatch(t.dameVictoryReason.replace('{player}', currentMatch?.playerB.name ?? ''), false, 'B');
        return;
      }
    } else {
      sounds.playMove();
    }

    // Check King/Dame promotion (Umwamikazi)
    const isNowKing =
      piece.isKing ||
      (piece.color === 'red' && move.row === 0) ||
      (piece.color === 'black' && move.row === 7);

    if (!piece.isKing && isNowKing) {
      sounds.playCrownChime();
      setNewlyCrownedId(piece.id);
      setTimeout(() => setNewlyCrownedId(null), 1500);
    }

    const movedPiece: Piece = {
      ...piece,
      row: move.row,
      col: move.col,
      isKing: isNowKing,
    };

    newPieces.push(movedPiece);
    setPieces(newPieces);
    setLastMove({ fromR, fromC, toR: move.row, toC: move.col });
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
        let availableMoves: { piece: Piece; move: Move }[] = [];

        for (const p of blackPieces) {
          const mList = getMovesForPiece(p);
          for (const m of mList) {
            availableMoves.push({ piece: p, move: m });
          }
        }

        // Standard draughts rule priority: Captures take priority!
        const jumpMoves = availableMoves.filter((am) => am.move.jumpedPiece);
        const chosen = jumpMoves.length > 0
          ? jumpMoves[Math.floor(Math.random() * jumpMoves.length)]
          : availableMoves[Math.floor(Math.random() * availableMoves.length)];

        if (chosen) {
          executeMove(chosen.piece, chosen.move);
        }
        setIsSimulatedOpponentTurn(false);
      }, 950);

      return () => clearTimeout(timer);
    }
  }, [turn, isPassAndPlay, currentMatch?.status, pieces, getMovesForPiece]);

  if (!currentMatch) return null;

  const colLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  return (
    <div className="space-y-6">
      {/* Live Game HUD */}
      <GameHud
        match={currentMatch}
        turn={turn}
        customStatsA={
          <span className="text-emerald-400 font-mono flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-sm" />
            {t.dame_captures}: {capturedByA}/10
          </span>
        }
        customStatsB={
          <span className="text-cyan-400 font-mono flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block shadow-sm" />
            {t.dame_captures}: {capturedByB}/10
          </span>
        }
      />

      {/* Match Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Board Area */}
        <div className="lg:col-span-3 flex flex-col items-center">
          {/* Mode Switcher & Board Header */}
          <div className="w-full max-w-xl flex items-center justify-between mb-3 px-1 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 font-display text-sm tracking-wide">
                Ikibaho cya Dame (8×8)
              </span>
              <span className="text-slate-500 font-mono">·</span>
              <span className="text-slate-400">Ibice 10 kuri buri mukinnyi</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={isPassAndPlay}
                  onChange={(e) => setIsPassAndPlay(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-500 cursor-pointer accent-emerald-500"
                />
                <span className="text-xs">{t.passAndPlayLabel}</span>
              </label>
            </div>
          </div>

          {/* Tournament Crafted Checkerboard with Hardwood Borders and Coordinate Markings */}
          <div className="relative p-3 sm:p-5 bg-gradient-to-br from-[#2a1e17] via-[#1a120c] to-[#120a06] border-4 border-[#3f2918] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
            {/* Top Coordinate Rulers */}
            <div className="grid grid-cols-8 text-center text-[10px] font-mono font-bold text-amber-500/70 pb-1.5 px-3">
              {colLabels.map((c) => (
                <div key={c}>{c}</div>
              ))}
            </div>

            <div className="flex items-center">
              {/* Left Row Number Ruler */}
              <div className="flex flex-col justify-around text-center text-[10px] font-mono font-bold text-amber-500/70 pr-2 h-[320px] sm:h-[480px]">
                {[8, 7, 6, 5, 4, 3, 2, 1].map((r) => (
                  <div key={r}>{r}</div>
                ))}
              </div>

              {/* 8×8 Playing Grid */}
              <div className="grid grid-cols-8 grid-rows-8 w-[320px] h-[320px] sm:w-[480px] sm:h-[480px] border-2 border-[#120b06] rounded-xl overflow-hidden shadow-2xl">
                {Array.from({ length: 8 }).map((_, r) =>
                  Array.from({ length: 8 }).map((_, c) => {
                    const isDarkSquare = (r + c) % 2 === 1;
                    const piece = getPieceAt(r, c);
                    const isSelected = selectedPiece?.id === piece?.id;
                    const validMove = validMoves.find((m) => m.row === r && m.col === c);
                    const isValidMove = Boolean(validMove);
                    const isLastFrom = lastMove?.fromR === r && lastMove?.fromC === c;
                    const isLastTo = lastMove?.toR === r && lastMove?.toC === c;
                    const isNewlyCrowned = piece && piece.id === newlyCrownedId;

                    return (
                      <button
                        key={`${r}-${c}`}
                        type="button"
                        onClick={() => handleSquareClick(r, c)}
                        aria-label={t.squareAccessibleLabel.replace('{row}', String(r + 1)).replace('{col}', String(c + 1)).replace('{piece}', piece ? t.pieceLabel : '')}
                        className={`relative flex items-center justify-center transition-all ${
                          isDarkSquare
                            ? 'bg-[#1b232e]'
                            : 'bg-[#d8cbb8]'
                        } ${isLastFrom || isLastTo ? 'bg-amber-900/40' : ''} ${
                          isValidMove ? 'cursor-pointer' : ''
                        }`}
                      >
                        {/* Valid landing pulse marker */}
                        {isValidMove && !piece && (
                          <div className="w-5 h-5 rounded-full bg-emerald-400/80 shadow-[0_0_12px_rgba(52,211,153,0.9)] animate-pulse flex items-center justify-center">
                            {validMove?.jumpedPiece && (
                              <Swords className="w-3 h-3 text-slate-900" />
                            )}
                          </div>
                        )}

                        {/* Tournament Piece Representation */}
                        {piece && (
                          <div
                            className={`w-[32px] h-[32px] sm:w-[46px] sm:h-[46px] rounded-full shadow-[0_6px_12px_rgba(0,0,0,0.8)] flex items-center justify-center transition-transform relative select-none ${
                              piece.color === 'red'
                                ? 'bg-gradient-to-b from-emerald-400 via-teal-600 to-emerald-950 border-2 border-emerald-300 text-white'
                                : 'bg-gradient-to-b from-slate-600 via-slate-800 to-slate-950 border-2 border-slate-400 text-slate-200'
                            } ${isSelected ? 'scale-115 ring-4 ring-amber-300 z-10 shadow-[0_0_20px_rgba(251,191,36,0.8)]' : 'hover:scale-105'}`}
                          >
                            {/* Lathe-turned concentric ring decor */}
                            <div className="w-[80%] h-[80%] rounded-full border border-white/20 flex items-center justify-center pointer-events-none">
                              {piece.isKing ? (
                                <div className="flex items-center justify-center">
                                  <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 fill-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-pulse" />
                                </div>
                              ) : (
                                <div className="w-2.5 h-2.5 rounded-full bg-white/25 shadow-inner" />
                              )}
                            </div>

                            {/* Crown celebration aura */}
                            {isNewlyCrowned && (
                              <div className="absolute inset-0 rounded-full ring-4 ring-amber-400 animate-ping pointer-events-none" />
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Bottom Status & Captures Counter Bar */}
            <div className="mt-3.5 flex items-center justify-between text-xs text-slate-300 px-3 py-2 bg-[#121922] rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
                <span className="text-slate-200 font-semibold">{currentMatch.playerA.name}:</span>
                <span className="font-mono text-emerald-400 font-bold">{capturedByA} / 10</span>
              </div>
              <div className="font-mono text-amber-300 font-medium">
                {isSimulatedOpponentTurn
                  ? t.opponentCalculatingMove
                  : `${t.turnLabel}: ${turn === 'A' ? currentMatch.playerA.name : currentMatch.playerB.name}`}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-200 font-semibold">{currentMatch.playerB.name}:</span>
                <span className="font-mono text-cyan-400 font-bold">{capturedByB} / 10</span>
                <span className="w-3 h-3 rounded-full bg-slate-700 shadow-sm" />
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
              <div className="p-2.5 bg-slate-900/80 rounded-lg text-[11px] text-slate-300 space-y-1">
                <div className="font-semibold text-amber-300 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" />
                  <span>Amategeko y'Umwamikazi (Dame)</span>
                </div>
                <p className="text-slate-400">
                  Iyo igice kigeze ku murongo wa nyuma w'umukeba, gihinduka Umwamikazi (Dame) kigashobora kugenda no gusimbuka imbere n'inyuma.
                </p>
              </div>
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
                      <span className="text-slate-300">{getLocalizedCommentText(c, lang)}</span>
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
