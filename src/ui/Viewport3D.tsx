import React, { useEffect, useRef, useState } from 'react';
import { StudioEngine } from '../engine/StudioEngine';
import { getEngineInstance, setEngineInstance } from '../engine/engineInstance';
import { useStore } from '../store/useStore';
import { TimelineBar } from './TimelineBar';
import { Camera, Compass, RotateCw } from 'lucide-react';
import { CameraAnglePreset, CalloutConfig, FeatureCallout } from '../types';

const CalloutsOverlay: React.FC<{
  callouts?: CalloutConfig;
}> = ({ callouts }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [projected, setProjected] = useState<
    Array<{
      id: string;
      x: number;
      y: number;
      visible: boolean;
      callout: FeatureCallout;
    }>
  >([]);

  useEffect(() => {
    if (!callouts?.enabled) {
      setProjected([]);
      return;
    }

    const pins = callouts.callouts || (callouts as any).pins || [];
    if (!pins.length) {
      setProjected([]);
      return;
    }

    let animId: number;
    const update = () => {
      const engine = getEngineInstance();
      if (engine && containerRef.current) {
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        const results = pins.map((p) => {
          const pt = engine.projectScreenPoint(p.screenX, p.screenY, w, h);
          return {
            id: p.id,
            x: pt.x,
            y: pt.y,
            visible: pt.visible,
            callout: p,
          };
        });
        setProjected(results);
      }
      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [callouts]);

  if (!callouts?.enabled) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden z-10"
    >
      {projected.map(({ id, x, y, visible, callout }) => {
        if (!visible) return null;
        const accent = callout.badgeColor || '#38bdf8';
        const isRight = callout.screenX < 0.6;
        const elbowX = isRight ? 36 : -36;
        const elbowY = -32;

        return (
          <div
            key={id}
            style={{
              transform: `translate3d(${x}px, ${y}px, 0)`,
              willChange: 'transform',
            }}
            className="absolute top-0 left-0 transition-opacity duration-150 select-none"
          >
            {/* Glowing 3D Target Pinpoint Dot */}
            <div className="relative -translate-x-1/2 -translate-y-1/2">
              <span
                className="absolute -inset-1.5 rounded-full animate-ping opacity-75"
                style={{ backgroundColor: accent }}
              />
              <span
                className="relative block w-3.5 h-3.5 rounded-full border-2 border-white shadow-lg"
                style={{ backgroundColor: accent }}
              />
            </div>

            {/* Connecting Angled Leader Line (SVG) */}
            <svg
              className="absolute pointer-events-none overflow-visible"
              style={{ top: 0, left: 0 }}
            >
              <line
                x1="0"
                y1="0"
                x2={elbowX}
                y2={elbowY}
                stroke={accent}
                strokeWidth="1.5"
                strokeDasharray="3 2"
                className="opacity-90 drop-shadow"
              />
              <line
                x1={elbowX}
                y1={elbowY}
                x2={isRight ? elbowX + 24 : elbowX - 24}
                y2={elbowY}
                stroke={accent}
                strokeWidth="1.5"
                className="opacity-90 drop-shadow"
              />
            </svg>

            {/* Glassmorphic Callout Pill */}
            <div
              style={{
                transform: `translate(${isRight ? elbowX + 20 : elbowX - 180}px, ${elbowY - 20}px)`,
              }}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-950/90 backdrop-blur-md border border-white/20 shadow-2xl min-w-[150px] max-w-[220px]"
            >
              <div
                className="w-1 self-stretch rounded-full shrink-0"
                style={{ backgroundColor: accent }}
              />
              <span className="text-sm shrink-0">{callout.icon || '⚡'}</span>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white tracking-wide truncate">
                  {callout.title}
                </span>
                {callout.description && (
                  <span className="text-[10px] text-zinc-300 leading-tight truncate">
                    {callout.description}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const Viewport3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<StudioEngine | null>(null);

  const {
    project,
    setCurrentTime,
    isFreeCamera,
    setIsFreeCamera,
    setIsPlaying,
  } = useStore();

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize 3D Engine
    const engine = new StudioEngine({
      container: containerRef.current,
      onTimeUpdate: (t) => {
        setCurrentTime(t);
      },
    });

    engineRef.current = engine;
    setEngineInstance(engine);

    // Apply initial project parameters
    engine.updateSceneType(project.sceneType);
    engine.updateDeviceType(project.deviceType);
    engine.updateChassisColor(project.chassisColor);
    if (project.chassisFinish) {
      engine.updateChassisFinish(project.chassisFinish);
    }
    engine.updateLighting(project.lightingPreset);
    engine.updateBackground(project.background);
    engine.setDuration(project.duration);
    if (project.renderSettings) {
      engine.updateRenderSettings(project.renderSettings);
    }
    if (project.zoomFocus) {
      engine.setZoomFocus(project.zoomFocus.x, project.zoomFocus.y);
    }

    if (project.primaryAsset) {
      engine.setScreenAsset(project.primaryAsset, false).then(() => {
        if (project.screenTransform) {
          engine.updateScreenTransform(project.screenTransform, false);
        }
      });
    }
    if (project.secondaryAsset) {
      engine.setScreenAsset(project.secondaryAsset, true).then(() => {
        if (project.secondaryScreenTransform) {
          engine.updateScreenTransform(project.secondaryScreenTransform, true);
        }
      });
    }

    return () => {
      setEngineInstance(null);
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  const handleResetCamera = () => {
    const engine = engineRef.current;
    if (engine) {
      setIsFreeCamera(false);
      setIsPlaying(true);
      engine.play();
    }
  };

  const handleSelectStaticAngle = (preset: CameraAnglePreset) => {
    const engine = engineRef.current;
    if (engine) {
      setIsFreeCamera(true);
      setIsPlaying(false);
      engine.pause();
      engine.applyStaticAngle(preset);
    }
  };

  // Determine aspect ratio class
  const getAspectClass = () => {
    switch (project.aspectRatio) {
      case '16:9':
        return 'aspect-video max-w-full max-h-full';
      case '9:16':
        return 'aspect-[9/16] max-h-full';
      case '1:1':
        return 'aspect-square max-h-full';
    }
  };

  return (
    <div className="relative flex-1 h-[calc(100vh-3.5rem)] bg-zinc-950 overflow-hidden flex items-center justify-center">
      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Real-time 3D Feature Callout Pins Overlay (Fase 12) */}
      <CalloutsOverlay callouts={project.callouts} />

      {/* Cinematic Viewfinder Framing Guide */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
        <div
          className={`relative border border-white/10 rounded-2xl shadow-2xl transition-all duration-300 pointer-events-none ${getAspectClass()}`}
          style={{ width: '100%' }}
        >
          {/* Viewfinder corner guides */}
          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-blue-500/60 rounded-tl" />
          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-blue-500/60 rounded-tr" />
          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-blue-500/60 rounded-bl" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-blue-500/60 rounded-br" />

          {/* Ratio badge */}
          <div className="absolute top-3 left-4 flex items-center gap-2 bg-zinc-950/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-zinc-400 border border-white/5">
            <span>{project.aspectRatio} FRAME</span>
          </div>

          {/* Live Brand Overlay Preview */}
          {project.brandOverlay?.enabled && (
            <div
              className={`absolute p-6 flex flex-col pointer-events-none select-none ${
                project.brandOverlay.position === 'top-left'
                  ? 'top-0 left-0 items-start text-left'
                  : project.brandOverlay.position === 'top-center'
                  ? 'top-0 left-1/2 -translate-x-1/2 items-center text-center'
                  : project.brandOverlay.position === 'bottom-left'
                  ? 'bottom-0 left-0 items-start text-left'
                  : 'bottom-0 left-1/2 -translate-x-1/2 items-center text-center'
              }`}
            >
              {project.brandOverlay.logoUrl && (
                <img
                  src={project.brandOverlay.logoUrl}
                  alt="Brand Logo"
                  className="h-8 mb-1.5 object-contain filter drop-shadow-md"
                />
              )}
              {project.brandOverlay.title && (
                <h1 className="text-lg md:text-xl font-bold tracking-tight text-white drop-shadow-lg leading-tight">
                  {project.brandOverlay.title}
                </h1>
              )}
              {project.brandOverlay.subtitle && (
                <p className="text-xs font-medium text-zinc-300 drop-shadow-md mt-0.5">
                  {project.brandOverlay.subtitle}
                </p>
              )}
            </div>
          )}

          {/* Live UMKM Product Showcase Overlay Preview */}
          {project.umkmOverlay?.enabled && (
            <div
              className={`absolute left-0 right-0 px-4 md:px-6 pointer-events-none select-none z-10 ${
                project.umkmOverlay.position === 'top-banner'
                  ? 'top-4 md:top-6'
                  : 'bottom-4 md:bottom-6'
              }`}
            >
              <div className="max-w-xl mx-auto bg-zinc-950/92 backdrop-blur-md border border-white/15 rounded-2xl p-3 md:p-3.5 shadow-2xl overflow-hidden relative">
                {/* Accent Top Gradient Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-rose-500 to-indigo-500" />

                <div className="flex items-center justify-between gap-3">
                  {/* Left: Store Name & Price Tag */}
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1 truncate">
                      <span>🛍️</span>
                      <span>{project.umkmOverlay.storeName || 'Toko Resmi UMKM'}</span>
                    </span>

                    <div className="flex items-baseline gap-2 mt-0.5">
                      {project.umkmOverlay.originalPrice && (
                        <span className="text-xs text-zinc-500 line-through">
                          {project.umkmOverlay.originalPrice}
                        </span>
                      )}
                      <span className="text-base md:text-lg font-black text-emerald-400 tracking-tight">
                        {project.umkmOverlay.salePrice || 'Rp 0'}
                      </span>
                      {project.umkmOverlay.discountPercent && (
                        <span className="px-1.5 py-0.5 rounded bg-red-600/90 text-[10px] font-bold text-white tracking-wider">
                          {project.umkmOverlay.discountPercent}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Badge Promo & Order Channel Pill */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-[10px] md:text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      {project.umkmOverlay.customBadgeText ||
                        (project.umkmOverlay.badgeType === 'flash_sale'
                          ? '🔥 Flash Sale Terbatas'
                          : project.umkmOverlay.badgeType === 'cod'
                          ? '💵 COD / Bayar di Tempat'
                          : project.umkmOverlay.badgeType === 'best_seller'
                          ? '⭐ Produk Terlaris'
                          : project.umkmOverlay.badgeType === 'garansi_resmi'
                          ? '🛡️ 100% Original & Garansi'
                          : project.umkmOverlay.badgeType === 'diskon_spesial'
                          ? '🎉 Diskon Spesial Hari Ini'
                          : '🚚 Gratis Ongkir Se-Indonesia')}
                    </span>

                    <div
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white shadow-md ${
                        project.umkmOverlay.ctaChannel === 'shopee'
                          ? 'bg-orange-600'
                          : project.umkmOverlay.ctaChannel === 'tokopedia'
                          ? 'bg-emerald-600'
                          : project.umkmOverlay.ctaChannel === 'tiktok'
                          ? 'bg-zinc-800 border border-zinc-700'
                          : project.umkmOverlay.ctaChannel === 'website'
                          ? 'bg-blue-600'
                          : 'bg-green-600'
                      }`}
                    >
                      <span>
                        {project.umkmOverlay.ctaChannel === 'shopee'
                          ? '🛒 Shopee'
                          : project.umkmOverlay.ctaChannel === 'tokopedia'
                          ? '🛒 Tokopedia'
                          : project.umkmOverlay.ctaChannel === 'tiktok'
                          ? '🎵 TikTok Shop'
                          : project.umkmOverlay.ctaChannel === 'website'
                          ? '🌐 Website'
                          : '📱 WhatsApp'}
                      </span>
                      {project.umkmOverlay.ctaContact && (
                        <span className="opacity-90 font-medium text-[11px]">
                          : {project.umkmOverlay.ctaContact}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Floating Notification if Free Camera Mode is active */}
      {isFreeCamera && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-zinc-900/90 backdrop-blur-md border border-amber-500/40 text-xs text-amber-200 shadow-xl">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>Free Orbit Inspection Mode (Drag to rotate, Scroll to zoom)</span>
          <button
            onClick={handleResetCamera}
            className="flex items-center gap-1 ml-1 px-2 py-0.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-medium text-[11px] transition-colors"
          >
            <RotateCw className="w-3 h-3" />
            <span>Resume</span>
          </button>
        </div>
      )}

      {/* Floating Studio Camera Perspective Angles (Fase 11) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1 p-1 bg-zinc-950/85 backdrop-blur-md border border-white/10 rounded-xl shadow-xl">
        <span className="text-[10px] font-semibold text-zinc-400 uppercase px-1.5 tracking-wider flex items-center gap-1">
          <Camera className="w-3 h-3 text-indigo-400" />
          <span className="hidden sm:inline">Sudut:</span>
        </span>
        <button
          onClick={handleResetCamera}
          title="Animasi Timeline Otomatis"
          className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all ${
            !isFreeCamera
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          Auto Loop
        </button>
        <button
          onClick={() => handleSelectStaticAngle('front')}
          title="Tampak Depan Presisi (0°)"
          className="px-2 py-0.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-all"
        >
          Depan
        </button>
        <button
          onClick={() => handleSelectStaticAngle('isometric_left')}
          title="Isometric 45° Kiri (3D Tech)"
          className="px-2 py-0.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-all"
        >
          Iso L
        </button>
        <button
          onClick={() => handleSelectStaticAngle('isometric_right')}
          title="Isometric 45° Kanan (App Store Hero)"
          className="px-2 py-0.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-all"
        >
          Iso R
        </button>
        <button
          onClick={() => handleSelectStaticAngle('low_angle')}
          title="Dramatic Low-Angle"
          className="px-2 py-0.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-all"
        >
          Low
        </button>
        <button
          onClick={() => handleSelectStaticAngle('flatlay')}
          title="Top-Down Flatlay (90° Overhead)"
          className="px-2 py-0.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-all"
        >
          Top
        </button>
      </div>

      {/* Floating Bottom Timeline Bar */}
      <TimelineBar />
    </div>
  );
};
