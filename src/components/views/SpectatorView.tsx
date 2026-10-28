import React, { useState } from 'react';
import { Eye, MessageSquare, Send, ShieldAlert, UserPlus, Info, Check } from 'lucide-react';
import { usePlatform, ActiveMatch, PlayerProfile } from '../../context/PlatformContext';
import { StakeNegotiationModal } from '../modals/StakeNegotiationModal';

export const SpectatorView: React.FC = () => {
  const { liveMatches, addSpectatorComment, currentUser } = usePlatform();
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

  return (
    <div className="space-y-6">
      {/* Top Banner: Safeguards & Free Viewing Notice */}
      <div className="p-4 bg-[#141b24] border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold font-display text-white">Live Spectator Arena</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Watch ongoing human matches in real time. Community discussion and player requests.
          </p>
        </div>

        {/* Section 8.4 Regulatory Compliance Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-950/40 border border-rose-800/50 rounded-xl text-rose-300 text-xs">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>Spectator betting strictly excluded (Doc Section 8.4)</span>
        </div>
      </div>

      {requestSentNotice && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{requestSentNotice}</span>
          </div>
          <button onClick={() => setRequestSentNotice(null)} className="text-emerald-400 hover:text-white">
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
                  ? 'bg-[#1a2330] border-amber-500 shadow-md shadow-amber-950/30'
                  : 'bg-[#12171f] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-wider font-bold text-amber-400 font-mono">
                  {m.gameType}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  {m.spectatorsCount}
                </span>
              </div>
              <div className="font-semibold text-white text-sm">
                {m.playerA.name} <span className="text-slate-500 font-normal">vs</span> {m.playerB.name}
              </div>
              <div className="text-xs text-slate-400 mt-1 flex justify-between font-mono">
                <span>Pool: {m.stakeA + m.stakeB} Inka</span>
                <span>Adv: w = {m.w.toFixed(2)}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Spectator Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Game Board Stream Representation */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 bg-[#131922] border border-slate-800 rounded-2xl shadow-xl space-y-5">
            {/* Match Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600/30 border border-amber-500/50 flex items-center justify-center font-bold text-amber-300">
                  {selectedMatch.playerA.name.slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{selectedMatch.playerA.name}</h3>
                  <p className="text-xs text-slate-400">
                    Stake: {selectedMatch.stakeA} inka · Current: <strong className="text-amber-400 font-mono">{selectedMatch.holdingA.toFixed(2)}</strong>
                  </p>
                </div>
              </div>

              <div className="text-center">
                <span className="text-xs uppercase font-bold text-amber-400 font-mono block">
                  {selectedMatch.gameType.toUpperCase()}
                </span>
                <span className="text-[11px] text-slate-500">Live Move #{selectedMatch.moveCount}</span>
              </div>

              <div className="flex items-center gap-3 text-right">
                <div>
                  <h3 className="font-bold text-white text-base">{selectedMatch.playerB.name}</h3>
                  <p className="text-xs text-slate-400">
                    Stake: {selectedMatch.stakeB} inka · Current: <strong className="text-amber-400 font-mono">{selectedMatch.holdingB.toFixed(2)}</strong>
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center font-bold text-blue-300">
                  {selectedMatch.playerB.name.slice(0, 2)}
                </div>
              </div>
            </div>

            {/* Formula Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span>{selectedMatch.playerA.name.split(' ')[0]}: {selectedMatch.holdingA.toFixed(2)} inka</span>
                <span>Pool: {selectedMatch.stakeA + selectedMatch.stakeB} inka</span>
                <span>{selectedMatch.playerB.name.split(' ')[0]}: {selectedMatch.holdingB.toFixed(2)} inka</span>
              </div>
              <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
                <div
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{
                    width: `${((selectedMatch.holdingA / (selectedMatch.stakeA + selectedMatch.stakeB)) * 100).toFixed(1)}%`,
                  }}
                />
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{
                    width: `${((selectedMatch.holdingB / (selectedMatch.stakeA + selectedMatch.stakeB)) * 100).toFixed(1)}%`,
                  }}
                />
              </div>
            </div>

            {/* Simulated Live Game Board Arena Display */}
            <div className="p-8 bg-[#0b0e13] rounded-xl border border-slate-800 text-center flex flex-col items-center justify-center space-y-4 min-h-[220px]">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-display font-bold text-xl">
                {selectedMatch.gameType === 'dame' ? 'D' : selectedMatch.gameType === 'igisoro' ? 'I' : 'B'}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  {selectedMatch.gameType.toUpperCase()} Stream in Progress
                </p>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Advantage: <code>w = {selectedMatch.w.toFixed(2)}</code>. Turn is with{' '}
                  <span className="text-amber-400 font-semibold">
                    {selectedMatch.turn === 'A' ? selectedMatch.playerA.name : selectedMatch.playerB.name}
                  </span>.
                </p>
              </div>
            </div>

            {/* Request to Play Buttons (Section 8.2 & Appendix A:
                "Kamali, one of the spectators, thought Uwase played particularly well and sends her a request to play") */}
            <div className="p-4 bg-[#18212e] rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-300 font-medium">Admire a player’s skill? Challenge them for next game:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRequestToPlay(selectedMatch.playerA)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Challenge {selectedMatch.playerA.name.split(' ')[0]}</span>
                </button>
                <button
                  onClick={() => handleRequestToPlay(selectedMatch.playerB)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Challenge {selectedMatch.playerB.name.split(' ')[0]}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Spectator Chat Feed (Section 8.2 & 8.3 Isolation) */}
        <div className="p-5 bg-[#131922] border border-slate-800 rounded-2xl shadow-xl flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold text-white">Spectator Community Chat</h4>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {selectedMatch.spectatorsCount} online
            </span>
          </div>

          <div className="my-2 p-2 bg-[#0c1015] rounded text-[11px] text-slate-400 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Players in the game cannot see this chat until match completion, protecting against external coaching.
            </span>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-2">
            {selectedMatch.comments.map((c) => (
              <div key={c.id} className="p-2.5 bg-[#18212e] rounded-lg border border-slate-800 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-amber-300">{c.author}</span>
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
              placeholder="Comment on play or tactics..."
              className="flex-1 px-3 py-2 bg-[#0c1015] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="p-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors cursor-pointer"
              aria-label="Send comment"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Stake Negotiation for spectator challenge */}
      {challengedPlayer && (
        <StakeNegotiationModal
          opponent={challengedPlayer}
          initialGame={selectedMatch.gameType}
          onClose={() => setChallengedPlayer(null)}
          onStart={(game, stakeA, stakeB) => {
            setChallengedPlayer(null);
            setRequestSentNotice(`Challenge sent to ${challengedPlayer.name} for ${game.toUpperCase()} with ${stakeA} inka stake.`);
          }}
        />
      )}
    </div>
  );
};
