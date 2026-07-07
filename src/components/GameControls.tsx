/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Pause, RotateCcw, Shield, HelpCircle, Swords, Zap } from 'lucide-react';
import { GameStatus, Difficulty } from '../types';

interface GameControlsProps {
  status: GameStatus;
  difficulty: Difficulty;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  onChangeDifficulty: (difficulty: Difficulty) => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  status,
  difficulty,
  onStart,
  onPause,
  onResume,
  onRestart,
  onChangeDifficulty,
}) => {
  return (
    <div className="flex flex-col gap-4 w-full" id="game-controls-panel">
      {/* 核心操作按鈕群組 */}
      <div className="flex gap-3">
        {status === 'READY' && (
          <button
            onClick={onStart}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all shadow-[0_8px_20px_rgba(16,185,129,0.2)] active:scale-95"
          >
            <Play className="w-4 h-4 fill-black" /> 開始遊戲
          </button>
        )}

        {status === 'PLAYING' && (
          <button
            onClick={onPause}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-xl transition-all active:scale-95"
          >
            <Pause className="w-4 h-4" /> 暫停遊戲
          </button>
        )}

        {status === 'PAUSED' && (
          <button
            onClick={onResume}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all shadow-[0_8px_20px_rgba(16,185,129,0.2)] active:scale-95"
          >
            <Play className="w-4 h-4 fill-black" /> 繼續遊戲
          </button>
        )}

        {status === 'GAME_OVER' && (
          <button
            onClick={onRestart}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all shadow-[0_8px_20px_rgba(16,185,129,0.2)] active:scale-95"
          >
            <RotateCcw className="w-4 h-4" /> 再玩一次
          </button>
        )}

        {/* 任何非 Ready 狀態都可以點選 Reset 重設 */}
        {status !== 'READY' && (
          <button
            onClick={onRestart}
            title="完全重置"
            className="px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-95"
          >
            <RotateCcw className="w-4.5 h-4.5" />
          </button>
        )}
      </div>

      {/* 難度選擇器 */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" /> 速度與難度設定
          </label>
          {status !== 'READY' && (
            <span className="text-[10px] text-slate-500 font-medium">重玩生效</span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map(d => {
            const isSelected = difficulty === d;
            let activeStyle = '';
            let labelText = '';

            switch (d) {
              case 'EASY':
                activeStyle = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
                labelText = '休閒';
                break;
              case 'MEDIUM':
                activeStyle = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
                labelText = '中等';
                break;
              case 'HARD':
                activeStyle = 'bg-rose-500/20 text-rose-400 border-rose-500/30';
                labelText = '地獄';
                break;
            }

            return (
              <button
                key={d}
                disabled={status === 'PLAYING' || status === 'PAUSED'}
                onClick={() => onChangeDifficulty(d)}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all duration-200 ${
                  isSelected
                    ? activeStyle
                    : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/10 hover:text-slate-300 disabled:opacity-40'
                }`}
              >
                {labelText}
              </button>
            );
          })}
        </div>
      </div>

      {/* 遊戲溫馨提醒 & 食物說明 */}
      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-2.5">
        <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" /> 食物道具指南
        </h4>
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center justify-center p-2 bg-black/40 rounded-xl border border-white/5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse mb-1"></span>
            <span className="text-[9px] font-bold text-slate-300">普通蘋果</span>
            <span className="text-[8px] text-slate-500">10 分</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 bg-black/40 rounded-xl border border-white/5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse mb-1 shadow-[0_0_8px_#facc15]"></span>
            <span className="text-[9px] font-bold text-amber-400">黃金蜜桃</span>
            <span className="text-[8px] text-slate-500">20 分</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 bg-black/40 rounded-xl border border-white/5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse mb-1 shadow-[0_0_8px_#c084fc]"></span>
            <span className="text-[9px] font-bold text-purple-400">魔幻野莓</span>
            <span className="text-[8px] text-slate-500">30 分</span>
          </div>
        </div>
      </div>
    </div>
  );
};
