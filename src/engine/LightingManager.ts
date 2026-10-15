import * as THREE from 'three';
import { LightingPreset } from '../types';

export class LightingManager {
  private group: THREE.Group;
  private ambientLight: THREE.AmbientLight;
  private keyLight: THREE.DirectionalLight;
  private fillLight: THREE.DirectionalLight;
  private rimLight: THREE.DirectionalLight;
  private shadowPlane: THREE.Mesh;

  constructor() {
    this.group = new THREE.Group();

    // Ambient light
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.group.add(this.ambientLight);

    // Key light (casts soft shadow)
    this.keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    this.keyLight.position.set(4, 6, 5);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.keyLight.shadow.camera.near = 0.5;
    this.keyLight.shadow.camera.far = 25;
    this.keyLight.shadow.camera.left = -4;
    this.keyLight.shadow.camera.right = 4;
    this.keyLight.shadow.camera.top = 4;
    this.keyLight.shadow.camera.bottom = -4;
    this.keyLight.shadow.bias = -0.0001;
    this.group.add(this.keyLight);

    // Fill light
    this.fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.fillLight.position.set(-5, 2, 4);
    this.group.add(this.fillLight);

    // Rim light (edge reflection)
    this.rimLight = new THREE.DirectionalLight(0xffffff, 1.5);
    this.rimLight.position.set(0, 5, -6);
    this.group.add(this.rimLight);

    // Ground shadow receiver plane (semi-transparent soft contact shadow)
    const shadowGeo = new THREE.PlaneGeometry(14, 14);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.28 });
    this.shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowPlane.rotation.x = -Math.PI / 2;
    this.shadowPlane.position.y = -1.5;
    this.shadowPlane.receiveShadow = true;
    this.group.add(this.shadowPlane);

    // Apply default studio preset
    this.applyPreset('studio');
  }

  private currentShadowIntensity = 0.6;
  private currentContactShadow = true;

  public getGroup(): THREE.Group {
    return this.group;
  }

  public setShadowPlaneY(y: number): void {
    this.shadowPlane.position.y = y;
  }

  public setShadowIntensity(intensity: number): void {
    this.currentShadowIntensity = Math.max(0, Math.min(1, intensity));
    this.updateShadowMaterial();
  }

  public setGroundContactShadow(enabled: boolean): void {
    this.currentContactShadow = enabled;
    this.updateShadowMaterial();
  }

  private updateShadowMaterial(): void {
    const mat = this.shadowPlane.material as THREE.ShadowMaterial;
    if (!this.currentContactShadow || this.currentShadowIntensity <= 0.01) {
      this.shadowPlane.visible = false;
      mat.opacity = 0;
    } else {
      this.shadowPlane.visible = true;
      mat.opacity = 0.45 * this.currentShadowIntensity;
    }
    mat.needsUpdate = true;
  }

  public applyPreset(preset: LightingPreset): void {
    switch (preset) {
      case 'studio':
        this.ambientLight.color.set(0xffffff);
        this.ambientLight.intensity = 0.9;

        this.keyLight.color.set(0xfbfaff);
        this.keyLight.intensity = 2.2;
        this.keyLight.position.set(4, 6, 5);

        this.fillLight.color.set(0xe0e7ff);
        this.fillLight.intensity = 1.0;
        this.fillLight.position.set(-5, 3, 4);

        this.rimLight.color.set(0xffffff);
        this.rimLight.intensity = 1.8;
        this.rimLight.position.set(2, 5, -5);
        (this.shadowPlane.material as THREE.ShadowMaterial).opacity = 0.28;
        break;

      case 'neon':
        this.ambientLight.color.set(0x1e1b4b);
        this.ambientLight.intensity = 0.6;

        // Electric cyan key
        this.keyLight.color.set(0x00f0ff);
        this.keyLight.intensity = 2.8;
        this.keyLight.position.set(4, 5, 4);

        // Neon magenta fill
        this.fillLight.color.set(0xff0077);
        this.fillLight.intensity = 2.4;
        this.fillLight.position.set(-5, 2, 3);

        // Violet rim
        this.rimLight.color.set(0x9d4edd);
        this.rimLight.intensity = 2.2;
        this.rimLight.position.set(0, 4, -5);
        (this.shadowPlane.material as THREE.ShadowMaterial).opacity = 0.45;
        break;

      case 'sunset':
        this.ambientLight.color.set(0x451a03);
        this.ambientLight.intensity = 0.7;

        // Golden warm key
        this.keyLight.color.set(0xffaa40);
        this.keyLight.intensity = 3.0;
        this.keyLight.position.set(5, 4, 4);

        // Amber/Peach fill
        this.fillLight.color.set(0xfb7185);
        this.fillLight.intensity = 1.2;
        this.fillLight.position.set(-4, 2, 4);

        // Twilight lavender rim
        this.rimLight.color.set(0x818cf8);
        this.rimLight.intensity = 1.6;
        this.rimLight.position.set(1, 5, -5);
        (this.shadowPlane.material as THREE.ShadowMaterial).opacity = 0.35;
        break;
    }
  }

  public dispose(): void {
    this.shadowPlane.geometry.dispose();
    (this.shadowPlane.material as THREE.Material).dispose();
  }
}
