import React, { useState } from 'react';
import { Calendar, Clock, PhoneCall, Check, UserPlus } from 'lucide-react';
import { usePlatform, PlayerProfile, GameType, TimeControl } from '../../context/PlatformContext';
import { ChallengeModal } from '../modals/ChallengeModal';

export const SchedulingView: React.FC = () => {
  const { currentUser, updateCurrentUser, communityPlayers, triggerMockIncomingChallenge, t } = usePlatform();
  const [myWindow, setMyWindow] = useState(currentUser.availability);
  const [myPreferredGame, setMyPreferredGame] = useState<GameType>(currentUser.favGame);
  const [saveNotice, setSaveNotice] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState<PlayerProfile | null>(null);
  const [scheduledMatchAlert, setScheduledMatchAlert] = useState<string | null>(null);

  const handleSaveAvailability = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser({
      availability: myWindow,
      favGame: myPreferredGame,
    });
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 3000);
  };

  const handleScheduleWithPlayer = (player: PlayerProfile) => {
    setSelectedOpponent(player);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-display text-white">{t.schedule_time}</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Publish your playing hours or arrange matches with other skilled players across Rwanda.
        </p>
      </div>

      {saveNotice && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Your availability schedule has been published to the community.</span>
        </div>
      )}

      {scheduledMatchAlert && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center justify-between">
          <span>{scheduledMatchAlert}</span>
          <button onClick={() => setScheduledMatchAlert(null)} className="text-emerald-400 hover:text-white cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Publish Your Availability Form */}
        <div className="p-6 bg-[#131923] border border-slate-800 rounded-2xl shadow-xl space-y-5">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Publish Your Availability</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Let players know when you are open for a friendly contest. When someone challenges you during your published window, your device receives a real-time call alert.
          </p>

          <form onSubmit={handleSaveAvailability} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Your Time Window:
              </label>
              <input
                type="text"
                value={myWindow}
                onChange={(e) => setMyWindow(e.target.value)}
                placeholder="e.g. Daily 6:00 PM – 9:00 PM or Saturday 3:00 PM"
                className="w-full px-3 py-2 bg-[#0c1016] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Preferred Game During This Window:
              </label>
              <select
                value={myPreferredGame}
                onChange={(e) => setMyPreferredGame(e.target.value as GameType)}
                className="w-full px-3 py-2 bg-[#0c1016] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="dame">Dame (Checkers)</option>
                <option value="igisoro">Igisoro (Mancala)</option>
                <option value="biyari">Biyari (Eight-ball)</option>
              </select>
            </div>

            <div className="p-3 bg-[#0c1016] rounded-lg border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Call-Style Alerts:</strong> Challenges during your published time trigger an audible phone chime.
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors cursor-pointer"
              >
                Publish Availability
              </button>
              <button
                type="button"
                onClick={triggerMockIncomingChallenge}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-xl text-xs font-medium border border-slate-700 cursor-pointer"
                title="Test incoming call alert"
              >
                Test Ring
              </button>
            </div>
          </form>
        </div>

        {/* Right 2 Columns: Browse Other Players' Availability */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Community Published Availability</span>
            </h3>
            <span className="text-xs text-slate-400">{communityPlayers.length} active players</span>
          </div>

          <div className="space-y-3">
            {communityPlayers.map((player) => (
              <div
                key={player.id}
                className="p-4 bg-[#131923] border border-slate-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-800/40 to-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200">
                    {player.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white text-sm">{player.name}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        {player.city}
                      </span>
                    </div>
                    <div className="text-xs text-emerald-400/90 font-mono flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{player.availability}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-md">
                      Specializes in <strong className="text-slate-300 uppercase">{player.favGame}</strong> · ★ {player.sportsmanshipLevel}.0 ({player.gamesWon} wins)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleScheduleWithPlayer(player)}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 hover:border-emerald-500 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Arrange Match</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedOpponent && (
        <ChallengeModal
          opponent={selectedOpponent}
          initialGame={selectedOpponent.favGame}
          onClose={() => setSelectedOpponent(null)}
          onStart={(game, timeControl) => {
            const oppName = selectedOpponent.name;
            const oppWindow = selectedOpponent.availability;
            setSelectedOpponent(null);
            setScheduledMatchAlert(
              `Scheduled match agreed with ${oppName} for ${game.toUpperCase()} (${timeControl}) at ${oppWindow}.`
            );
          }}
        />
      )}
    </div>
  );
};
