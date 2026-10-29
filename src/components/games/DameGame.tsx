import React, { useState, useEffect, useCallback } from 'react';
import { Crown, MessageSquare, Award, ShieldCheck, Sparkles, Swords, AlertCircle } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { GameHud } from './GameHud';
import { calculateDameAdvantage } from '../../utils/matchScoring';
import { sounds } from '../../utils/sound';
import {
  DamePiece,
  DameMove,
  createInitialDamePieces,
  getAllLegalActions,
  getJumpMovesForPiece,
  applyDameMove,
  checkDameTerminalState,
  getPieceAt as engineGetPieceAt,
} from '../../engine/dameEngine';

export const DameGame: React.FC = () => {
  const { currentMatch, updateMatchScore, concludeMatch, t } = usePlatform();

  const [pieces, setPieces] = useState<DamePiece[]>(createInitialDamePieces);
  const [selectedPiece, setSelectedPiece] = useState<DamePiece | null>(null);
  const [validMoves, setValidMoves] = useState<DameMove[]>([]);
  const [capturedByA, setCapturedByA] = useState<number>(0);
  const [capturedByB, setCapturedByB] = useState<number>(0);
  const [turn, setTurn] = useState<'A' | 'B'>('A'); // A = Red (User), B = Black (Opponent)
  const [activeChainPieceId, setActiveChainPieceId] = useState<number | null>(null);
  const [isSimulatedOpponentTurn, setIsSimulatedOpponentTurn] = useState<boolean>(false);
  const [isPassAndPlay, setIsPassAndPlay] = useState<boolean>(false);
  const [lastMove, setLastMove] = useState<{ fromR: number; fromC: number; toR: number; toC: number } | null>(null);
  const [newlyCrownedId, setNewlyCrownedId] = useState<number | null>(null);

  const getPieceAt = useCallback(
    (row: number, col: number) => engineGetPieceAt(pieces, row, col),
    [pieces]
  );

  const handleSquareClick = (row: number, col: number) => {
    if (currentMatch?.status !== 'playing') return;
    if (turn === 'B' && !isPassAndPlay) return;

    const activeColor = turn === 'A' ? 'red' : 'black';
    const clickedPiece = getPieceAt(row, col);

    // If locked into a multi-jump chain, player can ONLY continue with that chained piece
    if (activeChainPieceId !== null) {
      if (selectedPiece && selectedPiece.id === activeChainPieceId) {
        const move = validMoves.find((m) => m.row === row && m.col === col);
        if (move) {
          executeMove(selectedPiece, move);
        }
      }
      return;
    }

    // Select own piece
    if (clickedPiece && clickedPiece.color === activeColor) {
      const legalActions = getAllLegalActions(pieces, activeColor);
      const pieceActions = legalActions.filter((a) => a.piece.id === clickedPiece.id);

      if (pieceActions.length > 0) {
        setSelectedPiece(clickedPiece);
        setValidMoves(pieceActions.map((a) => a.move));
      } else {
        // Not a playable piece under current rules (e.g. another piece must capture)
        setSelectedPiece(null);
        setValidMoves([]);
      }
      return;
    }

    // Move selected piece to clicked destination
    if (selectedPiece) {
      const move = validMoves.find((m) => m.row === row && m.col === col);
      if (move) {
        executeMove(selectedPiece, move);
      }
    }
  };

  const executeMove = (piece: DamePiece, move: DameMove) => {
    const fromR = piece.row;
    const fromC = piece.col;

    const result = applyDameMove(pieces, piece.id, move);
    let newCapA = capturedByA;
    let newCapB = capturedByB;

    if (result.wasCapture) {
      if (piece.color === 'red') {
        newCapA += 1;
        setCapturedByA(newCapA);
      } else {
        newCapB += 1;
        setCapturedByB(newCapB);
      }
      sounds.playCapture();
    } else {
      sounds.playMove();
    }

    if (result.newlyCrowned) {
      sounds.playCrownChime();
      setNewlyCrownedId(piece.id);
      setTimeout(() => setNewlyCrownedId(null), 1500);
    }

    setPieces(result.newPieces);
    setLastMove({ fromR, fromC, toR: move.row, toC: move.col });

    // Update match scoring advantage
    const isWinA = newCapA >= 10;
    const isWinB = newCapB >= 10;
    const scoreResult = calculateDameAdvantage(newCapA, newCapB, isWinA, isWinB);
    updateMatchScore(scoreResult);

    // If chained capture is available, the player MUST continue jumping with this piece
    if (result.canContinueChain) {
      setActiveChainPieceId(result.movedPiece.id);
      setSelectedPiece(result.movedPiece);
      const nextJumps = getJumpMovesForPiece(result.movedPiece, result.newPieces);
      setValidMoves(nextJumps);
      return; // Keep current turn
    }

    // Clear chain state & selections
    setActiveChainPieceId(null);
    setSelectedPiece(null);
    setValidMoves([]);

    // Check terminal conditions for next player
    const nextTurn = turn === 'A' ? 'B' : 'A';
    const nextColor = nextTurn === 'A' ? 'red' : 'black';
    const termState = checkDameTerminalState(result.newPieces, nextColor);

    if (termState.isOver && termState.winner) {
      const winnerName = termState.winner === 'A' ? (currentMatch?.playerA.name ?? '') : (currentMatch?.playerB.name ?? '');
      const loserName = termState.winner === 'A' ? (currentMatch?.playerB.name ?? '') : (currentMatch?.playerA.name ?? '');

      if (termState.reason === 'elimination') {
        concludeMatch(t.dameVictoryReason.replace('{player}', winnerName), false, termState.winner);
      } else {
        concludeMatch(
          t.dameNoMovesVictoryReason.replace('{player}', loserName).replace('{winner}', winnerName),
          false,
          termState.winner
        );
      }
      return;
    }

    setTurn(nextTurn);
  };

  // Automated friendly opponent move (if not pass-and-play)
  useEffect(() => {
    if (turn === 'B' && !isPassAndPlay && currentMatch?.status === 'playing') {
      setIsSimulatedOpponentTurn(true);
      const timer = setTimeout(() => {
        const legalActions = getAllLegalActions(pieces, 'black');

        if (legalActions.length === 0) {
          // Black has no legal moves -> Player A wins
          concludeMatch(
            t.dameNoMovesVictoryReason
              .replace('{player}', currentMatch?.playerB.name ?? '')
              .replace('{winner}', currentMatch?.playerA.name ?? ''),
            false,
            'A'
          );
          setIsSimulatedOpponentTurn(false);
          return;
        }

        // Randomly pick one of the authoritative legal actions (captures already enforced)
        const chosen = legalActions[Math.floor(Math.random() * legalActions.length)];
        executeMove(chosen.piece, chosen.move);
        setIsSimulatedOpponentTurn(false);
      }, 950);

      return () => clearTimeout(timer);
    }
  }, [turn, isPassAndPlay, currentMatch?.status, pieces, concludeMatch, t]);

  if (!currentMatch) return null;

  const colLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  return (
    <div className="space-y-6">
      {/* Compact Top Match HUD */}
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
        rulesContent={
          <div className="space-y-4">
            <div className="p-3 bg-[#0d131c] rounded-xl border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-display font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>{t.fair_play}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{t.zero_wagering_rule}</p>

              <div className="p-2.5 bg-[#141b26] rounded-lg font-mono text-[11px] text-emerald-300 space-y-1">
                <div>{t.netCaptureDifference}: {Math.abs(capturedByA - capturedByB)} {t.piecesUnit}</div>
                <div>{t.skillAdvantageLabel} (w): {(currentMatch.advantage * 100).toFixed(0)}%</div>
                <div>{t.leaderLabel}: {currentMatch.leader ? (currentMatch.leader === 'A' ? currentMatch.playerA.name : currentMatch.playerB.name) : t.levelStanding}</div>
              </div>

              <div className="p-2.5 bg-slate-900/80 rounded-lg text-[11px] text-slate-300 space-y-1">
                <div className="font-semibold text-amber-300 flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.dameQueenRules}</span>
                </div>
                <p className="text-slate-400 leading-snug">
                  {t.dameQueenRulesDesc}
                </p>
              </div>
            </div>

            {/* If concluded, show post-match ceremony */}
            {currentMatch.status === 'concluded' && (
              <div className="p-3.5 bg-emerald-950/40 border border-emerald-700/60 rounded-xl text-emerald-200 space-y-2.5">
                <div className="flex items-center gap-2 font-display font-bold text-sm">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>{t.matchConcluded}</span>
                </div>
                <p className="text-xs text-slate-300">
                  {currentMatch.concludeReason || t.matchFinishedHonorMessage}
                </p>
                <div className="p-2 bg-[#10151d] rounded text-xs font-mono text-emerald-300 flex justify-between">
                  <span>{t.honorPointsAwarded}:</span>
                  <strong className="text-white">+10 {t.honorPointsLabel}</strong>
                </div>
              </div>
            )}
          </div>
        }
      />

      {/* Maximized Checkerboard Arena */}
      <div className="w-full flex-1 flex flex-col items-center justify-between min-h-0 gap-1.5 sm:gap-2">
        {/* Sleek Top Mini Ribbon */}
        <div className="w-full max-w-xl flex items-center justify-between px-2 text-[11px] text-slate-300 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200 font-display">{t.dameBoardLabel}</span>
            <span className="text-slate-500 font-mono">·</span>
            <span className="text-emerald-400 font-mono text-[10px]">
              {isSimulatedOpponentTurn ? t.opponentCalculatingMove : `${t.turnLabel}: ${turn === 'A' ? currentMatch.playerA.name : currentMatch.playerB.name}`}
            </span>
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-white transition-colors text-[10px]">
            <input
              type="checkbox"
              checked={isPassAndPlay}
              onChange={(e) => setIsPassAndPlay(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-emerald-500 cursor-pointer accent-emerald-500 w-3 h-3"
            />
            <span>{t.passAndPlayLabel}</span>
          </label>
        </div>

        {/* Maximized Hardwood Checkerboard */}
        <div className="relative flex-1 w-full flex items-center justify-center min-h-0 overflow-hidden">
          <div className="relative p-2 sm:p-3.5 bg-gradient-to-br from-[#2a1e17] via-[#1a120c] to-[#120a06] border-4 border-[#3f2918] rounded-2xl sm:rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] max-w-full max-h-full flex flex-col items-center justify-center">
            {/* Top Coordinate Rulers */}
            <div className="grid grid-cols-8 text-center text-[9px] sm:text-[10px] font-mono font-bold text-amber-500/70 pb-1 w-[min(90vw,68vh)]">
              {colLabels.map((c) => (
                <div key={c}>{c}</div>
              ))}
            </div>

            <div className="flex items-center">
              {/* Left Row Number Ruler */}
              <div className="flex flex-col justify-around text-center text-[9px] sm:text-[10px] font-mono font-bold text-amber-500/70 pr-1.5 h-[min(90vw,68vh)]">
                {[8, 7, 6, 5, 4, 3, 2, 1].map((r) => (
                  <div key={r}>{r}</div>
                ))}
              </div>

              {/* 8×8 Playing Grid */}
              <div className="grid grid-cols-8 grid-rows-8 w-[min(90vw,68vh)] h-[min(90vw,68vh)] border-2 border-[#120b06] rounded-xl overflow-hidden shadow-2xl">
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
                          <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-emerald-400/80 shadow-[0_0_12px_rgba(52,211,153,0.9)] animate-pulse flex items-center justify-center">
                            {validMove?.jumpedPiece && (
                              <Swords className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-slate-900" />
                            )}
                          </div>
                        )}

                        {/* Tournament Piece Representation */}
                        {piece && (
                          <div
                            className={`w-[78%] h-[78%] rounded-full shadow-[0_6px_12px_rgba(0,0,0,0.8)] flex items-center justify-center transition-transform relative select-none ${
                              piece.color === 'red'
                                ? 'bg-gradient-to-b from-emerald-400 via-teal-600 to-emerald-950 border-2 border-emerald-300 text-white'
                                : 'bg-gradient-to-b from-slate-600 via-slate-800 to-slate-950 border-2 border-slate-400 text-slate-200'
                            } ${isSelected ? 'scale-115 ring-4 ring-amber-300 z-10 shadow-[0_0_20px_rgba(251,191,36,0.8)]' : 'hover:scale-105'}`}
                          >
                            {/* Lathe-turned concentric ring decor */}
                            <div className="w-[80%] h-[80%] rounded-full border border-white/20 flex items-center justify-center pointer-events-none">
                              {piece.isKing ? (
                                <div className="flex items-center justify-center">
                                  <Crown className="w-4 h-4 sm:w-6 sm:h-6 text-amber-300 fill-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-pulse" />
                                </div>
                              ) : (
                                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white/25 shadow-inner" />
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
          </div>
        </div>

        {/* Minimal Bottom Bar */}
        <div className="w-full max-w-xl flex items-center justify-between text-xs text-slate-300 px-3 py-1.5 bg-[#0e141e]/90 rounded-xl border border-slate-800 shrink-0">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-200 font-semibold">{currentMatch.playerA.name.split(' ')[0]}:</span>
            <span className="text-emerald-400 font-bold">{capturedByA} / 10</span>
          </div>
          <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
            {t.fair_play}
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-slate-200 font-semibold">{currentMatch.playerB.name.split(' ')[0]}:</span>
            <span className="text-cyan-400 font-bold">{capturedByB} / 10</span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
          </div>
        </div>
      </div>
    </div>
  );
};
