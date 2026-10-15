import React from 'react';
import {
  ShoppingBag,
  Tag,
  Flame,
  Truck,
  ShieldCheck,
  Star,
  Sparkles,
  PhoneCall,
  ExternalLink,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTranslation } from '../i18n/useTranslation';
import { UmkmBadgeType, UmkmCtaChannel, UmkmThemePreset } from '../types';

export const UmkmEtalasePanel: React.FC = () => {
  const { project, setUmkmOverlay, applyUmkmPreset } = useStore();
  const { t } = useTranslation();

  const umkm = project.umkmOverlay || {
    enabled: false,
    storeName: 'Toko Resmi UMKM',
    badgeType: 'flash_sale',
    customBadgeText: 'Promo Kilat 50%',
    originalPrice: 'Rp 199.000',
    salePrice: 'Rp 99.000',
    discountPercent: '50% OFF',
    ctaChannel: 'whatsapp',
    ctaContact: '0812-3456-7890',
    position: 'bottom-card',
    themePreset: 'flash_sale',
  };

  const presets: { id: UmkmThemePreset; label: string; icon: string }[] = [
    { id: 'flash_sale', label: t.umkmPresetFlashSale, icon: '🔥' },
    { id: 'food_beverage', label: t.umkmPresetFood, icon: '☕' },
    { id: 'fashion_apparel', label: t.umkmPresetFashion, icon: '👗' },
    { id: 'tech_gadget', label: t.umkmPresetTech, icon: '📱' },
    { id: 'beauty_skincare', label: t.umkmPresetBeauty, icon: '✨' },
  ];

  const badges: { id: UmkmBadgeType; label: string }[] = [
    { id: 'flash_sale', label: t.umkmBadgeFlashSale },
    { id: 'gratis_ongkir', label: t.umkmBadgeGratisOngkir },
    { id: 'cod', label: t.umkmBadgeCod },
    { id: 'best_seller', label: t.umkmBadgeBestSeller },
    { id: 'garansi_resmi', label: t.umkmBadgeGaransiResmi },
    { id: 'diskon_spesial', label: t.umkmBadgeDiskonSpesial },
  ];

  const channels: { id: UmkmCtaChannel; label: string; color: string }[] = [
    { id: 'whatsapp', label: 'WhatsApp', color: 'text-green-400' },
    { id: 'shopee', label: 'Shopee', color: 'text-orange-400' },
    { id: 'tokopedia', label: 'Tokopedia', color: 'text-emerald-400' },
    { id: 'tiktok', label: 'TikTok Shop', color: 'text-zinc-200' },
    { id: 'website', label: 'Website', color: 'text-blue-400' },
  ];

  return (
    <section className="border-t border-zinc-800/80 pt-4">
      {/* Header & Toggle */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <ShoppingBag className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
            {t.umkmSectionTitle}
          </span>
          <span className="text-[9px] bg-orange-500/20 text-orange-400 font-bold px-1.5 py-0.2 rounded border border-orange-500/30">
            Fase 5
          </span>
        </div>

        <button
          onClick={() => setUmkmOverlay({ enabled: !umkm.enabled })}
          className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            umkm.enabled ? 'bg-orange-500' : 'bg-zinc-800'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              umkm.enabled ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <p className="text-[10px] text-zinc-500 mb-3 leading-relaxed">
        {t.umkmModeDesc}
      </p>

      {umkm.enabled && (
        <div className="space-y-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3">
          {/* Quick Presets */}
          <div>
            <span className="text-[10px] font-semibold text-zinc-400 block mb-1.5">
              {t.umkmPresets}
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {presets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyUmkmPreset(p.id)}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-left text-[10px] font-medium transition-all ${
                    umkm.themePreset === p.id
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-sm'
                      : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
                  }`}
                >
                  <span>{p.icon}</span>
                  <span className="truncate">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Store Name */}
          <div>
            <label className="text-[10px] font-semibold text-zinc-400 block mb-1">
              {t.umkmStoreName}
            </label>
            <input
              type="text"
              value={umkm.storeName}
              onChange={(e) => setUmkmOverlay({ storeName: e.target.value })}
              placeholder="e.g. Kopi Kenangan Senja"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-zinc-400 block mb-1">
                {t.umkmPriceOriginal}
              </label>
              <input
                type="text"
                value={umkm.originalPrice}
                onChange={(e) => setUmkmOverlay({ originalPrice: e.target.value })}
                placeholder="Rp 199.000"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-400 placeholder-zinc-600 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-zinc-400 block mb-1">
                {t.umkmPriceSale}
              </label>
              <input
                type="text"
                value={umkm.salePrice}
                onChange={(e) => setUmkmOverlay({ salePrice: e.target.value })}
                placeholder="Rp 99.000"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-emerald-400 placeholder-zinc-600 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Discount Badge & Position */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-zinc-400 block mb-1">
                {t.umkmDiscountBadge}
              </label>
              <input
                type="text"
                value={umkm.discountPercent}
                onChange={(e) =>
                  setUmkmOverlay({ discountPercent: e.target.value })
                }
                placeholder="50% OFF"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-rose-400 placeholder-zinc-600 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-zinc-400 block mb-1">
                Posisi Banner
              </label>
              <select
                value={umkm.position}
                onChange={(e) =>
                  setUmkmOverlay({
                    position: e.target.value as 'bottom-card' | 'top-banner',
                  })
                }
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-orange-500"
              >
                <option value="bottom-card">Bawah (Bottom Card)</option>
                <option value="top-banner">Atas (Top Banner)</option>
              </select>
            </div>
          </div>

          {/* Promo Badge Selector */}
          <div>
            <label className="text-[10px] font-semibold text-zinc-400 block mb-1">
              {t.umkmBadgePromo}
            </label>
            <select
              value={umkm.badgeType}
              onChange={(e) =>
                setUmkmOverlay({
                  badgeType: e.target.value as UmkmBadgeType,
                  customBadgeText: undefined,
                })
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-amber-300 focus:outline-none focus:border-orange-500 mb-1.5"
            >
              {badges.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={umkm.customBadgeText || ''}
              onChange={(e) =>
                setUmkmOverlay({ customBadgeText: e.target.value })
              }
              placeholder="Atau tulis teks badge kustom..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-[11px] text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Order Channel (CTA) */}
          <div>
            <label className="text-[10px] font-semibold text-zinc-400 block mb-1">
              {t.umkmCtaChannel}
            </label>
            <div className="grid grid-cols-3 gap-1 mb-2">
              {channels.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setUmkmOverlay({ ctaChannel: c.id })}
                  className={`px-1.5 py-1 rounded text-center text-[10px] font-semibold transition-all ${
                    umkm.ctaChannel === c.id
                      ? 'bg-zinc-800 text-white border border-zinc-600'
                      : 'bg-zinc-950 text-zinc-400 hover:bg-zinc-800 border border-zinc-900'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={umkm.ctaContact}
              onChange={(e) => setUmkmOverlay({ ctaContact: e.target.value })}
              placeholder={
                umkm.ctaChannel === 'whatsapp'
                  ? 'Nomor WhatsApp (misal: 0812-3456-7890)'
                  : 'Link / Username Toko'
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>
      )}
    </section>
  );
};
