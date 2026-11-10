import * as THREE from 'three';
import { VehicleDefinition } from './VehicleRegistry';

export class Vehicle3DModel {
  public group: THREE.Group;
  public bodyMeshGroup: THREE.Group;

  public frontLeftWheel: THREE.Group;
  public frontRightWheel: THREE.Group;
  public rearLeftWheel: THREE.Group;
  public rearRightWheel: THREE.Group;

  private frontLeftSpin: THREE.Group;
  private frontRightSpin: THREE.Group;
  private rearLeftSpin: THREE.Group;
  private rearRightSpin: THREE.Group;

  public leftHeadlightSpot: THREE.SpotLight;
  public rightHeadlightSpot: THREE.SpotLight;
  private headlightMaterial: THREE.MeshStandardMaterial;
  private taillightMaterial: THREE.MeshStandardMaterial;
  private reverseLightMaterial: THREE.MeshStandardMaterial;
  private bodyMaterial: THREE.MeshStandardMaterial;

  public definition: VehicleDefinition;

  constructor(definition: VehicleDefinition, primaryColorHex: string = '#f5f7fa') {
    this.definition = definition;
    this.group = new THREE.Group();
    this.bodyMeshGroup = new THREE.Group();
    this.group.add(this.bodyMeshGroup);

    // Primary Body Paint
    this.bodyMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(primaryColorHex),
      metalness: 0.85,
      roughness: 0.2,
    });

    const darkTrimMaterial = new THREE.MeshStandardMaterial({
      color: 0x111417,
      roughness: 0.6,
      metalness: 0.4,
    });

    const glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x141a24,
      roughness: 0.08,
      metalness: 0.92,
      transparent: true,
      opacity: 0.85,
    });

    const somalilandGreen = new THREE.MeshStandardMaterial({
      color: 0x0c6834,
      metalness: 0.8,
      roughness: 0.2,
    });

    const somalilandRed = new THREE.MeshStandardMaterial({
      color: 0xc8102e,
      metalness: 0.8,
      roughness: 0.2,
    });

    const starMaterial = new THREE.MeshStandardMaterial({
      color: 0x050505,
      roughness: 0.3,
    });

    const { width: w, height: h, length: l } = definition.dimensions;

    // Build specific vehicle geometry
    switch (definition.category) {
      case 'minibus': {
        // High roof Toyota HiAce style Caasi
        const mainBody = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.75, l), this.bodyMaterial);
        mainBody.position.set(0, 0.9, 0);
        mainBody.castShadow = true;
        this.bodyMeshGroup.add(mainBody);

        // Somaliland Green & Red stripe banner across sides
        const sideStripeG = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, 0.14, l * 0.96), somalilandGreen);
        sideStripeG.position.set(0, 0.8, 0);
        this.bodyMeshGroup.add(sideStripeG);

        const sideStripeR = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, 0.12, l * 0.96), somalilandRed);
        sideStripeR.position.set(0, 0.66, 0);
        this.bodyMeshGroup.add(sideStripeR);

        // Flat front windshield
        const windshield = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.9, 0.8), glassMaterial);
        windshield.position.set(0, 1.45, -l / 2 - 0.01);
        windshield.rotation.y = Math.PI;
        this.bodyMeshGroup.add(windshield);

        // Side passenger windows
        const sideWinL = new THREE.Mesh(new THREE.PlaneGeometry(l * 0.65, 0.6), glassMaterial);
        sideWinL.position.set(-w / 2 - 0.01, 1.35, 0.2);
        sideWinL.rotation.y = -Math.PI / 2;
        this.bodyMeshGroup.add(sideWinL);

        const sideWinR = new THREE.Mesh(new THREE.PlaneGeometry(l * 0.65, 0.6), glassMaterial);
        sideWinR.position.set(w / 2 + 0.01, 1.35, 0.2);
        sideWinR.rotation.y = Math.PI / 2;
        this.bodyMeshGroup.add(sideWinR);

        // Roof destination placard (e.g., "HARGEYSA - INA AFWEYNE")
        const roofSign = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 0.05), somalilandGreen);
        roofSign.position.set(0, h + 0.1, -l / 2 + 0.4);
        this.bodyMeshGroup.add(roofSign);
        break;
      }

      case 'pickup': {
        // Heavy duty pickup truck with cab and open cargo bed
        const cabLength = l * 0.52;
        const bedLength = l * 0.44;

        // Front cab
        const cabMesh = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.7, cabLength), this.bodyMaterial);
        cabMesh.position.set(0, 0.85, -l * 0.22);
        cabMesh.castShadow = true;
        this.bodyMeshGroup.add(cabMesh);

        // Cargo bed
        const bedMesh = new THREE.Mesh(new THREE.BoxGeometry(w * 0.96, 0.5, bedLength), this.bodyMaterial);
        bedMesh.position.set(0, 0.7, l * 0.26);
        bedMesh.castShadow = true;
        this.bodyMeshGroup.add(bedMesh);

        // Snorkel exhaust tube
        const snorkel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.06, 0.06, 1.5, 12),
          darkTrimMaterial
        );
        snorkel.position.set(w / 2 + 0.04, 1.3, -l * 0.35);
        this.bodyMeshGroup.add(snorkel);

        // Somaliland flag graphic on tailgate
        const tailgateFlag = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.3), somalilandGreen);
        tailgateFlag.position.set(0, 0.72, l / 2 + 0.01);
        this.bodyMeshGroup.add(tailgateFlag);
        break;
      }

      case 'sports': {
        // Low slung supercar / sports coupe profile
        const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(w, 0.45, l), this.bodyMaterial);
        lowerBody.position.set(0, 0.4, 0);
        lowerBody.castShadow = true;
        this.bodyMeshGroup.add(lowerBody);

        // Aerodynamic sloped cabin
        const cabin = new THREE.Mesh(new THREE.BoxGeometry(w * 0.8, 0.48, l * 0.52), glassMaterial);
        cabin.position.set(0, 0.82, 0.1);
        this.bodyMeshGroup.add(cabin);

        // Rear carbon spoiler wing
        const wing = new THREE.Mesh(new THREE.BoxGeometry(w * 0.85, 0.04, 0.3), darkTrimMaterial);
        wing.position.set(0, 0.88, l * 0.45);
        this.bodyMeshGroup.add(wing);

        // Racing dual center stripe (Green and Red)
        const stripeG = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, l * 0.95), somalilandGreen);
        stripeG.position.set(-0.12, 0.65, 0);
        this.bodyMeshGroup.add(stripeG);

        const stripeR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, l * 0.95), somalilandRed);
        stripeR.position.set(0.12, 0.65, 0);
        this.bodyMeshGroup.add(stripeR);
        break;
      }

      case 'sedan': {
        // Executive luxury saloon
        const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(w, 0.55, l), this.bodyMaterial);
        lowerBody.position.set(0, 0.5, 0);
        lowerBody.castShadow = true;
        this.bodyMeshGroup.add(lowerBody);

        const cabin = new THREE.Mesh(new THREE.BoxGeometry(w * 0.86, 0.55, l * 0.55), glassMaterial);
        cabin.position.set(0, 0.98, 0.05);
        this.bodyMeshGroup.add(cabin);

        // Chrome trim along windows
        const trimMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.95, roughness: 0.15 });
        const sideTrim = new THREE.Mesh(new THREE.BoxGeometry(w * 0.88, 0.03, l * 0.58), trimMat);
        sideTrim.position.set(0, 0.72, 0.05);
        this.bodyMeshGroup.add(sideTrim);
        break;
      }

      default: {
        // Flagship Luxury SUV (Default)
        const lowerBodyGeom = new THREE.BoxGeometry(w, 0.65, l);
        const lowerBodyMesh = new THREE.Mesh(lowerBodyGeom, this.bodyMaterial);
        lowerBodyMesh.position.set(0, 0.55, 0);
        lowerBodyMesh.castShadow = true;
        this.bodyMeshGroup.add(lowerBodyMesh);

        // Somaliland Green & Red stripes
        const greenStripeMesh = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, 0.08, l * 0.96), somalilandGreen);
        greenStripeMesh.position.set(0, 0.72, 0);
        this.bodyMeshGroup.add(greenStripeMesh);

        const redStripeMesh = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, 0.12, l * 0.94), somalilandRed);
        redStripeMesh.position.set(0, 0.3, 0);
        this.bodyMeshGroup.add(redStripeMesh);

        // Hood scoop with 5-pointed black star
        const hoodScoop = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 1.4), this.bodyMaterial);
        hoodScoop.position.set(0, 0.9, -l * 0.28);
        hoodScoop.rotation.x = -0.06;
        this.bodyMeshGroup.add(hoodScoop);

        const starShape = new THREE.Shape();
        const outerRadius = 0.32;
        const innerRadius = 0.14;
        const points = 5;
        for (let i = 0; i < points * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (i * Math.PI) / points - Math.PI / 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          if (i === 0) starShape.moveTo(x, y);
          else starShape.lineTo(x, y);
        }
        starShape.closePath();
        const starMesh = new THREE.Mesh(new THREE.ShapeGeometry(starShape), starMaterial);
        starMesh.rotation.x = -Math.PI / 2 - 0.06;
        starMesh.position.set(0, 0.97, -l * 0.28);
        this.bodyMeshGroup.add(starMesh);

        // Cabin
        const cabinMesh = new THREE.Mesh(new THREE.BoxGeometry(w * 0.85, 0.68, l * 0.52), glassMaterial);
        cabinMesh.position.set(0, 1.15, l * 0.05);
        this.bodyMeshGroup.add(cabinMesh);

        // Green roof
        const roofMesh = new THREE.Mesh(new THREE.BoxGeometry(w * 0.82, 0.08, l * 0.46), somalilandGreen);
        roofMesh.position.set(0, 1.5, l * 0.05);
        this.bodyMeshGroup.add(roofMesh);
        break;
      }
    }

    // 2. Headlights & Spotlights
    this.headlightMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 2.2,
      roughness: 0.1,
    });

    const headlightGeom = new THREE.BoxGeometry(0.35, 0.14, 0.15);
    const leftHeadlight = new THREE.Mesh(headlightGeom, this.headlightMaterial);
    leftHeadlight.position.set(-w * 0.36, 0.65, -l / 2 + 0.05);
    this.bodyMeshGroup.add(leftHeadlight);

    const rightHeadlight = new THREE.Mesh(headlightGeom, this.headlightMaterial);
    rightHeadlight.position.set(w * 0.36, 0.65, -l / 2 + 0.05);
    this.bodyMeshGroup.add(rightHeadlight);

    // Three.js Spotlight beams
    this.leftHeadlightSpot = new THREE.SpotLight(0xfffaed, 24, 70, Math.PI / 6, 0.35, 1.2);
    this.leftHeadlightSpot.position.set(-w * 0.36, 0.65, -l / 2);
    this.leftHeadlightSpot.target.position.set(-w * 0.36, 0.1, -30);
    this.group.add(this.leftHeadlightSpot);
    this.group.add(this.leftHeadlightSpot.target);

    this.rightHeadlightSpot = new THREE.SpotLight(0xfffaed, 24, 70, Math.PI / 6, 0.35, 1.2);
    this.rightHeadlightSpot.position.set(w * 0.36, 0.65, -l / 2);
    this.rightHeadlightSpot.target.position.set(w * 0.36, 0.1, -30);
    this.group.add(this.rightHeadlightSpot);
    this.group.add(this.rightHeadlightSpot.target);

    // Taillights
    this.taillightMaterial = new THREE.MeshStandardMaterial({
      color: 0xcc0000,
      emissive: 0xaa0000,
      emissiveIntensity: 1.0,
      roughness: 0.2,
    });
    const taillightGeom = new THREE.BoxGeometry(0.38, 0.12, 0.12);
    const leftTaillight = new THREE.Mesh(taillightGeom, this.taillightMaterial);
    leftTaillight.position.set(-w * 0.36, 0.72, l / 2 - 0.02);
    this.bodyMeshGroup.add(leftTaillight);

    const rightTaillight = new THREE.Mesh(taillightGeom, this.taillightMaterial);
    rightTaillight.position.set(w * 0.36, 0.72, l / 2 - 0.02);
    this.bodyMeshGroup.add(rightTaillight);

    // Reverse Lights
    this.reverseLightMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      emissive: 0x000000,
      emissiveIntensity: 0,
    });
    const leftRev = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.1), this.reverseLightMaterial);
    leftRev.position.set(-w * 0.2, 0.72, l / 2 - 0.02);
    this.bodyMeshGroup.add(leftRev);

    const rightRev = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.1), this.reverseLightMaterial);
    rightRev.position.set(w * 0.2, 0.72, l / 2 - 0.02);
    this.bodyMeshGroup.add(rightRev);

    // 3. Four Wheels
    const track = w * 0.48;
    const halfBase = definition.dimensions.wheelbase / 2;
    const r = definition.dimensions.wheelRadius;

    const [flw, fls] = this.buildWheel(r);
    this.frontLeftWheel = flw;
    this.frontLeftSpin = fls;
    this.frontLeftWheel.position.set(-track, r, -halfBase);
    this.group.add(this.frontLeftWheel);

    const [frw, frs] = this.buildWheel(r, true);
    this.frontRightWheel = frw;
    this.frontRightSpin = frs;
    this.frontRightWheel.position.set(track, r, -halfBase);
    this.group.add(this.frontRightWheel);

    const [rlw, rls] = this.buildWheel(r);
    this.rearLeftWheel = rlw;
    this.rearLeftSpin = rls;
    this.rearLeftWheel.position.set(-track, r, halfBase);
    this.group.add(this.rearLeftWheel);

    const [rrw, rrs] = this.buildWheel(r, true);
    this.rearRightWheel = rrw;
    this.rearRightSpin = rrs;
    this.rearRightWheel.position.set(track, r, halfBase);
    this.group.add(this.rearRightWheel);
  }

  private buildWheel(radius: number, isRightSide: boolean = false): [THREE.Group, THREE.Group] {
    const wheelGroup = new THREE.Group();
    const spinGroup = new THREE.Group();
    wheelGroup.add(spinGroup);

    const tireGeom = new THREE.CylinderGeometry(radius, radius, 0.32, 20);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x181a1d, roughness: 0.85, metalness: 0.15 });
    const tire = new THREE.Mesh(tireGeom, tireMat);
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    spinGroup.add(tire);

    const rimGeom = new THREE.CylinderGeometry(radius * 0.66, radius * 0.66, 0.33, 16);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xd8dde4, metalness: 0.9, roughness: 0.2 });
    const rim = new THREE.Mesh(rimGeom, rimMat);
    rim.rotation.z = Math.PI / 2;
    spinGroup.add(rim);

    // Green center cap
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.28, radius * 0.28, 0.34, 12),
      new THREE.MeshStandardMaterial({ color: 0x0c6834, metalness: 0.8, roughness: 0.3 })
    );
    hub.rotation.z = Math.PI / 2;
    spinGroup.add(hub);

    // Caliper
    const caliper = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.14, 0.1),
      new THREE.MeshStandardMaterial({ color: 0xc8102e, metalness: 0.6, roughness: 0.3 })
    );
    caliper.position.set(isRightSide ? -0.06 : 0.06, radius * 0.35, 0);
    wheelGroup.add(caliper);

    return [wheelGroup, spinGroup];
  }

  setPrimaryColor(hex: string) {
    this.bodyMaterial.color.set(hex);
  }

  setHeadlights(active: boolean) {
    this.leftHeadlightSpot.visible = active;
    this.rightHeadlightSpot.visible = active;
    this.headlightMaterial.emissiveIntensity = active ? 2.5 : 0.2;
  }

  setBraking(isBraking: boolean) {
    this.taillightMaterial.emissiveIntensity = isBraking ? 3.0 : 0.8;
    this.taillightMaterial.color.setHex(isBraking ? 0xff2222 : 0xaa0000);
  }

  setReversing(isReversing: boolean) {
    this.reverseLightMaterial.emissiveIntensity = isReversing ? 2.2 : 0;
    this.reverseLightMaterial.emissive.setHex(isReversing ? 0xffffff : 0x000000);
  }

  update(
    position: THREE.Vector3,
    headingAngle: number,
    steerAngle: number,
    wheelSpinAngle: number,
    pitchAngle: number,
    rollAngle: number,
    isBraking: boolean,
    isReversing: boolean
  ) {
    this.group.position.copy(position);
    this.group.rotation.y = headingAngle;

    this.bodyMeshGroup.rotation.x = pitchAngle;
    this.bodyMeshGroup.rotation.z = rollAngle;

    this.frontLeftWheel.rotation.y = steerAngle;
    this.frontRightWheel.rotation.y = steerAngle;

    this.frontLeftSpin.rotation.x = wheelSpinAngle;
    this.frontRightSpin.rotation.x = wheelSpinAngle;
    this.rearLeftSpin.rotation.x = wheelSpinAngle;
    this.rearRightSpin.rotation.x = wheelSpinAngle;

    this.setBraking(isBraking);
    this.setReversing(isReversing);
  }
}
