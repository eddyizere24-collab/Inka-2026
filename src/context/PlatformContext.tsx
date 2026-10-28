import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { calculateSettlement } from '../utils/settlement';
import { sounds } from '../utils/sound';
import { Language, translations } from '../utils/i18n';

export type GameType = 'dame' | 'igisoro' | 'biyari';

export interface PlayerProfile {
  id: string;
  name: string;
  city: string;
  avatarSeed: string;
  rating: number;
  gamesPlayed: number;
  gamesWon: number;
  favGame: GameType;
  availability: string;
  status: 'available' | 'in_game' | 'offline';
  bio: string;
  phone?: string;
}

export interface LedgerEntry {
  id: string;
  timestamp: string;
  type: 'free_grant' | 'stake_locked' | 'settlement_payout' | 'slow_penalty' | 'cashout_sim';
  amount: number; // positive or negative
  balanceAfter: number;
  description: string;
  gameId?: string;
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
  playerA: PlayerProfile;
  playerB: PlayerProfile;
  stakeA: number;
  stakeB: number;
  leader: 'A' | 'B' | null;
  w: number;
  holdingA: number;
  holdingB: number;
  status: 'negotiating' | 'playing' | 'paused' | 'settled';
  startTime: number;
  spectatorsCount: number;
  comments: SpectatorComment[];
  turn: 'A' | 'B';
  moveCount: number;
  settlementReason?: string;
}

export interface IncomingRequest {
  id: string;
  challenger: PlayerProfile;
  gameType: GameType;
  proposedStake: number;
  timestamp: number;
  status: 'ringing' | 'accepted' | 'declined';
}

interface PlatformContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations.rw;
  currentUser: PlayerProfile;
  updateCurrentUser: (updates: Partial<PlayerProfile>) => void;
  inkaBalance: number;
  setInkaBalance: (val: number | ((prev: number) => number)) => void;
  ledger: LedgerEntry[];
  addLedgerEntry: (entry: Omit<LedgerEntry, 'id' | 'timestamp' | 'balanceAfter'>) => void;
  communityPlayers: PlayerProfile[];
  liveMatches: ActiveMatch[];
  currentMatch: ActiveMatch | null;
  setCurrentMatch: (match: ActiveMatch | null) => void;
  startMatch: (gameType: GameType, opponent: PlayerProfile, stakeA: number, stakeB: number) => ActiveMatch;
  settleMatch: (reason: string) => void;
  updateMatchAdvantage: (leader: 'A' | 'B' | null, w: number) => void;
  addSpectatorComment: (matchId: string, comment: string) => void;
  incomingRequest: IncomingRequest | null;
  triggerMockIncomingRequest: () => void;
  respondToIncomingRequest: (action: 'accept' | 'decline' | 'counter', counterStake?: number) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  claimFreeInka: (amount?: number) => void;
}

const PlatformContext = createContext<PlatformContextType | null>(null);

