import React from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Maximize2,
  Layers,
  ZoomIn,
  Briefcase,
  RotateCw,
  Compass,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { getEngineInstance } from '../engine/engineInstance';
import { SceneType, AspectRatio } from '../types';

export const PitchModeOverlay: React.FC = () => {
  const {
    project,
    isPitchMode,
    setIsPitchMode,
    isPlaying,
    setIsPlaying,
    setCurrentTime,
    setSceneType,
    setAspectRatio,
  } = useStore();

  if (!isPitchMode) return null;

  const handlePlayPause = () => {
    const engine = getEngineInstance();
    if (!engine) return;
    if (isPlaying) {
      engine.pause();
      setIsPlaying(false);
    } else {
      engine.play();
      setIsPlaying(true);
    }
  };

  const handleRewind = () => {
    setCurrentTime(0);
    const engine = getEngineInstance();
    if (engine) engine.setTime(0);
  };

  const handleSceneChange = (sc: SceneType) => {
    setSceneType(sc);
    const engine = getEngineInstance();
    if (engine) engine.updateSceneType(sc);
  };

  const scenes: { id: SceneType; label: string; icon: React.ReactNode }[] = [
    { id: 'hero', label: 'Hero', icon: <Sparkles className="w-3.5 h-3.5 text-blue-400" /> },
    { id: 'duo', label: 'Duo', icon: <Layers className="w-3.5 h-3.5 text-purple-400" /> },
    { id: 'zoom', label: 'Zoom', icon: <ZoomIn className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: 'portfolio', label: 'Portfolio', icon: <Briefcase className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'orbit', label: 'Orbit', icon: <RotateCw className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: 'drift', label: 'Drift', icon: <Compass className="w-3.5 h-3.5 text-pink-400" /> },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none z-40 flex flex-col justify-between p-6 select-none animate-in fade-in duration-300">
      {/* Top Floating Keynote Bar */}
      <div className="pointer-events-auto mx-auto flex items-center gap-4 px-5 py-2.5 rounded-full bg-zinc-950/80 backdrop-blur-2xl border border-zinc-800/80 shadow-2xl shadow-black/80">
        {/* Project & Client Identity */}
        <div className="flex items-center gap-2 pr-3 border-r border-zinc-800">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <div className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>{project.name}</span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                PITCH MODE
              </span>
            </div>
            {project.clientName && (
              <div className="text-[10px] text-zinc-400">Client: {project.clientName}</div>
            )}
          </div>
        </div>

        {/* Scene Switcher Pills */}
        <div className="flex items-center gap-1 bg-zinc-900/60 p-0.5 rounded-full border border-zinc-800">
          {scenes.map((s) => {
            const active = project.sceneType === s.id;
            return (
              <button
                key={s.id}
                onClick={() => handleSceneChange(s.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {s.icon}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Aspect Ratio */}
        <div className="flex items-center bg-zinc-900/60 p-0.5 rounded-full border border-zinc-800 text-xs">
          {(['16:9', '9:16', '1:1'] as AspectRatio[]).map((r) => (
            <button
              key={r}
              onClick={() => setAspectRatio(r)}
              className={`px-2 py-0.5 rounded-full font-mono text-[10px] transition-all ${
                project.aspectRatio === r
                  ? 'bg-zinc-800 text-white font-bold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Play / Pause */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleRewind}
            title="Rewind (R)"
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handlePlayPause}
            className="w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all shadow-md active:scale-95"
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            )}
          </button>
        </div>

        {/* Exit Pitch Mode */}
        <button
          onClick={() => setIsPitchMode(false)}
          title="Keluar dari Pitch Mode (Esc)"
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          <span>Exit</span>
        </button>
      </div>

      {/* Bottom Hint */}
      <div className="text-center text-[11px] text-zinc-500">
        <span>Tekan </span>
        <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-300 font-mono text-[10px]">
          Esc
        </kbd>
        <span> atau klik Exit untuk kembali ke mode editor studio</span>
      </div>
    </div>
  );
};
