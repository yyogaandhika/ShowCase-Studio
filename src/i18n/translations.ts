import { SupportedLanguage } from '../types';

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  tagline: string;
  freeCameraMode: string;
  freeCameraTip: string;
  resumeCamera: string;
  snapshot: string;
  exportVideo: string;
  projects: string;
  brandKit: string;
  clientReview: string;
  pricing: string;
  planFree: string;
  planPro: string;
  planAgency: string;

  // Status
  statusDraft: string;
  statusInReview: string;
  statusApproved: string;
  statusRevisionRequested: string;

  // Left Sidebar
  deviceSelection: string;
  devicePhone: string;
  deviceLaptop: string;
  deviceTablet: string;
  deviceDesktop: string;
  deviceSmartwatch: string;
  
  sceneSelection: string;
  sceneHero: string;
  sceneHeroDesc: string;
  sceneDuo: string;
  sceneDuoDesc: string;
  sceneZoom: string;
  sceneZoomDesc: string;
  scenePortfolio: string;
  scenePortfolioDesc: string;
  sceneOrbit: string;
  sceneOrbitDesc: string;
  sceneDrift: string;
  sceneDriftDesc: string;
  sceneStoryReel: string;
  sceneStoryReelDesc: string;

  mediaAssets: string;
  primaryScreen: string;
  secondaryScreen: string;
  uploadPrompt: string;
  dropFileHere: string;
  uploadSupportedFormats: string;
  removeAsset: string;
  sampleMockups: string;
  sampleSaas: string;
  sampleBanking: string;
  sampleFood: string;
  sampleFashion: string;
  sampleGadget: string;
  focusPoint: string;
  focusHint: string;

  brandTypography: string;
  brandTitle: string;
  brandSubtitle: string;
  brandLogo: string;
  brandPosition: string;
  enableOverlay: string;

  // Right Sidebar
  lighting: string;
  lightingNeutral: string;
  lightingNeon: string;
  lightingSunset: string;
  chassisFinish: string;
  background: string;
  bgSolid: string;
  bgGradient: string;
  bgAngle: string;
  duration: string;
  framingRatio: string;
  ratioLandscape: string;
  ratioPortrait: string;
  ratioSquare: string;

  // UMKM Mode
  umkmSectionTitle: string;
  umkmModeToggle: string;
  umkmModeDesc: string;
  umkmStoreName: string;
  umkmPriceOriginal: string;
  umkmPriceSale: string;
  umkmDiscountBadge: string;
  umkmBadgePromo: string;
  umkmBadgeGratisOngkir: string;
  umkmBadgeCod: string;
  umkmBadgeFlashSale: string;
  umkmBadgeBestSeller: string;
  umkmBadgeGaransiResmi: string;
  umkmBadgeDiskonSpesial: string;
  umkmCtaChannel: string;
  umkmCtaContact: string;
  umkmPresets: string;
  umkmPresetFlashSale: string;
  umkmPresetFood: string;
  umkmPresetFashion: string;
  umkmPresetTech: string;
  umkmPresetBeauty: string;

  // Callouts
  calloutsSectionTitle: string;
  calloutsToggle: string;
  calloutsDesc: string;
  calloutAddPin: string;
  calloutPresetTitle: string;
  calloutPinTitle: string;
  calloutPinDesc: string;
  calloutPinIcon: string;
  calloutPinColor: string;
  calloutPinX: string;
  calloutPinY: string;
  calloutPinDelete: string;

  // Export
  exportModalTitle: string;
  exportFormat: string;
  exportResolution: string;
  exportBatchMultiRatio: string;
  exportBatchDesc: string;
  exportWatermarkNotice: string;
  exportStart: string;
  exportRendering: string;
  exportCompleted: string;
  exportDownloadAgain: string;
  exportCancel: string;
  marketingPack: string;
  marketingPackDesc: string;
  duplicateProjectAction: string;
  gifLoopExport: string;

  // Local Payment
  paymentTitle: string;
  paymentSubtitle: string;
  paymentSelectMethod: string;
  paymentMethodQris: string;
  paymentMethodEwallet: string;
  paymentMethodVa: string;
  paymentPayNow: string;
  paymentSuccess: string;
  paymentSuccessDesc: string;
  paymentClose: string;
}

