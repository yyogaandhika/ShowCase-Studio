import React, { useRef } from 'react';
import {
  Smartphone,
  Laptop,
  Tablet,
  Monitor,
  Watch,
  Sparkles,
  Layers,
  ZoomIn,
  Briefcase,
  RotateCw,
  Compass,
  Upload,
  Video,
  Image as ImageIcon,
  Trash2,
  Crosshair,
  Type,
  Palette,
  Crop,
  Film,
  MapPin,
  Plus,
} from 'lucide-react';
import { useStore, DEFAULT_SCREEN_TRANSFORM } from '../store/useStore';
import { SceneType, ScreenAsset, DeviceType, ScreenFitMode, ScreenTransformConfig } from '../types';
import { getEngineInstance } from '../engine/engineInstance';
import { useTranslation } from '../i18n/useTranslation';
import { generateSampleMockupAsset } from '../engine/sampleMockups';

const ScreenTransformPanel: React.FC<{
  transform?: ScreenTransformConfig;
  onUpdate: (partial: Partial<ScreenTransformConfig>) => void;
  label?: string;
}> = ({ transform = DEFAULT_SCREEN_TRANSFORM, onUpdate, label }) => {
  const current = transform || DEFAULT_SCREEN_TRANSFORM;
  return (
    <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/80 space-y-2 mt-2">
      <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-300">
        <span className="flex items-center gap-1">
          <Crop className="w-3 h-3 text-cyan-400" />
          {label || 'Penataan Layar (Fitting & Pan)'}
        </span>
        <span className="text-[10px] text-cyan-400 font-mono font-normal">
          {Math.round(current.scale * 100)}%
        </span>
      </div>

      {/* Fit Mode */}
      <div className="grid grid-cols-3 gap-1 text-[10px]">
        {[
          { id: 'cover' as ScreenFitMode, label: 'Cover' },
          { id: 'contain' as ScreenFitMode, label: 'Contain' },
          { id: 'stretch' as ScreenFitMode, label: 'Stretch' },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => onUpdate({ fitMode: m.id })}
            className={`py-1 rounded text-center font-medium border transition-colors ${
              current.fitMode === m.id
                ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Quick Alignment Presets for Y-axis (Top, Center, Bottom) */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] text-zinc-400">
          <span>Posisi Vertikal</span>
          <div className="flex gap-1">
            <button
              onClick={() => onUpdate({ panY: -1.0 })}
              className={`px-1.5 py-0.5 rounded text-[9px] border transition-colors ${
                current.panY <= -0.9
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-200'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Atas
            </button>
            <button
              onClick={() => onUpdate({ panY: 0.0 })}
              className={`px-1.5 py-0.5 rounded text-[9px] border transition-colors ${
                Math.abs(current.panY) < 0.1
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-200'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Tengah
            </button>
            <button
              onClick={() => onUpdate({ panY: 1.0 })}
              className={`px-1.5 py-0.5 rounded text-[9px] border transition-colors ${
                current.panY >= 0.9
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-200'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Bawah
            </button>
          </div>
        </div>
        <input
          type="range"
          min="-1"
          max="1"
          step="0.05"
          value={current.panY}
          onChange={(e) => onUpdate({ panY: Number(e.target.value) })}
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
      </div>

      {/* Scale Zoom Slider */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] text-zinc-400">
          <span>Skala Pembesaran (Zoom)</span>
          <span className="font-mono text-zinc-300">{current.scale.toFixed(1)}x</span>
        </div>
        <input
          type="range"
          min="1"
          max="2.5"
          step="0.05"
          value={current.scale}
          onChange={(e) => onUpdate({ scale: Number(e.target.value) })}
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>
    </div>
  );
};

export const LeftSidebar: React.FC = () => {
  const {
    project,
    setSceneType,
    setDeviceType,
    setPrimaryAsset,
    setSecondaryAsset,
    setScreenTransform,
    setZoomFocus,
    setBrandOverlay,
    toggleCallouts,
    addCallout,
    updateCallout,
    removeCallout,
  } = useStore();

  const { t } = useTranslation();

  const primaryFileInputRef = useRef<HTMLInputElement>(null);
  const secondaryFileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleDeviceChange = (dev: DeviceType) => {
    setDeviceType(dev);
    const engine = getEngineInstance();
    if (engine) engine.updateDeviceType(dev);
  };

  const handleSceneChange = (scene: SceneType) => {
    setSceneType(scene);
    const engine = getEngineInstance();
    if (engine) engine.updateSceneType(scene);
  };

  const processFile = async (
    file: File,
    isSecondary = false
  ): Promise<void> => {
    if (file.size > 50 * 1024 * 1024) {
      alert('File size exceeds 50MB limit.');
      return;
    }

    const isVid = file.type.startsWith('video/');
    const url = URL.createObjectURL(file);

    const asset: ScreenAsset = {
      id: `asset-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: file.name,
      type: isVid ? 'video' : 'image',
      url,
      blob: file,
    };

    if (isSecondary) {
      setSecondaryAsset(asset);
    } else {
      setPrimaryAsset(asset);
    }

    const engine = getEngineInstance();
    if (engine) {
      await engine.setScreenAsset(asset, isSecondary);
    }
  };

  const handleLogoUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setBrandOverlay({ logoUrl: url });
  };

  const handleClearAsset = (isSecondary = false) => {
    if (isSecondary) {
      setSecondaryAsset(null);
    } else {
      setPrimaryAsset(null);
    }
    const engine = getEngineInstance();
    if (engine) {
      engine.setScreenAsset(null, isSecondary);
    }
  };

  const scenes: { id: SceneType; name: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'hero',
      name: t.sceneHero,
      desc: t.sceneHeroDesc,
      icon: <Sparkles className="w-4 h-4 text-blue-400" />,
    },
    {
      id: 'duo',
      name: t.sceneDuo,
      desc: t.sceneDuoDesc,
      icon: <Layers className="w-4 h-4 text-purple-400" />,
    },
    {
      id: 'zoom',
      name: t.sceneZoom,
      desc: t.sceneZoomDesc,
      icon: <ZoomIn className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: 'portfolio',
      name: t.scenePortfolio,
      desc: t.scenePortfolioDesc,
      icon: <Briefcase className="w-4 h-4 text-amber-400" />,
    },
    {
      id: 'orbit',
      name: t.sceneOrbit,
      desc: t.sceneOrbitDesc,
      icon: <RotateCw className="w-4 h-4 text-cyan-400" />,
    },
    {
      id: 'drift',
      name: t.sceneDrift,
      desc: t.sceneDriftDesc,
      icon: <Compass className="w-4 h-4 text-pink-400" />,
    },
    {
      id: 'story_reel',
      name: t.sceneStoryReel,
      desc: t.sceneStoryReelDesc,
      icon: <Film className="w-4 h-4 text-violet-400" />,
    },
  ];

  const devices: { id: DeviceType; name: string; shortName: string; icon: React.ReactNode }[] = [
    { id: 'phone', name: 'Smartphone', shortName: 'Phone', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'laptop', name: 'MacBook / Laptop', shortName: 'Laptop', icon: <Laptop className="w-4 h-4" /> },
    { id: 'tablet', name: 'iPad / Tablet', shortName: 'Tablet', icon: <Tablet className="w-4 h-4" /> },
    { id: 'desktop', name: 'Desktop Monitor', shortName: 'Desktop', icon: <Monitor className="w-4 h-4" /> },
    { id: 'smartwatch', name: 'Apple Watch', shortName: 'Watch', icon: <Watch className="w-4 h-4" /> },
  ];

  const isDuo = project.sceneType === 'duo';
  const isZoom = project.sceneType === 'zoom';
  const overlay = project.brandOverlay || {
    enabled: false,
    title: '',
    subtitle: '',
    position: 'top-left',
  };

  return (
    <aside className="w-72 bg-zinc-950/80 border-r border-zinc-800/80 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto select-none p-3 space-y-5">
      {/* 1. Device Model Selection */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Model Perangkat
          </span>
          {isDuo ? (
            <span className="text-[10px] text-purple-400 font-medium bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
              Duo Mode
            </span>
          ) : (
            <span className="text-[10px] text-zinc-500 font-mono capitalize">
              {project.deviceType}
            </span>
          )}
        </div>

        <div className="grid grid-cols-5 gap-1 bg-zinc-900/70 p-1 rounded-xl border border-zinc-800/80">
          {devices.map((dev) => {
            const active = !isDuo && project.deviceType === dev.id;
            return (
              <button
                key={dev.id}
                disabled={isDuo}
                onClick={() => handleDeviceChange(dev.id)}
                title={isDuo ? 'Terkunci pada Duo (Laptop + Phone)' : dev.name}
                className={`flex flex-col items-center justify-center py-2 px-0.5 rounded-lg transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 disabled:opacity-25 disabled:hover:bg-transparent'
                }`}
              >
                <div className="mb-1">{dev.icon}</div>
                <span className="text-[9px] font-medium leading-none truncate w-full text-center">
                  {dev.shortName}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Showcase Scene Selection */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Showcase Scene
          </span>
          <span className="text-[10px] text-zinc-500">6 presets</span>
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          {scenes.map((sc) => {
            const active = project.sceneType === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => handleSceneChange(sc.id)}
                className={`flex items-start gap-3 p-2 rounded-lg border text-left transition-all ${
                  active
                    ? 'bg-blue-950/30 border-blue-500/60 shadow-sm shadow-blue-500/10'
                    : 'bg-zinc-900/60 border-zinc-800/70 hover:bg-zinc-900 hover:border-zinc-700'
                }`}
              >
                <div
                  className={`p-1.5 rounded-md ${
                    active ? 'bg-blue-600/20' : 'bg-zinc-800'
                  }`}
                >
                  {sc.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${
                        active ? 'text-blue-300' : 'text-zinc-200'
                      }`}
                    >
                      {sc.name}
                    </span>
                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-snug mt-0.5 truncate">
                    {sc.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Feature Zoom Focus Area (Only when zoom scene active) */}
      {isZoom && (
        <section className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
          <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-emerald-300">
            <Crosshair className="w-3.5 h-3.5" />
            <span>Target Zoom Area</span>
          </div>
          <p className="text-[11px] text-zinc-400 mb-2">
            Select the section of the screen to zoom into:
          </p>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            {[
              { label: 'Top / Header', focus: { x: 0.5, y: 0.75 } },
              { label: 'Center Card', focus: { x: 0.5, y: 0.45 } },
              { label: 'Bottom Feed', focus: { x: 0.5, y: 0.15 } },
            ].map((area) => (
              <button
                key={area.label}
                onClick={() => {
                  setZoomFocus(area.focus);
                  const engine = getEngineInstance();
                  if (engine) engine.setZoomFocus(area.focus.x, area.focus.y);
                }}
                className={`py-1 px-1.5 rounded text-[11px] border transition-colors ${
                  project.zoomFocus?.y === area.focus.y
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                    : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                {area.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 4. Screen Asset Upload */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Screen Content
          </span>
          <span className="text-[10px] text-zinc-500">Image / MP4</span>
        </div>

        {/* Primary Screen Upload */}
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-zinc-300">
            {isDuo ? '1. Laptop Screen Asset' : 'Device Screen'}
          </span>

          <input
            ref={primaryFileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,video/mp4,video/webm"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) processFile(file, false);
            }}
          />

          {project.primaryAsset ? (
            <>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                <div className="flex items-center gap-2 min-w-0">
                  {project.primaryAsset.type === 'video' ? (
                    <Video className="w-4 h-4 text-blue-400 shrink-0" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  <div className="truncate">
                    <p className="text-xs font-medium text-zinc-200 truncate">
                      {project.primaryAsset.name}
                    </p>
                    <span className="text-[10px] text-zinc-500 uppercase">
                      {project.primaryAsset.type}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => primaryFileInputRef.current?.click()}
                    className="px-2 py-0.5 rounded text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  >
                    Change
                  </button>
                  <button
                    onClick={() => handleClearAsset(false)}
                    title="Remove custom asset"
                    className="p-1 rounded hover:bg-red-950/50 text-zinc-500 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {project.primaryAsset.type === 'image' && (
                <ScreenTransformPanel
                  transform={project.screenTransform}
                  onUpdate={(p) => setScreenTransform(p, false)}
                  label={isDuo ? 'Penataan Layar Laptop' : 'Penataan Layar'}
                />
              )}
            </>
          ) : (
            <div
              onClick={() => primaryFileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) processFile(file, false);
              }}
              className="border-2 border-dashed border-zinc-800 hover:border-blue-500/60 bg-zinc-900/40 hover:bg-zinc-900/80 rounded-lg p-3.5 text-center cursor-pointer transition-all group"
            >
              <Upload className="w-5 h-5 mx-auto mb-1.5 text-zinc-500 group-hover:text-blue-400 transition-colors" />
              <p className="text-xs font-medium text-zinc-300">
                Upload Screenshot or Video
              </p>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                PNG, JPG, MP4, WebM (max 50MB)
              </p>
            </div>
          )}
        </div>

        {/* Secondary Screen Upload (For Duo scene) */}
        {isDuo && (
          <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
            <span className="text-xs font-medium text-zinc-300">
              2. Phone Screen Asset
            </span>

            <input
              ref={secondaryFileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,video/mp4,video/webm"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) processFile(file, true);
              }}
            />

            {project.secondaryAsset ? (
              <>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="flex items-center gap-2 min-w-0">
                    {project.secondaryAsset.type === 'video' ? (
                      <Video className="w-4 h-4 text-blue-400 shrink-0" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    <div className="truncate">
                      <p className="text-xs font-medium text-zinc-200 truncate">
                        {project.secondaryAsset.name}
                      </p>
                      <span className="text-[10px] text-zinc-500 uppercase">
                        {project.secondaryAsset.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => secondaryFileInputRef.current?.click()}
                      className="px-2 py-0.5 rounded text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                    >
                      Change
                    </button>
                    <button
                      onClick={() => handleClearAsset(true)}
                      className="p-1 rounded hover:bg-red-950/50 text-zinc-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {project.secondaryAsset.type === 'image' && (
                  <ScreenTransformPanel
                    transform={project.secondaryScreenTransform}
                    onUpdate={(p) => setScreenTransform(p, true)}
                    label="Penataan Layar HP"
                  />
                )}
              </>
            ) : (
              <div
                onClick={() => secondaryFileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) processFile(file, true);
                }}
                className="border-2 border-dashed border-zinc-800 hover:border-purple-500/60 bg-zinc-900/40 hover:bg-zinc-900/80 rounded-lg p-3.5 text-center cursor-pointer transition-all group"
              >
                <Upload className="w-5 h-5 mx-auto mb-1.5 text-zinc-500 group-hover:text-purple-400 transition-colors" />
                <p className="text-xs font-medium text-zinc-300">
                  Upload Mobile UI Screen
                </p>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  Screenshot or mobile recording
                </p>
              </div>
            )}
          </div>
        )}

        {/* Quick Sample Indonesian Mockup Buttons (Fase 5) */}
        <div className="pt-2 border-t border-zinc-800/80">
          <span className="text-[10px] font-semibold text-zinc-400 block mb-1.5 flex items-center gap-1">
            <Palette className="w-3 h-3 text-indigo-400" />
            <span>{t.sampleMockups}</span>
          </span>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={async () => {
                const asset = generateSampleMockupAsset('food');
                setPrimaryAsset(asset);
                const engine = getEngineInstance();
                if (engine) await engine.setScreenAsset(asset, false);
              }}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-800/80 text-[10px] text-zinc-300 transition-all text-left truncate cursor-pointer"
            >
              <span>☕</span>
              <span className="truncate">{t.sampleFood}</span>
            </button>

            <button
              onClick={async () => {
                const asset = generateSampleMockupAsset('fashion');
                setPrimaryAsset(asset);
                const engine = getEngineInstance();
                if (engine) await engine.setScreenAsset(asset, false);
              }}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-rose-500/50 hover:bg-zinc-800/80 text-[10px] text-zinc-300 transition-all text-left truncate cursor-pointer"
            >
              <span>👗</span>
              <span className="truncate">{t.sampleFashion}</span>
            </button>

            <button
              onClick={async () => {
                const asset = generateSampleMockupAsset('gadget');
                setPrimaryAsset(asset);
                const engine = getEngineInstance();
                if (engine) await engine.setScreenAsset(asset, false);
              }}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-800/80 text-[10px] text-zinc-300 transition-all text-left truncate cursor-pointer"
            >
              <span>📱</span>
              <span className="truncate">{t.sampleGadget}</span>
            </button>

            <button
              onClick={async () => {
                handleClearAsset(false);
              }}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 hover:bg-zinc-800/80 text-[10px] text-zinc-400 transition-all text-left truncate cursor-pointer"
            >
              <span>📊</span>
              <span className="truncate">Default Tech SaaS</span>
            </button>
          </div>
        </div>
      </section>

      {/* 5. Brand & Typography Overlay (Fase 3) */}
      <section className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
              Brand & Title Overlay
            </span>
          </div>

          <button
            onClick={() => setBrandOverlay({ enabled: !overlay.enabled })}
            className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${
              overlay.enabled
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {overlay.enabled ? 'ACTIVE' : 'OFF'}
          </button>
        </div>

        {overlay.enabled && (
          <div className="space-y-2 pt-1 text-xs">
            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">
                Showcase Title
              </label>
              <input
                type="text"
                value={overlay.title}
                onChange={(e) => setBrandOverlay({ title: e.target.value })}
                placeholder="e.g. Fintech Superapp 2.0"
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">
                Tagline / Agency Subtitle
              </label>
              <input
                type="text"
                value={overlay.subtitle}
                onChange={(e) => setBrandOverlay({ subtitle: e.target.value })}
                placeholder="e.g. Case Study · Designed by Acme"
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Logo upload */}
            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">
                Agency / Client Logo (PNG)
              </label>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/svg+xml,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleLogoUpload(f);
                }}
              />
              {overlay.logoUrl ? (
                <div className="flex items-center justify-between p-2 rounded bg-zinc-950 border border-zinc-800">
                  <img
                    src={overlay.logoUrl}
                    alt="Logo"
                    className="h-6 object-contain max-w-[100px]"
                  />
                  <button
                    onClick={() => setBrandOverlay({ logoUrl: null })}
                    className="text-[10px] text-red-400 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full py-1.5 rounded border border-dashed border-zinc-700 hover:border-zinc-500 text-[11px] text-zinc-400 hover:text-zinc-200"
                >
                  + Upload Logo
                </button>
              )}
            </div>

            {/* Position */}
            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">
                Overlay Position
              </label>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                {[
                  { id: 'top-left', label: 'Top Left' },
                  { id: 'top-center', label: 'Top Center' },
                  { id: 'bottom-left', label: 'Bottom Left' },
                  { id: 'bottom-center', label: 'Bottom Center' },
                ].map((pos) => (
                  <button
                    key={pos.id}
                    onClick={() =>
                      setBrandOverlay({ position: pos.id as any })
                    }
                    className={`py-1 rounded border transition-colors ${
                      overlay.position === pos.id
                        ? 'bg-blue-600/30 border-blue-500 text-blue-200'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 6. 3D Feature Callout Pins (Fase 12) */}
      <section className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
              {t.calloutsSectionTitle}
            </span>
          </div>

          <button
            onClick={() => toggleCallouts()}
            className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${
              project.callouts?.enabled
                ? 'bg-sky-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {project.callouts?.enabled ? 'ACTIVE' : 'OFF'}
          </button>
        </div>

        <p className="text-[10px] text-zinc-500 leading-relaxed">
          {t.calloutsDesc}
        </p>

        {project.callouts?.enabled && (
          <div className="space-y-3 pt-1">
            {/* Quick Presets */}
            <div>
              <span className="text-[10px] font-semibold text-zinc-400 block mb-1.5">
                {t.calloutPresetTitle}
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  {
                    icon: '⚡',
                    title: 'Real-time Sync',
                    description: 'Sub-millisecond WebSocket updates',
                    color: '#10b981',
                    screenX: 0.72,
                    screenY: 0.32,
                  },
                  {
                    icon: '🛡️',
                    title: 'Biometric Auth',
                    description: 'FaceID & 256-bit encryption',
                    color: '#38bdf8',
                    screenX: 0.28,
                    screenY: 0.22,
                  },
                  {
                    icon: '💳',
                    title: 'Instant Checkout',
                    description: 'QRIS & 1-click VA payment',
                    color: '#f59e0b',
                    screenX: 0.5,
                    screenY: 0.78,
                  },
                  {
                    icon: '✨',
                    title: 'AI Smart Search',
                    description: 'Real-time contextual insights',
                    color: '#8b5cf6',
                    screenX: 0.65,
                    screenY: 0.55,
                  },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      addCallout({
                        icon: preset.icon,
                        title: preset.title,
                        description: preset.description,
                        badgeColor: preset.color,
                        screenX: preset.screenX,
                        screenY: preset.screenY,
                        pulse: true,
                      })
                    }
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-sky-500/50 hover:bg-zinc-900 text-[10px] text-zinc-300 transition-all text-left truncate cursor-pointer"
                  >
                    <span>{preset.icon}</span>
                    <span className="truncate">{preset.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* List of Pins */}
            <div className="space-y-2">
              {(project.callouts?.callouts || (project.callouts as any)?.pins || []).map((pin, index) => (
                <div
                  key={pin.id}
                  className="bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-800/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs">{pin.icon || '📍'}</span>
                      <span className="text-xs font-semibold text-zinc-200 truncate">
                        {pin.title || `Pin #${index + 1}`}
                      </span>
                    </div>
                    <button
                      onClick={() => removeCallout(pin.id)}
                      className="text-zinc-500 hover:text-red-400 p-0.5 rounded transition-colors"
                      title={t.calloutPinDelete}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Title & Emoji input */}
                  <div className="grid grid-cols-4 gap-1.5">
                    <input
                      type="text"
                      value={pin.icon || '📍'}
                      onChange={(e) =>
                        updateCallout(pin.id, { icon: e.target.value })
                      }
                      placeholder="Icon"
                      className="col-span-1 bg-zinc-900 border border-zinc-800 rounded px-1.5 py-1 text-center text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                    <input
                      type="text"
                      value={pin.title}
                      onChange={(e) =>
                        updateCallout(pin.id, { title: e.target.value })
                      }
                      placeholder={t.calloutPinTitle}
                      className="col-span-3 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  {/* Description input */}
                  <input
                    type="text"
                    value={pin.description || ''}
                    onChange={(e) =>
                      updateCallout(pin.id, { description: e.target.value })
                    }
                    placeholder={t.calloutPinDesc}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-sky-500"
                  />

                  {/* Color Swatches */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-zinc-400 mr-1">
                      {t.calloutPinColor}:
                    </span>
                    {[
                      '#38bdf8',
                      '#10b981',
                      '#f59e0b',
                      '#ec4899',
                      '#8b5cf6',
                      '#ffffff',
                    ].map((c) => (
                      <button
                        key={c}
                        onClick={() => updateCallout(pin.id, { badgeColor: c })}
                        style={{ backgroundColor: c }}
                        className={`w-3.5 h-3.5 rounded-full transition-transform ${
                          (pin.badgeColor || (pin as any).color || '#38bdf8') === c
                            ? 'scale-125 ring-2 ring-white/50'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Sliders X & Y */}
                  <div className="space-y-1.5 pt-1 border-t border-zinc-900">
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between text-[10px] text-zinc-400">
                        <span>{t.calloutPinX}</span>
                        <span className="font-mono text-zinc-300">
                          {Math.round(pin.screenX * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={pin.screenX}
                        onChange={(e) =>
                          updateCallout(pin.id, {
                            screenX: Number(e.target.value),
                          })
                        }
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between text-[10px] text-zinc-400">
                        <span>{t.calloutPinY}</span>
                        <span className="font-mono text-zinc-300">
                          {Math.round(pin.screenY * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={pin.screenY}
                        onChange={(e) =>
                          updateCallout(pin.id, {
                            screenY: Number(e.target.value),
                          })
                        }
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Pin Button */}
            <button
              onClick={() =>
                addCallout({
                  title: 'Feature Callout',
                  description: 'Key benefit highlight',
                  icon: '📍',
                  badgeColor: '#38bdf8',
                  screenX: 0.5,
                  screenY: 0.5,
                  pulse: true,
                })
              }
              className="w-full py-2 rounded-lg border border-dashed border-sky-500/40 hover:border-sky-400 hover:bg-sky-500/10 text-sky-400 hover:text-sky-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.calloutAddPin}</span>
            </button>
          </div>
        )}
      </section>

      {/* Info note */}
      <div className="pt-1 text-[11px] text-zinc-500 bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-800/60">
        <span className="text-blue-400 font-medium">💡 Privacy Tip:</span> Media
        and brand assets are processed entirely inside browser memory.
      </div>
    </aside>
  );
};
