import React, { useEffect, useState } from 'react';
import { X, ShieldCheck, Clock, Award, Sparkles } from 'lucide-react';
import { usePlatform, GameType, TimeControl, PlayerProfile } from '../../context/PlatformContext';

interface ChallengeModalProps {
  opponent: PlayerProfile;
  initialGame?: GameType;
  onClose: () => void;
  onStart: (gameType: GameType, timeControl: TimeControl, message?: string) => void;
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  opponent,
  initialGame = 'dame',
  onClose,
  onStart,
}) => {
  const { lang, t } = usePlatform();
  const [selectedGame, setSelectedGame] = useState<GameType>(initialGame);
  const [timeControl, setTimeControl] = useState<TimeControl>('30s');
  const [message, setMessage] = useState<string>(t.defaultFriendlyMessage);
  const [hasEditedMessage, setHasEditedMessage] = useState(false);

  useEffect(() => {
    if (!hasEditedMessage) setMessage(t.defaultFriendlyMessage);
  }, [lang, t.defaultFriendlyMessage, hasEditedMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart(selectedGame, timeControl, message);
  };

  return (
    <div
      role="dialog"
      aria-labelledby="challenge-modal-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
    >
      <div className="w-full max-w-lg bg-[#141a24] border border-[#263448] rounded-2xl shadow-2xl p-6 text-white relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors cursor-pointer"
          aria-label={t.close}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center font-bold text-white text-sm shadow-md">
            {opponent.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 id="challenge-modal-title" className="text-lg font-bold font-display text-white">
              {t.challenge_player}: {opponent.name}
            </h3>
            <p className="text-xs text-slate-400">
              {opponent.city} · ★ {opponent.sportsmanshipLevel}.0 · {opponent.honorRating} {t.honorPointsLabel}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Game Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
              {t.select_game}
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(
                [
                  { id: 'dame', label: t.game_dame, desc: t.dameRulesShort },
                  { id: 'igisoro', label: t.game_igisoro, desc: t.igisoroRulesShort },
                  { id: 'biyari', label: t.game_biyari, desc: t.biyariRulesShort },
                ] as const
              ).map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedGame(g.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedGame === g.id
                      ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-lg'
                      : 'bg-[#18212e] border-slate-700/80 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="font-bold text-xs">{g.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{g.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Time Control Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
              {t.time_control}
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(
                [
                  { id: 'casual', label: t.time_casual, desc: t.timeNoLimit },
                  { id: '30s', label: t.time_30s, desc: t.timeOfficial30s },
                  { id: '60s', label: t.time_60s, desc: t.timeRelaxed60s },
                ] as const
              ).map((tc) => (
                <button
                  key={tc.id}
                  type="button"
                  onClick={() => setTimeControl(tc.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    timeControl === tc.id
                      ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-lg'
                      : 'bg-[#18212e] border-slate-700/80 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-1 font-semibold text-xs">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span>{tc.label}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{tc.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Friendly Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t.friendlyMessageLabel}
            </label>
            <input
              type="text"
              value={message}
              onChange={(e) => { setMessage(e.target.value); setHasEditedMessage(true); }}
              className="w-full bg-[#18212e] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              placeholder={t.friendlyMessagePlaceholder}
            />
          </div>

          {/* Fair-Play Creed Banner */}
          <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl flex items-start gap-2.5 text-xs text-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">{t.fair_play}:</span> {t.zero_wagering_rule} {t.sportsmanship_awarded}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span>{t.send_challenge}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
