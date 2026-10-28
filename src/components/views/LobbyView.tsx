import React, { useState } from 'react';
import { Play, Users, Shield, Sparkles, PhoneCall, ChevronRight, Award, Clock } from 'lucide-react';
import { usePlatform, GameType, PlayerProfile, getLocalizedProfileAvailability } from '../../context/PlatformContext';
import { InkaLogo } from '../brand/InkaLogo';
import { ChallengeModal } from '../modals/ChallengeModal';

export const LobbyView: React.FC<{ onSelectGame: (game: GameType) => void }> = () => {
  const {
    t,
    lang,
    communityPlayers,
    startMatch,
    triggerMockIncomingChallenge,
  } = usePlatform();

  const [selectedOpponent, setSelectedOpponent] = useState<PlayerProfile | null>(null);
  const [selectedGameForChallenge, setSelectedGameForChallenge] = useState<GameType>('dame');

  const handleOpenChallenge = (opponent: PlayerProfile, game: GameType = 'dame') => {
    setSelectedOpponent(opponent);
    setSelectedGameForChallenge(game);
  };

  return (
    <div className="space-y-10 animate-in fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121923] via-[#0f151e] to-[#0a0e14] border border-[#232e3e] p-6 sm:p-10 md:p-12 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="flex items-center gap-3">
            <InkaLogo variant="full" size="md" taglineText={t.logoTagline} />
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs font-semibold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.noWageringBadge}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-white text-balance leading-tight">
            Igisoro · Dame · Biyari
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">
            {t.hero_desc}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2 bg-[#151d29] px-3.5 py-2 rounded-xl border border-slate-700/60">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>{t.rule4Title}</span>
            </div>
            <div className="flex items-center gap-2 bg-[#151d29] px-3.5 py-2 rounded-xl border border-slate-700/60">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>{t.zero_wagering_rule}</span>
            </div>
            <div className="flex items-center gap-2 bg-[#151d29] px-3.5 py-2 rounded-xl border border-slate-700/60">
              <Award className="w-4 h-4 text-amber-400" />
              <span>{t.fair_play}</span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleOpenChallenge(communityPlayers[0], 'dame')}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-950/60 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{t.play_dame}</span>
            </button>

            <button
              onClick={triggerMockIncomingChallenge}
              className="px-5 py-3 bg-[#18212e] hover:bg-[#202c3d] text-emerald-300 border border-emerald-500/30 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-md"
              title={t.simulateIncomingCall}
            >
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>{t.simulateIncomingCall}</span>
            </button>
          </div>
        </div>
      </section>

      {/* The Three Core Games Showcase */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white">{t.the_three_games}</h2>
          <p className="text-xs sm:text-sm text-slate-400">{t.gamesSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Dame Card */}
          <div className="group p-6 bg-[#131923] border border-slate-800 rounded-2xl shadow-xl hover:border-emerald-500/50 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400 text-lg">
                D
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {t.game_dame}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {t.dameDesc}
                </p>
              </div>
            </div>
            <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">{t.dameSubtitle}</span>
              <button
                onClick={() => handleOpenChallenge(communityPlayers[0], 'dame')}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-md"
              >
                <span>{t.play_dame}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Igisoro Card */}
          <div className="group p-6 bg-[#131923] border border-slate-800 rounded-2xl shadow-xl hover:border-emerald-500/50 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center font-bold text-amber-400 text-lg">
                I
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                  {t.game_igisoro}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {t.igisoroDesc}
                </p>
              </div>
            </div>
            <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">{t.igisoroSubtitle}</span>
              <button
                onClick={() => handleOpenChallenge(communityPlayers[1], 'igisoro')}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-md"
              >
                <span>{t.play_igisoro}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Biyari Card */}
          <div className="group p-6 bg-[#131923] border border-slate-800 rounded-2xl shadow-xl hover:border-emerald-500/50 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center font-bold text-cyan-400 text-lg">
                B
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {t.game_biyari}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {t.biyariDesc}
                </p>
              </div>
            </div>
            <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">{t.gameDetailPhysics}</span>
              <button
                onClick={() => handleOpenChallenge(communityPlayers[2], 'biyari')}
                className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-md"
              >
                <span>{t.play_biyari}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Available Live Opponents */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white">{t.live_opponents}</h2>
            <p className="text-xs sm:text-sm text-slate-400">{t.communityMatchmakingDesc}</p>
          </div>
          <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {communityPlayers.filter((p) => p.status === 'available').length} {t.status_available}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {communityPlayers.map((player) => (
            <div
              key={player.id}
              className="p-4 bg-[#141a24] border border-slate-800 rounded-xl flex items-center justify-between gap-4 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center font-bold text-slate-200 text-sm shadow-md">
                  {player.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{player.name}</h4>
                  <p className="text-[11px] text-slate-400">{player.city} · ★ {player.sportsmanshipLevel}.0</p>
                  <p className="text-[10px] text-emerald-400/90 font-mono mt-0.5">
                    {getLocalizedProfileAvailability(player, lang)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleOpenChallenge(player, player.favGame)}
                className="px-3.5 py-1.5 bg-[#18212e] hover:bg-emerald-600 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 hover:border-emerald-500 transition-colors shrink-0 cursor-pointer shadow-sm"
              >
                {t.challenge}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Challenge Modal */}
      {selectedOpponent && (
        <ChallengeModal
          opponent={selectedOpponent}
          initialGame={selectedGameForChallenge}
          onClose={() => setSelectedOpponent(null)}
          onStart={(game, timeControl) => {
            const opp = selectedOpponent;
            setSelectedOpponent(null);
            startMatch(game, opp, timeControl);
          }}
        />
      )}
    </div>
  );
};