const INITIAL_PLAYERS: PlayerProfile[] = [
  {
    id: 'p-uwase',
    name: 'Uwase Aline',
    city: 'Kigali (Nyarutarama)',
    avatarSeed: 'uwase',
    rating: 1480,
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
    rating: 1530,
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
    rating: 1390,
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
    rating: 1445,
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
    rating: 1610,
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
  const [lang, setLang] = useState<Language>('rw');
  const [inkaBalance, setInkaBalance] = useState<number>(25.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<PlayerProfile>({
    id: 'p-me',
    name: 'Habimana Claude',
    city: 'Kigali (Remera)',
    avatarSeed: 'habimana',
    rating: 1420,
    gamesPlayed: 28,
    gamesWon: 17,
    favGame: 'dame',
    availability: 'Daily 5:00 PM – 9:00 PM',
    status: 'available',
    bio: 'Enjoys good Dame and Igisoro matches after work. Calm and respectful play.',
    phone: '+250 788 555 123',
  });

  const [communityPlayers] = useState<PlayerProfile[]>(INITIAL_PLAYERS);
  const [ledger, setLedger] = useState<LedgerEntry[]>([
    {
      id: 'led-1',
      timestamp: '2026-10-28 09:15',
      type: 'free_grant',
      amount: 25.0,
      balanceAfter: 25.0,
      description: 'Free Launch Phase Welcome Grant (No charge)',
    },
  ]);

  const [liveMatches, setLiveMatches] = useState<ActiveMatch[]>([
    {
      id: 'match-spec-1',
      gameType: 'dame',
      playerA: INITIAL_PLAYERS[4], // Kalisa
      playerB: INITIAL_PLAYERS[0], // Uwase
      stakeA: 5,
      stakeB: 3,
      leader: 'A',
      w: 0.2,
      holdingA: 5.6,
      holdingB: 2.4,
      status: 'playing',
      startTime: Date.now() - 1000 * 60 * 12,
      spectatorsCount: 16,
      turn: 'B',
      moveCount: 14,
      comments: [
        { id: 'c1', author: 'Kamali', text: 'Kalisa made a strong diagonal advance on column 4.', timestamp: '11:05' },
        { id: 'c2', author: 'Mugisha', text: 'Uwase has a trap prepared if he takes the bait.', timestamp: '11:07' },
        { id: 'c3', author: 'Keza', text: 'The inka gradual settlement keeps both on edge!', timestamp: '11:10' },
      ],
    },
    {
      id: 'match-spec-2',
      gameType: 'igisoro',
      playerA: INITIAL_PLAYERS[1], // Kamali
      playerB: INITIAL_PLAYERS[3], // Keza
      stakeA: 10,
      stakeB: 10,
      leader: 'B',
      w: 0.25,
      holdingA: 7.5,
      holdingB: 12.5,
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
      playerA: INITIAL_PLAYERS[2], // Mugisha
      playerB: {
        id: 'p-guest',
        name: 'Gakuba Bosco',
        city: 'Gicumbi',
        avatarSeed: 'gakuba',
        rating: 1350,
        gamesPlayed: 19,
        gamesWon: 11,
        favGame: 'biyari',
        availability: 'Evenings',
        status: 'in_game',
        bio: 'Biyari lover.',
      },
      stakeA: 4,
      stakeB: 4,
      leader: 'A',
      w: 0.43,
      holdingA: 5.72,
      holdingB: 2.28,
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
  const [incomingRequest, setIncomingRequest] = useState<IncomingRequest | null>(null);

  const addLedgerEntry = (entry: Omit<LedgerEntry, 'id' | 'timestamp' | 'balanceAfter'>) => {
    setInkaBalance((prev) => {
      const newBal = Math.max(0, Math.round((prev + entry.amount) * 100) / 100);
      const newEntry: LedgerEntry = {
        id: `led-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: entry.type,
        amount: entry.amount,
        balanceAfter: newBal,
        description: entry.description,
        gameId: entry.gameId,
      };
      setLedger((l) => [newEntry, ...l]);
      return newBal;
    });
  };

  const claimFreeInka = (amount = 20) => {
    addLedgerEntry({
      type: 'free_grant',
      amount,
      description: 'Free Launch Phase Refill (No real money charged)',
    });
    sounds.playInkaChime();
  };

  const startMatch = (
    gameType: GameType,
    opponent: PlayerProfile,
    stakeA: number,
    stakeB: number
  ): ActiveMatch => {
    // Lock stake for player A from balance
    addLedgerEntry({
      type: 'stake_locked',
      amount: -stakeA,
      description: `Agreed Stake locked for ${gameType.toUpperCase()} match vs ${opponent.name}`,
    });

    const newMatch: ActiveMatch = {
      id: `match-${Date.now()}`,
      gameType,
      playerA: currentUser,
      playerB: opponent,
      stakeA,
      stakeB,
      leader: null,
      w: 0,
      holdingA: stakeA,
      holdingB: stakeB,
      status: 'playing',
      startTime: Date.now(),
      spectatorsCount: 3 + Math.floor(Math.random() * 8),
      comments: [
        {
          id: `c-init-${Date.now()}`,
          author: 'System',
          text: `Match began! Stakes agreed: ${currentUser.name} (${stakeA} inka), ${opponent.name} (${stakeB} inka).`,
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

  const updateMatchAdvantage = useCallback((leader: 'A' | 'B' | null, w: number) => {
    setCurrentMatch((prev) => {
      if (!prev || prev.status !== 'playing') return prev;
      if (prev.leader === leader && Math.abs(prev.w - w) < 0.001) return prev;

      const settlement = calculateSettlement(
        prev.stakeA,
        prev.stakeB,
        leader,
        w
      );

      return {
        ...prev,
        leader,
        w,
        holdingA: settlement.holdingA,
        holdingB: settlement.holdingB,
      };
    });
  }, []);

  const settleMatch = (reason: string) => {
    if (!currentMatch) return;

    const finalHoldingA = currentMatch.holdingA;
    // Add back the settled holding to Player A's balance
    addLedgerEntry({
      type: 'settlement_payout',
      amount: finalHoldingA,
      description: `Settlement payout for ${currentMatch.gameType.toUpperCase()} (${reason}). Final holding: ${finalHoldingA} inka`,
      gameId: currentMatch.id,
    });

    // Update matches list
    const settledMatch: ActiveMatch = {
      ...currentMatch,
      status: 'settled',
      settlementReason: reason,
    };

    setCurrentMatch(settledMatch);
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

  const triggerMockIncomingRequest = () => {
    const challenger = INITIAL_PLAYERS[0]; // Uwase
    setIncomingRequest({
      id: `req-${Date.now()}`,
      challenger,
      gameType: 'dame',
      proposedStake: 3,
      timestamp: Date.now(),
      status: 'ringing',
    });
    sounds.startRingtone();
  };

  const respondToIncomingRequest = (action: 'accept' | 'decline' | 'counter', counterStake?: number) => {
    sounds.stopRingtone();
    if (!incomingRequest) return;

    if (action === 'accept') {
      const challenger = incomingRequest.challenger;
      const proposedStake = counterStake || incomingRequest.proposedStake;
      // You stake 5, opponent stakes 3 (exact example from Appendix A!)
      startMatch('dame', challenger, 5, proposedStake);
    }
    setIncomingRequest(null);
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
        inkaBalance,
        setInkaBalance,
        ledger,
        addLedgerEntry,
        communityPlayers,
        liveMatches,
        currentMatch,
        setCurrentMatch,
        startMatch,
        settleMatch,
        updateMatchAdvantage,
        addSpectatorComment,
        incomingRequest,
        triggerMockIncomingRequest,
        respondToIncomingRequest,
        isMuted,
        setIsMuted,
        claimFreeInka,
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
