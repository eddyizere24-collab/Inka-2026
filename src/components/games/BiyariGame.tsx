import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Award, Target, RotateCcw, ShieldCheck } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { GameHud } from './GameHud';
import { calculateBiyariAdvantage } from '../../utils/matchScoring';
import { sounds } from '../../utils/sound';

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  type: 'cue' | 'solid' | 'stripe' | 'eight';
  isPotted: boolean;
  number: number;
}

export const BiyariGame: React.FC = () => {
  const { currentMatch, updateMatchScore, concludeMatch, setCurrentMatch, t } = usePlatform();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Table dimensions (standard 2:1 aspect ratio)
  const TABLE_WIDTH = 640;
  const TABLE_HEIGHT = 340;
  const CUSHION = 24;
  const BALL_RADIUS = 9;

  // Pocket coordinates
  const pockets = [
    { x: CUSHION + 4, y: CUSHION + 4 }, // Top-left
    { x: TABLE_WIDTH / 2, y: CUSHION }, // Top-center
    { x: TABLE_WIDTH - CUSHION - 4, y: CUSHION + 4 }, // Top-right
    { x: CUSHION + 4, y: TABLE_HEIGHT - CUSHION - 4 }, // Bottom-left
    { x: TABLE_WIDTH / 2, y: TABLE_HEIGHT - CUSHION }, // Bottom-center
    { x: TABLE_WIDTH - CUSHION - 4, y: TABLE_HEIGHT - CUSHION - 4 }, // Bottom-right
  ];
  const POCKET_RADIUS = 18;

  const [turn, setTurn] = useState<'A' | 'B'>('A');
  const [aimAngle, setAimAngle] = useState<number>(0);
  const [shotPower, setShotPower] = useState<number>(45);
  const [ballsMoving, setBallsMoving] = useState<boolean>(false);

  // Potted counts
  const [pottedA, setPottedA] = useState<number>(0); // solids for Player A
  const [pottedB, setPottedB] = useState<number>(0); // stripes for Player B
  const pottedARef = useRef(0);
  const pottedBRef = useRef(0);
  const shotInProgressRef = useRef(false);
  const ownBallPottedThisShotRef = useRef(false);
  const cueBallScratchedThisShotRef = useRef(false);

  // Balls state
  const ballsRef = useRef<Ball[]>([]);

  // Initialize standard 8-ball rack
  const initBalls = useCallback(() => {
    const list: Ball[] = [];

    // Cue ball on left spot
    list.push({
      id: 0,
      x: TABLE_WIDTH * 0.25,
      y: TABLE_HEIGHT / 2,
      vx: 0,
      vy: 0,
      radius: BALL_RADIUS,
      color: '#FFFFFF',
      type: 'cue',
      isPotted: false,
      number: 0,
    });

    // Triangle apex at 70% table width
    const startX = TABLE_WIDTH * 0.7;
    const startY = TABLE_HEIGHT / 2;
    const spacing = BALL_RADIUS * 2 + 1;

    // Standard 8-ball groups: seven solids, the 8-ball, and seven stripes.
    const ballDefs: { color: string; type: 'solid' | 'stripe' | 'eight'; num: number }[] = [
      { color: '#eab308', type: 'solid', num: 1 },
      { color: '#3b82f6', type: 'solid', num: 2 },
      { color: '#ef4444', type: 'solid', num: 3 },
      { color: '#a855f7', type: 'solid', num: 4 },
      { color: '#0f172a', type: 'eight', num: 8 },
      { color: '#f97316', type: 'solid', num: 5 },
      { color: '#ec4899', type: 'solid', num: 6 },
      { color: '#84cc16', type: 'solid', num: 7 },
      { color: '#10b981', type: 'stripe', num: 9 },
      { color: '#06b6d4', type: 'stripe', num: 10 },
      { color: '#ec4899', type: 'stripe', num: 11 },
      { color: '#84cc16', type: 'stripe', num: 12 },
      { color: '#f97316', type: 'stripe', num: 13 },
      { color: '#a855f7', type: 'stripe', num: 14 },
      { color: '#3b82f6', type: 'stripe', num: 15 },
    ];

    let bIdx = 0;
    for (let col = 0; col < 5; col++) {
      for (let row = 0; row <= col; row++) {
        if (bIdx >= ballDefs.length) break;
        const b = ballDefs[bIdx];
        const x = startX + col * (spacing * 0.866);
        const y = startY + (row - col / 2) * spacing;
        list.push({
          id: bIdx + 1,
          x,
          y,
          vx: 0,
          vy: 0,
          radius: BALL_RADIUS,
          color: b.color,
          type: b.type,
          isPotted: false,
          number: b.num,
        });
        bIdx++;
      }
    }

    ballsRef.current = list;
    pottedARef.current = 0;
    pottedBRef.current = 0;
    shotInProgressRef.current = false;
    ownBallPottedThisShotRef.current = false;
    cueBallScratchedThisShotRef.current = false;
    setPottedA(0);
    setPottedB(0);
    setBallsMoving(false);
  }, [TABLE_WIDTH, TABLE_HEIGHT, BALL_RADIUS]);

  // Set initial balls
  useEffect(() => {
    initBalls();
  }, [initBalls]);

  // Canvas physics and rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const updatePhysics = () => {
      const balls = ballsRef.current;
      let anyMoving = false;

      for (const b of balls) {
        if (b.isPotted) continue;

        // Apply velocity
        b.x += b.vx;
        b.y += b.vy;

        // Friction
        b.vx *= 0.985;
        b.vy *= 0.985;

        // Stop micro-movements
        if (Math.abs(b.vx) < 0.05) b.vx = 0;
        if (Math.abs(b.vy) < 0.05) b.vy = 0;

        if (b.vx !== 0 || b.vy !== 0) anyMoving = true;

        // Cushion bounce (boundaries)
        const minX = CUSHION + b.radius;
        const maxX = TABLE_WIDTH - CUSHION - b.radius;
        const minY = CUSHION + b.radius;
        const maxY = TABLE_HEIGHT - CUSHION - b.radius;

        if (b.x < minX) {
          b.x = minX;
          b.vx *= -0.85;
          sounds.playBilliardStrike();
        } else if (b.x > maxX) {
          b.x = maxX;
          b.vx *= -0.85;
          sounds.playBilliardStrike();
        }

        if (b.y < minY) {
          b.y = minY;
          b.vy *= -0.85;
          sounds.playBilliardStrike();
        } else if (b.y > maxY) {
          b.y = maxY;
          b.vy *= -0.85;
          sounds.playBilliardStrike();
        }

        // Pocket detection
        for (const p of pockets) {
          const dist = Math.hypot(b.x - p.x, b.y - p.y);
          if (dist < POCKET_RADIUS && !b.isPotted) {
            b.isPotted = true;
            b.vx = 0;
            b.vy = 0;
            sounds.playPocketDrop();

            if (b.type === 'cue') {
              cueBallScratchedThisShotRef.current = true;
              // Scratch: respawn cue ball on head spot
              setTimeout(() => {
                b.x = TABLE_WIDTH * 0.25;
                b.y = TABLE_HEIGHT / 2;
                b.vx = 0;
                b.vy = 0;
                b.isPotted = false;
              }, 600);
            } else if (b.type === 'eight') {
              const hasClearedOwnGroup = turn === 'A' ? pottedARef.current >= 7 : pottedBRef.current >= 7;
              const winner = hasClearedOwnGroup ? turn : turn === 'A' ? 'B' : 'A';
              concludeMatch(
                t.biyariEightBallVictoryReason.replace('{player}', winner === 'A' ? currentMatch?.playerA.name ?? '' : currentMatch?.playerB.name ?? ''),
                false,
                winner
              );
            } else if (b.type === 'solid') {
              const nextA = pottedARef.current + 1;
              pottedARef.current = nextA;
              setPottedA(nextA);
              if (turn === 'A') ownBallPottedThisShotRef.current = true;
              updateMatchScore(calculateBiyariAdvantage(nextA, pottedBRef.current));
            } else if (b.type === 'stripe') {
              const nextB = pottedBRef.current + 1;
              pottedBRef.current = nextB;
              setPottedB(nextB);
              if (turn === 'B') ownBallPottedThisShotRef.current = true;
              updateMatchScore(calculateBiyariAdvantage(pottedARef.current, nextB));
            }
          }
        }
      }

      // Ball-to-ball elastic collision resolution
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const b1 = balls[i];
          const b2 = balls[j];
          if (b1.isPotted || b2.isPotted) continue;

          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const dist = Math.hypot(dx, dy);
          const minDist = b1.radius + b2.radius;

          if (dist < minDist && dist > 0) {
            const nx = dx / dist;
            const ny = dy / dist;

            const overlap = (minDist - dist) / 2;
            b1.x -= nx * overlap;
            b1.y -= ny * overlap;
            b2.x += nx * overlap;
            b2.y += ny * overlap;

            const kx = b1.vx - b2.vx;
            const ky = b1.vy - b2.vy;
            const p = 2 * (nx * kx + ny * ky) / 2;

            b1.vx -= p * nx * 0.9;
            b1.vy -= p * ny * 0.9;
            b2.vx += p * nx * 0.9;
            b2.vy += p * ny * 0.9;

            sounds.playBilliardStrike();
          }
        }
      }

      setBallsMoving(anyMoving);
    };

    const render = () => {
      ctx.clearRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);

      // Wooden Table Rails
      ctx.fillStyle = '#1e2838';
      ctx.beginPath();
      ctx.roundRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT, 16);
      ctx.fill();

      // Green Felt Bed
      ctx.fillStyle = '#064e3b';
      ctx.beginPath();
      ctx.roundRect(
        CUSHION,
        CUSHION,
        TABLE_WIDTH - CUSHION * 2,
        TABLE_HEIGHT - CUSHION * 2,
        8
      );
      ctx.fill();

      // Draw Pockets
      for (const p of pockets) {
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(p.x, p.y, POCKET_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Draw Aiming Line & Cue Stick if cue ball is stationary
      const cueBall = ballsRef.current.find((b) => b.type === 'cue' && !b.isPotted);
      if (cueBall && !ballsMoving && currentMatch?.status === 'playing') {
        const aimLength = 120;
        const targetX = cueBall.x + Math.cos(aimAngle) * aimLength;
        const targetY = cueBall.y + Math.sin(aimAngle) * aimLength;

        // Dashed trajectory guideline
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cueBall.x, cueBall.y);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Cue Stick
        const cueDistance = 22 + shotPower * 0.4;
        const cueStartX = cueBall.x - Math.cos(aimAngle) * (cueDistance + 140);
        const cueStartY = cueBall.y - Math.sin(aimAngle) * (cueDistance + 140);
        const cueTipX = cueBall.x - Math.cos(aimAngle) * cueDistance;
        const cueTipY = cueBall.y - Math.sin(aimAngle) * cueDistance;

        ctx.strokeStyle = '#d4a373';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cueStartX, cueStartY);
        ctx.lineTo(cueTipX, cueTipY);
        ctx.stroke();
      }

      // Draw Balls
      for (const b of ballsRef.current) {
        if (b.isPotted) continue;

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();

        if (b.type === 'stripe') {
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();

        if (b.type === 'eight') {
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('8', b.x, b.y);
        }
      }
    };

    const loop = () => {
      updatePhysics();
      render();
      animId = requestAnimationFrame(loop);
    };

    loop();

    return () => cancelAnimationFrame(animId);
  }, [pockets, ballsMoving, aimAngle, shotPower, currentMatch?.status, currentMatch?.playerA.name, currentMatch?.playerB.name, concludeMatch, turn, pottedA, pottedB, updateMatchScore]);

  useEffect(() => {
    if (ballsMoving || !shotInProgressRef.current) return;
    shotInProgressRef.current = false;

    if (currentMatch?.status === 'playing') {
      if (cueBallScratchedThisShotRef.current || !ownBallPottedThisShotRef.current) {
        setTurn((prev) => (prev === 'A' ? 'B' : 'A'));
      }
    }

    ownBallPottedThisShotRef.current = false;
    cueBallScratchedThisShotRef.current = false;
  }, [ballsMoving, currentMatch?.status]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (ballsMoving) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * TABLE_WIDTH;
    const mouseY = ((e.clientY - rect.top) / rect.height) * TABLE_HEIGHT;

    const cueBall = ballsRef.current.find((b) => b.type === 'cue' && !b.isPotted);
    if (cueBall) {
      const angle = Math.atan2(mouseY - cueBall.y, mouseX - cueBall.x);
      setAimAngle(angle);
    }
  };

  const executeShot = () => {
    if (ballsMoving || currentMatch?.status !== 'playing') return;
    const cueBall = ballsRef.current.find((b) => b.type === 'cue' && !b.isPotted);
    if (!cueBall) return;

    const speed = (shotPower / 100) * 16;
    cueBall.vx = Math.cos(aimAngle) * speed;
    cueBall.vy = Math.sin(aimAngle) * speed;
    shotInProgressRef.current = true;
    ownBallPottedThisShotRef.current = false;
    cueBallScratchedThisShotRef.current = false;
    setBallsMoving(true);
    sounds.playBilliardStrike();
  };

  if (!currentMatch) return null;

  return (
    <div className="space-y-6">
      <GameHud
        match={currentMatch}
        turn={turn}
        customStatsA={
          <span className="text-emerald-400 font-mono">
            {t.biyari_potted}: {pottedA}/7
          </span>
        }
        customStatsB={
          <span className="text-cyan-400 font-mono">
            {t.biyari_potted}: {pottedB}/7
          </span>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Billiard Table View */}
        <div className="lg:col-span-3 flex flex-col items-center">
          <div className="w-full max-w-2xl flex items-center justify-between mb-3 px-1 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200">{t.biyariTitle}</span>
              <span className="text-slate-500">·</span>
              <span>{t.aimShotInstruction}</span>
            </div>
            <button
              onClick={initBalls}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t.rackBalls}</span>
            </button>
          </div>

          {/* Billiard Table Canvas */}
          <div className="p-3 bg-[#131a24] border-4 border-[#243144] rounded-2xl shadow-2xl overflow-hidden max-w-full">
            <canvas
              ref={canvasRef}
              width={TABLE_WIDTH}
              height={TABLE_HEIGHT}
              onMouseMove={handleMouseMove}
              onClick={executeShot}
              className="cursor-crosshair rounded-lg block max-w-full h-auto"
            />
          </div>

          {/* Controls Bar */}
          <div className="mt-4 w-full max-w-2xl p-4 bg-[#141a24] border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-[200px]">
              <Target className="w-4 h-4 text-emerald-400 shrink-0" />
              <label className="text-xs text-slate-300 whitespace-nowrap">{t.cuePowerLabel}:</label>
              <input
                type="range"
                min="10"
                max="100"
                value={shotPower}
                onChange={(e) => setShotPower(parseInt(e.target.value))}
                disabled={ballsMoving}
                className="w-full accent-emerald-500 h-2 bg-slate-800 rounded cursor-pointer"
              />
              <span className="text-xs font-mono text-emerald-400 w-10 text-right">{shotPower}%</span>
            </div>

            <button
              type="button"
              onClick={executeShot}
              disabled={ballsMoving || currentMatch.status !== 'playing'}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-semibold text-xs rounded-xl shadow-lg transition-all cursor-pointer whitespace-nowrap"
            >
              {ballsMoving ? t.ballsRollingLabel : t.strikeCueBall}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="p-4 bg-[#141a24] border border-slate-800 rounded-xl space-y-3">
            <h4 className="text-sm font-bold text-slate-200 font-display flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t.biyariTitle}</span>
            </h4>
            <div className="text-xs text-slate-400 space-y-2">
              <div className="flex justify-between items-center p-2 bg-[#0e131b] rounded">
                <span>{currentMatch.playerA.name} ({t.playerASolidsPottedLabel}):</span>
                <span className="font-mono font-bold text-emerald-400">{pottedA} / 5</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-[#0e131b] rounded">
                <span>{currentMatch.playerB.name} ({t.playerBStripesPottedLabel}):</span>
                <span className="font-mono font-bold text-cyan-400">{pottedB} / 5</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                {t.biyariScoringHelp}
              </p>
            </div>
          </div>

          {currentMatch.status === 'concluded' && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-700/60 rounded-xl text-emerald-200 space-y-3">
              <div className="flex items-center gap-2 font-display font-bold text-sm">
                <Award className="w-5 h-5 text-emerald-400" />
                <span>{t.matchConcluded}</span>
              </div>
              <p className="text-xs text-slate-300">{currentMatch.concludeReason}</p>
              <div className="p-3 bg-[#10151d] rounded-lg text-xs font-mono text-emerald-300 flex justify-between">
                <span>{t.honorPointsAwarded}:</span>
                <strong className="text-white">+10 {t.honorPointsLabel}</strong>
              </div>
              <button
                onClick={() => setCurrentMatch(null)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors cursor-pointer"
              >
                {t.backToLobby}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
