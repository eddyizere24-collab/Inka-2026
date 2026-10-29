import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Award, Target, RotateCcw, ShieldCheck, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
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
  const TABLE_WIDTH = 680;
  const TABLE_HEIGHT = 360;
  const CUSHION = 26;
  const BALL_RADIUS = 9.5;

  // Pocket coordinates
  const pockets = [
    { x: CUSHION + 3, y: CUSHION + 3 }, // Top-left
    { x: TABLE_WIDTH / 2, y: CUSHION }, // Top-center
    { x: TABLE_WIDTH - CUSHION - 3, y: CUSHION + 3 }, // Top-right
    { x: CUSHION + 3, y: TABLE_HEIGHT - CUSHION - 3 }, // Bottom-left
    { x: TABLE_WIDTH / 2, y: TABLE_HEIGHT - CUSHION }, // Bottom-center
    { x: TABLE_WIDTH - CUSHION - 3, y: TABLE_HEIGHT - CUSHION - 3 }, // Bottom-right
  ];
  const POCKET_RADIUS = 19;

  const [turn, setTurn] = useState<'A' | 'B'>('A');
  const [isPassAndPlay, setIsPassAndPlay] = useState<boolean>(false);
  const [aimAngle, setAimAngle] = useState<number>(0);
  const [shotPower, setShotPower] = useState<number>(50);
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
    const startX = TABLE_WIDTH * 0.68;
    const startY = TABLE_HEIGHT / 2;
    const spacing = BALL_RADIUS * 2 + 0.8;

    // Standard 8-ball groups: seven solids (1-7), the 8-ball, and seven stripes (9-15)
    const ballDefs: { color: string; type: 'solid' | 'stripe' | 'eight'; num: number }[] = [
      { color: '#eab308', type: 'solid', num: 1 }, // yellow
      { color: '#2563eb', type: 'solid', num: 2 }, // blue
      { color: '#dc2626', type: 'solid', num: 3 }, // red
      { color: '#7c3aed', type: 'solid', num: 4 }, // purple
      { color: '#090d16', type: 'eight', num: 8 }, // 8-ball center
      { color: '#ea580c', type: 'solid', num: 5 }, // orange
      { color: '#16a34a', type: 'solid', num: 6 }, // green
      { color: '#854d0e', type: 'solid', num: 7 }, // maroon
      { color: '#eab308', type: 'stripe', num: 9 }, // yellow stripe
      { color: '#2563eb', type: 'stripe', num: 10 }, // blue stripe
      { color: '#dc2626', type: 'stripe', num: 11 }, // red stripe
      { color: '#7c3aed', type: 'stripe', num: 12 }, // purple stripe
      { color: '#ea580c', type: 'stripe', num: 13 }, // orange stripe
      { color: '#16a34a', type: 'stripe', num: 14 }, // green stripe
      { color: '#854d0e', type: 'stripe', num: 15 }, // maroon stripe
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
    setTurn('A');
    setAimAngle(0);
    setShotPower(50);
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

        // Realistic Baize cloth friction
        b.vx *= 0.986;
        b.vy *= 0.986;

        // Stop micro-movements
        if (Math.abs(b.vx) < 0.04) b.vx = 0;
        if (Math.abs(b.vy) < 0.04) b.vy = 0;

        if (b.vx !== 0 || b.vy !== 0) anyMoving = true;

        // Cushion bounce (boundaries with rubber dampening)
        const minX = CUSHION + b.radius;
        const maxX = TABLE_WIDTH - CUSHION - b.radius;
        const minY = CUSHION + b.radius;
        const maxY = TABLE_HEIGHT - CUSHION - b.radius;

        if (b.x < minX) {
          b.x = minX;
          b.vx *= -0.86;
          sounds.playCushionBounce(Math.abs(b.vx));
        } else if (b.x > maxX) {
          b.x = maxX;
          b.vx *= -0.86;
          sounds.playCushionBounce(Math.abs(b.vx));
        }

        if (b.y < minY) {
          b.y = minY;
          b.vy *= -0.86;
          sounds.playCushionBounce(Math.abs(b.vy));
        } else if (b.y > maxY) {
          b.y = maxY;
          b.vy *= -0.86;
          sounds.playCushionBounce(Math.abs(b.vy));
        }

        // Pocket drop detection
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

            b1.vx -= p * nx * 0.94;
            b1.vy -= p * ny * 0.94;
            b2.vx += p * nx * 0.94;
            b2.vy += p * ny * 0.94;

            const impactSpeed = Math.hypot(kx, ky);
            sounds.playBallCollision(impactSpeed);
          }
        }
      }

      setBallsMoving(anyMoving);
    };

    const render = () => {
      ctx.clearRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);

      // Wooden Table Frame (Polished Mahogany)
      const woodGrad = ctx.createLinearGradient(0, 0, TABLE_WIDTH, TABLE_HEIGHT);
      woodGrad.addColorStop(0, '#2e1c12');
      woodGrad.addColorStop(0.5, '#1e110a');
      woodGrad.addColorStop(1, '#150a04');
      ctx.fillStyle = woodGrad;
      ctx.beginPath();
      ctx.roundRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT, 20);
      ctx.fill();

      // Outer Bevel Highlight
      ctx.strokeStyle = '#4e3323';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Inlaid Mother-of-Pearl Diamond Sights along Rails
      const drawDiamond = (x: number, y: number) => {
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(x, y - 3);
        ctx.lineTo(x + 3, y);
        ctx.lineTo(x, y + 3);
        ctx.lineTo(x - 3, y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      };

      // Top & Bottom Rails Diamonds
      for (let i = 1; i <= 7; i++) {
        if (i === 4) continue; // center pocket
        const x = CUSHION + (i / 8) * (TABLE_WIDTH - CUSHION * 2);
        drawDiamond(x, CUSHION / 2);
        drawDiamond(x, TABLE_HEIGHT - CUSHION / 2);
      }
      // Left & Right Rails Diamonds
      for (let j = 1; j <= 3; j++) {
        if (j === 2) continue;
        const y = CUSHION + (j / 4) * (TABLE_HEIGHT - CUSHION * 2);
        drawDiamond(CUSHION / 2, y);
        drawDiamond(TABLE_WIDTH - CUSHION / 2, y);
      }

      // Championship Green Baize Felt Bed with Vignette
      const feltGrad = ctx.createRadialGradient(
        TABLE_WIDTH / 2,
        TABLE_HEIGHT / 2,
        60,
        TABLE_WIDTH / 2,
        TABLE_HEIGHT / 2,
        TABLE_WIDTH / 1.6
      );
      feltGrad.addColorStop(0, '#0a6349');
      feltGrad.addColorStop(0.8, '#064e3b');
      feltGrad.addColorStop(1, '#033326');

      ctx.fillStyle = feltGrad;
      ctx.beginPath();
      ctx.roundRect(
        CUSHION,
        CUSHION,
        TABLE_WIDTH - CUSHION * 2,
        TABLE_HEIGHT - CUSHION * 2,
        10
      );
      ctx.fill();

      // Cushion Nose Rubber Shadow
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Head string marker line & spot
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(TABLE_WIDTH * 0.25, CUSHION);
      ctx.lineTo(TABLE_WIDTH * 0.25, TABLE_HEIGHT - CUSHION);
      ctx.stroke();

      // Draw Pockets with Polished Brass Rim & Deep Shadow
      for (const p of pockets) {
        ctx.fillStyle = '#05070a';
        ctx.beginPath();
        ctx.arc(p.x, p.y, POCKET_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#b45309'; // brass rim
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // Find stationary Cue Ball
      const cueBall = ballsRef.current.find((b) => b.type === 'cue' && !b.isPotted);

      // Advanced Ghost-Ball Collision Raycasting
      if (cueBall && !ballsMoving && currentMatch?.status === 'playing') {
        const rayCos = Math.cos(aimAngle);
        const raySin = Math.sin(aimAngle);

        let closestHit: {
          ball: Ball;
          hitDist: number;
          ghostX: number;
          ghostY: number;
        } | null = null;

        // Check intersection with all active balls
        for (const b of ballsRef.current) {
          if (b.type === 'cue' || b.isPotted) continue;

          // Vector from cue to object ball
          const dx = b.x - cueBall.x;
          const dy = b.y - cueBall.y;

          // Projection along ray
          const dot = dx * rayCos + dy * raySin;
          if (dot <= 0) continue; // Behind cue ball

          // Perpendicular distance from ray to object ball center
          const perpDistSq = (dx * dx + dy * dy) - dot * dot;
          const collisionDist = BALL_RADIUS * 2;

          if (perpDistSq < collisionDist * collisionDist) {
            // Distance along ray to collision point
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

        // 1. Draw Cue Ball Trajectory Line
        const targetDist = closestHit ? closestHit.hitDist : 240;
        const endLineX = cueBall.x + rayCos * targetDist;
        const endLineY = cueBall.y + raySin * targetDist;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(cueBall.x, cueBall.y);
        ctx.lineTo(endLineX, endLineY);
        ctx.stroke();
        ctx.setLineDash([]);

        // 2. Draw Ghost Ball & Deflection Vectors if collision predicted
        if (closestHit) {
          const { ball: targetBall, ghostX, ghostY } = closestHit;

          // Ghost Cue Ball
          ctx.beginPath();
          ctx.arc(ghostX, ghostY, BALL_RADIUS, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.fill();
          ctx.setLineDash([]);

          // Object Ball Aim Line (Line of Centers)
          const normDx = targetBall.x - ghostX;
          const normDy = targetBall.y - ghostY;
          const normDist = Math.hypot(normDx, normDy);
          if (normDist > 0) {
            const nx = normDx / normDist;
            const ny = normDy / normDist;

            ctx.strokeStyle = '#34d399'; // Emerald target path
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(targetBall.x, targetBall.y);
            ctx.lineTo(targetBall.x + nx * 60, targetBall.y + ny * 60);
            ctx.stroke();

            // Tangent line for cue ball deflection
            const tx = -ny;
            const ty = nx;
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)'; // Amber tangent
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(ghostX, ghostY);
            ctx.lineTo(ghostX + tx * 35, ghostY + ty * 35);
            ctx.stroke();
          }
        }

        // 3. Draw Professional Wooden Cue Stick
        const pullBack = 24 + (shotPower / 100) * 36;
        const cueLength = 160;
        const cueStartX = cueBall.x - rayCos * (pullBack + cueLength);
        const cueStartY = cueBall.y - raySin * (pullBack + cueLength);
        const cueTipX = cueBall.x - rayCos * pullBack;
        const cueTipY = cueBall.y - raySin * pullBack;

        // Tapered Cue Stick
        ctx.strokeStyle = '#d4a373';
        ctx.lineWidth = 4.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cueStartX, cueStartY);
        ctx.lineTo(cueTipX, cueTipY);
        ctx.stroke();

        // Leather Cue Tip
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(cueTipX, cueTipY);
        ctx.lineTo(cueBall.x - rayCos * (pullBack - 3), cueBall.y - raySin * (pullBack - 3));
        ctx.stroke();
      }

      // Draw 3D Photorealistic Balls
      for (const b of ballsRef.current) {
        if (b.isPotted) continue;

        // Cast shadow beneath ball on felt
        ctx.beginPath();
        ctx.arc(b.x + 1.5, b.y + 2, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fill();

        // Ball Body with 3D Radial Lighting
        const ballGrad = ctx.createRadialGradient(
          b.x - b.radius * 0.35,
          b.y - b.radius * 0.35,
          b.radius * 0.1,
          b.x,
          b.y,
          b.radius
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
          ballGrad.addColorStop(0.2, b.color);
          ballGrad.addColorStop(1, '#05070a');
        }

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = ballGrad;
        ctx.fill();

        // Stripe band
        if (b.type === 'stripe') {
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius - 1, 0, Math.PI * 2);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 4;
          ctx.stroke();
        }

        // Circular Number Badge for numbered balls
        if (b.number > 0) {
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius * 0.45, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();

          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 7.5px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(b.number), b.x, b.y + 0.5);
        }

        // Specular highlight gloss reflection
        ctx.beginPath();
        ctx.arc(b.x - b.radius * 0.32, b.y - b.radius * 0.32, b.radius * 0.28, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.fill();
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
    if (ballsMoving || (turn === 'B' && !isPassAndPlay)) return;
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

  const adjustAngle = (deltaDegrees: number) => {
    if (ballsMoving) return;
    const rad = (deltaDegrees * Math.PI) / 180;
    setAimAngle((prev) => prev + rad);
  };

  const executeShot = () => {
    if (ballsMoving || !currentMatch || currentMatch.status !== 'playing' || (turn === 'B' && !isPassAndPlay)) return;
    const cueBall = ballsRef.current.find((b) => b.type === 'cue' && !b.isPotted);
    if (!cueBall) return;

    const speed = (shotPower / 100) * 17;
    cueBall.vx = Math.cos(aimAngle) * speed;
    cueBall.vy = Math.sin(aimAngle) * speed;
    shotInProgressRef.current = true;
    ownBallPottedThisShotRef.current = false;
    cueBallScratchedThisShotRef.current = false;
    setBallsMoving(true);
    setCurrentMatch({ ...currentMatch, moveCount: currentMatch.moveCount + 1 });
    sounds.playBilliardStrike(shotPower);
  };

  // Local simulated friendly opponent
  useEffect(() => {
    if (isPassAndPlay || turn !== 'B' || ballsMoving || currentMatch?.status !== 'playing') return;

    const timer = window.setTimeout(() => {
      if (!currentMatch || currentMatch.status !== 'playing') return;
      const cueBall = ballsRef.current.find((ball) => ball.type === 'cue' && !ball.isPotted);
      if (!cueBall) return;

      const targetType = pottedBRef.current >= 7 ? 'eight' : 'stripe';
      const targets = ballsRef.current.filter((ball) => ball.type === targetType && !ball.isPotted);
      if (targets.length === 0) return;

      const target = targets.reduce((nearest, ball) =>
        Math.hypot(ball.x - cueBall.x, ball.y - cueBall.y) < Math.hypot(nearest.x - cueBall.x, nearest.y - cueBall.y) ? ball : nearest
      );
      const angle = Math.atan2(target.y - cueBall.y, target.x - cueBall.x);
      const power = 55;
      const speed = (power / 100) * 17;
      cueBall.vx = Math.cos(angle) * speed;
      cueBall.vy = Math.sin(angle) * speed;
      shotInProgressRef.current = true;
      ownBallPottedThisShotRef.current = false;
      cueBallScratchedThisShotRef.current = false;
      setAimAngle(angle);
      setBallsMoving(true);
      setCurrentMatch({ ...currentMatch, moveCount: currentMatch.moveCount + 1 });
      sounds.playBilliardStrike(power);
    }, 1100);

    return () => window.clearTimeout(timer);
  }, [isPassAndPlay, turn, ballsMoving, currentMatch?.status, setCurrentMatch]);

  const handleRerack = () => {
    initBalls();
    if (!currentMatch) return;
    setCurrentMatch({
      ...currentMatch,
      status: 'playing',
      leader: null,
      advantage: 0,
      scoreA: 0,
      scoreB: 0,
      moveCount: 0,
      concludeReason: undefined,
    });
  };

  if (!currentMatch) return null;

  return (
    <div className="space-y-6">
      <GameHud
        match={currentMatch}
        turn={turn}
        customStatsA={
          <span className="text-emerald-400 font-mono flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-sm" />
            {t.biyari_potted}: {pottedA}/7
          </span>
        }
        customStatsB={
          <span className="text-cyan-400 font-mono flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block shadow-sm" />
            {t.biyari_potted}: {pottedB}/7
          </span>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Billiard Table View */}
        <div className="lg:col-span-3 flex flex-col items-center">
          <div className="w-full max-w-3xl flex flex-wrap items-center justify-between gap-3 mb-3 px-1 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 font-display text-sm tracking-wide">
                Ameza ya Biyari (8-Ball Pool)
              </span>
              <span className="text-slate-500 font-mono">·</span>
              <span className="text-emerald-400 font-mono">{t.aimShotInstruction}</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={isPassAndPlay}
                  onChange={(e) => setIsPassAndPlay(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-500 cursor-pointer accent-emerald-500"
                />
                <span className="text-xs">{t.passAndPlayLabel}</span>
              </label>
              <button
                onClick={handleRerack}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer border border-slate-700"
              >
                <RotateCcw className="w-3 h-3 text-amber-400" />
                <span>{t.rackBalls}</span>
              </button>
            </div>
          </div>

          {/* Championship Table Canvas */}
          <div className="p-3.5 bg-[#101620] border-4 border-[#243144] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden max-w-full">
            <canvas
              ref={canvasRef}
              width={TABLE_WIDTH}
              height={TABLE_HEIGHT}
              onMouseMove={handleMouseMove}
              onClick={executeShot}
              className="cursor-crosshair rounded-xl block max-w-full h-auto shadow-inner"
            />
          </div>

          {/* Controls Bar & Fine Tuning */}
          <div className="mt-4 w-full max-w-3xl p-4 bg-[#141a24] border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-md">
            {/* Fine Tuning Buttons */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 mr-1 text-[11px] font-mono">Icyerekezo:</span>
              <button
                type="button"
                onClick={() => adjustAngle(-5)}
                disabled={ballsMoving}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded text-slate-200 text-xs font-mono cursor-pointer border border-slate-700"
              >
                -5°
              </button>
              <button
                type="button"
                onClick={() => adjustAngle(-1)}
                disabled={ballsMoving}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded text-slate-200 text-xs font-mono cursor-pointer border border-slate-700"
              >
                -1°
              </button>
              <button
                type="button"
                onClick={() => adjustAngle(1)}
                disabled={ballsMoving}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded text-slate-200 text-xs font-mono cursor-pointer border border-slate-700"
              >
                +1°
              </button>
              <button
                type="button"
                onClick={() => adjustAngle(5)}
                disabled={ballsMoving}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded text-slate-200 text-xs font-mono cursor-pointer border border-slate-700"
              >
                +5°
              </button>
            </div>

            {/* Power Slider */}
            <div className="flex items-center gap-3 flex-1 min-w-[200px]">
              <Target className="w-4 h-4 text-emerald-400 shrink-0" />
              <label className="text-xs text-slate-300 whitespace-nowrap font-medium">{t.cuePowerLabel}:</label>
              <input
                type="range"
                min="10"
                max="100"
                value={shotPower}
                onChange={(e) => setShotPower(parseInt(e.target.value))}
                disabled={ballsMoving}
                className="w-full accent-emerald-500 h-2 bg-slate-800 rounded cursor-pointer"
              />
              <span className="text-xs font-mono text-emerald-400 w-10 text-right font-bold">{shotPower}%</span>
            </div>

            {/* Strike Button */}
            <button
              type="button"
              onClick={executeShot}
              disabled={ballsMoving || currentMatch.status !== 'playing'}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-semibold text-xs rounded-xl shadow-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{ballsMoving ? t.ballsRollingLabel : t.strikeCueBall}</span>
            </button>
          </div>
        </div>

        {/* Sidebar & Ball Group Racks */}
        <div className="space-y-4">
          <div className="p-4 bg-[#141a24] border border-slate-800 rounded-xl space-y-3">
            <h4 className="text-sm font-bold text-slate-200 font-display flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Imipira Iri ku Meza</span>
            </h4>
            <div className="text-xs text-slate-400 space-y-3">
              {/* Player A Solids Tray (1-7) */}
              <div className="p-3 bg-[#0e131b] rounded-lg border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-slate-200 font-semibold">
                  <span className="text-emerald-400">{currentMatch.playerA.name} ({t.playerASolidsPottedLabel}):</span>
                  <span className="font-mono text-emerald-400 font-bold">{pottedA} / 7</span>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                    const isPotted = ballsRef.current.find((b) => b.number === num)?.isPotted;
                    return (
                      <div
                        key={num}
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[9px] font-bold border transition-opacity ${
                          isPotted
                            ? 'bg-slate-800/40 border-slate-700 text-slate-600 opacity-30 line-through'
                            : 'bg-amber-500 text-slate-950 border-amber-300 shadow-sm'
                        }`}
                      >
                        {num}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Player B Stripes Tray (9-15) */}
              <div className="p-3 bg-[#0e131b] rounded-lg border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-slate-200 font-semibold">
                  <span className="text-cyan-400">{currentMatch.playerB.name} ({t.playerBStripesPottedLabel}):</span>
                  <span className="font-mono text-cyan-400 font-bold">{pottedB} / 7</span>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  {[9, 10, 11, 12, 13, 14, 15].map((num) => {
                    const isPotted = ballsRef.current.find((b) => b.number === num)?.isPotted;
                    return (
                      <div
                        key={num}
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[9px] font-bold border transition-opacity ${
                          isPotted
                            ? 'bg-slate-800/40 border-slate-700 text-slate-600 opacity-30 line-through'
                            : 'bg-white text-slate-900 border-cyan-400 ring-1 ring-cyan-500 shadow-sm'
                        }`}
                      >
                        {num}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* The 8-ball status */}
              <div className="p-2.5 bg-slate-900/60 rounded-lg flex items-center justify-between text-[11px] text-slate-300 border border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-black border border-slate-500 text-white flex items-center justify-center font-bold font-mono text-[8px]">
                    8
                  </div>
                  <span>Umupira wa 8:</span>
                </div>
                <span className="text-amber-300 font-medium">
                  {pottedA >= 7 || pottedB >= 7 ? 'Witeguye Kwinjizwa!' : 'Uracyategereje'}
                </span>
              </div>
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
