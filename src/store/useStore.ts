import { create } from 'zustand';
import {
  AgencyBrandKit,
  AspectRatio,
  AudioConfig,
  AudioPresetId,
  BackgroundConfig,
  BrandOverlayConfig,
  CalloutConfig,
  CaseStudyTemplate,
  ChassisFinish,
  DeviceType,
  DurationOption,
  ExportProgress,
  FeatureCallout,
  LicenseTier,
  LightingPreset,
  ProjectData,
  ProjectStatus,
  RenderSettings,
  ResolutionOption,
  RevisionNote,
  SceneType,
  ScreenAsset,
  ScreenFitMode,
  ScreenTransformConfig,
  SupportedLanguage,
  UmkmOverlayConfig,
  UmkmThemePreset,
} from '../types';
import { getBrandKit, getProject, saveBrandKit, saveProject } from '../storage/db';
import { getEngineInstance } from '../engine/engineInstance';
import { AudioSynthesizer } from '../engine/AudioSynthesizer';

export const DEFAULT_SCREEN_TRANSFORM: ScreenTransformConfig = {
  fitMode: 'cover',
  scale: 1.0,
  panX: 0.0,
  panY: 0.0,
};

export const DEFAULT_RENDER_SETTINGS: RenderSettings = {
  screenGlassReflection: 0.35,
  screenBrightness: 1.05,
  shadowIntensity: 0.6,
  animationSpeed: 1.0,
  vignette: true,
  groundContactShadow: true,
};

export const DEFAULT_AUDIO: AudioConfig = {
  enabled: true,
  preset: 'cyber_pulse',
  volume: 0.7,
  isMuted: false,
};

const DEFAULT_BRAND_OVERLAY: BrandOverlayConfig = {
  enabled: false,
  title: 'Pulse Financial SaaS',
  subtitle: 'Interactive 3D Agency Showcase',
  logoUrl: null,
  position: 'top-left',
  textColor: '#ffffff',
  showBadge: true,
};

const DEFAULT_UMKM_OVERLAY: UmkmOverlayConfig = {
  enabled: false,
  storeName: 'Kopi Kenangan Senja',
  badgeType: 'flash_sale',
  customBadgeText: 'Promo Kilat 50%',
  originalPrice: 'Rp 48.000',
  salePrice: 'Rp 24.000',
  discountPercent: '50% OFF',
  ctaChannel: 'whatsapp',
  ctaContact: '0812-9876-5432',
  position: 'bottom-card',
  themePreset: 'flash_sale',
};

export const DEFAULT_CALLOUTS: CalloutConfig = {
  enabled: false,
  callouts: [
    {
      id: 'pin-1',
      screenX: 0.35,
      screenY: 0.28,
      title: 'Biometric Auth',
      description: 'FaceID & 256-bit encryption',
      icon: '🛡️',
      badgeColor: '#38bdf8',
      pulse: true,
    },
    {
      id: 'pin-2',
      screenX: 0.65,
      screenY: 0.68,
      title: 'Real-time Sync',
      description: 'Sub-millisecond WebSocket updates',
      icon: '⚡',
      badgeColor: '#10b981',
      pulse: true,
    },
  ],
};

const DEFAULT_AGENCY_BRAND_KIT: AgencyBrandKit = {
  agencyName: 'Nexa Digital Studio',
  agencyLogoUrl: null,
  customWatermarkText: 'Crafted by Nexa Studio',
  customWatermarkUrl: 'nexastudio.io',
  primaryColor: '#3b82f6',
  secondaryColor: '#6366f1',
};

