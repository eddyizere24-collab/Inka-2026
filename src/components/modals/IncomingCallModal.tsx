import React, { useState } from 'react';
import { Phone, PhoneOff, ArrowRightLeft, ShieldCheck, Check } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';

export const IncomingCallModal: React.FC = () => {
  const { incomingRequest, respondToIncomingRequest, t } = usePlatform();
  const [isCountering, setIsCountering] = useState(false);
  const [counterStake, setCounterStake] = useState<number>(3);

  if (!incomingRequest) return null;

  const { challenger, gameType, proposedStake } = incomingRequest;

  return (
    <div
      role="dialog"
      aria-labelledby="incoming-call-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
    >
      <div className="w-full max-w-md bg-[#161c24] border border-[#2b3544] rounded-2xl shadow-2xl p-6 text-white text-center relative overflow-hidden">
        {/* Glow pulsing ring for incoming call effect */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-orange-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-4 animate-bounce">
          <Phone className="w-8 h-8 text-amber-400" />
        </div>

        <h3 id="incoming-call-title" className="text-xl font-bold font-display text-white mb-1">
          {t.incomingRequest}
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          Incoming real-time challenge from a live opponent
        </p>

        <div className="p-4 bg-[#10141a] rounded-xl border border-slate-800 mb-6 text-left space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-orange-800 flex items-center justify-center font-bold text-white uppercase text-sm">
                {challenger.name.slice(0, 2)}
              </div>
              <div>
                <p className="font-semibold text-slate-100">{challenger.name}</p>
                <p className="text-xs text-slate-400">{challenger.city} · Rating {challenger.rating}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold block">
                {gameType.toUpperCase()}
              </span>
              <span className="text-xs text-slate-400">{challenger.gamesPlayed} games played</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm">
            <span className="text-slate-400">Proposed Stake:</span>
            <span className="font-semibold text-amber-300 font-mono text-base">
              {proposedStake} Inka
            </span>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Gradual mathematical settlement applies. Stop anytime.</span>
          </div>
        </div>

        {isCountering ? (
          <div className="mb-6 p-4 bg-[#1a222d] rounded-xl border border-amber-500/30 text-left">
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Propose Your Stake (Your inka at risk):
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="50"
                value={counterStake}
                onChange={(e) => setCounterStake(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 px-3 py-2 bg-[#10141a] border border-slate-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-amber-400"
              />
              <span className="text-xs text-slate-400">Opponent stakes {proposedStake} inka (unequal stakes allowed)</span>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => respondToIncomingRequest('decline')}
            className="flex flex-col items-center justify-center gap-1.5 py-3 px-3 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 rounded-xl font-medium text-xs transition-colors"
          >
            <PhoneOff className="w-4 h-4" />
            <span>{t.decline}</span>
          </button>

          {!isCountering ? (
            <button
              onClick={() => setIsCountering(true)}
              className="flex flex-col items-center justify-center gap-1.5 py-3 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-medium text-xs transition-colors"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>{t.counter}</span>
            </button>
          ) : (
            <button
              onClick={() => setIsCountering(false)}
              className="flex flex-col items-center justify-center gap-1.5 py-3 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl font-medium text-xs transition-colors"
            >
              <span>Back</span>
            </button>
          )}

          <button
            onClick={() => respondToIncomingRequest('accept', isCountering ? counterStake : undefined)}
            className="flex flex-col items-center justify-center gap-1.5 py-3 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium text-xs shadow-lg shadow-emerald-950 transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>{isCountering ? 'Send & Start' : t.accept}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
