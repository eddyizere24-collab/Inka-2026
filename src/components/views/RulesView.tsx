import React, { useState } from 'react';
import { Scale, Calculator, CheckCircle2, BookOpen, HelpCircle } from 'lucide-react';
import { calculateSettlement } from '../../utils/settlement';

export const RulesView: React.FC = () => {
  // Interactive Simulator state
  const [stakeA, setStakeA] = useState<number>(3);
  const [stakeB, setStakeB] = useState<number>(10);
  const [leader, setLeader] = useState<'A' | 'B'>('A');
  const [w, setW] = useState<number>(0.5);

  const settlement = calculateSettlement(stakeA, stakeB, leader, w);

  const setPreset = (a: number, b: number, lead: 'A' | 'B', adv: number) => {
    setStakeA(a);
    setStakeB(b);
    setLeader(lead);
    setW(adv);
  };

  const DECISIONS = [
    'The platform offers online multiplayer versions of Igisoro, Dame and Biyari.',
    'Every match is between real people. There are no bots or computer opponents.',
    'Users can request a game immediately, schedule a game, publish availability, and receive reminders.',
    'A person who publishes availability receives a call-style alert when someone requests a game.',
    'Every game uses inka. The two players agree their stakes, and the stakes do not need to be equal.',
    'Unequal stakes remain as agreed. A leader can win at most the opponent’s stake.',
    'Inka move gradually according to the settlement formula: a + (w × b).',
    'Each player starts with their own stake. Starting and immediately stopping changes nothing.',
    'Any player may stop at any time and keep their current holding. No one can force them to continue.',
    'Players may pause by mutual agreement and resume later.',
    'If a player disconnects, they receive a grace period. If they do not return, current standing is paid.',
    'A player taking more than 30s over a move receives an inka penalty.',
    'In Dame, each side starts with 10 pieces (20 total), and all pieces including kings are equal in inka value.',
    'Dame is the first game developed to provide the foundation for Igisoro and Biyari.',
    'Live games display player names, not photographs.',
    'Spectators comment among themselves. Players do not see those comments during a match.',
    'Spectators can request to play a player whose skill they admire.',
    'Spectator betting is removed from the concept to prevent collusion and preserve skill-game integrity.',
    'Inka are free at launch. Later they may be bought and redeemed with fixed spread (100 / 80 illustration).',
    'Only the platform sells or redeems inka. Users cannot trade directly to one another.',
    'Platform revenue comes from the inka buy/redeem price spread and outside ads, not from match cuts.',
    'Misuse is discouraged through fixed spreads, KYC identity checks, and payment tracking.',
    'Launch phase provides 100% free access and free inka.',
    'The concept is documented in full before development; no cut-down omission.',
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-display text-white">Principles & Mathematics</h2>
        <p className="text-xs text-slate-400 mt-1">
          Detailed mathematical rules, settlement formulas, and recorded principles from the Concept Document.
        </p>
      </div>

      {/* Interactive Settlement Formula Simulator (Section 7.3 - 7.5) */}
      <section className="p-6 bg-[#131922] border border-slate-800 rounded-3xl shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-lg">Interactive Formula Simulator</h3>
          </div>
          <span className="text-xs text-amber-400 font-mono">
            A holds: a + (w × b) · B holds: b × (1 - w)
          </span>
        </div>

        {/* Presets from PDF Table 7.5 */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-2">
            Worked Examples from Concept Document (Page 9):
          </label>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => setPreset(5, 5, 'A', 0.2)}
              className="px-2.5 py-1.5 bg-[#18212e] hover:bg-slate-700 rounded-lg text-slate-300 border border-slate-700 font-mono"
            >
              5 vs 5 (A w=0.2)
            </button>
            <button
              onClick={() => setPreset(5, 5, 'A', 0.5)}
              className="px-2.5 py-1.5 bg-[#18212e] hover:bg-slate-700 rounded-lg text-slate-300 border border-slate-700 font-mono"
            >
              5 vs 5 (A w=0.5)
            </button>
            <button
              onClick={() => setPreset(4, 5, 'B', 0.4)}
              className="px-2.5 py-1.5 bg-[#18212e] hover:bg-slate-700 rounded-lg text-slate-300 border border-slate-700 font-mono"
            >
              4 vs 5 (B w=0.4)
            </button>
            <button
              onClick={() => setPreset(3, 10, 'A', 0.5)}
              className="px-2.5 py-1.5 bg-amber-600/30 hover:bg-amber-600/50 rounded-lg text-amber-300 border border-amber-500/50 font-mono"
            >
              3 vs 10 (A w=0.5)
            </button>
            <button
              onClick={() => setPreset(3, 10, 'A', 1.0)}
              className="px-2.5 py-1.5 bg-amber-600/30 hover:bg-amber-600/50 rounded-lg text-amber-300 border border-amber-500/50 font-mono"
            >
              3 vs 10 (A w=1.0)
            </button>
            <button
              onClick={() => setPreset(3, 10, 'B', 0.5)}
              className="px-2.5 py-1.5 bg-[#18212e] hover:bg-slate-700 rounded-lg text-slate-300 border border-slate-700 font-mono"
            >
              3 vs 10 (B w=0.5)
            </button>
            <button
              onClick={() => setPreset(3, 10, 'B', 1.0)}
              className="px-2.5 py-1.5 bg-[#18212e] hover:bg-slate-700 rounded-lg text-slate-300 border border-slate-700 font-mono"
            >
              3 vs 10 (B w=1.0)
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-[#0c1015] rounded-2xl border border-slate-800">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Player A Stake (a):</label>
            <input
              type="number"
              min="1"
              max="100"
              value={stakeA}
              onChange={(e) => setStakeA(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 bg-[#161c24] border border-slate-700 rounded-lg text-white font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Player B Stake (b):</label>
            <input
              type="number"
              min="1"
              max="100"
              value={stakeB}
              onChange={(e) => setStakeB(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 bg-[#161c24] border border-slate-700 rounded-lg text-white font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Current Leader:</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setLeader('A')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold ${
                  leader === 'A' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Player A
              </button>
              <button
                type="button"
                onClick={() => setLeader('B')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold ${
                  leader === 'B' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Player B
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Advantage (w):</span>
              <span className="font-mono text-amber-400 font-bold">{w.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={w}
              onChange={(e) => setW(parseFloat(e.target.value))}
              className="w-full accent-amber-500 h-2 bg-slate-800 rounded cursor-pointer mt-2"
            />
          </div>
        </div>

        {/* Live Calculation Output Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#18212e] rounded-xl border border-amber-500/40">
            <span className="text-xs text-slate-400 block mb-1">Player A Current Holding:</span>
            <div className="text-2xl font-bold font-mono text-amber-300">
              {settlement.holdingA.toFixed(2)} Inka
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              Delta: {settlement.deltaA >= 0 ? `+${settlement.deltaA.toFixed(2)}` : settlement.deltaA.toFixed(2)} inka
            </span>
          </div>

          <div className="p-4 bg-[#18212e] rounded-xl border border-slate-700 text-center">
            <span className="text-xs text-slate-400 block mb-1">Total Pool Conserved (a + b):</span>
            <div className="text-2xl font-bold font-mono text-white">
              {settlement.totalPool.toFixed(2)} Inka
            </div>
            <span className="text-[11px] text-emerald-400 block mt-1">
              Invariant: {settlement.holdingA.toFixed(2)} + {settlement.holdingB.toFixed(2)} = {settlement.totalPool.toFixed(2)}
            </span>
          </div>

          <div className="p-4 bg-[#18212e] rounded-xl border border-blue-500/40 text-right">
            <span className="text-xs text-slate-400 block mb-1">Player B Current Holding:</span>
            <div className="text-2xl font-bold font-mono text-blue-300">
              {settlement.holdingB.toFixed(2)} Inka
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              Delta: {settlement.deltaB >= 0 ? `+${settlement.deltaB.toFixed(2)}` : settlement.deltaB.toFixed(2)} inka
            </span>
          </div>
        </div>
      </section>

      {/* Decision Log (Appendix C) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-white text-lg">Appendix C: The 24 Key Decisions</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DECISIONS.map((dec, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-[#131922] border border-slate-800 rounded-xl text-xs text-slate-300 flex items-start gap-3"
            >
              <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono font-bold text-[10px] shrink-0">
                {idx + 1}
              </span>
              <p className="leading-relaxed">{dec}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
