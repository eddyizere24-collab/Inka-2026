import React, { useState } from 'react';
import { Eye, MessageSquare, Send, ShieldAlert, UserPlus, Info, Check, Award } from 'lucide-react';
import { usePlatform, ActiveMatch, PlayerProfile, TimeControl, GameType } from '../../context/PlatformContext';
import { ChallengeModal } from '../modals/ChallengeModal';

export const SpectatorView: React.FC = () => {
  const { liveMatches, addSpectatorComment, currentUser, t } = usePlatform();
  const [selectedMatch, setSelectedMatch] = useState<ActiveMatch>(liveMatches[0]);
  const [newComment, setNewComment] = useState<string>('');
  const [challengedPlayer, setChallengedPlayer] = useState<PlayerProfile | null>(null);
  const [requestSentNotice, setRequestSentNotice] = useState<string | null>(null);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addSpectatorComment(selectedMatch.id, newComment.trim());
    setNewComment('');
  };

  const handleRequestToPlay = (player: PlayerProfile) => {
    setChallengedPlayer(player);
  };

  const percentA = selectedMatch.leader === 'A'
    ? 50 + (selectedMatch.advantage * 50)
    : selectedMatch.leader === 'B'
    ? 50 - (selectedMatch.advantage * 50)
    : 50;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 bg-[#141a24] border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base sm:text-lg font-bold font-display text-white">{t.live_arena}</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Watch live matches in real time. Engage in artistic discussion with fellow spectators.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-emerald-300 text-xs">
          <ShieldAlert className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{t.zero_wagering_rule}</span>
        </div>
      </div>

      {requestSentNotice && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{requestSentNotice}</span>
          </div>
          <button onClick={() => setRequestSentNotice(null)} className="text-emerald-400 hover:text-white cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Match Selector Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {liveMatches.map((m) => {
          const isSelected = selectedMatch.id === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setSelectedMatch(m)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#182230] border-emerald-500 shadow-md shadow-emerald-950/30'
                  : 'bg-[#121720] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-wider font-bold text-emerald-400 font-mono">
                  {m.gameType}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  {m.spectatorsCount}
                </span>
              </div>
              <div className="font-semibold text-white text-sm">
                {m.playerA.name} <span className="text-slate-500 font-normal">{t.versusLabel}</span> {m.playerB.name}
              </div>
              <div className="text-xs text-slate-400 mt-1 flex justify-between font-mono">
                <span>{m.timeControl}</span>
                <span className="text-emerald-400 font-medium">Advantage: {(m.advantage * 100).toFixed(0)}%</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Spectator Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Game Board Stream Representation */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 bg-[#131923] border border-slate-800 rounded-2xl shadow-xl space-y-5">
            {/* Match Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center font-bold text-emerald-300">
                  {selectedMatch.playerA.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{selectedMatch.playerA.name}</h3>
                  <p className="text-xs text-slate-400">
                    ★ {selectedMatch.playerA.sportsmanshipLevel}.0 · {selectedMatch.playerA.city}
                  </p>
                </div>
              </div>

              <div className="text-center">
                <span className="text-xs uppercase font-bold text-emerald-400 font-mono block">
                  {selectedMatch.gameType.toUpperCase()}
                </span>
                <span className="text-[11px] text-slate-500">Move #{selectedMatch.moveCount}</span>
              </div>

              <div className="flex items-center gap-3 text-right">
                <div>
                  <h3 className="font-bold text-white text-base">{selectedMatch.playerB.name}</h3>
                  <p className="text-xs text-slate-400">
                    ★ {selectedMatch.playerB.sportsmanshipLevel}.0 · {selectedMatch.playerB.city}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-cyan-600/30 border border-cyan-500/50 flex items-center justify-center font-bold text-cyan-300">
                  {selectedMatch.playerB.name.slice(0, 2).toUpperCase()}
                </div>
              </div>
            </div>

            {/* Advantage Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span className="text-emerald-400">{selectedMatch.playerA.name.split(' ')[0]}: {percentA.toFixed(0)}%</span>
                <span className="text-slate-500 uppercase text-[10px]">{t.advantageGauge}</span>
                <span className="text-cyan-400">{selectedMatch.playerB.name.split(' ')[0]}: {(100 - percentA).toFixed(0)}%</span>
              </div>
              <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex border border-slate-800 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-l-full transition-all duration-300"
                  style={{ width: `${percentA}%` }}
                />
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 rounded-r-full transition-all duration-300"
                  style={{ width: `${100 - percentA}%` }}
                />
              </div>
            </div>

            {/* Simulated Live Game Board Arena Display */}
            <div className="p-8 bg-[#0c1016] rounded-xl border border-slate-800 text-center flex flex-col items-center justify-center space-y-3 min-h-[200px]">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-display font-bold text-xl shadow-inner">
                {selectedMatch.gameType === 'dame' ? 'D' : selectedMatch.gameType === 'igisoro' ? 'I' : 'B'}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  {selectedMatch.gameType === 'dame' ? t.dameTitle : selectedMatch.gameType === 'igisoro' ? t.igisoroTitle : t.biyariTitle} · {t.gameStreamInProgress}
                </p>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Advantage: <span className="font-mono text-emerald-400">{(selectedMatch.advantage * 100).toFixed(0)}%</span>. Current turn is with{' '}
                  <span className="text-emerald-300 font-semibold">
                    {selectedMatch.turn === 'A' ? selectedMatch.playerA.name : selectedMatch.playerB.name}
                  </span>.
                </p>
              </div>
            </div>

            {/* Request to Play Buttons */}
            <div className="p-4 bg-[#161e29] rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-300 font-medium">{t.admireSkillPrompt}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRequestToPlay(selectedMatch.playerA)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Challenge {selectedMatch.playerA.name.split(' ')[0]}</span>
                </button>
                <button
                  onClick={() => handleRequestToPlay(selectedMatch.playerB)}
                  className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Challenge {selectedMatch.playerB.name.split(' ')[0]}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Spectator Chat Feed */}
        <div className="p-5 bg-[#131923] border border-slate-800 rounded-2xl shadow-xl flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-white">{t.spectatorChatTitle}</h4>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {selectedMatch.spectatorsCount} {t.spectatorsWatching}
            </span>
          </div>

          <div className="my-2 p-2 bg-[#0c1016] rounded-lg text-[11px] text-slate-400 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              {t.spectator_comments_hidden}
            </span>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 py-2">
            {selectedMatch.comments.map((c) => (
              <div key={c.id} className="p-2.5 bg-[#17202c] rounded-lg border border-slate-800 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-emerald-300">{c.author}</span>
                  <span className="text-[10px] text-slate-500">{c.timestamp}</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>

          {/* Comment input form */}
          <form onSubmit={handleSendComment} className="pt-3 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Comment on tactics or sportsmanship..."
              className="flex-1 px-3 py-2 bg-[#0c1016] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer"
              aria-label="Send comment"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Challenge modal */}
      {challengedPlayer && (
        <ChallengeModal
          opponent={challengedPlayer}
          initialGame={selectedMatch.gameType}
          onClose={() => setChallengedPlayer(null)}
          onStart={(game, timeControl) => {
            const oppName = challengedPlayer.name;
            setChallengedPlayer(null);
            setRequestSentNotice(`Challenge sent to ${oppName} for ${game.toUpperCase()} (${timeControl}).`);
          }}
        />
      )}
    </div>
  );
};
