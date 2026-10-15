import React from 'react';
import { X, Check, Zap, Users, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import { LicenseTier } from '../types';

export const PricingModal: React.FC = () => {
  const {
    activeLicenseTier,
    isPricingModalOpen,
    setPricingModalOpen,
    setActiveLicenseTier,
    startCheckout,
  } = useStore();

  if (!isPricingModalOpen) return null;

  const handleSelectTier = (tier: LicenseTier) => {
    if (tier === 'free') {
      setActiveLicenseTier('free');
      setPricingModalOpen(false);
    } else {
      setPricingModalOpen(false);
      startCheckout(tier, 'monthly', tier === 'agency' ? 499000 : 149000);
    }
  };

  const plans: {
    id: LicenseTier;
    name: string;
    badge?: string;
    price: string;
    period: string;
    desc: string;
    features: string[];
    highlight?: boolean;
  }[] = [
    {
      id: 'free',
      name: 'Gratis (Starter)',
      price: 'Rp 0',
      period: 'Gratis selamanya',
      desc: 'Mesin pertumbuhan organik untuk mencoba 3D showcase di browser.',
      features: [
        '3 Model Perangkat Standar',
        'Semua adegan dasar',
        'Ekspor PNG & WebM 1080p',
        'Proyek tersimpan lokal di browser',
        'Watermark Showcase Studio',
      ],
    },
    {
      id: 'pro',
      name: 'Pro (Individu)',
      badge: 'Popular',
      price: 'Rp 149.000',
      period: 'per bulan / kreator',
      desc: 'Untuk desainer freelance dan developer independen.',
      features: [
        'Semua fitur paket Gratis',
        'Tanpa Watermark (100% Bersih)',
        'Ekspor Native MP4 & WebM',
        'Kualitas 4K Ultra HD',
        'One-Click Batch Multi-Rasio',
        '5 Model Perangkat (Termasuk Monitor & Watch)',
      ],
    },
    {
      id: 'agency',
      name: 'Tim / Agensi',
      badge: 'Fase 4',
      price: 'Rp 499.000',
      period: 'per tim / bulan',
      desc: 'Untuk software house & agensi digital yang menangani banyak klien.',
      features: [
        'Semua fitur paket Pro',
        'Agency Brand Kit (Logo & Warna Resmi)',
        'White-Label Custom Watermark Agensi',
        'Tautan Persetujuan Klien (Client Approval Link)',
        'Log Revisi & Feedback Klien',
        'Ekspor & Impor Cadangan Proyek (.showcase)',
        'Prioritas Rendering & Lisensi Komersial',
      ],
      highlight: true,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-950/60">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-zinc-100">
                Pilihan Lisensi Showcase Studio
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Sesuai spesifikasi Dokumen PRD Bagian 11 (Model Bisnis & Harga)
            </p>
          </div>
          <button
            onClick={() => setPricingModalOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Plan Cards Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto">
          {plans.map((p) => {
            const isCurrent = activeLicenseTier === p.id;
            return (
              <div
                key={p.id}
                className={`relative rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                  p.highlight
                    ? 'bg-gradient-to-b from-indigo-950/40 via-zinc-900 to-zinc-950 border-indigo-500/60 shadow-xl shadow-indigo-500/10'
                    : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                {p.badge && (
                  <span
                    className={`absolute -top-2.5 right-4 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border shadow-xs ${
                      p.highlight
                        ? 'bg-indigo-600 border-indigo-400 text-white'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                    }`}
                  >
                    {p.badge}
                  </span>
                )}

                <div>
                  <h3 className="text-sm font-bold text-zinc-100 mb-1">
                    {p.name}
                  </h3>
                  <p className="text-[11px] text-zinc-400 leading-snug mb-3">
                    {p.desc}
                  </p>

                  <div className="mb-4">
                    <span className="text-2xl font-black text-white">
                      {p.price}
                    </span>
                    <span className="text-[11px] text-zinc-400 ml-1">
                      {p.period}
                    </span>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {p.features.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-zinc-300 leading-snug"
                      >
                        <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleSelectTier(p.id)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      : p.highlight
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20'
                  }`}
                >
                  {isCurrent ? 'Paket Aktif Saat Ini' : `Aktifkan ${p.name}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-950/60 text-xs text-zinc-500">
          <span>
            💡 Mode simulasi lisensi aktif. Klik paket untuk mengganti status lisensi.
          </span>
          <button
            onClick={() => setPricingModalOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
