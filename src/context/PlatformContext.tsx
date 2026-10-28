import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { calculateHonorReward, MatchScoreResult } from '../utils/matchScoring';
import { sounds } from '../utils/sound';
import { Language, translations, TranslationSchema } from '../utils/i18n';

export type GameType = 'dame' | 'igisoro' | 'biyari';
export type TimeControl = 'casual' | '30s' | '60s';

export interface PlayerProfile {
  id: string;
  name: string;
  city: string;
  avatarSeed: string;
  honorRating: number;
  sportsmanshipLevel: number; // 1 to 5 stars
  gamesPlayed: number;
  gamesWon: number;
  favGame: GameType;
  availability: string;
  status: 'available' | 'in_game' | 'offline';
  bio: string;
  localizedBio?: Record<Language, string>;
  bioIsCustom?: boolean;
  localizedAvailability?: Record<Language, string>;
  availabilityIsCustom?: boolean;
  phone?: string;
}

export const getLocalizedProfileBio = (player: PlayerProfile, lang: Language): string =>
  player.bioIsCustom ? player.bio : player.localizedBio?.[lang] ?? player.bio;

export const getLocalizedProfileAvailability = (player: PlayerProfile, lang: Language): string =>
  player.availabilityIsCustom ? player.availability : player.localizedAvailability?.[lang] ?? player.availability;

export const getLocalizedMatchSummary = (item: MatchHistoryItem, lang: Language): string =>
  item.localizedScoreSummary?.[lang] ?? item.scoreSummary;

export const getLocalizedCommentText = (comment: SpectatorComment, lang: Language): string =>
  comment.localizedText?.[lang] ?? comment.text;

export interface MatchHistoryItem {
  id: string;
  gameType: GameType;
  opponentName: string;
  result: 'win' | 'loss' | 'draw';
  scoreSummary: string;
  localizedScoreSummary?: Record<Language, string>;
  date: string;
  honorEarned: number;
}

export interface SpectatorComment {
  id: string;
  author: string;
  text: string;
  localizedText?: Record<Language, string>;
  timestamp: string;
}

export interface ActiveMatch {
  id: string;
  gameType: GameType;
  timeControl: TimeControl;
  playerA: PlayerProfile;
  playerB: PlayerProfile;
  leader: 'A' | 'B' | null;
  advantage: number;
  scoreA: number;
  scoreB: number;
  status: 'playing' | 'paused' | 'concluded';
  startTime: number;
  spectatorsCount: number;
  comments: SpectatorComment[];
  turn: 'A' | 'B';
  moveCount: number;
  concludeReason?: string;
}

export interface IncomingChallenge {
  id: string;
  challenger: PlayerProfile;
  gameType: GameType;
  timeControl: TimeControl;
  message: string;
  timestamp: number;
}

interface PlatformContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: TranslationSchema;
  currentUser: PlayerProfile;
  updateCurrentUser: (updates: Partial<PlayerProfile>) => void;
  honorPoints: number;
  matchHistory: MatchHistoryItem[];
  communityPlayers: PlayerProfile[];
  liveMatches: ActiveMatch[];
  currentMatch: ActiveMatch | null;
  setCurrentMatch: (match: ActiveMatch | null) => void;
  startMatch: (gameType: GameType, opponent: PlayerProfile, timeControl?: TimeControl) => ActiveMatch;
  concludeMatch: (reason: string, isDraw?: boolean, winner?: 'A' | 'B') => void;
  updateMatchScore: (scoreResult: MatchScoreResult) => void;
  addSpectatorComment: (matchId: string, comment: string) => void;
  incomingChallenge: IncomingChallenge | null;
  triggerMockIncomingChallenge: () => void;
  respondToIncomingChallenge: (action: 'accept' | 'decline') => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

const PlatformContext = createContext<PlatformContextType | null>(null);

