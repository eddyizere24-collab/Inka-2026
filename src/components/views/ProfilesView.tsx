import React, { useState } from 'react';
import { Users, Award, MapPin, Clock, Play, Check, Star } from 'lucide-react';
import { usePlatform, PlayerProfile } from '../../context/PlatformContext';
import { ChallengeModal } from '../modals/ChallengeModal';

export const ProfilesView: React.FC = () => {
  const { communityPlayers, currentUser, updateCurrentUser, startMatch, t } = usePlatform();
  const [selectedOpponent, setSelectedOpponent] = useState<PlayerProfile | null>(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(currentUser.bio);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveBio = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser({ bio: bioText });
    setIsEditingBio(false);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-display text-white">{t.nav_community}</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Simple, respectful player directory. Illustrated badges and verified sportsmanship levels.
        </p>
      </div>

      {savedNotice && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Your profile information has been updated.</span>
        </div>
      )}

      {/* Your Own Profile Card */}
      <div className="p-6 bg-gradient-to-r from-[#17212d] to-[#121820] border border-emerald-500/40 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 border-2 border-emerald-400/60 flex items-center justify-center font-bold text-white text-xl shadow-lg">
            {currentUser.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{currentUser.name}</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                YOU
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {currentUser.city}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                {currentUser.honorRating} Honor Points ({currentUser.gamesWon} wins / {currentUser.gamesPlayed} games)
              </span>
            </div>
            <p className="text-xs text-slate-300 italic pt-1">"{currentUser.bio}"</p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center">
          <button
            onClick={() => setIsEditingBio(!isEditingBio)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            {isEditingBio ? 'Cancel' : 'Edit Bio'}
          </button>
        </div>
      </div>

      {isEditingBio && (
        <form onSubmit={handleSaveBio} className="p-4 bg-[#141b24] border border-slate-800 rounded-2xl space-y-3">
          <label className="block text-xs font-medium text-slate-300">Update Profile Bio:</label>
          <input
            type="text"
            value={bioText}
            onChange={(e) => setBioText(e.target.value)}
            className="w-full px-3 py-2 bg-[#0c1015] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-400"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Save Bio
          </button>
        </form>
      )}

      {/* Community Roster */}
      <div className="space-y-4">
        <h3 className="font-bold text-white text-lg flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-400" />
          <span>Active Rwandan Players</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {communityPlayers.map((player) => (
            <div
              key={player.id}
              className="p-5 bg-[#131923] border border-slate-800 rounded-2xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600 flex items-center justify-center font-bold text-slate-200 text-base shadow-md">
                    {player.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{player.name}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{player.city}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center justify-end gap-1">
                    <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                    <span>{player.sportsmanshipLevel}.0</span>
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {player.gamesWon}W · {player.gamesPlayed} matches
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-[#0c1016] p-3 rounded-xl border border-slate-800/80">
                "{player.bio}"
              </p>

              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{player.availability}</span>
                </div>

                <button
                  onClick={() => setSelectedOpponent(player)}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-semibold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{t.challenge}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedOpponent && (
        <ChallengeModal
          opponent={selectedOpponent}
          initialGame={selectedOpponent.favGame}
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
