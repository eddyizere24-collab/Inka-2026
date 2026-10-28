import React, { useState } from 'react';
import { Play, Users, Shield, Sparkles, PhoneCall, ChevronRight, Scale, Clock } from 'lucide-react';
import { usePlatform, GameType, PlayerProfile } from '../../context/PlatformContext';
import { StakeNegotiationModal } from '../modals/StakeNegotiationModal';

export const LobbyView: React.FC<{ onSelectGame: (game: GameType) => void }> = ({ onSelectGame }) => {
  const {
    t,
    currentUser,
    inkaBalance,
    communityPlayers,
    startMatch,
    triggerMockIncomingRequest,
  } = usePlatform();

  const [selectedOpponent, setSelectedOpponent] = useState<PlayerProfile | null>(null);
  const [selectedGameForChallenge, setSelectedGameForChallenge] = useState<GameType>('dame');

  const handleOpenChallenge = (opponent: PlayerProfile, game: GameType = 'dame') => {
    setSelectedOpponent(opponent);
    setSelectedGameForChallenge(game);
  };

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#161d27] via-[#111720] to-[#0c1015] border border-[#273244] p-8 md:p-12 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-semibold text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Phase: All Features & Inka 100% Free</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-white text-balance leading-tight">
            Igisoro · Dame · Biyari
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed">
            {t.tagline}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 bg-[#18212e] px-3 py-1.5 rounded-lg border border-slate-700/60">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Strictly Human vs Human (Zero Bots)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#18212e] px-3 py-1.5 rounded-lg border border-slate-700/60">
              <Scale className="w-4 h-4 text-amber-400" />
              <span>Gradual Inka Settlement: <code>a + (w × b)</code></span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#18212e] px-3 py-1.5 rounded-lg border border-slate-700/60">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>Freedom to Stop Anytime</span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleOpenChallenge(communityPlayers[0], 'dame')}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-amber-950/60 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play Dame Now</span>
            </button>

            <button
              onClick={triggerMockIncomingRequest}
              className="px-4 py-3 bg-[#1e2735] hover:bg-[#283446] text-amber-300 border border-amber-500/30 rounded-xl text-sm font-medium transition-all flex items-center gap-2 cursor-pointer"
              title="Test incoming call-style alert for match request (Doc Section 5.3)"
            >
              <PhoneCall className="w-4 h-4 text-amber-400" />
              <span>Simulate Incoming Match Call</span>
            </button>
          </div>
        </div>
      </section>

      {/* The Three Core Games Showcase */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold font-display text-white">The Three Games</h2>
          <p className="text-xs text-slate-400">Select a game to start playing or agree stakes with a live opponent</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Dame Card */}
          <div className="group p-6 bg-[#131922] border border-slate-800 rounded-2xl shadow-lg hover:border-amber-500/50 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center font-bold text-amber-400 text-lg">
                D
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                  Dame (Checkers)
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Foundation game. 10 pieces per side on an 8×8 board (20 total). Captured pieces determine
                  advantage w. Equal inka value for all pieces including kings.
                </p>
              </div>
            </div>
            <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">10 Pieces · 30s Move Timer</span>
              <button
                onClick={() => handleOpenChallenge(communityPlayers[0], 'dame')}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Play Dame</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Igisoro Card */}
          <div className="group p-6 bg-[#131922] border border-slate-800 rounded-2xl shadow-lg hover:border-amber-500/50 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center font-bold text-orange-400 text-lg">
                I
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                  Igisoro (Mancala)
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Traditional Rwandan board game of pits and inka seeds. 4 rows of 8 pits (32 pits total, 64 seeds).
                  Captures from opposing front & back pits. Formula: w = |2p - 1|.
                </p>
              </div>
            </div>
            <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">32 Pits · 64 Seeds</span>
              <button
                onClick={() => handleOpenChallenge(communityPlayers[1], 'igisoro')}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Play Igisoro</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Biyari Card */}
          <div className="group p-6 bg-[#131922] border border-slate-800 rounded-2xl shadow-lg hover:border-amber-500/50 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400 text-lg">
                B
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                  Biyari (Eight-Ball Pool)
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Eight-ball billiards contest on green felt. Aim cue stick, set power, pocket target balls.
                  Ball count advances advantage towards the decisive 8-ball finish.
                </p>
              </div>
            </div>
            <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">Cue Stick · Physics Canvas</span>
              <button
                onClick={() => handleOpenChallenge(communityPlayers[2], 'biyari')}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Play Biyari</span>
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
            <h2 className="text-xl font-bold font-display text-white">Live Players Available Now</h2>
            <p className="text-xs text-slate-400">Section 5.1 Play-Now Matching: Challenge real people in real time</p>
          </div>
          <span className="text-xs text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {communityPlayers.filter((p) => p.status === 'available').length} players online
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {communityPlayers.map((player) => (
            <div
              key={player.id}
              className="p-4 bg-[#141a22] border border-slate-800 rounded-xl flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center font-bold text-slate-200 text-sm">
                  {player.name.slice(0, 2)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{player.name}</h4>
                  <p className="text-[11px] text-slate-400">{player.city} · Rating {player.rating}</p>
                  <p className="text-[10px] text-amber-400/90 font-mono mt-0.5">
                    {player.availability}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleOpenChallenge(player, player.favGame)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-amber-600 text-slate-200 hover:text-white rounded-lg text-xs font-medium border border-slate-700 hover:border-amber-500 transition-colors shrink-0"
              >
                Challenge
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Stake Negotiation Modal */}
      {selectedOpponent && (
        <StakeNegotiationModal
          opponent={selectedOpponent}
          initialGame={selectedGameForChallenge}
          onClose={() => setSelectedOpponent(null)}
          onStart={(game, stakeA, stakeB) => {
            setSelectedOpponent(null);
            startMatch(game, selectedOpponent, stakeA, stakeB);
          }}
        />
      )}
    </div>
  );
};
