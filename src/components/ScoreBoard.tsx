/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trophy, Flame, Zap, Award } from 'lucide-react';
import { Difficulty } from '../types';

interface ScoreBoardProps {
  score: number;
  highScore: number;
  difficulty: Difficulty;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  score,
  highScore,
  difficulty,
}) => {
  // 難度對應的徽章樣式
  const getDifficultyBadge = (diff: Difficulty) => {
    switch (diff) {
      case 'EASY':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
            <Zap className="w-3.5 h-3.5 animate-pulse" /> 簡單速度
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm shadow-amber-500/5">
            <Flame className="w-3.5 h-3.5 animate-pulse" /> 中等速度
          </span>
        );
      case 'HARD':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm shadow-rose-500/5">
            <Trophy className="w-3.5 h-3.5 animate-pulse" /> 地獄速度
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full" id="game-score-board">
      {/* 當前分數 */}
      <div className="relative overflow-hidden bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:shadow-[0_8px_30px_rgba(16,185,129,0.1)]">
        <div className="absolute top-2 right-2 opacity-10">
          <Award className="w-16 h-16 text-emerald-400" />
        </div>
        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1">
          當前得分
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-mono font-bold tracking-tight text-white">
            {score.toString().padStart(4, '0')}
          </span>
          <span className="text-xs font-semibold text-emerald-500/80">分</span>
        </div>
        <div className="mt-3">
          {getDifficultyBadge(difficulty)}
        </div>
      </div>

      {/* 最高分數 */}
      <div className="relative overflow-hidden bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:shadow-[0_8px_30px_rgba(250,204,21,0.05)]">
        <div className="absolute top-2 right-2 opacity-10">
          <Trophy className="w-16 h-16 text-yellow-400" />
        </div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
          歷史最高紀錄
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-mono font-bold tracking-tight text-slate-300">
            {highScore.toString().padStart(4, '0')}
          </span>
          <span className="text-xs font-semibold text-slate-500">分</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-3 font-medium flex items-center gap-1">
          <Trophy className="w-3 h-3 text-amber-500/80" /> 經典最佳紀錄
        </p>
      </div>
    </div>
  );
};
