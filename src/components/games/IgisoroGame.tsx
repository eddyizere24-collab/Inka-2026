import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Award, Info, Sparkles, ChevronRight, Swords, HelpCircle } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { GameHud } from './GameHud';
import { calculateIgisoroAdvantage } from '../../utils/matchScoring';
import { sounds } from '../../utils/sound';

/**
 * Traditional Rwandan Igisoro Mancala Game:
 * 4 rows of 8 pits = 32 pits total (Urubaho rw'Igisoro).
 * Rows 0, 1: Player B (Amajyaruguru / North)
 * Rows 2, 3: Player A (Amajyepfo / South)
 * Row 1 and Row 2 are the front battle rows (Urushya rw'Imbere) where Gusiba takes place.
 * Total 64 seeds (Isoro 64 z'umwimerere).
 */

// Visual seed pebble colors for natural river stone / cowrie appearance
const SEED_PALETTES = [
  'radial-gradient(circle at 35% 35%, #fef08a 0%, #ca8a04 60%, #713f12 100%)', // warm amber stone
  'radial-gradient(circle at 35% 35%, #e2e8f0 0%, #94a3b8 60%, #475569 100%)', // river granite
  'radial-gradient(circle at 35% 35%, #fed7aa 0%, #ea580c 60%, #7c2d12 100%)', // terracotta pebble
  'radial-gradient(circle at 35% 35%, #bbf7d0 0%, #16a34a 60%, #14532d 100%)', // jade stone
  'radial-gradient(circle at 35% 35%, #f8fafc 0%, #cbd5e1 50%, #64748b 100%)', // polished ivory
];

