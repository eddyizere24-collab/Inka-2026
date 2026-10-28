import React, { useState, useEffect } from 'react';
import { Clock, Eye, AlertTriangle, ShieldCheck, Pause, Square } from 'lucide-react';
import { ActiveMatch } from '../../context/PlatformContext';
import { sounds } from '../../utils/sound';

interface SettlementBarProps {
  match: ActiveMatch;
  turn: 'A' | 'B';
  onStop: () => void;
  onPause?: () => void;
  onTimeout?: (player: 'A' | 'B') => void;
}

export const SettlementBar: React.FC<SettlementBarProps> = ({
  match,
  turn,
  onStop,
  onPause,
  onTimeout,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [showStopConfirm, setShowStopConfirm] = useState(false);

  // 30-second move timer per Section 7.10
  useEffect(() => {
    setTimeLeft(30);
  }, [turn, match.moveCount]);

  useEffect(() => {
    if (match.status !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 10) {
          sounds.playTimerWarning();
        }
        if (prev <= 1) {
          if (onTimeout) onTimeout(turn);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [turn, match.status, onTimeout]);

  const pool = match.stakeA + match.stakeB;
  const percentA = pool > 0 ? (match.holdingA / pool) * 100 : 50;

  return (
    <div className="w-full bg-[#12171f] border border-[#242e3e] rounded-2xl p-4 shadow-xl">
      {/* Top row: Players, stakes, spectators */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
        {/* Player A (You) */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600/30 border border-amber-500/50 flex items-center justify-center font-bold text-amber-300 text-sm">
            {match.playerA.name.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-100 text-sm">{match.playerA.name}</span>
              {turn === 'A' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  TURN
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400">
              Stake: <span className="font-mono text-slate-200">{match.stakeA} inka</span>
              <span className="mx-1.5 text-slate-600">·</span>
              Holding: <strong className="font-mono text-amber-400 font-semibold">{match.holdingA.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {/* Center: Live Timer & Advantage Display */}
        <div className="flex flex-col items-center justify-center">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold transition-colors ${
              timeLeft <= 10
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                : 'bg-[#18202b] text-slate-300 border border-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{timeLeft}s</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            {match.leader ? (
              <span>
                {match.leader === 'A' ? match.playerA.name.split(' ')[0] : match.playerB.name.split(' ')[0]} leads (w = {match.w.toFixed(2)})
              </span>
            ) : (
              <span>Level Standing (w = 0)</span>
            )}
          </div>
        </div>

        {/* Player B (Opponent) */}
        <div className="flex items-center gap-3 text-right">
          <div>
            <div className="flex items-center justify-end gap-2">
              {turn === 'B' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/40">
                  TURN
                </span>
              )}
              <span className="font-semibold text-slate-100 text-sm">{match.playerB.name}</span>
            </div>
            <div className="text-xs text-slate-400">
              Holding: <strong className="font-mono text-amber-400 font-semibold">{match.holdingB.toFixed(2)}</strong>
              <span className="mx-1.5 text-slate-600">·</span>
              Stake: <span className="font-mono text-slate-200">{match.stakeB} inka</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center font-bold text-blue-300 text-sm">
            {match.playerB.name.slice(0, 2)}
          </div>
        </div>
      </div>

      {/* Gradual Inka Movement Progress Bar (Formula Visualization) */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 font-mono">
          <span>{match.holdingA.toFixed(2)} inka ({percentA.toFixed(1)}%)</span>
          <span className="text-slate-500">Total Pool: {pool} inka</span>
          <span>{match.holdingB.toFixed(2)} inka ({(100 - percentA).toFixed(1)}%)</span>
        </div>
        <div className="h-2.5 w-full bg-[#18202b] rounded-full overflow-hidden flex border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-300"
            style={{ width: `${percentA}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-300"
            style={{ width: `${100 - percentA}%` }}
          />
        </div>
      </div>

      {/* Bottom controls: Freedom to Stop, Spectators counter, Notice */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1e2735] text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Eye className="w-4 h-4 text-amber-400" />
          <span>{match.spectatorsCount} spectators watching live</span>
          <span className="text-slate-600">·</span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Comments hidden from players until match finishes
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onPause && (
            <button
              onClick={onPause}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </button>
          )}

          {/* Freedom to Stop Button (Concept Section 7.8) */}
          <button
            onClick={() => setShowStopConfirm(true)}
            className="px-3.5 py-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop & Keep Standing</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Stopping */}
      {showStopConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-[#161c24] border border-[#2b3544] rounded-2xl shadow-2xl p-5 text-white">
            <div className="flex items-center gap-2 text-rose-400 mb-2 font-display font-bold text-base">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Stop Game & Keep Standing</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              According to Rwandan Skill-Games Platform Section 7.8, any player may stop at any moment.
              You will immediately retain your current holding of{' '}
              <strong className="text-amber-300 font-mono">{match.holdingA.toFixed(2)} inka</strong>.
              Your opponent cannot force you to continue.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowStopConfirm(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-700"
              >
                Continue Playing
              </button>
              <button
                onClick={() => {
                  setShowStopConfirm(false);
                  onStop();
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold"
              >
                Confirm Stop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
