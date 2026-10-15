import React, { useState, useRef } from 'react';
import {
  X,
  Film,
  Download,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Camera,
  Layers,
  Sparkles,
  Share2,
  Grid,
  Image as ImageIcon,
  Play,
  Copy,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { AspectRatio, MarketingPackResult, ResolutionOption, VideoFormat } from '../types';
import { getEngineInstance } from '../engine/engineInstance';
import { WebCodecsExporter, BatchExportResult } from '../export/WebCodecsExporter';

export const ExportModal: React.FC = () => {
  const {
    project,
    brandKit,
    isExportModalOpen,
    setExportModalOpen,
    setAspectRatio,
    setResolution,
    setShareModalOpen,
  } = useStore();

  const [format, setFormat] = useState<VideoFormat | 'png' | 'marketing_pack' | 'gif'>('mp4');
  const [resolutionOption, setResolutionOption] = useState<ResolutionOption>(
    project.resolution || '1080p'
  );
  const [exportMode, setExportMode] = useState<'single' | 'batch'>('single');
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>(
    project.aspectRatio
  );
  const [fps, setFps] = useState<30 | 60>(30);
  const [gifFps, setGifFps] = useState<10 | 12 | 15>(12);
  const [gifLoopSec, setGifLoopSec] = useState<2 | 2.5 | 3>(2.5);
  const [includeWatermark, setIncludeWatermark] = useState<boolean>(true);
  const [watermarkText, setWatermarkText] = useState<string>(
    brandKit?.customWatermarkText || '⚡ Showcase Studio'
  );
  const [watermarkPosition, setWatermarkPosition] = useState<
    'bottom-right' | 'bottom-left' | 'top-right'
  >('bottom-right');

  // Export State
  const [status, setStatus] = useState<
    'idle' | 'rendering' | 'completed' | 'error'
  >('idle');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [totalFrames, setTotalFrames] = useState<number>(0);
  const [estimatedSec, setEstimatedSec] = useState<number>(0);
  const [currentRatioLabel, setCurrentRatioLabel] = useState<string>('');
  const [currentRatioIndex, setCurrentRatioIndex] = useState<number>(1);
  const [totalRatios, setTotalRatios] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [batchResults, setBatchResults] = useState<BatchExportResult[]>([]);
  const [marketingPackResult, setMarketingPackResult] = useState<MarketingPackResult | null>(null);
  const [marketingStatusText, setMarketingStatusText] = useState<string>('');

  const exporterRef = useRef<WebCodecsExporter | null>(null);

  if (!isExportModalOpen) return null;

  const handleRatioSelect = (ratio: AspectRatio) => {
    setSelectedRatio(ratio);
    setAspectRatio(ratio);
  };

  const handleResolutionChange = (res: ResolutionOption) => {
    setResolutionOption(res);
    setResolution(res);
  };

  const handleStartExport = async () => {
    const engine = getEngineInstance();
    if (!engine) return;

    if (format === 'png') {
      try {
        const { width, height } = WebCodecsExporter.getDimensions(
          selectedRatio,
          resolutionOption
        );
        const blob = await engine.captureSnapshot(width, height);

        // Draw brand overlay, UMKM overlay, or feature callouts onto canvas snapshot if active
        let finalBlob = blob;
        if (project.brandOverlay?.enabled || project.umkmOverlay?.enabled || project.callouts?.enabled || includeWatermark) {
          const img = new Image();
          await new Promise<void>((res) => {
            img.onload = () => res();
            img.src = URL.createObjectURL(blob);
          });
          const c = document.createElement('canvas');
          c.width = width;
          c.height = height;
          const ctx = c.getContext('2d')!;
          ctx.drawImage(img, 0, 0);

          const exporter = new WebCodecsExporter();
          if (project.brandOverlay?.enabled) {
            exporter.drawBrandOverlay(c, project.brandOverlay);
          }
          if (project.umkmOverlay?.enabled) {
            exporter.drawUmkmOverlay(c, project.umkmOverlay);
          }
          if (includeWatermark) {
            exporter.drawWatermark(c, watermarkText, watermarkPosition);
          }
          if (project.callouts?.enabled) {
            exporter.drawFeatureCallouts(c, project.callouts, engine);
          }

          finalBlob = await new Promise<Blob>((res) => {
            c.toBlob((b) => res(b!), 'image/png');
          });
        }

        const url = URL.createObjectURL(finalBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}-${selectedRatio}-${resolutionOption}.png`;
        a.click();
        setExportModalOpen(false);
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to capture snapshot');
        setStatus('error');
      }
      return;
    }

    if (format === 'marketing_pack') {
      setStatus('rendering');
      setProgressPercent(0);
      setErrorMessage('');
      setResultUrl(null);
      setBatchResults([]);
      setMarketingPackResult(null);

      const exporter = new WebCodecsExporter();
      exporterRef.current = exporter;

      try {
        const pack = await exporter.exportMarketingPack(
          engine,
          {
            resolution: resolutionOption,
            includeWatermark,
            watermarkText,
            watermarkPosition,
            brandOverlay: project.brandOverlay,
            umkmOverlay: project.umkmOverlay,
            callouts: project.callouts,
          },
          project.name,
          (pct, statusText) => {
            setProgressPercent(pct);
            setMarketingStatusText(statusText);
          }
        );

        setMarketingPackResult(pack);
        setStatus('completed');

        // Automatically trigger downloads for all 5 shots & master contact sheet
        pack.shots.forEach((shot, idx) => {
          setTimeout(() => {
            const a = document.createElement('a');
            a.href = shot.url;
            a.download = shot.filename;
            a.click();
          }, idx * 300);
        });

        if (pack.contactSheetUrl) {
          setTimeout(() => {
            const a = document.createElement('a');
            a.href = pack.contactSheetUrl!;
            a.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}-00-contact-sheet.png`;
            a.click();
          }, pack.shots.length * 300);
        }
      } catch (err: any) {
        if (err.message !== 'Export cancelled by user') {
          setErrorMessage(err.message || 'Gagal menghasilkan paket foto marketing');
          setStatus('error');
        } else {
          setStatus('idle');
        }
      } finally {
        exporterRef.current = null;
      }
      return;
    }

    if (format === 'gif') {
      setStatus('rendering');
      setProgressPercent(0);
      setErrorMessage('');
      setResultUrl(null);
      setBatchResults([]);
      setMarketingPackResult(null);

      const exporter = new WebCodecsExporter();
      exporterRef.current = exporter;

      try {
        const gifBlob = await exporter.exportGif(
          engine,
          {
            aspectRatio: selectedRatio,
            fps: gifFps,
            loopSec: gifLoopSec,
            includeWatermark,
            watermarkText,
            watermarkPosition,
            brandOverlay: project.brandOverlay,
            umkmOverlay: project.umkmOverlay,
            callouts: project.callouts,
          },
          (pct, statusText) => {
            setProgressPercent(pct);
            setMarketingStatusText(statusText);
          }
        );

        const url = URL.createObjectURL(gifBlob);
        setResultUrl(url);
        setStatus('completed');

        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}-${selectedRatio}-loop.gif`;
        a.click();
      } catch (err: any) {
        if (err.message !== 'Export cancelled by user') {
          setErrorMessage(err.message || 'Gagal menghasilkan animated GIF');
          setStatus('error');
        } else {
          setStatus('idle');
        }
      } finally {
        exporterRef.current = null;
      }
      return;
    }

    // Video export
    setStatus('rendering');
    setProgressPercent(0);
    setErrorMessage('');
    setResultUrl(null);
    setBatchResults([]);
    setMarketingPackResult(null);

    const exporter = new WebCodecsExporter();
    exporterRef.current = exporter;

    try {
      if (exportMode === 'batch') {
        // One-Click Batch Export all 3 ratios
        setTotalRatios(3);
        const results = await exporter.exportBatchMultiRatio(
          engine,
          {
            durationSec: project.duration,
            resolution: resolutionOption,
            format,
            fps,
            includeWatermark,
            watermarkText,
            watermarkPosition,
            brandOverlay: project.brandOverlay,
            umkmOverlay: project.umkmOverlay,
            callouts: project.callouts,
          },
          project.name,
          (info) => {
            setProgressPercent(info.percent);
            setCurrentFrame(info.currentFrame);
            setTotalFrames(info.totalFrames);
            setEstimatedSec(info.estimatedRemainingSec);
            if (info.currentRatioLabel) setCurrentRatioLabel(info.currentRatioLabel);
            if (info.currentRatioIndex) setCurrentRatioIndex(info.currentRatioIndex);
          }
        );

        setBatchResults(results);
        setStatus('completed');

        // Automatically trigger downloads for all 3 generated videos
        results.forEach((res, idx) => {
          setTimeout(() => {
            const url = URL.createObjectURL(res.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = res.filename;
            a.click();
          }, idx * 400);
        });
      } else {
        // Single Ratio Export
        setTotalRatios(1);
        setCurrentRatioLabel(`${selectedRatio}`);
        const blob = await exporter.exportVideo(
          engine,
          {
            aspectRatio: selectedRatio,
            durationSec: project.duration,
            resolution: resolutionOption,
            format,
            fps,
            includeWatermark,
            watermarkText,
            watermarkPosition,
            brandOverlay: project.brandOverlay,
            umkmOverlay: project.umkmOverlay,
            callouts: project.callouts,
          },
          (info) => {
            setProgressPercent(info.percent);
            setCurrentFrame(info.currentFrame);
            setTotalFrames(info.totalFrames);
            setEstimatedSec(info.estimatedRemainingSec);
          }
        );

        const url = URL.createObjectURL(blob);
        setResultUrl(url);
        setStatus('completed');

        const ext = format === 'mp4' ? 'mp4' : 'webm';
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}-${selectedRatio}-${resolutionOption}.${ext}`;
        a.click();
      }
    } catch (err: any) {
      if (err.message !== 'Export cancelled by user') {
        setErrorMessage(err.message || 'An error occurred during video rendering.');
        setStatus('error');
      } else {
        setStatus('idle');
      }
    } finally {
      exporterRef.current = null;
    }
  };

  const handleCancelExport = () => {
    if (exporterRef.current) {
      exporterRef.current.cancel();
    }
    setStatus('idle');
  };

  const handleClose = () => {
    if (status === 'rendering') {
      if (confirm('Rendering is in progress. Are you sure you want to cancel?')) {
        handleCancelExport();
        setExportModalOpen(false);
      }
    } else {
      setExportModalOpen(false);
    }
  };

  const { width, height } = WebCodecsExporter.getDimensions(
    selectedRatio,
    resolutionOption
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950/50">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-blue-500" />
            <h2 className="text-sm font-semibold text-zinc-100">
              Export 3D Studio Showcase
            </h2>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.5 rounded border border-indigo-500/30">
              Fase 3
            </span>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {status === 'idle' && (
            <>
              {/* Format selection */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                  1. Video / Visual Output Format
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  <button
                    onClick={() => setFormat('mp4')}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-medium transition-all ${
                      format === 'mp4'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
                        : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span className="font-bold text-xs">MP4</span>
                    <span className="text-[9px] text-zinc-500">Universal</span>
                  </button>
                  <button
                    onClick={() => setFormat('webm')}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-medium transition-all ${
                      format === 'webm'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
                        : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span className="font-bold text-xs">WebM</span>
                    <span className="text-[9px] text-zinc-500">VP9 Crisp</span>
                  </button>
                  <button
                    onClick={() => setFormat('gif')}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-medium transition-all ${
                      format === 'gif'
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-sm'
                        : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span className="font-bold text-xs">GIF</span>
                    <span className="text-[9px] text-zinc-500">Looping</span>
                  </button>
                  <button
                    onClick={() => setFormat('png')}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-medium transition-all ${
                      format === 'png'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
                        : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span className="font-bold text-xs">PNG</span>
                    <span className="text-[9px] text-zinc-500">1 Shot</span>
                  </button>
                  <button
                    onClick={() => setFormat('marketing_pack')}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-medium transition-all relative ${
                      format === 'marketing_pack'
                        ? 'bg-gradient-to-b from-indigo-600/25 to-purple-600/25 border-indigo-500 text-indigo-300 shadow-sm'
                        : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span className="absolute -top-1.5 -right-1 px-1 py-0.2 rounded bg-indigo-500 text-[8px] text-white font-bold tracking-tight uppercase">
                      Pack
                    </span>
                    <span className="font-bold text-xs">5 Angles</span>
                    <span className="text-[9px] text-zinc-500">+ Contact</span>
                  </button>
                </div>
              </div>

              {/* Marketing Pack Info Card */}
              {format === 'marketing_pack' && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/40 to-purple-950/40 border border-indigo-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-200 flex items-center gap-1.5">
                      <Grid className="w-4 h-4 text-indigo-400" />
                      <span>Studio Marketing Shot Pack (5 Angles + Contact Sheet)</span>
                    </span>
                    <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-semibold px-2 py-0.5 rounded-full border border-indigo-500/40">
                      Fase 11
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    Merender 5 sudut kamera studio profesional dalam 1 kali klik:
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] text-zinc-300 font-medium">
                    <div className="flex items-center gap-1.5 bg-zinc-900/60 p-1.5 rounded-lg border border-white/5">
                      <span className="text-indigo-400">01.</span> Tampak Depan Presisi
                    </div>
                    <div className="flex items-center gap-1.5 bg-zinc-900/60 p-1.5 rounded-lg border border-white/5">
                      <span className="text-indigo-400">02.</span> Isometric Kiri 45°
                    </div>
                    <div className="flex items-center gap-1.5 bg-zinc-900/60 p-1.5 rounded-lg border border-white/5">
                      <span className="text-indigo-400">03.</span> Isometric Kanan 45°
                    </div>
                    <div className="flex items-center gap-1.5 bg-zinc-900/60 p-1.5 rounded-lg border border-white/5">
                      <span className="text-indigo-400">04.</span> Dramatic Low-Angle
                    </div>
                    <div className="flex items-center gap-1.5 bg-zinc-900/60 p-1.5 rounded-lg border border-white/5 col-span-2">
                      <span className="text-indigo-400">05.</span> Top-Down Flatlay + <span className="text-purple-300 font-bold">Master Contact Sheet 2560×1440</span>
                    </div>
                  </div>
                </div>
              )}

              {/* GIF Configuration */}
              {format === 'gif' && (
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Animated GIF Loop Settings</span>
                    </span>
                    <span className="text-[10px] text-emerald-400/80 font-mono">100% In-Browser</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-1">Smoothness / Frame Rate</label>
                      <div className="grid grid-cols-3 gap-1">
                        {([10, 12, 15] as const).map((rate) => (
                          <button
                            key={rate}
                            onClick={() => setGifFps(rate)}
                            className={`py-1 text-center rounded text-[11px] font-semibold border transition-all ${
                              gifFps === rate
                                ? 'bg-emerald-600 border-emerald-500 text-white'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            {rate} fps
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-1">Loop Duration</label>
                      <div className="grid grid-cols-3 gap-1">
                        {([2, 2.5, 3] as const).map((sec) => (
                          <button
                            key={sec}
                            onClick={() => setGifLoopSec(sec)}
                            className={`py-1 text-center rounded text-[11px] font-semibold border transition-all ${
                              gifLoopSec === sec
                                ? 'bg-emerald-600 border-emerald-500 text-white'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            {sec}s
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    💡 Menghasilkan GIF89a murni dengan palet adaptif 256 warna & LZW compression. Ringan dan siap ditempel langsung ke GitHub README, Notion, atau WhatsApp!
                  </p>
                </div>
              )}

              {/* Resolution selection (1080p vs 4K) */}
              {format !== 'gif' && (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                    2. Render Resolution
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleResolutionChange('1080p')}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        resolutionOption === '1080p'
                          ? 'bg-zinc-800 border-blue-500 text-white'
                          : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span>1080p Full HD</span>
                      <span className="text-[10px] font-mono text-zinc-400">Crisp & Fast</span>
                    </button>
                    <button
                      onClick={() => handleResolutionChange('4k')}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        resolutionOption === '4k'
                          ? 'bg-indigo-950/40 border-indigo-500 text-indigo-200 shadow-sm'
                          : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        4K Ultra HD
                      </span>
                      <span className="text-[10px] font-mono text-indigo-300">Cinema Grade</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Export Mode: Single Ratio vs Batch Multi-Ratio (Only for MP4/WebM) */}
              {(format === 'mp4' || format === 'webm') && (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                    3. Ratio Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setExportMode('single')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        exportMode === 'single'
                          ? 'bg-zinc-800 border-blue-500 text-white'
                          : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="text-xs font-semibold">Single Ratio</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        Selected: {selectedRatio}
                      </div>
                    </button>
                    <button
                      onClick={() => setExportMode('batch')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        exportMode === 'batch'
                          ? 'bg-blue-950/50 border-blue-500 text-white shadow-sm'
                          : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="text-xs font-semibold flex items-center gap-1.5 text-blue-300">
                        <Layers className="w-3.5 h-3.5" />
                        One-Click All 3 Ratios
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        Generates 16:9, 9:16 & 1:1
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Single Aspect Ratio choices */}
              {((exportMode === 'single' && (format === 'mp4' || format === 'webm')) || format === 'png' || format === 'gif') && (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                    Aspect Ratio
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '16:9' as AspectRatio, label: '16:9 Landscape', res: resolutionOption === '4k' ? '3840×2160' : '1920×1080' },
                      { id: '9:16' as AspectRatio, label: '9:16 Portrait', res: resolutionOption === '4k' ? '2160×3840' : '1080×1920' },
                      { id: '1:1' as AspectRatio, label: '1:1 Square', res: resolutionOption === '4k' ? '2160×2160' : '1080×1080' },
                    ].map((r) => (
                      <button
                        key={r.id}
                        onClick={() => handleRatioSelect(r.id)}
                        className={`p-2 rounded-xl border text-left transition-all ${
                          selectedRatio === r.id
                            ? 'bg-blue-950/40 border-blue-500 text-white'
                            : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <div className="text-xs font-semibold">{r.label}</div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          {r.res}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* FPS & Watermark */}
              {format !== 'png' && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-xs font-medium text-zinc-400 block mb-1">
                      Framerate
                    </label>
                    <div className="flex bg-zinc-950 border border-zinc-800 rounded-lg p-0.5">
                      <button
                        onClick={() => setFps(30)}
                        className={`flex-1 py-1 rounded text-xs transition-colors ${
                          fps === 30
                            ? 'bg-zinc-800 text-white font-medium'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        30 FPS
                      </button>
                      <button
                        onClick={() => setFps(60)}
                        className={`flex-1 py-1 rounded text-xs transition-colors ${
                          fps === 60
                            ? 'bg-zinc-800 text-white font-medium'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        60 FPS
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-zinc-400 block mb-1">
                      Watermark
                    </label>
                    <button
                      onClick={() => setIncludeWatermark(!includeWatermark)}
                      className={`w-full py-1 px-3 rounded-lg border text-xs text-left transition-colors flex items-center justify-between ${
                        includeWatermark
                          ? 'bg-zinc-950 border-blue-500/60 text-zinc-200'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                      }`}
                    >
                      <span>Showcase Badge</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          includeWatermark
                            ? 'bg-blue-600/30 text-blue-300'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {includeWatermark ? 'ON' : 'OFF'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Watermark Customization (Position & Text) */}
              {includeWatermark && (
                <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-zinc-300">
                    <span className="font-semibold">Kustomisasi Watermark</span>
                    <span className="text-[10px] text-zinc-500 font-mono">Badge & Position</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-[10px]">
                    {[
                      { id: 'bottom-right' as const, label: 'Kanan Bawah' },
                      { id: 'bottom-left' as const, label: 'Kiri Bawah' },
                      { id: 'top-right' as const, label: 'Kanan Atas' },
                    ].map((pos) => (
                      <button
                        key={pos.id}
                        onClick={() => setWatermarkPosition(pos.id)}
                        className={`py-1 rounded text-center border font-medium transition-colors ${
                          watermarkPosition === pos.id
                            ? 'bg-blue-950/40 border-blue-500 text-blue-200'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="⚡ Showcase Studio"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-blue-500/80 font-mono"
                  />
                </div>
              )}

              {/* Brand overlay status */}
              {project.brandOverlay?.enabled && (
                <div className="p-2.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-xs text-indigo-300 flex items-center justify-between">
                  <span className="font-medium">✨ Brand Overlay Active</span>
                  <span className="text-[11px] text-zinc-400 truncate max-w-[180px]">
                    "{project.brandOverlay.title}"
                  </span>
                </div>
              )}

              {/* Summary */}
              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs text-zinc-400 space-y-1">
                <div className="flex justify-between">
                  <span>Output Resolution:</span>
                  <span className="font-mono text-zinc-200">
                    {exportMode === 'batch'
                      ? resolutionOption === '4k'
                        ? '3840×2160 (Max 4K)'
                        : '1920×1080 (Full HD)'
                      : `${width} × ${height}`}
                  </span>
                </div>
                {format !== 'png' && (
                  <>
                    <div className="flex justify-between">
                      <span>Loop Duration:</span>
                      <span className="font-mono text-zinc-200">
                        {project.duration} seconds
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pipeline:</span>
                      <span className="font-mono text-zinc-200">
                        {exportMode === 'batch'
                          ? 'Batch 3 Ratios (16:9, 9:16, 1:1)'
                          : `${project.duration * fps} frames total`}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {status === 'rendering' && (
            <div className="py-6 space-y-5 text-center">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
                <div
                  className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"
                />
                <span className="font-mono font-bold text-sm text-zinc-200">
                  {progressPercent}%
                </span>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-zinc-100">
                  {format === 'marketing_pack'
                    ? 'Generating Marketing Shot Pack...'
                    : format === 'gif'
                    ? 'Generating Looping Animated GIF...'
                    : totalRatios > 1
                    ? `Batch Rendering (${currentRatioIndex}/${totalRatios}): ${currentRatioLabel}`
                    : 'Rendering 3D Showcase Video...'}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  {marketingStatusText || (totalFrames > 0 ? `Frame ${currentFrame} of ${totalFrames}` : 'Processing...')}
                </p>
                {estimatedSec > 0 && format !== 'marketing_pack' && format !== 'gif' && (
                  <p className="text-xs text-blue-400 mt-1">
                    Estimated remaining for current file: ~{estimatedSec}s
                  </p>
                )}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-150 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <button
                onClick={handleCancelExport}
                className="px-4 py-1.5 rounded-lg border border-zinc-700 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Cancel Export
              </button>
            </div>
          )}

          {status === 'completed' && (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-zinc-100">
                  {marketingPackResult
                    ? 'Marketing Pack (5 Angles + Contact Sheet) Ready!'
                    : format === 'gif'
                    ? 'Animated GIF Loop Generated!'
                    : batchResults.length > 0
                    ? 'All 3 Showcase Ratios Rendered!'
                    : 'Export Finished Successfully!'}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  {marketingPackResult
                    ? '5 studio camera perspective angles and 1 master contact sheet collage downloaded.'
                    : format === 'gif'
                    ? `Lightweight ${selectedRatio} looping GIF ready for README, Notion, & Slack.`
                    : batchResults.length > 0
                    ? '16:9, 9:16, and 1:1 videos have been generated and downloaded.'
                    : `Your ${resolutionOption} showcase video is ready.`}
                </p>
              </div>

              {/* Marketing Pack Result */}
              {marketingPackResult && (
                <div className="space-y-3">
                  {marketingPackResult.contactSheetUrl && (
                    <div className="rounded-xl overflow-hidden border border-indigo-500/40 bg-zinc-950 aspect-video max-h-52 mx-auto relative group shadow-xl">
                      <img
                        src={marketingPackResult.contactSheetUrl}
                        alt="Master Contact Sheet"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 bg-zinc-950/80 backdrop-blur px-2 py-0.5 rounded text-[10px] font-semibold text-indigo-300 border border-indigo-500/30">
                        Master Contact Sheet (2560×1440)
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5 text-left bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                        5 Studio Perspective Deliverables:
                      </span>
                      <button
                        onClick={() => {
                          marketingPackResult.shots.forEach((s, idx) => {
                            setTimeout(() => {
                              const a = document.createElement('a');
                              a.href = s.url;
                              a.download = s.filename;
                              a.click();
                            }, idx * 200);
                          });
                          if (marketingPackResult.contactSheetUrl) {
                            setTimeout(() => {
                              const a = document.createElement('a');
                              a.href = marketingPackResult.contactSheetUrl!;
                              a.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}-00-contact-sheet.png`;
                              a.click();
                            }, marketingPackResult.shots.length * 200);
                          }
                        }}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>Unduh Semua ({marketingPackResult.shots.length + 1} File)</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-1">
                      {marketingPackResult.shots.map((shot) => (
                        <div
                          key={shot.filename}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-zinc-900/60 border border-zinc-800/60"
                        >
                          <div className="flex items-center gap-2 truncate mr-2">
                            <img src={shot.url} alt={shot.label} className="w-9 h-5 object-cover rounded border border-white/10" />
                            <span className="text-zinc-200 truncate">{shot.label}</span>
                          </div>
                          <button
                            onClick={() => {
                              const a = document.createElement('a');
                              a.href = shot.url;
                              a.download = shot.filename;
                              a.click();
                            }}
                            className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 shrink-0"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* GIF Preview */}
              {resultUrl && format === 'gif' && (
                <div className="rounded-xl overflow-hidden border border-emerald-500/40 bg-zinc-950 p-2 max-h-52 mx-auto flex items-center justify-center shadow-lg">
                  <img
                    src={resultUrl}
                    alt="Looping Animated GIF"
                    className="max-h-48 rounded object-contain mx-auto"
                  />
                </div>
              )}

              {/* Video Preview player */}
              {resultUrl && format !== 'gif' && !marketingPackResult && (
                <div className="rounded-xl overflow-hidden border border-zinc-800 bg-black aspect-video max-h-48 mx-auto flex items-center justify-center">
                  <video
                    src={resultUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* Batch list of files */}
              {batchResults.length > 0 && (
                <div className="space-y-1.5 text-left bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                    Generated Downloads:
                  </span>
                  {batchResults.map((b) => (
                    <div
                      key={b.filename}
                      className="flex items-center justify-between text-xs py-1 border-b border-zinc-900 last:border-0"
                    >
                      <span className="text-zinc-200 font-mono truncate mr-2">
                        {b.filename}
                      </span>
                      <button
                        onClick={() => {
                          const url = URL.createObjectURL(b.blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = b.filename;
                          a.click();
                        }}
                        className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  setShareModalOpen(true);
                  setExportModalOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-500/25 transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Bagikan Showcase & Copywriter (LinkedIn / IG / WA)</span>
              </button>

              <div className="flex items-center gap-2 pt-2">
                {resultUrl && (
                  <button
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = resultUrl;
                      const ext = format === 'gif' ? 'gif' : format === 'mp4' ? 'mp4' : 'webm';
                      a.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}-${selectedRatio}-${resolutionOption}.${ext}`;
                      a.click();
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md shadow-blue-600/30"
                  >
                    <Download className="w-4 h-4" />
                    <span>{format === 'gif' ? 'Download GIF Again' : 'Download Video Again'}</span>
                  </button>
                )}
                <button
                  onClick={() => setStatus('idle')}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs font-medium transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Configure Another Export</span>
                </button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4 text-center py-3">
              <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">
                  Export Failed
                </h3>
                <p className="text-xs text-red-400 mt-1 max-w-sm mx-auto">
                  {errorMessage}
                </p>
              </div>
              <button
                onClick={() => setStatus('idle')}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer (When Idle) */}
        {status === 'idle' && (
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-zinc-800 bg-zinc-950/50">
            <button
              onClick={() => setExportModalOpen(false)}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleStartExport}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md shadow-blue-600/30 active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>
                {format === 'png'
                  ? `Save ${resolutionOption} PNG`
                  : format === 'marketing_pack'
                  ? `Generate 5 Marketing Angles + Contact Sheet`
                  : format === 'gif'
                  ? `Export Looping GIF (${gifFps} fps)`
                  : exportMode === 'batch'
                  ? `Batch Export All 3 Ratios (${format.toUpperCase()})`
                  : `Render ${resolutionOption} ${format.toUpperCase()}`}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