const DEFAULT_PROJECT: ProjectData = {
  id: 'default-project',
  name: 'Fintech Superapp Case Study',
  clientName: 'Nexus Global Finance',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  status: 'draft',
  revisionHistory: [],
  deviceType: 'phone',
  sceneType: 'hero',
  lightingPreset: 'studio',
  chassisColor: '#1f2124',
  chassisFinish: 'anodized',
  background: {
    type: 'gradient',
    color1: '#0f172a',
    color2: '#020617',
    angle: 135,
  },
  duration: 15,
  aspectRatio: '16:9',
  resolution: '1080p',
  brandOverlay: DEFAULT_BRAND_OVERLAY,
  umkmOverlay: DEFAULT_UMKM_OVERLAY,
  callouts: DEFAULT_CALLOUTS,
  audio: DEFAULT_AUDIO,
  renderSettings: DEFAULT_RENDER_SETTINGS,
  primaryAsset: null,
  secondaryAsset: null,
  screenTransform: DEFAULT_SCREEN_TRANSFORM,
  secondaryScreenTransform: DEFAULT_SCREEN_TRANSFORM,
  zoomFocus: { x: 0.5, y: 0.35 },
};

interface StudioState {
  project: ProjectData;
  brandKit: AgencyBrandKit;
  activeLicenseTier: LicenseTier;
  language: SupportedLanguage;
  isPlaying: boolean;
  currentTime: number; // 0 to 1
  isFreeCamera: boolean;
  isExportModalOpen: boolean;
  isProjectsModalOpen: boolean;
  isBrandKitModalOpen: boolean;
  isClientReviewModalOpen: boolean;
  isPricingModalOpen: boolean;
  isPaymentModalOpen: boolean;
  isTemplateModalOpen: boolean;
  isDiagnosticModalOpen: boolean;
  isShortcutsModalOpen: boolean;
  isPitchMode: boolean;
  isShareModalOpen: boolean;
  isOnboardingOpen: boolean;
  lastSavedAt: number | null;
  isSaving: boolean;
  checkoutPlan: { tier: LicenseTier; billingCycle: 'monthly' | 'yearly'; amount: number } | null;
  exportProgress: ExportProgress;

  // Actions
  setLanguage: (lang: SupportedLanguage) => void;
  setProject: (project: ProjectData) => void;
  updateProjectName: (name: string) => void;
  setClientName: (clientName: string) => void;
  setProjectStatus: (status: ProjectStatus) => void;
  addRevisionNote: (author: string, type: 'approval' | 'revision', comment: string) => void;

  setDeviceType: (deviceType: DeviceType) => void;
  setSceneType: (sceneType: SceneType) => void;
  setLightingPreset: (preset: LightingPreset) => void;
  setChassisColor: (color: string) => void;
  setChassisFinish: (finish: ChassisFinish) => void;
  setScreenTransform: (transform: Partial<ScreenTransformConfig>, isSecondary?: boolean) => void;
  setBackground: (bg: BackgroundConfig) => void;
  setDuration: (duration: DurationOption) => void;
  setAspectRatio: (aspect: AspectRatio) => void;
  setResolution: (res: ResolutionOption) => void;
  setBrandOverlay: (overlay: Partial<BrandOverlayConfig>) => void;
  setUmkmOverlay: (overlay: Partial<UmkmOverlayConfig>) => void;
  setAudioConfig: (config: Partial<AudioConfig>) => void;
  toggleAudioMute: () => void;
  setRenderSettings: (settings: Partial<RenderSettings>) => void;
  applyUmkmPreset: (preset: UmkmThemePreset) => void;
  setPrimaryAsset: (asset: ScreenAsset | null) => void;
  setSecondaryAsset: (asset: ScreenAsset | null) => void;
  setZoomFocus: (focus: { x: number; y: number }) => void;
  toggleCallouts: (enabled?: boolean) => void;
  addCallout: (pin?: Partial<FeatureCallout>) => void;
  updateCallout: (id: string, updates: Partial<FeatureCallout>) => void;
  removeCallout: (id: string) => void;

