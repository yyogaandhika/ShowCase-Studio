import React, { useEffect } from 'react';
import { Header } from './ui/Header';
import { LeftSidebar } from './ui/LeftSidebar';
import { Viewport3D } from './ui/Viewport3D';
import { RightSidebar } from './ui/RightSidebar';
import { ExportModal } from './ui/ExportModal';
import { ProjectsModal } from './ui/ProjectsModal';
import { BrandKitModal } from './ui/BrandKitModal';
import { ClientReviewModal } from './ui/ClientReviewModal';
import { PricingModal } from './ui/PricingModal';
import { LocalPaymentModal } from './ui/LocalPaymentModal';
import { TemplateGalleryModal } from './ui/TemplateGalleryModal';
import { DiagnosticModal } from './ui/DiagnosticModal';
import { ShortcutsModal } from './ui/ShortcutsModal';
import { PitchModeOverlay } from './ui/PitchModeOverlay';
import { ShareSocialModal } from './ui/ShareSocialModal';
import { OnboardingTourModal } from './ui/OnboardingTourModal';
import { MobileCompanionBanner } from './ui/MobileCompanionBanner';
import { useStore } from './store/useStore';
import { listProjects, saveProject } from './storage/db';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

export const App: React.FC = () => {
  const { project, setProject, isPitchMode } = useStore();

  // Register global studio keyboard shortcuts
  useKeyboardShortcuts();

  useEffect(() => {
    // Check if there are saved projects in IndexedDB
    (async () => {
      try {
        const savedList = await listProjects();
        if (savedList && savedList.length > 0) {
          // Load the most recently modified project
          setProject(savedList[0]);
        } else {
          // Save default initial project
          await saveProject(project);
        }
      } catch (err) {
        console.warn('Error checking existing IndexedDB projects:', err);
      }
    })();
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#09090b] text-zinc-100 font-sans">
      {/* Mobile Responsive Guard (PRD Section 6.3 & 7.2) */}
      <MobileCompanionBanner />

      {/* Top Navigation Bar (Hidden in Pitch Mode) */}
      {!isPitchMode && <Header />}

      {/* Main Studio Workspace */}
      <div
        className={`flex flex-1 overflow-hidden relative ${
          isPitchMode ? 'h-screen' : 'h-[calc(100vh-3.5rem)]'
        }`}
      >
        {/* Left: Scenes & Media Assets (Hidden in Pitch Mode) */}
        {!isPitchMode && <LeftSidebar />}

        {/* Center: Live 3D Viewport with Aspect Framing & Timeline */}
        <Viewport3D />

        {/* Right: Lighting, Backdrop & Customization Controls (Hidden in Pitch Mode) */}
        {!isPitchMode && <RightSidebar />}

        {/* Pitch Mode Keynote Overlay */}
        <PitchModeOverlay />
      </div>

      {/* Modals */}
      <ExportModal />
      <ProjectsModal />
      <BrandKitModal />
      <ClientReviewModal />
      <PricingModal />
      <LocalPaymentModal />
      <TemplateGalleryModal />
      <DiagnosticModal />
      <ShortcutsModal />
      <ShareSocialModal />
      <OnboardingTourModal />
    </div>
  );
};
