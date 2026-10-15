import { Muxer as WebmMuxer, ArrayBufferTarget as WebmArrayBufferTarget } from 'webm-muxer';
import { Muxer as Mp4Muxer, ArrayBufferTarget as Mp4ArrayBufferTarget } from 'mp4-muxer';
import {
  AspectRatio,
  BrandOverlayConfig,
  CalloutConfig,
  CameraAnglePreset,
  MarketingAngleShot,
  MarketingPackResult,
  ResolutionOption,
  UmkmOverlayConfig,
  VideoFormat,
} from '../types';
import { StudioEngine } from '../engine/StudioEngine';
import { GifEncoder } from './GifEncoder';

export interface ExportSettings {
  aspectRatio: AspectRatio;
  durationSec: number;
  resolution?: ResolutionOption;
  format?: VideoFormat;
  fps?: number; // default 30 for speed & quality, or 60
  includeWatermark?: boolean;
  watermarkText?: string;
  watermarkPosition?: 'bottom-right' | 'bottom-left' | 'top-right';
  brandOverlay?: BrandOverlayConfig;
  umkmOverlay?: UmkmOverlayConfig;
  callouts?: CalloutConfig;
}

export interface ExportProgressInfo {
  currentFrame: number;
  totalFrames: number;
  percent: number;
  estimatedRemainingSec: number;
  currentRatioIndex?: number;
  totalRatios?: number;
  currentRatioLabel?: string;
}

export interface BatchExportResult {
  ratio: AspectRatio;
  blob: Blob;
  filename: string;
}

export class WebCodecsExporter {
  private isCancelled = false;
  private cachedLogoImg: HTMLImageElement | null = null;

  public cancel(): void {
    this.isCancelled = true;
  }

  /**
   * Calculates width and height for target aspect ratio and resolution (1080p or 4K)
   */
  public static getDimensions(
    aspectRatio: AspectRatio,
    resolution: ResolutionOption = '1080p'
  ): { width: number; height: number } {
    const is4K = resolution === '4k';
    switch (aspectRatio) {
      case '16:9':
        return is4K ? { width: 3840, height: 2160 } : { width: 1920, height: 1080 };
      case '9:16':
        return is4K ? { width: 2160, height: 3840 } : { width: 1080, height: 1920 };
      case '1:1':
        return is4K ? { width: 2160, height: 2160 } : { width: 1080, height: 1080 };
    }
  }

