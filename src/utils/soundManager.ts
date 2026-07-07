import { Howl } from 'howler';

// Web Audio API Synthesizer Fallback for immediate zero-config feedback
let audioCtx: AudioContext | null = null;
let bgmSynthInterval: any = null;
let bgmNoteIndex = 0;

// Retro 8-bit melody: Lively 16-step Pentatonic Sequence with Rest beats (0)
const BGM_MELODY = [
  261.63, 329.63, 392.00, 261.63, 
  293.66, 0,      392.00, 329.63, 
  440.00, 523.25, 392.00, 0, 
  349.23, 329.63, 293.66, 0
];

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (e) {
    console.warn('Web Audio Context not supported or blocked:', e);
    return null;
  }
}

class SoundManager {
  private bgm: Howl | null = null;
  private eatSound: Howl | null = null;
  private gameOverSound: Howl | null = null;

  // Setting States
  private _isMuted: boolean = false;
  private _volume: number = 0.5; // Range: 0.0 to 1.0

  // Fallback trackers: Default to true until checked and verified to prevent 404/decode crashes.
  private bgmLoadFailed = true;
  private eatLoadFailed = true;
  private gameOverLoadFailed = true;

  constructor() {
    // Load volume and mute settings from localStorage
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('snake_muted');
      const savedVolume = localStorage.getItem('snake_volume');
      
      this._isMuted = savedMute === 'true';
      this._volume = savedVolume ? parseFloat(savedVolume) : 0.5;

      // Add safety listener to swallow any unhandled Web Audio / decode rejections
      window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason?.message || String(event.reason || '');
        if (
          reason.includes('decode') || 
          reason.includes('Audio') || 
          reason.includes('audio') || 
          reason.includes('play()') ||
          reason.includes('NotSupportedError') ||
          reason.includes('sound') ||
          reason.includes('Howl')
        ) {
          console.warn('Gracefully intercepted unhandled audio promise rejection:', event.reason);
          event.preventDefault(); // Prevents it from registering as an uncaught application error
        }
      });

      // Add safety listener for general resource loading/decoding errors
      window.addEventListener('error', (event) => {
        const message = event.message || '';
        const source = event.filename || '';
        if (
          message.includes('decode') || 
          message.includes('Audio') || 
          message.includes('audio') || 
          message.includes('Image') ||
          message.includes('image') ||
          source.includes('sounds') || 
          source.includes('images') ||
          source.includes('Howl') ||
          source.includes('howler')
        ) {
          console.warn('Gracefully intercepted media/resource error:', message, 'at', source);
          event.preventDefault(); // Prevents it from registering as an uncaught application error
        }
      }, true); // Use capture phase to catch resource loading errors too!

      this.checkAndInit().catch((err) => {
        console.warn('Silent error during soundManager checkAndInit:', err);
      });
    }
  }

  private async checkAndInit() {
    try {
      const checkFile = async (url: string): Promise<boolean> => {
        try {
          const res = await fetch(url);
          if (!res.ok) return false;
          
          // Ensure we are not getting an HTML fallback page (like index.html in SPAs) or JSON
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('text/html') || contentType.includes('application/json')) {
            return false;
          }

          const blob = await res.blob();
          return blob.size > 100; // Must be larger than 100 bytes to be a valid audio file
        } catch (e) {
          return false;
        }
      };

      const bgmPath = encodeURI('/sounds/背景聲.wav');
      const eatPath = encodeURI('/sounds/吃食物.mp3');
      const gameOverPath = encodeURI('/sounds/gameover.wav');

      const [hasBgm, hasEat, hasGameOver] = await Promise.all([
        checkFile(bgmPath),
        checkFile(eatPath),
        checkFile(gameOverPath)
      ]);

      if (hasBgm) {
        try {
          this.bgm = new Howl({
            src: [bgmPath],
            loop: true,
            volume: this._isMuted ? 0 : this._volume * 0.35, // BGM a bit softer
            onload: () => {
              this.bgmLoadFailed = false;
              // If the synthesizer was playing, seamlessly transition to the real audio file
              if (bgmSynthInterval) {
                this.stopSynthBGM();
                this.playBGM();
              }
            },
            onloaderror: (id, err) => {
              console.warn('BGM load failed. Fallback to synthesizer:', err);
              this.bgmLoadFailed = true;
            }
          });
        } catch (err) {
          console.warn('BGM Howler constructor exception:', err);
          this.bgmLoadFailed = true;
        }
      } else {
        this.bgmLoadFailed = true;
      }

      if (hasEat) {
        try {
          this.eatSound = new Howl({
            src: [eatPath],
            volume: this._isMuted ? 0 : this._volume,
            onload: () => {
              this.eatLoadFailed = false;
            },
            onloaderror: (id, err) => {
              console.warn('Eat sound load failed. Fallback to synthesizer:', err);
              this.eatLoadFailed = true;
            }
          });
        } catch (err) {
          console.warn('Eat sound Howler constructor exception:', err);
          this.eatLoadFailed = true;
        }
      } else {
        this.eatLoadFailed = true;
      }

      if (hasGameOver) {
        try {
          this.gameOverSound = new Howl({
            src: [gameOverPath],
            volume: this._isMuted ? 0 : this._volume,
            onload: () => {
              this.gameOverLoadFailed = false;
            },
            onloaderror: (id, err) => {
              console.warn('Game Over sound load failed. Fallback to synthesizer:', err);
              this.gameOverLoadFailed = true;
            }
          });
        } catch (err) {
          console.warn('Game Over Howler constructor exception:', err);
          this.gameOverLoadFailed = true;
        }
      } else {
        this.gameOverLoadFailed = true;
      }
    } catch (globalErr) {
      console.warn('Global error inside checkAndInit:', globalErr);
    }
  }

  // Getters
  public get isMuted(): boolean {
    return this._isMuted;
  }

  public get volume(): number {
    return this._volume;
  }

  // Set Mute Status
  public setMute(muted: boolean) {
    this._isMuted = muted;
    localStorage.setItem('snake_muted', String(muted));

    // Update Howler instances
    if (this.bgm) {
      this.bgm.mute(muted);
    }
    if (this.eatSound) {
      this.eatSound.mute(muted);
    }
    if (this.gameOverSound) {
      this.gameOverSound.mute(muted);
    }

    // If synthesizing BGM, mute/unmute is handled in the playback tick or volume checking
  }

  // Update Volume
  public setVolume(vol: number) {
    const clampedVol = Math.max(0, Math.min(1, vol));
    this._volume = clampedVol;
    localStorage.setItem('snake_volume', String(clampedVol));

    // Update Howler instances
    if (this.bgm) {
      this.bgm.volume(this._isMuted ? 0 : clampedVol * 0.25);
    }
    if (this.eatSound) {
      this.eatSound.volume(this._isMuted ? 0 : clampedVol);
    }
    if (this.gameOverSound) {
      this.gameOverSound.volume(this._isMuted ? 0 : clampedVol);
    }
  }

  // Play BGM
  public playBGM() {
    if (this._isMuted) return;

    if (!this.bgmLoadFailed && this.bgm) {
      try {
        if (!this.bgm.playing()) {
          this.bgm.play();
        }
        return;
      } catch (e) {
        console.warn('Howler BGM play failed, playing synthetic synth BGM instead:', e);
      }
    }

    // Fallback Synth BGM
    this.startSynthBGM();
  }

  // Stop BGM
  public stopBGM() {
    if (this.bgm && this.bgm.playing()) {
      this.bgm.stop();
    }
    this.stopSynthBGM();
  }

  // Play Eat Sound
  public playEat() {
    if (this._isMuted) return;

    if (!this.eatLoadFailed && this.eatSound) {
      try {
        this.eatSound.play();
        return;
      } catch (e) {
        // Fall through to synth
      }
    }

    // Fallback Retro Synth Eat Sound (Upward sweep)
    this.playEatSynth();
  }

  // Play Game Over Sound
  public playGameOver() {
    if (this._isMuted) return;

    if (!this.gameOverLoadFailed && this.gameOverSound) {
      try {
        this.gameOverSound.play();
        return;
      } catch (e) {
        // Fall through to synth
      }
    }

    // Fallback Retro Synth Game Over (Downward dramatic sweep)
    this.playGameOverSynth();
  }

  // Synth Fallbacks Implementation
  private startSynthBGM() {
    if (bgmSynthInterval) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    bgmSynthInterval = setInterval(() => {
      if (this._isMuted) return;
      try {
        const now = ctx.currentTime;
        const freq = BGM_MELODY[bgmNoteIndex % BGM_MELODY.length];
        bgmNoteIndex++;

        // Only play if it's not a rest beat (0)
        if (freq > 0) {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();

          osc.connect(gainNode);
          gainNode.connect(ctx.destination);

          osc.type = 'triangle'; // Soft and warm 8-bit square/triangle tone
          osc.frequency.setValueAtTime(freq, now);

          // Keep background volume subtle and balanced
          gainNode.gain.setValueAtTime(this._volume * 0.04, now);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

          osc.start(now);
          osc.stop(now + 0.28);
        }
      } catch (e) {
        // Suppress audio context errors
      }
    }, 280); // Upbeat retro tempo
  }

  private stopSynthBGM() {
    if (bgmSynthInterval) {
      clearInterval(bgmSynthInterval);
      bgmSynthInterval = null;
    }
  }

  private playEatSynth() {
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const vol = this._volume;

      // Note 1: C5 (523.25 Hz) - Crisp, brief chime start
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(vol * 0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc1.start(now);
      osc1.stop(now + 0.06);

      // Note 2: E5 (659.25 Hz) - Classic upward chime resolution
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.05);
      gain2.gain.setValueAtTime(vol * 0.18, now + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
      osc2.start(now + 0.05);
      osc2.stop(now + 0.17);
    } catch (e) {
      // Audio context blocked/uninitialized
    }
  }

  private playGameOverSynth() {
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const vol = this._volume;
      
      // Classic 8-bit cascading dramatic minor scale: A4 (440) -> F4 (349) -> E4 (329) -> C4 (261)
      const notes = [440.00, 349.23, 329.63, 261.63];
      const noteDuration = 0.16;

      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.type = 'triangle'; // Soft flute-like arcade tone for dramatic impact
        const startTime = now + index * noteDuration;
        osc.frequency.setValueAtTime(freq, startTime);
        
        gainNode.gain.setValueAtTime(vol * 0.15, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);

        osc.start(startTime);
        osc.stop(startTime + noteDuration);
      });
    } catch (e) {
      // Audio context blocked/uninitialized
    }
  }
}

export const soundManager = new SoundManager();
