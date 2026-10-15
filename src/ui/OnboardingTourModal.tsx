import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Upload,
  Film,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Play,
} from 'lucide-react';
import { useStore } from '../store/useStore';

export const OnboardingTourModal: React.FC = () => {
  const { isOnboardingOpen, setOnboardingOpen, setTemplateModalOpen } = useStore();
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOnboardingOpen) return null;

  const steps = [
    {
      stepNumber: 1,
      title: 'Pilih Model Perangkat 3D',
      desc: 'Pilih dari 5 model generik berstandar agensi: Smartphone, MacBook Laptop, iPad Tablet, Desktop iMac, atau Smartwatch di panel kiri.',
      badge: 'Langkah 1 dari 4',
      icon: <Smartphone className="w-8 h-8 text-blue-400" />,
      actionText: 'Lanjut ke Aset Layar',
      tip: '💡 Tip: Gunakan mode "Duo" untuk menampilkan Laptop dan Smartphone berdampingan.',
    },
    {
      stepNumber: 2,
      title: 'Unggah Konten Layar (Gambar / Rekaman Video)',
      desc: 'Tarik & lepas file gambar (PNG/JPG) atau rekaman layar langsung (MP4/WebM) dari aplikasi Anda. Konten akan langsung dipetakan ke layar 3D secara fotorealistis.',
      badge: 'Langkah 2 dari 4',
      icon: <Upload className="w-8 h-8 text-emerald-400" />,
      actionText: 'Lanjut ke Sinematik',
      tip: '💡 Tip: Anda juga dapat menggunakan 4 sampel demo siap pakai (Fintech, F&B, Fashion, Gadget).',
    },
    {
      stepNumber: 3,
      title: 'Pilih Sinematik & Musik Pengiring',
      desc: 'Pilih dari 6 adegan animasi kamera: Hero, Duo, Feature Zoom, Portfolio, Orbit 360, atau Drift. Hidupkan musik pengiring procedural di bilah pemutar bawah.',
      badge: 'Langkah 3 dari 4',
      icon: <Sparkles className="w-8 h-8 text-amber-400" />,
      actionText: 'Lanjut ke Ekspor',
      tip: '💡 Tip: Tekan Spasi untuk Putar/Jeda dan tombol F untuk beralih ke kamera bebas orbit.',
    },
    {
      stepNumber: 4,
      title: 'Ekspor Video 4K & Bagikan ke Klien',
      desc: 'Rilis video showcase resolusi 1080p atau 4K MP4 dalam rasio 16:9, 9:16 (Reels/TikTok), atau 1:1. Lengkap dengan tautan peninjauan klien dan template copywriting sosial.',
      badge: 'Langkah 4 dari 4',
      icon: <Film className="w-8 h-8 text-indigo-400" />,
      actionText: 'Mulai Berkarya Sekarang 🚀',
      tip: '💡 Tip: Gunakan fitur "Batch Export Multi-Rasio" untuk mengekspor 3 ukuran sekaligus dalam 1 klik!',
    },
  ];

  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setOnboardingOpen(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl shadow-black/90 overflow-hidden flex flex-col">
        {/* Header Progress Bar */}
        <div className="h-1 bg-zinc-800 w-full">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Top Info */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {step.badge}
            </span>
            <button
              onClick={() => setOnboardingOpen(false)}
              className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Icon & Title */}
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-inner shrink-0">
              {step.icon}
            </div>
            <div className="space-y-1.5">
              <h2 className="text-base font-bold text-zinc-100">{step.title}</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">{step.desc}</p>
            </div>
          </div>

          {/* Tip Box */}
          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-[11px] text-zinc-300">
            {step.tip}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 pt-2">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`h-2 rounded-full transition-all ${
                  currentStep === i ? 'w-6 bg-blue-500' : 'w-2 bg-zinc-800 hover:bg-zinc-700'
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800/80">
            <button
              disabled={currentStep === 0}
              onClick={handlePrev}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white transition-colors disabled:opacity-0 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setOnboardingOpen(false);
                  setTemplateModalOpen(true);
                }}
                className="px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Pilih Template Saja
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all cursor-pointer active:scale-95"
              >
                <span>{step.actionText}</span>
                {currentStep < steps.length - 1 ? (
                  <ArrowRight className="w-3.5 h-3.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