  /**
   * Preloads logo image if brand overlay is enabled
   */
  private async preloadLogo(url?: string | null): Promise<void> {
    if (!url) {
      this.cachedLogoImg = null;
      return;
    }
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.cachedLogoImg = img;
        resolve();
      };
      img.onerror = () => {
        this.cachedLogoImg = null;
        resolve();
      };
      img.src = url;
    });
  }

  /**
   * Main deterministic export function for a single video
   */
  public async exportVideo(
    engine: StudioEngine,
    settings: ExportSettings,
    onProgress: (info: ExportProgressInfo) => void
  ): Promise<Blob> {
    this.isCancelled = false;
    const { width, height } = WebCodecsExporter.getDimensions(
      settings.aspectRatio,
      settings.resolution || '1080p'
    );
    const fps = settings.fps || 30;
    const totalFrames = Math.round(settings.durationSec * fps);
    const format = settings.format || 'webm';

    if (settings.brandOverlay?.logoUrl) {
      await this.preloadLogo(settings.brandOverlay.logoUrl);
    }

    // Check if WebCodecs VideoEncoder is available
    if (typeof window.VideoEncoder !== 'undefined') {
      return this.exportWithWebCodecs(
        engine,
        settings,
        width,
        height,
        fps,
        totalFrames,
        format,
        onProgress
      );
    } else {
      return this.exportWithMediaRecorder(
        engine,
        settings,
        width,
        height,
        fps,
        totalFrames,
        onProgress
      );
    }
  }

  /**
   * One-Click Multi-Ratio Batch Exporter (16:9, 9:16, 1:1 sequentially)
   */
  public async exportBatchMultiRatio(
    engine: StudioEngine,
    settings: Omit<ExportSettings, 'aspectRatio'>,
    projectName: string,
    onProgress: (info: ExportProgressInfo) => void
  ): Promise<BatchExportResult[]> {
    this.isCancelled = false;
    const ratios: { ratio: AspectRatio; label: string; suffix: string }[] = [
      { ratio: '16:9', label: '16:9 Landscape', suffix: '16x9-landscape' },
      { ratio: '9:16', label: '9:16 Portrait (Reels/TikTok)', suffix: '9x16-portrait' },
      { ratio: '1:1', label: '1:1 Square (Feed)', suffix: '1x1-square' },
    ];

    const results: BatchExportResult[] = [];
    const sanitizedName = projectName.toLowerCase().replace(/\s+/g, '-');
    const ext = settings.format === 'mp4' ? 'mp4' : 'webm';

    for (let i = 0; i < ratios.length; i++) {
      if (this.isCancelled) {
        throw new Error('Export cancelled by user');
      }

      const currentRatio = ratios[i];
      const blob = await this.exportVideo(
        engine,
        {
          ...settings,
          aspectRatio: currentRatio.ratio,
        },
        (p) => {
          onProgress({
            ...p,
            currentRatioIndex: i + 1,
            totalRatios: ratios.length,
            currentRatioLabel: currentRatio.label,
          });
        }
      );

      const filename = `${sanitizedName}-${currentRatio.suffix}.${ext}`;
      results.push({ ratio: currentRatio.ratio, blob, filename });
    }

    return results;
  }

  /**
   * One-Click Marketing Shot Pack Generator (Fase 11)
   * Captures 5 studio camera angles + 1 master contact sheet collage
   */
  public async exportMarketingPack(
    engine: StudioEngine,
    settings: {
      resolution?: ResolutionOption;
      includeWatermark?: boolean;
      watermarkText?: string;
      watermarkPosition?: 'bottom-right' | 'bottom-left' | 'top-right';
      brandOverlay?: BrandOverlayConfig;
      umkmOverlay?: UmkmOverlayConfig;
      callouts?: CalloutConfig;
    },
    projectName: string,
    onProgress: (percent: number, statusText: string) => void
  ): Promise<MarketingPackResult> {
    this.isCancelled = false;
    const { width, height } = WebCodecsExporter.getDimensions('16:9', settings.resolution || '1080p');
    const sanitizedName = projectName.toLowerCase().replace(/\s+/g, '-');

    if (settings.brandOverlay?.logoUrl) {
      await this.preloadLogo(settings.brandOverlay.logoUrl);
    }

    const angleDefs: { preset: CameraAnglePreset; label: string; fileSuffix: string }[] = [
      { preset: 'front', label: 'Frontal Flat (Tampak Depan Presisi)', fileSuffix: '01-front-view' },
      { preset: 'isometric_left', label: 'Isometric 45° Kiri (3D Tech)', fileSuffix: '02-isometric-left' },
      { preset: 'isometric_right', label: 'Isometric 45° Kanan (App Store Hero)', fileSuffix: '03-isometric-right' },
      { preset: 'low_angle', label: 'Dramatic Low-Angle (Hero Upward)', fileSuffix: '04-dramatic-low' },
      { preset: 'flatlay', label: 'Top-Down Flatlay (Overhead Desk)', fileSuffix: '05-top-flatlay' },
    ];

    const shots: MarketingAngleShot[] = [];
    const renderedCanvases: HTMLCanvasElement[] = [];

    for (let i = 0; i < angleDefs.length; i++) {
      if (this.isCancelled) throw new Error('Export cancelled by user');

      const def = angleDefs[i];
      onProgress(Math.round(((i + 0.2) / (angleDefs.length + 1)) * 100), `Rendering ${def.label}...`);

      const rawCanvas = await engine.renderStaticAngleForExport(def.preset, width, height);

      // Create output canvas to apply brand overlay / watermark
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = width;
      outputCanvas.height = height;
      const ctx = outputCanvas.getContext('2d')!;
      ctx.drawImage(rawCanvas, 0, 0);

      if (settings.brandOverlay?.enabled) {
        this.drawBrandOverlay(outputCanvas, settings.brandOverlay);
      }
      if (settings.umkmOverlay?.enabled) {
        this.drawUmkmOverlay(outputCanvas, settings.umkmOverlay);
      }
      if (settings.includeWatermark) {
        this.drawWatermark(outputCanvas, settings.watermarkText, settings.watermarkPosition);
      }
      if (settings.callouts?.enabled) {
        this.drawFeatureCallouts(outputCanvas, settings.callouts, engine);
      }

      renderedCanvases.push(outputCanvas);

      const blob = await new Promise<Blob>((resolve) => {
        outputCanvas.toBlob((b) => resolve(b!), 'image/png', 1.0);
      });
      const url = URL.createObjectURL(blob);
      const filename = `${sanitizedName}-${def.fileSuffix}.png`;

      shots.push({
        preset: def.preset,
        label: def.label,
        blob,
        url,
        filename,
      });

      onProgress(Math.round(((i + 1) / (angleDefs.length + 1)) * 100), `Saved ${def.label}`);
      await new Promise((r) => setTimeout(r, 40));
    }

    // Generate Master Contact Sheet (5-in-1 Showcase Collage)
    onProgress(95, 'Generating Master Contact Sheet...');
    const sheetCanvas = document.createElement('canvas');
    sheetCanvas.width = 2560;
    sheetCanvas.height = 1440;
    const sCtx = sheetCanvas.getContext('2d')!;

    // Dark sleek studio background
    const bgGrad = sCtx.createRadialGradient(1280, 720, 200, 1280, 720, 1500);
    bgGrad.addColorStop(0, '#18181b');
    bgGrad.addColorStop(1, '#09090b');
    sCtx.fillStyle = bgGrad;
    sCtx.fillRect(0, 0, sheetCanvas.width, sheetCanvas.height);

    // Subtle header
    sCtx.fillStyle = '#ffffff';
    sCtx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    sCtx.textAlign = 'left';
    sCtx.fillText(projectName.toUpperCase(), 80, 90);

    sCtx.fillStyle = '#71717a';
    sCtx.font = '500 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    sCtx.fillText('3D Studio Showcase • Multi-Angle Marketing Pack', 80, 125);

    // Layout 5 tiles:
    // Left side: Large Hero (Isometric Left or Front)
    // Right side: 4 smaller grid tiles (2x2)
    const heroW = 1200;
    const heroH = 675;
    const heroX = 80;
    const heroY = 175;

    // Draw main hero frame (Isometric Left - index 1)
    sCtx.save();
    sCtx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    sCtx.shadowBlur = 30;
    sCtx.shadowOffsetY = 15;
    sCtx.drawImage(renderedCanvases[1], heroX, heroY, heroW, heroH);
    sCtx.restore();

    // Border around hero
    sCtx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    sCtx.lineWidth = 2;
    sCtx.strokeRect(heroX, heroY, heroW, heroH);

    // Label for Hero
    sCtx.fillStyle = '#a1a1aa';
    sCtx.font = '600 16px -apple-system, sans-serif';
    sCtx.fillText('ANGLE 01 • ISOMETRIC HERO (3D TECH)', heroX + 20, heroY + heroH - 20);

    // Right 4 tiles (Front, Iso Right, Dramatic Low, Flatlay)
    const rightGridX = 1320;
    const tileW = 560;
    const tileH = 315;
    const gapX = 30;
    const gapY = 45;

    const remainingIndices = [0, 2, 3, 4];
    const tileLabels = ['TAMPAK DEPAN', 'ISOMETRIC KANAN', 'DRAMATIC LOW', 'TOP FLATLAY'];

    for (let r = 0; r < remainingIndices.length; r++) {
      const cIndex = remainingIndices[r];
      const col = r % 2;
      const row = Math.floor(r / 2);
      const tx = rightGridX + col * (tileW + gapX);
      const ty = heroY + row * (tileH + gapY);

      sCtx.save();
      sCtx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      sCtx.shadowBlur = 20;
      sCtx.drawImage(renderedCanvases[cIndex], tx, ty, tileW, tileH);
      sCtx.restore();

      sCtx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      sCtx.lineWidth = 1.5;
      sCtx.strokeRect(tx, ty, tileW, tileH);

      sCtx.fillStyle = '#a1a1aa';
      sCtx.font = '600 14px -apple-system, sans-serif';
      sCtx.fillText(`ANGLE 0${r + 2} • ${tileLabels[r]}`, tx + 15, ty + tileH - 15);
    }

    // Bottom Watermark on Contact Sheet
    sCtx.textAlign = 'right';
    sCtx.fillStyle = '#52525b';
    sCtx.font = '500 16px -apple-system, sans-serif';
    sCtx.fillText('Rendered with Showcase Studio 3D • 100% Client-Side WebGL', 2480, 1380);

    const contactSheetBlob = await new Promise<Blob>((resolve) => {
      sheetCanvas.toBlob((b) => resolve(b!), 'image/png', 1.0);
    });
    const contactSheetUrl = URL.createObjectURL(contactSheetBlob);

    onProgress(100, 'Marketing Pack completed!');
    return {
      shots,
      contactSheetBlob,
      contactSheetUrl,
    };
  }

  /**
   * Generates a high-quality looping animated GIF (Fase 11)
   */
  public async exportGif(
    engine: StudioEngine,
    settings: {
      aspectRatio: AspectRatio;
      fps?: number;
      loopSec?: number;
      includeWatermark?: boolean;
      watermarkText?: string;
      watermarkPosition?: 'bottom-right' | 'bottom-left' | 'top-right';
      brandOverlay?: BrandOverlayConfig;
      umkmOverlay?: UmkmOverlayConfig;
      callouts?: CalloutConfig;
    },
    onProgress: (percent: number, statusText: string) => void
  ): Promise<Blob> {
    this.isCancelled = false;
    const fps = settings.fps || 12;
    const loopSec = settings.loopSec || 2.5;
    const totalFrames = Math.round(loopSec * fps);

    // Set GIF canvas dimensions (optimized for web & social platforms)
    let w = 480;
    let h = 270;
    if (settings.aspectRatio === '9:16') {
      w = 270;
      h = 480;
    } else if (settings.aspectRatio === '1:1') {
      w = 360;
      h = 360;
    }

    if (settings.brandOverlay?.logoUrl) {
      await this.preloadLogo(settings.brandOverlay.logoUrl);
    }

    const encoder = new GifEncoder(w, h);
    const delayMs = Math.round(1000 / fps);

    for (let f = 0; f < totalFrames; f++) {
      if (this.isCancelled) throw new Error('Export cancelled by user');

      const t = f / totalFrames;
      onProgress(
        Math.round((f / (totalFrames + 5)) * 100),
        `Capturing GIF frame ${f + 1} of ${totalFrames}...`
      );

      const frameCanvas = await engine.renderFrameForExport(t, w, h);

      // Create composite canvas
      const compCanvas = document.createElement('canvas');
      compCanvas.width = w;
      compCanvas.height = h;
      const ctx = compCanvas.getContext('2d', { willReadFrequently: true })!;
      ctx.drawImage(frameCanvas, 0, 0);

      if (settings.brandOverlay?.enabled) {
        this.drawBrandOverlay(compCanvas, settings.brandOverlay);
      }
      if (settings.umkmOverlay?.enabled) {
        this.drawUmkmOverlay(compCanvas, settings.umkmOverlay);
      }
      if (settings.includeWatermark) {
        this.drawWatermark(compCanvas, settings.watermarkText, settings.watermarkPosition);
      }
      if (settings.callouts?.enabled) {
        this.drawFeatureCallouts(compCanvas, settings.callouts, engine);
      }

      const imgData = ctx.getImageData(0, 0, w, h);
      encoder.addFrame(imgData, { delayMs });

      if (f % 3 === 0) {
        await new Promise((r) => setTimeout(r, 0));
      }
    }

    onProgress(90, 'Encoding GIF palette & LZW compression...');
    await new Promise((r) => setTimeout(r, 10));

    const gifBlob = encoder.encode((p) => {
      onProgress(90 + Math.round(p * 0.1), `Optimizing GIF (${p}%)...`);
    });

    onProgress(100, 'GIF export completed!');
    return gifBlob;
  }

  /**
   * High performance deterministic WebCodecs export supporting WebM (VP9/VP8) and MP4 (H.264)
   */
  private async exportWithWebCodecs(
    engine: StudioEngine,
    settings: ExportSettings,
    width: number,
    height: number,
    fps: number,
    totalFrames: number,
    format: VideoFormat,
    onProgress: (info: ExportProgressInfo) => void
  ): Promise<Blob> {
    const is4K = settings.resolution === '4k';
    const bitrate = is4K ? 28_000_000 : 12_000_000;

    let webmMuxer: WebmMuxer<WebmArrayBufferTarget> | null = null;
    let mp4Muxer: Mp4Muxer<Mp4ArrayBufferTarget> | null = null;

    if (format === 'mp4') {
      mp4Muxer = new Mp4Muxer({
        target: new Mp4ArrayBufferTarget(),
        video: {
          codec: 'avc',
          width,
          height,
        },
        fastStart: 'in-memory',
      });
    } else {
      webmMuxer = new WebmMuxer({
        target: new WebmArrayBufferTarget(),
        video: {
          codec: 'V_VP9',
          width,
          height,
          frameRate: fps,
        },
      });
    }

    let encoderError: Error | null = null;
    const encoder = new VideoEncoder({
      output: (chunk, meta) => {
        if (format === 'mp4' && mp4Muxer) {
          mp4Muxer.addVideoChunk(chunk, meta);
        } else if (webmMuxer) {
          webmMuxer.addVideoChunk(chunk, meta);
        }
      },
      error: (e) => {
        encoderError = e;
        console.error('VideoEncoder error:', e);
      },
    });

    // Configure encoder based on format
    if (format === 'mp4') {
      try {
        await encoder.configure({
          codec: 'avc1.4d002a', // H.264 Main Profile Level 4.2
          width,
          height,
          bitrate,
          framerate: fps,
        });
      } catch {
        // Fallback to baseline
        await encoder.configure({
          codec: 'avc1.42001f',
          width,
          height,
          bitrate,
          framerate: fps,
        });
      }
    } else {
      try {
        await encoder.configure({
          codec: 'vp09.00.10.08',
          width,
          height,
          bitrate,
          framerate: fps,
        });
      } catch {
        await encoder.configure({
          codec: 'vp8',
          width,
          height,
          bitrate,
          framerate: fps,
        });
      }
    }

    const startTime = performance.now();

    for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
      if (this.isCancelled) {
        encoder.close();
        throw new Error('Export cancelled by user');
      }
      if (encoderError) {
        encoder.close();
        throw encoderError;
      }

      const t = frameIndex / totalFrames;
      const frameCanvas = await engine.renderFrameForExport(t, width, height);

      // Draw Brand Typography & Logo Overlay if enabled
      if (settings.brandOverlay?.enabled) {
        this.drawBrandOverlay(frameCanvas, settings.brandOverlay);
      }

      // Draw UMKM E-Commerce Product Showcase Overlay if enabled
      if (settings.umkmOverlay?.enabled) {
        this.drawUmkmOverlay(frameCanvas, settings.umkmOverlay);
      }

      // Draw Watermark Badge if enabled
      if (settings.includeWatermark) {
        this.drawWatermark(frameCanvas, settings.watermarkText, settings.watermarkPosition);
      }

      if (settings.callouts?.enabled) {
        this.drawFeatureCallouts(frameCanvas, settings.callouts, engine);
      }

      const timestampMicroseconds = Math.round((frameIndex * 1_000_000) / fps);
      const videoFrame = new VideoFrame(frameCanvas, {
        timestamp: timestampMicroseconds,
        duration: Math.round(1_000_000 / fps),
      });

      encoder.encode(videoFrame, { keyFrame: frameIndex % (fps * 2) === 0 });
      videoFrame.close();

      // Progress calculation
      const elapsedSec = (performance.now() - startTime) / 1000;
      const framesDone = frameIndex + 1;
      const avgSecPerFrame = elapsedSec / framesDone;
      const remainingFrames = totalFrames - framesDone;
      const estimatedRemainingSec = Math.ceil(remainingFrames * avgSecPerFrame);

      onProgress({
        currentFrame: framesDone,
        totalFrames,
        percent: Math.round((framesDone / totalFrames) * 100),
        estimatedRemainingSec,
      });

      if (frameIndex % 5 === 0) {
        await new Promise((r) => setTimeout(r, 0));
      }
    }

    await encoder.flush();
    encoder.close();

    if (format === 'mp4' && mp4Muxer) {
      mp4Muxer.finalize();
      return new Blob([mp4Muxer.target.buffer], { type: 'video/mp4' });
    } else if (webmMuxer) {
      webmMuxer.finalize();
      return new Blob([webmMuxer.target.buffer], { type: 'video/webm' });
    }

    throw new Error('Failed to retrieve video buffer from muxer');
  }

  /**
   * Fallback for older browsers
   */
  private async exportWithMediaRecorder(
    engine: StudioEngine,
    settings: ExportSettings,
    width: number,
    height: number,
    fps: number,
    totalFrames: number,
    onProgress: (info: ExportProgressInfo) => void
  ): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const stream = canvas.captureStream(fps);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 10_000_000,
    });

    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    const recordPromise = new Promise<Blob>((resolve, reject) => {
      mediaRecorder.onstop = () => {
        resolve(new Blob(chunks, { type: 'video/webm' }));
      };
      mediaRecorder.onerror = reject;
    });

    mediaRecorder.start();

    const startTime = performance.now();
    for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
      if (this.isCancelled) {
        mediaRecorder.stop();
        throw new Error('Export cancelled by user');
      }

      const t = frameIndex / totalFrames;
      const frameCanvas = await engine.renderFrameForExport(t, width, height);

      ctx.drawImage(frameCanvas, 0, 0);

      if (settings.brandOverlay?.enabled) {
        this.drawBrandOverlay(canvas, settings.brandOverlay);
      }
      if (settings.umkmOverlay?.enabled) {
        this.drawUmkmOverlay(canvas, settings.umkmOverlay);
      }
      if (settings.includeWatermark) {
        this.drawWatermark(canvas);
      }
      if (settings.callouts?.enabled) {
        this.drawFeatureCallouts(canvas, settings.callouts, engine);
      }

      const elapsedSec = (performance.now() - startTime) / 1000;
      const framesDone = frameIndex + 1;
      const estimatedRemainingSec = Math.ceil(
        (totalFrames - framesDone) * (elapsedSec / framesDone)
      );

      onProgress({
        currentFrame: framesDone,
        totalFrames,
        percent: Math.round((framesDone / totalFrames) * 100),
        estimatedRemainingSec,
      });

      await new Promise((r) => setTimeout(r, 1000 / fps));
    }

    mediaRecorder.stop();
    return recordPromise;
  }

  /**
   * Draws Custom Brand Typography & Client Logo Overlay
   */
  public drawBrandOverlay(
    canvas: HTMLCanvasElement,
    overlay: BrandOverlayConfig
  ): void {
    if (!overlay.title && !overlay.subtitle && !this.cachedLogoImg) return;

    const ctx = canvas.getContext('2d')!;
    const w = canvas.width;
    const h = canvas.height;
    const scale = w / 1920; // scale factor based on 1080p width

    ctx.save();

    const margin = Math.round(70 * scale);
    const titleSize = Math.round(44 * scale);
    const subSize = Math.round(24 * scale);

    let x = margin;
    let y = margin + titleSize;
    let textAlign: CanvasTextAlign = 'left';

    if (overlay.position === 'top-center') {
      x = w / 2;
      textAlign = 'center';
    } else if (overlay.position === 'bottom-left') {
      y = h - margin - (overlay.subtitle ? subSize + 15 * scale : 0);
    } else if (overlay.position === 'bottom-center') {
      x = w / 2;
      y = h - margin - (overlay.subtitle ? subSize + 15 * scale : 0);
      textAlign = 'center';
    }

    ctx.textAlign = textAlign;

    // Draw logo if exists
    if (this.cachedLogoImg) {
      const logoH = Math.round(48 * scale);
      const aspect = this.cachedLogoImg.width / this.cachedLogoImg.height;
      const logoW = Math.round(logoH * aspect);
      const logoX = textAlign === 'center' ? x - logoW / 2 : x;
      const logoY = overlay.position.startsWith('bottom') ? y - titleSize - logoH - 12 * scale : y - titleSize - 10 * scale;

      ctx.drawImage(this.cachedLogoImg, logoX, logoY, logoW, logoH);
      if (overlay.position.startsWith('top')) {
        y += logoH + 16 * scale;
      }
    }

    // Title
    if (overlay.title) {
      ctx.fillStyle = overlay.textColor || '#ffffff';
      ctx.font = `bold ${titleSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 12 * scale;
      ctx.fillText(overlay.title, x, y);
    }

    // Subtitle
    if (overlay.subtitle) {
      ctx.fillStyle = 'rgba(244, 244, 245, 0.7)';
      ctx.font = `500 ${subSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 8 * scale;
      ctx.fillText(overlay.subtitle, x, y + subSize + 10 * scale);
    }

    ctx.restore();
  }

  /**
   * Draws discreet watermark badge with customizable text and position
   */
  public drawWatermark(
    canvas: HTMLCanvasElement,
    customText = '⚡ Showcase Studio',
    position: 'bottom-right' | 'bottom-left' | 'top-right' = 'bottom-right'
  ): void {
    const ctx = canvas.getContext('2d')!;
    const w = canvas.width;
    const h = canvas.height;
    const scale = w / 1920;

    ctx.save();
    ctx.font = `bold ${Math.round(18 * scale)}px -apple-system, sans-serif`;
    const textW = ctx.measureText(customText).width;
    const badgeW = Math.round(textW + 48 * scale);
    const badgeH = Math.round(44 * scale);
    const margin = Math.round(36 * scale);

    let bx = w - badgeW - margin;
    let by = h - badgeH - margin;

    if (position === 'bottom-left') {
      bx = margin;
      by = h - badgeH - margin;
    } else if (position === 'top-right') {
      bx = w - badgeW - margin;
      by = margin;
    }

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    const r = Math.round(22 * scale);
    ctx.roundRect(bx, by, badgeW, badgeH, r);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = Math.max(1, Math.round(1 * scale));
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'left';
    ctx.fillText(customText, bx + Math.round(24 * scale), by + Math.round(28 * scale));
    ctx.restore();
  }

  /**
   * Draws UMKM / E-Commerce Product Showcase Overlay
   */
  public drawUmkmOverlay(
    canvas: HTMLCanvasElement,
    umkm: UmkmOverlayConfig
  ): void {
    if (!umkm || !umkm.enabled) return;

    const ctx = canvas.getContext('2d')!;
    const w = canvas.width;
    const h = canvas.height;
    const minDim = Math.min(w, h);
    const scale = minDim / 1080;

    ctx.save();

    const isTop = umkm.position === 'top-banner';
    const cardW = Math.min(Math.round(w * 0.92), Math.round(860 * scale));
    const cardH = Math.round(112 * scale);
    const cardX = (w - cardW) / 2;
    const cardY = isTop ? Math.round(48 * scale) : h - cardH - Math.round(48 * scale);
    const cornerR = Math.round(20 * scale);

    // Draw backdrop card with glassmorphism
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, cornerR);
    ctx.fillStyle = 'rgba(9, 9, 11, 0.94)';
    ctx.fill();
    ctx.lineWidth = Math.max(1, Math.round(1.5 * scale));
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.stroke();

    // Subtle colored accent top border
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, Math.round(4 * scale), [cornerR, cornerR, 0, 0]);
    const grad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY);
    grad.addColorStop(0, '#f97316');
    grad.addColorStop(0.5, '#ef4444');
    grad.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    // Left info: Store name & Pricing
    const leftPad = Math.round(24 * scale);
    const topPad = Math.round(30 * scale);

    // Store Name
    ctx.fillStyle = '#a1a1aa';
    ctx.font = `600 ${Math.round(16 * scale)}px -apple-system, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(`🛍️ ${umkm.storeName || 'Toko Resmi'}`, cardX + leftPad, cardY + topPad);

    // Strikethrough Original Price
    let priceX = cardX + leftPad;
    const priceY = cardY + topPad + Math.round(38 * scale);

    if (umkm.originalPrice) {
      ctx.fillStyle = '#71717a';
      ctx.font = `500 ${Math.round(18 * scale)}px -apple-system, sans-serif`;
      ctx.fillText(umkm.originalPrice, priceX, priceY);
      const origW = ctx.measureText(umkm.originalPrice).width;

      // Strike line
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = Math.round(1.5 * scale);
      ctx.beginPath();
      ctx.moveTo(priceX - 2, priceY - Math.round(6 * scale));
      ctx.lineTo(priceX + origW + 2, priceY - Math.round(6 * scale));
      ctx.stroke();

      priceX += origW + Math.round(12 * scale);
    }

    // Sale Price (Bold Highlighted)
    if (umkm.salePrice) {
      ctx.fillStyle = '#22c55e';
      ctx.font = `bold ${Math.round(26 * scale)}px -apple-system, sans-serif`;
      ctx.fillText(umkm.salePrice, priceX, priceY);
      priceX += ctx.measureText(umkm.salePrice).width + Math.round(10 * scale);
    }

    // Discount Tag
    if (umkm.discountPercent) {
      const discTag = umkm.discountPercent;
      ctx.font = `bold ${Math.round(13 * scale)}px -apple-system, sans-serif`;
      const tagW = ctx.measureText(discTag).width + Math.round(16 * scale);
      const tagH = Math.round(24 * scale);
      const tagY = priceY - Math.round(20 * scale);

      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.roundRect(priceX, tagY, tagW, tagH, Math.round(6 * scale));
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(discTag, priceX + tagW / 2, tagY + Math.round(16 * scale));
    }

    // Right info: Badge & CTA
    const rightPad = Math.round(24 * scale);
    const rightX = cardX + cardW - rightPad;

    // Promo Badge
    let badgeLabel = '🚚 Gratis Ongkir Se-Indonesia';
    if (umkm.badgeType === 'flash_sale') badgeLabel = '🔥 Flash Sale Terbatas';
    else if (umkm.badgeType === 'cod') badgeLabel = '💵 Bayar di Tempat (COD)';
    else if (umkm.badgeType === 'best_seller') badgeLabel = '⭐ Produk Terlaris';
    else if (umkm.badgeType === 'garansi_resmi') badgeLabel = '🛡️ 100% Original Bergaransi';
    else if (umkm.badgeType === 'diskon_spesial') badgeLabel = '🎉 Diskon Spesial Hari Ini';
    if (umkm.customBadgeText) badgeLabel = umkm.customBadgeText;

    ctx.textAlign = 'right';
    ctx.font = `600 ${Math.round(15 * scale)}px -apple-system, sans-serif`;
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(badgeLabel, rightX, cardY + topPad);

    // CTA Channel Button Pill
    let ctaLabel = `Pesan: ${umkm.ctaContact || 'WhatsApp'}`;
    let ctaBg = '#16a34a'; // Green for WA
    if (umkm.ctaChannel === 'shopee') {
      ctaLabel = `Beli di Shopee`;
      ctaBg = '#ea580c';
    } else if (umkm.ctaChannel === 'tokopedia') {
      ctaLabel = `Beli di Tokopedia`;
      ctaBg = '#059669';
    } else if (umkm.ctaChannel === 'tiktok') {
      ctaLabel = `Beli di TikTok Shop`;
      ctaBg = '#0f172a';
    } else if (umkm.ctaChannel === 'website') {
      ctaLabel = `Order via Website`;
      ctaBg = '#2563eb';
    }

    ctx.font = `bold ${Math.round(15 * scale)}px -apple-system, sans-serif`;
    const ctaW = ctx.measureText(ctaLabel).width + Math.round(24 * scale);
    const ctaH = Math.round(34 * scale);
    const ctaBtnX = rightX - ctaW;
    const ctaBtnY = cardY + topPad + Math.round(12 * scale);

    ctx.fillStyle = ctaBg;
    ctx.beginPath();
    ctx.roundRect(ctaBtnX, ctaBtnY, ctaW, ctaH, Math.round(17 * scale));
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = Math.max(1, Math.round(1 * scale));
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(ctaLabel, ctaBtnX + ctaW / 2, ctaBtnY + Math.round(22 * scale));

    ctx.restore();
  }

  /**
   * Draws 3D Projected Feature Callout Pins & Annotations (Fase 12)
   */
  public drawFeatureCallouts(
    canvas: HTMLCanvasElement,
    config: CalloutConfig,
    engine: StudioEngine
  ): void {
    if (!config || !config.enabled || !config.callouts || config.callouts.length === 0) return;

    const ctx = canvas.getContext('2d')!;
    const w = canvas.width;
    const h = canvas.height;
    const scale = Math.min(w, h) / 1080;

    ctx.save();

    for (const callout of config.callouts) {
      const proj = engine.projectScreenPoint(callout.screenX, callout.screenY, w, h);
      if (!proj.visible) continue;

      const px = proj.x;
      const py = proj.y;
      const accentColor = callout.badgeColor || '#3b82f6';

      // 1. Draw 3D Target Pinpoint Dot
      ctx.beginPath();
      ctx.arc(px, py, Math.round(5 * scale), 0, Math.PI * 2);
      ctx.fillStyle = accentColor;
      ctx.fill();

      // Outer glowing ring
      ctx.beginPath();
      ctx.arc(px, py, Math.round(9 * scale), 0, Math.PI * 2);
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = Math.max(1, Math.round(2 * scale));
      ctx.stroke();

      // 2. Connecting Leader Line
      const isRight = callout.screenX < 0.6;
      const lineLenX = Math.round((isRight ? 36 : -36) * scale);
      const lineLenY = Math.round(-32 * scale);
      const elbowX = px + lineLenX;
      const elbowY = py + lineLenY;

      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(elbowX, elbowY);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = Math.max(1, Math.round(1.5 * scale));
      ctx.stroke();

      // 3. Glassmorphic Callout Pill
      const titleFont = `bold ${Math.round(13 * scale)}px -apple-system, sans-serif`;
      const descFont = `400 ${Math.round(11 * scale)}px -apple-system, sans-serif`;

      ctx.font = titleFont;
      const titleW = ctx.measureText(callout.title).width;
      let descW = 0;
      if (callout.description) {
        ctx.font = descFont;
        descW = ctx.measureText(callout.description).width;
      }

      const textW = Math.max(titleW, descW);
      const pillW = textW + Math.round(44 * scale);
      const pillH = callout.description ? Math.round(42 * scale) : Math.round(30 * scale);
      const pillX = isRight ? elbowX : elbowX - pillW;
      const pillY = elbowY - pillH / 2;
      const cornerR = Math.round(12 * scale);

      // Pill Background
      ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
      ctx.shadowBlur = Math.round(15 * scale);
      ctx.shadowOffsetY = Math.round(4 * scale);

      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, cornerR);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      ctx.fill();

      // Border with accent tint
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = Math.max(1, Math.round(1 * scale));
      ctx.stroke();

      // Left Accent Color Strip
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, Math.round(4 * scale), pillH, [cornerR, 0, 0, cornerR]);
      ctx.fillStyle = accentColor;
      ctx.fill();

      ctx.shadowColor = 'transparent';

      // Icon
      const iconStr = callout.icon || '⚡';
      ctx.font = `${Math.round(14 * scale)}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(iconStr, pillX + Math.round(10 * scale), pillY + (callout.description ? pillH / 2.5 : pillH / 2));

      // Title
      ctx.font = titleFont;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      const textX = pillX + Math.round(30 * scale);
      const titleY = callout.description ? pillY + Math.round(18 * scale) : pillY + Math.round(20 * scale);
      ctx.fillText(callout.title, textX, titleY);

      // Description (if present)
      if (callout.description) {
        ctx.font = descFont;
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(callout.description, textX, pillY + Math.round(34 * scale));
      }
    }

    ctx.restore();
  }
}
