/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { Position, Food, GameStatus, Particle } from '../types';
import { GRID_SIZE } from '../hooks/useSnake';
import { Play, RotateCcw, AlertTriangle } from 'lucide-react';

interface GameBoardProps {
  snake: Position[];
  direction: string;
  food: Food;
  status: GameStatus;
  particles: Particle[];
  onStart: () => void;
  onRestart: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  snake,
  direction,
  food,
  status,
  particles,
  onStart,
  onRestart,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });

  // 響應式：依據容器大小動態縮放 Canvas
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        // 取得容器的寬度，做成 1:1 的正方形
        const width = containerRef.current.clientWidth;
        setDimensions({
          width: width,
          height: width, // 保持完美正方形
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    // 使用 ResizeObserver 進行高精度容器監聽
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  // 繪製邏輯
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 解決高 DPI 螢幕模糊問題 (Retina)
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    // 清除畫布
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    const cellSize = dimensions.width / GRID_SIZE;

    // 1. 繪製背景與極簡網格
    // 底色：極致沉浸黑
    ctx.fillStyle = '#05070a'; 
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    // 繪製細微的網格線 (Immersive UI 精緻微光)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'; 
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      // 直線
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, dimensions.height);
      ctx.stroke();

      // 橫線
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(dimensions.width, i * cellSize);
      ctx.stroke();
    }

    // 2. 繪製食物 (具有心跳脈動動畫與呼吸外發光效果)
    const drawFood = () => {
      if (food.position.x === -1) return;

      const fx = food.position.x * cellSize + cellSize / 2;
      const fy = food.position.y * cellSize + cellSize / 2;

      // 利用時間戳產生規律的心跳脈動縮放：[0.7, 0.95] 倍半徑
      const pulseFactor = 0.8 + Math.sin(Date.now() / 120) * 0.1;
      const radius = (cellSize / 2) * pulseFactor;

      ctx.save();
      
      // 設定發光陰影 (Glow)
      ctx.shadowColor = food.color;
      ctx.shadowBlur = status === 'PLAYING' ? 12 + Math.sin(Date.now() / 100) * 4 : 8;

      // 漸層食物填滿
      const grad = ctx.createRadialGradient(fx, fy, radius * 0.1, fx, fy, radius);
      grad.addColorStop(0, '#ffffff'); // 亮芯
      grad.addColorStop(0.3, food.color);
      grad.addColorStop(1, 'rgba(0,0,0,0.2)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(fx, fy, radius, 0, Math.PI * 2);
      ctx.fill();

      // 加一片可愛的小綠葉 (如果是普通蘋果或黃金蘋果)
      if (food.type === 'NORMAL' || food.type === 'GOLDEN') {
        ctx.shadowBlur = 0; // 移除陰影
        ctx.fillStyle = '#10B981'; // emerald-500
        ctx.beginPath();
        ctx.ellipse(
          fx + radius * 0.2,
          fy - radius * 0.9,
          radius * 0.2,
          radius * 0.4,
          Math.PI / 4,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      ctx.restore();
    };

    drawFood();

    // 3. 繪製蛇
    const drawSnake = () => {
      if (snake.length === 0) return;

      snake.forEach((segment, index) => {
        const isHead = index === 0;
        const x = segment.x * cellSize;
        const y = segment.y * cellSize;
        const pad = isHead ? 1.5 : 2; // 蛇身稍微縮小格線，使每個節點分離感更圓潤
        const r = cellSize - pad * 2;

        ctx.save();

        // 漸層色彩：頭部較亮，尾部漸暗
        const progress = index / snake.length; // 0 (頭) -> 1 (尾)
        let primaryColor = '';
        let secondaryColor = '';

        if (status === 'GAME_OVER') {
          // 死亡狀態：褪色成灰色/暗紅色
          primaryColor = index % 2 === 0 ? '#475569' : '#334155';
          secondaryColor = '#1e293b';
        } else {
          // 經典科技漸層：祖母綠 -> 亮青
          // 亮綠 00f2fe -> 4facfe (Cyan)
          primaryColor = `hsl(${140 - progress * 40}, 100%, ${50 - progress * 15}%)`;
          secondaryColor = `hsl(${150 - progress * 40}, 90%, ${40 - progress * 15}%)`;
        }

        // 繪製圓角矩形蛇身
        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        const borderRadius = isHead ? cellSize * 0.45 : cellSize * 0.35;
        
        // 繪製一個精緻的圓角矩形
        const rx = x + pad;
        const ry = y + pad;
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(rx, ry, r, r, borderRadius);
        } else {
          // 支援無 roundRect 的舊版/沙盒瀏覽器
          ctx.moveTo(rx + borderRadius, ry);
          ctx.lineTo(rx + r - borderRadius, ry);
          ctx.quadraticCurveTo(rx + r, ry, rx + r, ry + borderRadius);
          ctx.lineTo(rx + r, ry + r - borderRadius);
          ctx.quadraticCurveTo(rx + r, ry + r, rx + r - borderRadius, ry + r);
          ctx.lineTo(rx + borderRadius, ry + r);
          ctx.quadraticCurveTo(rx, ry + r, rx, ry + r - borderRadius);
          ctx.lineTo(rx, ry + borderRadius);
          ctx.quadraticCurveTo(rx, ry, rx + borderRadius, ry);
          ctx.closePath();
        }
        ctx.fill();

        // 蛇身亮斑或紋理 (科技感)
        if (!isHead && index % 2 === 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.beginPath();
          ctx.arc(rx + r / 2, ry + r / 2, r * 0.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // 如果是蛇頭，繪製靈動的「雙眼」與「表情」
        if (isHead) {
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff'; // 眼白

          // 眼睛位置要依據前進方向動態調整
          let eyeSize = r * 0.22;
          let pupilSize = eyeSize * 0.45;
          let eyeOffset = r * 0.25;

          let eye1 = { x: 0, y: 0 };
          let eye2 = { x: 0, y: 0 };
          let pupilOffset = { x: 0, y: 0 };

          // 依據前進方向決定雙眼在蛇頭格子內的位置
          switch (direction) {
            case 'UP':
              eye1 = { x: rx + eyeOffset, y: ry + eyeOffset };
              eye2 = { x: rx + r - eyeOffset, y: ry + eyeOffset };
              pupilOffset = { x: 0, y: -0.5 };
              break;
            case 'DOWN':
              eye1 = { x: rx + eyeOffset, y: ry + r - eyeOffset };
              eye2 = { x: rx + r - eyeOffset, y: ry + r - eyeOffset };
              pupilOffset = { x: 0, y: 0.5 };
              break;
            case 'LEFT':
              eye1 = { x: rx + eyeOffset, y: ry + eyeOffset };
              eye2 = { x: rx + eyeOffset, y: ry + r - eyeOffset };
              pupilOffset = { x: -0.5, y: 0 };
              break;
            case 'RIGHT':
              eye1 = { x: rx + r - eyeOffset, y: ry + eyeOffset };
              eye2 = { x: rx + r - eyeOffset, y: ry + r - eyeOffset };
              pupilOffset = { x: 0.5, y: 0 };
              break;
          }

          // 繪製眼白
          ctx.beginPath();
          ctx.arc(eye1.x, eye1.y, eyeSize, 0, Math.PI * 2);
          ctx.arc(eye2.x, eye2.y, eyeSize, 0, Math.PI * 2);
          ctx.fill();

          // 繪製黑色瞳孔 (朝移動方向看)
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(eye1.x + pupilOffset.x, eye1.y + pupilOffset.y, pupilSize, 0, Math.PI * 2);
          ctx.arc(eye2.x + pupilOffset.x, eye2.y + pupilOffset.y, pupilSize, 0, Math.PI * 2);
          ctx.fill();

          // 加上一個亮點，讓眼睛炯炯有神
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(eye1.x + pupilOffset.x - 0.5, eye1.y + pupilOffset.y - 0.5, pupilSize * 0.4, 0, Math.PI * 2);
          ctx.arc(eye2.x + pupilOffset.x - 0.5, eye2.y + pupilOffset.y - 0.5, pupilSize * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });
    };

    drawSnake();

    // 4. 繪製爆炸粒子特效 (流暢的 Alpha 混合)
    const drawParticles = () => {
      particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        // 將網格單位坐標轉換為真實 Canvas 像素坐標
        ctx.arc(p.x * cellSize, p.y * cellSize, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    };

    drawParticles();
  }, [dimensions, snake, food, direction, status, particles]);

  return (
    <div className="w-full" ref={containerRef} id="snake-game-stage">
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-[#05070a]">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
          className="rounded-2xl"
        />

        {/* ================= 狀態覆蓋面板 (Overlays) ================= */}

        {/* 1. 準備開始狀態 (READY) */}
        {status === 'READY' && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <Play className="w-8 h-8 text-emerald-400 fill-emerald-400/10 translate-x-0.5" />
            </div>
            <h3 className="text-2xl font-black tracking-tight text-white mb-2">經典貪食蛇街機</h3>
            <p className="text-xs text-slate-400 max-w-[260px] mb-6 leading-relaxed">
              使用電腦鍵盤方向鍵（或 WASD），或手機虛擬控制鍵引導小蛇。
            </p>
            <button
              onClick={onStart}
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all shadow-[0_8px_20px_rgba(16,185,129,0.3)] active:scale-95"
            >
              開始遊戲
            </button>
          </div>
        )}

        {/* 2. 已暫停狀態 (PAUSED) */}
        {status === 'PAUSED' && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
              <span className="text-amber-400 font-extrabold text-xl">‖</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">遊戲已暫停</h3>
            <p className="text-xs text-slate-400 mb-5">點擊側邊欄按鈕或按下空白鍵繼續挑戰</p>
          </div>
        )}

        {/* 3. 遊戲結束狀態 (GAME_OVER) */}
        {status === 'GAME_OVER' && (
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-rose-500/15 border border-rose-500/25 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
              <AlertTriangle className="w-7 h-7 text-rose-400" />
            </div>
            <h3 className="text-3xl font-black text-white tracking-tighter mb-2 italic bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
              遊戲結束
            </h3>
            <p className="text-xs text-slate-500 max-w-[240px] mb-6 leading-relaxed">
              撞擊障礙或咬到了自己的身體！別氣餒，重整旗鼓再試一局！
            </p>
            <button
              onClick={onRestart}
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all shadow-[0_8px_20px_rgba(16,185,129,0.3)] active:scale-95"
            >
              再試一次
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
