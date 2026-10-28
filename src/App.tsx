import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  ArrowLeft,
  Award,
} from 'lucide-react';
import { PlatformProvider, usePlatform, GameType } from './context/PlatformContext';
import { InkaLogo } from './components/brand/InkaLogo';
import { LobbyView } from './components/views/LobbyView';
import { SpectatorView } from './components/views/SpectatorView';
import { SchedulingView } from './components/views/SchedulingView';
import { HonorsView } from './components/views/HonorsView';
import { RulesView } from './components/views/RulesView';
import { ProfilesView } from './components/views/ProfilesView';
import { DameGame } from './components/games/DameGame';
import { IgisoroGame } from './components/games/IgisoroGame';
import { BiyariGame } from './components/games/BiyariGame';
import { IncomingCallModal } from './components/modals/IncomingCallModal';

type ActiveNav = 'lobby' | 'spectator' | 'schedule' | 'honors' | 'rules' | 'community';

const MainShell: React.FC = () => {
  const [activeNav, setActiveNav] = useState<ActiveNav>('lobby');
  const {
    lang,
    setLang,
    t,
    honorPoints,
    isMuted,
    setIsMuted,
    currentMatch,
    setCurrentMatch,
  } = usePlatform();

  // If in active match, render the game view
  if (currentMatch) {
    return (
      <div className="min-h-screen bg-[#0a0e14] bg-rwandan-pattern text-slate-100 flex flex-col">
        {/* Game Top Header */}
        <header className="h-16 px-4 sm:px-8 border-b border-slate-800/80 bg-[#101620]/95 backdrop-blur-md flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentMatch(null)}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.backToLobby}</span>
            </button>
            <div className="h-4 w-px bg-slate-800 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2">
              <InkaLogo variant="symbol" size="sm" />
              <span className="font-display font-bold text-white text-sm sm:text-base">
                INKA · {currentMatch.gameType.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Audio Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-lg bg-[#18212e] hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer border border-slate-700/80"
              aria-label={isMuted ? t.unmuteSound : t.muteSound}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Honor Points pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18212e] border border-emerald-500/40 rounded-xl text-xs font-mono text-emerald-300">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>{honorPoints} {t.honorPointsLabel}</span>
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
    <div className="min-h-screen bg-[#0a0e14] bg-rwandan-pattern text-slate-100 flex flex-col">
      {/* Top Bar Contract (Strict 3 Zones) */}
      <header className="h-16 px-4 sm:px-8 border-b border-slate-800/80 bg-[#101620]/95 backdrop-blur-md flex items-center justify-between gap-6 sticky top-0 z-40">
        {/* Zone 1: Official Brand Logo & Name */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveNav('lobby')}
            className="flex items-center gap-2.5 text-left focus:outline-none cursor-pointer"
          >
            <InkaLogo variant="full" size="md" />
          </button>
        </div>

        {/* Zone 2: Clean 5–6 single-line Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveNav('lobby')}
            className={`whitespace-nowrap transition-colors cursor-pointer ${
              activeNav === 'lobby' ? 'text-emerald-400 font-bold' : 'hover:text-white'
            }`}
          >
            {t.nav_play}
          </button>
          <button
            onClick={() => setActiveNav('spectator')}
            className={`whitespace-nowrap transition-colors cursor-pointer ${
              activeNav === 'spectator' ? 'text-emerald-400 font-bold' : 'hover:text-white'
            }`}
          >
            {t.nav_spectator}
          </button>
          <button
            onClick={() => setActiveNav('schedule')}
            className={`whitespace-nowrap transition-colors cursor-pointer ${
              activeNav === 'schedule' ? 'text-emerald-400 font-bold' : 'hover:text-white'
            }`}
          >
            {t.nav_schedule}
          </button>
          <button
            onClick={() => setActiveNav('honors')}
            className={`whitespace-nowrap transition-colors cursor-pointer ${
              activeNav === 'honors' ? 'text-emerald-400 font-bold' : 'hover:text-white'
            }`}
          >
            {t.nav_honors}
          </button>
          <button
            onClick={() => setActiveNav('rules')}
            className={`whitespace-nowrap transition-colors cursor-pointer ${
              activeNav === 'rules' ? 'text-emerald-400 font-bold' : 'hover:text-white'
            }`}
          >
            {t.nav_rules}
          </button>
          <button
            onClick={() => setActiveNav('community')}
            className={`whitespace-nowrap transition-colors cursor-pointer ${
              activeNav === 'community' ? 'text-emerald-400 font-bold' : 'hover:text-white'
            }`}
          >
            {t.nav_community}
          </button>
        </nav>

        {/* Zone 3: Trilingual selector + Audio toggle + Honor points badge */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Trilingual Selector */}
          <div className="flex items-center bg-[#18212e] p-1 rounded-xl border border-slate-700/80 text-[11px] font-mono">
            {(['rw', 'en', 'fr'] as const).map((code) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`px-2.5 py-1 rounded-lg uppercase font-bold transition-all cursor-pointer ${
                  lang === code ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {code}
              </button>
            ))}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-xl bg-[#18212e] hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors cursor-pointer"
            aria-label={isMuted ? t.unmuteSound : t.muteSound}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Honors Points Badge */}
          <button
            onClick={() => setActiveNav('honors')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#18212e] hover:bg-[#222c3c] border border-emerald-500/40 rounded-xl text-xs font-mono text-emerald-300 transition-colors cursor-pointer shadow-sm"
          >
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>{honorPoints} {t.nav_honors.split(' ')[0]}</span>
          </button>
        </div>
      </header>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden flex items-center overflow-x-auto gap-2 px-4 py-2.5 bg-[#101620] border-b border-slate-800 text-xs">
        <button
          onClick={() => setActiveNav('lobby')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
            activeNav === 'lobby' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400'
          }`}
        >
          {t.nav_play}
        </button>
        <button
          onClick={() => setActiveNav('spectator')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
            activeNav === 'spectator' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400'
          }`}
        >
          {t.nav_spectator}
        </button>
        <button
          onClick={() => setActiveNav('schedule')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
            activeNav === 'schedule' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400'
          }`}
        >
          {t.nav_schedule}
        </button>
        <button
          onClick={() => setActiveNav('honors')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
            activeNav === 'honors' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400'
          }`}
        >
          {t.nav_honors} ({honorPoints})
        </button>
        <button
          onClick={() => setActiveNav('rules')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
            activeNav === 'rules' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400'
          }`}
        >
          {t.nav_rules}
        </button>
        <button
          onClick={() => setActiveNav('community')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
            activeNav === 'community' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400'
          }`}
        >
          {t.nav_community}
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeNav === 'lobby' && <LobbyView onSelectGame={(g) => {}} />}
        {activeNav === 'spectator' && <SpectatorView />}
        {activeNav === 'schedule' && <SchedulingView />}
        {activeNav === 'honors' && <HonorsView />}
        {activeNav === 'rules' && <RulesView />}
        {activeNav === 'community' && <ProfilesView />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#080b0f] px-6 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">INKA</span>
            <span>·</span>
            <span>Igisoro · Dame · Biyari</span>
            <span>·</span>
            <span>{t.editionLabel}</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>{t.humanVsHuman}</span>
            <span>·</span>
            <span>{t.skillAdvantage}</span>
            <span>·</span>
            <span>{t.zeroWageringFooter}</span>
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
