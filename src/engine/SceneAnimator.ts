import * as THREE from 'three';
import { CameraAnglePreset, DeviceType, SceneType } from '../types';

export interface SceneFrameState {
  cameraPosition: THREE.Vector3;
  cameraLookAt: THREE.Vector3;
  primaryPosition: THREE.Vector3;
  primaryRotation: THREE.Euler;
  secondaryPosition?: THREE.Vector3;
  secondaryRotation?: THREE.Euler;
  secondaryVisible?: boolean;
}

export class SceneAnimator {
  /**
   * Computes the complete 3D scene state for normalized time t in [0, 1]
   */
  public static evaluate(
    sceneType: SceneType,
    t: number, // 0 to 1
    deviceType: DeviceType,
    zoomFocus: { x: number; y: number } = { x: 0.5, y: 0.5 }
  ): SceneFrameState {
    // 2 * PI * t for seamless loop cycles
    const phase = t * Math.PI * 2;
    const sinPhase = Math.sin(phase);
    const cosPhase = Math.cos(phase);

    // Adjust base camera distance depending on device scale
    const baseDist =
      deviceType === 'desktop'
        ? 5.4
        : deviceType === 'laptop'
        ? 4.6
        : deviceType === 'tablet'
        ? 4.2
        : deviceType === 'smartwatch'
        ? 2.8
        : 3.8;

    switch (sceneType) {
      case 'hero': {
        // Floating single device with gentle rotation and breathing motion
        const floatY = Math.sin(phase) * 0.12;
        const rotY = Math.sin(phase) * 0.32; // ~18 deg oscillation
        const rotX = Math.cos(phase) * 0.1 - 0.05; // slight tilt
        const rotZ = Math.sin(phase * 0.5) * 0.04;

        // Camera gentle drift
        const camX = Math.sin(phase) * 0.2;
        const camY = 0.15 + Math.cos(phase) * 0.08;
        const camZ = baseDist + Math.sin(phase * 2) * 0.08;

        return {
          cameraPosition: new THREE.Vector3(camX, camY, camZ),
          cameraLookAt: new THREE.Vector3(0, 0, 0),
          primaryPosition: new THREE.Vector3(0, floatY, 0),
          primaryRotation: new THREE.Euler(rotX, rotY, rotZ),
          secondaryVisible: false,
        };
      }

      case 'duo': {
        // Laptop & Phone side by side
        const commonFloat = Math.sin(phase) * 0.08;

        // Laptop position & subtle yaw
        const laptopPos = new THREE.Vector3(-0.85, commonFloat, -0.4);
        const laptopRot = new THREE.Euler(0.04, 0.22 + sinPhase * 0.06, 0);

        // Phone position & subtle counter-tilt
        const phonePos = new THREE.Vector3(1.15, -0.1 + commonFloat * 1.2, 0.4);
        const phoneRot = new THREE.Euler(-0.06, -0.28 - sinPhase * 0.08, 0.04);

        // Camera framing both devices
        const camX = 0.2 + Math.sin(phase) * 0.25;
        const camY = 0.35 + Math.cos(phase) * 0.1;
        const camZ = 5.2;

        return {
          cameraPosition: new THREE.Vector3(camX, camY, camZ),
          cameraLookAt: new THREE.Vector3(0.15, 0.05, 0),
          primaryPosition: laptopPos,
          primaryRotation: laptopRot,
          secondaryPosition: phonePos,
          secondaryRotation: phoneRot,
          secondaryVisible: true,
        };
      }

      case 'zoom': {
        // Feature Zoom: Camera swoops from establishing angle into a close-up macro view
        const zoomWeight = 0.5 - 0.5 * Math.cos(phase);

        // Target screen focus in device space
        const targetX = (zoomFocus.x - 0.5) * 0.6;
        const targetY =
          (zoomFocus.y - 0.5) *
          (deviceType === 'phone'
            ? 1.4
            : deviceType === 'smartwatch'
            ? 0.5
            : 0.8);

        const wideCamPos = new THREE.Vector3(0.5, 0.3, baseDist);
        const closeCamPos = new THREE.Vector3(
          targetX + 0.1,
          targetY,
          deviceType === 'smartwatch' ? 0.95 : 1.35
        );

        const currentCamPos = new THREE.Vector3().lerpVectors(
          wideCamPos,
          closeCamPos,
          zoomWeight
        );

        const wideLookAt = new THREE.Vector3(0, 0, 0);
        const closeLookAt = new THREE.Vector3(targetX, targetY, 0.1);
        const currentLookAt = new THREE.Vector3().lerpVectors(
          wideLookAt,
          closeLookAt,
          zoomWeight
        );

        const devFloatY = Math.sin(phase) * 0.05;
        const devRotY = Math.sin(phase) * 0.08 * (1 - zoomWeight * 0.6);

        return {
          cameraPosition: currentCamPos,
          cameraLookAt: currentLookAt,
          primaryPosition: new THREE.Vector3(0, devFloatY, 0),
          primaryRotation: new THREE.Euler(0, devRotY, 0),
          secondaryVisible: false,
        };
      }

      case 'portfolio': {
        // Isometric-style angled portfolio presentation
        const floatY = Math.sin(phase) * 0.1;
        const baseRotX = 0.26;
        const baseRotY = -0.55 + Math.sin(phase) * 0.12;
        const baseRotZ = 0.14;

        const camX = 0.8 + Math.cos(phase) * 0.2;
        const camY = 0.7 + Math.sin(phase) * 0.1;
        const camZ = baseDist + 0.2;

        return {
          cameraPosition: new THREE.Vector3(camX, camY, camZ),
          cameraLookAt: new THREE.Vector3(0, -0.05, 0),
          primaryPosition: new THREE.Vector3(0, floatY, 0),
          primaryRotation: new THREE.Euler(baseRotX, baseRotY, baseRotZ),
          secondaryVisible: false,
        };
      }

      case 'orbit': {
        // 360-degree turntable presentation showing all profile angles
        const camX = Math.sin(phase) * (baseDist * 1.05);
        const camZ = Math.cos(phase) * (baseDist * 1.05);
        const camY = 0.35 + Math.sin(phase * 2) * 0.2;

        const devFloatY = Math.sin(phase * 2) * 0.08;
        const devTiltX = Math.cos(phase) * 0.06;

        return {
          cameraPosition: new THREE.Vector3(camX, camY, camZ),
          cameraLookAt: new THREE.Vector3(0, 0.05, 0),
          primaryPosition: new THREE.Vector3(0, devFloatY, 0),
          primaryRotation: new THREE.Euler(devTiltX, 0, 0),
          secondaryVisible: false,
        };
      }

      case 'drift': {
        // Dramatic low-angle cinematic glide & tracking shot
        const camX = -1.2 + Math.sin(phase) * 1.6;
        const camY = -0.25 + Math.cos(phase * 0.5) * 0.45;
        const camZ = baseDist * 0.85 + Math.cos(phase) * 0.35;

        const lookX = Math.sin(phase) * 0.3;
        const lookY = 0.1;

        const devRotY = -0.25 + Math.sin(phase) * 0.2;
        const devRotX = 0.12 + Math.cos(phase) * 0.08;

        return {
          cameraPosition: new THREE.Vector3(camX, camY, camZ),
          cameraLookAt: new THREE.Vector3(lookX, lookY, 0),
          primaryPosition: new THREE.Vector3(0, Math.sin(phase) * 0.1, 0),
          primaryRotation: new THREE.Euler(devRotX, devRotY, -0.05),
          secondaryVisible: false,
        };
      }

      case 'story_reel': {
        // Multi-Shot Cinematic Director Reel (Fase 12)
        return SceneAnimator.evaluateStoryReel(t, deviceType, zoomFocus, baseDist);
      }
    }
  }

