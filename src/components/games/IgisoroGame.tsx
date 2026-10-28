import React, { useState, useEffect, useCallback } from 'react';
import { Award, MessageSquare, Info } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { SettlementBar } from './SettlementBar';
import { calculateIgisoroAdvantage } from '../../utils/settlement';
import { sounds } from '../../utils/sound';

/**
 * Traditional Rwandan Igisoro Mancala Game:
 * 4 rows of 8 pits = 32 pits total.
 * Rows 0, 1: Player B (North)
 * Rows 2, 3: Player A (South)
 * Row 1 and Row 2 are the front rows where captures take place.
 * Total 64 inka / seeds.
 */
export const IgisoroGame: React.FC = () => {
  const { currentMatch, updateMatchAdvantage, settleMatch, setCurrentMatch } = usePlatform();

  // Initial distribution: 64 seeds distributed across the board (4 seeds per pit on initial 16 pits)
  const getInitialBoard = () => {
    // 4 rows x 8 cols
    const board: number[][] = Array.from({ length: 4 }, () => Array(8).fill(0));
    // Classic traditional setup: 4 seeds in each of the 8 pits for both players' front rows, or 2 in each pit
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 8; c++) {
        board[r][c] = 2; // 32 * 2 = 64 seeds total
      }
    }
    return board;
  };

  const [board, setBoard] = useState<number[][]>(getInitialBoard);
  const [turn, setTurn] = useState<'A' | 'B'>('A');
  const [sowingPit, setSowingPit] = useState<{ r: number; c: number } | null>(null);
  const [isPassAndPlay, setIsPassAndPlay] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Select a pit on your side with 2+ inka seeds to sow.');

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

  // Advantage calculation handled inside executeSow upon board change

  // Order of sowing for Player A: loop across rows 2 and 3
  // Row 2 goes left to right: (2,0) -> (2,7), then Row 3 goes right to left: (3,7) -> (3,0)
  const getPlayerAPath = () => [
    { r: 2, c: 0 }, { r: 2, c: 1 }, { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 2, c: 4 }, { r: 2, c: 5 }, { r: 2, c: 6 }, { r: 2, c: 7 },
    { r: 3, c: 7 }, { r: 3, c: 6 }, { r: 3, c: 5 }, { r: 3, c: 4 }, { r: 3, c: 3 }, { r: 3, c: 2 }, { r: 3, c: 1 }, { r: 3, c: 0 },
  ];

  // Order of sowing for Player B: loop across rows 0 and 1
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
      setStatusMessage('In Igisoro, you can only sow from a pit with 2 or more inka seeds.');
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

    // Rwandan Igisoro Capture Rule (Gusiba / Umutwe):
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
        setStatusMessage(`${currentMatch?.playerA.name} captured ${captured} inka seeds from opponent's pits!`);
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
        setStatusMessage(`${currentMatch?.playerB.name} captured ${captured} inka seeds from opponent's pits!`);
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
    const { leader, w } = calculateIgisoroAdvantage(newSeedsA, newSeedsB, isWinA, isWinB);
    updateMatchAdvantage(leader, w);

    if (isWinA) {
      settleMatch(`Decisive Igisoro Victory by ${currentMatch?.playerA.name}! Opponent cleared.`);
    } else if (isWinB) {
      settleMatch(`Decisive Igisoro Victory by ${currentMatch?.playerB.name}! Opponent cleared.`);
    }

    const nextTurn = playerTurn === 'A' ? 'B' : 'A';
    setTurn(nextTurn);
  };

  // Simulated friendly live opponent turn
  useEffect(() => {
    if (turn === 'B' && !isPassAndPlay && currentMatch?.status === 'playing') {
      const timer = setTimeout(() => {
        // Find valid pits for Player B (rows 0, 1) with >= 2 seeds
        const validPits: { r: number; c: number; count: number }[] = [];
        for (let r = 0; r <= 1; r++) {
          for (let c = 0; c < 8; c++) {
            if (board[r][c] >= 2) {
              validPits.push({ r, c, count: board[r][c] });
            }
          }
        }

        if (validPits.length > 0) {
          // Choose strategically or random valid
          const chosen = validPits[Math.floor(Math.random() * validPits.length)];
          executeSow(chosen.r, chosen.c, 'B');
        } else {
          // B has no valid move, A wins decisive
          settleMatch(`No valid sows remaining for ${currentMatch.playerB.name}`);
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [turn, isPassAndPlay, currentMatch?.status, board]);

  if (!currentMatch) return null;

  return (
    <div className="space-y-6">
      {/* Live Settlement Bar HUD */}
      <SettlementBar
        match={currentMatch}
        turn={turn}
        onStop={() => settleMatch(`Voluntary stop by ${currentMatch.playerA.name}`)}
        onTimeout={() => sounds.playInkaChime()}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Igisoro Carved Board */}
        <div className="lg:col-span-3 flex flex-col items-center">
          <div className="w-full max-w-2xl flex items-center justify-between mb-3 px-1 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200">Igisoro: 32 Pits (4×8)</span>
              <span className="text-slate-500">·</span>
              <span>64 Inka Seeds</span>
            </div>
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

          {/* Carved Wood Mancala Board */}
          <div className="w-full max-w-2xl p-6 bg-gradient-to-b from-[#2e1d13] via-[#3d2719] to-[#2b1b11] border-4 border-[#523522] rounded-3xl shadow-2xl space-y-4">
            {/* North Player (Player B) Side Header */}
            <div className="flex items-center justify-between px-2 text-xs text-[#d1b89d]">
              <span className="font-semibold">{currentMatch.playerB.name} (North)</span>
              <span className="font-mono text-amber-300">{seedsB} Seeds ({((seedsB / 64) * 100).toFixed(0)}%)</span>
            </div>

            {/* The 4 Rows of 8 Pits */}
            <div className="space-y-3 p-3 bg-[#1d120a]/80 rounded-2xl border border-[#442b1a]">
              {board.map((row, r) => {
                const isPlayerA = r >= 2;
                const isFrontRow = r === 1 || r === 2;

                return (
                  <div key={r} className="relative">
                    {/* Front-row divider accent */}
                    {r === 2 && (
                      <div className="my-2 border-t border-dashed border-[#5a3a24] text-center">
                        <span className="px-2 bg-[#1d120a] text-[10px] text-[#a88a6d] font-mono tracking-wider">
                          FRONT CAPTURE LINE
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-8 gap-2">
                      {row.map((count, c) => {
                        const canSow = (turn === 'A' && isPlayerA && count >= 2) ||
                                       (turn === 'B' && !isPlayerA && count >= 2 && isPassAndPlay);
                        const isSowing = sowingPit?.r === r && sowingPit?.c === c;

                        return (
                          <button
                            key={`${r}-${c}`}
                            type="button"
                            onClick={() => handlePitClick(r, c)}
                            aria-label={`Pit Row ${r} Col ${c}, ${count} seeds`}
                            disabled={!canSow && currentMatch.status === 'playing'}
                            className={`h-14 sm:h-16 rounded-2xl flex flex-col items-center justify-center p-1 relative transition-all duration-150 ${
                              isFrontRow ? 'bg-[#311f14]' : 'bg-[#26170d]'
                            } border ${
                              canSow
                                ? 'border-amber-400/80 shadow-md shadow-amber-950/40 hover:scale-105 cursor-pointer ring-2 ring-amber-500/40'
                                : 'border-[#432918] opacity-90'
                            } ${isSowing ? 'bg-amber-800/40 ring-4 ring-amber-400' : ''}`}
                          >
                            {/* Seeds visual clusters */}
                            <div className="flex flex-wrap items-center justify-center gap-0.5 max-w-[36px] max-h-[28px] overflow-hidden">
                              {Array.from({ length: Math.min(count, 8) }).map((_, i) => (
                                <div
                                  key={i}
                                  className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#eedcbe] to-[#bda37d] border border-[#785b3b] shadow-inner"
                                />
                              ))}
                              {count > 8 && (
                                <span className="text-[9px] text-[#eedcbe] font-mono font-bold">+</span>
                              )}
                            </div>

                            {/* Numerical count */}
                            <span
                              className={`text-xs font-mono font-bold mt-1 ${
                                count > 0 ? 'text-[#f5e6d3]' : 'text-slate-600'
                              }`}
                            >
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* South Player (Player A) Side Header */}
            <div className="flex items-center justify-between px-2 text-xs text-[#d1b89d]">
              <span className="font-semibold">{currentMatch.playerA.name} (South)</span>
              <span className="font-mono text-amber-300">{seedsA} Seeds ({((seedsA / 64) * 100).toFixed(0)}%)</span>
            </div>
          </div>

          <div className="mt-3 text-xs text-amber-200/90 font-mono bg-[#161c24] px-4 py-2 rounded-xl border border-slate-800">
            {statusMessage}
          </div>
        </div>

        {/* Right Info Sidebar */}
        <div className="space-y-4">
          <div className="p-4 bg-[#141a22] border border-slate-800 rounded-xl space-y-3">
            <h4 className="text-sm font-bold text-slate-200 font-display flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400" />
              <span>Igisoro Advantage Formula</span>
            </h4>
            <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
              <p>
                From Concept Document Section 7.6: Let <code>p</code> be the fraction of all 64 seeds
                controlled by a player.
              </p>
              <div className="p-2.5 bg-[#0e131a] rounded-lg font-mono text-[11px] text-amber-300 space-y-1">
                <div>A Seeds: {seedsA} / 64 (p = {(seedsA / 64).toFixed(2)})</div>
                <div>Formula: w = |2p - 1| = {currentMatch.w.toFixed(2)}</div>
                <div>Current Holding: {currentMatch.holdingA.toFixed(2)} inka</div>
              </div>
              <p className="text-[11px] text-slate-500">
                Captures happen when your last seed lands in an occupied front pit with opponent seeds opposite!
              </p>
            </div>
          </div>

          {currentMatch.status === 'settled' && (
            <div className="p-4 bg-emerald-950/30 border border-emerald-800/50 rounded-xl text-emerald-200 space-y-3">
              <div className="flex items-center gap-2 font-display font-bold text-sm">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Match Settled</span>
              </div>
              <p className="text-xs text-slate-300">{currentMatch.settlementReason}</p>
              <div className="p-3 bg-[#10141a] rounded-lg text-xs font-mono text-amber-300 flex justify-between">
                <span>Final Inka Received:</span>
                <strong className="text-white">{currentMatch.holdingA.toFixed(2)} Inka</strong>
              </div>
              <button
                onClick={() => setCurrentMatch(null)}
                className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
              >
                Return to Lobby
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
