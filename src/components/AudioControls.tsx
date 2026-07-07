import React, { useState } from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { soundManager } from '../utils/soundManager';

export const AudioControls: React.FC = () => {
  const [isMuted, setIsMuted] = useState(soundManager.isMuted);
  const [volume, setVolume] = useState(soundManager.volume);

  const handleToggleMute = () => {
    const newMuted = !isMuted;
    soundManager.setMute(newMuted);
    setIsMuted(newMuted);
    
    // Play a short chirp when unmuting to give instant feedback
    if (!newMuted) {
      soundManager.playEat();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    soundManager.setVolume(newVol);
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      soundManager.setMute(false);
      setIsMuted(false);
    }
  };

  // Select icon based on volume and mute state
  const VolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <VolumeX className="w-4 h-4 text-rose-400" />;
    } else if (volume < 0.4) {
      return <Volume1 className="w-4 h-4 text-emerald-400" />;
    } else {
      return <Volume2 className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4" id="audio-settings-card">
      <div className="flex items-center justify-between mb-2">
        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
          <VolumeIcon /> AUDIO SETTINGS / 音效與音樂
        </label>
        <span className="text-[9px] font-mono font-bold text-slate-500">
          {isMuted ? 'MUTED' : `${Math.round(volume * 100)}%`}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Mute Toggle Button */}
        <button
          onClick={handleToggleMute}
          className={`p-2.5 rounded-xl border transition-all active:scale-95 shrink-0 ${
            isMuted 
              ? 'bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/30 text-rose-400' 
              : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-slate-300'
          }`}
          title={isMuted ? "取消靜音" : "靜音"}
        >
          <VolumeIcon />
        </button>

        {/* Volume Slider */}
        <div className="flex-grow flex items-center">
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 focus:outline-none"
            style={{
              background: `linear-gradient(to right, #10b981 0%, #10b981 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.05) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.05) 100%)`
            }}
          />
        </div>
      </div>
    </div>
  );
};
