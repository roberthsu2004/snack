/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { Direction, GameStatus } from '../types';

interface MobileControllerProps {
  currentDirection: Direction;
  status: GameStatus;
  onChangeDirection: (direction: Direction) => void;
  onPause: () => void;
  onResume: () => void;
}

export const MobileController: React.FC<MobileControllerProps> = ({
  currentDirection,
  status,
  onChangeDirection,
  onPause,
  onResume,
}) => {
  // 處理按鍵觸發 (支援 TouchStart 以加速響應)
  const handlePress = (dir: Direction, e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onChangeDirection(dir);
  };

  const renderDirButton = (
    dir: Direction,
    icon: React.ReactNode,
    gridClass: string,
    activeBg: string
  ) => {
    const isCurrent = currentDirection === dir;
    return (
      <button
        onTouchStart={(e) => handlePress(dir, e)}
        onMouseDown={(e) => handlePress(dir, e)}
        disabled={status !== 'PLAYING'}
        className={`
          ${gridClass}
          flex items-center justify-center
          w-14 h-14 rounded-full border-2 transition-all duration-150 active:scale-90 select-none shadow-lg
          ${
            status !== 'PLAYING'
              ? 'bg-neutral-900/40 border-white/5 text-slate-700 cursor-not-allowed'
              : isCurrent
              ? `${activeBg} text-slate-950 scale-95 border-transparent shadow-[0_0_15px_rgba(52,211,153,0.35)]`
              : 'bg-neutral-800 border-white/10 text-slate-300 hover:text-white hover:border-white/20 active:bg-neutral-700'
          }
        `}
      >
        {icon}
      </button>
    );
  };

  return (
    <div 
      className="md:hidden flex flex-col items-center justify-center gap-2 py-4 w-full"
      id="mobile-virtual-pad"
    >
      <div className="relative grid grid-cols-3 gap-2.5 w-48 h-48">
        {/* 上 */}
        {renderDirButton(
          'UP',
          <ChevronUp className="w-7 h-7" />,
          'col-start-2 row-start-1',
          'bg-gradient-to-b from-emerald-400 to-cyan-400'
        )}

        {/* 左 */}
        {renderDirButton(
          'LEFT',
          <ChevronLeft className="w-7 h-7" />,
          'col-start-1 row-start-2',
          'bg-gradient-to-r from-emerald-400 to-cyan-400'
        )}

        {/* 中間：多功能控制鍵 (暫停/繼續) */}
        <div className="col-start-2 row-start-2 flex items-center justify-center">
          {status === 'PLAYING' ? (
            <button
              onTouchStart={(e) => { e.preventDefault(); onPause(); }}
              onClick={onPause}
              className="w-11 h-11 rounded-full bg-black border border-white/10 flex items-center justify-center text-slate-400 active:scale-90 active:bg-neutral-900 transition-all duration-150 shadow-inner"
              title="暫停"
            >
              <Pause className="w-4 h-4" />
            </button>
          ) : status === 'PAUSED' ? (
            <button
              onTouchStart={(e) => { e.preventDefault(); onResume(); }}
              onClick={onResume}
              className="w-11 h-11 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center active:scale-90 shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-150"
              title="繼續"
            >
              <Play className="w-4 h-4 fill-slate-950" />
            </button>
          ) : (
            <div className="w-11 h-11 rounded-full bg-black border border-white/5 flex items-center justify-center text-slate-700">
              <span className="text-[10px] font-bold">●</span>
            </div>
          )}
        </div>

        {/* 右 */}
        {renderDirButton(
          'RIGHT',
          <ChevronRight className="w-7 h-7" />,
          'col-start-3 row-start-2',
          'bg-gradient-to-l from-emerald-400 to-cyan-400'
        )}

        {/* 下 */}
        {renderDirButton(
          'DOWN',
          <ChevronDown className="w-7 h-7" />,
          'col-start-2 row-start-3',
          'bg-gradient-to-t from-emerald-400 to-cyan-400'
        )}
      </div>
      <p className="text-[9px] font-black text-slate-600 tracking-widest uppercase pointer-events-none select-none mt-1">
        虛擬觸控十字鍵盤
      </p>
    </div>
  );
};