  // Modals & Navigation
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setIsFreeCamera: (free: boolean) => void;
  setExportModalOpen: (open: boolean) => void;
  setProjectsModalOpen: (open: boolean) => void;
  setBrandKitModalOpen: (open: boolean) => void;
  setClientReviewModalOpen: (open: boolean) => void;
  setPricingModalOpen: (open: boolean) => void;
  setPaymentModalOpen: (open: boolean) => void;
  setTemplateModalOpen: (open: boolean) => void;
  setDiagnosticModalOpen: (open: boolean) => void;
  setShortcutsModalOpen: (open: boolean) => void;
  setIsPitchMode: (pitch: boolean) => void;
  setShareModalOpen: (open: boolean) => void;
  setOnboardingOpen: (open: boolean) => void;
  startCheckout: (tier: LicenseTier, billingCycle: 'monthly' | 'yearly', amount: number) => void;
  applyTemplate: (template: CaseStudyTemplate) => Promise<void>;
  setExportProgress: (progress: Partial<ExportProgress>) => void;

  // Brand Kit & Licensing
  updateBrandKit: (kit: Partial<AgencyBrandKit>) => Promise<void>;
  loadBrandKit: () => Promise<void>;
  applyBrandKitToProject: () => void;
  setActiveLicenseTier: (tier: LicenseTier) => void;

  createNewProject: (name?: string, client?: string) => Promise<ProjectData>;
  loadSavedProject: (id: string) => Promise<void>;
  saveCurrentProject: () => Promise<void>;
}

