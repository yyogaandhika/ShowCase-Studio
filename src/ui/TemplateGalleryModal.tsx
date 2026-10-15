import React, { useState } from 'react';
import {
  X,
  LayoutTemplate,
  Sparkles,
  ArrowRight,
  Smartphone,
  Laptop,
  Monitor,
  ShoppingBag,
  Building,
  Check,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTranslation } from '../i18n/useTranslation';
import { CaseStudyTemplate } from '../types';
import { generateSampleMockupAsset } from '../engine/sampleMockups';

export const TemplateGalleryModal: React.FC = () => {
  const { isTemplateModalOpen, setTemplateModalOpen, applyTemplate } = useStore();
  const { t } = useTranslation();

  const [filter, setFilter] = useState<string>('all');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  if (!isTemplateModalOpen) return null;

  const templates: CaseStudyTemplate[] = [
    {
      id: 'fintech-superapp',
      title: 'Fintech Superapp Case Study',
      category: 'fintech',
      badge: 'Software House Fav',
      description: 'Animasi Hero Solo smartphone dengan pencahayaan neon cyber dan tipografi branding profesional.',
      previewColor: 'from-blue-600/30 to-indigo-900/40',
      projectConfig: {
        deviceType: 'phone',
        sceneType: 'hero',
        lightingPreset: 'neon',
        chassisColor: '#1f2124',
        duration: 15,
        aspectRatio: '16:9',
        background: {
          type: 'gradient',
          color1: '#020617',
          color2: '#0f172a',
          angle: 135,
        },
        brandOverlay: {
          enabled: true,
          title: 'Nexus Superapp 2.0',
          subtitle: 'Next-Gen Mobile Banking & Investment Portfolio',
          logoUrl: null,
          position: 'top-left',
          textColor: '#ffffff',
          showBadge: true,
        },
        primaryAsset: generateSampleMockupAsset('banking'),
      },
    },
    {
      id: 'saas-enterprise',
      title: 'Enterprise SaaS Dashboard',
      category: 'saas',
      badge: 'B2B Ready',
      description: 'Laptop modern dengan sudut miring isometrik di atas studio slate yang elegan.',
      previewColor: 'from-slate-700/40 to-slate-900/60',
      projectConfig: {
        deviceType: 'laptop',
        sceneType: 'portfolio',
        lightingPreset: 'studio',
        chassisColor: '#d1d5db',
        duration: 15,
        aspectRatio: '16:9',
        background: {
          type: 'gradient',
          color1: '#0f172a',
          color2: '#1e293b',
          angle: 145,
        },
        brandOverlay: {
          enabled: true,
          title: 'CloudScale Enterprise Dashboard',
          subtitle: 'Real-Time Telemetry & Global Cloud Infrastructure',
          logoUrl: null,
          position: 'top-left',
          textColor: '#ffffff',
          showBadge: true,
        },
      },
    },
    {
      id: 'cross-platform-duo',
      title: 'Cross-Platform Web & Mobile Demo',
      category: 'enterprise',
      badge: 'Dual Screens',
      description: 'Ponsel dan laptop berdampingan dengan pergerakan kamera harmonis untuk showcase full-stack.',
      previewColor: 'from-purple-800/30 to-indigo-950/50',
      projectConfig: {
        deviceType: 'laptop',
        sceneType: 'duo',
        lightingPreset: 'sunset',
        chassisColor: '#172554',
        duration: 15,
        aspectRatio: '16:9',
        background: {
          type: 'gradient',
          color1: '#11091a',
          color2: '#2a1124',
          angle: 135,
        },
        brandOverlay: {
          enabled: true,
          title: 'OmniChannel Client Portal',
          subtitle: 'Unified Experience Across Web & Native iOS/Android',
          logoUrl: null,
          position: 'top-left',
          textColor: '#ffffff',
          showBadge: true,
        },
        primaryAsset: null,
        secondaryAsset: generateSampleMockupAsset('banking'),
      },
    },
    {
      id: 'culinary-promo',
      title: 'Kuliner & Cafe Flash Sale',
      category: 'fnb',
      badge: 'UMKM & Reels Ready',
      description: 'Format potret 9:16 untuk Instagram Reels & TikTok dengan price tag promo dan tombol WhatsApp.',
      previewColor: 'from-amber-700/30 to-stone-900/60',
      projectConfig: {
        deviceType: 'phone',
        sceneType: 'zoom',
        lightingPreset: 'sunset',
        chassisColor: '#e2d9cc',
        duration: 10,
        aspectRatio: '9:16',
        background: {
          type: 'gradient',
          color1: '#1c1917',
          color2: '#451a03',
          angle: 140,
        },
        umkmOverlay: {
          enabled: true,
          storeName: 'Senja Coffee & Eatery',
          badgeType: 'flash_sale',
          customBadgeText: 'Promo Beli 1 Gratis 1 ☕',
          originalPrice: 'Rp 48.000',
          salePrice: 'Rp 28.000',
          discountPercent: 'Hemat Rp 20rb',
          ctaChannel: 'whatsapp',
          ctaContact: '0812-3456-7890',
          position: 'bottom-card',
          themePreset: 'food_beverage',
        },
        primaryAsset: generateSampleMockupAsset('food'),
      },
    },
    {
      id: 'fashion-boutique',
      title: 'Fashion & Hijab Store Lookbook',
      category: 'fashion',
      badge: '360° Turntable',
      description: 'Putaran visual memukau mengitari smartphone emas di atas latar studio rose luxury.',
      previewColor: 'from-rose-900/30 to-zinc-950/60',
      projectConfig: {
        deviceType: 'phone',
        sceneType: 'orbit',
        lightingPreset: 'studio',
        chassisColor: '#e2d9cc',
        duration: 15,
        aspectRatio: '1:1',
        background: {
          type: 'gradient',
          color1: '#09090b',
          color2: '#27272a',
          angle: 120,
        },
        umkmOverlay: {
          enabled: true,
          storeName: 'Nusantara Batik & Hijab',
          badgeType: 'best_seller',
          customBadgeText: 'Koleksi Hari Raya 2026 ⭐',
          originalPrice: 'Rp 285.000',
          salePrice: 'Rp 149.000',
          discountPercent: '50% OFF',
          ctaChannel: 'tokopedia',
          ctaContact: 'tokopedia.com/nusantaraboutique',
          position: 'bottom-card',
          themePreset: 'fashion_apparel',
        },
        primaryAsset: generateSampleMockupAsset('fashion'),
      },
    },
    {
      id: 'desktop-terminal',
      title: 'Executive 27" Desktop Suite',
      category: 'enterprise',
      badge: 'Cinematic Drift',
      description: 'Pergerakan kamera lambat menyorot monitor desktop ultra-lebar untuk software arsitektur & trading.',
      previewColor: 'from-cyan-900/30 to-slate-950/60',
      projectConfig: {
        deviceType: 'desktop',
        sceneType: 'drift',
        lightingPreset: 'studio',
        chassisColor: '#1f2124',
        duration: 15,
        aspectRatio: '16:9',
        background: {
          type: 'gradient',
          color1: '#020617',
          color2: '#180e29',
          angle: 135,
        },
        brandOverlay: {
          enabled: true,
          title: 'Apex Financial Workstation',
          subtitle: 'Institutional Trading Terminal & Low-Latency Execution',
          logoUrl: null,
          position: 'top-left',
          textColor: '#ffffff',
          showBadge: true,
        },
        primaryAsset: generateSampleMockupAsset('gadget'),
      },
    },
  ];

  const filteredTemplates = filter === 'all'
    ? templates
    : templates.filter((t) => t.category === filter);

  const handleApply = async (tpl: CaseStudyTemplate) => {
    setSelectedTemplateId(tpl.id);
    await applyTemplate(tpl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <LayoutTemplate className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                <span>Galeri Template Studi Kasus</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-1.5 py-0.2 rounded border border-blue-500/30">
                  Ready-to-Use
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Pilih template siap pakai yang dikonfigurasi khusus untuk portofolio software house dan promosi UMKM.
              </p>
            </div>
          </div>

          <button
            onClick={() => setTemplateModalOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="px-6 py-2.5 border-b border-zinc-800/80 bg-zinc-950/30 flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'Semua Kategori' },
            { id: 'fintech', label: '💳 Fintech & Banking' },
            { id: 'saas', label: '📊 SaaS & Dashboard' },
            { id: 'enterprise', label: '🏢 Enterprise & Full-Stack' },
            { id: 'fnb', label: '☕ Kuliner & Resto' },
            { id: 'fashion', label: '👗 Fashion & E-Commerce' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                filter === cat.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className={`rounded-xl border transition-all flex flex-col justify-between overflow-hidden bg-zinc-950/60 hover:border-blue-500/60 group ${
                selectedTemplateId === tpl.id
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-zinc-800'
              }`}
            >
              {/* Card Thumbnail Area */}
              <div
                className={`h-28 bg-gradient-to-br ${tpl.previewColor} p-3.5 flex flex-col justify-between border-b border-zinc-800/60 relative`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-zinc-900/80 text-zinc-300 border border-white/10 uppercase">
                    {tpl.badge}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-zinc-900/60 flex items-center justify-center text-zinc-300 text-xs">
                    {tpl.projectConfig.deviceType === 'phone' ? (
                      <Smartphone className="w-3.5 h-3.5" />
                    ) : tpl.projectConfig.deviceType === 'desktop' ? (
                      <Monitor className="w-3.5 h-3.5" />
                    ) : (
                      <Laptop className="w-3.5 h-3.5" />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-zinc-300 font-mono">
                  <span>{tpl.projectConfig.aspectRatio}</span>
                  <span>·</span>
                  <span>{tpl.projectConfig.duration}s Loop</span>
                  <span>·</span>
                  <span className="capitalize">{tpl.projectConfig.sceneType}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">
                    {tpl.title}
                  </h3>
                  <p className="text-[11px] text-zinc-400 leading-snug mb-4">
                    {tpl.description}
                  </p>
                </div>

                <button
                  onClick={() => handleApply(tpl)}
                  className="w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-blue-600 text-zinc-300 hover:text-white border border-zinc-800 hover:border-blue-500 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer group-hover:shadow-md"
                >
                  <span>Gunakan Template Ini</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-800 bg-zinc-950/60 text-xs text-zinc-500">
          <span>
            💡 Template otomatis menyesuaikan kamera 3D, pencahayaan, teks branding, dan rasio kanvas.
          </span>
          <button
            onClick={() => setTemplateModalOpen(false)}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
