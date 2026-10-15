import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { getEngineInstance } from '../engine/engineInstance';

export function useKeyboardShortcuts() {
  const {
    isPlaying,
    setIsPlaying,
    setCurrentTime,
    isFreeCamera,
    setIsFreeCamera,
    setAspectRatio,
    setExportModalOpen,
    setProjectsModalOpen,
    setBrandKitModalOpen,
    setTemplateModalOpen,
    setShortcutsModalOpen,
    isPitchMode,
    setIsPitchMode,
    toggleAudioMute,
  } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in form inputs
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Space: Play / Pause
      if (e.code === 'Space') {
        e.preventDefault();
        const engine = getEngineInstance();
        if (!engine) return;
        if (isPlaying) {
          engine.pause();
          setIsPlaying(false);
        } else {
          engine.play();
          setIsPlaying(true);
          setIsFreeCamera(false);
        }
        return;
      }

      // R: Rewind to start
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setCurrentTime(0);
        const engine = getEngineInstance();
        if (engine) engine.setTime(0);
        return;
      }

      // F: Toggle Free Orbit Camera
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        const engine = getEngineInstance();
        if (engine) {
          const isFree = engine.toggleFreeCamera();
          setIsFreeCamera(isFree);
          if (isFree) setIsPlaying(false);
        }
        return;
      }

      // M: Mute / Unmute Audio
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleAudioMute();
        return;
      }

      // 1, 2, 3: Aspect Ratio Switching
      if (e.key === '1') {
        e.preventDefault();
        setAspectRatio('16:9');
        return;
      }
      if (e.key === '2') {
        e.preventDefault();
        setAspectRatio('9:16');
        return;
      }
      if (e.key === '3') {
        e.preventDefault();
        setAspectRatio('1:1');
        return;
      }

      // E: Export Video Modal
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        setExportModalOpen(true);
        return;
      }

      // P: Projects Modal
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setProjectsModalOpen(true);
        return;
      }

      // T: Template Gallery Modal
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setTemplateModalOpen(true);
        return;
      }

      // B: Brand Kit Modal
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        setBrandKitModalOpen(true);
        return;
      }

      // ?: Shortcuts Cheat Sheet
      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault();
        setShortcutsModalOpen(true);
        return;
      }

      // F10: Toggle Pitch Mode
      if (e.key === 'F10') {
        e.preventDefault();
        setIsPitchMode(!isPitchMode);
        return;
      }

      // Escape: Exit Pitch Mode
      if (e.key === 'Escape' && isPitchMode) {
        e.preventDefault();
        setIsPitchMode(false);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    isPlaying,
    isFreeCamera,
    isPitchMode,
    setIsPlaying,
    setCurrentTime,
    setIsFreeCamera,
    setAspectRatio,
    setExportModalOpen,
    setProjectsModalOpen,
    setBrandKitModalOpen,
    setTemplateModalOpen,
    setShortcutsModalOpen,
    setIsPitchMode,
    toggleAudioMute,
  ]);
}