export const useStore = create<StudioState>((set, get) => ({
  project: DEFAULT_PROJECT,
  brandKit: DEFAULT_AGENCY_BRAND_KIT,
  activeLicenseTier: 'agency', // Unlocked agency tier for demonstration
  language: ((typeof localStorage !== 'undefined' && localStorage.getItem('showcase_lang')) as SupportedLanguage) || 'id',
  isPlaying: true,
  currentTime: 0,
  isFreeCamera: false,
  isExportModalOpen: false,
  isProjectsModalOpen: false,
  isBrandKitModalOpen: false,
  isClientReviewModalOpen: false,
  isPricingModalOpen: false,
  isPaymentModalOpen: false,
  isTemplateModalOpen: false,
  isDiagnosticModalOpen: false,
  isShortcutsModalOpen: false,
  isPitchMode: false,
  isShareModalOpen: false,
  isOnboardingOpen: false,
  lastSavedAt: Date.now(),
  isSaving: false,
  checkoutPlan: null,
  exportProgress: {
    status: 'idle',
    currentFrame: 0,
    totalFrames: 0,
    progressPercent: 0,
    estimatedRemainingSec: 0,
  },

  setLanguage: (lang) => {
    try {
      localStorage.setItem('showcase_lang', lang);
    } catch {}
    set({ language: lang });
  },

  setProject: (project) => {
    const normalized: ProjectData = {
      ...DEFAULT_PROJECT,
      ...project,
      status: project.status || 'draft',
      revisionHistory: project.revisionHistory || [],
      brandOverlay: {
        ...DEFAULT_BRAND_OVERLAY,
        ...(project.brandOverlay || {}),
      },
      umkmOverlay: {
        ...DEFAULT_UMKM_OVERLAY,
        ...(project.umkmOverlay || {}),
      },
      callouts: project.callouts || DEFAULT_CALLOUTS,
      renderSettings: {
        ...DEFAULT_RENDER_SETTINGS,
        ...(project.renderSettings || {}),
      },
      chassisFinish: project.chassisFinish || 'anodized',
      screenTransform: {
        ...DEFAULT_SCREEN_TRANSFORM,
        ...(project.screenTransform || {}),
      },
      secondaryScreenTransform: {
        ...DEFAULT_SCREEN_TRANSFORM,
        ...(project.secondaryScreenTransform || {}),
      },
      resolution: project.resolution || '1080p',
    };
    set({ project: normalized });
    get().saveCurrentProject();
  },

  updateProjectName: (name) => {
    set((state) => ({
      project: { ...state.project, name },
    }));
    get().saveCurrentProject();
  },

  setClientName: (clientName) => {
    set((state) => ({
      project: { ...state.project, clientName },
    }));
    get().saveCurrentProject();
  },

  setProjectStatus: (status) => {
    set((state) => ({
      project: { ...state.project, status },
    }));
    get().saveCurrentProject();
  },

  addRevisionNote: (author, type, comment) => {
    const note: RevisionNote = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      author,
      timestamp: Date.now(),
      type,
      comment,
    };
    set((state) => ({
      project: {
        ...state.project,
        status: type === 'approval' ? 'approved' : 'revision_requested',
        revisionHistory: [note, ...state.project.revisionHistory],
      },
    }));
    get().saveCurrentProject();
  },

  setDeviceType: (deviceType) => {
    set((state) => ({
      project: { ...state.project, deviceType },
    }));
    get().saveCurrentProject();
  },

  setSceneType: (sceneType) => {
    set((state) => ({
      project: { ...state.project, sceneType },
    }));
    get().saveCurrentProject();
  },

  setLightingPreset: (lightingPreset) => {
    set((state) => ({
      project: { ...state.project, lightingPreset },
    }));
    get().saveCurrentProject();
  },

  setChassisColor: (chassisColor) => {
    set((state) => ({
      project: { ...state.project, chassisColor },
    }));
    get().saveCurrentProject();
  },

  setChassisFinish: (chassisFinish) => {
    set((state) => ({
      project: { ...state.project, chassisFinish },
    }));
    const engine = getEngineInstance();
    if (engine) engine.updateChassisFinish(chassisFinish);
    get().saveCurrentProject();
  },

  setScreenTransform: (partial, isSecondary = false) => {
    const key = isSecondary ? 'secondaryScreenTransform' : 'screenTransform';
    set((state) => ({
      project: {
        ...state.project,
        [key]: {
          ...(state.project[key] || DEFAULT_SCREEN_TRANSFORM),
          ...partial,
        },
      },
    }));
    const engine = getEngineInstance();
    if (engine) {
      const trans = get().project[key] || DEFAULT_SCREEN_TRANSFORM;
      engine.updateScreenTransform(trans, isSecondary);
    }
    get().saveCurrentProject();
  },

  setBackground: (background) => {
    set((state) => ({
      project: { ...state.project, background },
    }));
    get().saveCurrentProject();
  },

  setDuration: (duration) => {
    set((state) => ({
      project: { ...state.project, duration },
    }));
    get().saveCurrentProject();
  },

  setAspectRatio: (aspectRatio) => {
    set((state) => ({
      project: { ...state.project, aspectRatio },
    }));
    get().saveCurrentProject();
  },

  setResolution: (resolution) => {
    set((state) => ({
      project: { ...state.project, resolution },
    }));
    get().saveCurrentProject();
  },

  setBrandOverlay: (overlay) => {
    set((state) => ({
      project: {
        ...state.project,
        brandOverlay: {
          ...state.project.brandOverlay,
          ...overlay,
        },
      },
    }));
    get().saveCurrentProject();
  },

  setPrimaryAsset: (primaryAsset) => {
    set((state) => ({
      project: { ...state.project, primaryAsset },
    }));
    get().saveCurrentProject();
  },

  setSecondaryAsset: (secondaryAsset) => {
    set((state) => ({
      project: { ...state.project, secondaryAsset },
    }));
    get().saveCurrentProject();
  },

  setZoomFocus: (zoomFocus) => {
    set((state) => ({
      project: { ...state.project, zoomFocus },
    }));
    get().saveCurrentProject();
  },

  toggleCallouts: (enabled) => {
    const current = get().project.callouts || DEFAULT_CALLOUTS;
    const isNow = enabled !== undefined ? enabled : !current.enabled;
    const list = current.callouts || (current as any).pins || DEFAULT_CALLOUTS.callouts;
    set((state) => ({
      project: {
        ...state.project,
        callouts: {
          ...current,
          enabled: isNow,
          callouts: list,
        },
      },
    }));
    get().saveCurrentProject();
  },

  addCallout: (callout) => {
    const current = get().project.callouts || DEFAULT_CALLOUTS;
    const list = current.callouts || (current as any).pins || [];
    const newCallout: FeatureCallout = {
      id: `callout-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      screenX: 0.5,
      screenY: 0.5,
      title: 'New Feature',
      description: 'Feature description',
      icon: '✨',
      badgeColor: '#38bdf8',
      pulse: true,
      ...callout,
    };
    set((state) => ({
      project: {
        ...state.project,
        callouts: {
          ...current,
          enabled: true,
          callouts: [...list, newCallout],
        },
      },
    }));
    get().saveCurrentProject();
  },

  updateCallout: (id, updates) => {
    const current = get().project.callouts || DEFAULT_CALLOUTS;
    const list = current.callouts || (current as any).pins || [];
    set((state) => ({
      project: {
        ...state.project,
        callouts: {
          ...current,
          callouts: list.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        },
      },
    }));
    get().saveCurrentProject();
  },

  removeCallout: (id) => {
    const current = get().project.callouts || DEFAULT_CALLOUTS;
    const list = current.callouts || (current as any).pins || [];
    set((state) => ({
      project: {
        ...state.project,
        callouts: {
          ...current,
          callouts: list.filter((c) => c.id !== id),
        },
      },
    }));
    get().saveCurrentProject();
  },

  setUmkmOverlay: (partial) => {
    set((state) => ({
      project: {
        ...state.project,
        umkmOverlay: {
          ...(state.project.umkmOverlay || DEFAULT_UMKM_OVERLAY),
          ...partial,
        },
      },
    }));
    get().saveCurrentProject();
  },

  applyUmkmPreset: (preset) => {
    let updated: Partial<UmkmOverlayConfig> = { enabled: true, themePreset: preset };
    switch (preset) {
      case 'flash_sale':
        updated = {
          enabled: true,
          themePreset: 'flash_sale',
          storeName: 'Flash Sale Indonesia',
          badgeType: 'flash_sale',
          customBadgeText: 'Promo Kilat 50%',
          originalPrice: 'Rp 199.000',
          salePrice: 'Rp 99.000',
          discountPercent: '50% OFF',
          ctaChannel: 'shopee',
          ctaContact: 'shopee.co.id/flashsale',
          position: 'bottom-card',
        };
        break;
      case 'food_beverage':
        updated = {
          enabled: true,
          themePreset: 'food_beverage',
          storeName: 'Aroma Coffee & Eatery',
          badgeType: 'gratis_ongkir',
          customBadgeText: 'Beli 1 Gratis 1',
          originalPrice: 'Rp 48.000',
          salePrice: 'Rp 28.000',
          discountPercent: 'Hemat Rp 20rb',
          ctaChannel: 'whatsapp',
          ctaContact: '0812-3456-7890',
          position: 'bottom-card',
        };
        break;
      case 'fashion_apparel':
        updated = {
          enabled: true,
          themePreset: 'fashion_apparel',
          storeName: 'Nusantara Batik & Hijab',
          badgeType: 'best_seller',
          customBadgeText: 'Koleksi Terbaru 2026',
          originalPrice: 'Rp 285.000',
          salePrice: 'Rp 149.000',
          discountPercent: 'Hemat 48%',
          ctaChannel: 'tokopedia',
          ctaContact: 'tokopedia.com/nusantara',
          position: 'bottom-card',
        };
        break;
      case 'tech_gadget':
        updated = {
          enabled: true,
          themePreset: 'tech_gadget',
          storeName: 'TechVibe Official Store',
          badgeType: 'garansi_resmi',
          customBadgeText: 'Garansi Resmi 1 Thn',
          originalPrice: 'Rp 1.499.000',
          salePrice: 'Rp 999.000',
          discountPercent: 'Hemat Rp 500rb',
          ctaChannel: 'tiktok',
          ctaContact: 'tiktok.com/@techvibe',
          position: 'bottom-card',
        };
        break;
      case 'beauty_skincare':
        updated = {
          enabled: true,
          themePreset: 'beauty_skincare',
          storeName: 'GlowSkin Natural',
          badgeType: 'diskon_spesial',
          customBadgeText: 'BPOM Certified',
          originalPrice: 'Rp 160.000',
          salePrice: 'Rp 89.000',
          discountPercent: 'Diskon 44%',
          ctaChannel: 'whatsapp',
          ctaContact: '0821-8888-9999',
          position: 'bottom-card',
        };
        break;
    }
    get().setUmkmOverlay(updated);
  },

  setAudioConfig: (partial) => {
    const currentAudio = get().project.audio || DEFAULT_AUDIO;
    const updated = { ...currentAudio, ...partial };
    set((state) => ({
      project: {
        ...state.project,
        audio: updated,
      },
    }));
    AudioSynthesizer.getInstance().setConfig(updated);
    if (get().isPlaying && updated.enabled && !updated.isMuted && updated.preset !== 'none') {
      AudioSynthesizer.getInstance().play(updated.preset, updated);
    } else if (!updated.enabled || updated.isMuted || updated.preset === 'none') {
      AudioSynthesizer.getInstance().pause();
    }
    get().saveCurrentProject();
  },

  toggleAudioMute: () => {
    const currentAudio = get().project.audio || DEFAULT_AUDIO;
    get().setAudioConfig({ isMuted: !currentAudio.isMuted });
  },

  setRenderSettings: (partial) => {
    const current = get().project.renderSettings || DEFAULT_RENDER_SETTINGS;
    const updated = { ...current, ...partial };
    set((state) => ({
      project: {
        ...state.project,
        renderSettings: updated,
      },
    }));
    const engine = getEngineInstance();
    if (engine) engine.updateRenderSettings(updated);
    get().saveCurrentProject();
  },

  setIsPlaying: (isPlaying) => {
    set({ isPlaying });
    const audioState = get().project.audio || DEFAULT_AUDIO;
    if (isPlaying) {
      if (audioState.enabled && !audioState.isMuted && audioState.preset !== 'none') {
        AudioSynthesizer.getInstance().play(audioState.preset, audioState);
      }
    } else {
      AudioSynthesizer.getInstance().pause();
    }
  },

  setCurrentTime: (currentTime) => {
    set({ currentTime });
    const duration = get().project.duration || 15;
    AudioSynthesizer.getInstance().seek(currentTime, duration);
  },

  setIsFreeCamera: (isFreeCamera) => set({ isFreeCamera }),
  setExportModalOpen: (isExportModalOpen) => set({ isExportModalOpen }),
  setProjectsModalOpen: (isProjectsModalOpen) => set({ isProjectsModalOpen }),
  setBrandKitModalOpen: (isBrandKitModalOpen) => set({ isBrandKitModalOpen }),
  setClientReviewModalOpen: (isClientReviewModalOpen) => set({ isClientReviewModalOpen }),
  setPricingModalOpen: (isPricingModalOpen) => set({ isPricingModalOpen }),
  setPaymentModalOpen: (isPaymentModalOpen) => set({ isPaymentModalOpen }),
  setTemplateModalOpen: (isTemplateModalOpen) => set({ isTemplateModalOpen }),
  setDiagnosticModalOpen: (isDiagnosticModalOpen) => set({ isDiagnosticModalOpen }),
  setShortcutsModalOpen: (isShortcutsModalOpen) => set({ isShortcutsModalOpen }),
  setIsPitchMode: (isPitchMode) => set({ isPitchMode }),
  setShareModalOpen: (isShareModalOpen) => set({ isShareModalOpen }),
  setOnboardingOpen: (isOnboardingOpen) => set({ isOnboardingOpen }),
  startCheckout: (tier, billingCycle, amount) =>
    set({
      isPaymentModalOpen: true,
      checkoutPlan: { tier, billingCycle, amount },
    }),

  applyTemplate: async (tpl) => {
    const merged: ProjectData = {
      ...get().project,
      ...tpl.projectConfig,
      name: tpl.title,
      updatedAt: Date.now(),
    };
    get().setProject(merged);

    const engine = getEngineInstance();
    if (engine) {
      if (merged.sceneType) engine.updateSceneType(merged.sceneType);
      if (merged.deviceType) engine.updateDeviceType(merged.deviceType);
      if (merged.chassisColor) engine.updateChassisColor(merged.chassisColor);
      if (merged.chassisFinish) engine.updateChassisFinish(merged.chassisFinish);
      if (merged.lightingPreset) engine.updateLighting(merged.lightingPreset);
      if (merged.background) engine.updateBackground(merged.background);
      if (merged.duration) engine.setDuration(merged.duration);
      if (merged.renderSettings) engine.updateRenderSettings(merged.renderSettings);
      if (merged.primaryAsset) {
        await engine.setScreenAsset(merged.primaryAsset, false);
        if (merged.screenTransform) engine.updateScreenTransform(merged.screenTransform, false);
      }
      if (merged.secondaryAsset) {
        await engine.setScreenAsset(merged.secondaryAsset, true);
        if (merged.secondaryScreenTransform) engine.updateScreenTransform(merged.secondaryScreenTransform, true);
      }
    }
    set({ isTemplateModalOpen: false, currentTime: 0, isPlaying: true });
  },

  setExportProgress: (partial) =>
    set((state) => ({
      exportProgress: { ...state.exportProgress, ...partial },
    })),

  updateBrandKit: async (kit) => {
    const updated = { ...get().brandKit, ...kit };
    set({ brandKit: updated });
    await saveBrandKit(updated);
  },

  loadBrandKit: async () => {
    const kit = await getBrandKit();
    if (kit) {
      set({ brandKit: kit });
    }
  },

  applyBrandKitToProject: () => {
    const kit = get().brandKit;
    set((state) => ({
      project: {
        ...state.project,
        brandOverlay: {
          ...state.project.brandOverlay,
          enabled: true,
          subtitle: `Crafted by ${kit.agencyName}`,
          logoUrl: kit.agencyLogoUrl || state.project.brandOverlay.logoUrl,
        },
      },
    }));
    get().saveCurrentProject();
  },

  setActiveLicenseTier: (activeLicenseTier) => set({ activeLicenseTier }),

  createNewProject: async (name, client) => {
    const kit = get().brandKit;
    const newProj: ProjectData = {
      ...DEFAULT_PROJECT,
      id: `project-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name || `Project ${new Date().toLocaleDateString()}`,
      clientName: client || 'Private Client',
      status: 'draft',
      revisionHistory: [],
      brandOverlay: {
        ...DEFAULT_BRAND_OVERLAY,
        subtitle: `Produced by ${kit.agencyName}`,
        logoUrl: kit.agencyLogoUrl,
      },
      umkmOverlay: DEFAULT_UMKM_OVERLAY,
      callouts: DEFAULT_CALLOUTS,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await saveProject(newProj);
    set({ project: newProj, currentTime: 0, isPlaying: true });
    return newProj;
  },

  loadSavedProject: async (id: string) => {
    const loaded = await getProject(id);
    if (loaded) {
      const normalized: ProjectData = {
        ...DEFAULT_PROJECT,
        ...loaded,
        status: loaded.status || 'draft',
        revisionHistory: loaded.revisionHistory || [],
        brandOverlay: {
          ...DEFAULT_BRAND_OVERLAY,
          ...(loaded.brandOverlay || {}),
        },
        umkmOverlay: {
          ...DEFAULT_UMKM_OVERLAY,
          ...(loaded.umkmOverlay || {}),
        },
        callouts: loaded.callouts || DEFAULT_CALLOUTS,
        renderSettings: {
          ...DEFAULT_RENDER_SETTINGS,
          ...(loaded.renderSettings || {}),
        },
        chassisFinish: loaded.chassisFinish || 'anodized',
        screenTransform: {
          ...DEFAULT_SCREEN_TRANSFORM,
          ...(loaded.screenTransform || {}),
        },
        secondaryScreenTransform: {
          ...DEFAULT_SCREEN_TRANSFORM,
          ...(loaded.secondaryScreenTransform || {}),
        },
        resolution: loaded.resolution || '1080p',
      };
      set({ project: normalized, currentTime: 0, isPlaying: true });
    }
  },

  saveCurrentProject: async () => {
    const current = get().project;
    set({ isSaving: true });
    try {
      await saveProject(current);
      set({ lastSavedAt: Date.now(), isSaving: false });
    } catch (e) {
      console.warn('Failed to auto-save project to IndexedDB:', e);
      set({ isSaving: false });
    }
  },
}));
