import React, { useState, useEffect, useCallback } from 'react';
import { Award, Info, ShieldCheck, HeartHandshake } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { GameHud } from './GameHud';
import { calculateIgisoroAdvantage } from '../../utils/matchScoring';
import { sounds } from '../../utils/sound';

/**
 * Traditional Rwandan Igisoro Mancala Game:
 * 4 rows of 8 pits = 32 pits total.
 * Rows 0, 1: Player B (North)
 * Rows 2, 3: Player A (South)
 * Row 1 and Row 2 are the front rows where captures take place.
 * Total 64 seeds.
 */
export const IgisoroGame: React.FC = () => {
  const { currentMatch, updateMatchScore, concludeMatch, setCurrentMatch, t } = usePlatform();

  // Initial distribution: 64 seeds distributed across the board (2 in each pit)
  const getInitialBoard = () => {
    const board: number[][] = Array.from({ length: 4 }, () => Array(8).fill(2));
    return board;
  };

  const [board, setBoard] = useState<number[][]>(getInitialBoard);
  const [turn, setTurn] = useState<'A' | 'B'>('A');
  const [sowingPit, setSowingPit] = useState<{ r: number; c: number } | null>(null);
  const [isPassAndPlay, setIsPassAndPlay] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Select a pit on your side with 2+ seeds to sow.');

  // Count seeds for player A (rows 2, 3) and player B (rows 0, 1)
  const getSeedCounts = useCallback(() => {
    let seedsA = 0;
    let seedsB = 0;
    for (let c = 0; c < 8; c++) {
      seedsB += board[0][c] + board[1][c];
      seedsA += board[2][c] + board[3][c];
    }
    return { seedsA, seedsB };
  }, [board]);

  const { seedsA, seedsB } = getSeedCounts();

  // Sowing path for Player A (rows 2 and 3)
  const getPlayerAPath = () => [
    { r: 2, c: 0 }, { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 2, c: 5 }, { r: 2, c: 6 }, { r: 2, c: 7 },
    { r: 3, c: 7 }, { r: 3, c: 6 }, { r: 3, c: 5 }, { r: 3, c: 4 }, { r: 3, c: 3 }, { r: 3, c: 2 }, { r: 3, c: 1 }, { r: 3, c: 0 },
  ];

  // Sowing path for Player B (rows 0 and 1)
  const getPlayerBPath = () => [
    { r: 1, c: 7 }, { r: 1, c: 6 }, { r: 1, c: 5 }, { r: 1, c: 4 }, { r: 1, c: 3 }, { r: 1, c: 2 }, { r: 1, c: 1 }, { r: 1, c: 0 },
    { r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }, { r: 0, c: 4 }, { r: 0, c: 5 }, { r: 0, c: 6 }, { r: 0, c: 7 },
  ];

  const handlePitClick = (r: number, c: number) => {
    if (currentMatch?.status !== 'playing') return;
    if (turn === 'B' && !isPassAndPlay) return;

    // Check ownership
    const isPlayerA = r >= 2;
    if ((turn === 'A' && !isPlayerA) || (turn === 'B' && isPlayerA)) return;

    // Must have at least 2 seeds to sow in Igisoro
    if (board[r][c] < 2) {
      setStatusMessage('In Igisoro, you can only sow from a pit with 2 or more seeds.');
      return;
    }

    executeSow(r, c, turn);
  };

  const executeSow = (startR: number, startC: number, playerTurn: 'A' | 'B') => {
    const newBoard = board.map((row) => [...row]);
    let seedsInHand = newBoard[startR][startC];
    newBoard[startR][startC] = 0;
    setSowingPit({ r: startR, c: startC });
    sounds.playSeedClack();

    const path = playerTurn === 'A' ? getPlayerAPath() : getPlayerBPath();
    let currentIdx = path.findIndex((p) => p.r === startR && p.c === startC);

    while (seedsInHand > 0) {
      currentIdx = (currentIdx + 1) % path.length;
      const { r, c } = path[currentIdx];
      newBoard[r][c] += 1;
      seedsInHand -= 1;
    }

    const lastPit = path[currentIdx];

    // Rwandan Igisoro Capture Rule (Gusiba):
    // If the last seed drops into an occupied front-row pit (Row 2 for A, Row 1 for B),
    // and the opponent's opposing front-row pit contains seeds, the player captures them!
    let captured = 0;
    if (playerTurn === 'A' && lastPit.r === 2 && newBoard[2][lastPit.c] > 1) {
      const oppCol = lastPit.c;
      if (newBoard[1][oppCol] > 0) {
        captured += newBoard[1][oppCol];
        newBoard[1][oppCol] = 0;
        // Also capture behind pit (back row 0) if opposing front was captured
        if (newBoard[0][oppCol] > 0) {
          captured += newBoard[0][oppCol];
          newBoard[0][oppCol] = 0;
        }
        newBoard[2][lastPit.c] += captured;
        sounds.playCapture();
        setStatusMessage(`${currentMatch?.playerA.name} captured ${captured} seeds from opponent pits!`);
      }
    } else if (playerTurn === 'B' && lastPit.r === 1 && newBoard[1][lastPit.c] > 1) {
      const oppCol = lastPit.c;
      if (newBoard[2][oppCol] > 0) {
        captured += newBoard[2][oppCol];
        newBoard[2][oppCol] = 0;
        if (newBoard[3][oppCol] > 0) {
          captured += newBoard[3][oppCol];
          newBoard[3][oppCol] = 0;
        }
        newBoard[1][lastPit.c] += captured;
        sounds.playCapture();
        setStatusMessage(`${currentMatch?.playerB.name} captured ${captured} seeds from opponent pits!`);
      }
    }

    setBoard(newBoard);
    setSowingPit(null);

    // Calculate new seed counts
    let newSeedsA = 0;
    let newSeedsB = 0;
    for (let c = 0; c < 8; c++) {
      newSeedsB += newBoard[0][c] + newBoard[1][c];
      newSeedsA += newBoard[2][c] + newBoard[3][c];
    }

    const isWinA = newSeedsB === 0;
    const isWinB = newSeedsA === 0;
    const scoreResult = calculateIgisoroAdvantage(newSeedsA, newSeedsB, isWinA, isWinB);
    updateMatchScore(scoreResult);

    if (isWinA) {
      concludeMatch(`Decisive Igisoro Victory by ${currentMatch?.playerA.name}! Opponent cleared.`, false, 'A');
    } else if (isWinB) {
      concludeMatch(`Decisive Igisoro Victory by ${currentMatch?.playerB.name}! Opponent cleared.`, false, 'B');
    }

    const nextTurn = playerTurn === 'A' ? 'B' : 'A';
    setTurn(nextTurn);
  };

  // Simulated friendly opponent move (if not pass-and-play)
  useEffect(() => {
    if (turn === 'B' && !isPassAndPlay && currentMatch?.status === 'playing') {
      const timer = setTimeout(() => {
        // Collect eligible pits for Player B (rows 0 and 1 with >= 2 seeds)
        const candidates: { r: number; c: number; seeds: number }[] = [];
        for (let r = 0; r <= 1; r++) {
          for (let c = 0; c < 8; c++) {
            if (board[r][c] >= 2) {
              candidates.push({ r, c, seeds: board[r][c] });
            }
          }
        }

        if (candidates.length > 0) {
          const chosen = candidates[Math.floor(Math.random() * candidates.length)];
          executeSow(chosen.r, chosen.c, 'B');
        } else {
          // If Player B has no move with 2+ seeds, Player A wins
          concludeMatch(`${currentMatch?.playerB.name} has no valid moves remaining. Victory for ${currentMatch?.playerA.name}!`, false, 'A');
        }
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [turn, isPassAndPlay, currentMatch?.status, board, concludeMatch]);

  if (!currentMatch) return null;

  return (
    <div className="space-y-6">
      <GameHud
        match={currentMatch}
        turn={turn}
        customStatsA={
          <span className="text-emerald-400 font-mono">
            {t.seeds_count}: {seedsA}/64
          </span>
        }
        customStatsB={
          <span className="text-cyan-400 font-mono">
            {t.seeds_count}: {seedsB}/64
          </span>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Mancala Board */}
        <div className="lg:col-span-3 flex flex-col items-center">
          {/* Controls */}
          <div className="w-full max-w-2xl flex items-center justify-between mb-3 px-1 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200">{t.igisoroSubtitle}</span>
            </div>
            <div>
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

          {/* Wooden Board Container */}
          <div className="w-full max-w-2xl bg-[#1d2533] border-4 border-[#2b384d] rounded-3xl p-4 sm:p-6 shadow-2xl">
            {/* North Player (Player B) */}
            <div className="flex items-center justify-between mb-2 px-3 text-xs">
              <span className="text-slate-400 font-semibold">{currentMatch.playerB.name} ({t.northTerritory})</span>
              <span className="font-mono text-cyan-400 font-medium">{seedsB} {t.seedsCountLabel} ({((seedsB / 64) * 100).toFixed(0)}%)</span>
            </div>

            {/* 4 Rows of 8 Pits */}
            <div className="space-y-2.5">
              {/* Row 0: Player B Back */}
              <div className="grid grid-cols-8 gap-2">
                {board[0].map((count, c) => (
                  <button
                    key={`0-${c}`}
                    type="button"
                    disabled={turn !== 'B' || count < 2 || !isPassAndPlay}
                    onClick={() => handlePitClick(0, c)}
                    aria-label={t.pitAccessibleLabel.replace('{row}', '0').replace('{col}', String(c)).replace('{count}', String(count))}
                    className={`aspect-square rounded-2xl bg-[#141b26] border-2 border-[#2b3749] flex flex-col items-center justify-center relative transition-all shadow-inner ${
                      turn === 'B' && count >= 2 && isPassAndPlay ? 'hover:border-cyan-400 cursor-pointer' : ''
                    } ${sowingPit?.r === 0 && sowingPit?.c === c ? 'ring-2 ring-cyan-400' : ''}`}
                  >
                    <span className="text-xs sm:text-sm font-bold text-slate-200">{count}</span>
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm" />
                      ))}
                    </div>
                  </button>
                ))}
              </div>

              {/* Row 1: Player B Front (Battle Row) */}
              <div className="grid grid-cols-8 gap-2 pb-1 border-b border-[#2d3a4e]">
                {board[1].map((count, c) => (
                  <button
                    key={`1-${c}`}
                    type="button"
                    disabled={turn !== 'B' || count < 2 || !isPassAndPlay}
                    onClick={() => handlePitClick(1, c)}
                    aria-label={t.pitAccessibleLabel.replace('{row}', '1').replace('{col}', String(c)).replace('{count}', String(count))}
                    className={`aspect-square rounded-2xl bg-[#151c27] border-2 border-[#2b3749] flex flex-col items-center justify-center relative transition-all shadow-inner ${
                      turn === 'B' && count >= 2 && isPassAndPlay ? 'hover:border-cyan-400 cursor-pointer' : ''
                    } ${sowingPit?.r === 1 && sowingPit?.c === c ? 'ring-2 ring-cyan-400' : ''}`}
                  >
                    <span className="text-xs sm:text-sm font-bold text-slate-200">{count}</span>
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm" />
                      ))}
                    </div>
                  </button>
                ))}
              </div>

              {/* Row 2: Player A Front (Battle Row) */}
              <div className="grid grid-cols-8 gap-2 pt-1">
                {board[2].map((count, c) => (
                  <button
                    key={`2-${c}`}
                    type="button"
                    disabled={turn !== 'A' || count < 2}
                    onClick={() => handlePitClick(2, c)}
                    aria-label={t.pitAccessibleLabel.replace('{row}', '2').replace('{col}', String(c)).replace('{count}', String(count))}
                    className={`aspect-square rounded-2xl bg-[#141c26] border-2 border-[#2a384b] flex flex-col items-center justify-center relative transition-all shadow-inner ${
                      turn === 'A' && count >= 2 ? 'hover:border-emerald-400 hover:scale-105 cursor-pointer ring-1 ring-emerald-500/30' : ''
                    } ${sowingPit?.r === 2 && sowingPit?.c === c ? 'ring-2 ring-emerald-400' : ''}`}
                  >
                    <span className="text-xs sm:text-sm font-bold text-white">{count}</span>
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm" />
                      ))}
                    </div>
                  </button>
                ))}
              </div>

              {/* Row 3: Player A Back */}
              <div className="grid grid-cols-8 gap-2">
                {board[3].map((count, c) => (
                  <button
                    key={`3-${c}`}
                    type="button"
                    disabled={turn !== 'A' || count < 2}
                    onClick={() => handlePitClick(3, c)}
                    aria-label={t.pitAccessibleLabel.replace('{row}', '3').replace('{col}', String(c)).replace('{count}', String(count))}
                    className={`aspect-square rounded-2xl bg-[#141c26] border-2 border-[#2a384b] flex flex-col items-center justify-center relative transition-all shadow-inner ${
                      turn === 'A' && count >= 2 ? 'hover:border-emerald-400 hover:scale-105 cursor-pointer ring-1 ring-emerald-500/30' : ''
                    } ${sowingPit?.r === 3 && sowingPit?.c === c ? 'ring-2 ring-emerald-400' : ''}`}
                  >
                    <span className="text-xs sm:text-sm font-bold text-white">{count}</span>
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm" />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* South Player (Player A) */}
            <div className="flex items-center justify-between mt-3 px-3 text-xs">
              <span className="text-emerald-400 font-semibold">{currentMatch.playerA.name} ({t.southTerritory})</span>
              <span className="font-mono text-emerald-400 font-medium">{seedsA} {t.seedsCountLabel} ({((seedsA / 64) * 100).toFixed(0)}%)</span>
            </div>
          </div>

          <div className="mt-3 text-xs text-emerald-300 font-mono bg-[#141a24] px-4 py-2 rounded-xl border border-slate-800">
            {statusMessage}
          </div>
        </div>

        {/* Right Info Sidebar */}
        <div className="space-y-4">
          <div className="p-4 bg-[#141a24] border border-slate-800 rounded-xl space-y-3">
            <h4 className="text-sm font-bold text-slate-200 font-display flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-400" />
              <span>{t.igisoro_rule}</span>
            </h4>
            <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
              <p>
                {t.igisoroDesc}
              </p>
              <div className="p-2.5 bg-[#0e131b] rounded-lg font-mono text-[11px] text-emerald-300 space-y-1">
                <div>{t.playerASeedsLabel}: {seedsA} / 64 ({(seedsA / 64 * 100).toFixed(0)}%)</div>
                <div>{t.skillAdvantageLabel} (w): {(currentMatch.advantage * 100).toFixed(0)}%</div>
                <div>{t.leaderLabel}: {currentMatch.leader ? (currentMatch.leader === 'A' ? currentMatch.playerA.name : currentMatch.playerB.name) : t.levelStanding}</div>
              </div>
              <p className="text-[11px] text-slate-500">
                {t.igisoroRulesShort}
              </p>
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
};
