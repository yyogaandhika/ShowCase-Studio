import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Video,
  Compass,
  Volume2,
  VolumeX,
  Music,
  Upload,
  Command,
  Check,
} from 'lucide-react';
import { useStore, DEFAULT_AUDIO } from '../store/useStore';
import { getEngineInstance } from '../engine/engineInstance';
import { AudioPresetId } from '../types';

export const TimelineBar: React.FC = () => {
  const {
    isPlaying,
    currentTime,
    isFreeCamera,
    project,
    lastSavedAt,
    isSaving,
    setIsPlaying,
    setCurrentTime,
    setIsFreeCamera,
    setAudioConfig,
    toggleAudioMute,
    setShortcutsModalOpen,
  } = useStore();

  const [isAudioMenuOpen, setIsAudioMenuOpen] = useState(false);
  const audioMenuRef = useRef<HTMLDivElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);

  const audio = project.audio || DEFAULT_AUDIO;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (audioMenuRef.current && !audioMenuRef.current.contains(e.target as Node)) {
        setIsAudioMenuOpen(false);
      }
    };
    if (isAudioMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAudioMenuOpen]);

  const handlePlayPause = () => {
    const engine = getEngineInstance();
    if (!engine) return;

    if (isPlaying) {
      engine.pause();
      setIsPlaying(false);
    } else {
      engine.play();
      setIsPlaying(true);
      setIsFreeCamera(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newT = Number(e.target.value);
    setCurrentTime(newT);
    const engine = getEngineInstance();
    if (engine) {
      engine.setTime(newT);
    }
  };

  const handleRewind = () => {
    setCurrentTime(0);
    const engine = getEngineInstance();
    if (engine) {
      engine.setTime(0);
    }
  };

  const handleToggleFreeCamera = () => {
    const engine = getEngineInstance();
    if (engine) {
      const isFree = engine.toggleFreeCamera();
      setIsFreeCamera(isFree);
      if (isFree) setIsPlaying(false);
    }
  };

  const handleCustomAudioUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setAudioConfig({
      preset: 'custom',
      customAudioUrl: url,
      customAudioName: file.name,
      enabled: true,
      isMuted: false,
    });
  };

  // Format seconds to mm:ss
  const currentSec = Math.floor(currentTime * project.duration);
  const totalSec = project.duration;
  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const audioPresets: { id: AudioPresetId; label: string; desc: string; emoji: string }[] = [
    {
      id: 'cyber_pulse',
      label: 'Cyber Future Bass',
      desc: '128 BPM Punchy electronic beat & synth chords',
      emoji: '⚡',
    },
    {
      id: 'lofi_ambient',
      label: 'Lo-Fi Chill Ambient',
      desc: '84 BPM Relaxed rhodes chords & warm groove',
      emoji: '☕',
    },
    {
      id: 'minimal_tech',
      label: 'Minimal Tech Showreel',
      desc: '124 BPM Deep sub groove & crisp percussion',
      emoji: '🎛️',
    },
    {
      id: 'uplifting_saas',
      label: 'Uplifting SaaS Chimes',
      desc: '120 BPM Crystal arpeggios & hopeful energy',
      emoji: '🚀',
    },
    {
      id: 'none',
      label: 'Hening / Tanpa Musik',
      desc: 'Mute track audio sepenuhnya',
      emoji: '🚫',
    },
  ];

  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-zinc-950/90 backdrop-blur-xl border border-zinc-800/80 shadow-2xl shadow-black/80 max-w-2xl w-[94%] md:w-[620px] select-none">
      {/* Rewind */}
      <button
        onClick={handleRewind}
        title="Putar dari awal (R)"
        className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>

      {/* Play / Pause button */}
      <button
        onClick={handlePlayPause}
        title={isPlaying ? 'Jeda animasi (Spasi)' : 'Putar animasi (Spasi)'}
        className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all shadow-md shadow-blue-600/30 active:scale-95 shrink-0"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current ml-0.5" />
        )}
      </button>

      {/* Time indicator */}
      <div className="font-mono text-[11px] text-zinc-400 shrink-0 w-16 text-center">
        <span className="text-zinc-200">{formatTime(currentSec)}</span> /{' '}
        <span>{formatTime(totalSec)}</span>
      </div>

      {/* Timeline Scrubber */}
      <div className="flex-1 relative flex items-center">
        <input
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
        />
      </div>

      {/* Camera Mode Toggle */}
      <button
        onClick={handleToggleFreeCamera}
        title={
          isFreeCamera
            ? 'Mode Orbit Kamera Aktif (Tekan F)'
            : 'Jalur Sinematik Otomatis Aktif (Tekan F)'
        }
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all shrink-0 ${
          isFreeCamera
            ? 'bg-amber-950/40 border-amber-500/80 text-amber-300'
            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
        }`}
      >
        {isFreeCamera ? (
          <>
            <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span className="text-[10px] hidden sm:inline">Orbit</span>
          </>
        ) : (
          <>
            <Video className="w-3.5 h-3.5" />
            <span className="text-[10px] hidden sm:inline">Cinematic</span>
          </>
        )}
      </button>

      {/* Audio Soundtrack Menu Button */}
      <div className="relative shrink-0" ref={audioMenuRef}>
        <button
          onClick={() => setIsAudioMenuOpen((prev) => !prev)}
          title={`Audio Soundtrack (M): ${audio.isMuted ? 'Muted' : audio.preset}`}
          className={`flex items-center gap-1 p-1.5 rounded-full border transition-colors ${
            audio.isMuted || !audio.enabled || audio.preset === 'none'
              ? 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:text-zinc-300'
              : 'bg-blue-950/30 border-blue-500/50 text-blue-400 shadow-sm shadow-blue-500/10'
          }`}
        >
          {audio.isMuted || !audio.enabled || audio.preset === 'none' ? (
            <VolumeX className="w-3.5 h-3.5" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
        </button>

        {isAudioMenuOpen && (
          <div className="absolute bottom-full mb-3 right-0 w-64 rounded-2xl bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 shadow-2xl p-3 space-y-3 z-50 text-xs animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-200">
                <Music className="w-4 h-4 text-blue-400" />
                <span>Showreel Soundtrack</span>
              </div>
              <button
                onClick={toggleAudioMute}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  audio.isMuted
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {audio.isMuted ? 'MUTED' : 'ACTIVE'}
              </button>
            </div>

            {/* Volume Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-zinc-400">
                <span>Volume Audio</span>
                <span className="font-mono text-zinc-300">{Math.round(audio.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={audio.volume}
                onChange={(e) => setAudioConfig({ volume: Number(e.target.value) })}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Preset Selector */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 block">
                Pilihan Musik Procedural
              </span>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {audioPresets.map((pr) => {
                  const active = audio.preset === pr.id;
                  return (
                    <button
                      key={pr.id}
                      onClick={() => setAudioConfig({ preset: pr.id, enabled: true, isMuted: false })}
                      className={`w-full flex items-start gap-2 p-2 rounded-lg text-left transition-colors border ${
                        active
                          ? 'bg-blue-950/40 border-blue-500/60 text-blue-200'
                          : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                      }`}
                    >
                      <span className="text-base">{pr.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs truncate flex items-center justify-between">
                          <span>{pr.label}</span>
                          {active && <Check className="w-3 h-3 text-blue-400" />}
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-tight mt-0.5">{pr.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Audio Upload */}
            <div className="pt-1 border-t border-zinc-800/80">
              <input
                ref={audioFileInputRef}
                type="file"
                accept="audio/mp3,audio/wav,audio/aac,audio/ogg"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleCustomAudioUpload(f);
                }}
              />
              <button
                onClick={() => audioFileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-zinc-400" />
                <span className="truncate">
                  {audio.preset === 'custom' && audio.customAudioName
                    ? audio.customAudioName
                    : 'Unggah Audio Sendiri (MP3)'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Trigger Button */}
      <button
        onClick={() => setShortcutsModalOpen(true)}
        title="Buka Daftar Tombol Pintas Keyboard (?)"
        className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors shrink-0"
      >
        <Command className="w-3.5 h-3.5" />
      </button>

      {/* Auto-Save & IndexedDB Status Badge */}
      <div
        title={
          isSaving
            ? 'Menyimpan perubahan ke IndexedDB lokal...'
            : `Tersimpan di IndexedDB browser (${new Date(lastSavedAt || Date.now()).toLocaleTimeString()})`
        }
        className="hidden lg:flex items-center gap-1 text-[10px] text-zinc-500 shrink-0 font-mono pl-1"
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isSaving ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'
          }`}
        />
        <span className="hidden xl:inline">{isSaving ? 'Menyimpan...' : 'Tersimpan'}</span>
      </div>
    </div>
  );
};
