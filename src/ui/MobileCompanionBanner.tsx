import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone, Copy, Check, X } from 'lucide-react';

export const MobileCompanionBanner: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  if (!isMobile || isDismissed) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 border-b border-indigo-500/40 text-white px-4 py-2.5 shadow-2xl flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
          <Monitor className="w-4 h-4 text-blue-300" />
        </div>
        <div className="truncate">
          <p className="font-semibold text-white truncate text-[11px]">
            Mode Pratinjau Mobile (Sesuai PRD)
          </p>
          <p className="text-[10px] text-blue-200 truncate">
            Editor 3D penuh & ekspor video 4K dirancang optimal di desktop Chrome/Edge.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/15 hover:bg-white/25 text-white font-medium text-[11px] transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-300" />
              <span>Tersalin</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Salin Link PC</span>
            </>
          )}
        </button>

        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
