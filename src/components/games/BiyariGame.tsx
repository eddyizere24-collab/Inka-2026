import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Award, Target, RotateCcw } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { SettlementBar } from './SettlementBar';
import { calculateBiyariAdvantage } from '../../utils/settlement';
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
  const { currentMatch, updateMatchAdvantage, settleMatch, setCurrentMatch } = usePlatform();
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
  const [isShooting, setIsShooting] = useState<boolean>(false);
  const [ballsMoving, setBallsMoving] = useState<boolean>(false);

  // Potted counts
  const [pottedA, setPottedA] = useState<number>(0); // solids for A
  const [pottedB, setPottedB] = useState<number>(0); // stripes for B

  // Balls state
  const ballsRef = useRef<Ball[]>([]);

  // Initialize standard 8-ball rack
  const initBalls = useCallback(() => {
    const list: Ball[] = [];

    // Cue ball on left spot
    list.push({
      id: 0,
      x: TABLE_WIDTH * 0.28,
      y: TABLE_HEIGHT * 0.5,
      vx: 0,
      vy: 0,
      radius: BALL_RADIUS,
      color: '#FFFFFF',
      type: 'cue',
      isPotted: false,
      number: 0,
    });

    // 8-ball rack on right spot
    const rackStartX = TABLE_WIDTH * 0.7;
    const rackStartY = TABLE_HEIGHT * 0.5;
    const spacing = BALL_RADIUS * 2 + 1;

    // Simple 10-ball / 8-ball cluster for crisp browser canvas performance
    const ballConfigs = [
      { num: 1, type: 'solid' as const, color: '#eab308' },
      { num: 9, type: 'stripe' as const, color: '#eab308' },
      { num: 8, type: 'eight' as const, color: '#111827' },
      { num: 2, type: 'solid' as const, color: '#3b82f6' },
      { num: 10, type: 'stripe' as const, color: '#3b82f6' },
      { num: 3, type: 'solid' as const, color: '#ef4444' },
      { num: 11, type: 'stripe' as const, color: '#ef4444' },
      { num: 4, type: 'solid' as const, color: '#8b5cf6' },
      { num: 12, type: 'stripe' as const, color: '#8b5cf6' },
      { num: 5, type: 'solid' as const, color: '#f97316' },
    ];

    let configIdx = 0;
    for (let col = 0; col < 4; col++) {
      const colX = rackStartX + col * (spacing * 0.866);
      const colStartY = rackStartY - (col * spacing) / 2;
      for (let row = 0; row <= col; row++) {
        if (configIdx < ballConfigs.length) {
          const cfg = ballConfigs[configIdx++];
          list.push({
            id: cfg.num,
            x: colX,
            y: colStartY + row * spacing,
            vx: 0,
            vy: 0,
            radius: BALL_RADIUS,
            color: cfg.color,
            type: cfg.type,
            isPotted: false,
            number: cfg.num,
          });
        }
      }
    }

    ballsRef.current = list;
    setPottedA(0);
    setPottedB(0);
  }, []);

  useEffect(() => {
    initBalls();
  }, [initBalls]);

  // Update advantage w whenever balls are potted
  useEffect(() => {
    const { leader, w } = calculateBiyariAdvantage(pottedA, pottedB);
    updateMatchAdvantage(leader, w);
  }, [pottedA, pottedB, updateMatchAdvantage]);

  // Main canvas animation and physics engine
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updatePhysics = () => {
      const balls = ballsRef.current;
      let anyMoving = false;

      // Update positions & friction
      for (const b of balls) {
        if (b.isPotted) continue;

        b.x += b.vx;
        b.y += b.vy;

        // Table felt friction deceleration
        b.vx *= 0.985;
        b.vy *= 0.985;

        if (Math.hypot(b.vx, b.vy) < 0.05) {
          b.vx = 0;
          b.vy = 0;
        } else {
          anyMoving = true;
        }

        // Cushion bounce
        const minX = CUSHION + b.radius;
        const maxX = TABLE_WIDTH - CUSHION - b.radius;
        const minY = CUSHION + b.radius;
        const maxY = TABLE_HEIGHT - CUSHION - b.radius;

        if (b.x < minX) {
          b.x = minX;
          b.vx = -b.vx * 0.8;
          sounds.playBilliardStrike();
        } else if (b.x > maxX) {
          b.x = maxX;
          b.vx = -b.vx * 0.8;
          sounds.playBilliardStrike();
        }

        if (b.y < minY) {
          b.y = minY;
          b.vy = -b.vy * 0.8;
          sounds.playBilliardStrike();
        } else if (b.y > maxY) {
          b.y = maxY;
          b.vy = -b.vy * 0.8;
          sounds.playBilliardStrike();
        }

        // Pocket check
        for (const p of pockets) {
          const dist = Math.hypot(b.x - p.x, b.y - p.y);
          if (dist < POCKET_RADIUS) {
            b.isPotted = true;
            b.vx = 0;
            b.vy = 0;
            sounds.playPocketDrop();

            if (b.type === 'cue') {
              // Scratch: respawn cue ball after stop
              setTimeout(() => {
                b.x = TABLE_WIDTH * 0.28;
                b.y = TABLE_HEIGHT * 0.5;
                b.isPotted = false;
              }, 600);
            } else if (b.type === 'eight') {
              // 8-ball potted: whoever potted it decisively settles or scratches
              settleMatch(`8-Ball legally potted by ${turn === 'A' ? currentMatch?.playerA.name : currentMatch?.playerB.name}! Decisive Win.`);
            } else if (b.type === 'solid') {
              setPottedA((prev) => prev + 1);
            } else if (b.type === 'stripe') {
              setPottedB((prev) => prev + 1);
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
            // Normal & Tangent vectors
            const nx = dx / dist;
            const ny = dy / dist;

            // Separate overlapping balls
            const overlap = (minDist - dist) / 2;
            b1.x -= nx * overlap;
            b1.y -= ny * overlap;
            b2.x += nx * overlap;
            b2.y += ny * overlap;

            // Velocities along normal
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
      // Clear table
      ctx.clearRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);

      // Wooden Table Rails
      ctx.fillStyle = '#3a2012';
      ctx.beginPath();
      ctx.roundRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT, 16);
      ctx.fill();

      // Green Felt Bed
      ctx.fillStyle = '#0b5336';
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
        ctx.fillStyle = '#111827';
        ctx.beginPath();
        ctx.arc(p.x, p.y, POCKET_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2d180b';
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
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
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

        // Inner ring for stripes
        if (b.type === 'stripe') {
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        // Shading / 3D highlight
        ctx.beginPath();
        ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();

        // 8-ball marker
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
  }, [pockets, ballsMoving, aimAngle, shotPower, currentMatch?.status, currentMatch?.playerA.name, currentMatch?.playerB.name, settleMatch, turn]);

  // Handle aiming on mouse move or touch
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
    sounds.playBilliardStrike();

    // Alternate turn
    setTurn((prev) => (prev === 'A' ? 'B' : 'A'));
  };

  if (!currentMatch) return null;

  return (
    <div className="space-y-6">
      <SettlementBar
        match={currentMatch}
        turn={turn}
        onStop={() => settleMatch(`Voluntary stop by ${currentMatch.playerA.name}`)}
        onTimeout={() => sounds.playInkaChime()}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Billiard Table View */}
        <div className="lg:col-span-3 flex flex-col items-center">
          <div className="w-full max-w-2xl flex items-center justify-between mb-3 px-1 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200">Biyari: Eight-Ball Pool</span>
              <span className="text-slate-500">·</span>
              <span>Aim cursor over table & adjust shot power</span>
            </div>
            <button
              onClick={initBalls}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Rack Balls</span>
            </button>
          </div>

          {/* Billiard Table Canvas */}
          <div className="p-3 bg-[#1a0f08] border-4 border-[#412716] rounded-2xl shadow-2xl overflow-hidden max-w-full">
            <canvas
              ref={canvasRef}
              width={TABLE_WIDTH}
              height={TABLE_HEIGHT}
              onMouseMove={handleMouseMove}
              onClick={executeShot}
              className="cursor-crosshair rounded-lg block max-w-full h-auto"
            />
          </div>

          {/* Controls Bar: Power meter and Take Shot */}
          <div className="mt-4 w-full max-w-2xl p-4 bg-[#141a22] border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-[200px]">
              <Target className="w-4 h-4 text-amber-400 shrink-0" />
              <label className="text-xs text-slate-300 whitespace-nowrap">Cue Power:</label>
              <input
                type="range"
                min="10"
                max="100"
                value={shotPower}
                onChange={(e) => setShotPower(parseInt(e.target.value))}
                disabled={ballsMoving}
                className="w-full accent-amber-500 h-2 bg-slate-800 rounded cursor-pointer"
              />
              <span className="text-xs font-mono text-amber-400 w-10 text-right">{shotPower}%</span>
            </div>

            <button
              type="button"
              onClick={executeShot}
              disabled={ballsMoving || currentMatch.status !== 'playing'}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-40 text-white font-semibold text-xs rounded-xl shadow-lg shadow-amber-950 transition-all cursor-pointer whitespace-nowrap"
            >
              {ballsMoving ? 'Balls Rolling...' : 'Strike Cue Ball'}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="p-4 bg-[#141a22] border border-slate-800 rounded-xl space-y-3">
            <h4 className="text-sm font-bold text-slate-200 font-display">
              Biyari Potted Tracker
            </h4>
            <div className="text-xs text-slate-400 space-y-2">
              <div className="flex justify-between items-center p-2 bg-[#0e131a] rounded">
                <span>{currentMatch.playerA.name} (Solids):</span>
                <span className="font-mono font-bold text-amber-300">{pottedA} / 5</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-[#0e131a] rounded">
                <span>{currentMatch.playerB.name} (Stripes):</span>
                <span className="font-mono font-bold text-blue-300">{pottedB} / 5</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                Advantage increases with each ball potted towards the 8-ball endgame.
              </p>
            </div>
          </div>

          {currentMatch.status === 'settled' && (
            <div className="p-4 bg-emerald-950/30 border border-emerald-800/50 rounded-xl text-emerald-200 space-y-3">
              <div className="flex items-center gap-2 font-display font-bold text-sm">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Match Settled</span>
              </div>
              <p className="text-xs text-slate-300">{currentMatch.settlementReason}</p>
              <div className="p-3 bg-[#10141a] rounded-lg text-xs font-mono text-amber-300 flex justify-between">
                <span>Final Inka Received:</span>
                <strong className="text-white">{currentMatch.holdingA.toFixed(2)} Inka</strong>
              </div>
              <button
                onClick={() => setCurrentMatch(null)}
                className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
              >
                Return to Lobby
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
