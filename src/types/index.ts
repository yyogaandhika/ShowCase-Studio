export type DeviceType = 'phone' | 'laptop' | 'tablet' | 'desktop' | 'smartwatch';

export type SceneType = 'hero' | 'duo' | 'zoom' | 'portfolio' | 'orbit' | 'drift' | 'story_reel';

export type LightingPreset = 'studio' | 'neon' | 'sunset';

export type AspectRatio = '16:9' | '9:16' | '1:1';

export type DurationOption = 10 | 15 | 30; // seconds

export type ResolutionOption = '1080p' | '4k';

export type VideoFormat = 'mp4' | 'webm';

export type ProjectStatus = 'draft' | 'in_review' | 'approved' | 'revision_requested';

export type LicenseTier = 'free' | 'pro' | 'agency';

export interface BackgroundConfig {
  type: 'solid' | 'gradient';
  color1: string;
  color2: string;
  angle: number; // degrees for gradient
}

export interface ScreenAsset {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string; // Object URL or Base64 / Canvas
  blob?: Blob; // For IndexedDB persistence
  aspectRatio?: number;
}

export interface BrandOverlayConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  logoUrl?: string | null;
  position: 'top-left' | 'top-center' | 'bottom-left' | 'bottom-center';
  textColor: string;
  showBadge: boolean;
}

export interface RevisionNote {
  id: string;
  author: string;
  timestamp: number;
  type: 'approval' | 'revision';
  comment: string;
}

export interface AgencyBrandKit {
  agencyName: string;
  agencyLogoUrl?: string | null;
  customWatermarkText: string;
  customWatermarkUrl: string;
  primaryColor: string;
  secondaryColor: string;
}

export type SupportedLanguage = 'id' | 'en';

export type UmkmBadgeType =
  | 'gratis_ongkir'
  | 'cod'
  | 'flash_sale'
  | 'best_seller'
  | 'garansi_resmi'
  | 'diskon_spesial';

export type UmkmCtaChannel =
  | 'whatsapp'
  | 'shopee'
  | 'tokopedia'
  | 'tiktok'
  | 'website';

export type UmkmThemePreset =
  | 'flash_sale'
  | 'food_beverage'
  | 'fashion_apparel'
  | 'tech_gadget'
  | 'beauty_skincare';

export interface UmkmOverlayConfig {
  enabled: boolean;
  storeName: string;
  badgeType: UmkmBadgeType;
  customBadgeText?: string;
  originalPrice: string;
  salePrice: string;
  discountPercent: string;
  ctaChannel: UmkmCtaChannel;
  ctaContact: string; // e.g. "0812-3456-7890" or "tokopedia.com/toko"
  position: 'bottom-card' | 'top-banner' | 'floating-badge';
  themePreset: UmkmThemePreset;
}

export type LocalPaymentMethod =
  | 'qris'
  | 'gopay'
  | 'ovo'
  | 'dana'
  | 'shopeepay'
  | 'bca_va'
  | 'mandiri_va'
  | 'bri_va'
  | 'bni_va';

export interface PaymentInvoice {
  orderId: string;
  tier: LicenseTier;
  billingCycle: 'monthly' | 'yearly';
  amount: number;
  method: LocalPaymentMethod;
  status: 'pending' | 'success';
  createdAt: number;
  vaNumber?: string;
}

export type AudioPresetId =
  | 'none'
  | 'cyber_pulse'
  | 'lofi_ambient'
  | 'minimal_tech'
  | 'uplifting_saas'
  | 'custom';

export interface AudioConfig {
  enabled: boolean;
  preset: AudioPresetId;
  volume: number; // 0 to 1
  isMuted: boolean;
  customAudioUrl?: string | null;
  customAudioName?: string;
}

export type ChassisFinish = 'matte' | 'anodized' | 'ceramic' | 'chrome';
export type ScreenFitMode = 'cover' | 'contain' | 'stretch';
export type CameraAnglePreset =
  | 'front'
  | 'isometric_left'
  | 'isometric_right'
  | 'low_angle'
  | 'flatlay';

export interface MarketingAngleShot {
  preset: CameraAnglePreset;
  label: string;
  blob: Blob;
  url: string;
  filename: string;
}

export interface MarketingPackResult {
  shots: MarketingAngleShot[];
  contactSheetBlob?: Blob;
  contactSheetUrl?: string;
}

export interface ScreenTransformConfig {
  fitMode: ScreenFitMode;
  scale: number; // 1.0 to 2.5
  panX: number;  // -1.0 to 1.0
  panY: number;  // -1.0 to 1.0
}

export interface RenderSettings {
  screenGlassReflection: number; // 0.0 (Matte) to 1.0 (Ultra Glossy)
  screenBrightness: number;       // 0.8 (Dim) to 1.5 (Vibrant OLED)
  shadowIntensity: number;        // 0.0 (No shadow) to 1.0 (Deep shadow)
  animationSpeed: number;         // 0.5 (Slow Mo), 1.0 (Normal), 1.5 (Dynamic), 2.0 (Fast)
  vignette: boolean;              // Soft cinematic vignette
  groundContactShadow: boolean;   // Soft physical floor shadow
}

export interface FeatureCallout {
  id: string;
  title: string;
  description?: string;
  screenX: number; // 0.0 to 1.0 (relative screen coordinate)
  screenY: number; // 0.0 to 1.0
  badgeColor?: string; // hex color e.g. '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'
  icon?: string; // e.g. "⚡", "🛡️", "💳", "✨", "🎯", "📊"
  pulse?: boolean;
}

export interface CalloutConfig {
  enabled: boolean;
  callouts: FeatureCallout[];
}

export interface ProjectData {
  id: string;
  name: string;
  clientName?: string;
  createdAt: number;
  updatedAt: number;
  status: ProjectStatus;
  revisionHistory: RevisionNote[];
  deviceType: DeviceType;
  sceneType: SceneType;
  lightingPreset: LightingPreset;
  chassisColor: string;
  chassisFinish?: ChassisFinish;
  background: BackgroundConfig;
  duration: DurationOption;
  aspectRatio: AspectRatio;
  resolution: ResolutionOption;
  brandOverlay: BrandOverlayConfig;
  umkmOverlay?: UmkmOverlayConfig;
  audio?: AudioConfig;
  renderSettings?: RenderSettings;
  primaryAsset?: ScreenAsset | null;
  secondaryAsset?: ScreenAsset | null; // For Duo scene
  screenTransform?: ScreenTransformConfig;
  secondaryScreenTransform?: ScreenTransformConfig;
  zoomFocus?: { x: number; y: number }; // For Feature Zoom scene
  callouts?: CalloutConfig; // For Feature Callout Pins (Fase 12)
}

export interface ExportProgress {
  status: 'idle' | 'rendering' | 'encoding' | 'completed' | 'error';
  currentFrame: number;
  totalFrames: number;
  progressPercent: number;
  estimatedRemainingSec: number;
  currentRatioIndex?: number;
  totalRatios?: number;
  currentRatioLabel?: string;
  error?: string;
  videoBlobUrl?: string;
  downloadedFiles?: { name: string; url: string }[];
}

export interface ProjectArchiveBundle {
  version: string;
  exportedAt: number;
  project: ProjectData;
  primaryAssetBase64?: string | null;
  secondaryAssetBase64?: string | null;
}

export interface CaseStudyTemplate {
  id: string;
  title: string;
  category: 'fintech' | 'saas' | 'ecommerce' | 'fnb' | 'fashion' | 'enterprise';
  description: string;
  badge: string;
  previewColor: string;
  projectConfig: Partial<ProjectData>;
}
