import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  ArrowLeft,
  Award,
  Maximize2,
  Minimize2,
  Smartphone,
  X,
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

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isPortrait, setIsPortrait] = useState<boolean>(false);
  const [showLandscapePrompt, setShowLandscapePrompt] = useState<boolean>(true);

  // Monitor orientation on resize/mount
  React.useEffect(() => {
    const checkOrientation = () => {
      if (typeof window !== 'undefined') {
        setIsPortrait(window.innerHeight > window.innerWidth && window.innerWidth < 900);
        setIsFullscreen(!!document.fullscreenElement);
      }
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    document.addEventListener('fullscreenchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      document.removeEventListener('fullscreenchange', checkOrientation);
    };
  }, []);

  // When match begins, attempt auto-landscape orientation lock on mobile devices
  React.useEffect(() => {
    if (currentMatch) {
      try {
        if ('orientation' in screen && screen.orientation && 'lock' in screen.orientation) {
          (screen.orientation as any).lock('landscape').catch(() => {});
        }
      } catch {
        // Fallback gracefully on devices where orientation lock is restricted
      }
    }
  }, [currentMatch]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        if ('orientation' in screen && screen.orientation && 'lock' in screen.orientation) {
          await (screen.orientation as any).lock('landscape').catch(() => {});
        }
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        if ('orientation' in screen && screen.orientation && 'unlock' in screen.orientation) {
          (screen.orientation as any).unlock();
        }
        setIsFullscreen(false);
      }
    } catch {
      // User gesture restriction safe catch
    }
  };

  // If in active match, render the full-bleed, edge-to-edge game arena
  if (currentMatch) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-[#070a0f] text-slate-100 flex flex-col select-none">
        {/* Sleek Minimal Game Bar (~42px height) */}
        <header className="h-11 px-2.5 sm:px-5 border-b border-slate-800/80 bg-[#0d131c]/95 backdrop-blur-md flex items-center justify-between z-40 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setCurrentMatch(null)}
              className="p-1.5 sm:px-2.5 sm:py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700/60"
              title={t.backToLobby}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.backToLobby}</span>
            </button>
            <div className="h-3.5 w-px bg-slate-800 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <InkaLogo variant="symbol" size="sm" ariaLabel={t.logoAccessibleLabel} />
              <span className="font-display font-bold text-white text-xs sm:text-sm">
                INKA · {currentMatch.gameType === 'dame' ? t.dameTitle : currentMatch.gameType === 'igisoro' ? t.igisoroTitle : t.biyariTitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Fullscreen & Landscape Orientation Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-[#141b26] hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700/80"
              title={t.toggleFullscreen}
              aria-label={t.toggleFullscreen}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-emerald-400" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Language Selector Pill */}
            <div role="group" aria-label={t.languageSelectorLabel} className="flex items-center bg-[#141b26] p-0.5 rounded-lg border border-slate-700/80 text-[10px] font-mono">
              {(['rw', 'en', 'fr'] as const).map((code) => (
                <button
                  key={code}
                  onClick={() => setLang(code)}
                  aria-pressed={lang === code}
                  className={`px-1.5 py-0.5 rounded uppercase font-bold transition-all cursor-pointer ${
                    lang === code ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>

            {/* Audio Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg bg-[#141b26] hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer border border-slate-700/80"
              aria-label={isMuted ? t.unmuteSound : t.muteSound}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            </button>

            {/* Honor Points chip */}
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-[#141b26] border border-emerald-500/40 rounded-lg text-[11px] font-mono text-emerald-300">
              <Award className="w-3 h-3 text-emerald-400" />
              <span>{honorPoints}</span>
            </div>
          </div>
        </header>

        {/* Mobile Portrait Orientation Prompt (Floating, dismissable) */}
        {isPortrait && showLandscapePrompt && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 z-40 bg-[#121a26]/95 border border-amber-500/60 text-amber-200 px-3.5 py-1.5 rounded-full shadow-2xl flex items-center gap-2.5 text-xs backdrop-blur-md animate-in slide-in-from-top duration-200">
            <Smartphone className="w-3.5 h-3.5 text-amber-400 rotate-90 shrink-0 animate-pulse" />
            <span className="text-[11px] font-medium">{t.rotateToLandscapeDesc}</span>
            <button
              onClick={toggleFullscreen}
              className="px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-[10px] shrink-0 cursor-pointer"
            >
              {t.toggleFullscreen}
            </button>
            <button
              onClick={() => setShowLandscapePrompt(false)}
              className="p-0.5 hover:text-white text-slate-400 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Full-Bleed Edge-to-Edge Arena */}
        <main className="flex-1 w-full h-[calc(100vh-44px)] overflow-hidden flex flex-col items-center justify-center p-1 sm:p-2 bg-gradient-to-b from-[#070a0f] via-[#090e17] to-[#06080d]">
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
            <InkaLogo variant="full" size="md" taglineText={t.logoTagline} ariaLabel={t.logoAccessibleLabel} />
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
          <div role="group" aria-label={t.languageSelectorLabel} className="flex items-center bg-[#18212e] p-1 rounded-xl border border-slate-700/80 text-[11px] font-mono">
            {(['rw', 'en', 'fr'] as const).map((code) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                aria-pressed={lang === code}
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
            <span>{t.logoTagline}</span>
            <span>·</span>
            <span>{t.editionLabel}</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>{t.prototypeNotice}</span>
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
