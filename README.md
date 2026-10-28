# Rwandan Skill-Games Platform
### *Igisoro · Dame · Biyari*
> **"Play. Relax the mind. Compete with skill. Meet people."**

A modern, authentic web application for traditional Rwandan skill games, based on the **Rwandan Skill-Games Platform Concept Document (Narrative Edition)**.

---

## 1. Overview & Guiding Principles

The platform connects real people to compete in games of pure skill, relax after work, and build friendships. 

* **Strictly Human-vs-Human**: Every match is between two human beings. Automated opponents and bots are prohibited.
* **The Inka Unit**: The term *inka* refers to the small playing pieces, seeds, or balls used in the games (not cattle). It serves as the account unit for stakes and gradual settlement.
* **Gradual Mathematical Settlement (Section 7)**: Stakes do not transfer all at once at the end. Instead, the platform continuously tracks the advantage value $w \in [0, 1.0]$. The inka holdings adjust continuously:
  $$\text{Player A Current Holding} = a + (w \times b)$$
  $$\text{Player B Current Holding} = b \times (1 - w)$$
  *(where $a$ is Player A's stake, $b$ is Player B's stake, and total pool $a + b$ is strictly conserved).*
* **Freedom to Stop (Section 7.8)**: Any player may stop at any time and immediately retain the inka shown by their current standing. The opponent cannot compel them to continue.
* **Spectator Community & Isolation (Section 8)**: Spectators watch public games in real time and converse in a live chat. However, to prevent outside coaching, active players cannot see spectator comments until the match concludes. Spectator betting is excluded to preserve skill-game integrity and prevent collusion.
* **Call-Style Alerts (Section 5.3)**: Players who publish their playing availability receive an audible phone-ring alert when an opponent challenges them.
* **Trilingual**: Native support for **Kinyarwanda (`rw`)**, **English (`en`)**, and **French (`fr`)**.

---

## 2. The Three Games

1. **Dame (Checkers / Draughts)**:
   - Foundation game designed to establish shared platform systems.
   - 10 pieces per player on an 8×8 board (20 pieces total).
   - Equal inka valuation for all pieces including kings (called *dames*).
   - Net captured pieces divided by 10 sets the advantage $w$; decisive win yields $w = 1.0$.

2. **Igisoro (Traditional Rwandan Mancala)**:
   - Authentic 4 rows × 8 pits board (32 pits total, 64 inka seeds).
   - South player controls rows 2 & 3; North player controls rows 0 & 1.
   - Sowing mechanics with opposing front-row and back-row captures.
   - Advantage evaluated by seed fraction: $w = |2p - 1|$.

3. **Biyari (Eight-Ball Pool)**:
   - Interactive top-down 2D canvas with cushion bounces, elastic ball-to-ball collisions, and pocket detection.
   - Cue stick aiming, trajectory guidelines, and shot power meter.
   - Target ball tracking (solids vs stripes) advancing towards the decisive 8-ball finish.

---

## 3. Project Directory Structure

```text
├── public/
│   └── assets/aistudio/
│       └── Rwandan_Skill_Games_Platform_Full_English_Concept_6e45eb7f.pdf
├── src/
│   ├── components/
│   │   ├── games/
│   │   │   ├── BiyariGame.tsx        # 2D canvas eight-ball pool game
│   │   │   ├── DameGame.tsx          # 10-piece-per-side checkers game
│   │   │   ├── IgisoroGame.tsx       # 32-pit Rwandan mancala game
│   │   │   └── SettlementBar.tsx     # Live HUD showing gradual inka shift & timer
│   │   ├── modals/
│   │   │   ├── IncomingCallModal.tsx # Ringing phone-call style challenge alert
│   │   │   └── StakeNegotiationModal.tsx # Unequal stakes & counter-proposal dialog
│   │   └── views/
│   │       ├── LobbyView.tsx         # Play-Now matching & games showcase
│   │       ├── ProfilesView.tsx      # Player roster with illustrated avatars
│   │       ├── RulesView.tsx         # Interactive settlement formula simulator & 24 rules
│   │       ├── SchedulingView.tsx    # Availability publisher & scheduler
│   │       ├── SpectatorView.tsx     # Live Arena stream, spectator chat, challenge CTA
│   │       └── WalletView.tsx        # Inka audit ledger & future MoMo preview
│   ├── context/
│   │   └── PlatformContext.tsx       # State management for matches, wallet, ledger, and alerts
│   ├── utils/
│   │   ├── i18n.ts                   # Trilingual translations (Kinyarwanda, English, French)
│   │   ├── settlement.ts             # Mathematical settlement engine & advantage formulas
│   │   ├── settlement.test.ts        # Unit test suite for settlement math
│   │   └── sound.ts                  # Web Audio API synthesizer (moves, seeds, pool, ringtone)
│   ├── App.tsx                       # Main application shell with Top Bar Contract
│   ├── index.css                     # Tailwind CSS & Imigongo cultural theme tokens
│   └── main.tsx                      # React root entry point
├── .env.example                      # Safe environment variable template
├── .gitignore                        # Git ignore patterns
├── index.html                        # Application entry point & Google Fonts
├── metadata.json                     # Applet metadata
├── package.json                      # Dependencies and npm scripts
├── tsconfig.json                     # TypeScript compiler configuration
├── vercel.json                       # Vercel deployment configuration
└── vite.config.ts                    # Vite build configuration
```

---

## 4. Prerequisites & Installation

### Prerequisites
* **Node.js**: `v18.0.0` or higher (Node 20+ recommended).
* **Package Manager**: `npm`, `bun`, or `pnpm`.

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd rwandan-skill-games-platform

# Install dependencies
npm install
```

---

## 5. Local Development & Testing

### Run Development Server
```bash
npm run dev
```
The application will start on `http://localhost:3000`.

### Run Unit Tests
The settlement engine includes automated unit tests covering all 7 worked examples from page 9 of the concept document:
```bash
npm test
# Or directly via Node test runner:
npx tsx --test src/utils/settlement.test.ts
```

### Type Checking & Linting
```bash
npm run lint
```

### Production Build
```bash
npm run build
```
Build outputs are written to the `dist/` directory.

---

## 6. Hosting & Deployment

### Deploying to Vercel
The repository includes `vercel.json` configured for Single-Page Applications:
1. Connect your repository to [Vercel](https://vercel.com).
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Deploy.

### Deploying to Container Platforms (Cloud Run / Render / Railway)
The project can also be served using any static web server (such as Nginx, Caddy, or Node.js Express):
```bash
npm run build
npx serve dist -s -l 3000
```

---

## 7. Financial Responsibility & Compliance Notice

* **Launch Phase**: The platform operates in **100% Free Access Mode** (`VITE_LAUNCH_PHASE="free"`). Inka are provided without fee to build an active, friendly community.
* **Future Paid Phase (Section 6.3 - 6.5)**: Any future integration of real-money inka purchase or redemption through MTN Mobile Money or Airtel Money requires prior licensing, legal clearance under Rwandan law, strict identity verification (KYC), daily cashout caps, and anti-fraud monitoring. Real-money transactions must remain disabled until full regulatory approval is obtained.
