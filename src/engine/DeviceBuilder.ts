import * as THREE from 'three';
import { ChassisFinish } from '../types';

export interface DeviceInstance {
  group: THREE.Group;
  screenMesh: THREE.Mesh;
  chassisMaterials: THREE.MeshStandardMaterial[];
  type: 'phone' | 'laptop' | 'tablet' | 'desktop' | 'smartwatch';
  updateChassisColor: (color: string) => void;
  updateChassisFinish: (finish: ChassisFinish) => void;
  dispose: () => void;
}

export function applyFinishToMaterials(
  materials: THREE.MeshStandardMaterial[],
  finish: ChassisFinish
): void {
  let roughness = 0.3;
  let metalness = 0.85;
  switch (finish) {
    case 'matte':
      roughness = 0.65;
      metalness = 0.25;
      break;
    case 'anodized':
      roughness = 0.3;
      metalness = 0.85;
      break;
    case 'ceramic':
      roughness = 0.08;
      metalness = 0.18;
      break;
    case 'chrome':
      roughness = 0.02;
      metalness = 0.98;
      break;
  }
  materials.forEach((m) => {
    m.roughness = roughness;
    m.metalness = metalness;
    m.needsUpdate = true;
  });
}

/**
 * Helper to build a 2D rounded rectangle shape
 */
function createRoundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const shape = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

/**
 * Assigns normalized (0..1) UV coordinates to a flat geometry
 */
function assignNormalizedUVs(geometry: THREE.BufferGeometry, w: number, h: number) {
  const pos = geometry.attributes.position;
  const uvs = new Float32Array((pos.count) * 2);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    uvs[i * 2] = (x + w / 2) / w;
    uvs[i * 2 + 1] = (y + h / 2) / h;
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
}