export const translations: Record<SupportedLanguage, Translations> = {
  id: {
    appTitle: 'Showcase Studio',
    appSubtitle: 'Mockup 3D & Showcase Video Browser',
    tagline: 'Dari rekaman layar menjadi video showcase 3D siap posting dalam hitungan menit.',
    freeCameraMode: 'Mode Kamera Bebas (Putar untuk melihat detail, scroll untuk zoom)',
    freeCameraTip: 'Kamera bebas aktif',
    resumeCamera: 'Lanjutkan Animasi',
    snapshot: 'Tangkapan Layar (PNG)',
    exportVideo: 'Ekspor Video',
    projects: 'Proyek',
    brandKit: 'Brand Kit',
    clientReview: 'Tinjauan Klien',
    pricing: 'Paket Lisensi',
    planFree: 'Gratis',
    planPro: 'Pro Individu',
    planAgency: 'Agensi',

    statusDraft: 'Draf',
    statusInReview: 'Sedang Ditinjau Klien',
    statusApproved: 'Disetujui',
    statusRevisionRequested: 'Permintaan Revisi',

    deviceSelection: 'Pilih Model Perangkat',
    devicePhone: 'Ponsel Pintar',
    deviceLaptop: 'Laptop Modern',
    deviceTablet: 'Tablet Slate',
    deviceDesktop: 'Monitor Desktop 27"',
    deviceSmartwatch: 'Smartwatch OLED',

    sceneSelection: 'Adegan Animasi',
    sceneHero: 'Hero Solo',
    sceneHeroDesc: 'Satu perangkat melayang dan berputar anggun',
    sceneDuo: 'Duo Pairing',
    sceneDuoDesc: 'Ponsel & laptop berdampingan dengan 2 layar aktif',
    sceneZoom: 'Feature Zoom',
    sceneZoomDesc: 'Kamera sinematik mendekat menyorot detail fitur',
    scenePortfolio: 'Portfolio Tilt',
    scenePortfolioDesc: 'Posisi miring isometrik dengan bayangan lembut',
    sceneOrbit: '360° Orbit',
    sceneOrbitDesc: 'Putaran kamera memutar 360 derajat mengelilingi produk',
    sceneDrift: 'Cinematic Drift',
    sceneDriftDesc: 'Gerakan gliding horizontal lambat untuk video mewah',
    sceneStoryReel: 'Story Reel (Multi-Shot)',
    sceneStoryReelDesc: 'Sekuens iklan 3-babak sinematik otomatis (Orbit Luas → Macro Zoom → Hero Outro)',

    mediaAssets: 'Isi Layar & Media',
    primaryScreen: 'Layar Utama',
    secondaryScreen: 'Layar Kedua (Duo)',
    uploadPrompt: 'Tarik & lepas tangkapan layar atau rekaman video di sini',
    dropFileHere: 'Lepaskan file untuk mengunggah',
    uploadSupportedFormats: 'Mendukung PNG, JPG, WebP, MP4, WebM (maks 50MB)',
    removeAsset: 'Hapus Aset',
    sampleMockups: 'Gunakan Mockup Contoh Instan:',
    sampleSaas: 'SaaS Dashboard',
    sampleBanking: 'Mobile Banking',
    sampleFood: 'Kuliner / Menu Resto',
    sampleFashion: 'Toko Pakaian & Hijab',
    sampleGadget: 'Gadget Store',
    focusPoint: 'Titik Fokus Zoom',
    focusHint: 'Pilih area layar yang ingin disorot kamera',

    brandTypography: 'Tipografi Judul & Logo',
    brandTitle: 'Judul Showcase',
    brandSubtitle: 'Subjudul / Keterangan',
    brandLogo: 'Logo Klien / Brand',
    brandPosition: 'Posisi Teks',
    enableOverlay: 'Tampilkan Overlay Judul',

    lighting: 'Pencahayaan Studio',
    lightingNeutral: 'Netral',
    lightingNeon: 'Cyber Neon',
    lightingSunset: 'Sunset Hangat',
    chassisFinish: 'Warna Bodi Perangkat',
    background: 'Latar Belakang',
    bgSolid: 'Warna Solid',
    bgGradient: 'Gradasi Warna',
    bgAngle: 'Sudut Gradasi',
    duration: 'Durasi Animasi',
    framingRatio: 'Rasio Framing Kanvas',
    ratioLandscape: '16:9 Landscape (YouTube/Web)',
    ratioPortrait: '9:16 Potret (Reels/TikTok/Shorts)',
    ratioSquare: '1:1 Persegi (Feed Instagram)',

    // UMKM Mode
    umkmSectionTitle: 'Mode Etalase UMKM & Toko Online',
    umkmModeToggle: 'Aktifkan Mode Etalase UMKM',
    umkmModeDesc: 'Tambahkan price tag, promo diskon, dan tombol pemesanan WhatsApp langsung di atas video 3D.',
    umkmStoreName: 'Nama Toko / Brand UMKM',
    umkmPriceOriginal: 'Harga Normal (Coret)',
    umkmPriceSale: 'Harga Promo / Diskon',
    umkmDiscountBadge: 'Badge Diskon (% Hemat)',
    umkmBadgePromo: 'Badge Promo Utama',
    umkmBadgeGratisOngkir: '🚚 Gratis Ongkir Se-Indonesia',
    umkmBadgeCod: '💵 COD / Bayar di Tempat',
    umkmBadgeFlashSale: '🔥 Flash Sale Terbatas',
    umkmBadgeBestSeller: '⭐ Produk Terlaris / Best Seller',
    umkmBadgeGaransiResmi: '🛡️ 100% Original & Bergaransi',
    umkmBadgeDiskonSpesial: '🎉 Diskon Spesial Hari Ini',
    umkmCtaChannel: 'Saluran Pemesanan (CTA)',
    umkmCtaContact: 'Kontak / Link Toko',
    umkmPresets: 'Pilihan Cepat Tema Etalase:',
    umkmPresetFlashSale: '🔥 Flash Sale',
    umkmPresetFood: '☕ Kuliner & Cafe',
    umkmPresetFashion: '👗 Fashion & Hijab',
    umkmPresetTech: '📱 Gadget & Aksesoris',
    umkmPresetBeauty: '✨ Skincare & Kecantikan',

    // Callouts
    calloutsSectionTitle: 'Anotasi Pin Fitur 3D (Callouts)',
    calloutsToggle: 'Tampilkan Pin Anotasi Fitur 3D',
    calloutsDesc: 'Pin 3D interaktif menempel pada koordinat layar aplikasi & terproyeksi otomatis di kanvas.',
    calloutAddPin: '+ Tambah Pin Fitur',
    calloutPresetTitle: 'Preset Fitur Cepat:',
    calloutPinTitle: 'Judul Fitur',
    calloutPinDesc: 'Deskripsi Singkat',
    calloutPinIcon: 'Ikon Emoji',
    calloutPinColor: 'Warna Aksen',
    calloutPinX: 'Posisi Horizontal (X)',
    calloutPinY: 'Posisi Vertikal (Y)',
    calloutPinDelete: 'Hapus Pin',

    // Export
    exportModalTitle: 'Ekspor Showcase Video 3D',
    exportFormat: 'Format Video',
    exportResolution: 'Resolusi Ekspor',
    exportBatchMultiRatio: 'Ekspor Multi-Rasio Sekali Klik (16:9 + 9:16 + 1:1)',
    exportBatchDesc: 'Menghasilkan 3 video sekaligus untuk semua format media sosial secara otomatis.',
    exportWatermarkNotice: 'Watermark Showcase Studio terpasang pada paket gratis. Tingkatkan ke Pro untuk hasil 100% bersih tanpa watermark.',
    exportStart: 'Mulai Render & Ekspor',
    exportRendering: 'Sedang merender frame demi frame...',
    exportCompleted: 'Ekspor Berhasil!',
    exportDownloadAgain: 'Unduh Ulang',
    exportCancel: 'Batal',
    marketingPack: 'Paket Foto Marketing (5 Sudut Studio)',
    marketingPackDesc: 'Merender 5 sudut kamera sekaligus (Tampak Depan, Iso Kiri/Kanan, Low-Angle, Flatlay) dan 1 Master Contact Sheet 2560×1440.',
    duplicateProjectAction: 'Duplikasi Proyek (Salin ke Proyek Baru)',
    gifLoopExport: 'Ekspor Animasi GIF Looping',

    // Local Payment
    paymentTitle: 'Pembayaran Lokal Indonesia',
    paymentSubtitle: 'Aktivasi lisensi instan tanpa kartu kredit dengan QRIS & Virtual Account.',
    paymentSelectMethod: 'Pilih Metode Pembayaran',
    paymentMethodQris: 'QRIS (Semua Bank & E-Wallet)',
    paymentMethodEwallet: 'E-Wallet (GoPay / OVO / DANA / ShopeePay)',
    paymentMethodVa: 'Virtual Account Bank',
    paymentPayNow: 'Bayar Sekarang (Konfirmasi Instan)',
    paymentSuccess: 'Pembayaran Berhasil Diterima!',
    paymentSuccessDesc: 'Lisensi akun Anda telah otomatis diaktifkan.',
    paymentClose: 'Tutup & Mulai Berkarya',
  },

  en: {
    appTitle: 'Showcase Studio',
    appSubtitle: 'Browser 3D Mockup & Showcase Video Studio',
    tagline: 'Transform client screen recordings into professional 3D video showcases in under 5 minutes.',
    freeCameraMode: 'Free Orbit Camera Mode (Drag to inspect angles, scroll to zoom)',
    freeCameraTip: 'Free Camera Active',
    resumeCamera: 'Resume Animation',
    snapshot: 'Snapshot (PNG)',
    exportVideo: 'Export Video',
    projects: 'Projects',
    brandKit: 'Brand Kit',
    clientReview: 'Client Review',
    pricing: 'Licensing',
    planFree: 'Free',
    planPro: 'Pro Individual',
    planAgency: 'Agency',

    statusDraft: 'Draft Stage',
    statusInReview: 'In Client Review',
    statusApproved: 'Approved',
    statusRevisionRequested: 'Revision Requested',

    deviceSelection: 'Device Model',
    devicePhone: 'Smartphone',
    deviceLaptop: 'Modern Laptop',
    deviceTablet: 'Slate Tablet',
    deviceDesktop: '27" Desktop Monitor',
    deviceSmartwatch: 'OLED Smartwatch',

    sceneSelection: 'Animation Scene',
    sceneHero: 'Hero Solo',
    sceneHeroDesc: 'Single device floating with elegant continuous rotation',
    sceneDuo: 'Duo Pairing',
    sceneDuoDesc: 'Phone & laptop side-by-side with independent screen assets',
    sceneZoom: 'Feature Zoom',
    sceneZoomDesc: 'Cinematic macro close-up highlighting UI details',
    scenePortfolio: 'Portfolio Tilt',
    scenePortfolioDesc: 'Isometric angled showcase with soft ground shadow',
    sceneOrbit: '360° Orbit',
    sceneOrbitDesc: 'Full 360-degree orbital sweep around the device',
    sceneDrift: 'Cinematic Drift',
    sceneDriftDesc: 'Slow horizontal gliding motion for luxury agency promos',
    sceneStoryReel: 'Story Reel (Multi-Shot)',
    sceneStoryReelDesc: 'Automatic 3-act agency commercial sequence (Wide Orbit → Macro Zoom → Hero Outro)',

    mediaAssets: 'Screen Media Assets',
    primaryScreen: 'Primary Screen',
    secondaryScreen: 'Secondary Screen (Duo)',
    uploadPrompt: 'Drag and drop screenshot image or screen recording video here',
    dropFileHere: 'Drop file to upload',
    uploadSupportedFormats: 'Supports PNG, JPG, WebP, MP4, WebM (max 50MB)',
    removeAsset: 'Remove Asset',
    sampleMockups: 'Or Use Quick Sample Mockup:',
    sampleSaas: 'SaaS Dashboard',
    sampleBanking: 'Mobile Banking',
    sampleFood: 'Food & Cafe Menu',
    sampleFashion: 'Fashion & Apparel',
    sampleGadget: 'Gadget Store',
    focusPoint: 'Zoom Focus Point',
    focusHint: 'Select the screen area you want the camera to inspect',

    brandTypography: 'Brand Typography & Logo',
    brandTitle: 'Showcase Title',
    brandSubtitle: 'Subtitle / Description',
    brandLogo: 'Client / Brand Logo',
    brandPosition: 'Text Position',
    enableOverlay: 'Enable Title Overlay',

    lighting: 'Studio Lighting',
    lightingNeutral: 'Neutral',
    lightingNeon: 'Cyber Neon',
    lightingSunset: 'Golden Sunset',
    chassisFinish: 'Device Chassis Finish',
    background: 'Backdrop',
    bgSolid: 'Solid Color',
    bgGradient: 'Gradient',
    bgAngle: 'Gradient Angle',
    duration: 'Video Duration',
    framingRatio: 'Framing Aspect Ratio',
    ratioLandscape: '16:9 Landscape (YouTube/Web)',
    ratioPortrait: '9:16 Portrait (Reels/TikTok/Shorts)',
    ratioSquare: '1:1 Square (Instagram Feed)',

    // UMKM Mode
    umkmSectionTitle: 'UMKM E-Commerce & Showcase Mode',
    umkmModeToggle: 'Enable UMKM Product Showcase',
    umkmModeDesc: 'Add price tags, discount promo badges, and direct WhatsApp order badges to the 3D video.',
    umkmStoreName: 'Store / Brand Name',
    umkmPriceOriginal: 'Original Price (Strikethrough)',
    umkmPriceSale: 'Sale / Promo Price',
    umkmDiscountBadge: 'Discount Badge (% OFF)',
    umkmBadgePromo: 'Featured Promo Badge',
    umkmBadgeGratisOngkir: '🚚 Free Nationwide Shipping',
    umkmBadgeCod: '💵 Cash On Delivery (COD)',
    umkmBadgeFlashSale: '🔥 Limited Flash Sale',
    umkmBadgeBestSeller: '⭐ Best Seller / Top Rated',
    umkmBadgeGaransiResmi: '🛡️ 100% Original & Guaranteed',
    umkmBadgeDiskonSpesial: '🎉 Today\'s Special Discount',
    umkmCtaChannel: 'Order Channel (CTA)',
    umkmCtaContact: 'Store Contact / Link',
    umkmPresets: 'Quick Etalase Themes:',
    umkmPresetFlashSale: '🔥 Flash Sale',
    umkmPresetFood: '☕ Cafe & Culinary',
    umkmPresetFashion: '👗 Fashion & Apparel',
    umkmPresetTech: '📱 Gadget & Tech',
    umkmPresetBeauty: '✨ Beauty & Skincare',

    // Callouts
    calloutsSectionTitle: '3D Feature Callout Pins',
    calloutsToggle: 'Enable 3D Feature Callout Pins',
    calloutsDesc: 'Interactive 3D pins pinned to device screen coordinates & projected mathematically on canvas.',
    calloutAddPin: '+ Add Feature Pin',
    calloutPresetTitle: 'Quick Feature Presets:',
    calloutPinTitle: 'Feature Title',
    calloutPinDesc: 'Brief Description',
    calloutPinIcon: 'Emoji Icon',
    calloutPinColor: 'Accent Color',
    calloutPinX: 'Horizontal Position (X)',
    calloutPinY: 'Vertical Position (Y)',
    calloutPinDelete: 'Delete Pin',

    // Export
    exportModalTitle: 'Export 3D Video Showcase',
    exportFormat: 'Video Format',
    exportResolution: 'Resolution',
    exportBatchMultiRatio: 'One-Click Batch Multi-Ratio (16:9 + 9:16 + 1:1)',
    exportBatchDesc: 'Automatically generates all 3 social media formats simultaneously.',
    exportWatermarkNotice: 'Showcase Studio watermark included on free tier. Upgrade to Pro for 100% clean watermark-free video.',
    exportStart: 'Start Render & Export',
    exportRendering: 'Rendering frame-by-frame...',
    exportCompleted: 'Export Completed!',
    exportDownloadAgain: 'Download Again',
    exportCancel: 'Cancel',
    marketingPack: 'Marketing Shot Pack (5 Studio Angles)',
    marketingPackDesc: 'Renders 5 studio camera angles (Front, Iso Left/Right, Low-Angle, Flatlay) + 1 Master 2560×1440 Contact Sheet in one click.',
    duplicateProjectAction: 'Duplicate Project (Clone to New Project)',
    gifLoopExport: 'Export Looping Animated GIF',

    // Local Payment
    paymentTitle: 'Indonesian Local Payment',
    paymentSubtitle: 'Instant license activation without credit card via QRIS & Virtual Account.',
    paymentSelectMethod: 'Select Payment Method',
    paymentMethodQris: 'QRIS (All Banks & E-Wallets)',
    paymentMethodEwallet: 'E-Wallet (GoPay / OVO / DANA / ShopeePay)',
    paymentMethodVa: 'Bank Virtual Account',
    paymentPayNow: 'Pay Now (Instant Confirmation)',
    paymentSuccess: 'Payment Successfully Verified!',
    paymentSuccessDesc: 'Your account license has been upgraded automatically.',
    paymentClose: 'Close & Start Creating',
  },
};
