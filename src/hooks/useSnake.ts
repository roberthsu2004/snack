/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Position, Direction, GameStatus, Difficulty, Food, Particle } from '../types';
import { soundManager } from '../utils/soundManager';

export const GRID_SIZE = 20; // 20x20 的遊戲格

const DIFFICULTY_SPEEDS: Record<Difficulty, number> = {
  EASY: 160,
  MEDIUM: 110,
  HARD: 75,
};

// 初始蛇的位置：蛇頭在 (10, 8)，身體往下延伸
const INITIAL_SNAKE: Position[] = [
  { x: 10, y: 8 },
  { x: 10, y: 9 },
  { x: 10, y: 10 },
];

// 隨機產生食物
const generateFood = (snake: Position[]): Food => {
  const available: Position[] = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      // 檢查此格子是否不在蛇身上
      if (!snake.some(segment => segment.x === x && segment.y === y)) {
        available.push({ x, y });
      }
    }
  }

  // 完美通關情況 (塞滿了)
  if (available.length === 0) {
    return {
      position: { x: -1, y: -1 },
      type: 'NORMAL',
      scoreValue: 10,
      color: '#EF4444',
    };
  }

  const randomIndex = Math.floor(Math.random() * available.length);
  const pos = available[randomIndex];

  const rand = Math.random();
  if (rand > 0.92) {
    // 閃耀紫色食物：速度感 & 高分
    return {
      position: pos,
      type: 'SPEEDY',
      scoreValue: 30,
      color: '#C084FC', // 亮紫色
    };
  } else if (rand > 0.78) {
    // 黃金蘋果：高分
    return {
      position: pos,
      type: 'GOLDEN',
      scoreValue: 20,
      color: '#FACC15', // 黃金色
    };
  } else {
    // 普通蘋果
    return {
      position: pos,
      type: 'NORMAL',
      scoreValue: 10,
      color: '#F87171', // 珊瑚紅/蘋果紅
    };
  }
};

