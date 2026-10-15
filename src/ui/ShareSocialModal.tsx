import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Download,
  Camera,
  MessageSquare,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { getEngineInstance } from '../engine/engineInstance';

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.39 9.74v-8.37H5.07v8.37h2.78z" />
  </svg>
);

const TwitterIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.176L2 22l4.981-1.41A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.64 0-3.17-.48-4.46-1.31l-.32-.2-3.19.9 1-3.11-.21-.34A8.17 8.17 0 0 1 3.8 12c0-4.52 3.68-8.2 8.2-8.2 4.52 0 8.2 3.68 8.2 8.2 0 4.52-3.68 8.2-8.2 8.2z" />
  </svg>
);

export const ShareSocialModal: React.FC = () => {
  const { project, isShareModalOpen, setShareModalOpen } = useStore();
  const [activeTab, setActiveTab] = useState<'linkedin' | 'twitter' | 'instagram' | 'whatsapp'>('linkedin');
  const [copied, setCopied] = useState(false);
  const [isCapturingBanner, setIsCapturingBanner] = useState(false);

  if (!isShareModalOpen) return null;

  const clientText = project.clientName || 'Our Client';
  const projectTitle = project.name;

  // Social Copy Templates
  const copyTemplates = {
    linkedin: `🚀 Excited to unveil our latest digital product case study for ${clientText}: "${projectTitle}"!

We engineered this solution focusing on high-performance architecture, fluid micro-interactions, and a bespoke user experience. 

✨ Key Highlights:
• Interactive 3D visual showcase with multi-device responsiveness
• Ultra-fast render pipeline & seamless user workflows
• Scalable design system built for modern enterprise standards

Check out the 3D cinematic preview attached below. What do you think of this visual direction?

#SoftwareHouse #WebDesign #ProductDesign #UIUX #Engineering #TechInnovation #3DShowcase`,

    twitter: `Unveiling our newest client project: "${projectTitle}" for ${clientText} ⚡️

Built with cutting-edge 3D visual tech, sub-millisecond responsiveness, and high-conversion UX.

Watch the full 4K render below 👇
#buildinpublic #indiehackers #webdev #design`,

    instagram: `Next-level 3D showcase for "${projectTitle}" ✨📱

Swipe to inspect the details. Crafted with precision for ${clientText}. 

Need a high-converting mobile or web app for your business? Send us a DM or visit the link in bio! 💬🚀

#appdesign #uidesign #webdevelopment #softwarehouse #startup #tech #3danimation #creativecoding`,

    whatsapp: `Halo ${clientText},

Berikut kami kirimkan pratinjau hasil render visual showcase 3D untuk proyek "${projectTitle}".

Video showcase resolusi tinggi ini siap digunakan untuk materi portofolio, proposal, dan media sosial resmi. Silakan ditinjau dan beri tahu kami jika ada masukan lebih lanjut.

Terima kasih atas kerja samanya! 🙏✨`,
  };

  const handleCopy = () => {
    const text = copyTemplates[activeTab];
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSocialBanner = async () => {
    const engine = getEngineInstance();
    if (!engine) return;
    setIsCapturingBanner(true);
    try {
      // Standard LinkedIn / OpenGraph landscape 1200x630
      const blob = await engine.captureSnapshot(1200, 630);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}-social-banner-1200x630.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to capture social banner:', e);
    } finally {
      setIsCapturingBanner(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">
                Pusat Distribusi & Media Sosial (Showcase Hub)
              </h2>
              <p className="text-xs text-zinc-400">
                Template copywriting siap kirim untuk LinkedIn, Twitter, Reels, dan WhatsApp
              </p>
            </div>
          </div>
          <button
            onClick={() => setShareModalOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/20 px-6 pt-2">
          {[
            { id: 'linkedin', label: 'LinkedIn', icon: <LinkedinIcon className="w-3.5 h-3.5 text-blue-400" /> },
            { id: 'twitter', label: 'Twitter / X', icon: <TwitterIcon className="w-3.5 h-3.5 text-zinc-200" /> },
            { id: 'instagram', label: 'Reels / IG', icon: <InstagramIcon className="w-3.5 h-3.5 text-pink-400" /> },
            { id: 'whatsapp', label: 'WhatsApp Klien', icon: <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-400" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Copy Content Box */}
        <div className="p-6 space-y-4">
          <div className="relative">
            <textarea
              readOnly
              value={copyTemplates[activeTab]}
              rows={8}
              className="w-full bg-zinc-900/70 border border-zinc-800 rounded-xl p-3.5 text-xs text-zinc-200 font-mono leading-relaxed focus:outline-none resize-none shadow-inner"
            />
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all cursor-pointer active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
            </button>
          </div>

          {/* Social Banner Download Card */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-200">
                  Banner Sosial Media (1200 × 630 px)
                </div>
                <div className="text-[11px] text-zinc-500">
                  Format gambar OpenGraph ideal untuk LinkedIn & X cards
                </div>
              </div>
            </div>

            <button
              disabled={isCapturingBanner}
              onClick={handleDownloadSocialBanner}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isCapturingBanner ? 'Mengambil...' : 'Unduh PNG'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-900/30 flex items-center justify-between text-xs text-zinc-400">
          <span>Gunakan template ini untuk memamerkan karya dan menarik klien baru</span>
          <button
            onClick={() => setShareModalOpen(false)}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
