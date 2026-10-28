import React, { useState, useEffect } from 'react';
import { Clock, Eye, AlertTriangle, ShieldCheck, Pause, Play, Handshake, Flag, Award } from 'lucide-react';
import { ActiveMatch, usePlatform } from '../../context/PlatformContext';
import { sounds } from '../../utils/sound';

interface GameHudProps {
  match: ActiveMatch;
  turn: 'A' | 'B';
  onTimeout?: (player: 'A' | 'B') => void;
  onPauseToggle?: () => void;
  onProposeDraw?: () => void;
  onResign?: () => void;
  onFriendlyStop?: () => void;
  customStatsA?: React.ReactNode;
  customStatsB?: React.ReactNode;
}

export const GameHud: React.FC<GameHudProps> = ({
  match,
  turn,
  onTimeout,
  onPauseToggle,
  onProposeDraw,
  onResign,
  onFriendlyStop,
  customStatsA,
  customStatsB,
}) => {
  const { t, concludeMatch } = usePlatform();
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [showStopModal, setShowStopModal] = useState<boolean>(false);
  const [showResignModal, setShowResignModal] = useState<boolean>(false);
  const [showDrawModal, setShowDrawModal] = useState<boolean>(false);

  // Reset timer on turn change or move
  useEffect(() => {
    setTimeLeft(30);
  }, [turn, match.moveCount]);

  // Timer countdown
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

  // Advantage visual percentage
  // If leader is A, advantage pushes bar towards A (50% to 100%)
  // If leader is B, advantage pushes bar towards B (50% to 0%)
  const advantagePercentA = match.leader === 'A'
    ? 50 + (match.advantage * 50)
    : match.leader === 'B'
    ? 50 - (match.advantage * 50)
    : 50;

  return (
    <div className="w-full bg-[#111620] border border-[#232d3d] rounded-2xl p-4 sm:p-5 shadow-2xl">
      {/* Top row: Players, turns, advantage */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        {/* Player A (You) */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 border border-emerald-400/40 flex items-center justify-center font-bold text-white text-base shadow-md">
            {match.playerA.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-100 text-sm sm:text-base">{match.playerA.name}</span>
              {turn === 'A' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                  {t.nav_play.toUpperCase()}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span>{match.playerA.city}</span>
              <span className="text-slate-600">·</span>
              <span className="text-emerald-400 font-medium">★ {match.playerA.sportsmanshipLevel}.0</span>
              {customStatsA && (
                <>
                  <span className="text-slate-600">·</span>
                  {customStatsA}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Center: Live Timer & Skill Advantage Display */}
        <div className="flex flex-col items-center justify-center">
          <div
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all shadow-sm ${
              timeLeft <= 10
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse scale-105'
                : 'bg-[#18212e] text-slate-200 border border-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{timeLeft}s</span>
          </div>

          <div className="text-[11px] text-slate-400 mt-1.5 font-medium flex items-center gap-1">
            {match.leader ? (
              <span className="text-amber-300 font-semibold">
                {match.leader === 'A' ? match.playerA.name.split(' ')[0] : match.playerB.name.split(' ')[0]} {t.lead_advantage} ({(match.advantage * 100).toFixed(0)}%)
              </span>
            ) : (
              <span className="text-slate-400">{t.equal_standing}</span>
            )}
          </div>
        </div>

        {/* Player B (Opponent) */}
        <div className="flex items-center gap-3 text-right">
          <div>
            <div className="flex items-center justify-end gap-2">
              {turn === 'B' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-pulse">
                  {t.nav_play.toUpperCase()}
                </span>
              )}
              <span className="font-semibold text-slate-100 text-sm sm:text-base">{match.playerB.name}</span>
            </div>
            <div className="text-xs text-slate-400 flex items-center justify-end gap-2">
              {customStatsB && (
                <>
                  {customStatsB}
                  <span className="text-slate-600">·</span>
                </>
              )}
              <span className="text-cyan-400 font-medium">★ {match.playerB.sportsmanshipLevel}.0</span>
              <span className="text-slate-600">·</span>
              <span>{match.playerB.city}</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-800 border border-cyan-400/40 flex items-center justify-center font-bold text-white text-base shadow-md">
            {match.playerB.name.slice(0, 2).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Advantage Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 font-mono">
          <span className="text-emerald-400 font-medium">{match.playerA.name.split(' ')[0]}: {advantagePercentA.toFixed(0)}%</span>
          <span className="text-slate-500 text-[10px] uppercase tracking-wider">{t.score_advantage}</span>
          <span className="text-cyan-400 font-medium">{match.playerB.name.split(' ')[0]}: {(100 - advantagePercentA).toFixed(0)}%</span>
        </div>
        <div className="h-2.5 w-full bg-[#18212e] rounded-full overflow-hidden flex border border-slate-800 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-l-full transition-all duration-300"
            style={{ width: `${advantagePercentA}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 rounded-r-full transition-all duration-300"
            style={{ width: `${100 - advantagePercentA}%` }}
          />
        </div>
      </div>

      {/* Controls & Spectator isolation notice */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1e2736] text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Eye className="w-4 h-4 text-emerald-400" />
          <span>{match.spectatorsCount} {t.spectators_watching}</span>
          <span className="text-slate-600 hidden sm:inline">·</span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            {t.spectator_comments_hidden}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onPauseToggle && (
            <button
              onClick={onPauseToggle}
              className="px-3 py-1.5 bg-[#18212e] hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {match.status === 'paused' ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{match.status === 'paused' ? t.resume : t.pause}</span>
            </button>
          )}

          <button
            onClick={() => setShowDrawModal(true)}
            className="px-3 py-1.5 bg-[#18212e] hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Handshake className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.draw}</span>
          </button>

          <button
            onClick={() => setShowResignModal(true)}
            className="px-3 py-1.5 bg-slate-800/80 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 rounded-lg text-xs font-medium border border-slate-700 hover:border-rose-800/60 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5 text-slate-400" />
            <span>{t.resign}</span>
          </button>

          <button
            onClick={() => setShowStopModal(true)}
            className="px-3.5 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.stop_game}</span>
          </button>
        </div>
      </div>

      {/* Stop / Conclude Modal */}
      {showStopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-[#161d27] border border-[#2b3749] rounded-2xl shadow-2xl p-5 text-white">
            <div className="flex items-center gap-2 text-emerald-400 mb-2 font-display font-bold text-base">
              <Award className="w-5 h-5 shrink-0" />
              <span>{t.stop_game}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {t.inka_philosophy} {t.sportsmanship_awarded}
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowStopModal(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-700 cursor-pointer"
              >
                {t.continue_playing}
              </button>
              <button
                onClick={() => {
                  setShowStopModal(false);
                  if (onFriendlyStop) onFriendlyStop();
                  else concludeMatch(t.friendlyMatchConclusion, false, match.leader || undefined);
                }}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md cursor-pointer"
              >
                {t.confirm_stop}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resign Modal */}
      {showResignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-[#161d27] border border-[#2b3749] rounded-2xl shadow-2xl p-5 text-white">
            <div className="flex items-center gap-2 text-rose-400 mb-2 font-display font-bold text-base">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{t.resign}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Conceding rewards sportsmanship honor to your opponent while maintaining your fair-play record.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowResignModal(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-700 cursor-pointer"
              >
                {t.continue_playing}
              </button>
              <button
                onClick={() => {
                  setShowResignModal(false);
                  if (onResign) onResign();
                  else concludeMatch(t.playerConcededReason.replace('{player}', match.playerA.name), false, 'B');
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-md cursor-pointer"
              >
                {t.resign}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Draw Offer Modal */}
      {showDrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-[#161d27] border border-[#2b3749] rounded-2xl shadow-2xl p-5 text-white">
            <div className="flex items-center gap-2 text-amber-400 mb-2 font-display font-bold text-base">
              <Handshake className="w-5 h-5 shrink-0" />
              <span>{t.draw}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Agreeing to a draw recognizes an evenly matched contest. Both players receive sportsmanship honors.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowDrawModal(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-700 cursor-pointer"
              >
                {t.continue_playing}
              </button>
              <button
                onClick={() => {
                  setShowDrawModal(false);
                  if (onProposeDraw) onProposeDraw();
                  else concludeMatch(t.mutualDrawAgreed, true);
                }}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-md cursor-pointer"
              >
                {t.draw}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
