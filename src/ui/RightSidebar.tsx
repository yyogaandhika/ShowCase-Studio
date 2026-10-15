import React from 'react';
import {
  Sun,
  Sparkles,
  Sunset,
  Palette,
  Clock,
  Sliders,
  Wand2,
  Gauge,
  Aperture,
} from 'lucide-react';
import { useStore, DEFAULT_RENDER_SETTINGS } from '../store/useStore';
import { ChassisFinish, DurationOption, LightingPreset } from '../types';
import { getEngineInstance } from '../engine/engineInstance';
import { UmkmEtalasePanel } from './UmkmEtalasePanel';
import { useTranslation } from '../i18n/useTranslation';

export const RightSidebar: React.FC = () => {
  const {
    project,
    setLightingPreset,
    setChassisColor,
    setChassisFinish,
    setBackground,
    setDuration,
    setRenderSettings,
  } = useStore();

  const { t } = useTranslation();
  const renderSettings = project.renderSettings || DEFAULT_RENDER_SETTINGS;

  const handleLightingChange = (preset: LightingPreset) => {
    setLightingPreset(preset);
    const engine = getEngineInstance();
    if (engine) engine.updateLighting(preset);
  };

  const handleChassisChange = (color: string) => {
    setChassisColor(color);
    const engine = getEngineInstance();
    if (engine) engine.updateChassisColor(color);
  };

  const handleBackgroundChange = (
    color1: string,
    color2: string,
    type: 'solid' | 'gradient' = project.background.type,
    angle: number = project.background.angle
  ) => {
    const newBg = { type, color1, color2, angle };
    setBackground(newBg);
    const engine = getEngineInstance();
    if (engine) engine.updateBackground(newBg);
  };

  const handleDurationChange = (dur: DurationOption) => {
    setDuration(dur);
    const engine = getEngineInstance();
    if (engine) engine.setDuration(dur);
  };

  const chassisPresets = [
    { name: 'Dark Titanium', hex: '#1f2124' },
    { name: 'Silver Aluminum', hex: '#d1d5db' },
    { name: 'Midnight Navy', hex: '#172554' },
    { name: 'Starlight', hex: '#e2d9cc' },
    { name: 'Emerald', hex: '#064e3b' },
  ];

  const backdropPresets = [
    { name: 'Obsidian Night', c1: '#09090b', c2: '#020617', angle: 135 },
    { name: 'Agency Slate', c1: '#1e293b', c2: '#0f172a', angle: 145 },
    { name: 'Cyber Violet', c1: '#180e29', c2: '#0a0a1a', angle: 120 },
    { name: 'Sunset Warmth', c1: '#2a1124', c2: '#11091a', angle: 135 },
    { name: 'Studio Minimal', c1: '#e2e8f0', c2: '#cbd5e1', angle: 180 },
  ];

  return (
    <aside className="w-72 bg-zinc-950/80 border-l border-zinc-800/80 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto select-none p-3 space-y-5">
      {/* 1. Lighting Preset */}
      <section>
        <div className="flex items-center gap-1.5 mb-2">
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Studio Lighting
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {[
            {
              id: 'studio' as LightingPreset,
              label: 'Neutral',
              icon: <Sun className="w-3.5 h-3.5 text-zinc-300" />,
              color: '#ffffff',
            },
            {
              id: 'neon' as LightingPreset,
              label: 'Neon',
              icon: <Sparkles className="w-3.5 h-3.5 text-cyan-400" />,
              color: '#00f0ff',
            },
            {
              id: 'sunset' as LightingPreset,
              label: 'Sunset',
              icon: <Sunset className="w-3.5 h-3.5 text-amber-400" />,
              color: '#ffaa40',
            },
          ].map((lt) => {
            const active = project.lightingPreset === lt.id;
            return (
              <button
                key={lt.id}
                onClick={() => handleLightingChange(lt.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all text-xs ${
                  active
                    ? 'bg-zinc-800 border-blue-500/80 text-white shadow-sm'
                    : 'bg-zinc-900/60 border-zinc-800/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full mb-1 border border-white/20 shadow-xs"
                  style={{ backgroundColor: lt.color }}
                />
                <span className="text-[11px] font-medium">{lt.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Device Chassis Color */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Chassis Finish
            </span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">
            {project.chassisColor.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          {chassisPresets.map((ch) => {
            const active =
              project.chassisColor.toLowerCase() === ch.hex.toLowerCase();
            return (
              <button
                key={ch.hex}
                onClick={() => handleChassisChange(ch.hex)}
                title={ch.name}
                className={`w-7 h-7 rounded-full border transition-transform ${
                  active
                    ? 'scale-115 ring-2 ring-blue-500 ring-offset-2 ring-offset-zinc-950 border-white'
                    : 'border-zinc-700 hover:scale-105'
                }`}
                style={{ backgroundColor: ch.hex }}
              />
            );
          })}
          {/* Custom color picker */}
          <div className="relative">
            <input
              type="color"
              value={project.chassisColor}
              onChange={(e) => handleChassisChange(e.target.value)}
              className="w-7 h-7 rounded-full border border-zinc-700 cursor-pointer overflow-hidden opacity-0 absolute inset-0"
            />
            <div
              className="w-7 h-7 rounded-full border border-dashed border-zinc-600 flex items-center justify-center text-[10px] text-zinc-400 hover:text-zinc-200"
              title="Custom Chassis Color"
            >
              +
            </div>
          </div>
        </div>

        {/* Chassis Material Texture Finishes */}
        <div className="space-y-1.5 pt-2 border-t border-zinc-800/60">
          <span className="text-[10px] text-zinc-400 font-medium block">
            Material Texture Finish
          </span>
          <div className="grid grid-cols-2 gap-1 text-[10px]">
            {[
              { id: 'matte' as ChassisFinish, label: 'Matte Stealth', desc: 'Non-reflective' },
              { id: 'anodized' as ChassisFinish, label: 'Anodized Alum', desc: 'Aerospace finish' },
              { id: 'ceramic' as ChassisFinish, label: 'Glossy Ceramic', desc: 'Glazed specular' },
              { id: 'chrome' as ChassisFinish, label: 'Cyber Chrome', desc: 'High reflection' },
            ].map((f) => {
              const active = (project.chassisFinish || 'anodized') === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setChassisFinish(f.id)}
                  className={`p-1.5 rounded-lg border text-left transition-all ${
                    active
                      ? 'bg-blue-950/40 border-blue-500/80 text-blue-200 shadow-xs'
                      : 'bg-zinc-900/60 border-zinc-800/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <div className="font-semibold truncate">{f.label}</div>
                  <div className="text-[9px] text-zinc-500 truncate">{f.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Studio Backdrop */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Backdrop
            </span>
          </div>

          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded p-0.5 text-[10px]">
            <button
              onClick={() =>
                handleBackgroundChange(
                  project.background.color1,
                  project.background.color2,
                  'solid'
                )
              }
              className={`px-1.5 py-0.5 rounded ${
                project.background.type === 'solid'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Solid
            </button>
            <button
              onClick={() =>
                handleBackgroundChange(
                  project.background.color1,
                  project.background.color2,
                  'gradient'
                )
              }
              className={`px-1.5 py-0.5 rounded ${
                project.background.type === 'gradient'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Gradient
            </button>
          </div>
        </div>

        {/* Backdrop Presets */}
        <div className="grid grid-cols-5 gap-1.5">
          {backdropPresets.map((bp) => (
            <button
              key={bp.name}
              onClick={() =>
                handleBackgroundChange(bp.c1, bp.c2, 'gradient', bp.angle)
              }
              title={bp.name}
              className="h-7 rounded-md border border-zinc-700/80 hover:border-zinc-500 transition-all shadow-xs"
              style={{
                background: `linear-gradient(${bp.angle}deg, ${bp.c1}, ${bp.c2})`,
              }}
            />
          ))}
        </div>

        {/* Color pickers */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-zinc-900 p-2 rounded-lg border border-zinc-800/80 flex items-center justify-between">
            <span className="text-zinc-400 text-[11px]">Color 1</span>
            <input
              type="color"
              value={project.background.color1}
              onChange={(e) =>
                handleBackgroundChange(e.target.value, project.background.color2)
              }
              className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
            />
          </div>

          {project.background.type === 'gradient' && (
            <div className="bg-zinc-900 p-2 rounded-lg border border-zinc-800/80 flex items-center justify-between">
              <span className="text-zinc-400 text-[11px]">Color 2</span>
              <input
                type="color"
                value={project.background.color2}
                onChange={(e) =>
                  handleBackgroundChange(project.background.color1, e.target.value)
                }
                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
              />
            </div>
          )}
        </div>

        {project.background.type === 'gradient' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-zinc-500">
              <span>Gradient Angle</span>
              <span>{project.background.angle}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={project.background.angle}
              onChange={(e) =>
                handleBackgroundChange(
                  project.background.color1,
                  project.background.color2,
                  'gradient',
                  Number(e.target.value)
                )
              }
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        )}
      </section>

      {/* 4. Efek Visual & Lensa (Studio FX - Fase 9) */}
      <section className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
              Studio Visual FX
            </span>
          </div>
          <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 font-bold">
            PRO
          </span>
        </div>

        {/* 1. Screen Glass Glare / Reflection */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>Pantulan Kaca Layar</span>
            <span className="font-mono text-zinc-300">
              {Math.round(renderSettings.screenGlassReflection * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={renderSettings.screenGlassReflection}
            onChange={(e) =>
              setRenderSettings({ screenGlassReflection: Number(e.target.value) })
            }
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-[9px] text-zinc-500">
            <span>Matte</span>
            <span>Gorilla Glass</span>
          </div>
        </div>

        {/* 2. Screen Emissive Glow / Brightness */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>Kecerahan Emisif OLED</span>
            <span className="font-mono text-zinc-300">
              {Math.round(renderSettings.screenBrightness * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.8"
            max="1.5"
            step="0.05"
            value={renderSettings.screenBrightness}
            onChange={(e) =>
              setRenderSettings({ screenBrightness: Number(e.target.value) })
            }
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* 3. Studio Ground Shadow Intensity */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>Bayangan Lantai Studio</span>
            <span className="font-mono text-zinc-300">
              {Math.round(renderSettings.shadowIntensity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={renderSettings.shadowIntensity}
            onChange={(e) =>
              setRenderSettings({ shadowIntensity: Number(e.target.value) })
            }
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        {/* 4. Floor Contact Shadow Toggle */}
        <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-zinc-300">Floor Contact Shadow</span>
          </div>
          <button
            onClick={() =>
              setRenderSettings({
                groundContactShadow: renderSettings.groundContactShadow === false ? true : false,
              })
            }
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
              renderSettings.groundContactShadow !== false
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-zinc-800 text-zinc-500 hover:text-zinc-400'
            }`}
          >
            {renderSettings.groundContactShadow !== false ? 'AKTIF' : 'OFF'}
          </button>
        </div>

        {/* 5. Animation Motion Speed */}
        <div className="space-y-1.5 pt-1 border-t border-zinc-800/80">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <div className="flex items-center gap-1">
              <Gauge className="w-3 h-3 text-cyan-400" />
              <span>Kecepatan Kamera</span>
            </div>
            <span className="font-mono text-cyan-300 text-[10px] font-bold">
              {renderSettings.animationSpeed}x
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {[0.5, 1.0, 1.5, 2.0].map((spd) => (
              <button
                key={spd}
                onClick={() => setRenderSettings({ animationSpeed: spd })}
                className={`py-1 rounded text-[10px] font-mono font-semibold border transition-all ${
                  renderSettings.animationSpeed === spd
                    ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200 shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* 6. Cinematic Vignette Toggle */}
        <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80">
          <div className="flex items-center gap-1.5">
            <Aperture className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[11px] text-zinc-300">Cinematic Vignette</span>
          </div>
          <button
            onClick={() => setRenderSettings({ vignette: !renderSettings.vignette })}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
              renderSettings.vignette
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'bg-zinc-800 text-zinc-500 hover:text-zinc-400'
            }`}
          >
            {renderSettings.vignette ? 'AKTIF' : 'OFF'}
          </button>
        </div>
      </section>

      {/* 5. Animation Duration */}
      <section>
        <div className="flex items-center gap-1.5 mb-2">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Video Loop Duration
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 text-xs">
          {([10, 15, 30] as DurationOption[]).map((dur) => (
            <button
              key={dur}
              onClick={() => handleDurationChange(dur)}
              className={`py-2 rounded-lg border font-medium transition-all ${
                project.duration === dur
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
                  : 'bg-zinc-900/60 border-zinc-800/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              {dur}s Loop
            </button>
          ))}
        </div>
      </section>

      {/* 6. UMKM E-Commerce Product Showcase Mode (Fase 5) */}
      <UmkmEtalasePanel />
    </aside>
  );
};