const INITIAL_PLAYERS: PlayerProfile[] = [
  {
    id: 'p-uwase',
    name: 'Uwase Aline',
    city: 'Kigali (Nyarutarama)',
    avatarSeed: 'uwase',
    honorRating: 1480,
    sportsmanshipLevel: 5,
    gamesPlayed: 54,
    gamesWon: 38,
    favGame: 'dame',
    availability: translations.en.availabilityUwase,
    localizedAvailability: { rw: translations.rw.availabilityUwase, en: translations.en.availabilityUwase, fr: translations.fr.availabilityUwase },
    availabilityIsCustom: false,
    status: 'available',
    bio: translations.en.demoBioUwase,
    localizedBio: { rw: translations.rw.demoBioUwase, en: translations.en.demoBioUwase, fr: translations.fr.demoBioUwase },
    bioIsCustom: false,
  },
  {
    id: 'p-kamali',
    name: 'Kamali Jean-Paul',
    city: 'Huye',
    avatarSeed: 'kamali',
    honorRating: 1530,
    sportsmanshipLevel: 5,
    gamesPlayed: 72,
    gamesWon: 49,
    favGame: 'igisoro',
    availability: translations.en.availabilityKamali,
    localizedAvailability: { rw: translations.rw.availabilityKamali, en: translations.en.availabilityKamali, fr: translations.fr.availabilityKamali },
    availabilityIsCustom: false,
    status: 'available',
    bio: translations.en.demoBioKamali,
    localizedBio: { rw: translations.rw.demoBioKamali, en: translations.en.demoBioKamali, fr: translations.fr.demoBioKamali },
    bioIsCustom: false,
  },
  {
    id: 'p-mugisha',
    name: 'Mugisha Patrick',
    city: 'Rubavu (Gisenyi)',
    avatarSeed: 'mugisha',
    honorRating: 1390,
    sportsmanshipLevel: 4,
    gamesPlayed: 41,
    gamesWon: 24,
    favGame: 'biyari',
    availability: translations.en.availabilityMugisha,
    localizedAvailability: { rw: translations.rw.availabilityMugisha, en: translations.en.availabilityMugisha, fr: translations.fr.availabilityMugisha },
    availabilityIsCustom: false,
    status: 'in_game',
    bio: translations.en.demoBioMugisha,
    localizedBio: { rw: translations.rw.demoBioMugisha, en: translations.en.demoBioMugisha, fr: translations.fr.demoBioMugisha },
    bioIsCustom: false,
  },
  {
    id: 'p-keza',
    name: 'Keza Diane',
    city: 'Musanze',
    avatarSeed: 'keza',
    honorRating: 1445,
    sportsmanshipLevel: 5,
    gamesPlayed: 33,
    gamesWon: 22,
    favGame: 'igisoro',
    availability: translations.en.availabilityKeza,
    localizedAvailability: { rw: translations.rw.availabilityKeza, en: translations.en.availabilityKeza, fr: translations.fr.availabilityKeza },
    availabilityIsCustom: false,
    status: 'available',
    bio: translations.en.demoBioKeza,
    localizedBio: { rw: translations.rw.demoBioKeza, en: translations.en.demoBioKeza, fr: translations.fr.demoBioKeza },
    bioIsCustom: false,
  },
  {
    id: 'p-kalisa',
    name: 'Kalisa Eric',
    city: 'Kigali (Kimihurura)',
    avatarSeed: 'kalisa',
    honorRating: 1610,
    sportsmanshipLevel: 5,
    gamesPlayed: 98,
    gamesWon: 74,
    favGame: 'dame',
    availability: translations.en.availabilityKalisa,
    localizedAvailability: { rw: translations.rw.availabilityKalisa, en: translations.en.availabilityKalisa, fr: translations.fr.availabilityKalisa },
    availabilityIsCustom: false,
    status: 'available',
    bio: translations.en.demoBioKalisa,
    localizedBio: { rw: translations.rw.demoBioKalisa, en: translations.en.demoBioKalisa, fr: translations.fr.demoBioKalisa },
    bioIsCustom: false,
  },
];

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Read persisted language preference from localStorage, default to Kinyarwanda ('rw')
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('inka_language');
      if (saved === 'rw' || saved === 'en' || saved === 'fr') {
        return saved;
      }
    }
    return 'rw';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('inka_language', newLang);
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.title = translations[lang].documentTitle;
      const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (description) description.content = translations[lang].metaDescription;
      const openGraphTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
      if (openGraphTitle) openGraphTitle.content = translations[lang].documentTitle;
      const openGraphDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
      if (openGraphDescription) openGraphDescription.content = translations[lang].metaDescription;
    }
  }, [lang]);

  const [honorPoints, setHonorPoints] = useState<number>(240);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<PlayerProfile>({
    id: 'p-me',
    name: 'Habimana Claude',
    city: 'Kigali (Remera)',
    avatarSeed: 'habimana',
    honorRating: 1420,
    sportsmanshipLevel: 5,
    gamesPlayed: 28,
    gamesWon: 17,
    favGame: 'dame',
    availability: translations[lang].defaultAvailability,
    localizedAvailability: { rw: translations.rw.defaultAvailability, en: translations.en.defaultAvailability, fr: translations.fr.defaultAvailability },
    availabilityIsCustom: false,
    status: 'available',
    bio: translations[lang].defaultProfileBio,
    localizedBio: { rw: translations.rw.defaultProfileBio, en: translations.en.defaultProfileBio, fr: translations.fr.defaultProfileBio },
    bioIsCustom: false,
  });

  const [matchHistory, setMatchHistory] = useState<MatchHistoryItem[]>([
    {
      id: 'hist-1',
      gameType: 'dame',
      opponentName: 'Uwase Aline',
      result: 'win',
      scoreSummary: translations.en.demoHistoryDameSummary,
      localizedScoreSummary: { rw: translations.rw.demoHistoryDameSummary, en: translations.en.demoHistoryDameSummary, fr: translations.fr.demoHistoryDameSummary },
      date: '2026-10-28 10:30',
      honorEarned: 30,
    },
    {
      id: 'hist-2',
      gameType: 'igisoro',
      opponentName: 'Kamali Jean-Paul',
      result: 'draw',
      scoreSummary: translations.en.demoHistoryIgisoroSummary,
      localizedScoreSummary: { rw: translations.rw.demoHistoryIgisoroSummary, en: translations.en.demoHistoryIgisoroSummary, fr: translations.fr.demoHistoryIgisoroSummary },
      date: '2026-10-27 19:15',
      honorEarned: 20,
    },
  ]);

  const [communityPlayers] = useState<PlayerProfile[]>(INITIAL_PLAYERS);

  const [liveMatches, setLiveMatches] = useState<ActiveMatch[]>([
    {
      id: 'match-spec-1',
      gameType: 'dame',
      timeControl: '30s',
      playerA: INITIAL_PLAYERS[4], // Kalisa
      playerB: INITIAL_PLAYERS[0], // Uwase
      leader: 'A',
      advantage: 0.2,
      scoreA: 4,
      scoreB: 2,
      status: 'playing',
      startTime: Date.now() - 1000 * 60 * 12,
      spectatorsCount: 16,
      turn: 'B',
      moveCount: 14,
      comments: [
        { id: 'c1', author: 'Kamali', text: translations.en.demoComment1, localizedText: { rw: translations.rw.demoComment1, en: translations.en.demoComment1, fr: translations.fr.demoComment1 }, timestamp: '11:05' },
        { id: 'c2', author: 'Mugisha', text: translations.en.demoComment2, localizedText: { rw: translations.rw.demoComment2, en: translations.en.demoComment2, fr: translations.fr.demoComment2 }, timestamp: '11:07' },
        { id: 'c3', author: 'Keza', text: translations.en.demoComment3, localizedText: { rw: translations.rw.demoComment3, en: translations.en.demoComment3, fr: translations.fr.demoComment3 }, timestamp: '11:10' },
      ],
    },
    {
      id: 'match-spec-2',
      gameType: 'igisoro',
      timeControl: 'casual',
      playerA: INITIAL_PLAYERS[1], // Kamali
      playerB: INITIAL_PLAYERS[3], // Keza
      leader: 'B',
      advantage: 0.25,
      scoreA: 24,
      scoreB: 40,
      status: 'playing',
      startTime: Date.now() - 1000 * 60 * 22,
      spectatorsCount: 29,
      turn: 'A',
      moveCount: 28,
      comments: [
        { id: 'c4', author: 'Gatera', text: translations.en.demoComment4, localizedText: { rw: translations.rw.demoComment4, en: translations.en.demoComment4, fr: translations.fr.demoComment4 }, timestamp: '10:55' },
        { id: 'c5', author: 'Mukamana', text: translations.en.demoComment5, localizedText: { rw: translations.rw.demoComment5, en: translations.en.demoComment5, fr: translations.fr.demoComment5 }, timestamp: '10:58' },
      ],
    },
    {
      id: 'match-spec-3',
      gameType: 'biyari',
      timeControl: '30s',
      playerA: INITIAL_PLAYERS[2], // Mugisha
      playerB: {
        id: 'p-guest',
        name: 'Gakuba Bosco',
        city: 'Gicumbi',
        avatarSeed: 'gakuba',
        honorRating: 1350,
        sportsmanshipLevel: 5,
        gamesPlayed: 19,
        gamesWon: 11,
        favGame: 'biyari',
        availability: 'Evenings',
        status: 'in_game',
        bio: 'Biyari lover.',
      },
      leader: 'A',
      advantage: 0.4,
      scoreA: 4,
      scoreB: 2,
      status: 'playing',
      startTime: Date.now() - 1000 * 60 * 8,
      spectatorsCount: 11,
      turn: 'A',
      moveCount: 9,
      comments: [
        { id: 'c6', author: 'Uwase', text: 'Clean cut on the 3-ball into the side pocket!', timestamp: '11:12' },
      ],
    },
  ]);

  const [currentMatch, setCurrentMatch] = useState<ActiveMatch | null>(null);
  const [incomingChallenge, setIncomingChallenge] = useState<IncomingChallenge | null>(null);

  const startMatch = (
    gameType: GameType,
    opponent: PlayerProfile,
    timeControl: TimeControl = '30s'
  ): ActiveMatch => {
    const newMatch: ActiveMatch = {
      id: `match-${Date.now()}`,
      gameType,
      timeControl,
      playerA: currentUser,
      playerB: opponent,
      leader: null,
      advantage: 0,
      scoreA: 0,
      scoreB: 0,
      status: 'playing',
      startTime: Date.now(),
      spectatorsCount: 4 + Math.floor(Math.random() * 8),
      comments: [
        {
          id: `c-init-${Date.now()}`,
          author: 'INKA',
          text: `Match started with honorable sportsmanship. Good luck!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
      turn: 'A',
      moveCount: 0,
    };

    setCurrentMatch(newMatch);
    sounds.playMove();
    return newMatch;
  };

  const updateMatchScore = useCallback((scoreResult: MatchScoreResult) => {
    setCurrentMatch((prev) => {
      if (!prev || prev.status !== 'playing') return prev;
      if (
        prev.leader === scoreResult.leader &&
        Math.abs(prev.advantage - scoreResult.advantage) < 0.001 &&
        prev.scoreA === scoreResult.scoreA &&
        prev.scoreB === scoreResult.scoreB
      ) {
        return prev;
      }

      return {
        ...prev,
        leader: scoreResult.leader,
        advantage: scoreResult.advantage,
        scoreA: scoreResult.scoreA,
        scoreB: scoreResult.scoreB,
      };
    });
  }, []);

  const concludeMatch = (reason: string, isDraw = false, winner?: 'A' | 'B') => {
    if (!currentMatch) return;

    const isWin = winner ? winner === 'A' : !isDraw && currentMatch.leader === 'A';
    const rewardOutcome = isWin ? 'win' : isDraw ? 'draw' : winner ? 'loss' : 'conclude';
    const reward = calculateHonorReward(rewardOutcome, currentMatch.playerA.sportsmanshipLevel);

    setHonorPoints((prev) => prev + reward);

    // Record to match history
    const historyEntry: MatchHistoryItem = {
      id: `hist-${Date.now()}`,
      gameType: currentMatch.gameType,
      opponentName: currentMatch.playerB.name,
      result: isWin ? 'win' : isDraw ? 'draw' : 'loss',
      scoreSummary: `${currentMatch.scoreA} - ${currentMatch.scoreB}`,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      honorEarned: reward,
    };
    setMatchHistory((prev) => [historyEntry, ...prev]);

    // Update player games counter
    setCurrentUser((prev) => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1,
      gamesWon: isWin ? prev.gamesWon + 1 : prev.gamesWon,
      honorRating: prev.honorRating + (isWin ? 15 : isDraw ? 5 : -5),
    }));

    const concludedMatch: ActiveMatch = {
      ...currentMatch,
      status: 'concluded',
      concludeReason: reason,
    };

    setCurrentMatch(concludedMatch);
    sounds.playInkaChime();
  };

  const addSpectatorComment = (matchId: string, comment: string) => {
    const newComment: SpectatorComment = {
      id: `c-${Date.now()}`,
      author: currentUser.name,
      text: comment,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setLiveMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, comments: [...m.comments, newComment] } : m))
    );

    if (currentMatch && currentMatch.id === matchId) {
      setCurrentMatch((prev) => (prev ? { ...prev, comments: [...prev.comments, newComment] } : null));
    }
  };

  const triggerMockIncomingChallenge = () => {
    const challenger = INITIAL_PLAYERS[0]; // Uwase
    setIncomingChallenge({
      id: `req-${Date.now()}`,
      challenger,
      gameType: 'dame',
      timeControl: '30s',
      message: translations[lang].incomingChallengeMessage.replace('{player}', currentUser.name).replace('{game}', translations[lang].dameTitle),
      timestamp: Date.now(),
    });
    sounds.startRingtone();
  };

  const respondToIncomingChallenge = (action: 'accept' | 'decline') => {
    sounds.stopRingtone();
    if (!incomingChallenge) return;

    if (action === 'accept') {
      startMatch(incomingChallenge.gameType, incomingChallenge.challenger, incomingChallenge.timeControl);
    }
    setIncomingChallenge(null);
  };

  const updateCurrentUser = (updates: Partial<PlayerProfile>) => {
    setCurrentUser((prev) => ({
      ...prev,
      ...updates,
      ...(Object.prototype.hasOwnProperty.call(updates, 'bio') ? { bioIsCustom: true } : {}),
      ...(Object.prototype.hasOwnProperty.call(updates, 'availability') ? { availabilityIsCustom: true } : {}),
    }));
  };

  useEffect(() => {
    sounds.setMuted(isMuted);
  }, [isMuted]);

  return (
    <PlatformContext.Provider
      value={{
        lang,
        setLang,
        t: translations[lang],
        currentUser,
        updateCurrentUser,
        honorPoints,
        matchHistory,
        communityPlayers,
        liveMatches,
        currentMatch,
        setCurrentMatch,
        startMatch,
        concludeMatch,
        updateMatchScore,
        addSpectatorComment,
        incomingChallenge,
        triggerMockIncomingChallenge,
        respondToIncomingChallenge,
        isMuted,
        setIsMuted,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
};
