import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Eye,
  AlertTriangle,
  ShieldCheck,
  Pause,
  Play,
  Handshake,
  Flag,
  Award,
  Info,
  X,
  Swords,
  Sparkles,
} from 'lucide-react';
import { ActiveMatch, usePlatform } from '../../context/PlatformContext';
import { sounds } from '../../utils/sound';

interface GameHudProps {
  match: ActiveMatch;
  turn: 'A' | 'B';
  onPauseToggle?: () => void;
  onProposeDraw?: () => void;
  onResign?: () => void;
  onFriendlyStop?: () => void;
  customStatsA?: React.ReactNode;
  customStatsB?: React.ReactNode;
  rulesContent?: React.ReactNode;
}

export const GameHud: React.FC<GameHudProps> = ({
  match,
  turn,
  onPauseToggle,
  onProposeDraw,
  onResign,
  onFriendlyStop,
  customStatsA,
  customStatsB,
  rulesContent,
}) => {
  const { t, concludeMatch, lang } = usePlatform();
  const moveTimeLimit = match.timeControl === 'casual' ? null : match.timeControl === '60s' ? 60 : 30;
  const [timeLeft, setTimeLeft] = useState<number>(moveTimeLimit ?? 0);
  const warningPlayedRef = useRef(false);
  const timeoutHandledRef = useRef(false);

  const [showStopModal, setShowStopModal] = useState<boolean>(false);
  const [showResignModal, setShowResignModal] = useState<boolean>(false);
  const [showDrawModal, setShowDrawModal] = useState<boolean>(false);
  const [showInfoDrawer, setShowInfoDrawer] = useState<boolean>(false);

  // Reset the move timer whenever a new turn or move begins.
  useEffect(() => {
    setTimeLeft(moveTimeLimit ?? 0);
    warningPlayedRef.current = false;
    timeoutHandledRef.current = false;
  }, [turn, match.moveCount, moveTimeLimit]);

  // Casual games have no countdown; timed games use their selected 30s or 60s limit.
  useEffect(() => {
    if (match.status !== 'playing' || moveTimeLimit === null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [turn, match.status, moveTimeLimit]);

  useEffect(() => {
    if (moveTimeLimit === null || timeLeft !== 10 || warningPlayedRef.current) return;
    warningPlayedRef.current = true;
    sounds.playTimerWarning();
  }, [timeLeft, moveTimeLimit]);

  useEffect(() => {
    if (moveTimeLimit === null || timeLeft !== 0 || match.status !== 'playing' || timeoutHandledRef.current) return;
    timeoutHandledRef.current = true;
    const winner: 'A' | 'B' = turn === 'A' ? 'B' : 'A';
    const losingPlayer = turn === 'A' ? match.playerA.name : match.playerB.name;
    const winningPlayer = winner === 'A' ? match.playerA.name : match.playerB.name;
    const reason = t.timeoutVictoryReason.replace('{player}', losingPlayer).replace('{winner}', winningPlayer);
    concludeMatch(reason, false, winner);
  }, [timeLeft, moveTimeLimit, match.status, match.playerA.name, match.playerB.name, turn, t, concludeMatch]);

  const advantagePercentA = match.leader === 'A'
    ? 50 + (match.advantage * 50)
    : match.leader === 'B'
    ? 50 - (match.advantage * 50)
    : 50;

  return (
    <>
      {/* Compact, Ultra-Streamlined Match HUD Bar */}
      <div className="w-full bg-[#0d141e]/95 backdrop-blur-md border border-[#232d3d] rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-xl flex items-center justify-between gap-2 sm:gap-4 shrink-0 select-none">
        {/* Left: Player A (You) */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div
            className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm text-white shadow transition-all ${
              turn === 'A'
                ? 'bg-gradient-to-br from-emerald-500 to-teal-700 ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#0d141e]'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            {match.playerA.name.slice(0, 2).toUpperCase()}
            {turn === 'A' && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-semibold text-slate-100 text-xs sm:text-sm truncate max-w-[80px] sm:max-w-[120px]">
                {match.playerA.name}
              </span>
              {turn === 'A' && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  {t.turnYourTurn}
                </span>
              )}
            </div>
            {customStatsA && (
              <div className="mt-1 text-[11px] font-mono leading-none">
                {customStatsA}
              </div>
            )}
          </div>
        </div>

        {/* Center: Timer & Advantage Micro-Gauge */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Timer */}
          {moveTimeLimit === null ? (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#141b26] border border-slate-800 text-[11px] font-mono text-slate-400" title={t.timeNoLimit}>
              <Clock className="w-3 h-3 text-slate-500" />
              <span>∞</span>
            </div>
          ) : (
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all shadow-inner ${
                timeLeft <= 10
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse'
                  : 'bg-[#141b26] text-slate-200 border border-slate-800'
              }`}
              title={t.moveTimer}
            >
              <Clock className="w-3 h-3 text-amber-400" />
              <span>{timeLeft}s</span>
            </div>
          )}

          {/* Micro Advantage Split Bar */}
          <div className="hidden sm:flex flex-col items-center w-20 lg:w-28" title={`${t.score_advantage}: ${advantagePercentA.toFixed(0)}% / ${(100 - advantagePercentA).toFixed(0)}%`}>
            <div className="h-1.5 w-full bg-[#16202e] rounded-full overflow-hidden flex border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                style={{ width: `${advantagePercentA}%` }}
              />
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                style={{ width: `${100 - advantagePercentA}%` }}
              />
            </div>
            <span className="text-[9px] font-mono text-slate-400 mt-0.5">
              {advantagePercentA > 50 ? `${match.playerA.name.slice(0, 6)} +${(advantagePercentA - 50).toFixed(0)}%` : advantagePercentA < 50 ? `${match.playerB.name.slice(0, 6)} +${(50 - advantagePercentA).toFixed(0)}%` : '='}
            </span>
          </div>
        </div>

        {/* Right: Player B (Opponent) */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 text-right justify-end">
          <div className="min-w-0">
            <div className="flex items-center justify-end gap-1.5 leading-none">
              {turn === 'B' && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                  {t.turnOpponentTurn}
                </span>
              )}
              <span className="font-semibold text-slate-100 text-xs sm:text-sm truncate max-w-[80px] sm:max-w-[120px]">
                {match.playerB.name}
              </span>
            </div>
            {customStatsB && (
              <div className="mt-1 text-[11px] font-mono leading-none">
                {customStatsB}
              </div>
            )}
          </div>

          <div
            className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm text-white shadow transition-all ${
              turn === 'B'
                ? 'bg-gradient-to-br from-cyan-500 to-blue-700 ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#0d141e]'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            {match.playerB.name.slice(0, 2).toUpperCase()}
            {turn === 'B' && (
              <span className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            )}
          </div>
        </div>

        {/* Action Icon Cluster */}
        <div className="flex items-center gap-1 sm:gap-1.5 pl-1 border-l border-slate-800 shrink-0">
          {onPauseToggle && (
            <button
              onClick={onPauseToggle}
              className="p-1.5 sm:p-2 bg-[#141b26] hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors cursor-pointer border border-slate-800"
              title={match.status === 'paused' ? t.resume : t.pause}
              aria-label={match.status === 'paused' ? t.resume : t.pause}
            >
              {match.status === 'paused' ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            onClick={() => setShowDrawModal(true)}
            className="p-1.5 sm:p-2 bg-[#141b26] hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors cursor-pointer border border-slate-800"
            title={t.draw}
            aria-label={t.draw}
          >
            <Handshake className="w-3.5 h-3.5 text-amber-400" />
          </button>

          <button
            onClick={() => setShowResignModal(true)}
            className="p-1.5 sm:p-2 bg-[#141b26] hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 rounded-lg text-xs transition-colors cursor-pointer border border-slate-800"
            title={t.resign}
            aria-label={t.resign}
          >
            <Flag className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            onClick={() => setShowStopModal(true)}
            className="p-1.5 sm:p-2 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 rounded-lg text-xs transition-colors cursor-pointer border border-emerald-800/60"
            title={t.stop_game}
            aria-label={t.stop_game}
          >
            <Award className="w-3.5 h-3.5 text-emerald-400" />
          </button>

          {/* Rules & Details Drawer Toggle */}
          <button
            onClick={() => setShowInfoDrawer(true)}
            className="p-1.5 sm:p-2 bg-[#182230] hover:bg-slate-700 text-cyan-300 rounded-lg text-xs transition-colors cursor-pointer border border-slate-700 relative"
            title={t.gameDetailsAndRules}
            aria-label={t.gameDetailsAndRules}
          >
            <Info className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Slide-out Match Details & Rules Drawer (Hidden by default!) */}
      {showInfoDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-sm sm:max-w-md h-full bg-[#101722]/98 border-l border-slate-800 p-5 overflow-y-auto shadow-2xl flex flex-col justify-between text-slate-100 animate-in slide-in-from-right duration-200"
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="font-display font-bold text-base text-white">
                    {t.gameDetailsAndRules}
                  </span>
                </div>
                <button
                  onClick={() => setShowInfoDrawer(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                  aria-label={t.close}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Injected Rules / Specific Game Details */}
              {rulesContent && (
                <div className="mb-4 space-y-3">
                  {rulesContent}
                </div>
              )}

              {/* Standard Fair Play & Scoring Charter */}
              <div className="p-3.5 bg-[#0e141d] rounded-xl border border-slate-800/80 space-y-2 mb-4 text-xs text-slate-300">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                  <span>{t.fair_play}</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  {t.zero_wagering_rule}
                </p>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">{t.score_advantage}:</span>
                  <span className="text-emerald-400 font-bold">{(match.advantage * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">{t.leaderLabel}:</span>
                  <span className="text-white font-semibold">
                    {match.leader ? (match.leader === 'A' ? match.playerA.name : match.playerB.name) : t.levelStanding}
                  </span>
                </div>
              </div>

              {/* Spectator Information */}
              <div className="p-3 bg-[#0e141d] rounded-xl border border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{match.spectatorsCount} {t.spectators_watching}</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  {t.spectator_comments_hidden}
                </p>
              </div>
            </div>

            {/* Bottom Dismiss Button */}
            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => setShowInfoDrawer(false)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

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
              {t.playerConcededReason.replace('{player}', match.playerA.name)}
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
              {t.mutualDrawAgreed}
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
    </>
  );
};