export class DeviceBuilder {
  /**
   * Builds generic 3D Smartphone
   */
  static buildPhone(initialColor = '#1f2124'): DeviceInstance {
    const group = new THREE.Group();
    const chassisMaterials: THREE.MeshStandardMaterial[] = [];

    const phoneW = 1.05;
    const phoneH = 2.15;
    const phoneD = 0.08;
    const radius = 0.12;

    // Body chassis material (metallic, sleek finish)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(initialColor),
      metalness: 0.85,
      roughness: 0.25,
    });
    chassisMaterials.push(bodyMat);

    // Bezel / inner trim material
    const bezelMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x0a0a0c),
      metalness: 0.2,
      roughness: 0.8,
    });

    // Screen material (emissive/standard with high clarity)
    const screenMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.15,
      metalness: 0.05,
    });

    // 1. Phone Body (Extruded Rounded Rectangle)
    const bodyShape = createRoundedRectShape(phoneW, phoneH, radius);
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: phoneD,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.015,
      bevelThickness: 0.015,
    };
    const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings);
    bodyGeo.center();
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    group.add(bodyMesh);

    // 2. Bezel Border (Smooth Rounded Shape)
    const screenW = phoneW - 0.07;
    const screenH = phoneH - 0.08;
    const screenR = radius - 0.03;
    const bezelShape = createRoundedRectShape(screenW + 0.02, screenH + 0.02, screenR + 0.01);
    const bezelGeo = new THREE.ShapeGeometry(bezelShape, 24);
    const bezelMesh = new THREE.Mesh(bezelGeo, bezelMat);
    bezelMesh.position.z = phoneD / 2 + 0.0151;
    group.add(bezelMesh);

    // 3. Screen Face
    const screenShape = createRoundedRectShape(screenW, screenH, screenR);
    const screenGeo = new THREE.ShapeGeometry(screenShape, 16);
    assignNormalizedUVs(screenGeo, screenW, screenH);
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.z = phoneD / 2 + 0.016;
    group.add(screenMesh);

    // 4. Punch hole / Pill camera notch (top center)
    const notchGeo = new THREE.CapsuleGeometry(0.025, 0.08, 4, 8);
    notchGeo.rotateZ(Math.PI / 2);
    const notchMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
    const notchMesh = new THREE.Mesh(notchGeo, notchMat);
    notchMesh.position.set(0, phoneH / 2 - 0.14, phoneD / 2 + 0.017);
    group.add(notchMesh);

    // 5. Back Camera Island (Sleek minimalist triple lens bump)
    const bumpW = 0.42;
    const bumpH = 0.42;
    const bumpR = 0.08;
    const bumpShape = createRoundedRectShape(bumpW, bumpH, bumpR);
    const bumpGeo = new THREE.ExtrudeGeometry(bumpShape, {
      depth: 0.03,
      bevelEnabled: true,
      bevelSize: 0.01,
      bevelThickness: 0.01,
      bevelSegments: 3,
    });
    bumpGeo.center();
    const bumpMesh = new THREE.Mesh(bumpGeo, bodyMat);
    bumpMesh.position.set(-phoneW / 2 + bumpW / 2 + 0.07, phoneH / 2 - bumpH / 2 - 0.07, -phoneD / 2 - 0.025);
    group.add(bumpMesh);

    // Lens rings
    const ringGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.015, 24);
    ringGeo.rotateX(Math.PI / 2);
    const lensMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.9 });
    const lens1 = new THREE.Mesh(ringGeo, lensMat);
    lens1.position.set(-phoneW / 2 + 0.18, phoneH / 2 - 0.18, -phoneD / 2 - 0.045);
    const lens2 = new THREE.Mesh(ringGeo, lensMat);
    lens2.position.set(-phoneW / 2 + 0.18, phoneH / 2 - 0.35, -phoneD / 2 - 0.045);
    const lens3 = new THREE.Mesh(ringGeo, lensMat);
    lens3.position.set(-phoneW / 2 + 0.35, phoneH / 2 - 0.265, -phoneD / 2 - 0.045);
    group.add(lens1, lens2, lens3);

    return {
      group,
      screenMesh,
      chassisMaterials,
      type: 'phone',
      updateChassisColor: (color: string) => {
        chassisMaterials.forEach((m) => m.color.set(color));
      },
      updateChassisFinish: (finish: ChassisFinish) => {
        applyFinishToMaterials(chassisMaterials, finish);
      },
      dispose: () => {
        group.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose());
            } else {
              obj.material.dispose();
            }
          }
        });
      },
    };
  }

  /**
   * Builds generic 3D Laptop
   */
  static buildLaptop(initialColor = '#1f2124'): DeviceInstance {
    const group = new THREE.Group();
    const chassisMaterials: THREE.MeshStandardMaterial[] = [];

    const laptopW = 2.45;
    const laptopD = 1.65;
    const baseH = 0.055;
    const cornerR = 0.06;

    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(initialColor),
      metalness: 0.88,
      roughness: 0.25,
    });
    chassisMaterials.push(bodyMat);

    const darkAccentMat = new THREE.MeshStandardMaterial({
      color: 0x141417,
      roughness: 0.8,
      metalness: 0.1,
    });

    const screenMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.15,
      metalness: 0.05,
    });

    // --- Base Part ---
    const baseGroup = new THREE.Group();
    const baseShape = createRoundedRectShape(laptopW, laptopD, cornerR);
    const baseGeo = new THREE.ExtrudeGeometry(baseShape, {
      depth: baseH,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.012,
      bevelThickness: 0.012,
    });
    baseGeo.center();
    // Rotate base flat horizontally: X=laptopW, Z=laptopD, Y=baseH
    baseGeo.rotateX(-Math.PI / 2);
    const baseMesh = new THREE.Mesh(baseGeo, bodyMat);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    baseGroup.add(baseMesh);

    // Keyboard well
    const kbW = laptopW * 0.82;
    const kbD = laptopD * 0.44;
    const kbGeo = new THREE.PlaneGeometry(kbW, kbD);
    kbGeo.rotateX(-Math.PI / 2);
    const kbMesh = new THREE.Mesh(kbGeo, darkAccentMat);
    kbMesh.position.set(0, baseH / 2 + 0.013, -laptopD * 0.14);
    baseGroup.add(kbMesh);

    // Trackpad
    const tpW = laptopW * 0.34;
    const tpD = laptopD * 0.32;
    const tpGeo = new THREE.PlaneGeometry(tpW, tpD);
    tpGeo.rotateX(-Math.PI / 2);
    const tpMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(initialColor).lerp(new THREE.Color(0x333333), 0.2),
      metalness: 0.6,
      roughness: 0.3,
    });
    chassisMaterials.push(tpMat);
    const tpMesh = new THREE.Mesh(tpGeo, tpMat);
    tpMesh.position.set(0, baseH / 2 + 0.013, laptopD * 0.28);
    baseGroup.add(tpMesh);

    // Hinge cylinder
    const hingeGeo = new THREE.CylinderGeometry(0.025, 0.025, laptopW * 0.6, 16);
    hingeGeo.rotateZ(Math.PI / 2);
    const hingeMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9, roughness: 0.2 });
    const hingeMesh = new THREE.Mesh(hingeGeo, hingeMat);
    hingeMesh.position.set(0, baseH / 2 + 0.015, -laptopD / 2 + 0.03);
    baseGroup.add(hingeMesh);

    group.add(baseGroup);

    // --- Screen Lid Part (Rotated around Hinge) ---
    const lidGroup = new THREE.Group();
    // Anchor lid hinge at rear edge of base
    lidGroup.position.set(0, baseH / 2 + 0.015, -laptopD / 2 + 0.03);

    const lidH = laptopD * 0.98;
    const lidThickness = 0.035;

    // Lid geometry
    const lidShape = createRoundedRectShape(laptopW, lidH, cornerR);
    const lidGeo = new THREE.ExtrudeGeometry(lidShape, {
      depth: lidThickness,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.01,
      bevelThickness: 0.01,
    });
    lidGeo.center();
    // Offset lid center so (0,0,0) is at bottom hinge
    const lidMesh = new THREE.Mesh(lidGeo, bodyMat);
    lidMesh.position.set(0, lidH / 2, -lidThickness / 2);
    lidMesh.castShadow = true;
    lidGroup.add(lidMesh);

    // Screen bezel & display
    const screenW = laptopW * 0.92;
    const screenH = lidH * 0.88;

    // Bezel
    const bezelGeo = new THREE.PlaneGeometry(screenW + 0.03, screenH + 0.03);
    const bezelMesh = new THREE.Mesh(bezelGeo, darkAccentMat);
    bezelMesh.position.set(0, lidH / 2, 0.0105);
    lidGroup.add(bezelMesh);

    // Screen Face (16:10 standard laptop display)
    const screenGeo = new THREE.PlaneGeometry(screenW, screenH);
    assignNormalizedUVs(screenGeo, screenW, screenH);
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, lidH / 2, 0.011);
    lidGroup.add(screenMesh);

    // Webcam dot at top bezel
    const camGeo = new THREE.CircleGeometry(0.012, 16);
    const camMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
    const camMesh = new THREE.Mesh(camGeo, camMat);
    camMesh.position.set(0, lidH - 0.04, 0.012);
    lidGroup.add(camMesh);

    // Default angle: open ~115 degrees
    lidGroup.rotation.x = THREE.MathUtils.degToRad(-25);

    group.add(lidGroup);

    return {
      group,
      screenMesh,
      chassisMaterials,
      type: 'laptop',
      updateChassisColor: (color: string) => {
        chassisMaterials.forEach((m) => m.color.set(color));
      },
      updateChassisFinish: (finish: ChassisFinish) => {
        applyFinishToMaterials(chassisMaterials, finish);
      },
      dispose: () => {
        group.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose());
            } else {
              obj.material.dispose();
            }
          }
        });
      },
    };
  }

  /**
   * Builds generic 3D Tablet
   */
  static buildTablet(initialColor = '#1f2124'): DeviceInstance {
    const group = new THREE.Group();
    const chassisMaterials: THREE.MeshStandardMaterial[] = [];

    const tabletW = 1.62;
    const tabletH = 2.25;
    const tabletD = 0.06;
    const radius = 0.1;

    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(initialColor),
      metalness: 0.88,
      roughness: 0.25,
    });
    chassisMaterials.push(bodyMat);

    const bezelMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a0d,
      roughness: 0.8,
      metalness: 0.1,
    });

    const screenMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.15,
      metalness: 0.05,
    });

    // 1. Tablet Body
    const bodyShape = createRoundedRectShape(tabletW, tabletH, radius);
    const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, {
      depth: tabletD,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: 0.012,
      bevelThickness: 0.012,
    });
    bodyGeo.center();
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    group.add(bodyMesh);

    // 2. Bezel (Smooth Rounded Shape)
    const screenW = tabletW - 0.12;
    const screenH = tabletH - 0.12;
    const screenR = radius - 0.03;
    const bezelShape = createRoundedRectShape(screenW + 0.02, screenH + 0.02, screenR + 0.01);
    const bezelGeo = new THREE.ShapeGeometry(bezelShape, 24);
    const bezelMesh = new THREE.Mesh(bezelGeo, bezelMat);
    bezelMesh.position.z = tabletD / 2 + 0.0121;
    group.add(bezelMesh);

    // 3. Screen Face (approx 4:3 / modern tablet ratio)
    const screenShape = createRoundedRectShape(screenW, screenH, screenR);
    const screenGeo = new THREE.ShapeGeometry(screenShape, 16);
    assignNormalizedUVs(screenGeo, screenW, screenH);
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.z = tabletD / 2 + 0.0125;
    group.add(screenMesh);

    // 4. Front camera dot (top center)
    const camGeo = new THREE.CircleGeometry(0.015, 16);
    const camMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
    const camMesh = new THREE.Mesh(camGeo, camMat);
    camMesh.position.set(0, tabletH / 2 - 0.04, tabletD / 2 + 0.013);
    group.add(camMesh);

    return {
      group,
      screenMesh,
      chassisMaterials,
      type: 'tablet',
      updateChassisColor: (color: string) => {
        chassisMaterials.forEach((m) => m.color.set(color));
      },
      updateChassisFinish: (finish: ChassisFinish) => {
        applyFinishToMaterials(chassisMaterials, finish);
      },
      dispose: () => {
        group.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose());
            } else {
              obj.material.dispose();
            }
          }
        });
      },
    };
  }

  /**
   * Builds generic 3D Desktop Studio Display (Monitor + Stand)
   */
  static buildDesktop(initialColor = '#1f2124'): DeviceInstance {
    const group = new THREE.Group();
    const chassisMaterials: THREE.MeshStandardMaterial[] = [];

    const monitorW = 2.8;
    const monitorH = 1.68;
    const monitorD = 0.05;
    const cornerR = 0.04;

    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(initialColor),
      metalness: 0.88,
      roughness: 0.25,
    });
    chassisMaterials.push(bodyMat);

    const bezelMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a0d,
      roughness: 0.8,
      metalness: 0.1,
    });

    const screenMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.15,
      metalness: 0.05,
    });

    // 1. Display Enclosure
    const dispShape = createRoundedRectShape(monitorW, monitorH, cornerR);
    const dispGeo = new THREE.ExtrudeGeometry(dispShape, {
      depth: monitorD,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.01,
      bevelThickness: 0.01,
    });
    dispGeo.center();
    const dispMesh = new THREE.Mesh(dispGeo, bodyMat);
    dispMesh.castShadow = true;
    dispMesh.receiveShadow = true;
    group.add(dispMesh);

    // 2. Bezel & Screen Face (16:9 widescreen)
    const screenW = monitorW - 0.08;
    const screenH = monitorH - 0.08;
    const bezelGeo = new THREE.PlaneGeometry(screenW + 0.02, screenH + 0.02);
    const bezelMesh = new THREE.Mesh(bezelGeo, bezelMat);
    bezelMesh.position.z = monitorD / 2 + 0.011;
    group.add(bezelMesh);

    const screenGeo = new THREE.PlaneGeometry(screenW, screenH);
    assignNormalizedUVs(screenGeo, screenW, screenH);
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.z = monitorD / 2 + 0.0115;
    group.add(screenMesh);

    // 3. Desktop Stand (Arm + Base Plate)
    const standMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(initialColor).lerp(new THREE.Color(0xd1d5db), 0.3),
      metalness: 0.85,
      roughness: 0.2,
    });
    chassisMaterials.push(standMat);

    // Angled stand arm
    const armGeo = new THREE.BoxGeometry(0.18, 1.25, 0.08);
    armGeo.rotateX(THREE.MathUtils.degToRad(-12));
    const armMesh = new THREE.Mesh(armGeo, standMat);
    armMesh.position.set(0, -0.45, -0.2);
    armMesh.castShadow = true;
    group.add(armMesh);

    // Heavy flat base plate
    const basePlateShape = createRoundedRectShape(0.95, 0.75, 0.08);
    const basePlateGeo = new THREE.ExtrudeGeometry(basePlateShape, {
      depth: 0.025,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.008,
      bevelThickness: 0.008,
    });
    basePlateGeo.center();
    basePlateGeo.rotateX(-Math.PI / 2);
    const basePlateMesh = new THREE.Mesh(basePlateGeo, standMat);
    basePlateMesh.position.set(0, -1.02, 0.05);
    basePlateMesh.castShadow = true;
    basePlateMesh.receiveShadow = true;
    group.add(basePlateMesh);

    return {
      group,
      screenMesh,
      chassisMaterials,
      type: 'desktop',
      updateChassisColor: (color: string) => {
        chassisMaterials.forEach((m) => m.color.set(color));
      },
      updateChassisFinish: (finish: ChassisFinish) => {
        applyFinishToMaterials(chassisMaterials, finish);
      },
      dispose: () => {
        group.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose());
            } else {
              obj.material.dispose();
            }
          }
        });
      },
    };
  }

  /**
   * Builds generic 3D Smartwatch
   */
  static buildSmartwatch(initialColor = '#1f2124'): DeviceInstance {
    const group = new THREE.Group();
    const chassisMaterials: THREE.MeshStandardMaterial[] = [];

    const watchW = 1.05;
    const watchH = 1.22;
    const watchD = 0.22;
    const cornerR = 0.32;

    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(initialColor),
      metalness: 0.9,
      roughness: 0.2,
    });
    chassisMaterials.push(bodyMat);

    const bezelMat = new THREE.MeshStandardMaterial({
      color: 0x050507,
      roughness: 0.9,
      metalness: 0.1,
    });

    const screenMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.12,
      metalness: 0.05,
    });

    // 1. Curved Watch Case (Extruded Rounded Rectangle with smooth bevel)
    const watchShape = createRoundedRectShape(watchW, watchH, cornerR);
    const bevelSize = 0.035;
    const watchGeo = new THREE.ExtrudeGeometry(watchShape, {
      depth: watchD,
      bevelEnabled: true,
      bevelSegments: 6,
      bevelSize: bevelSize,
      bevelThickness: bevelSize,
    });
    watchGeo.center();
    const watchMesh = new THREE.Mesh(watchGeo, bodyMat);
    watchMesh.castShadow = true;
    watchMesh.receiveShadow = true;
    group.add(watchMesh);

    // Front face Z level is watchD/2 + bevelSize
    const frontZ = watchD / 2 + bevelSize;

    // 2. Bezel Border (Smooth Rounded Shape matching watch curve - NEVER PlaneGeometry!)
    const bezelW = watchW - 0.08;
    const bezelH = watchH - 0.08;
    const bezelR = cornerR - 0.04;
    const bezelShape = createRoundedRectShape(bezelW, bezelH, bezelR);
    const bezelGeo = new THREE.ShapeGeometry(bezelShape, 32);
    const bezelMesh = new THREE.Mesh(bezelGeo, bezelMat);
    bezelMesh.position.z = frontZ + 0.001;
    group.add(bezelMesh);

    // 3. OLED Curved Screen (Smooth Rounded Shape strictly inside bezel)
    const screenW = bezelW - 0.06;
    const screenH = bezelH - 0.06;
    const screenR = bezelR - 0.03;
    const screenShape = createRoundedRectShape(screenW, screenH, screenR);
    const screenGeo = new THREE.ShapeGeometry(screenShape, 32);
    assignNormalizedUVs(screenGeo, screenW, screenH);
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.z = frontZ + 0.002;
    group.add(screenMesh);

    // 4. Digital Crown Button (right side)
    const crownGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.08, 32);
    crownGeo.rotateZ(Math.PI / 2);
    const crownMesh = new THREE.Mesh(crownGeo, bodyMat);
    crownMesh.position.set(watchW / 2 + 0.05, 0.15, 0);
    group.add(crownMesh);

    // Side flush button below crown
    const sideBtnGeo = new THREE.BoxGeometry(0.03, 0.26, 0.08);
    const sideBtn = new THREE.Mesh(sideBtnGeo, bodyMat);
    sideBtn.position.set(watchW / 2 + 0.02, -0.16, 0);
    group.add(sideBtn);

    // 5. Matte Silicone Strap Lugs (Top & Bottom)
    const strapMat = new THREE.MeshStandardMaterial({
      color: 0x141416,
      roughness: 0.92,
      metalness: 0.05,
    });

    const strapTopGeo = new THREE.BoxGeometry(0.72, 0.65, 0.12);
    const strapTop = new THREE.Mesh(strapTopGeo, strapMat);
    strapTop.position.set(0, watchH / 2 + 0.3, -0.05);
    strapTop.rotation.x = THREE.MathUtils.degToRad(-14);
    group.add(strapTop);

    const strapBottomGeo = new THREE.BoxGeometry(0.72, 0.65, 0.12);
    const strapBottom = new THREE.Mesh(strapBottomGeo, strapMat);
    strapBottom.position.set(0, -watchH / 2 - 0.3, -0.05);
    strapBottom.rotation.x = THREE.MathUtils.degToRad(14);
    group.add(strapBottom);

    return {
      group,
      screenMesh,
      chassisMaterials,
      type: 'smartwatch',
      updateChassisColor: (color: string) => {
        chassisMaterials.forEach((m) => m.color.set(color));
      },
      updateChassisFinish: (finish: ChassisFinish) => {
        applyFinishToMaterials(chassisMaterials, finish);
      },
      dispose: () => {
        group.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose());
            } else {
              obj.material.dispose();
            }
          }
        });
      },
    };
  }
}
