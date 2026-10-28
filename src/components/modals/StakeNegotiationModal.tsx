import React, { useState } from 'react';
import { X, ShieldCheck, Scale, Coins } from 'lucide-react';
import { usePlatform, GameType, PlayerProfile } from '../../context/PlatformContext';

interface StakeNegotiationModalProps {
  opponent: PlayerProfile;
  initialGame?: GameType;
  onClose: () => void;
  onStart: (gameType: GameType, stakeA: number, stakeB: number) => void;
}

export const StakeNegotiationModal: React.FC<StakeNegotiationModalProps> = ({
  opponent,
  initialGame = 'dame',
  onClose,
  onStart,
}) => {
  const { currentUser, inkaBalance, t } = usePlatform();
  const [selectedGame, setSelectedGame] = useState<GameType>(initialGame);
  const [stakeA, setStakeA] = useState<number>(5);
  const [stakeB, setStakeB] = useState<number>(3);
  const [message, setMessage] = useState<string>('Ready for a good, respectful game!');

  const pool = stakeA + stakeB;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stakeA > inkaBalance) {
      alert(`Your stake (${stakeA} inka) exceeds your current balance (${inkaBalance} inka).`);
      return;
    }
    onStart(selectedGame, stakeA, stakeB);
  };

  return (
    <div
      role="dialog"
      aria-labelledby="stake-modal-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
    >
      <div className="w-full max-w-lg bg-[#161c24] border border-[#2b3544] rounded-2xl shadow-2xl p-6 text-white relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 id="stake-modal-title" className="text-xl font-bold font-display text-white mb-1">
          Challenge {opponent.name}
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          {opponent.city} · Rating {opponent.rating} · Preferred: {opponent.favGame.toUpperCase()}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Game Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Select Game:</label>
            <div className="grid grid-cols-3 gap-2">
              {(['dame', 'igisoro', 'biyari'] as GameType[]).map((game) => (
                <button
                  type="button"
                  key={game}
                  onClick={() => setSelectedGame(game)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all ${
                    selectedGame === game
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-[#10141a] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {game}
                </button>
              ))}
            </div>
          </div>

          {/* Stakes Grid (Unequal Stakes permitted) */}
          <div className="p-4 bg-[#10141a] rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
                <Coins className="w-4 h-4" />
                <span>Agree Stakes (Inka)</span>
              </div>
              <span className="text-xs text-slate-400">
                Your Balance: <strong className="text-slate-200 font-mono">{inkaBalance} Inka</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Your Stake ({currentUser.name})
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={Math.floor(inkaBalance)}
                    value={stakeA}
                    onChange={(e) => setStakeA(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-[#1a222d] border border-slate-700 rounded-lg text-white font-mono text-sm focus:border-amber-400 focus:outline-none"
                  />
                  <span className="text-xs text-slate-400">inka</span>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Opponent Stake ({opponent.name})
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={stakeB}
                    onChange={(e) => setStakeB(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-[#1a222d] border border-slate-700 rounded-lg text-white font-mono text-sm focus:border-amber-400 focus:outline-none"
                  />
                  <span className="text-xs text-slate-400">inka</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#161c24] rounded-lg border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Scale className="w-4 h-4 text-amber-400" />
                <span>Combined Pool:</span>
              </div>
              <span className="font-mono font-bold text-amber-300 text-sm">{pool} Inka</span>
            </div>

            <div className="text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Document Rule:</strong> Unequal stakes remain as agreed. A leader can win at most
                the opponent’s actual stake. As advantage changes, inka move gradually according to the
                formula: <code>a + (w × b)</code>. Either player can stop anytime.
              </span>
            </div>
          </div>

          {/* Pre-game greeting note */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Pre-game Chat Message:</label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 bg-[#10141a] border border-slate-700 rounded-lg text-xs text-slate-200 focus:border-amber-400 focus:outline-none"
              placeholder="e.g. Good luck and let us play with skill!"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-amber-950 transition-colors"
            >
              {t.startMatch}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