export const IgisoroGame: React.FC = () => {
  const { currentMatch, updateMatchScore, concludeMatch, setCurrentMatch, t } = usePlatform();

  // Initial distribution: 64 seeds distributed across the board (2 in each pit)
  const getInitialBoard = () => {
    return Array.from({ length: 4 }, () => Array(8).fill(2));
  };

  const [board, setBoard] = useState<number[][]>(getInitialBoard);
  const [turn, setTurn] = useState<'A' | 'B'>('A');
  const [isPassAndPlay, setIsPassAndPlay] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>(t.igisoroSelectPitInstruction);
  
  // Interactive animation states
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [activeDropPit, setActiveDropPit] = useState<{ r: number; c: number } | null>(null);
  const [capturedPits, setCapturedPits] = useState<{ r: number; c: number }[]>([]);
  const [hoveredPit, setHoveredPit] = useState<{ r: number; c: number } | null>(null);

  // References for unmount safety
  const animationTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setStatusMessage(t.igisoroSelectPitInstruction);
  }, [t.igisoroSelectPitInstruction]);

  // Count seeds for player A (rows 2, 3) and player B (rows 0, 1)
  const getSeedCounts = useCallback((b: number[][] = board) => {
    let seedsA = 0;
    let seedsB = 0;
    for (let c = 0; c < 8; c++) {
      seedsB += b[0][c] + b[1][c];
      seedsA += b[2][c] + b[3][c];
    }
    return { seedsA, seedsB };
  }, [board]);

  const { seedsA, seedsB } = getSeedCounts();

  // Sowing path for Player A (rows 2 and 3, counter-clockwise loop)
  const getPlayerAPath = () => [
    { r: 2, c: 0 }, { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 2, c: 5 }, { r: 2, c: 6 }, { r: 2, c: 7 },
    { r: 3, c: 7 }, { r: 3, c: 6 }, { r: 3, c: 5 }, { r: 3, c: 4 }, { r: 3, c: 3 }, { r: 3, c: 2 }, { r: 3, c: 1 }, { r: 3, c: 0 },
  ];

  // Sowing path for Player B (rows 0 and 1, counter-clockwise loop)
  const getPlayerBPath = () => [
    { r: 1, c: 7 }, { r: 1, c: 6 }, { r: 1, c: 5 }, { r: 1, c: 4 }, { r: 1, c: 3 }, { r: 1, c: 2 }, { r: 1, c: 1 }, { r: 1, c: 0 },
    { r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }, { r: 0, c: 4 }, { r: 0, c: 5 }, { r: 0, c: 6 }, { r: 0, c: 7 },
  ];

  // Calculate predicted sowing trajectory for hover feedback
  const getPredictedTrajectory = (r: number, c: number, playerTurn: 'A' | 'B'): { r: number; c: number }[] => {
    const seedCount = board[r][c];
    if (seedCount < 2) return [];
    const path = playerTurn === 'A' ? getPlayerAPath() : getPlayerBPath();
    const startIdx = path.findIndex((p) => p.r === r && p.c === c);
    if (startIdx === -1) return [];

    const traj: { r: number; c: number }[] = [];
    for (let i = 1; i <= seedCount; i++) {
      const idx = (startIdx + i) % path.length;
      traj.push(path[idx]);
    }
    return traj;
  };

  const handlePitClick = (r: number, c: number) => {
    if (isAnimating) return;
    if (currentMatch?.status !== 'playing') return;
    if (turn === 'B' && !isPassAndPlay) return;

    // Check ownership
    const isPlayerA = r >= 2;
    if ((turn === 'A' && !isPlayerA) || (turn === 'B' && isPlayerA)) return;

    // Must have at least 2 seeds to sow in Igisoro
    if (board[r][c] < 2) {
      setStatusMessage(t.igisoroInvalidPitInstruction);
      return;
    }

    animateSowing(r, c, turn);
  };

  const animateSowing = async (startR: number, startC: number, playerTurn: 'A' | 'B') => {
    setIsAnimating(true);
    setHoveredPit(null);

    const path = playerTurn === 'A' ? getPlayerAPath() : getPlayerBPath();
    let currentIdx = path.findIndex((p) => p.r === startR && p.c === startC);
    if (currentIdx === -1) {
      setIsAnimating(false);
      return;
    }

    // Clone board and lift seeds
    const liveBoard = board.map((row) => [...row]);
    let seedsInHand = liveBoard[startR][startC];
    liveBoard[startR][startC] = 0;
    setBoard([...liveBoard.map((row) => [...row])]);
    setActiveDropPit({ r: startR, c: startC });
    sounds.playMove();

    const delay = (ms: number) => new Promise((resolve) => {
      animationTimerRef.current = window.setTimeout(resolve, ms);
    });

    await delay(180);

    let step = 0;
    while (seedsInHand > 0) {
      currentIdx = (currentIdx + 1) % path.length;
      const target = path[currentIdx];
      liveBoard[target.r][target.c] += 1;
      seedsInHand -= 1;
      step++;

      setActiveDropPit(target);
      sounds.playSeedClack(step);
      setBoard([...liveBoard.map((row) => [...row])]);

      await delay(120);
    }

    const lastPit = path[currentIdx];

    // Gusiba Capture Rule:
    // If the last seed drops into an occupied front-row pit (Row 2 for A, Row 1 for B),
    // and the opponent's opposing front-row pit contains seeds, the player captures them!
    let captured = 0;
    const capturedPositions: { r: number; c: number }[] = [];

    if (playerTurn === 'A' && lastPit.r === 2 && liveBoard[2][lastPit.c] > 1) {
      const oppCol = lastPit.c;
      if (liveBoard[1][oppCol] > 0) {
        captured += liveBoard[1][oppCol];
        liveBoard[1][oppCol] = 0;
        capturedPositions.push({ r: 1, c: oppCol });

        // Also capture behind pit (back row 0) if opposing front was captured
        if (liveBoard[0][oppCol] > 0) {
          captured += liveBoard[0][oppCol];
          liveBoard[0][oppCol] = 0;
          capturedPositions.push({ r: 0, c: oppCol });
        }
      }
    } else if (playerTurn === 'B' && lastPit.r === 1 && liveBoard[1][lastPit.c] > 1) {
      const oppCol = lastPit.c;
      if (liveBoard[2][oppCol] > 0) {
        captured += liveBoard[2][oppCol];
        liveBoard[2][oppCol] = 0;
        capturedPositions.push({ r: 2, c: oppCol });

        if (liveBoard[3][oppCol] > 0) {
          captured += liveBoard[3][oppCol];
          liveBoard[3][oppCol] = 0;
          capturedPositions.push({ r: 3, c: oppCol });
        }
      }
    }

    if (captured > 0) {
      setCapturedPits(capturedPositions);
      sounds.playCapture();
      await delay(250);

      // Add captured seeds to landing pit
      liveBoard[lastPit.r][lastPit.c] += captured;
      setBoard([...liveBoard.map((row) => [...row])]);

      const playerName = playerTurn === 'A' ? (currentMatch?.playerA.name ?? '') : (currentMatch?.playerB.name ?? '');
      setStatusMessage(t.igisoroCaptureMessage.replace('{player}', playerName).replace('{count}', String(captured)));

      await delay(350);
      setCapturedPits([]);
    }

    setActiveDropPit(null);
    setIsAnimating(false);

    // Calculate final counts & evaluate advantage
    const { seedsA: finalA, seedsB: finalB } = getSeedCounts(liveBoard);
    const isWinA = finalB === 0;
    const isWinB = finalA === 0;
    const scoreResult = calculateIgisoroAdvantage(finalA, finalB, isWinA, isWinB);
    updateMatchScore(scoreResult);

    if (isWinA) {
      concludeMatch(t.igisoroVictoryReason.replace('{player}', currentMatch?.playerA.name ?? ''), false, 'A');
      return;
    } else if (isWinB) {
      concludeMatch(t.igisoroVictoryReason.replace('{player}', currentMatch?.playerB.name ?? ''), false, 'B');
      return;
    }

    // Switch turn
    const nextTurn = playerTurn === 'A' ? 'B' : 'A';
    setTurn(nextTurn);
  };

  // Simulated friendly opponent move (if not pass-and-play)
  useEffect(() => {
    if (turn === 'B' && !isPassAndPlay && !isAnimating && currentMatch?.status === 'playing') {
      const timer = window.setTimeout(() => {
        // Collect eligible pits for Player B (rows 0 and 1 with >= 2 seeds)
        const candidates: { r: number; c: number; seeds: number; captures: number }[] = [];
        for (let r = 0; r <= 1; r++) {
          for (let c = 0; c < 8; c++) {
            if (board[r][c] >= 2) {
              // Simple tactical check: does this sow end in a capture?
              const path = getPlayerBPath();
              const startIdx = path.findIndex((p) => p.r === r && p.c === c);
              const landingIdx = (startIdx + board[r][c]) % path.length;
              const landingPit = path[landingIdx];
              let capturePotential = 0;
              if (landingPit.r === 1) {
                if (board[2][landingPit.c] > 0) {
                  capturePotential += board[2][landingPit.c] + board[3][landingPit.c];
                }
              }
              candidates.push({ r, c, seeds: board[r][c], captures: capturePotential });
            }
          }
        }

        if (candidates.length > 0) {
          // Prioritize captures, otherwise choose highest seed pit
          candidates.sort((a, b) => (b.captures - a.captures) || (b.seeds - a.seeds));
          const chosen = candidates[0];
          animateSowing(chosen.r, chosen.c, 'B');
        } else {
          // If Player B has no move with 2+ seeds, Player A wins
          concludeMatch(
            t.igisoroNoMovesVictoryReason.replace('{player}', currentMatch?.playerB.name ?? '').replace('{winner}', currentMatch?.playerA.name ?? ''),
            false,
            'A'
          );
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [turn, isPassAndPlay, isAnimating, currentMatch?.status, board, concludeMatch]);

  if (!currentMatch) return null;

  const trajectory = hoveredPit ? getPredictedTrajectory(hoveredPit.r, hoveredPit.c, turn) : [];

  return (
    <div className="space-y-6">
      <GameHud
        match={currentMatch}
        turn={turn}
        customStatsA={
          <span className="text-emerald-400 font-mono flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-sm" />
            {t.seeds_count}: {seedsA}/64
          </span>
        }
        customStatsB={
          <span className="text-cyan-400 font-mono flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block shadow-sm" />
            {t.seeds_count}: {seedsB}/64
          </span>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Mancala Board Area */}
        <div className="lg:col-span-3 flex flex-col items-center">
          {/* Top Bar Controls */}
          <div className="w-full max-w-3xl flex items-center justify-between mb-3 px-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-200 tracking-wide font-display text-sm">
                Urubaho rw'Igisoro Nyarwanda
              </span>
              <span className="text-amber-500/60 font-mono">·</span>
              <span className="text-slate-400">Imyobo 32 / Isoro 64</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={isPassAndPlay}
                  onChange={(e) => setIsPassAndPlay(e.target.checked)}
                  className="rounded border-amber-900/60 bg-slate-900 text-emerald-500 cursor-pointer accent-emerald-500"
                />
                <span className="text-xs">{t.passAndPlayLabel}</span>
              </label>
            </div>
          </div>

          {/* Authentic Rwandan Hardwood Board (Urubaho rw'Igisoro) */}
          <div className="w-full max-w-3xl relative rounded-3xl p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-4 border-[#3a2211] bg-gradient-to-br from-[#2a170a] via-[#1a0f07] to-[#120a05] text-amber-100 select-none overflow-hidden">
            {/* Subtle Imigongo geometric border trim */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-amber-600/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-amber-600/40 to-transparent" />

            {/* North Player (Player B) Header */}
            <div className="flex items-center justify-between mb-3 px-3 py-1.5 bg-[#201208]/80 rounded-xl border border-amber-950/70 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm" />
                <span className="text-slate-200 font-semibold">{currentMatch.playerB.name}</span>
                <span className="text-cyan-400/80 text-[11px]">({t.northTerritory})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-cyan-300 font-bold">{seedsB} {t.seedsCountLabel}</span>
                <span className="text-slate-400 text-[11px]">({((seedsB / 64) * 100).toFixed(0)}%)</span>
              </div>
            </div>

            {/* Board Pits Grid (4 Rows × 8 Columns) */}
            <div className="space-y-3 relative">
              {/* Row 0: Player B Back Row (Urushya rw'inyuma) */}
              <div className="grid grid-cols-8 gap-2 sm:gap-2.5">
                {board[0].map((count, c) => renderPit(0, c, count, 'B', false))}
              </div>

              {/* Row 1: Player B Front Battle Row (Urushya rw'imbere) */}
              <div className="grid grid-cols-8 gap-2 sm:gap-2.5 pb-2">
                {board[1].map((count, c) => renderPit(1, c, count, 'B', true))}
              </div>

              {/* Battle Dividing Line with Cultural Marker */}
              <div className="relative py-1 flex items-center justify-center">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-600/50 to-transparent" />
                <span className="absolute bg-[#1a0f07] px-3 py-0.5 rounded-full border border-amber-900/60 text-[10px] text-amber-300/80 font-mono uppercase tracking-wider flex items-center gap-1">
                  <Swords className="w-3 h-3 text-amber-400" />
                  Urushya rw'Imbere (Gusiba Zone)
                </span>
              </div>

              {/* Row 2: Player A Front Battle Row (Urushya rw'imbere) */}
              <div className="grid grid-cols-8 gap-2 sm:gap-2.5 pt-2">
                {board[2].map((count, c) => renderPit(2, c, count, 'A', true))}
              </div>

              {/* Row 3: Player A Back Row (Urushya rw'inyuma) */}
              <div className="grid grid-cols-8 gap-2 sm:gap-2.5">
                {board[3].map((count, c) => renderPit(3, c, count, 'A', false))}
              </div>
            </div>

            {/* South Player (Player A) Footer */}
            <div className="flex items-center justify-between mt-3 px-3 py-1.5 bg-[#201208]/80 rounded-xl border border-amber-950/70 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm" />
                <span className="text-emerald-300 font-semibold">{currentMatch.playerA.name}</span>
                <span className="text-emerald-400/80 text-[11px]">({t.southTerritory})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-emerald-300 font-bold">{seedsA} {t.seedsCountLabel}</span>
                <span className="text-slate-400 text-[11px]">({((seedsA / 64) * 100).toFixed(0)}%)</span>
              </div>
            </div>
          </div>

          {/* Sowing Commentary & Status HUD */}
          <div className="mt-4 w-full max-w-3xl flex items-center justify-between gap-3 text-xs bg-[#121924] px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 shadow-md">
            <div className="flex items-center gap-2 text-emerald-300">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
              <span className="font-medium">{statusMessage}</span>
            </div>
            <div className="font-mono text-slate-400 text-[11px] whitespace-nowrap">
              {turn === 'A' ? (
                <span className="text-emerald-400 font-semibold">{t.turnYourTurn}</span>
              ) : (
                <span className="text-cyan-400 font-semibold">{t.turnOpponentTurn}</span>
              )}
            </div>
          </div>
        </div>

        {/* Tactical Overview & Honor Sidebar */}
        <div className="space-y-4">
          <div className="p-4 bg-[#141a24] border border-slate-800 rounded-xl space-y-3">
            <h4 className="text-sm font-bold text-slate-200 font-display flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400" />
              <span>Amategeko y'Igisoro</span>
            </h4>
            <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
              <p>
                {t.igisoroDesc}
              </p>
              <div className="p-3 bg-[#0d131c] rounded-lg font-mono text-[11px] text-amber-200 space-y-1.5 border border-slate-800/80">
                <div className="flex justify-between">
                  <span>Isoro za {currentMatch.playerA.name}:</span>
                  <strong className="text-emerald-400">{seedsA} / 64 ({(seedsA / 64 * 100).toFixed(0)}%)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Isoro za {currentMatch.playerB.name}:</span>
                  <strong className="text-cyan-400">{seedsB} / 64 ({(seedsB / 64 * 100).toFixed(0)}%)</strong>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-1">
                  <span>{t.skillAdvantageLabel} (w):</span>
                  <strong className="text-amber-400">{(currentMatch.advantage * 100).toFixed(0)}%</strong>
                </div>
              </div>
              <div className="p-2.5 bg-amber-950/20 border border-amber-900/40 rounded-lg text-[11px] text-amber-200/90 space-y-1">
                <div className="font-semibold text-amber-300 flex items-center gap-1">
                  <Swords className="w-3.5 h-3.5 text-amber-400" />
                  <span>Gusiba (Kurya Isoro)</span>
                </div>
                <p className="text-slate-400 leading-snug">
                  Iyo isoro ya nyuma iguye mu mwobo w'imbere ufite izindi soro, kandi umukeba afite isoro mu mwobo uteze n'uwo, urazirya zose!
                </p>
              </div>
            </div>
          </div>

          {currentMatch.status === 'concluded' && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-700/60 rounded-xl text-emerald-200 space-y-3">
              <div className="flex items-center gap-2 font-display font-bold text-sm">
                <Award className="w-5 h-5 text-emerald-400" />
                <span>{t.matchConcluded}</span>
              </div>
              <p className="text-xs text-slate-300">{currentMatch.concludeReason}</p>
              <div className="p-3 bg-[#10151d] rounded-lg text-xs font-mono text-emerald-300 flex justify-between">
                <span>{t.honorPointsAwarded}:</span>
                <strong className="text-white">+10 {t.honorPointsLabel}</strong>
              </div>
              <button
                onClick={() => setCurrentMatch(null)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors cursor-pointer"
              >
                {t.backToLobby}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Helper function to render an authentic carved wooden pit with organic stones
  function renderPit(r: number, c: number, count: number, owner: 'A' | 'B', isFrontRow: boolean) {
    const isPlayerTurn = turn === owner;
    const isOwnerPlayable = isPlayerTurn && (owner === 'A' || isPassAndPlay);
    const canSelect = isOwnerPlayable && count >= 2 && !isAnimating && currentMatch?.status === 'playing';

    const isDropping = activeDropPit?.r === r && activeDropPit?.c === c;
    const isCaptured = capturedPits.some((p) => p.r === r && p.c === c);
    const isInTrajectory = trajectory.some((p) => p.r === r && p.c === c);

    return (
      <button
        key={`${r}-${c}`}
        type="button"
        disabled={!canSelect}
        onClick={() => handlePitClick(r, c)}
        onMouseEnter={() => canSelect && setHoveredPit({ r, c })}
        onMouseLeave={() => setHoveredPit(null)}
        aria-label={t.pitAccessibleLabel.replace('{row}', String(r)).replace('{col}', String(c)).replace('{count}', String(count))}
        className={`aspect-square rounded-2xl relative flex flex-col items-center justify-center transition-all duration-150 select-none shadow-[inset_0_4px_10px_rgba(0,0,0,0.85)] border-2 ${
          isFrontRow ? 'bg-[#0f0904] border-[#422614]' : 'bg-[#0a0603] border-[#341d0f]'
        } ${
          canSelect
            ? 'hover:scale-105 hover:border-amber-400/90 cursor-pointer ring-1 ring-amber-500/30'
            : 'cursor-default'
        } ${isDropping ? 'ring-4 ring-emerald-400 scale-110 z-10' : ''} ${
          isCaptured ? 'ring-4 ring-red-500 bg-red-950/60 animate-pulse' : ''
        } ${isInTrajectory ? 'ring-2 ring-amber-300/60 bg-[#1f1207]' : ''}`}
      >
        {/* Seed Count Badge */}
        <span
          className={`text-xs sm:text-sm font-bold font-mono transition-transform ${
            count > 0 ? (owner === 'A' ? 'text-amber-200' : 'text-slate-200') : 'text-slate-600'
          } ${isDropping ? 'scale-125 text-emerald-300' : ''}`}
        >
          {count}
        </span>

        {/* Organic 3D Stone Cluster Representation */}
        <div className="w-full px-1.5 flex flex-wrap items-center justify-center gap-0.5 mt-1 pointer-events-none">
          {Array.from({ length: Math.min(count, 6) }).map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shadow-sm transform transition-all"
              style={{
                background: SEED_PALETTES[i % SEED_PALETTES.length],
                boxShadow: '0 1px 2px rgba(0,0,0,0.8)',
              }}
            />
          ))}
          {count > 6 && (
            <span className="text-[9px] font-mono font-bold text-amber-400/80 leading-none">
              +
            </span>
          )}
        </div>

        {/* Subtle glow pulse on playable pits when active */}
        {canSelect && (
          <div className="absolute inset-0 rounded-2xl border border-amber-400/30 animate-pulse pointer-events-none" />
        )}
      </button>
    );
  }
};
