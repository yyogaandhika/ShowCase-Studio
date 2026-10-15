import * as THREE from 'three';
import {
  AspectRatio,
  BackgroundConfig,
  CameraAnglePreset,
  ChassisFinish,
  DeviceType,
  LightingPreset,
  ProjectData,
  RenderSettings,
  SceneType,
  ScreenAsset,
  ScreenTransformConfig,
} from '../types';
import { DeviceBuilder, DeviceInstance } from './DeviceBuilder';
import { LightingManager } from './LightingManager';
import { SceneAnimator } from './SceneAnimator';
import { ScreenTextureManager } from './ScreenTextureManager';

export interface StudioEngineOptions {
  container: HTMLElement;
  onTimeUpdate?: (t: number) => void;
}

export class StudioEngine {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;

  private lightingManager: LightingManager;
  private primaryDevice: DeviceInstance | null = null;
  private secondaryDevice: DeviceInstance | null = null;

  private primaryTextureManager: ScreenTextureManager;
  private secondaryTextureManager: ScreenTextureManager;

  // Scene state
  private sceneType: SceneType = 'hero';
  private primaryDeviceType: DeviceType = 'phone';
  private chassisColor: string = '#1f2124';
  private chassisFinish: ChassisFinish = 'anodized';
  private zoomFocus: { x: number; y: number } = { x: 0.5, y: 0.5 };
  private hasCustomPrimaryAsset = false;

  // Render & Visual FX settings
  private renderSettings: RenderSettings = {
    screenGlassReflection: 0.35,
    screenBrightness: 1.05,
    shadowIntensity: 0.6,
    animationSpeed: 1.0,
    vignette: true,
    groundContactShadow: true,
  };
  private currentBgConfig: BackgroundConfig = {
    type: 'gradient',
    color1: '#0f172a',
    color2: '#020617',
    angle: 135,
  };

  // Background texture canvas
  private bgCanvas: HTMLCanvasElement;
  private bgTexture: THREE.CanvasTexture | null = null;

  // Animation timeline state
  private currentTime = 0; // 0 to 1
  private durationSec = 15;
  private isPlaying = true;
  private isFreeCamera = false;
  private animationFrameId: number | null = null;
  private lastTimestamp = 0;

  // Orbit controls state (for free camera mode)
  private orbitSpherical = new THREE.Spherical(4.0, Math.PI / 2.2, 0);
  private orbitTarget = new THREE.Vector3(0, 0, 0);
  private isPointerDown = false;
  private lastPointerX = 0;
  private lastPointerY = 0;
  private pointerButton = 0;

  private onTimeUpdate?: (t: number) => void;
  private resizeObserver: ResizeObserver | null = null;

  constructor(options: StudioEngineOptions) {
    this.container = options.container;
    this.onTimeUpdate = options.onTimeUpdate;

    // 1. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.container.appendChild(this.renderer.domElement);

    // 2. Scene
    this.scene = new THREE.Scene();

    // 3. Camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      50
    );
    this.camera.position.set(0, 0, 4);

    // 4. Background canvas
    this.bgCanvas = document.createElement('canvas');
    this.bgCanvas.width = 1024;
    this.bgCanvas.height = 1024;

    // 5. Lighting
    this.lightingManager = new LightingManager();
    this.scene.add(this.lightingManager.getGroup());

    // 6. Texture Managers
    this.primaryTextureManager = new ScreenTextureManager();
    this.secondaryTextureManager = new ScreenTextureManager();

    // 7. Initial Devices
    this.rebuildDevices();

    // 8. Event listeners
    this.setupPointerControls();
    this.setupResizeObserver();