  /**
   * Multi-Shot Story Reel (Fase 12 Cinematic Director)
   * Evaluates a 3-act sequence:
   * 1. Act I (0.00 - 0.33): Establishing Orbit & Drift
   * 2. Act II (0.33 - 0.67): Macro Feature Zoom & Spotlight
   * 3. Act III (0.67 - 1.00): Isometric 3D Showcase & Hero Settle
   */
  private static evaluateStoryReel(
    t: number,
    deviceType: DeviceType,
    zoomFocus: { x: number; y: number },
    baseDist: number
  ): SceneFrameState {
    if (t < 0.333) {
      // --- ACT I: Establishing Orbit Glide ---
      const subT = t / 0.333;
      const angle = -0.6 + subT * 1.1; // Smooth yaw sweep
      const camX = Math.sin(angle) * (baseDist * 0.95);
      const camZ = Math.cos(angle) * (baseDist * 0.95);
      const camY = 0.25 + Math.sin(subT * Math.PI) * 0.15;

      const devFloatY = Math.sin(subT * Math.PI) * 0.08;
      const devRotY = Math.sin(angle) * 0.25;
      const devRotX = 0.08 - subT * 0.04;

      return {
        cameraPosition: new THREE.Vector3(camX, camY, camZ),
        cameraLookAt: new THREE.Vector3(0, 0, 0),
        primaryPosition: new THREE.Vector3(0, devFloatY, 0),
        primaryRotation: new THREE.Euler(devRotX, devRotY, 0),
        secondaryVisible: false,
      };
    } else if (t < 0.666) {
      // --- ACT II: Macro Feature Zoom Spotlight ---
      const subT = (t - 0.333) / 0.333;
      // Smooth bell curve for zoom depth
      const zoomWeight = Math.sin(subT * Math.PI);

      const targetX = (zoomFocus.x - 0.5) * 0.6;
      const targetY =
        (zoomFocus.y - 0.5) *
        (deviceType === 'phone'
          ? 1.4
          : deviceType === 'smartwatch'
          ? 0.5
          : 0.8);

      const wideCamPos = new THREE.Vector3(0.3, 0.2, baseDist * 0.9);
      const closeCamPos = new THREE.Vector3(
        targetX + 0.08,
        targetY,
        deviceType === 'smartwatch' ? 1.0 : 1.4
      );

      const camPos = new THREE.Vector3().lerpVectors(wideCamPos, closeCamPos, zoomWeight);
      const lookAt = new THREE.Vector3().lerpVectors(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(targetX, targetY, 0.1),
        zoomWeight
      );

      const devTiltY = Math.sin(subT * Math.PI) * 0.06;

      return {
        cameraPosition: camPos,
        cameraLookAt: lookAt,
        primaryPosition: new THREE.Vector3(0, Math.sin(subT * Math.PI * 2) * 0.03, 0),
        primaryRotation: new THREE.Euler(0.04, devTiltY, 0),
        secondaryVisible: false,
      };
    } else {
      // --- ACT III: Isometric Showcase & Hero Settle ---
      const subT = (t - 0.666) / 0.334;
      const ease = 1 - Math.pow(1 - subT, 3); // Cubic ease out

      const camX = 0.75 + Math.sin(subT * Math.PI * 0.5) * 0.15;
      const camY = 0.65 - ease * 0.1;
      const camZ = baseDist + 0.15;

      const baseRotX = 0.22 - ease * 0.04;
      const baseRotY = -0.52 + Math.sin(subT * Math.PI) * 0.1;
      const baseRotZ = 0.1 - ease * 0.03;

      const floatY = Math.sin(subT * Math.PI) * 0.06;

      return {
        cameraPosition: new THREE.Vector3(camX, camY, camZ),
        cameraLookAt: new THREE.Vector3(0, -0.05, 0),
        primaryPosition: new THREE.Vector3(0, floatY, 0),
        primaryRotation: new THREE.Euler(baseRotX, baseRotY, baseRotZ),
        secondaryVisible: false,
      };
    }
  }

