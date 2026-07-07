/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useSnake } from './hooks/useSnake';
import { GameBoard } from './components/GameBoard';
import { ScoreBoard } from './components/ScoreBoard';
import { GameControls } from './components/GameControls';
import { MobileController } from './components/MobileController';
import { AudioControls } from './components/AudioControls';
import { Keyboard, Smartphone, Play, Trophy, RotateCcw } from 'lucide-react';

export default function App() {
  const {
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
  } = useSnake();

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-100 flex flex-col md:flex-row font-sans relative overflow-x-hidden selection:bg-emerald-500/30 antialiased">
      
      {/* 1. 左側控制與狀態欄 (Sidebar Panel) */}
      <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/10 bg-[#0f1218] flex flex-col p-6 md:p-8 shrink-0 z-10">
        {/* 機關 Logo 標誌 */}
        <div className="flex justify-center md:justify-start mb-6">
          <img 
            src={`${import.meta.env.BASE_URL}images/新北市政府稅捐稽徵處.png`}
            alt="新北市政府稅捐稽徵處 Logo" 
            className="h-14 md:h-16 w-auto object-contain brightness-105 hover:brightness-110 transition-all duration-300"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // Gracefully hide if image fails to load or is empty placeholder
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* 遊戲標題與版本 */}
        <div className="mb-8 md:mb-10 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-2.5 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[9px] font-bold text-emerald-400 tracking-wider uppercase">
              經典街機重製版
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-emerald-400 italic mb-1">
            SNAKE
          </h1>
          <p className="text-slate-500 text-xs uppercase tracking-widest">
            專業沉浸版 v2.4
          </p>
        </div>

        {/* 狀態呼吸燈與計分資訊 */}
        <div className="space-y-6 flex-grow">
          {/* 狀態指示 */}
          <div className="flex items-center gap-3 px-2 py-1.5 bg-white/5 border border-white/5 rounded-xl justify-center md:justify-start">
            <div className={`w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_10px_#10b981] ${
              status === 'PLAYING' ? 'bg-emerald-500 shadow-[0_0_12px_#10b981]' :
              status === 'PAUSED' ? 'bg-amber-500 shadow-[0_0_12px_#f59e0b]' :
              status === 'GAME_OVER' ? 'bg-rose-500 shadow-[0_0_12px_#f43f5e]' :
              'bg-slate-500 shadow-[0_0_12px_#64748b]'
            }`} />
            <span className="text-xs font-bold tracking-widest text-slate-300">
              遊戲狀態: {
                status === 'PLAYING' ? '遊戲中' :
                status === 'PAUSED' ? '已暫停' :
                status === 'GAME_OVER' ? '遊戲結束' :
                '準備開始'
              }
            </span>
          </div>

          {/* 計分板 */}
          <ScoreBoard
            score={score}
            highScore={highScore}
            difficulty={difficulty}
          />

          {/* 控制按鈕與難度選擇 */}
          <GameControls
            status={status}
            difficulty={difficulty}
            onStart={startGame}
            onPause={pauseGame}
            onResume={resumeGame}
            onRestart={resetGame}
            onChangeDifficulty={changeDifficulty}
          />

          {/* 音效控制選項 */}
          <AudioControls />
        </div>

        {/* 底部退出或說明 (選填) */}
        <div className="mt-8 pt-4 border-t border-white/5 text-center md:text-left text-[10px] text-slate-600 flex flex-col gap-1">
          <p>© 2026 Retro Gaming. All rights reserved.</p>
          <p>Powered by Vite & Tailwind CSS</p>
        </div>
      </aside>

      {/* 2. 右側/中央遊戲大畫面 (Main Panel) */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative bg-black min-h-[500px]">
        
        {/* 網格圓點背景裝飾 (Immersive UI 精髓) */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none" 
          style={{ 
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', 
            backgroundSize: '30px 30px' 
          }}
        />

        {/* 精緻主遊戲區域裝飾框 */}
        <div className="relative p-4 md:p-6 border border-white/5 rounded-3xl bg-neutral-900/40 backdrop-blur-sm shadow-2xl w-full max-w-lg md:max-w-xl">
          <GameBoard
            snake={snake}
            direction={direction}
            food={food}
            status={status}
            particles={particles}
            onStart={startGame}
            onRestart={resetGame}
          />
        </div>

        {/* 3. 桌機 W-A-S-D HUD 與 手機控制器雙向支援 */}
        <div className="mt-6 md:mt-8 w-full max-w-lg flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-10">
          
          {/* 桌機 W-A-S-D 鍵盤狀態 HUD */}
          <div className="hidden sm:flex flex-col items-center gap-2">
            <div className="flex flex-col items-center gap-1.5">
              {/* W 鍵 */}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold transition-all duration-150 border text-xs select-none ${
                direction === 'UP' && status === 'PLAYING'
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-md animate-pulse'
                  : 'bg-white/5 border-white/10 text-slate-500'
              }`}>
                W
              </div>
              
              {/* A-S-D 鍵 */}
              <div className="flex gap-1.5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold transition-all duration-150 border text-xs select-none ${
                  direction === 'LEFT' && status === 'PLAYING'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-md animate-pulse'
                    : 'bg-white/5 border-white/10 text-slate-500'
                }`}>
                  A
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold transition-all duration-150 border text-xs select-none ${
                  direction === 'DOWN' && status === 'PLAYING'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-md animate-pulse'
                    : 'bg-white/5 border-white/10 text-slate-500'
                }`}>
                  S
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold transition-all duration-150 border text-xs select-none ${
                  direction === 'RIGHT' && status === 'PLAYING'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-md animate-pulse'
                    : 'bg-white/5 border-white/10 text-slate-500'
                }`}>
                  D
                </div>
              </div>
            </div>
            <p className="text-[9px] font-black text-slate-600 tracking-widest mt-1 uppercase">
              鍵盤方向鍵狀態
            </p>
          </div>

          {/* 分割裝飾線 */}
          <div className="hidden sm:block h-12 w-[1px] bg-white/10" />

          {/* 手機直式虛擬操作盤 (會自動隱藏，或是在手動裝置下呈現) */}
          <div className="w-full sm:w-auto">
            <MobileController
              currentDirection={direction}
              status={status}
              onChangeDirection={changeDirection}
              onPause={pauseGame}
              onResume={resumeGame}
            />
          </div>
        </div>

      </main>

      {/* 底部沈浸式霓虹漸層彩帶 (Immersive UI 經典特徵) */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-transparent to-rose-500 opacity-40 pointer-events-none" />
    </div>
  );
}

