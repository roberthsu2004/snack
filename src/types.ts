/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// 座標定義
export interface Position {
  x: number;
  y: number;
}

// 移動方向
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

// 遊戲狀態
// READY: 準備開始, PLAYING: 進行中, PAUSED: 已暫停, GAME_OVER: 遊戲結束
export type GameStatus = 'READY' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

// 遊戲難度/速度
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

// 食物類型 (可選功能：提供不同分數的食物增加趣味性)
export interface Food {
  position: Position;
  type: 'NORMAL' | 'GOLDEN' | 'SPEEDY';
  scoreValue: number;
  color: string;
}

// 粒子特效 (吃到食物時的視覺效果)
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  alpha: number;
  decay: number;
}
