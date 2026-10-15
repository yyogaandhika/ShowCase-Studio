import React, { useRef } from 'react';
import { X, Sparkles, Upload, Palette, Check, ShieldCheck } from 'lucide-react';
import { useStore } from '../store/useStore';

export const BrandKitModal: React.FC = () => {
  const {
    brandKit,
    isBrandKitModalOpen,
    setBrandKitModalOpen,
    updateBrandKit,
    applyBrandKitToProject,
  } = useStore();

  const logoInputRef = useRef<HTMLInputElement>(null);

  if (!isBrandKitModalOpen) return null;

  const handleLogoUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    updateBrandKit({ agencyLogoUrl: url });
  };

  const handleApplyToProject = () => {
    applyBrandKitToProject();
    setBrandKitModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-semibold text-zinc-100">
              Agency Brand Kit
            </h2>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.5 rounded border border-indigo-500/30">
              Fase 4
            </span>
          </div>
          <button
            onClick={() => setBrandKitModalOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          <p className="text-xs text-zinc-400">
            Configure your digital agency's branding assets once. They are
            automatically applied to all client showcase deliverables.
          </p>

          {/* Agency Name */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1.5">
              Agency Name
            </label>
            <input
              type="text"
              value={brandKit.agencyName}
              onChange={(e) => updateBrandKit({ agencyName: e.target.value })}
              placeholder="e.g. Nexa Digital Studio"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Agency Logo */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1.5">
              Official Agency Logo (PNG / SVG)
            </label>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/svg+xml,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleLogoUpload(f);
              }}
            />
            {brandKit.agencyLogoUrl ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="flex items-center gap-3">
                  <img
                    src={brandKit.agencyLogoUrl}
                    alt="Agency Logo"
                    className="h-8 max-w-[120px] object-contain"
                  />
                  <span className="text-xs text-zinc-300 font-medium">
                    Logo Active
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200"
                  >
                    Change
                  </button>
                  <button
                    onClick={() => updateBrandKit({ agencyLogoUrl: null })}
                    className="text-xs text-red-400 hover:underline px-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => logoInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-zinc-700 hover:border-indigo-500 text-xs text-zinc-400 hover:text-indigo-300 bg-zinc-950/40 transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Agency Logo</span>
              </button>
            )}
          </div>

          {/* Custom Watermark (Agency White-Labeling) */}
          <div className="bg-zinc-950/50 p-3.5 rounded-xl border border-zinc-800/80 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Agency White-Label Watermark</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">
                  Watermark Badge Text
                </label>
                <input
                  type="text"
                  value={brandKit.customWatermarkText}
                  onChange={(e) =>
                    updateBrandKit({ customWatermarkText: e.target.value })
                  }
                  placeholder="e.g. Crafted by Nexa Studio"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">
                  Agency Website URL
                </label>
                <input
                  type="text"
                  value={brandKit.customWatermarkUrl}
                  onChange={(e) =>
                    updateBrandKit({ customWatermarkUrl: e.target.value })
                  }
                  placeholder="e.g. nexastudio.io"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Brand Colors */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1.5">
              Brand Signature Colors
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-xs text-zinc-300">Primary Color</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-500">
                    {brandKit.primaryColor}
                  </span>
                  <input
                    type="color"
                    value={brandKit.primaryColor}
                    onChange={(e) =>
                      updateBrandKit({ primaryColor: e.target.value })
                    }
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-xs text-zinc-300">Secondary Accent</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-500">
                    {brandKit.secondaryColor}
                  </span>
                  <input
                    type="color"
                    value={brandKit.secondaryColor}
                    onChange={(e) =>
                      updateBrandKit({ secondaryColor: e.target.value })
                    }
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-800 bg-zinc-950/50">
          <button
            onClick={handleApplyToProject}
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply to Current Showcase</span>
          </button>
          <button
            onClick={() => setBrandKitModalOpen(false)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            Save Brand Kit
          </button>
        </div>
      </div>
    </div>
  );
};
