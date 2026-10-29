import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Award,
  Target,
  RotateCcw,
  ShieldCheck,
  Zap,
  Trophy,
  Sparkles,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Move,
} from 'lucide-react';
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
  // Visual 3D rotation tracking
  rotX: number;
  rotY: number;
  // Sinking animation progress: 1.0 down to 0.0
  sinkProgress?: number;
}

interface Pocket {
  id: number;
  x: number;
  y: number;
  name: string;
  isSide: boolean;
}

export const BiyariGame: React.FC = () => {
  const { currentMatch, updateMatchScore, concludeMatch, setCurrentMatch, t } = usePlatform();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Table dimensions based on professional 2:1 WPA ratio
  const TABLE_WIDTH = 700;
  const TABLE_HEIGHT = 370;
  const CUSHION = 28;
  const BALL_RADIUS = 9.8;

  // 6 Pockets with authentic table geometry
  const pockets: Pocket[] = [
    { id: 0, x: CUSHION + 4, y: CUSHION + 4, name: t.pocketCornerTopLeft, isSide: false },
    { id: 1, x: TABLE_WIDTH / 2, y: CUSHION - 1, name: t.pocketCenterTop, isSide: true },
    { id: 2, x: TABLE_WIDTH - CUSHION - 4, y: CUSHION + 4, name: t.pocketCornerTopRight, isSide: false },
    { id: 3, x: CUSHION + 4, y: TABLE_HEIGHT - CUSHION - 4, name: t.pocketCornerBottomLeft, isSide: false },
    { id: 4, x: TABLE_WIDTH / 2, y: TABLE_HEIGHT - CUSHION + 1, name: t.pocketCenterBottom, isSide: true },
    { id: 5, x: TABLE_WIDTH - CUSHION - 4, y: TABLE_HEIGHT - CUSHION - 4, name: t.pocketCornerBottomRight, isSide: false },
  ];
  const POCKET_RADIUS = 20;

  // Turn and Mode State
  const [turn, setTurn] = useState<'A' | 'B'>('A');
  const [isPassAndPlay, setIsPassAndPlay] = useState<boolean>(false);
  const [assignedGroups, setAssignedGroups] = useState<{ A: 'solid' | 'stripe' | null; B: 'solid' | 'stripe' | null }>({
    A: null,
    B: null,
  });

  // Aiming, Power and Spin (English)
  const [aimAngle, setAimAngle] = useState<number>(0);
  const [shotPower, setShotPower] = useState<number>(55);
  const [ballsMoving, setBallsMoving] = useState<boolean>(false);
  // Spin offset: x: -1 to 1 (left/right english), y: -1 to 1 (-1 = draw/backspin, +1 = follow/topspin)
  const [spinOffset, setSpinOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Ball in Hand (after scratch)
  const [ballInHand, setBallInHand] = useState<boolean>(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  // Called Pocket for 8-ball
  const [calledPocketId, setCalledPocketId] = useState<number | null>(null);

  // Potted counts & Match Statistics
  const [pottedA, setPottedA] = useState<number>(0);
  const [pottedB, setPottedB] = useState<number>(0);
  const [totalShotsA, setTotalShotsA] = useState<number>(0);
  const [totalShotsB, setTotalShotsB] = useState<number>(0);
  const [successfulShotsA, setSuccessfulShotsA] = useState<number>(0);
  const [successfulShotsB, setSuccessfulShotsB] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>(t.biyariAimCueBallPrompt);

  // Championship Victory Ceremony State
  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);
  const [victoryDetails, setVictoryDetails] = useState<{
    winner: 'A' | 'B';
    title: string;
    description: string;
    isCleanWin: boolean;
    reasonCode: 'eight_in_called' | 'eight_scratch' | 'eight_premature';
  } | null>(null);

  // Balls ref
  const ballsRef = useRef<Ball[]>([]);
  const shotInProgressRef = useRef(false);
  const ownBallPottedThisShotRef = useRef(false);
  const cueBallScratchedThisShotRef = useRef(false);
  const firstContactBallRef = useRef<Ball | null>(null);
  const eightBallPottedThisShotRef = useRef<{ pocketId: number } | null>(null);

  // Initialize standard 8-ball triangle rack
  const initBalls = useCallback(() => {
    const list: Ball[] = [];

    // Cue ball on head spot
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
      rotX: 0,
      rotY: 0,
    });

    // Triangle apex at foot spot (68% of table width)
    const startX = TABLE_WIDTH * 0.68;
    const startY = TABLE_HEIGHT / 2;
    const spacing = BALL_RADIUS * 2 + 0.6;

    // Authentic 8-ball rack: 8-ball in center (row 2), bottom corners are 1 solid & 1 stripe
    const rackLayout: { color: string; type: 'solid' | 'stripe' | 'eight'; num: number }[] = [
      { color: '#eab308', type: 'solid', num: 1 }, // row 0: apex
      { color: '#2563eb', type: 'stripe', num: 10 }, // row 1
      { color: '#dc2626', type: 'solid', num: 3 },
      { color: '#7c3aed', type: 'solid', num: 4 }, // row 2
      { color: '#0b0f19', type: 'eight', num: 8 }, // 8-ball in center!
      { color: '#ea580c', type: 'stripe', num: 13 },
      { color: '#16a34a', type: 'stripe', num: 14 }, // row 3
      { color: '#854d0e', type: 'solid', num: 7 },
      { color: '#eab308', type: 'stripe', num: 9 },
      { color: '#2563eb', type: 'solid', num: 2 },
      { color: '#dc2626', type: 'stripe', num: 11 }, // row 4: base
      { color: '#7c3aed', type: 'stripe', num: 12 },
      { color: '#ea580c', type: 'solid', num: 5 },
      { color: '#854d0e', type: 'stripe', num: 15 },
      { color: '#16a34a', type: 'solid', num: 6 },
    ];

    let bIdx = 0;
    for (let col = 0; col < 5; col++) {
      for (let row = 0; row <= col; row++) {
        if (bIdx >= rackLayout.length) break;
        const b = rackLayout[bIdx];
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
          rotX: 0,
          rotY: 0,
        });
        bIdx++;
      }
    }

    ballsRef.current = list;
    setTurn('A');
    setAssignedGroups({ A: null, B: null });
    setPottedA(0);
    setPottedB(0);
    setTotalShotsA(0);
    setTotalShotsB(0);
    setSuccessfulShotsA(0);
    setSuccessfulShotsB(0);
    setAimAngle(0);
    setShotPower(55);
    setSpinOffset({ x: 0, y: 0 });
    setBallInHand(false);
    setCalledPocketId(null);
    setBallsMoving(false);
    setShowVictoryModal(false);
    setVictoryDetails(null);
    setStatusMessage(t.biyariAimCueBallPrompt);
  }, [TABLE_WIDTH, TABLE_HEIGHT, BALL_RADIUS, t.biyariAimCueBallPrompt]);

  useEffect(() => {
    initBalls();
  }, [initBalls]);

  // Main Canvas Render & Deterministic Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    // Substepped physics simulation (4 sub-steps per frame = 240Hz physics)
    const updatePhysics = () => {
      const balls = ballsRef.current;
      const SUB_STEPS = 4;
      const DT = 1 / (60 * SUB_STEPS);
      let anyMoving = false;

      for (let step = 0; step < SUB_STEPS; step++) {
        // 1. Move balls & apply rolling/sliding friction
        for (const b of balls) {
          if (b.isPotted) {
            // Sinking animation into pocket
            if (b.sinkProgress !== undefined && b.sinkProgress > 0) {
              b.sinkProgress = Math.max(0, b.sinkProgress - DT * 3);
            }
            continue;
          }

          // Advance position
          b.x += b.vx * DT * 60;
          b.y += b.vy * DT * 60;

          // Update visual rotation based on velocity
          b.rotX += (b.vx * DT * 60) / b.radius;
          b.rotY += (b.vy * DT * 60) / b.radius;

          // Cloth friction: deceleration
          const speed = Math.hypot(b.vx, b.vy);
          if (speed > 0) {
            anyMoving = true;
            // Friction model: subtle transition from sliding to rolling resistance
            const frictionDecel = Math.max(0.015, speed * 0.012) * (DT * 60);
            const newSpeed = Math.max(0, speed - frictionDecel);
            if (newSpeed === 0) {
              b.vx = 0;
              b.vy = 0;
            } else {
              b.vx = (b.vx / speed) * newSpeed;
              b.vy = (b.vy / speed) * newSpeed;
            }
          }

          // Stop micro-movement jitter
          if (Math.abs(b.vx) < 0.03) b.vx = 0;
          if (Math.abs(b.vy) < 0.03) b.vy = 0;

          // 2. Cushion boundaries with elasticity & rubber damping
          const minX = CUSHION + b.radius;
          const maxX = TABLE_WIDTH - CUSHION - b.radius;
          const minY = CUSHION + b.radius;
          const maxY = TABLE_HEIGHT - CUSHION - b.radius;

          if (b.x < minX) {
            b.x = minX;
            b.vx = -b.vx * 0.84;
            sounds.playCushionBounce(Math.abs(b.vx));
          } else if (b.x > maxX) {
            b.x = maxX;
            b.vx = -b.vx * 0.84;
            sounds.playCushionBounce(Math.abs(b.vx));
          }

          if (b.y < minY) {
            b.y = minY;
            b.vy = -b.vy * 0.84;
            sounds.playCushionBounce(Math.abs(b.vy));
          } else if (b.y > maxY) {
            b.y = maxY;
            b.vy = -b.vy * 0.84;
            sounds.playCushionBounce(Math.abs(b.vy));
          }

          // 3. Pocket detection with entrance jaws
          for (const p of pockets) {
            const dist = Math.hypot(b.x - p.x, b.y - p.y);
            const pocketThreshold = p.isSide ? POCKET_RADIUS - 1 : POCKET_RADIUS;

            if (dist < pocketThreshold && !b.isPotted) {
              b.isPotted = true;
              b.sinkProgress = 1.0;
              b.vx = 0;
              b.vy = 0;
              sounds.playPocketDrop();

              if (b.type === 'cue') {
                cueBallScratchedThisShotRef.current = true;
                sounds.playFoulSound();
              } else if (b.type === 'eight') {
                eightBallPottedThisShotRef.current = { pocketId: p.id };
              } else {
                // Group ball potted
                if (b.type === 'solid') {
                  setPottedA((prev) => prev + 1);
                } else if (b.type === 'stripe') {
                  setPottedB((prev) => prev + 1);
                }
                ownBallPottedThisShotRef.current = true;
              }
            }
          }
        }

        // 4. Ball-to-ball elastic collision resolution (CCD impulse model)
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
              // Record first contact of cue ball for foul checking
              if (b1.type === 'cue' && !firstContactBallRef.current) {
                firstContactBallRef.current = b2;
              } else if (b2.type === 'cue' && !firstContactBallRef.current) {
                firstContactBallRef.current = b1;
              }

              const nx = dx / dist;
              const ny = dy / dist;

              // Overlap separation
              const overlap = (minDist - dist) / 2;
              b1.x -= nx * overlap;
              b1.y -= ny * overlap;
              b2.x += nx * overlap;
              b2.y += ny * overlap;

              // Normal and tangential velocities
              const kx = b1.vx - b2.vx;
              const ky = b1.vy - b2.vy;
              const vn = nx * kx + ny * ky;

              if (vn > 0) {
                const restitution = 0.95;
                const impulse = (1 + restitution) * (vn / 2);

                b1.vx -= impulse * nx;
                b1.vy -= impulse * ny;
                b2.vx += impulse * nx;
                b2.vy += impulse * ny;

                const impactSpeed = Math.hypot(kx, ky);
                sounds.playBallCollision(impactSpeed);
              }
            }
          }
        }
      }

      setBallsMoving(anyMoving);
    };

    const render = () => {
      ctx.clearRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);

      // 1. Luxury Mahogany Outer Wood Frame with 3D Bevels
      const woodGrad = ctx.createLinearGradient(0, 0, TABLE_WIDTH, TABLE_HEIGHT);
      woodGrad.addColorStop(0, '#2d1b11');
      woodGrad.addColorStop(0.5, '#1e1008');
      woodGrad.addColorStop(1, '#140a04');
      ctx.fillStyle = woodGrad;
      ctx.beginPath();
      ctx.roundRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT, 22);
      ctx.fill();

      // Outer Gold/Brass Accent Bevel
      ctx.strokeStyle = '#4e3321';
      ctx.lineWidth = 4;
      ctx.stroke();

      // 2. Mother-of-Pearl Diamond Sights along Rails (18 diamonds)
      const drawDiamond = (x: number, y: number) => {
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(x, y - 3.5);
        ctx.lineTo(x + 3.5, y);
        ctx.lineTo(x, y + 3.5);
        ctx.lineTo(x - 3.5, y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      };

      for (let i = 1; i <= 7; i++) {
        if (i === 4) continue; // center pocket
        const x = CUSHION + (i / 8) * (TABLE_WIDTH - CUSHION * 2);
        drawDiamond(x, CUSHION / 2);
        drawDiamond(x, TABLE_HEIGHT - CUSHION / 2);
      }
      for (let j = 1; j <= 3; j++) {
        if (j === 2) continue;
        const y = CUSHION + (j / 4) * (TABLE_HEIGHT - CUSHION * 2);
        drawDiamond(CUSHION / 2, y);
        drawDiamond(TABLE_WIDTH - CUSHION / 2, y);
      }

      // 3. Championship Emerald Baize Felt with Vignette & Shadow
      const feltGrad = ctx.createRadialGradient(
        TABLE_WIDTH / 2,
        TABLE_HEIGHT / 2,
        70,
        TABLE_WIDTH / 2,
        TABLE_HEIGHT / 2,
        TABLE_WIDTH / 1.5
      );
      feltGrad.addColorStop(0, '#0a6349');
      feltGrad.addColorStop(0.7, '#064e3b');
      feltGrad.addColorStop(1, '#023326');

      ctx.fillStyle = feltGrad;
      ctx.beginPath();
      ctx.roundRect(CUSHION, CUSHION, TABLE_WIDTH - CUSHION * 2, TABLE_HEIGHT - CUSHION * 2, 10);
      ctx.fill();

      // Cushion Nose Rubber Shadow
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Head string line & Foot spot marker
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(TABLE_WIDTH * 0.25, CUSHION);
      ctx.lineTo(TABLE_WIDTH * 0.25, TABLE_HEIGHT - CUSHION);
      ctx.stroke();

      // 4. Pockets with Brass Rim, Deep Drop Well & Called Pocket Highlight
      for (const p of pockets) {
        ctx.fillStyle = '#04070c';
        ctx.beginPath();
        ctx.arc(p.x, p.y, POCKET_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#b45309'; // Polished brass rim
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // If this pocket is called for the 8-ball, render a glowing target aura!
        if (calledPocketId === p.id) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, POCKET_RADIUS + 5, 0, Math.PI * 2);
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // 5. Active Cue Ball & Ghost-Ball Raycasting Trajectory
      const cueBall = ballsRef.current.find((b) => b.type === 'cue' && !b.isPotted);

      if (cueBall && !ballsMoving && !ballInHand && currentMatch?.status === 'playing') {
        const rayCos = Math.cos(aimAngle);
        const raySin = Math.sin(aimAngle);

        let closestHit: {
          ball: Ball;
          hitDist: number;
          ghostX: number;
          ghostY: number;
        } | null = null;

        for (const b of ballsRef.current) {
          if (b.type === 'cue' || b.isPotted) continue;

          const dx = b.x - cueBall.x;
          const dy = b.y - cueBall.y;
          const dot = dx * rayCos + dy * raySin;
          if (dot <= 0) continue;

          const perpDistSq = dx * dx + dy * dy - dot * dot;
          const collisionDist = BALL_RADIUS * 2;

          if (perpDistSq < collisionDist * collisionDist) {
            const delta = Math.sqrt(collisionDist * collisionDist - perpDistSq);
            const hitDist = dot - delta;

            if (hitDist > 0 && (!closestHit || hitDist < closestHit.hitDist)) {
              closestHit = {
                ball: b,
                hitDist,
                ghostX: cueBall.x + rayCos * hitDist,
                ghostY: cueBall.y + raySin * hitDist,
              };
            }
          }
        }

        // Cue Trajectory Line
        const targetDist = closestHit ? closestHit.hitDist : 260;
        const endLineX = cueBall.x + rayCos * targetDist;
        const endLineY = cueBall.y + raySin * targetDist;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(cueBall.x, cueBall.y);
        ctx.lineTo(endLineX, endLineY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ghost Ball & Precision Deflection Vectors
        if (closestHit) {
          const { ball: targetBall, ghostX, ghostY } = closestHit;

          // Ghost Ball Outline
          ctx.beginPath();
          ctx.arc(ghostX, ghostY, BALL_RADIUS, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
          ctx.fill();
          ctx.setLineDash([]);

          // Object Ball Aim Vector
          const normDx = targetBall.x - ghostX;
          const normDy = targetBall.y - ghostY;
          const normDist = Math.hypot(normDx, normDy);
          if (normDist > 0) {
            const nx = normDx / normDist;
            const ny = normDy / normDist;

            ctx.strokeStyle = '#34d399';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(targetBall.x, targetBall.y);
            ctx.lineTo(targetBall.x + nx * 75, targetBall.y + ny * 75);
            ctx.stroke();

            // Tangent Line (with spin influence)
            const tx = -ny;
            const ty = nx;
            const spinDrawFactor = -spinOffset.y * 30; // backspin pulls backward!
            const tangentLength = 40 + spinDrawFactor;

            ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)';
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(ghostX, ghostY);
            ctx.lineTo(ghostX + tx * tangentLength - rayCos * (spinOffset.y * 20), ghostY + ty * tangentLength - raySin * (spinOffset.y * 20));
            ctx.stroke();
          }
        }

        // Tapered Tournament Cue Stick with Pull-back Animation
        const pullBack = 22 + (shotPower / 100) * 42;
        const cueLength = 175;
        const cueStartX = cueBall.x - rayCos * (pullBack + cueLength);
        const cueStartY = cueBall.y - raySin * (pullBack + cueLength);
        const cueTipX = cueBall.x - rayCos * pullBack;
        const cueTipY = cueBall.y - raySin * pullBack;

        // Wood Cue Shaft
        ctx.strokeStyle = '#d4a373';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cueStartX, cueStartY);
        ctx.lineTo(cueTipX, cueTipY);
        ctx.stroke();

        // Blue Chalked Leather Tip
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(cueTipX, cueTipY);
        ctx.lineTo(cueBall.x - rayCos * (pullBack - 3), cueBall.y - raySin * (pullBack - 3));
        ctx.stroke();
      }

      // 6. Draw 3D Photorealistic Balls with Specular Sheen & Rotation
      for (const b of ballsRef.current) {
        if (b.isPotted && (b.sinkProgress === undefined || b.sinkProgress <= 0)) continue;

        const currentRadius = b.radius * (b.sinkProgress !== undefined ? b.sinkProgress : 1.0);

        // Cast shadow on felt
        ctx.beginPath();
        ctx.arc(b.x + 1.8, b.y + 2.2, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fill();

        // 3D Sphere Radial Gradient
        const ballGrad = ctx.createRadialGradient(
          b.x - currentRadius * 0.35,
          b.y - currentRadius * 0.35,
          currentRadius * 0.1,
          b.x,
          b.y,
          currentRadius
        );

        if (b.type === 'cue') {
          ballGrad.addColorStop(0, '#ffffff');
          ballGrad.addColorStop(0.7, '#f1f5f9');
          ballGrad.addColorStop(1, '#94a3b8');
        } else if (b.type === 'eight') {
          ballGrad.addColorStop(0, '#334155');
          ballGrad.addColorStop(0.6, '#0f172a');
          ballGrad.addColorStop(1, '#020617');
        } else {
          ballGrad.addColorStop(0, '#ffffff');
          ballGrad.addColorStop(0.25, b.color);
          ballGrad.addColorStop(1, '#05070a');
        }

        ctx.beginPath();
        ctx.arc(b.x, b.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = ballGrad;
        ctx.fill();

        // Stripe band
        if (b.type === 'stripe') {
          ctx.beginPath();
          ctx.arc(b.x, b.y, currentRadius - 1.2, 0, Math.PI * 2);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 4.2;
          ctx.stroke();
        }

        // Circular number badge
        if (b.number > 0 && currentRadius > 5) {
          ctx.beginPath();
          ctx.arc(b.x, b.y, currentRadius * 0.45, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();

          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 7.5px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(b.number), b.x, b.y + 0.5);
        }

        // Specular highlight gloss
        ctx.beginPath();
        ctx.arc(b.x - currentRadius * 0.32, b.y - currentRadius * 0.32, currentRadius * 0.28, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.fill();
      }

      // 7. Ball-in-Hand Ghost Indicator (cursor placement)
      if (ballInHand && cursorPos) {
        ctx.beginPath();
        ctx.arc(cursorPos.x, cursorPos.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    };

    const loop = () => {
      updatePhysics();
      render();
      animId = requestAnimationFrame(loop);
    };

    loop();

    return () => cancelAnimationFrame(animId);
  }, [pockets, ballsMoving, aimAngle, shotPower, spinOffset, ballInHand, cursorPos, calledPocketId, currentMatch?.status]);

  // Handle Shot Completion & Turn Handoff
  useEffect(() => {
    if (ballsMoving || !shotInProgressRef.current) return;
    shotInProgressRef.current = false;

    // Check if 8-Ball was potted during this shot!
    if (eightBallPottedThisShotRef.current) {
      const pocketPotted = eightBallPottedThisShotRef.current.pocketId;
      eightBallPottedThisShotRef.current = null;

      const currentGroupName = turn === 'A' ? assignedGroups.A : assignedGroups.B;
      const ownBallsRemaining =
        currentGroupName === 'solid'
          ? ballsRef.current.filter((b) => b.type === 'solid' && !b.isPotted).length
          : currentGroupName === 'stripe'
          ? ballsRef.current.filter((b) => b.type === 'stripe' && !b.isPotted).length
          : 7; // if table was open, still had balls!

      const scratched = cueBallScratchedThisShotRef.current;

      if (scratched) {
        // Instant loss: Scratch on 8-ball
        handleMatchConclusion(
          turn === 'A' ? 'B' : 'A',
          'eight_scratch',
          t.biyariScratchLoss
        );
        return;
      }

      if (ownBallsRemaining > 0) {
        // Instant loss: Premature 8-ball
        handleMatchConclusion(
          turn === 'A' ? 'B' : 'A',
          'eight_premature',
          t.biyariEarlyEightLoss.replace('{count}', String(ownBallsRemaining))
        );
        return;
      }

      // Legal 8-ball pocketed! Did they call the pocket?
      if (calledPocketId !== null && calledPocketId !== pocketPotted) {
        // Loss: potted in uncalled pocket
        handleMatchConclusion(
          turn === 'A' ? 'B' : 'A',
          'eight_in_called',
          t.biyariUncalledPocketLoss
        );
        return;
      }

      // DECISIVE WORLD-CLASS CHAMPIONSHIP VICTORY!
      handleMatchConclusion(
        turn,
        'eight_in_called',
        t.biyariCalledPocketWinReason
      );
      return;
    }

    // Handle Scratches (cue ball potted)
    if (cueBallScratchedThisShotRef.current) {
      cueBallScratchedThisShotRef.current = false;
      const nextTurn = turn === 'A' ? 'B' : 'A';
      setTurn(nextTurn);
      setBallInHand(true);
      setStatusMessage(t.biyariScratchBallInHand);
      return;
    }

    // Assign groups if table was open and a ball was legally pocketed
    if (ownBallPottedThisShotRef.current && (!assignedGroups.A || !assignedGroups.B)) {
      const solidsPottedCount = ballsRef.current.filter((b) => b.type === 'solid' && b.isPotted).length;
      const stripesPottedCount = ballsRef.current.filter((b) => b.type === 'stripe' && b.isPotted).length;

      if (solidsPottedCount > 0 && stripesPottedCount === 0) {
        setAssignedGroups({
          A: turn === 'A' ? 'solid' : 'stripe',
          B: turn === 'A' ? 'stripe' : 'solid',
        });
      } else if (stripesPottedCount > 0 && solidsPottedCount === 0) {
        setAssignedGroups({
          A: turn === 'A' ? 'stripe' : 'solid',
          B: turn === 'A' ? 'solid' : 'stripe',
        });
      }
    }

    // Continue turn if legally potted own ball; otherwise switch turn
    if (!ownBallPottedThisShotRef.current) {
      setTurn((prev) => (prev === 'A' ? 'B' : 'A'));
      setStatusMessage(turn === 'A' ? t.turnOpponentTurn : t.turnYourTurn);
    } else {
      setStatusMessage(t.biyariPottedContinueTurn);
    }

    ownBallPottedThisShotRef.current = false;
    firstContactBallRef.current = null;
  }, [ballsMoving, turn, assignedGroups, calledPocketId, t]);

  // Conclude Match with High-Dignity Victory Ceremony
  const handleMatchConclusion = (
    winner: 'A' | 'B',
    reasonCode: 'eight_in_called' | 'eight_scratch' | 'eight_premature',
    description: string
  ) => {
    const winnerName = winner === 'A' ? (currentMatch?.playerA.name ?? '') : (currentMatch?.playerB.name ?? '');
    const isCleanWin = reasonCode === 'eight_in_called';

    if (isCleanWin) {
      sounds.playVictoryFanfare();
    } else {
      sounds.playFoulSound();
    }

    const title = isCleanWin
      ? t.biyariChampionshipWinTitle.replace('{player}', winnerName)
      : t.biyariMatchConcludedTitle.replace('{player}', winnerName);

    setVictoryDetails({
      winner,
      title,
      description,
      isCleanWin,
      reasonCode,
    });
    setShowVictoryModal(true);

    const scoreResult = calculateBiyariAdvantage(pottedA, pottedB, winner === 'A', winner === 'B');
    updateMatchScore(scoreResult);
    concludeMatch(description, false, winner);
  };

  // Canvas Mouse Interactions
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * TABLE_WIDTH;
    const mouseY = ((e.clientY - rect.top) / rect.height) * TABLE_HEIGHT;

    if (ballInHand) {
      // Constrain placement to playing area
      const safeX = Math.max(CUSHION + BALL_RADIUS, Math.min(TABLE_WIDTH - CUSHION - BALL_RADIUS, mouseX));
      const safeY = Math.max(CUSHION + BALL_RADIUS, Math.min(TABLE_HEIGHT - CUSHION - BALL_RADIUS, mouseY));
      setCursorPos({ x: safeX, y: safeY });
      return;
    }

    if (ballsMoving || (turn === 'B' && !isPassAndPlay)) return;

    const cueBall = ballsRef.current.find((b) => b.type === 'cue' && !b.isPotted);
    if (cueBall) {
      const angle = Math.atan2(mouseY - cueBall.y, mouseX - cueBall.x);
      setAimAngle(angle);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (ballsMoving) return;

    // Ball-in-hand placement
    if (ballInHand && cursorPos) {
      const cueBall = ballsRef.current.find((b) => b.type === 'cue');
      if (cueBall) {
        cueBall.x = cursorPos.x;
        cueBall.y = cursorPos.y;
        cueBall.vx = 0;
        cueBall.vy = 0;
        cueBall.isPotted = false;
        cueBall.sinkProgress = undefined;
        setBallInHand(false);
        setCursorPos(null);
        sounds.playChalk();
        setStatusMessage('Umupira wera washinzwe neza! Hitamo icyerekezo ukine.');
      }
      return;
    }

    // Check if clicked near a pocket to designate 8-ball called pocket
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * TABLE_WIDTH;
      const mouseY = ((e.clientY - rect.top) / rect.height) * TABLE_HEIGHT;

      for (const p of pockets) {
        if (Math.hypot(mouseX - p.x, mouseY - p.y) < POCKET_RADIUS * 1.5) {
          setCalledPocketId(p.id);
          sounds.playChalk();
          setStatusMessage(t.calledPocketSelected.replace('{pocket}', p.name));
          return;
        }
      }
    }

    executeShot();
  };

  const executeShot = () => {
    if (ballsMoving || ballInHand || !currentMatch || currentMatch.status !== 'playing' || (turn === 'B' && !isPassAndPlay)) return;
    const cueBall = ballsRef.current.find((b) => b.type === 'cue' && !b.isPotted);
    if (!cueBall) return;

    // Track shot statistics
    if (turn === 'A') {
      setTotalShotsA((prev) => prev + 1);
    } else {
      setTotalShotsB((prev) => prev + 1);
    }

    const speed = (shotPower / 100) * 17.5;
    cueBall.vx = Math.cos(aimAngle) * speed;
    cueBall.vy = Math.sin(aimAngle) * speed;

    shotInProgressRef.current = true;
    ownBallPottedThisShotRef.current = false;
    cueBallScratchedThisShotRef.current = false;
    eightBallPottedThisShotRef.current = null;
    firstContactBallRef.current = null;

    setBallsMoving(true);
    setCurrentMatch({ ...currentMatch, moveCount: currentMatch.moveCount + 1 });
    sounds.playBilliardStrike(shotPower);
  };

  // Fine angle adjustment
  const adjustAngle = (deltaDegrees: number) => {
    if (ballsMoving) return;
    setAimAngle((prev) => prev + (deltaDegrees * Math.PI) / 180);
  };

  // Interactive Spin / English Picker
  const handleSpinClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const radius = rect.width / 2;
    const normX = (clickX - radius) / radius;
    const normY = (clickY - radius) / radius;

    const dist = Math.hypot(normX, normY);
    if (dist <= 0.8) {
      setSpinOffset({ x: normX, y: normY });
      sounds.playChalk();
    }
  };

  // Automated friendly opponent
  useEffect(() => {
    if (isPassAndPlay || turn !== 'B' || ballsMoving || ballInHand || currentMatch?.status !== 'playing') return;

    const timer = window.setTimeout(() => {
      if (!currentMatch || currentMatch.status !== 'playing') return;
      const cueBall = ballsRef.current.find((ball) => ball.type === 'cue' && !ball.isPotted);
      if (!cueBall) return;

      const groupB = assignedGroups.B;
      const targetType = groupB === 'solid' ? 'solid' : groupB === 'stripe' ? 'stripe' : 'solid';
      let targets = ballsRef.current.filter((ball) => ball.type === targetType && !ball.isPotted);

      if (targets.length === 0) {
        targets = ballsRef.current.filter((ball) => ball.type === 'eight' && !ball.isPotted);
      }
      if (targets.length === 0) return;

      const target = targets.reduce((nearest, ball) =>
        Math.hypot(ball.x - cueBall.x, ball.y - cueBall.y) < Math.hypot(nearest.x - cueBall.x, nearest.y - cueBall.y) ? ball : nearest
      );

      const angle = Math.atan2(target.y - cueBall.y, target.x - cueBall.x);
      const power = 55;
      const speed = (power / 100) * 17.5;
      cueBall.vx = Math.cos(angle) * speed;
      cueBall.vy = Math.sin(angle) * speed;

      shotInProgressRef.current = true;
      ownBallPottedThisShotRef.current = false;
      cueBallScratchedThisShotRef.current = false;
      eightBallPottedThisShotRef.current = null;
      firstContactBallRef.current = null;

      setAimAngle(angle);
      setBallsMoving(true);
      setCurrentMatch({ ...currentMatch, moveCount: currentMatch.moveCount + 1 });
      sounds.playBilliardStrike(power);
    }, 1100);

    return () => window.clearTimeout(timer);
  }, [isPassAndPlay, turn, ballsMoving, ballInHand, assignedGroups.B, currentMatch?.status, setCurrentMatch]);

  if (!currentMatch) return null;

  return (
    <div className="space-y-6">
      {/* Live HUD */}
      {/* Compact Top Match HUD */}
      <GameHud
        match={currentMatch}
        turn={turn}
        customStatsA={
          <span className="text-emerald-400 font-mono flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block shadow-sm" />
            {assignedGroups.A === 'stripe' ? 'Stripes' : 'Solids'}: {pottedA}/7
          </span>
        }
        customStatsB={
          <span className="text-cyan-400 font-mono flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block shadow-sm" />
            {assignedGroups.B === 'solid' ? 'Solids' : 'Stripes'}: {pottedB}/7
          </span>
        }
        rulesContent={
          <div className="space-y-4">
            <div className="p-3 bg-[#0d131c] rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-display font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Imipira y'Amatsinda (WPA 8-Ball)</span>
              </div>

              {/* Player A Tray */}
              <div className="p-2.5 bg-[#141b26] rounded-lg border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-xs text-slate-200 font-semibold">
                  <span className="text-emerald-400">
                    {currentMatch.playerA.name} ({assignedGroups.A === 'stripe' ? 'Stripes' : assignedGroups.A === 'solid' ? 'Solids' : 'Itegereje'}):
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">{pottedA} / 7</span>
                </div>
                <div className="flex items-center gap-1 pt-1">
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                    const isPotted = ballsRef.current.find((b) => b.number === num)?.isPotted;
                    return (
                      <div
                        key={num}
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px] font-bold border transition-opacity ${
                          isPotted
                            ? 'bg-slate-800/40 border-slate-700 text-slate-600 opacity-25 line-through'
                            : 'bg-amber-500 text-slate-950 border-amber-300 shadow-sm'
                        }`}
                      >
                        {num}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Player B Tray */}
              <div className="p-2.5 bg-[#141b26] rounded-lg border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-xs text-slate-200 font-semibold">
                  <span className="text-cyan-400">
                    {currentMatch.playerB.name} ({assignedGroups.B === 'solid' ? 'Solids' : assignedGroups.B === 'stripe' ? 'Stripes' : 'Itegereje'}):
                  </span>
                  <span className="font-mono text-cyan-400 font-bold">{pottedB} / 7</span>
                </div>
                <div className="flex items-center gap-1 pt-1">
                  {[9, 10, 11, 12, 13, 14, 15].map((num) => {
                    const isPotted = ballsRef.current.find((b) => b.number === num)?.isPotted;
                    return (
                      <div
                        key={num}
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px] font-bold border transition-opacity ${
                          isPotted
                            ? 'bg-slate-800/40 border-slate-700 text-slate-600 opacity-25 line-through'
                            : 'bg-white text-slate-900 border-cyan-400 ring-1 ring-cyan-500 shadow-sm'
                        }`}
                      >
                        {num}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 8-ball status & Called Pocket selector */}
              <div className="p-2.5 bg-slate-900/90 rounded-lg space-y-1.5 border border-slate-800 text-xs">
                <div className="flex items-center justify-between text-slate-200 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-black border border-slate-500 text-white flex items-center justify-center font-bold font-mono text-[8px]">
                      8
                    </div>
                    <span>{t.biyariTitle} (8):</span>
                  </div>
                  <span className="text-amber-400 font-mono text-[11px]">
                    {pottedA >= 7 || pottedB >= 7 ? t.eightBallStatusReady : t.eightBallStatusWaiting}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {calledPocketId !== null
                    ? t.calledPocketSelected.replace('{pocket}', pockets[calledPocketId].name)
                    : t.callPocketPrompt}
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#0d131c] rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Amategeko y'Iremezo (WPA Rules)</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                <li>Gukora scratch cyangwa gukora ku mupira w'umukeba mbere bitanga Ball-in-Hand.</li>
                <li>Kwinjiza umupira wa 8 mbere y'igihe cyangwa mu mwobo utatangaje biviramo gutsindwa.</li>
                <li>Iyo winjije umupira wawe neza, ukomeza gutera indi coup.</li>
              </ul>
            </div>
          </div>
        }
      />

      {/* Maximized Championship Table Arena */}
      <div className="w-full flex-1 flex flex-col items-center justify-between min-h-0 gap-1.5 sm:gap-2">
        {/* Floating Mini Ribbon (Racks + Status + Reset) */}
        <div className="w-full max-w-5xl flex items-center justify-between gap-2 px-2 text-[11px] text-slate-300 shrink-0">
          {/* Left mini ball dots */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-mono text-[10px] hidden sm:inline">Solids:</span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                const isPotted = ballsRef.current.find((b) => b.number === num)?.isPotted;
                return (
                  <span
                    key={num}
                    title={`Umupira ${num}`}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      isPotted ? 'bg-slate-800 opacity-20' : 'bg-amber-400 shadow-sm ring-1 ring-amber-300/40'
                    }`}
                  />
                );
              })}
            </div>
            <span className="text-slate-600 font-mono mx-1">|</span>
            <span className="text-slate-400 font-mono text-[10px] hidden sm:inline">Stripes:</span>
            <div className="flex items-center gap-0.5">
              {[9, 10, 11, 12, 13, 14, 15].map((num) => {
                const isPotted = ballsRef.current.find((b) => b.number === num)?.isPotted;
                return (
                  <span
                    key={num}
                    title={`Umupira ${num}`}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      isPotted ? 'bg-slate-800 opacity-20' : 'bg-cyan-400 shadow-sm ring-1 ring-white/60'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Central status notification */}
          <div className="text-emerald-400 font-mono text-[11px] truncate text-center max-w-[280px] sm:max-w-md font-medium">
            {statusMessage}
          </div>

          {/* Quick rack & Pass/Play */}
          <div className="flex items-center gap-2">
            <label className="hidden sm:flex items-center gap-1 cursor-pointer text-slate-400 hover:text-white transition-colors text-[10px]">
              <input
                type="checkbox"
                checked={isPassAndPlay}
                onChange={(e) => setIsPassAndPlay(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-emerald-500 cursor-pointer accent-emerald-500 w-3 h-3"
              />
              <span>{t.passAndPlayLabel}</span>
            </label>
            <button
              onClick={initBalls}
              className="px-2 py-0.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded text-[10px] flex items-center gap-1 transition-colors cursor-pointer border border-slate-700"
              title={t.rackBalls}
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">{t.rackBalls}</span>
            </button>
          </div>
        </div>

        {/* The Huge Championship Table Canvas (Dominates the screen) */}
        <div className="relative flex-1 w-full max-w-5xl flex items-center justify-center min-h-0 overflow-hidden">
          <div className="relative p-2 sm:p-3 bg-[#0a0f17] border-4 border-[#243144] rounded-2xl sm:rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] max-w-full max-h-full flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={TABLE_WIDTH}
              height={TABLE_HEIGHT}
              onMouseMove={handleMouseMove}
              onClick={handleCanvasClick}
              className={`block max-w-full max-h-[calc(100vh-175px)] w-auto h-auto object-contain rounded-xl shadow-inner ${
                ballInHand ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'
              }`}
            />

            {/* Ball in Hand floating alert overlay */}
            {ballInHand && (
              <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-bold px-3 py-1 sm:px-4 sm:py-1.5 rounded-full shadow-xl text-xs flex items-center gap-1.5 animate-bounce z-20">
                <Move className="w-3.5 h-3.5" />
                <span>{t.ballInHandNotice}</span>
              </div>
            )}
          </div>
        </div>

        {/* Streamlined Floating Cue Control Deck */}
        <div className="w-full max-w-5xl px-3 py-1.5 sm:py-2 bg-[#0e141e]/95 backdrop-blur-md border border-slate-800/90 rounded-xl sm:rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-2xl shrink-0">
          {/* Fine Tuning Buttons */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 mr-0.5 text-[10px] font-mono hidden sm:inline">{t.cueAimLabel}:</span>
            {[-5, -1, 1, 5].map((deg) => (
              <button
                key={deg}
                type="button"
                onClick={() => adjustAngle(deg)}
                disabled={ballsMoving}
                className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded text-slate-200 text-[10px] font-mono cursor-pointer border border-slate-700"
              >
                {deg > 0 ? `+${deg}°` : `${deg}°`}
              </button>
            ))}
          </div>

          {/* Power Slider */}
          <div className="flex items-center gap-2 flex-1 min-w-[140px] max-w-md">
            <Target className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <input
              type="range"
              min="10"
              max="100"
              value={shotPower}
              onChange={(e) => setShotPower(parseInt(e.target.value))}
              disabled={ballsMoving}
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
            <span className="text-xs font-mono text-emerald-400 w-8 text-right font-bold">{shotPower}%</span>
          </div>

          {/* Spin / English Disc Controller */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">{t.spinEnglishLabel}:</span>
            <div
              onClick={handleSpinClick}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 border-2 border-slate-400 relative cursor-pointer shadow-inner flex items-center justify-center shrink-0"
              title={t.spinEnglishTooltip}
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-px bg-slate-300" />
                <div className="h-full w-px bg-slate-300 absolute" />
              </div>
              <div
                className="w-2 h-2 rounded-full bg-red-600 shadow absolute pointer-events-none"
                style={{
                  transform: `translate(${spinOffset.x * 10}px, ${spinOffset.y * 10}px)`,
                }}
              />
            </div>
          </div>

          {/* Strike Button */}
          <button
            type="button"
            onClick={executeShot}
            disabled={ballsMoving || ballInHand || currentMatch.status !== 'playing'}
            className="px-4 py-1.5 sm:px-6 sm:py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-semibold text-xs rounded-xl shadow-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{ballsMoving ? t.ballsRollingLabel : t.strikeCueBall}</span>
          </button>
        </div>
      </div>

      {/* World-Class Championship Victory & Game-Over Modal */}
      {showVictoryModal && victoryDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-gradient-to-b from-[#182333] via-[#101722] to-[#0a0f16] border-2 border-emerald-500/60 rounded-3xl p-6 sm:p-8 text-center text-slate-100 shadow-[0_25px_60px_rgba(0,0,0,0.95)] relative overflow-hidden">
            {/* Top Celebratory Halo */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

            {/* Laurel Trophy Icon */}
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-0.5 shadow-[0_0_30px_rgba(245,158,11,0.5)] flex items-center justify-center mb-4">
              <div className="w-full h-full rounded-full bg-[#0d141e] flex items-center justify-center">
                <Trophy className="w-10 h-10 text-amber-400 animate-pulse" />
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold font-display text-white mb-2">
              {victoryDetails.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed px-2">
              {victoryDetails.description}
            </p>

            {/* Performance Statistics Grid */}
            <div className="p-4 bg-[#0c121b] border border-slate-800 rounded-2xl grid grid-cols-2 gap-3 mb-6 text-left">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400">Imipira Yinjijwe ({currentMatch.playerA.name}):</span>
                <p className="font-mono text-emerald-400 font-bold text-sm">{pottedA} / 7</p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400">Imipira Yinjijwe ({currentMatch.playerB.name}):</span>
                <p className="font-mono text-cyan-400 font-bold text-sm">{pottedB} / 7</p>
              </div>
              <div className="space-y-1 pt-2 border-t border-slate-800">
                <span className="text-[11px] text-slate-400">Imikubitire Yose:</span>
                <p className="font-mono text-white font-bold text-sm">{totalShotsA + totalShotsB} imikubitire</p>
              </div>
              <div className="space-y-1 pt-2 border-t border-slate-800">
                <span className="text-[11px] text-slate-400">Amanota y’Ubwubahane:</span>
                <p className="font-mono text-amber-400 font-bold text-sm">+15 {t.honorPointsLabel}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={initBalls}
                className="w-full sm:w-1/2 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Ongera Ukine (Rematch)</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentMatch(null)}
                className="w-full sm:w-1/2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl shadow transition-all cursor-pointer border border-slate-700"
              >
                {t.backToLobby}
              </button>
            </div>

            {/* Inspect Table Button */}
            <button
              type="button"
              onClick={() => setShowVictoryModal(false)}
              className="mt-3 text-[11px] text-slate-400 hover:text-white underline transition-colors cursor-pointer"
            >
              Irebere ameza uko asigaye (Inspect Final Table)
            </button>
          </div>
        </div>
      )}

      {/* Floating button to restore victory modal if minimized */}
      {!showVictoryModal && victoryDetails && currentMatch.status === 'concluded' && (
        <button
          onClick={() => setShowVictoryModal(true)}
          className="fixed bottom-6 right-6 z-40 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl font-bold text-xs flex items-center gap-2 cursor-pointer border-2 border-white/30 animate-pulse"
        >
          <Trophy className="w-4 h-4 text-amber-300" />
          <span>Reba Ibisubizo by'Intsinzi</span>
        </button>
      )}
    </div>
  );
};
