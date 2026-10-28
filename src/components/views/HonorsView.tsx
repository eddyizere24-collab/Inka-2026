import React from 'react';
import { Award, ShieldCheck, Star, Trophy, History, HeartHandshake, Sparkles, CheckCircle2 } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';

export const HonorsView: React.FC = () => {
  const { currentUser, honorPoints, matchHistory, t } = usePlatform();

  const badges = [
    {
      id: 'fair_play',
      name: t.badgeFairPlayGuardian,
      desc: t.badgeFairPlayGuardianDesc,
      icon: ShieldCheck,
      color: 'from-emerald-500 to-teal-700',
      unlocked: true,
    },
    {
      id: 'master_sower',
      name: t.badgeMasterSower,
      desc: t.badgeMasterSowerDesc,
      icon: Trophy,
      color: 'from-amber-500 to-yellow-700',
      unlocked: true,
    },
    {
      id: 'dame_strategist',
      name: t.badgeDameStrategist,
      desc: t.badgeDameStrategistDesc,
      icon: Award,
      color: 'from-cyan-500 to-blue-700',
      unlocked: true,
    },
    {
      id: 'clean_cue',
      name: t.badgeCleanCue,
      desc: t.badgeCleanCueDesc,
      icon: Sparkles,
      color: 'from-purple-500 to-indigo-700',
      unlocked: true,
    },
    {
      id: 'friendly_rival',
      name: t.badgeFriendlyRival,
      desc: t.badgeFriendlyRivalDesc,
      icon: HeartHandshake,
      color: 'from-rose-500 to-pink-700',
      unlocked: true,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-950/40 via-[#131b26] to-[#0f141d] border border-emerald-500/30 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.fair_play} · {t.noWageringBadge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
            {t.honorsTitle} · {t.fair_play}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {t.inka_philosophy} {t.zero_wagering_rule}
          </p>
        </div>

        <div className="p-5 bg-[#0e131b] rounded-2xl border border-emerald-500/40 text-center sm:text-right min-w-[220px]">
          <span className="text-xs text-slate-400 block mb-1">{t.honor_rating}</span>
          <div className="flex items-center justify-center sm:justify-end gap-2">
            <Award className="w-7 h-7 text-emerald-400" />
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
              {honorPoints}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-center sm:justify-end gap-1 text-emerald-400 text-xs font-semibold">
            {Array.from({ length: currentUser.sportsmanshipLevel }).map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-current" />
            ))}
            <span className="ml-1 text-slate-400">{t.levelLabel} {currentUser.sportsmanshipLevel}.0</span>
          </div>
        </div>
      </div>

      {/* Badges & Accolades */}
      <div>
        <h3 className="text-lg font-bold font-display text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span>{t.achievementsTitle}</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.id}
                className="p-4 bg-[#141a24] border border-slate-800 rounded-xl hover:border-slate-700 transition-all flex items-start gap-3.5"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${b.color} flex items-center justify-center text-white shrink-0 shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-100 text-sm">{b.name}</h4>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Match History */}
      <div>
        <h3 className="text-lg font-bold font-display text-white mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-400" />
          <span>{t.match_history}</span>
        </h3>

        {matchHistory.length === 0 ? (
          <div className="p-8 bg-[#141a24] border border-slate-800 rounded-2xl text-center text-slate-400 text-xs">
            {t.noMatchesCompletedLabel}
          </div>
        ) : (
          <div className="bg-[#141a24] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="divide-y divide-slate-800">
              {matchHistory.map((item) => (
                <div key={item.id} className="p-4 flex flex-wrap items-center justify-between gap-4 hover:bg-[#18202d] transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase ${
                        item.result === 'win'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : item.result === 'loss'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {item.result === 'win' ? t.matchOutcomeWin : item.result === 'loss' ? t.matchOutcomeLoss : t.matchOutcomeDraw}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-100 text-sm">{t.versusHistoryLabel} {item.opponentName}</span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {item.gameType === 'dame' ? t.dameTitle : item.gameType === 'igisoro' ? t.igisoroTitle : t.biyariTitle}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{item.scoreSummary}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-slate-400">{item.date}</span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 font-semibold">
                      +{item.honorEarned} {t.honorPointsLabel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fair Play Charter */}
      <div className="p-6 bg-[#121822] border border-[#232d3d] rounded-2xl space-y-3">
        <h4 className="text-base font-bold font-display text-white flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-emerald-400" />
          <span>{t.fairPlayPledge}</span>
        </h4>
        <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
          <p>
            1. <strong>{t.rule1Title}:</strong> {t.rule1Desc}
          </p>
          <p>
            2. <strong>{t.rule3Title}:</strong> {t.rule3Desc}
          </p>
          <p>
            3. <strong>{t.rule5Title}:</strong> {t.rule5Desc}
          </p>
          <p>
            4. <strong>{t.rule6Title}:</strong> {t.rule6Desc}
          </p>
        </div>
      </div>
    </div>
  );
};
