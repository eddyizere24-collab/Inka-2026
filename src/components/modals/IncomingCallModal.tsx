import React from 'react';
import { Phone, PhoneOff, Check, ShieldCheck, Clock, Award } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';

export const IncomingCallModal: React.FC = () => {
  const { incomingChallenge, respondToIncomingChallenge, t } = usePlatform();

  if (!incomingChallenge) return null;

  const { challenger, gameType, timeControl, message } = incomingChallenge;

  return (
    <div
      role="dialog"
      aria-labelledby="incoming-challenge-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
    >
      <div className="w-full max-w-md bg-[#141a24] border border-[#2b3749] rounded-2xl shadow-2xl p-6 text-white text-center relative overflow-hidden">
        {/* Glow pulsing ring for incoming call effect */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="inline-flex p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl mb-4 animate-bounce">
          <Phone className="w-8 h-8 text-emerald-400" />
        </div>

        <h3 id="incoming-challenge-title" className="text-xl font-bold font-display text-white mb-1">
          {t.incoming_call}
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          Live real-time match invitation
        </p>

        <div className="p-4 bg-[#10151d] rounded-xl border border-slate-800 mb-5 text-left space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center font-bold text-white uppercase text-sm shadow-md">
                {challenger.name.slice(0, 2)}
              </div>
              <div>
                <p className="font-semibold text-slate-100 text-sm">{challenger.name}</p>
                <p className="text-xs text-slate-400">{challenger.city} · ★ {challenger.sportsmanshipLevel}.0</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold block">
                {gameType.toUpperCase()}
              </span>
              <span className="text-xs text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>{timeControl}</span>
              </span>
            </div>
          </div>

          {message && (
            <div className="p-2.5 bg-[#161c26] rounded-lg text-xs text-slate-300 italic border border-slate-800/80">
              "{message}"
            </div>
          )}

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-800/80">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{t.zero_wagering_rule}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => respondToIncomingChallenge('decline')}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
          >
            <PhoneOff className="w-4 h-4" />
            <span>{t.decline}</span>
          </button>

          <button
            onClick={() => respondToIncomingChallenge('accept')}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-950 transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{t.accept}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
