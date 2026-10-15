import React, { useState, useRef, useEffect } from 'react';
import {
  FolderOpen,
  Camera,
  Film,
  Pencil,
  Check,
  Sparkles,
  Users,
  ShieldCheck,
  ShoppingBag,
  Globe,
  LayoutTemplate,
  Activity,
  MoreHorizontal,
  Command,
  Presentation,
  Share2,
  HelpCircle,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { AspectRatio, ProjectStatus } from '../types';
import { getEngineInstance } from '../engine/engineInstance';
import { useTranslation } from '../i18n/useTranslation';

export const Header: React.FC = () => {
  const {
    project,
    activeLicenseTier,
    updateProjectName,
    setProjectStatus,
    setAspectRatio,
    setExportModalOpen,
    setProjectsModalOpen,
    setBrandKitModalOpen,
    setClientReviewModalOpen,
    setPricingModalOpen,
    setUmkmOverlay,
    setTemplateModalOpen,
    setDiagnosticModalOpen,
    setShortcutsModalOpen,
    setIsPitchMode,
    setShareModalOpen,
    setOnboardingOpen,
  } = useStore();

  const { t, language, setLanguage } = useTranslation();

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(project.name);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    if (isMoreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMoreMenuOpen]);

  const handleFinishEditing = () => {
    if (tempName.trim()) {
      updateProjectName(tempName.trim());
    } else {
      setTempName(project.name);
    }
    setIsEditingName(false);
  };

  const handleSnapshot = async () => {
    const engine = getEngineInstance();
    if (!engine) return;
    try {
      const blob = await engine.captureSnapshot(1920, 1080);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}-snapshot.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Snapshot failed:', err);
    }
  };

  const getStatusColor = (status?: ProjectStatus) => {
    switch (status) {
      case 'approved':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'revision_requested':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'in_review':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default:
        return 'text-zinc-400 bg-zinc-800 border-zinc-700';
    }
  };

  return (
    <header className="h-14 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md px-5 flex items-center justify-between z-30 select-none">
      {/* 1. Left: Brand & Project Identity */}
      <div className="flex items-center gap-3">
        {/* Brand Logo & License */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
            <span className="font-black text-sm tracking-tighter text-white">3D</span>
          </div>
          <span className="font-bold text-sm tracking-tight text-zinc-100 hidden sm:inline">
            {t.appTitle}
          </span>
          <button
            onClick={() => setPricingModalOpen(true)}
            className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20 transition-colors flex items-center gap-1 cursor-pointer"
            title="Status Lisensi Studio"
          >
            <ShieldCheck className="w-3 h-3 text-indigo-400" />
            <span>{activeLicenseTier}</span>
          </button>
        </div>

        <div className="h-4 w-[1px] bg-zinc-800 mx-1 hidden md:block" />

        {/* Project & Template Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setProjectsModalOpen(true)}
            title="Buka Daftar Proyek Tersimpan"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/70 transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{t.projects}</span>
          </button>

          <button
            onClick={() => setTemplateModalOpen(true)}
            title="Buka Galeri Template Portofolio Siap Pakai"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-950/40 transition-colors border border-blue-500/20"
          >
            <LayoutTemplate className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">Template</span>
          </button>

          <span className="text-zinc-700 hidden lg:inline">/</span>

          {/* Project Title inline edit */}
          {isEditingName ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleFinishEditing}
                onKeyDown={(e) => e.key === 'Enter' && handleFinishEditing()}
                autoFocus
                className="bg-zinc-900 border border-blue-500 rounded px-2 py-0.5 text-xs text-zinc-100 focus:outline-none w-40"
              />
              <button
                onClick={handleFinishEditing}
                className="p-1 text-blue-400 hover:text-blue-300"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setTempName(project.name);
                setIsEditingName(true);
              }}
              title="Klik untuk mengubah nama proyek"
              className="group flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors max-w-[150px] truncate"
            >
              <span className="truncate">{project.name}</span>
              <Pencil className="w-3 h-3 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}

          {/* Workflow Status badge selector */}
          <select
            value={project.status || 'draft'}
            onChange={(e) => setProjectStatus(e.target.value as any)}
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border focus:outline-none cursor-pointer hidden lg:inline-block ${getStatusColor(
              project.status
            )}`}
          >
            <option value="draft" className="bg-zinc-900 text-zinc-300">
              ● {t.statusDraft}
            </option>
            <option value="in_review" className="bg-zinc-900 text-amber-300">
              ● {t.statusInReview}
            </option>
            <option value="approved" className="bg-zinc-900 text-emerald-300">
              ● {t.statusApproved}
            </option>
            <option value="revision_requested" className="bg-zinc-900 text-rose-300">
              ● {t.statusRevisionRequested}
            </option>
          </select>
        </div>
      </div>

      {/* 2. Center: Aspect Ratio Selector */}
      <div className="flex items-center bg-zinc-900/90 border border-zinc-800/80 p-0.5 rounded-lg text-xs shadow-inner">
        {(['16:9', '9:16', '1:1'] as AspectRatio[]).map((ratio) => (
          <button
            key={ratio}
            onClick={() => setAspectRatio(ratio)}
            className={`px-3 py-1 rounded-md font-mono text-[11px] transition-all ${
              project.aspectRatio === ratio
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {ratio}
          </button>
        ))}
      </div>

      {/* 3. Right: Client Review, More Options Menu, Export CTA */}
      <div className="flex items-center gap-3">
        {/* Client Review Portal Button */}
        <button
          onClick={() => setClientReviewModalOpen(true)}
          title="Buka Portal Tinjauan & Persetujuan Klien"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900/80 border border-zinc-800 hover:border-emerald-500/60 text-zinc-300 hover:text-emerald-300 transition-all cursor-pointer"
        >
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">{t.clientReview}</span>
        </button>

        {/* More Options Dropdown (...) */}
        <div className="relative" ref={moreMenuRef}>
          <button
            onClick={() => setIsMoreMenuOpen((prev) => !prev)}
            title="Menu & Opsi Tambahan"
            className={`p-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              isMoreMenuOpen
                ? 'bg-zinc-800 border-zinc-600 text-white'
                : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {isMoreMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl p-1.5 space-y-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              {/* Agency Brand Kit */}
              <button
                onClick={() => {
                  setBrandKitModalOpen(true);
                  setIsMoreMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors text-left cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                <div className="flex-1">
                  <div>{t.brandKit}</div>
                  <div className="text-[10px] text-zinc-500">Logo & watermark agensi</div>
                </div>
              </button>

              {/* Hardware & GPU Diagnostics */}
              <button
                onClick={() => {
                  setDiagnosticModalOpen(true);
                  setIsMoreMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors text-left cursor-pointer"
              >
                <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex-1">
                  <div>Diagnostik Sistem</div>
                  <div className="text-[10px] text-zinc-500">GPU & WebCodecs benchmark</div>
                </div>
              </button>

              {/* Snapshot PNG */}
              <button
                onClick={() => {
                  handleSnapshot();
                  setIsMoreMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors text-left cursor-pointer"
              >
                <Camera className="w-4 h-4 text-zinc-400 shrink-0" />
                <div className="flex-1">
                  <div>Ambil Foto (PNG)</div>
                  <div className="text-[10px] text-zinc-500">Download snapshot 1080p</div>
                </div>
              </button>

              <div className="h-[1px] bg-zinc-800 my-1" />

              {/* Language Switcher */}
              <button
                onClick={() => {
                  setLanguage(language === 'id' ? 'en' : 'id');
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Bahasa / Language</span>
                </div>
                <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {language === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}
                </span>
              </button>

              {/* UMKM Showcase Toggle Quick Link */}
              <button
                onClick={() => {
                  setUmkmOverlay({ enabled: !project.umkmOverlay?.enabled });
                  setIsMoreMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>Etalase UMKM</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    project.umkmOverlay?.enabled
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {project.umkmOverlay?.enabled ? 'AKTIF' : 'NONAKTIF'}
                </span>
              </button>

              <div className="h-[1px] bg-zinc-800 my-1" />

              {/* Pitch Presentation Mode */}
              <button
                onClick={() => {
                  setIsPitchMode(true);
                  setIsMoreMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Presentation className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Mode Pitch Klien</span>
                </div>
                <kbd className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                  F10
                </kbd>
              </button>

              {/* Share Social & Client Hub */}
              <button
                onClick={() => {
                  setShareModalOpen(true);
                  setIsMoreMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors text-left cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-blue-400 shrink-0" />
                <div className="flex-1">
                  <div>Bagikan ke Medsos</div>
                  <div className="text-[10px] text-zinc-500">Copywriter LinkedIn & Reels</div>
                </div>
              </button>

              {/* Onboarding Tour */}
              <button
                onClick={() => {
                  setOnboardingOpen(true);
                  setIsMoreMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors text-left cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="flex-1">
                  <div>Panduan Alur Kerja</div>
                  <div className="text-[10px] text-zinc-500">4 langkah mudah studio</div>
                </div>
              </button>

              {/* Keyboard Shortcuts */}
              <button
                onClick={() => {
                  setShortcutsModalOpen(true);
                  setIsMoreMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Command className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Tombol Pintas</span>
                </div>
                <kbd className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                  ?
                </kbd>
              </button>
            </div>
          )}
        </div>

        {/* Primary CTA: Export Video */}
        <button
          onClick={() => setExportModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md shadow-blue-600/25 active:scale-95 cursor-pointer"
        >
          <Film className="w-3.5 h-3.5" />
          <span>{t.exportVideo}</span>
        </button>
      </div>
    </header>
  );
};
