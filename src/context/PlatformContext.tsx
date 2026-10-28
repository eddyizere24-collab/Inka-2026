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
  phone?: string;
}

export interface MatchHistoryItem {
  id: string;
  gameType: GameType;
  opponentName: string;
  result: 'win' | 'loss' | 'draw';
  scoreSummary: string;
  date: string;
  honorEarned: number;
}

export interface SpectatorComment {
  id: string;
  author: string;
  text: string;
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
    availability: 'Every day 6:00 PM – 9:00 PM',
    status: 'available',
    bio: 'Experienced Dame player with a fast counter-attacking style. Always open for respectful matches.',
    phone: '+250 788 412 901',
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
    availability: 'Weekdays 4:00 PM – 8:00 PM',
    status: 'available',
    bio: 'Passionate about traditional Igisoro since childhood. Playing for the beauty of strategic sowing.',
    phone: '+250 788 321 004',
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
    availability: 'Evenings from 7:00 PM',
    status: 'in_game',
    bio: 'Biyari (8-ball) specialist. Clean bank shots and positional play.',
    phone: '+250 783 990 120',
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
    availability: 'Available on weekends & afternoons',
    status: 'available',
    bio: 'Studying agricultural science, enjoys relaxing the mind with Igisoro mancala.',
    phone: '+250 781 123 456',
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
    availability: 'Daily 2:00 PM – 7:00 PM',
    status: 'available',
    bio: 'Veteran Dame player and tournament enthusiast.',
    phone: '+250 788 776 543',
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
    availability: 'Daily 5:00 PM – 9:00 PM',
    status: 'available',
    bio: 'Enjoys good Dame and Igisoro matches after work. Calm and respectful play.',
    phone: '+250 788 555 123',
  });

  const [matchHistory, setMatchHistory] = useState<MatchHistoryItem[]>([
    {
      id: 'hist-1',
      gameType: 'dame',
      opponentName: 'Uwase Aline',
      result: 'win',
      scoreSummary: 'Captured 10 vs 6 pieces',
      date: '2026-10-28 10:30',
      honorEarned: 30,
    },
    {
      id: 'hist-2',
      gameType: 'igisoro',
      opponentName: 'Kamali Jean-Paul',
      result: 'draw',
      scoreSummary: '32 vs 32 seeds',
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
        { id: 'c1', author: 'Kamali', text: 'Kalisa made a strong diagonal advance on column 4.', timestamp: '11:05' },
        { id: 'c2', author: 'Mugisha', text: 'Uwase has a trap prepared if he takes the bait.', timestamp: '11:07' },
        { id: 'c3', author: 'Keza', text: 'Masterful play from both players!', timestamp: '11:10' },
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
        { id: 'c4', author: 'Gatera', text: 'Keza cleared the front row with a beautiful sow.', timestamp: '10:55' },
        { id: 'c5', author: 'Mukamana', text: 'Kamali is defending the back pits skillfully.', timestamp: '10:58' },
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

    const isWin = winner === 'A' || (!isDraw && currentMatch.leader === 'A');
    const reward = calculateHonorReward(isWin, isDraw, currentMatch.moveCount);

    setHonorPoints((prev) => prev + reward.honorPoints);

    // Record to match history
    const historyEntry: MatchHistoryItem = {
      id: `hist-${Date.now()}`,
      gameType: currentMatch.gameType,
      opponentName: currentMatch.playerB.name,
      result: isWin ? 'win' : isDraw ? 'draw' : 'loss',
      scoreSummary: `${currentMatch.scoreA} - ${currentMatch.scoreB}`,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      honorEarned: reward.honorPoints,
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
    setCurrentUser((prev) => ({ ...prev, ...updates }));
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
