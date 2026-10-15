import React from 'react';
import { X, Command, Play, RotateCcw, Video, Compass, Volume2, Layout, FolderOpen, LayoutTemplate, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTranslation } from '../i18n/useTranslation';

export const ShortcutsModal: React.FC = () => {
  const { isShortcutsModalOpen, setShortcutsModalOpen } = useStore();
  const { language } = useTranslation();

  if (!isShortcutsModalOpen) return null;

  const isId = language === 'id';

  const shortcutGroups = [
    {
      category: isId ? 'Playback & Kamera 3D' : 'Playback & 3D Camera',
      shortcuts: [
        {
          key: 'Space',
          desc: isId ? 'Putar atau jeda animasi 3D' : 'Play or pause 3D animation',
          icon: <Play className="w-3.5 h-3.5 text-blue-400" />,
        },
        {
          key: 'R',
          desc: isId ? 'Ulangi animasi ke awal (00:00)' : 'Rewind animation to start (00:00)',
          icon: <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />,
        },
        {
          key: 'F',
          desc: isId ? 'Beralih mode orbit kamera bebas' : 'Toggle free orbit camera mode',
          icon: <Compass className="w-3.5 h-3.5 text-amber-400" />,
        },
      ],
    },
    {
      category: isId ? 'Audio & Soundtrack' : 'Audio & Soundtrack',
      shortcuts: [
        {
          key: 'M',
          desc: isId ? 'Bisukan / aktifkan suara musik latar' : 'Mute / unmute background soundtrack',
          icon: <Volume2 className="w-3.5 h-3.5 text-cyan-400" />,
        },
      ],
    },
    {
      category: isId ? 'Aspek Rasio Kanvas' : 'Canvas Aspect Ratio',
      shortcuts: [
        {
          key: '1',
          desc: isId ? 'Ganti ke rasio 16:9 (Landscape YouTube)' : 'Switch to 16:9 Landscape (YouTube)',
          icon: <Layout className="w-3.5 h-3.5 text-purple-400" />,
        },
        {
          key: '2',
          desc: isId ? 'Ganti ke rasio 9:16 (Reels & TikTok)' : 'Switch to 9:16 Portrait (Reels & TikTok)',
          icon: <Layout className="w-3.5 h-3.5 text-purple-400" />,
        },
        {
          key: '3',
          desc: isId ? 'Ganti ke rasio 1:1 (Square Feed)' : 'Switch to 1:1 Square (Instagram Feed)',
          icon: <Layout className="w-3.5 h-3.5 text-purple-400" />,
        },
      ],
    },
    {
      category: isId ? 'Aksi Cepat Studio' : 'Quick Studio Actions',
      shortcuts: [
        {
          key: 'E',
          desc: isId ? 'Buka modal ekspor video WebCodecs' : 'Open WebCodecs video export modal',
          icon: <Video className="w-3.5 h-3.5 text-blue-400" />,
        },
        {
          key: 'P',
          desc: isId ? 'Buka browser proyek tersimpan' : 'Open saved projects browser',
          icon: <FolderOpen className="w-3.5 h-3.5 text-zinc-400" />,
        },
        {
          key: 'T',
          desc: isId ? 'Buka galeri template portofolio agensi' : 'Open agency portfolio template gallery',
          icon: <LayoutTemplate className="w-3.5 h-3.5 text-indigo-400" />,
        },
        {
          key: 'B',
          desc: isId ? 'Buka pengaturan Brand Kit agensi' : 'Open agency brand kit settings',
          icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" />,
        },
        {
          key: '?',
          desc: isId ? 'Buka panduan tombol pintas ini' : 'Open this keyboard shortcuts guide',
          icon: <Command className="w-3.5 h-3.5 text-emerald-400" />,
        },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/90 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Command className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">
                {isId ? 'Tombol Pintas Keyboard' : 'Keyboard Shortcuts'}
              </h2>
              <p className="text-xs text-zinc-400">
                {isId
                  ? 'Navigasi cepat dan kontrol studio profesional tanpa mouse'
                  : 'Fast studio navigation and pro controls right from your keyboard'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShortcutsModalOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {shortcutGroups.map((group) => (
            <div key={group.category} className="space-y-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                {group.category}
              </h3>
              <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl divide-y divide-zinc-800/60 overflow-hidden">
                {group.shortcuts.map((sc) => (
                  <div
                    key={sc.key}
                    className="flex items-center justify-between px-3.5 py-2.5 hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      {sc.icon}
                      <span className="text-xs text-zinc-200">{sc.desc}</span>
                    </div>
                    <kbd className="px-2.5 py-1 text-[11px] font-mono font-bold text-zinc-300 bg-zinc-800 border border-zinc-700/80 rounded shadow-sm shadow-black/40">
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-900/30 flex items-center justify-between text-xs text-zinc-400">
          <span>{isId ? 'Tekan ? kapan saja untuk membuka' : 'Press ? anytime to open'}</span>
          <button
            onClick={() => setShortcutsModalOpen(false)}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition-colors"
          >
            {isId ? 'Tutup' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
