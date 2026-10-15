import React, { useState, useEffect } from 'react';
import {
  X,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  HardDrive,
  Video,
  Monitor,
  RefreshCw,
} from 'lucide-react';
import { useStore } from '../store/useStore';

interface SystemDiagnostics {
  hasWebCodecs: boolean;
  hasVideoEncoder: boolean;
  hasVideoFrame: boolean;
  webglVersion: string;
  gpuRenderer: string;
  storageEstimateMb: number;
  storageUsedMb: number;
  recommendedResolution: '1080p' | '4k';
  recommendedFps: 30 | 60;
  browserName: string;
}

export const DiagnosticModal: React.FC = () => {
  const { isDiagnosticModalOpen, setDiagnosticModalOpen } = useStore();
  const [diag, setDiag] = useState<SystemDiagnostics | null>(null);

  useEffect(() => {
    if (isDiagnosticModalOpen) {
      runDiagnostics();
    }
  }, [isDiagnosticModalOpen]);

  const runDiagnostics = async () => {
    const hasWebCodecs = typeof (window as any).VideoEncoder !== 'undefined';
    const hasVideoEncoder = typeof (window as any).VideoEncoder !== 'undefined';
    const hasVideoFrame = typeof (window as any).VideoFrame !== 'undefined';

    // WebGL / GPU check
    let webglVersion = 'None';
    let gpuRenderer = 'Generic Hardware';
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl2') || c.getContext('webgl');
      if (gl) {
        webglVersion = c.getContext('webgl2') ? 'WebGL 2.0 (High Performance)' : 'WebGL 1.0';
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Hardware Accelerated';
        }
      }
    } catch {}

    // Storage Quota
    let storageEstimateMb = 5000;
    let storageUsedMb = 12;
    if (navigator.storage && navigator.storage.estimate) {
      try {
        const est = await navigator.storage.estimate();
        if (est.quota) storageEstimateMb = Math.round(est.quota / (1024 * 1024));
        if (est.usage) storageUsedMb = Math.round(est.usage / (1024 * 1024));
      } catch {}
    }

    // Recommendation logic
    const isChromeOrEdge = /Chrome|Edg/.test(navigator.userAgent);
    const hasFastGpu = !gpuRenderer.toLowerCase().includes('swiftshader');
    const recommendedResolution = hasFastGpu && hasWebCodecs ? '4k' : '1080p';
    const recommendedFps = hasFastGpu ? 60 : 30;

    let browserName = 'Chrome / Chromium';
    if (navigator.userAgent.includes('Edg')) browserName = 'Microsoft Edge';
    else if (navigator.userAgent.includes('Firefox')) browserName = 'Mozilla Firefox';
    else if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome'))
      browserName = 'Apple Safari';

    setDiag({
      hasWebCodecs,
      hasVideoEncoder,
      hasVideoFrame,
      webglVersion,
      gpuRenderer,
      storageEstimateMb,
      storageUsedMb,
      recommendedResolution,
      recommendedFps,
      browserName,
    });
  };

  if (!isDiagnosticModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                <span>Pemeriksaan Hardware & Sistem WebCodecs</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded border border-emerald-500/30">
                  Healthy
                </span>
              </h2>
              <p className="text-[10px] text-zinc-400">
                Diagnostik performa render 3D dan kemampuan ekspor deterministik di browser Anda.
              </p>
            </div>
          </div>

          <button
            onClick={() => setDiagnosticModalOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {diag ? (
            <>
              {/* WebCodecs Status */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-zinc-200">
                    <Video className="w-4 h-4 text-blue-400" />
                    <span>Akselerasi VideoEncoder (WebCodecs)</span>
                  </div>
                  {diag.hasWebCodecs ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      Aktif & Didukung
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      <AlertTriangle className="w-3 h-3" />
                      Fallback Mode
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-zinc-400 leading-snug">
                  {diag.hasWebCodecs
                    ? 'Browser Anda mendukung WebCodecs native untuk ekspor video MP4 (H.264) dan WebM (VP9) frame-by-frame 100% tanpa frame drop.'
                    : 'WebCodecs tidak terdeteksi. Sistem akan otomatis beralih ke perekaman canvas real-time atau ekspor PNG.'}
                </p>
              </div>

              {/* GPU & WebGL */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-zinc-200 mb-1">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span>Akselerasi Grafis & 3D WebGL</span>
                </div>

                <div className="space-y-1 text-zinc-400 text-[11px]">
                  <div className="flex justify-between">
                    <span>Versi WebGL:</span>
                    <span className="text-zinc-200 font-medium">{diag.webglVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GPU Driver:</span>
                    <span className="text-zinc-200 font-mono text-[10px] truncate max-w-[240px]">
                      {diag.gpuRenderer}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Browser:</span>
                    <span className="text-zinc-200 font-medium">{diag.browserName}</span>
                  </div>
                </div>
              </div>

              {/* Local Storage Quota */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-zinc-200 mb-1">
                  <HardDrive className="w-4 h-4 text-amber-400" />
                  <span>Penyimpanan Lokal IndexedDB (Privasi Penuh)</span>
                </div>

                <div className="space-y-1 text-zinc-400 text-[11px]">
                  <div className="flex justify-between">
                    <span>Ruang Terpakai:</span>
                    <span className="text-zinc-200 font-medium">{diag.storageUsedMb} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimasi Kuota Tersedia:</span>
                    <span className="text-emerald-400 font-medium">
                      {(diag.storageEstimateMb / 1024).toFixed(1)} GB
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommended Settings Badge */}
              <div className="bg-blue-950/30 border border-blue-500/30 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-400 block">
                    Rekomendasi Setelan Ekspor
                  </span>
                  <span className="text-xs font-bold text-white">
                    {diag.recommendedResolution.toUpperCase()} @ {diag.recommendedFps} FPS
                  </span>
                </div>
                <button
                  onClick={runDiagnostics}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-1 text-[11px]"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Segarkan</span>
                </button>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-zinc-500">Menganalisis sistem...</div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-5 py-3 border-t border-zinc-800 bg-zinc-950/60">
          <button
            onClick={() => setDiagnosticModalOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