export const useSnake = () => {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>('UP');
  const [food, setFood] = useState<Food>(() => generateFood(INITIAL_SNAKE));
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('snake_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [status, setStatus] = useState<GameStatus>('READY');
  const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
  
  // 粒子特效數組
  const [particles, setParticles] = useState<Particle[]>([]);

  // 使用 refs 來存儲會頻繁變化的值，避免在 useEffect 的定時器中捕獲到舊值
  const directionRef = useRef<Direction>('UP');
  const nextDirectionRef = useRef<Direction>('UP');
  const snakeRef = useRef<Position[]>(INITIAL_SNAKE);
  const statusRef = useRef<GameStatus>('READY');
  const foodRef = useRef<Food>(food);

  // 當 state 更新時同步到 ref
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    foodRef.current = food;
  }, [food]);

  // 更新最高分數並儲存至 localStorage
  const updateHighScore = useCallback((newScore: number) => {
    if (newScore > highScore) {
      setHighScore(newScore);
      localStorage.setItem('snake_highscore', newScore.toString());
    }
  }, [highScore]);

  // 修改方向的函數 (防止在同一個 tick 內做 180 度大轉彎撞死自己)
  const changeDirection = useCallback((newDir: Direction) => {
    const currentDir = directionRef.current;
    
    // 檢查不允許反方向移動
    if (newDir === 'UP' && currentDir === 'DOWN') return;
    if (newDir === 'DOWN' && currentDir === 'UP') return;
    if (newDir === 'LEFT' && currentDir === 'RIGHT') return;
    if (newDir === 'RIGHT' && currentDir === 'LEFT') return;

    nextDirectionRef.current = newDir;
    setDirection(newDir);
  }, []);

  // 產生爆炸粒子
  const createExplosion = useCallback((x: number, y: number, color: string) => {
    const newParticles: Particle[] = [];
    const count = 15;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 1;
      newParticles.push({
        x: x + 0.5, // 粒子產生在格子的中心點
        y: y + 0.5,
        vx: Math.cos(angle) * speed * 0.15,
        vy: Math.sin(angle) * speed * 0.15,
        color: color,
        radius: Math.random() * 2.5 + 1.5,
        alpha: 1,
        decay: Math.random() * 0.03 + 0.02,
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  // 重置遊戲
  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setDirection('UP');
    directionRef.current = 'UP';
    nextDirectionRef.current = 'UP';
    const initialFood = generateFood(INITIAL_SNAKE);
    setFood(initialFood);
    setScore(0);
    setStatus('READY');
    setParticles([]);
  }, []);

  // 開始遊戲
  const startGame = useCallback(() => {
    if (status === 'GAME_OVER') {
      resetGame();
    }
    setStatus('PLAYING');
  }, [status, resetGame]);

  // 暫停遊戲
  const pauseGame = useCallback(() => {
    if (status === 'PLAYING') {
      setStatus('PAUSED');
    }
  }, [status]);

  // 繼續遊戲
  const resumeGame = useCallback(() => {
    if (status === 'PAUSED') {
      setStatus('PLAYING');
    }
  }, [status]);

  // 更改難度
  const changeDifficulty = useCallback((newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    if (status === 'READY') {
      resetGame();
    }
  }, [status, resetGame]);

  // 遊戲的單步移動 (Move Step)
  const moveSnake = useCallback(() => {
    const currentSnake = [...snakeRef.current];
    const currentDir = nextDirectionRef.current;
    
    // 更新當前方向，保持 nextDirection 同步
    directionRef.current = currentDir;

    const head = currentSnake[0];
    let newHead = { ...head };

    // 根據方向計算新頭位置
    switch (currentDir) {
      case 'UP':
        newHead.y -= 1;
        break;
      case 'DOWN':
        newHead.y += 1;
        break;
      case 'LEFT':
        newHead.x -= 1;
        break;
      case 'RIGHT':
        newHead.x += 1;
        break;
    }

    // 衝突檢測 1: 撞到邊界
    if (
      newHead.x < 0 ||
      newHead.x >= GRID_SIZE ||
      newHead.y < 0 ||
      newHead.y >= GRID_SIZE
    ) {
      setStatus('GAME_OVER');
      // 對蛇頭位置產生紅色撞牆粒子特效
      createExplosion(head.x, head.y, '#EF4444');
      return;
    }

    // 衝突檢測 2: 撞到自己
    // 注意：如果是原先的蛇尾，在移動後蛇尾會縮進去，但如果是直接咬住身體其他部分，就是遊戲結束
    const isCollidingWithSelf = currentSnake.some(
      (segment, index) => index > 0 && segment.x === newHead.x && segment.y === newHead.y
    );

    if (isCollidingWithSelf) {
      setStatus('GAME_OVER');
      createExplosion(newHead.x, newHead.y, '#F87171');
      return;
    }

    // 食物檢測
    const currentFood = foodRef.current;
    const ateFood = newHead.x === currentFood.position.x && newHead.y === currentFood.position.y;

    const newSnake = [newHead, ...currentSnake];

    if (ateFood) {
      // 吃到食物，獲得分數並產生粒子特效
      const newScore = score + currentFood.scoreValue;
      setScore(newScore);
      updateHighScore(newScore);
      
      // 播放吃到食物音效
      soundManager.playEat();
      
      // 在食物位置產生火花粒子特效
      createExplosion(currentFood.position.x, currentFood.position.y, currentFood.color);

      // 產生新食物
      const nextFood = generateFood(newSnake);
      setFood(nextFood);
    } else {
      // 沒吃到食物，移除蛇尾，保持長度
      newSnake.pop();
    }

    setSnake(newSnake);
  }, [score, updateHighScore, createExplosion]);

  // 粒子物理更新
  useEffect(() => {
    if (particles.length === 0) return;

    const animationId = requestAnimationFrame(() => {
      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            alpha: p.alpha - p.decay,
          }))
          .filter(p => p.alpha > 0)
      );
    });

    return () => cancelAnimationFrame(animationId);
  }, [particles]);

  // 處理計時器 (Game Loop Interval)
  useEffect(() => {
    if (status !== 'PLAYING') return;

    const intervalId = setInterval(() => {
      moveSnake();
    }, DIFFICULTY_SPEEDS[difficulty]);

    return () => clearInterval(intervalId);
  }, [status, difficulty, moveSnake]);

  // 處理音效與 BGM 狀態監聽
  useEffect(() => {
    if (status === 'PLAYING') {
      soundManager.playBGM();
    } else {
      soundManager.stopBGM();
    }
  }, [status]);

  useEffect(() => {
    if (status === 'GAME_OVER') {
      soundManager.playGameOver();
    }
  }, [status]);

  // 處理鍵盤控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 防止按下方向鍵時網頁滾動
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (status !== 'PLAYING') {
        if (e.key === ' ' || e.key === 'Enter') {
          startGame();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          changeDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          changeDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          changeDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          changeDirection('RIGHT');
          break;
        case ' ': // 空白鍵暫停
          pauseGame();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, changeDirection, startGame, pauseGame]);

  return {
    snake,
    direction,
    food,
    score,
    highScore,
    status,
    difficulty,
    particles,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    changeDirection,
    changeDifficulty,
  };
};
