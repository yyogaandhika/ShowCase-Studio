import * as THREE from 'three';
import { DeviceType, ScreenAsset, ScreenTransformConfig } from '../types';

export class ScreenTextureManager {
  private currentTexture: THREE.Texture | null = null;
  private currentVideoElement: HTMLVideoElement | null = null;
  private isVideo = false;
  private defaultPhoneTexture: THREE.CanvasTexture | null = null;
  private defaultLaptopTexture: THREE.CanvasTexture | null = null;
  private defaultWatchTexture: THREE.CanvasTexture | null = null;

  private cachedImageElement: HTMLImageElement | null = null;
  private currentTransform: ScreenTransformConfig = {
    fitMode: 'cover',
    scale: 1.0,
    panX: 0,
    panY: 0,
  };
  private offscreenCanvas: HTMLCanvasElement | null = null;
  private canvasTexture: THREE.CanvasTexture | null = null;

  constructor() {
    this.createDefaultTextures();
  }

  /**
   * Generates crisp procedural placeholder mock UI canvases
   */
  private createDefaultTextures() {
    // 1. Mobile App Mock UI (1080 x 2400)
    const phoneCanvas = document.createElement('canvas');
    phoneCanvas.width = 1080;
    phoneCanvas.height = 2400;
    const pCtx = phoneCanvas.getContext('2d')!;

    // Background
    pCtx.fillStyle = '#0f172a';
    pCtx.fillRect(0, 0, 1080, 2400);

    // Header gradient glow
    const pGlow = pCtx.createRadialGradient(540, 200, 50, 540, 200, 600);
    pGlow.addColorStop(0, 'rgba(59, 130, 246, 0.25)');
    pGlow.addColorStop(1, 'rgba(15, 23, 42, 0)');
    pCtx.fillStyle = pGlow;
    pCtx.fillRect(0, 0, 1080, 800);

    // Status bar simulation
    pCtx.fillStyle = '#94a3b8';
    pCtx.font = 'bold 38px -apple-system, sans-serif';
    pCtx.fillText('9:41', 80, 110);
    pCtx.fillText('5G · 100%', 850, 110);

    // App header
    pCtx.fillStyle = '#ffffff';
    pCtx.font = 'bold 64px -apple-system, sans-serif';
    pCtx.fillText('Nexus Finance', 80, 260);
    pCtx.fillStyle = '#64748b';
    pCtx.font = '36px -apple-system, sans-serif';
    pCtx.fillText('Active Portfolio · Q4 Growth', 80, 320);

    // Balance Card
    pCtx.fillStyle = '#1e293b';
    this.roundRect(pCtx, 80, 380, 920, 420, 36);
    pCtx.fill();
    pCtx.strokeStyle = '#334155';
    pCtx.lineWidth = 3;
    pCtx.stroke();

    pCtx.fillStyle = '#94a3b8';
    pCtx.font = '34px -apple-system, sans-serif';
    pCtx.fillText('Total Value', 130, 460);

    pCtx.fillStyle = '#ffffff';
    pCtx.font = 'bold 88px -apple-system, sans-serif';
    pCtx.fillText('$184,290.50', 130, 570);

    // Growth badge
    pCtx.fillStyle = '#065f46';
    this.roundRect(pCtx, 130, 630, 240, 60, 30);
    pCtx.fill();
    pCtx.fillStyle = '#34d399';
    pCtx.font = 'bold 30px -apple-system, sans-serif';
    pCtx.fillText('▲ +24.8% APR', 150, 672);

    // Graph line simulation
    pCtx.beginPath();
    pCtx.moveTo(420, 720);
    pCtx.bezierCurveTo(550, 680, 680, 760, 780, 600);
    pCtx.bezierCurveTo(840, 520, 900, 560, 960, 480);
    pCtx.strokeStyle = '#38bdf8';
    pCtx.lineWidth = 8;
    pCtx.lineCap = 'round';
    pCtx.stroke();

    // Quick Action Buttons
    const actions = [
      { name: 'Transfer', icon: '↗' },
      { name: 'Invest', icon: '⚡' },
      { name: 'Analytics', icon: '📊' },
      { name: 'Cards', icon: '💳' },
    ];
    for (let i = 0; i < 4; i++) {
      const bx = 80 + i * 240;
      pCtx.fillStyle = '#1e293b';
      this.roundRect(pCtx, bx, 850, 200, 180, 32);
      pCtx.fill();
      pCtx.fillStyle = '#38bdf8';
      pCtx.font = '54px -apple-system, sans-serif';
      pCtx.fillText(actions[i].icon, bx + 70, 930);
      pCtx.fillStyle = '#f1f5f9';
      pCtx.font = 'bold 30px -apple-system, sans-serif';
      pCtx.textAlign = 'center';
      pCtx.fillText(actions[i].name, bx + 100, 990);
      pCtx.textAlign = 'left';
    }

    // Recent Transactions List
    pCtx.fillStyle = '#ffffff';
    pCtx.font = 'bold 50px -apple-system, sans-serif';
    pCtx.fillText('Recent Activity', 80, 1130);

    const txs = [
      { name: 'Cloud Infrastructure', cat: 'DevOps & Hosting', amount: '-$1,240.00', color: '#f87171' },
      { name: 'Stripe Merchant Payout', cat: 'SaaS Inflow', amount: '+$14,800.00', color: '#4ade80' },
      { name: 'Apple Developer Sub', cat: 'App Store License', amount: '-$99.00', color: '#f87171' },
      { name: 'Enterprise Contract', cat: 'Software Services', amount: '+$32,000.00', color: '#4ade80' },
      { name: 'Figma Team Plan', cat: 'Design Suite', amount: '-$240.00', color: '#f87171' },
    ];

    txs.forEach((tx, idx) => {
      const ty = 1200 + idx * 190;
      pCtx.fillStyle = '#1e293b';
      this.roundRect(pCtx, 80, ty, 920, 150, 28);
      pCtx.fill();

      // Icon circle
      pCtx.fillStyle = '#334155';
      pCtx.beginPath();
      pCtx.arc(155, ty + 75, 45, 0, Math.PI * 2);
      pCtx.fill();

      pCtx.fillStyle = '#ffffff';
      pCtx.font = 'bold 38px -apple-system, sans-serif';
      pCtx.fillText(tx.name, 230, ty + 65);

      pCtx.fillStyle = '#94a3b8';
      pCtx.font = '30px -apple-system, sans-serif';
      pCtx.fillText(tx.cat, 230, ty + 115);

      pCtx.fillStyle = tx.color;
      pCtx.font = 'bold 38px -apple-system, sans-serif';
      pCtx.textAlign = 'right';
      pCtx.fillText(tx.amount, 950, ty + 90);
      pCtx.textAlign = 'left';
    });

    this.defaultPhoneTexture = new THREE.CanvasTexture(phoneCanvas);
    this.defaultPhoneTexture.colorSpace = THREE.SRGBColorSpace;
    this.defaultPhoneTexture.minFilter = THREE.LinearMipmapLinearFilter;
    this.defaultPhoneTexture.generateMipmaps = true;

    // 2. Desktop SaaS Dashboard Mock UI (1920 x 1200)
    const laptopCanvas = document.createElement('canvas');
    laptopCanvas.width = 1920;
    laptopCanvas.height = 1200;
    const lCtx = laptopCanvas.getContext('2d')!;

    lCtx.fillStyle = '#0b0f19';
    lCtx.fillRect(0, 0, 1920, 1200);

    // Sidebar
    lCtx.fillStyle = '#111827';
    lCtx.fillRect(0, 0, 320, 1200);
    lCtx.strokeStyle = '#1f2937';
    lCtx.lineWidth = 2;
    lCtx.strokeRect(320, 0, 0, 1200);

    // Brand logo
    lCtx.fillStyle = '#3b82f6';
    this.roundRect(lCtx, 40, 40, 48, 48, 12);
    lCtx.fill();
    lCtx.fillStyle = '#ffffff';
    lCtx.font = 'bold 32px -apple-system, sans-serif';
    lCtx.fillText('Pulse SaaS', 105, 75);

    // Nav items
    const navs = ['Overview', 'Analytics', 'Customers', 'Campaigns', 'Integrations', 'Settings'];
    navs.forEach((nav, i) => {
      const ny = 160 + i * 65;
      if (i === 0) {
        lCtx.fillStyle = '#1f2937';
        this.roundRect(lCtx, 30, ny - 35, 260, 52, 12);
        lCtx.fill();
        lCtx.fillStyle = '#60a5fa';
      } else {
        lCtx.fillStyle = '#9ca3af';
      }
      lCtx.font = '24px -apple-system, sans-serif';
      lCtx.fillText(nav, 60, ny);
    });

    // Main top bar
    lCtx.fillStyle = '#ffffff';
    lCtx.font = 'bold 38px -apple-system, sans-serif';
    lCtx.fillText('Agency Performance Hub', 380, 80);
    lCtx.fillStyle = '#9ca3af';
    lCtx.font = '22px -apple-system, sans-serif';
    lCtx.fillText('Real-time metric sync · Production Cluster', 380, 115);

    // Metric Cards
    const kpis = [
      { label: 'Monthly Recurring Revenue', val: '$148,920', change: '+18.4%' },
      { label: 'Active Deployments', val: '1,429', change: '+9.1%' },
      { label: 'Avg Server Latency', val: '24ms', change: '-12ms' },
      { label: 'Client Retention', val: '98.6%', change: '+1.2%' },
    ];
    kpis.forEach((kpi, idx) => {
      const kx = 380 + idx * 365;
      lCtx.fillStyle = '#111827';
      this.roundRect(lCtx, kx, 160, 340, 180, 18);
      lCtx.fill();
      lCtx.strokeStyle = '#1f2937';
      lCtx.lineWidth = 1.5;
      lCtx.stroke();

      lCtx.fillStyle = '#9ca3af';
      lCtx.font = '20px -apple-system, sans-serif';
      lCtx.fillText(kpi.label, kx + 25, 205);

      lCtx.fillStyle = '#ffffff';
      lCtx.font = 'bold 44px -apple-system, sans-serif';
      lCtx.fillText(kpi.val, kx + 25, 270);

      lCtx.fillStyle = '#10b981';
      lCtx.font = 'bold 20px -apple-system, sans-serif';
      lCtx.fillText(kpi.change, kx + 25, 315);
    });

    // Big Chart Card
    lCtx.fillStyle = '#111827';
    this.roundRect(lCtx, 380, 380, 1475, 420, 20);
    lCtx.fill();
    lCtx.stroke();

    lCtx.fillStyle = '#ffffff';
    lCtx.font = 'bold 26px -apple-system, sans-serif';
    lCtx.fillText('Traffic & Conversion Throughput', 420, 435);

    // Chart grid lines
    lCtx.strokeStyle = '#1e293b';
    lCtx.lineWidth = 1;
    for (let y = 490; y <= 720; y += 60) {
      lCtx.beginPath();
      lCtx.moveTo(420, y);
      lCtx.lineTo(1810, y);
      lCtx.stroke();
    }

    // Chart Wave 1 (Gradient Area)
    const waveGrad = lCtx.createLinearGradient(0, 480, 0, 720);
    waveGrad.addColorStop(0, 'rgba(59, 130, 246, 0.35)');
    waveGrad.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
    lCtx.fillStyle = waveGrad;
    lCtx.beginPath();
    lCtx.moveTo(420, 720);
    lCtx.lineTo(420, 660);
    lCtx.bezierCurveTo(650, 600, 850, 690, 1050, 550);
    lCtx.bezierCurveTo(1250, 420, 1450, 520, 1650, 460);
    lCtx.lineTo(1810, 440);
    lCtx.lineTo(1810, 720);
    lCtx.closePath();
    lCtx.fill();

    // Chart Wave Stroke
    lCtx.strokeStyle = '#3b82f6';
    lCtx.lineWidth = 4;
    lCtx.beginPath();
    lCtx.moveTo(420, 660);
    lCtx.bezierCurveTo(650, 600, 850, 690, 1050, 550);
    lCtx.bezierCurveTo(1250, 420, 1450, 520, 1650, 460);
    lCtx.lineTo(1810, 440);
    lCtx.stroke();

    // Bottom Activity Table
    lCtx.fillStyle = '#111827';
    this.roundRect(lCtx, 380, 830, 1475, 330, 20);
    lCtx.fill();
    lCtx.stroke();

    lCtx.fillStyle = '#ffffff';
    lCtx.font = 'bold 24px -apple-system, sans-serif';
    lCtx.fillText('Active Projects & Client Deliverables', 420, 880);

    const projs = [
      { client: 'Fintech Mobile Superapp', stage: 'Production Release', status: 'Delivered', uptime: '99.98%' },
      { client: 'AI Video Editor Web Platform', stage: 'Sprint 14 Validation', status: 'In Review', uptime: '100%' },
      { client: 'E-commerce Headless Store', stage: 'Pre-launch Load Test', status: 'Testing', uptime: '99.95%' },
    ];
    projs.forEach((p, idx) => {
      const py = 935 + idx * 65;
      lCtx.fillStyle = '#cbd5e1';
      lCtx.font = 'bold 22px -apple-system, sans-serif';
      lCtx.fillText(p.client, 420, py);

      lCtx.fillStyle = '#94a3b8';
      lCtx.font = '20px -apple-system, sans-serif';
      lCtx.fillText(p.stage, 880, py);

      lCtx.fillStyle = idx === 0 ? '#10b981' : idx === 1 ? '#38bdf8' : '#fbbf24';
      lCtx.fillText(p.status, 1350, py);

      lCtx.fillStyle = '#e2e8f0';
      lCtx.fillText(p.uptime, 1720, py);
    });

    this.defaultLaptopTexture = new THREE.CanvasTexture(laptopCanvas);
    this.defaultLaptopTexture.colorSpace = THREE.SRGBColorSpace;
    this.defaultLaptopTexture.minFilter = THREE.LinearMipmapLinearFilter;
    this.defaultLaptopTexture.generateMipmaps = true;

    // 3. Smartwatch OLED Mock UI (1000 x 1200)
    const watchCanvas = document.createElement('canvas');
    watchCanvas.width = 1000;
    watchCanvas.height = 1200;
    const wCtx = watchCanvas.getContext('2d')!;

    // Pure OLED black background
    wCtx.fillStyle = '#000000';
    wCtx.fillRect(0, 0, 1000, 1200);

    // Subtle dark radial gradient
    const wGlow = wCtx.createRadialGradient(500, 450, 100, 500, 450, 550);
    wGlow.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
    wGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    wCtx.fillStyle = wGlow;
    wCtx.fillRect(0, 0, 1000, 1200);

    // Top status row: Date & Battery
    wCtx.fillStyle = '#f43f5e';
    wCtx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    wCtx.fillText('THU 15', 100, 130);

    wCtx.fillStyle = '#10b981';
    wCtx.textAlign = 'right';
    wCtx.fillText('⚡ 94%', 900, 130);
    wCtx.textAlign = 'left';

    // Big Crisp Digital Watch Time
    wCtx.fillStyle = '#ffffff';
    wCtx.font = 'bold 150px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    wCtx.fillText('09:41', 100, 290);

    // Smartwatch Activity Rings (Concentric circular progress arcs)
    const centerX = 500;
    const centerY = 560;

    // Outer Red Move Ring
    wCtx.strokeStyle = 'rgba(239, 68, 68, 0.2)';
    wCtx.lineWidth = 26;
    wCtx.lineCap = 'round';
    wCtx.beginPath();
    wCtx.arc(centerX, centerY, 190, 0, Math.PI * 2);
    wCtx.stroke();

    wCtx.strokeStyle = '#ef4444';
    wCtx.beginPath();
    wCtx.arc(centerX, centerY, 190, -Math.PI / 2, Math.PI * 0.95);
    wCtx.stroke();

    // Middle Green Exercise Ring
    wCtx.strokeStyle = 'rgba(34, 197, 94, 0.2)';
    wCtx.lineWidth = 26;
    wCtx.beginPath();
    wCtx.arc(centerX, centerY, 150, 0, Math.PI * 2);
    wCtx.stroke();

    wCtx.strokeStyle = '#22c55e';
    wCtx.beginPath();
    wCtx.arc(centerX, centerY, 150, -Math.PI / 2, Math.PI * 0.65);
    wCtx.stroke();

    // Inner Blue Stand Ring
    wCtx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
    wCtx.lineWidth = 26;
    wCtx.beginPath();
    wCtx.arc(centerX, centerY, 110, 0, Math.PI * 2);
    wCtx.stroke();

    wCtx.strokeStyle = '#3b82f6';
    wCtx.beginPath();
    wCtx.arc(centerX, centerY, 110, -Math.PI / 2, Math.PI * 0.4);
    wCtx.stroke();

    // Center icon
    wCtx.fillStyle = '#f8fafc';
    wCtx.font = 'bold 44px -apple-system, sans-serif';
    wCtx.textAlign = 'center';
    wCtx.fillText('🔥 540', centerX, centerY + 16);
    wCtx.textAlign = 'left';

    // Bottom Metric Cards / Widgets
    // Heart Rate Pill
    wCtx.fillStyle = '#18181b';
    this.roundRect(wCtx, 90, 830, 390, 140, 28);
    wCtx.fill();
    wCtx.strokeStyle = '#27272a';
    wCtx.lineWidth = 2;
    wCtx.stroke();

    wCtx.fillStyle = '#ef4444';
    wCtx.font = 'bold 36px -apple-system, sans-serif';
    wCtx.fillText('❤️ 72', 130, 895);
    wCtx.fillStyle = '#a1a1aa';
    wCtx.font = '26px -apple-system, sans-serif';
    wCtx.fillText('BPM · Resting', 130, 935);

    // Steps Pill
    wCtx.fillStyle = '#18181b';
    this.roundRect(wCtx, 520, 830, 390, 140, 28);
    wCtx.fill();
    wCtx.strokeStyle = '#27272a';
    wCtx.lineWidth = 2;
    wCtx.stroke();

    wCtx.fillStyle = '#38bdf8';
    wCtx.font = 'bold 36px -apple-system, sans-serif';
    wCtx.fillText('👟 8,432', 560, 895);
    wCtx.fillStyle = '#a1a1aa';
    wCtx.font = '26px -apple-system, sans-serif';
    wCtx.fillText('Steps Today', 560, 935);

    // Audio Bar / Activity pill
    wCtx.fillStyle = '#18181b';
    this.roundRect(wCtx, 90, 1000, 820, 110, 28);
    wCtx.fill();
    wCtx.stroke();

    wCtx.fillStyle = '#a855f7';
    wCtx.font = 'bold 34px -apple-system, sans-serif';
    wCtx.fillText('🎵 Pulse Track', 140, 1068);
    wCtx.fillStyle = '#94a3b8';
    wCtx.font = '26px -apple-system, sans-serif';
    wCtx.textAlign = 'right';
    wCtx.fillText('Now Playing ❯', 860, 1068);
    wCtx.textAlign = 'left';

    this.defaultWatchTexture = new THREE.CanvasTexture(watchCanvas);
    this.defaultWatchTexture.colorSpace = THREE.SRGBColorSpace;
    this.defaultWatchTexture.minFilter = THREE.LinearMipmapLinearFilter;
    this.defaultWatchTexture.generateMipmaps = true;
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /**
   * Returns default placeholder texture according to device type
   */
  public getDefaultTexture(deviceType: DeviceType): THREE.Texture {
    if (deviceType === 'laptop' || deviceType === 'desktop') {
      return this.defaultLaptopTexture!;
    }
    if (deviceType === 'smartwatch') {
      return this.defaultWatchTexture!;
    }
    return this.defaultPhoneTexture!;
  }

  /**
   * Loads an asset (image or video) and updates target mesh
   */
  public async loadAsset(
    asset: ScreenAsset | null | undefined,
    defaultType: DeviceType,
    onLoaded?: (texture: THREE.Texture) => void
  ): Promise<THREE.Texture> {
    this.cleanupCurrent();

    if (!asset || !asset.url) {
      const defTex = this.getDefaultTexture(defaultType);
      this.currentTexture = defTex;
      if (onLoaded) onLoaded(defTex);
      return defTex;
    }

    if (asset.type === 'video') {
      return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.src = asset.url;
        video.crossOrigin = 'anonymous';
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;

        video.onloadeddata = () => {
          const videoTexture = new THREE.VideoTexture(video);
          videoTexture.colorSpace = THREE.SRGBColorSpace;
          videoTexture.minFilter = THREE.LinearFilter;
          videoTexture.magFilter = THREE.LinearFilter;
          videoTexture.generateMipmaps = false;

          this.currentTexture = videoTexture;
          this.currentVideoElement = video;
          this.isVideo = true;

          video.play().catch(() => {});
          if (onLoaded) onLoaded(videoTexture);
          resolve(videoTexture);
        };

        video.onerror = (e) => {
          console.warn('Failed to load video texture, falling back to default:', e);
          const fallback = this.getDefaultTexture(defaultType);
          this.currentTexture = fallback;
          if (onLoaded) onLoaded(fallback);
          resolve(fallback);
        };
      });
    } else {
      // Image asset with transform fitting
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          this.cachedImageElement = img;
          this.isVideo = false;
          const tex = this.renderImageToCanvas(img, this.currentTransform, defaultType);
          if (onLoaded) onLoaded(tex);
          resolve(tex);
        };
        img.onerror = (err) => {
          console.warn('Failed to load image texture, falling back to default:', err);
          const fallback = this.getDefaultTexture(defaultType);
          this.currentTexture = fallback;
          if (onLoaded) onLoaded(fallback);
          resolve(fallback);
        };
        img.src = asset.url;
      });
    }
  }

  public static getDeviceScreenDimensions(deviceType: DeviceType): { width: number; height: number } {
    switch (deviceType) {
      case 'phone':
        return { width: 1080, height: 2400 };
      case 'laptop':
        return { width: 1920, height: 1200 };
      case 'tablet':
        return { width: 1600, height: 2133 };
      case 'desktop':
        return { width: 2560, height: 1440 };
      case 'smartwatch':
        return { width: 1000, height: 1200 };
    }
  }

  public renderImageToCanvas(
    img: HTMLImageElement,
    transform: ScreenTransformConfig,
    deviceType: DeviceType
  ): THREE.Texture {
    const { width: targetW, height: targetH } = ScreenTextureManager.getDeviceScreenDimensions(deviceType);

    if (!this.offscreenCanvas) {
      this.offscreenCanvas = document.createElement('canvas');
    }
    this.offscreenCanvas.width = targetW;
    this.offscreenCanvas.height = targetH;
    const ctx = this.offscreenCanvas.getContext('2d')!;

    // Background fill
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, targetW, targetH);

    const imgW = img.naturalWidth || img.width;
    const imgH = img.naturalHeight || img.height;

    if (transform.fitMode === 'stretch') {
      ctx.drawImage(img, 0, 0, targetW, targetH);
    } else {
      let baseScale = 1.0;
      if (transform.fitMode === 'cover') {
        baseScale = Math.max(targetW / imgW, targetH / imgH);
      } else {
        // contain
        baseScale = Math.min(targetW / imgW, targetH / imgH);
      }

      const totalScale = baseScale * (transform.scale || 1.0);
      const drawW = imgW * totalScale;
      const drawH = imgH * totalScale;

      const excessX = (drawW - targetW) / 2;
      const excessY = (drawH - targetH) / 2;

      // Pan offset: panX/panY (-1.0 to 1.0)
      const panOffsetX = (transform.panX || 0) * Math.max(0, excessX);
      const panOffsetY = (transform.panY || 0) * Math.max(0, excessY);

      const dx = (targetW - drawW) / 2 - panOffsetX;
      const dy = (targetH - drawH) / 2 - panOffsetY;

      ctx.drawImage(img, dx, dy, drawW, drawH);
    }

    if (!this.canvasTexture) {
      this.canvasTexture = new THREE.CanvasTexture(this.offscreenCanvas);
      this.canvasTexture.colorSpace = THREE.SRGBColorSpace;
      this.canvasTexture.minFilter = THREE.LinearMipmapLinearFilter;
      this.canvasTexture.magFilter = THREE.LinearFilter;
      this.canvasTexture.generateMipmaps = true;
    } else {
      this.canvasTexture.needsUpdate = true;
    }

    this.currentTexture = this.canvasTexture;
    return this.canvasTexture;
  }

  public updateScreenTransform(
    transform: ScreenTransformConfig,
    deviceType: DeviceType,
    targetScreenMesh?: THREE.Mesh | null
  ): THREE.Texture | null {
    this.currentTransform = transform;
    if (this.cachedImageElement) {
      const tex = this.renderImageToCanvas(this.cachedImageElement, transform, deviceType);
      if (targetScreenMesh) {
        (targetScreenMesh.material as THREE.MeshStandardMaterial).map = tex;
        (targetScreenMesh.material as THREE.MeshStandardMaterial).needsUpdate = true;
      }
      return tex;
    }
    return null;
  }

  /**
   * Deterministic video seek for frame-by-frame export
   */
  public async seekVideoTime(seconds: number): Promise<void> {
    if (!this.isVideo || !this.currentVideoElement) return;

    const vid = this.currentVideoElement;
    if (vid.duration > 0) {
      const targetTime = seconds % vid.duration;
      await new Promise<void>((resolve) => {
        const onSeeked = () => {
          vid.removeEventListener('seeked', onSeeked);
          if (this.currentTexture) {
            this.currentTexture.needsUpdate = true;
          }
          resolve();
        };
        vid.addEventListener('seeked', onSeeked);
        vid.currentTime = targetTime;
      });
    }
  }

  public playVideo(): void {
    if (this.isVideo && this.currentVideoElement) {
      this.currentVideoElement.play().catch(() => {});
    }
  }

  public pauseVideo(): void {
    if (this.isVideo && this.currentVideoElement) {
      this.currentVideoElement.pause();
    }
  }

  public isVideoPlaying(): boolean {
    return !!(this.isVideo && this.currentVideoElement && !this.currentVideoElement.paused);
  }

  public getCurrentTexture(): THREE.Texture | null {
    return this.currentTexture;
  }

  private cleanupCurrent() {
    if (this.currentVideoElement) {
      this.currentVideoElement.pause();
      this.currentVideoElement.src = '';
      this.currentVideoElement.load();
      this.currentVideoElement = null;
    }
    this.cachedImageElement = null;
    if (this.canvasTexture) {
      this.canvasTexture.dispose();
      this.canvasTexture = null;
    }
    if (this.currentTexture && this.currentTexture !== this.defaultPhoneTexture && this.currentTexture !== this.defaultLaptopTexture && this.currentTexture !== this.defaultWatchTexture) {
      this.currentTexture.dispose();
      this.currentTexture = null;
    }
    this.isVideo = false;
  }

  public dispose(): void {
    this.cleanupCurrent();
    if (this.defaultPhoneTexture) this.defaultPhoneTexture.dispose();
    if (this.defaultLaptopTexture) this.defaultLaptopTexture.dispose();
    if (this.defaultWatchTexture) this.defaultWatchTexture.dispose();
  }
}
