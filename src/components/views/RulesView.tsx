import React, { useState } from 'react';
import { ShieldCheck, Calculator, CheckCircle2, BookOpen, HeartHandshake, Award, Sparkles } from 'lucide-react';
import { calculateDameAdvantage, calculateIgisoroAdvantage, calculateBiyariAdvantage } from '../../utils/matchScoring';
import { usePlatform } from '../../context/PlatformContext';

export const RulesView: React.FC = () => {
  const { t } = usePlatform();

  // Interactive Advantage Engine Simulator state
  const [activeGameSim, setActiveGameSim] = useState<'dame' | 'igisoro' | 'biyari'>('dame');

  // Dame params
  const [dameCapA, setDameCapA] = useState<number>(3);
  const [dameCapB, setDameCapB] = useState<number>(1);

  // Igisoro params
  const [seedsA, setSeedsA] = useState<number>(40);
  const seedsB = 64 - seedsA;

  // Biyari params
  const [biyariA, setBiyariA] = useState<number>(4);
  const [biyariB, setBiyariB] = useState<number>(2);

  const dameResult = calculateDameAdvantage(dameCapA, dameCapB, dameCapA >= 10, dameCapB >= 10);
  const igisoroResult = calculateIgisoroAdvantage(seedsA, seedsB, seedsB === 0, seedsA === 0);
  const biyariResult = calculateBiyariAdvantage(biyariA, biyariB, biyariA >= 5, biyariB >= 5);

  const CORE_PRINCIPLES = [
    {
      title: '1. Ubucuti n’Ubumwe (Friendship & Connection)',
      desc: 'Games are cultural vessels designed to connect people across Rwanda, strengthen bonds of friendship, and inspire mutual respect.',
    },
    {
      title: '2. Umwimerere w’Umuco (Authentic Rwandan Heritage)',
      desc: 'Preserving the traditional mechanics of Igisoro and Rwandan Dame with meticulous fidelity to ancestral rules.',
    },
    {
      title: '3. Zero Wagering & Pure Skill (Gukina Ku Bwenge)',
      desc: 'No money stakes, no cow betting, and no financial risk. Play is 100% free and governed entirely by intellect, tactics, and sportsmanship.',
    },
    {
      title: '4. Strictly Human-vs-Human (Abantu Ku Bindi)',
      desc: 'Zero artificial intelligence bots or computer fakes. Every opponent you challenge is a verified human player.',
    },
    {
      title: '5. Ubwiyunge n’Ubwisanzure (Freedom to Conclude)',
      desc: 'Any player may pause or conclude a match with dignity. Sportsmanship honor points are awarded equally for graceful play.',
    },
    {
      title: '6. Intego y’Umutuzo (Quiet Spectator Focus)',
      desc: 'Spectators observe in silence without outside advice or coaching. Tactical commentary is only revealed after the final move.',
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">{t.rules_title}</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {t.rules_desc}
        </p>
      </div>

      {/* Six Core Principles Card */}
      <section className="p-6 bg-[#131923] border border-slate-800 rounded-3xl shadow-xl space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-white text-lg">The Six INKA Core Principles</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CORE_PRINCIPLES.map((cp, idx) => (
            <div key={idx} className="p-4 bg-[#0e131b] border border-slate-800/80 rounded-2xl space-y-1.5">
              <h4 className="font-semibold text-emerald-300 text-sm">{cp.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{cp.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Advantage Engine Simulator */}
      <section className="p-6 bg-[#131923] border border-slate-800 rounded-3xl shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-lg">Interactive Skill Advantage Engine</h3>
          </div>
          <span className="text-xs text-emerald-400 font-mono">
            Normalized skill advantage w ∈ [0.0, 1.0]
          </span>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 border-b border-slate-800 pb-2">
          {(
            [
              { id: 'dame', label: 'Dame (Checkers)' },
              { id: 'igisoro', label: 'Igisoro (Mancala)' },
              { id: 'biyari', label: 'Biyari (Billiards)' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveGameSim(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeGameSim === tab.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-[#18212e] text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dame Simulator */}
        {activeGameSim === 'dame' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Player A Captures: <span className="font-mono text-emerald-400 font-bold">{dameCapA}</span> / 10
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={dameCapA}
                  onChange={(e) => setDameCapA(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Player B Captures: <span className="font-mono text-cyan-400 font-bold">{dameCapB}</span> / 10
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={dameCapB}
                  onChange={(e) => setDameCapB(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="p-4 bg-[#0e131b] border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400">Net Capture Difference:</span>{' '}
                <strong className="text-white">{Math.abs(dameCapA - dameCapB)} pieces</strong>
              </div>
              <div>
                <span className="text-slate-400">Skill Advantage (w):</span>{' '}
                <strong className="text-emerald-400">{dameResult.w.toFixed(2)} ({(dameResult.w * 100).toFixed(0)}%)</strong>
              </div>
              <div>
                <span className="text-slate-400">Leader:</span>{' '}
                <strong className="text-amber-300">{dameResult.leader ? `Player ${dameResult.leader}` : 'Level Standing'}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Igisoro Simulator */}
        {activeGameSim === 'igisoro' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Player A Seeds: <span className="font-mono text-emerald-400 font-bold">{seedsA}</span> / 64 (Player B holds {seedsB})
              </label>
              <input
                type="range"
                min="0"
                max="64"
                value={seedsA}
                onChange={(e) => setSeedsA(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="p-4 bg-[#0e131b] border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400">Seed Ratio (p):</span>{' '}
                <strong className="text-white">{(seedsA / 64).toFixed(3)}</strong>
              </div>
              <div>
                <span className="text-slate-400">Formula w = |2p - 1|:</span>{' '}
                <strong className="text-emerald-400">{igisoroResult.w.toFixed(2)}</strong>
              </div>
              <div>
                <span className="text-slate-400">Leader:</span>{' '}
                <strong className="text-amber-300">{igisoroResult.leader ? `Player ${igisoroResult.leader}` : 'Level Standing'}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Biyari Simulator */}
        {activeGameSim === 'biyari' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Player A Solids Potted: <span className="font-mono text-emerald-400 font-bold">{biyariA}</span> / 5
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={biyariA}
                  onChange={(e) => setBiyariA(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Player B Stripes Potted: <span className="font-mono text-cyan-400 font-bold">{biyariB}</span> / 5
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={biyariB}
                  onChange={(e) => setBiyariB(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="p-4 bg-[#0e131b] border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400">Advantage (w):</span>{' '}
                <strong className="text-emerald-400">{biyariResult.w.toFixed(2)}</strong>
              </div>
              <div>
                <span className="text-slate-400">Endgame Stage:</span>{' '}
                <strong className="text-amber-300">
                  {biyariA >= 5 ? 'Player A on 8-Ball' : biyariB >= 5 ? 'Player B on 8-Ball' : 'Target Group Potting'}
                </strong>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Zero-Wagering Manifesto */}
      <section className="p-6 bg-[#131923] border border-slate-800 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-white text-lg">Zero-Wagering & Cultural Integrity Charter</h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          INKA honors traditional Rwandan intellectual pastimes by completely detaching gameplay from commercial gambling or financial wagering. Playing Dame, Igisoro, or Biyari on INKA is free for all citizens and cultural admirers worldwide. Players earn sportsmanship honors, elevate community standing, and forge genuine friendships.
        </p>
      </section>
    </div>
  );
};
