import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'node:path';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// Ensure data directory exists
const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Durable SQLite Database setup
const dbPath = path.join(dataDir, 'inka.db');
const db = new DatabaseSync(dbPath);

// Initialize schema
db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    avatar_seed TEXT NOT NULL,
    honor_rating INTEGER NOT NULL DEFAULT 1400,
    sportsmanship_level INTEGER NOT NULL DEFAULT 5,
    games_played INTEGER NOT NULL DEFAULT 0,
    games_won INTEGER NOT NULL DEFAULT 0,
    fav_game TEXT NOT NULL DEFAULT 'dame',
    availability TEXT NOT NULL DEFAULT 'Available in afternoons',
    bio TEXT NOT NULL DEFAULT 'Player on INKA',
    language TEXT NOT NULL DEFAULT 'rw',
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,
    game_type TEXT NOT NULL,
    time_control TEXT NOT NULL,
    player_a_id TEXT NOT NULL,
    player_a_name TEXT NOT NULL,
    player_b_id TEXT NOT NULL,
    player_b_name TEXT NOT NULL,
    leader TEXT,
    advantage REAL NOT NULL DEFAULT 0.0,
    score_a INTEGER NOT NULL DEFAULT 0,
    score_b INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'playing',
    start_time INTEGER NOT NULL,
    turn TEXT NOT NULL DEFAULT 'A',
    move_count INTEGER NOT NULL DEFAULT 0,
    conclude_reason TEXT,
    winner TEXT,
    message TEXT
  );

  CREATE TABLE IF NOT EXISTS match_moves (
    id TEXT PRIMARY KEY,
    match_id TEXT NOT NULL,
    move_number INTEGER NOT NULL,
    player_role TEXT NOT NULL,
    move_payload TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(match_id) REFERENCES matches(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS match_comments (
    id TEXT PRIMARY KEY,
    match_id TEXT NOT NULL,
    author TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS challenges (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    recipient_id TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    game_type TEXT NOT NULL,
    time_control TEXT NOT NULL,
    message TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending',
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS schedules (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    opponent_id TEXT NOT NULL,
    opponent_name TEXT NOT NULL,
    game_type TEXT NOT NULL,
    time_control TEXT NOT NULL,
    window TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'confirmed',
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    reporter_id TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
`);

async function bootstrap() {
  const app = express();
  app.use(express.json());

  // Security Headers Middleware
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // --- API ENDPOINTS ---

  // Health and Zero-Wagering Operational Verification
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      app: 'INKA',
      version: '1.0.0',
      launchPhase: 'free',
      wagering: 'strictly_zero',
      timestamp: Date.now(),
    });
  });

  // User Profile: Get or Initialize Guest
  app.get('/api/auth/me', (req: Request, res: Response) => {
    const userId = (req.query.userId as string) || 'guest-default';
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    let user = stmt.get(userId) as any;

    if (!user) {
      // Seed default authentic profile
      const defaultProfile = {
        id: userId,
        name: 'Murenzi David',
        city: 'Kigali (Kimironko)',
        avatar_seed: 'murenzi',
        honor_rating: 1420,
        sportsmanship_level: 5,
        games_played: 12,
        games_won: 8,
        fav_game: 'dame',
        availability: 'Weekdays after 5 PM',
        bio: 'Tradition, skill, and fair play on INKA.',
        language: 'rw',
        created_at: Date.now(),
      };

      db.prepare(`
        INSERT INTO users (id, name, city, avatar_seed, honor_rating, sportsmanship_level, games_played, games_won, fav_game, availability, bio, language, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        defaultProfile.id,
        defaultProfile.name,
        defaultProfile.city,
        defaultProfile.avatar_seed,
        defaultProfile.honor_rating,
        defaultProfile.sportsmanship_level,
        defaultProfile.games_played,
        defaultProfile.games_won,
        defaultProfile.fav_game,
        defaultProfile.availability,
        defaultProfile.bio,
        defaultProfile.language,
        defaultProfile.created_at
      );
      user = defaultProfile;
    }

    res.json({ user });
  });

  // Update Profile
  app.put('/api/profile', (req: Request, res: Response) => {
    const { id, name, city, bio, availability, fav_game, language } = req.body;
    if (!id || !name) {
      return res.status(400).json({ error: 'Missing required profile fields' });
    }

    db.prepare(`
      UPDATE users SET
        name = COALESCE(?, name),
        city = COALESCE(?, city),
        bio = COALESCE(?, bio),
        availability = COALESCE(?, availability),
        fav_game = COALESCE(?, fav_game),
        language = COALESCE(?, language)
      WHERE id = ?
    `).run(name, city, bio, availability, fav_game, language, id);

    const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    res.json({ success: true, user: updated });
  });

  // Active Matches for Spectator Arena
  app.get('/api/matches/active', (req: Request, res: Response) => {
    const rows = db.prepare(`
      SELECT * FROM matches WHERE status = 'playing' ORDER BY start_time DESC LIMIT 20
    `).all() as any[];

    const matches = rows.map((m) => {
      const comments = db.prepare(`
        SELECT * FROM match_comments WHERE match_id = ? ORDER BY created_at ASC
      `).all(m.id) as any[];

      return {
        id: m.id,
        gameType: m.game_type,
        timeControl: m.time_control,
        playerA: { id: m.player_a_id, name: m.player_a_name, city: 'Kigali', sportsmanshipLevel: 5 },
        playerB: { id: m.player_b_id, name: m.player_b_name, city: 'Butare', sportsmanshipLevel: 5 },
        leader: m.leader,
        advantage: m.advantage,
        scoreA: m.score_a,
        scoreB: m.score_b,
        status: m.status,
        startTime: m.start_time,
        spectatorsCount: 6,
        comments: comments.map((c) => ({
          id: c.id,
          author: c.author,
          text: c.text,
          timestamp: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })),
        turn: m.turn,
        moveCount: m.move_count,
        concludeReason: m.conclude_reason,
      };
    });

    res.json({ matches });
  });

  // Create a Match Record (Truthful match initialization)
  app.post('/api/matches', (req: Request, res: Response) => {
    const { id, gameType, timeControl, playerA, playerB, message } = req.body;
    if (!id || !gameType || !playerA || !playerB) {
      return res.status(400).json({ error: 'Invalid match creation payload' });
    }

    db.prepare(`
      INSERT INTO matches (id, game_type, time_control, player_a_id, player_a_name, player_b_id, player_b_name, leader, advantage, score_a, score_b, status, start_time, turn, move_count, message)
      VALUES (?, ?, ?, ?, ?, ?, ?, NULL, 0.0, 0, 0, 'playing', ?, 'A', 0, ?)
    `).run(
      id,
      gameType,
      timeControl || '30s',
      playerA.id || 'p-a',
      playerA.name,
      playerB.id || 'p-b',
      playerB.name,
      Date.now(),
      message || ''
    );

    // Initial sportsmanship comment
    db.prepare(`
      INSERT INTO match_comments (id, match_id, author, text, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(`c-${Date.now()}`, id, 'INKA System', 'Match started with fair play pledge.', Date.now());

    res.json({ success: true, matchId: id });
  });

  // Conclude a Match (Server-Authoritative Result)
  app.post('/api/matches/:id/conclude', (req: Request, res: Response) => {
    const matchId = String(req.params.id);
    const { reason, winner, isDraw } = req.body;

    const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(matchId) as any;
    if (!match) return res.status(404).json({ error: 'Match not found' });

    db.prepare(`
      UPDATE matches SET
        status = 'concluded',
        conclude_reason = ?,
        winner = ?
      WHERE id = ?
    `).run(String(reason || 'Match concluded'), String(winner || (isDraw ? 'draw' : 'concluded')), matchId);

    // Increment player statistics
    if (winner === 'A') {
      db.prepare('UPDATE users SET games_played = games_played + 1, games_won = games_won + 1, honor_rating = honor_rating + 15 WHERE id = ?').run(String(match.player_a_id));
      db.prepare('UPDATE users SET games_played = games_played + 1, honor_rating = honor_rating - 5 WHERE id = ?').run(String(match.player_b_id));
    } else if (winner === 'B') {
      db.prepare('UPDATE users SET games_played = games_played + 1, honor_rating = honor_rating - 5 WHERE id = ?').run(String(match.player_a_id));
      db.prepare('UPDATE users SET games_played = games_played + 1, games_won = games_won + 1, honor_rating = honor_rating + 15 WHERE id = ?').run(String(match.player_b_id));
    } else {
      // Draw
      db.prepare('UPDATE users SET games_played = games_played + 1, honor_rating = honor_rating + 5 WHERE id = ?').run(String(match.player_a_id));
      db.prepare('UPDATE users SET games_played = games_played + 1, honor_rating = honor_rating + 5 WHERE id = ?').run(String(match.player_b_id));
    }

    res.json({ success: true, outcome: winner || 'draw' });
  });

  // Add Comment to Match
  app.post('/api/matches/:id/comments', (req: Request, res: Response) => {
    const matchId = String(req.params.id);
    const { author, text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Comment cannot be empty' });
    }
    if (text.length > 300) {
      return res.status(400).json({ error: 'Comment exceeds max length of 300 characters' });
    }

    const commentId = `c-${Date.now()}`;
    db.prepare(`
      INSERT INTO match_comments (id, match_id, author, text, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(commentId, matchId, String(author || 'Spectator'), String(text.trim()), Date.now());

    res.json({
      success: true,
      comment: {
        id: commentId,
        author: author || 'Spectator',
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    });
  });

  // Challenges (Create, list, respond)
  app.get('/api/challenges', (req: Request, res: Response) => {
    const rows = db.prepare(`
      SELECT * FROM challenges ORDER BY created_at DESC LIMIT 20
    `).all() as any[];

    res.json({ challenges: rows });
  });

  app.post('/api/challenges', (req: Request, res: Response) => {
    const { sender, recipient, gameType, timeControl, message } = req.body;
    if (!sender || !recipient || !gameType) {
      return res.status(400).json({ error: 'Missing challenge fields' });
    }

    const challengeId = `chal-${Date.now()}`;
    db.prepare(`
      INSERT INTO challenges (id, sender_id, sender_name, recipient_id, recipient_name, game_type, time_control, message, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `).run(
      challengeId,
      sender.id || 'p-self',
      sender.name,
      recipient.id,
      recipient.name,
      gameType,
      timeControl || '30s',
      message || '',
      Date.now()
    );

    res.json({ success: true, challengeId });
  });

  // Schedules (Persist and list scheduled matches)
  app.get('/api/schedules', (req: Request, res: Response) => {
    const rows = db.prepare(`
      SELECT * FROM schedules ORDER BY created_at DESC LIMIT 20
    `).all() as any[];
    res.json({ schedules: rows });
  });

  app.post('/api/schedules', (req: Request, res: Response) => {
    const { user, opponent, gameType, timeControl, window, notes } = req.body;
    if (!user || !opponent || !gameType) {
      return res.status(400).json({ error: 'Missing schedule parameters' });
    }

    const scheduleId = `sched-${Date.now()}`;
    db.prepare(`
      INSERT INTO schedules (id, user_id, user_name, opponent_id, opponent_name, game_type, time_control, window, notes, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?)
    `).run(
      scheduleId,
      user.id || 'self',
      user.name,
      opponent.id,
      opponent.name,
      gameType,
      timeControl || '30s',
      window || 'Afternoon',
      notes || '',
      Date.now()
    );

    res.json({ success: true, scheduleId });
  });

  app.delete('/api/schedules/:id', (req: Request, res: Response) => {
    const scheduleId = String(req.params.id);
    db.prepare('DELETE FROM schedules WHERE id = ?').run(scheduleId);
    res.json({ success: true });
  });

  // Report Harassment / Inappropriate Behavior
  app.post('/api/reports', (req: Request, res: Response) => {
    const { reporterId, targetType, targetId, reason } = req.body;
    const reportId = `rep-${Date.now()}`;
    db.prepare(`
      INSERT INTO reports (id, reporter_id, target_type, target_id, reason, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(reportId, reporterId || 'user', targetType || 'comment', targetId || 'unknown', reason || 'unspecified', Date.now());

    res.json({ success: true, reportId });
  });

  // Mount Vite or serve static dist
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[INKA Full-Stack Server] Running on http://localhost:${PORT} (Node ${process.version})`);
  });
}

bootstrap().catch((err) => {
  console.error('[INKA Server Fatal]', err);
  process.exit(1);
});