  /**
   * Computes static 3D state for studio camera perspective presets (Fase 11)
   */
  public static evaluateStaticAngle(
    anglePreset: CameraAnglePreset,
    deviceType: DeviceType
  ): SceneFrameState {
    const baseDist =
      deviceType === 'desktop'
        ? 5.4
        : deviceType === 'laptop'
        ? 4.6
        : deviceType === 'tablet'
        ? 4.2
        : deviceType === 'smartwatch'
        ? 2.8
        : 3.8;

    switch (anglePreset) {
      case 'front':
        return {
          cameraPosition: new THREE.Vector3(0, 0, baseDist),
          cameraLookAt: new THREE.Vector3(0, 0, 0),
          primaryPosition: new THREE.Vector3(0, 0, 0),
          primaryRotation: new THREE.Euler(0, 0, 0),
          secondaryVisible: false,
        };

      case 'isometric_left':
        return {
          cameraPosition: new THREE.Vector3(-baseDist * 0.48, baseDist * 0.38, baseDist * 0.88),
          cameraLookAt: new THREE.Vector3(0, 0, 0),
          primaryPosition: new THREE.Vector3(0, 0, 0),
          primaryRotation: new THREE.Euler(0.12, 0.48, -0.06),
          secondaryVisible: false,
        };

      case 'isometric_right':
        return {
          cameraPosition: new THREE.Vector3(baseDist * 0.48, baseDist * 0.38, baseDist * 0.88),
          cameraLookAt: new THREE.Vector3(0, 0, 0),
          primaryPosition: new THREE.Vector3(0, 0, 0),
          primaryRotation: new THREE.Euler(0.12, -0.48, 0.06),
          secondaryVisible: false,
        };

      case 'low_angle':
        return {
          cameraPosition: new THREE.Vector3(0.35, -0.65, baseDist * 0.82),
          cameraLookAt: new THREE.Vector3(0, 0.2, 0),
          primaryPosition: new THREE.Vector3(0, 0.08, 0),
          primaryRotation: new THREE.Euler(-0.06, -0.22, 0.02),
          secondaryVisible: false,
        };

      case 'flatlay':
        return {
          cameraPosition: new THREE.Vector3(0, baseDist * 1.15, 0.25),
          cameraLookAt: new THREE.Vector3(0, 0, 0),
          primaryPosition: new THREE.Vector3(0, 0, 0),
          primaryRotation: new THREE.Euler(0, 0, 0),
          secondaryVisible: false,
        };
    }
  }
}
