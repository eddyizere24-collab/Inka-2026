# INKA
### *Igisoro · Dame · Biyari*
> **"Kina. Ruhura mu mutwe. Rushanwa ku bwenge. Menyane n'abandi."**
> *(Play. Relax the mind. Compete with intellect. Connect with friends.)*

An authentic, modern web platform celebrating traditional Rwandan skill games. Officially branded as **INKA**, inspired by Rwandan heritage, community connection, intellectual play, and genuine sportsmanship.

---

## 1. The INKA Identity & Philosophy

* **Brand Meaning**: In Rwanda, *Inka* (the sacred cow) symbolizes prosperity, deep friendship, trust, and communal respect. In games, *inka* historically refers to the smooth playing stones, seeds, and markers used on boards. INKA celebrates this cultural heritage through warm, friendly, and dignified gameplay.
* **100% Free Skill Platform**: INKA has completely eliminated financial wagering, cow staking, money transfer, and cashouts. Play is 100% free for everyone, governed by intellect and sportsmanship.
* **Match Scoring & Advantage Engine**: Replaces gambling formulas with a pure skill advantage metric $w \in [0, 1.0]$ indicating match dominance based on net captures, seed counts, and pocketed balls.
* **Sportsmanship & Honor System**: Players earn honor points and level up sportsmanship stars (1 to 5 stars) through polite play, mutual draws, and fair matches.
* **Strictly Human-vs-Human**: Every match is played against a verified human community member. Computer bots and AI players are strictly excluded.
* **Freedom to Conclude Gracefully**: Either player may propose a draw or conclude a match anytime with dignity.
* **Spectator Integrity**: Spectators watch games live in silence without coaching. Comments remain isolated until the final move is made.
* **Trilingual Localization**: Full parity across **Kinyarwanda (`rw`, default)**, **English (`en`)**, and **French (`fr`)**, verified by automated test suites.

---

## 2. The Three Traditional Games

1. **Dame (Checkers / Draughts)**:
   - 10 pieces per player on an 8×8 board (20 pieces total).
   - Equal scoring for all pieces including crowned kings (*dames*).
   - Net captured pieces determine the advantage $w \in [0, 1.0]$. Decisive victory clears all 10 opponent pieces.

2. **Igisoro (Traditional Rwandan Mancala)**:
   - 4 rows × 8 pits board (32 pits total, 64 traditional seeds).
   - Sowing mechanics in counter-clockwise loops with front-row and back-row captures (*Gusiba*).
   - Advantage evaluated by seed fraction: $w = |2p - 1|$.

3. **Biyari (Eight-Ball Billiards)**:
   - Interactive 2D physics canvas simulation with cushion bounces and elastic collisions.
   - Cue stick aiming, trajectory guideline, and shot power meter.
   - Potted target balls advance advantage towards the decisive 8-ball finish.

---

## 3. Project Directory Structure

```text
├── public/
│   ├── favicon.svg               # Bespoke INKA cow emblem & Inyambo horn favicon
│   └── assets/aistudio/          # Documentation and reference assets
├── src/
│   ├── components/
│   │   ├── brand/
│   │   │   └── InkaLogo.tsx       # Vector SVG logo system (full, compact, symbol)
│   │   ├── games/
│   │   │   ├── BiyariGame.tsx     # 2D canvas eight-ball pool game
│   │   │   ├── DameGame.tsx       # 10-piece-per-side checkers game
│   │   │   ├── IgisoroGame.tsx    # 32-pit Rwandan mancala game
│   │   │   └── GameHud.tsx        # Sportsmanship HUD, timer & advantage gauge
│   │   ├── modals/
│   │   │   ├── ChallengeModal.tsx # Friendly match invitation & time controls
│   │   │   └── IncomingCallModal.tsx # Ringing phone-call style challenge alert
│   │   └── views/
│   │       ├── HonorsView.tsx     # Sportsmanship trophies, ratings & match history
│   │       ├── LobbyView.tsx      # Play-Now matchmaking & games showcase
│   │       ├── ProfilesView.tsx   # Player roster with illustrated avatars
│   │       ├── RulesView.tsx      # The 6 INKA Principles & interactive simulator
│   │       ├── SchedulingView.tsx # Availability publisher & match scheduler
│   │       └── SpectatorView.tsx  # Live Arena stream, chat isolation & challenge CTA
│   ├── context/
│   │   └── PlatformContext.tsx    # Context state for matches, honors, alerts & language
│   ├── utils/
│   │   ├── i18n.ts                # Trilingual dictionary (RW, EN, FR)
│   │   ├── i18n.test.ts           # 100% dictionary key parity unit tests
│   │   ├── matchScoring.ts        # Skill advantage engine & honor calculation
│   │   ├── matchScoring.test.ts   # Advantage formulas unit test suite
│   │   └── sound.ts               # Web Audio API synthesizer (moves, seeds, pool chime)
│   ├── App.tsx                    # Main app shell with Top Bar Contract
│   ├── index.css                  # Tailwind CSS styling
│   └── main.tsx                   # React root entry point
├── index.html                     # HTML5 entry point & metadata
├── metadata.json                  # AI Studio applet metadata
├── package.json                   # Dependencies, scripts and test commands
├── tsconfig.json                  # TypeScript configuration
└── vite.config.ts                 # Vite build setup
```

---

## 4. Local Development & Testing

### Installation
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```
Accessible at `http://localhost:3000`.

### Run Automated Unit Tests
Automated tests verify mathematical advantage formulas, 8-ball victory conditions, and 100% trilingual dictionary parity:
```bash
npm test
# Or directly via Node.js test runner:
npx tsx --test src/utils/matchScoring.test.ts src/utils/i18n.test.ts
```

### Production Build
```bash
npm run build
```
Build outputs are written to the `dist/` directory.

---

## 5. Deployment
The project is ready for immediate deployment on Vercel, Cloud Run, Render, or any standard static or Node host.
