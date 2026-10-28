import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Languages,
  Coins,
  Play,
  Eye,
  Calendar,
  Wallet,
  BookOpen,
  Users,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { PlatformProvider, usePlatform, GameType } from './context/PlatformContext';
import { LobbyView } from './components/views/LobbyView';
import { SpectatorView } from './components/views/SpectatorView';
import { SchedulingView } from './components/views/SchedulingView';
import { WalletView } from './components/views/WalletView';
import { RulesView } from './components/views/RulesView';
import { ProfilesView } from './components/views/ProfilesView';
import { DameGame } from './components/games/DameGame';
import { IgisoroGame } from './components/games/IgisoroGame';
import { BiyariGame } from './components/games/BiyariGame';
import { IncomingCallModal } from './components/modals/IncomingCallModal';

type ActiveNav = 'lobby' | 'spectator' | 'schedule' | 'wallet' | 'rules' | 'community';

const MainShell: React.FC = () => {
  const [activeNav, setActiveNav] = useState<ActiveNav>('lobby');
  const {
    lang,
    setLang,
    t,
    inkaBalance,
    isMuted,
    setIsMuted,
    currentMatch,
    setCurrentMatch,
    claimFreeInka,
  } = usePlatform();

  // If in active match, render the game view
  if (currentMatch) {
    return (
      <div className="min-h-screen bg-[#0c1015] bg-rwandan-pattern text-slate-100 flex flex-col">
        {/* Game Top Header */}
        <header className="h-16 px-4 sm:px-8 border-b border-slate-800 bg-[#10151d]/90 backdrop-blur-md flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentMatch(null)}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Lobby</span>
            </button>
            <div className="h-4 w-px bg-slate-800 hidden sm:block" />
            <span className="font-display font-bold text-white text-sm sm:text-base hidden sm:inline">
              Rwandan Skill-Games · {currentMatch.gameType.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Audio Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Wallet pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18212e] border border-slate-700/80 rounded-xl text-xs font-mono text-amber-300">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{inkaBalance.toFixed(2)} inka</span>
            </div>
          </div>
        </header>

        {/* Game Canvas Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {currentMatch.gameType === 'dame' && <DameGame />}
          {currentMatch.gameType === 'igisoro' && <IgisoroGame />}
          {currentMatch.gameType === 'biyari' && <BiyariGame />}
        </main>

        <IncomingCallModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c1015] bg-rwandan-pattern text-slate-100 flex flex-col">
      {/* Top Bar Contract (Strict 3 Zones) */}
      <header className="h-16 px-4 sm:px-8 border-b border-slate-800/80 bg-[#10151d]/90 backdrop-blur-md flex items-center justify-between gap-6 sticky top-0 z-40">
        {/* Zone 1: Brand title, single line */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveNav('lobby')}
            className="flex items-center gap-2.5 text-left focus:outline-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-700 flex items-center justify-center font-bold text-white shadow-md">
              <span className="font-display text-sm tracking-wider">RW</span>
            </div>
            <span className="text-base sm:text-lg font-bold font-display tracking-tight text-white whitespace-nowrap">
              Rwandan Skill-Games
            </span>
          </button>
        </div>

        {/* Zone 2: Clean 4–5 single-line Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveNav('lobby')}
            className={`whitespace-nowrap transition-colors cursor-pointer ${
              activeNav === 'lobby' ? 'text-amber-400 font-semibold' : 'hover:text-white'
            }`}
          >
            Play Now
          </button>
          <button
            onClick={() => setActiveNav('spectator')}
            className={`whitespace-nowrap transition-colors cursor-pointer ${
              activeNav === 'spectator' ? 'text-amber-400 font-semibold' : 'hover:text-white'
            }`}
          >
            Live Arena
          </button>
          <button
            onClick={() => setActiveNav('schedule')}
            className={`whitespace-nowrap transition-colors cursor-pointer ${
              activeNav === 'schedule' ? 'text-amber-400 font-semibold' : 'hover:text-white'
            }`}
          >
            Schedule
          </button>
          <button
            onClick={() => setActiveNav('wallet')}
            className={`whitespace-nowrap transition-colors cursor-pointer ${
              activeNav === 'wallet' ? 'text-amber-400 font-semibold' : 'hover:text-white'
            }`}
          >
            Inka Wallet
          </button>
          <button
            onClick={() => setActiveNav('rules')}
            className={`whitespace-nowrap transition-colors cursor-pointer ${
              activeNav === 'rules' ? 'text-amber-400 font-semibold' : 'hover:text-white'
            }`}
          >
            Rules & Math
          </button>
          <button
            onClick={() => setActiveNav('community')}
            className={`whitespace-nowrap transition-colors cursor-pointer ${
              activeNav === 'community' ? 'text-amber-400 font-semibold' : 'hover:text-white'
            }`}
          >
            Players
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action + Utility Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Trilingual Selector */}
          <div className="flex items-center bg-[#18212e] p-1 rounded-lg border border-slate-700/80 text-[11px] font-mono">
            {(['rw', 'en', 'fr'] as const).map((code) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`px-2 py-0.5 rounded uppercase font-semibold transition-colors ${
                  lang === code ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {code}
              </button>
            ))}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-lg bg-[#18212e] hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors"
            aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Inka Wallet Balance & Quick Claim */}
          <button
            onClick={() => setActiveNav('wallet')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#18212e] hover:bg-[#222c3c] border border-amber-500/40 rounded-xl text-xs font-mono text-amber-300 transition-colors cursor-pointer"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{inkaBalance.toFixed(2)} Inka</span>
          </button>
        </div>
      </header>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center overflow-x-auto gap-2 px-4 py-2.5 bg-[#121720] border-b border-slate-800 text-xs">
        <button
          onClick={() => setActiveNav('lobby')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap ${
            activeNav === 'lobby' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-400'
          }`}
        >
          Play Now
        </button>
        <button
          onClick={() => setActiveNav('spectator')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap ${
            activeNav === 'spectator' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-400'
          }`}
        >
          Live Arena
        </button>
        <button
          onClick={() => setActiveNav('schedule')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap ${
            activeNav === 'schedule' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-400'
          }`}
        >
          Schedule
        </button>
        <button
          onClick={() => setActiveNav('wallet')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap ${
            activeNav === 'wallet' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-400'
          }`}
        >
          Inka ({inkaBalance.toFixed(0)})
        </button>
        <button
          onClick={() => setActiveNav('rules')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap ${
            activeNav === 'rules' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-400'
          }`}
        >
          Rules
        </button>
        <button
          onClick={() => setActiveNav('community')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap ${
            activeNav === 'community' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-400'
          }`}
        >
          Players
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeNav === 'lobby' && <LobbyView onSelectGame={(g) => {}} />}
        {activeNav === 'spectator' && <SpectatorView />}
        {activeNav === 'schedule' && <SchedulingView />}
        {activeNav === 'wallet' && <WalletView />}
        {activeNav === 'rules' && <RulesView />}
        {activeNav === 'community' && <ProfilesView />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#0a0d12] px-6 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Rwandan Skill-Games Platform</span>
            <span>·</span>
            <span>Igisoro · Dame · Biyari</span>
            <span>·</span>
            <span>Launch Edition 2026</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Human-vs-Human Only</span>
            <span>·</span>
            <span>Gradual Inka Settlement</span>
            <span>·</span>
            <span>No Spectator Betting</span>
          </div>
        </div>
      </footer>

      {/* Global Call-Style Alert Modal */}
      <IncomingCallModal />
    </div>
  );
};

export default function App() {
  return (
    <PlatformProvider>
      <MainShell />
    </PlatformProvider>
  );
}