    // 9. Start loop
    this.startLoop();
  }

  /**
   * Initializes or rebuilds 3D device meshes
   */
  public rebuildDevices(): void {
    if (this.primaryDevice) {
      this.scene.remove(this.primaryDevice.group);
      this.primaryDevice.dispose();
      this.primaryDevice = null;
    }
    if (this.secondaryDevice) {
      this.scene.remove(this.secondaryDevice.group);
      this.secondaryDevice.dispose();
      this.secondaryDevice = null;
    }

    // Build primary device
    if (this.sceneType === 'duo') {
      // Duo always pairs Laptop + Phone
      this.primaryDevice = DeviceBuilder.buildLaptop(this.chassisColor);
      this.secondaryDevice = DeviceBuilder.buildPhone(this.chassisColor);
      this.scene.add(this.primaryDevice.group);
      this.scene.add(this.secondaryDevice.group);

      // Re-apply textures
      const lapTex = this.primaryTextureManager.getCurrentTexture() ||
        this.primaryTextureManager.getDefaultTexture('laptop');
      (this.primaryDevice.screenMesh.material as THREE.MeshStandardMaterial).map = lapTex;
      (this.primaryDevice.screenMesh.material as THREE.MeshStandardMaterial).needsUpdate = true;

      const phTex = this.secondaryTextureManager.getCurrentTexture() ||
        this.secondaryTextureManager.getDefaultTexture('phone');
      (this.secondaryDevice.screenMesh.material as THREE.MeshStandardMaterial).map = phTex;
      (this.secondaryDevice.screenMesh.material as THREE.MeshStandardMaterial).needsUpdate = true;
    } else {
      if (this.primaryDeviceType === 'phone') {
        this.primaryDevice = DeviceBuilder.buildPhone(this.chassisColor);
      } else if (this.primaryDeviceType === 'laptop') {
        this.primaryDevice = DeviceBuilder.buildLaptop(this.chassisColor);
      } else if (this.primaryDeviceType === 'tablet') {
        this.primaryDevice = DeviceBuilder.buildTablet(this.chassisColor);
      } else if (this.primaryDeviceType === 'desktop') {
        this.primaryDevice = DeviceBuilder.buildDesktop(this.chassisColor);
      } else {
        this.primaryDevice = DeviceBuilder.buildSmartwatch(this.chassisColor);
      }
      this.scene.add(this.primaryDevice.group);

      const tex = this.hasCustomPrimaryAsset
        ? this.primaryTextureManager.getCurrentTexture() ||
          this.primaryTextureManager.getDefaultTexture(this.primaryDeviceType)
        : this.primaryTextureManager.getDefaultTexture(this.primaryDeviceType);
      (this.primaryDevice.screenMesh.material as THREE.MeshStandardMaterial).map = tex;
      (this.primaryDevice.screenMesh.material as THREE.MeshStandardMaterial).needsUpdate = true;
    }

    if (this.primaryDevice) {
      this.primaryDevice.updateChassisFinish(this.chassisFinish);
    }
    if (this.secondaryDevice) {
      this.secondaryDevice.updateChassisFinish(this.chassisFinish);
    }

    this.applyScreenMaterialSettings();
  }

  /**
   * Updates background configuration (solid or gradient) with optional vignette
   */
  public updateBackground(config: BackgroundConfig): void {
    this.currentBgConfig = config;
    const ctx = this.bgCanvas.getContext('2d')!;
    const w = this.bgCanvas.width;
    const h = this.bgCanvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.sqrt(w * w + h * h) / 2;

    if (config.type === 'solid') {
      ctx.fillStyle = config.color1;
      ctx.fillRect(0, 0, w, h);
    } else {
      const rad = THREE.MathUtils.degToRad(config.angle || 135);
      const x0 = cx - Math.cos(rad) * r;
      const y0 = cy - Math.sin(rad) * r;
      const x1 = cx + Math.cos(rad) * r;
      const y1 = cy + Math.sin(rad) * r;

      const grad = ctx.createLinearGradient(x0, y0, x1, y1);
      grad.addColorStop(0, config.color1);
      grad.addColorStop(1, config.color2);

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    // Apply soft cinematic vignette if enabled
    if (this.renderSettings.vignette) {
      const radVig = ctx.createRadialGradient(cx, cy, r * 0.25, cx, cy, r);
      radVig.addColorStop(0, 'rgba(0,0,0,0)');
      radVig.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = radVig;
      ctx.fillRect(0, 0, w, h);
    }

    if (!this.bgTexture) {
      this.bgTexture = new THREE.CanvasTexture(this.bgCanvas);
      this.bgTexture.colorSpace = THREE.SRGBColorSpace;
    } else {
      this.bgTexture.needsUpdate = true;
    }
    this.scene.background = this.bgTexture;
  }

  /**
   * Updates Render & Visual FX Settings (Reflection, Brightness, Vignette, Speed, Contact Shadow)
   */
  public updateRenderSettings(settings: Partial<RenderSettings>): void {
    this.renderSettings = { ...this.renderSettings, ...settings };
    if (settings.shadowIntensity !== undefined) {
      this.lightingManager.setShadowIntensity(this.renderSettings.shadowIntensity);
    }
    if (settings.groundContactShadow !== undefined) {
      this.lightingManager.setGroundContactShadow(this.renderSettings.groundContactShadow);
    }
    this.applyScreenMaterialSettings();
    this.updateBackground(this.currentBgConfig);
  }

  public applyScreenMaterialSettings(): void {
    const roughness = Math.max(0.04, 0.85 - this.renderSettings.screenGlassReflection * 0.8);
    const metalness = Math.min(0.25, this.renderSettings.screenGlassReflection * 0.2);
    const brightness = this.renderSettings.screenBrightness;

    const applyToScreen = (mesh: THREE.Mesh | null | undefined) => {
      if (!mesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.roughness = roughness;
        mat.metalness = metalness;
        mat.color.setScalar(brightness);
        mat.needsUpdate = true;
      }
    };

    if (this.primaryDevice?.screenMesh) {
      applyToScreen(this.primaryDevice.screenMesh);
    }
    if (this.secondaryDevice?.screenMesh) {
      applyToScreen(this.secondaryDevice.screenMesh);
    }
  }

  /**
   * Updates lighting preset
   */
  public updateLighting(preset: LightingPreset): void {
    this.lightingManager.applyPreset(preset);
  }

  /**
   * Updates chassis color across devices
   */
  public updateChassisColor(color: string): void {
    this.chassisColor = color;
    if (this.primaryDevice) {
      this.primaryDevice.updateChassisColor(color);
    }
    if (this.secondaryDevice) {
      this.secondaryDevice.updateChassisColor(color);
    }
  }

  /**
   * Updates physical PBR chassis finish (matte, anodized, ceramic, chrome)
   */
  public updateChassisFinish(finish: ChassisFinish): void {
    this.chassisFinish = finish;
    if (this.primaryDevice) {
      this.primaryDevice.updateChassisFinish(finish);
    }
    if (this.secondaryDevice) {
      this.secondaryDevice.updateChassisFinish(finish);
    }
  }

  /**
   * Updates screen content fitting & transform (cover, contain, stretch, zoom, pan)
   */
  public updateScreenTransform(transform: ScreenTransformConfig, isSecondary = false): void {
    if (isSecondary) {
      if (this.secondaryDevice) {
        this.secondaryTextureManager.updateScreenTransform(
          transform,
          'phone',
          this.secondaryDevice.screenMesh
        );
      }
    } else {
      if (this.primaryDevice) {
        const devType = this.sceneType === 'duo' ? 'laptop' : this.primaryDeviceType;
        this.primaryTextureManager.updateScreenTransform(
          transform,
          devType,
          this.primaryDevice.screenMesh
        );
      }
    }
  }

  /**
   * Updates scene type (hero, duo, zoom, portfolio)
   */
  public updateSceneType(scene: SceneType): void {
    const prevScene = this.sceneType;
    this.sceneType = scene;
    if (prevScene === 'duo' || scene === 'duo') {
      this.rebuildDevices();
    }
  }

  /**
   * Updates device type (phone, laptop, tablet)
   */
  public updateDeviceType(type: DeviceType): void {
    this.primaryDeviceType = type;
    this.rebuildDevices();
  }

  /**
   * Sets screen asset for primary or secondary device
   */
  public async setScreenAsset(
    asset: ScreenAsset | null | undefined,
    isSecondary = false
  ): Promise<void> {
    if (!isSecondary) {
      this.hasCustomPrimaryAsset = !!(asset && asset.url);
    }
    const targetManager = isSecondary ? this.secondaryTextureManager : this.primaryTextureManager;
    const targetType = isSecondary
      ? 'phone'
      : this.sceneType === 'duo'
      ? 'laptop'
      : this.primaryDeviceType;

    const texture = await targetManager.loadAsset(asset, targetType);

    const device = isSecondary ? this.secondaryDevice : this.primaryDevice;
    if (device && device.screenMesh) {
      (device.screenMesh.material as THREE.MeshStandardMaterial).map = texture;
      (device.screenMesh.material as THREE.MeshStandardMaterial).needsUpdate = true;
    }
  }

  /**
   * Sets duration
   */
  public setDuration(sec: number): void {
    this.durationSec = sec;
  }

  /**
   * Sets zoom focus coordinate (for zoom scene)
   */
  public setZoomFocus(x: number, y: number): void {
    this.zoomFocus = { x, y };
  }

  /**
   * Playback Controls
   */
  public play(): void {
    this.isPlaying = true;
    this.isFreeCamera = false;
    this.primaryTextureManager.playVideo();
    this.secondaryTextureManager.playVideo();
  }

  public pause(): void {
    this.isPlaying = false;
    this.primaryTextureManager.pauseVideo();
    this.secondaryTextureManager.pauseVideo();
  }

  public setTime(t: number): void {
    this.currentTime = Math.max(0, Math.min(1, t));
    const seconds = this.currentTime * this.durationSec;
    this.primaryTextureManager.seekVideoTime(seconds);
    this.secondaryTextureManager.seekVideoTime(seconds);
    this.applyFrameState(this.currentTime);
    this.render();
  }

  public toggleFreeCamera(): boolean {
    this.isFreeCamera = !this.isFreeCamera;
    if (this.isFreeCamera) {
      this.isPlaying = false;
      // Initialize spherical from current camera position
      this.orbitSpherical.setFromVector3(this.camera.position);
    }
    return this.isFreeCamera;
  }

  public getIsFreeCamera(): boolean {
    return this.isFreeCamera;
  }

  /**
   * Applies a static camera perspective preset (Fase 11)
   */
  public applyStaticAngle(anglePreset: CameraAnglePreset): void {
    this.isPlaying = false;
    this.isFreeCamera = true;

    const state = SceneAnimator.evaluateStaticAngle(
      anglePreset,
      this.sceneType === 'duo' ? 'laptop' : this.primaryDeviceType
    );

    if (this.primaryDevice) {
      this.primaryDevice.group.position.copy(state.primaryPosition);
      this.primaryDevice.group.rotation.copy(state.primaryRotation);
    }
    if (this.secondaryDevice) {
      this.secondaryDevice.group.visible = false;
    }

    this.camera.position.copy(state.cameraPosition);
    this.camera.lookAt(state.cameraLookAt);

    this.orbitTarget.copy(state.cameraLookAt);
    this.orbitSpherical.setFromVector3(this.camera.position.clone().sub(this.orbitTarget));

    this.render();
  }

  /**
   * Evaluates and applies the scene animation at time t
   */
  public applyFrameState(t: number): void {
    const state = SceneAnimator.evaluate(
      this.sceneType,
      t,
      this.sceneType === 'duo' ? 'laptop' : this.primaryDeviceType,
      this.zoomFocus
    );

    if (this.primaryDevice) {
      this.primaryDevice.group.position.copy(state.primaryPosition);
      this.primaryDevice.group.rotation.copy(state.primaryRotation);
    }

    if (this.secondaryDevice) {
      if (state.secondaryVisible && state.secondaryPosition && state.secondaryRotation) {
        this.secondaryDevice.group.visible = true;
        this.secondaryDevice.group.position.copy(state.secondaryPosition);
        this.secondaryDevice.group.rotation.copy(state.secondaryRotation);
      } else {
        this.secondaryDevice.group.visible = false;
      }
    }

    if (!this.isFreeCamera) {
      this.camera.position.copy(state.cameraPosition);
      this.camera.lookAt(state.cameraLookAt);
    }
  }

  /**
   * Main animation loop
   */
  private startLoop() {
    const loop = (timestamp: number) => {
      if (!this.lastTimestamp) this.lastTimestamp = timestamp;
      const deltaSec = (timestamp - this.lastTimestamp) / 1000;
      this.lastTimestamp = timestamp;

      if (this.isPlaying) {
        const speed = this.renderSettings.animationSpeed || 1.0;
        this.currentTime += (deltaSec * speed) / this.durationSec;
        if (this.currentTime >= 1) {
          this.currentTime = this.currentTime % 1;
        }

        this.applyFrameState(this.currentTime);
        if (this.onTimeUpdate) {
          this.onTimeUpdate(this.currentTime);
        }
      }

      this.render();
      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Pointer Controls for Free Inspection Mode
   */
  private setupPointerControls() {
    const el = this.renderer.domElement;

    el.addEventListener('pointerdown', (e) => {
      this.isPointerDown = true;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
      this.pointerButton = e.button;
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isPointerDown) return;
      const dx = e.clientX - this.lastPointerX;
      const dy = e.clientY - this.lastPointerY;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;

      if (!this.isFreeCamera) {
        this.isFreeCamera = true;
        this.isPlaying = false;
        this.orbitSpherical.setFromVector3(this.camera.position.clone().sub(this.orbitTarget));
      }

      if (this.pointerButton === 0) {
        // Orbit rotate
        this.orbitSpherical.theta -= dx * 0.006;
        this.orbitSpherical.phi = Math.max(
          0.1,
          Math.min(Math.PI - 0.1, this.orbitSpherical.phi - dy * 0.006)
        );
      } else if (this.pointerButton === 2) {
        // Pan
        const panSpeed = 0.003 * this.orbitSpherical.radius;
        this.orbitTarget.x -= dx * panSpeed;
        this.orbitTarget.y += dy * panSpeed;
      }

      this.updateFreeCamera();
    });

    window.addEventListener('pointerup', () => {
      this.isPointerDown = false;
    });

    el.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        if (!this.isFreeCamera) {
          this.isFreeCamera = true;
          this.isPlaying = false;
          this.orbitSpherical.setFromVector3(this.camera.position.clone().sub(this.orbitTarget));
        }
        const zoomDelta = e.deltaY * 0.003;
        this.orbitSpherical.radius = Math.max(1.0, Math.min(10.0, this.orbitSpherical.radius + zoomDelta));
        this.updateFreeCamera();
      },
      { passive: false }
    );

    el.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private updateFreeCamera() {
    const offset = new THREE.Vector3().setFromSpherical(this.orbitSpherical);
    this.camera.position.copy(this.orbitTarget).add(offset);
    this.camera.lookAt(this.orbitTarget);
    this.render();
  }

  /**
   * Deterministic frame rendering for video export
   */
  public async renderFrameForExport(
    t: number,
    width: number,
    height: number
  ): Promise<HTMLCanvasElement> {
    const originalSize = new THREE.Vector2();
    this.renderer.getSize(originalSize);
    const originalAspect = this.camera.aspect;

    // Adjust renderer and camera to export resolution
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // Seek videos to exact time
    const frameSeconds = t * this.durationSec;
    await Promise.all([
      this.primaryTextureManager.seekVideoTime(frameSeconds),
      this.secondaryTextureManager.seekVideoTime(frameSeconds),
    ]);

    // Apply exact math state
    this.applyFrameState(t);
    this.render();

    // Copy to offscreen canvas
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = width;
    exportCanvas.height = height;
    const ctx = exportCanvas.getContext('2d')!;
    ctx.drawImage(this.renderer.domElement, 0, 0);

    // Restore viewport
    this.renderer.setSize(originalSize.x, originalSize.y);
    this.camera.aspect = originalAspect;
    this.camera.updateProjectionMatrix();

    return exportCanvas;
  }

  /**
   * Renders a static angle preset to a canvas of specified resolution (Fase 11)
   */
  public async renderStaticAngleForExport(
    anglePreset: CameraAnglePreset,
    width: number,
    height: number
  ): Promise<HTMLCanvasElement> {
    const originalSize = new THREE.Vector2();
    this.renderer.getSize(originalSize);
    const originalAspect = this.camera.aspect;
    const originalCamPos = this.camera.position.clone();
    const originalCamRot = this.camera.rotation.clone();

    const origPrimaryPos = this.primaryDevice ? this.primaryDevice.group.position.clone() : new THREE.Vector3();
    const origPrimaryRot = this.primaryDevice ? this.primaryDevice.group.rotation.clone() : new THREE.Euler();
    const origSecondaryVis = this.secondaryDevice ? this.secondaryDevice.group.visible : false;

    // Adjust renderer and camera to export resolution
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // Evaluate static angle
    const state = SceneAnimator.evaluateStaticAngle(
      anglePreset,
      this.sceneType === 'duo' ? 'laptop' : this.primaryDeviceType
    );

    if (this.primaryDevice) {
      this.primaryDevice.group.position.copy(state.primaryPosition);
      this.primaryDevice.group.rotation.copy(state.primaryRotation);
    }
    if (this.secondaryDevice) {
      this.secondaryDevice.group.visible = false;
    }

    this.camera.position.copy(state.cameraPosition);
    this.camera.lookAt(state.cameraLookAt);
    this.render();

    // Copy to offscreen canvas
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = width;
    exportCanvas.height = height;
    const ctx = exportCanvas.getContext('2d')!;
    ctx.drawImage(this.renderer.domElement, 0, 0);

    // Restore state
    if (this.primaryDevice) {
      this.primaryDevice.group.position.copy(origPrimaryPos);
      this.primaryDevice.group.rotation.copy(origPrimaryRot);
    }
    if (this.secondaryDevice) {
      this.secondaryDevice.group.visible = origSecondaryVis;
    }
    this.camera.position.copy(originalCamPos);
    this.camera.rotation.copy(originalCamRot);
    this.renderer.setSize(originalSize.x, originalSize.y);
    this.camera.aspect = originalAspect;
    this.camera.updateProjectionMatrix();
    this.render();

    return exportCanvas;
  }

  /**
   * Captures high-res PNG snapshot of current frame
   */
  public async captureSnapshot(width = 1920, height = 1080): Promise<Blob> {
    const canvas = await this.renderFrameForExport(this.currentTime, width, height);
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to generate PNG blob'));
        },
        'image/png',
        1.0
      );
    });
  }

  /**
   * Projects relative screen coordinates (0..1) to 2D canvas pixel coordinates (Fase 12)
   */
  public projectScreenPoint(
    screenX: number,
    screenY: number,
    canvasWidth?: number,
    canvasHeight?: number
  ): { x: number; y: number; visible: boolean } {
    if (!this.primaryDevice?.screenMesh) {
      return { x: 0, y: 0, visible: false };
    }

    const mesh = this.primaryDevice.screenMesh;
    if (!mesh.geometry.boundingBox) {
      mesh.geometry.computeBoundingBox();
    }
    const bb = mesh.geometry.boundingBox!;
    const screenW = bb.max.x - bb.min.x;
    const screenH = bb.max.y - bb.min.y;

    // Relative to mesh center
    const localPoint = new THREE.Vector3(
      (screenX - 0.5) * screenW,
      ((1 - screenY) - 0.5) * screenH,
      0.02
    );

    mesh.updateMatrixWorld(true);
    const worldPoint = localPoint.applyMatrix4(mesh.matrixWorld);

    // Project with camera
    this.camera.updateMatrixWorld(true);
    const proj = worldPoint.clone().project(this.camera);

    const w = canvasWidth || this.renderer.domElement.clientWidth;
    const h = canvasHeight || this.renderer.domElement.clientHeight;

    const px = ((proj.x + 1) / 2) * w;
    const py = ((-proj.y + 1) / 2) * h;

    // Check if facing camera
    const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(
      mesh.getWorldQuaternion(new THREE.Quaternion())
    );
    const camDir = new THREE.Vector3().subVectors(this.camera.position, worldPoint).normalize();
    const dot = normal.dot(camDir);

    const visible = proj.z < 1 && dot > -0.15;

    return { x: px, y: py, visible };
  }

  private setupResizeObserver() {
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          this.camera.aspect = width / height;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(width, height);
          this.render();
        }
      }
    });
    this.resizeObserver.observe(this.container);
  }

  public dispose(): void {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.resizeObserver) this.resizeObserver.disconnect();

    this.primaryTextureManager.dispose();
    this.secondaryTextureManager.dispose();
    this.lightingManager.dispose();

    if (this.primaryDevice) this.primaryDevice.dispose();
    if (this.secondaryDevice) this.secondaryDevice.dispose();

    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
