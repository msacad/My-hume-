import * as THREE from 'three';

export interface SUVModelOptions {
  primaryColor?: string; // e.g. '#FFFFFF' or Somaliland livery
  headlightsOn?: boolean;
}

export class SUVModel {
  public group: THREE.Group;
  public bodyMeshGroup: THREE.Group;

  // Wheel mesh references for animation
  public frontLeftWheel: THREE.Group;
  public frontRightWheel: THREE.Group;
  public rearLeftWheel: THREE.Group;
  public rearRightWheel: THREE.Group;

  // Wheel spin groups (inner rotation)
  private frontLeftSpin: THREE.Group;
  private frontRightSpin: THREE.Group;
  private rearLeftSpin: THREE.Group;
  private rearRightSpin: THREE.Group;

  // Lights
  public leftHeadlightSpot: THREE.SpotLight;
  public rightHeadlightSpot: THREE.SpotLight;
  private headlightMeshMaterial: THREE.MeshStandardMaterial;
  private taillightMaterial: THREE.MeshStandardMaterial;
  private reverseLightMaterial: THREE.MeshStandardMaterial;

  // Paint materials
  private bodyMaterial: THREE.MeshStandardMaterial;
  private roofMaterial: THREE.MeshStandardMaterial;

  constructor() {
    this.group = new THREE.Group();
    this.bodyMeshGroup = new THREE.Group();
    this.group.add(this.bodyMeshGroup);

    // 1. Create Materials
    // Body paint: Glossy Pearl White base with metallic flake
    this.bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f7fa,
      metalness: 0.85,
      roughness: 0.18,
    });

    // Dark trim material for wheel arches, bumpers, grilles
    const darkTrimMaterial = new THREE.MeshStandardMaterial({
      color: 0x111315,
      roughness: 0.6,
      metalness: 0.4,
    });

    // Tinted glass
    const glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x121820,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85,
    });

    // Somaliland Green paint (#116633)
    const somalilandGreen = new THREE.MeshStandardMaterial({
      color: 0x0c6834,
      metalness: 0.8,
      roughness: 0.2,
    });

    // Somaliland Red paint (#D21034)
    const somalilandRed = new THREE.MeshStandardMaterial({
      color: 0xc8102e,
      metalness: 0.8,
      roughness: 0.2,
    });

    // Star / Carbon black
    const starMaterial = new THREE.MeshStandardMaterial({
      color: 0x050505,
      roughness: 0.3,
    });

    this.roofMaterial = somalilandGreen;

    // 2. Build SUV Body Geometry
    // Lower main chassis
    const lowerBodyGeom = new THREE.BoxGeometry(2.1, 0.65, 4.7);
    const lowerBodyMesh = new THREE.Mesh(lowerBodyGeom, this.bodyMaterial);
    lowerBodyMesh.position.set(0, 0.55, 0);
    lowerBodyMesh.castShadow = true;
    lowerBodyMesh.receiveShadow = true;
    this.bodyMeshGroup.add(lowerBodyMesh);

    // Somaliland Racing Stripe Decals on the Body:
    // Green stripe across hood and shoulder line
    const greenStripeGeom = new THREE.BoxGeometry(2.12, 0.08, 4.6);
    const greenStripeMesh = new THREE.Mesh(greenStripeGeom, somalilandGreen);
    greenStripeMesh.position.set(0, 0.72, 0);
    this.bodyMeshGroup.add(greenStripeMesh);

    // Red accent rocker stripe along bottom side skirts
    const redStripeGeom = new THREE.BoxGeometry(2.14, 0.12, 4.5);
    const redStripeMesh = new THREE.Mesh(redStripeGeom, somalilandRed);
    redStripeMesh.position.set(0, 0.3, 0);
    this.bodyMeshGroup.add(redStripeMesh);

    // Hood scoop / power dome with black star
    const hoodScoopGeom = new THREE.BoxGeometry(1.2, 0.12, 1.4);
    const hoodScoopMesh = new THREE.Mesh(hoodScoopGeom, this.bodyMaterial);
    hoodScoopMesh.position.set(0, 0.9, -1.35);
    hoodScoopMesh.rotation.x = -0.06;
    this.bodyMeshGroup.add(hoodScoopMesh);

    // 5-Pointed Black Star Decal on Hood Scoop
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
    const starGeom = new THREE.ShapeGeometry(starShape);
    const starMesh = new THREE.Mesh(starGeom, starMaterial);
    starMesh.rotation.x = -Math.PI / 2 - 0.06;
    starMesh.position.set(0, 0.97, -1.35);
    this.bodyMeshGroup.add(starMesh);

    // Cabin / Greenhouse (Upper cabin with sports coupe-SUV roof slope)
    const cabinGeom = new THREE.BoxGeometry(1.78, 0.68, 2.5);
    const cabinMesh = new THREE.Mesh(cabinGeom, glassMaterial);
    cabinMesh.position.set(0, 1.15, 0.25);
    cabinMesh.castShadow = true;
    this.bodyMeshGroup.add(cabinMesh);

    // Roof Panel (Painted in Somaliland Green)
    const roofGeom = new THREE.BoxGeometry(1.72, 0.08, 2.2);
    const roofMesh = new THREE.Mesh(roofGeom, somalilandGreen);
    roofMesh.position.set(0, 1.5, 0.25);
    this.bodyMeshGroup.add(roofMesh);

    // Front Windshield frame & Glass angle
    const windshieldGeom = new THREE.BoxGeometry(1.74, 0.65, 0.08);
    const windshieldMesh = new THREE.Mesh(windshieldGeom, glassMaterial);
    windshieldMesh.position.set(0, 1.12, -0.95);
    windshieldMesh.rotation.x = -0.45;
    this.bodyMeshGroup.add(windshieldMesh);

    // Rear Windshield angle
    const rearGlassGeom = new THREE.BoxGeometry(1.72, 0.6, 0.08);
    const rearGlassMesh = new THREE.Mesh(rearGlassGeom, glassMaterial);
    rearGlassMesh.position.set(0, 1.18, 1.45);
    rearGlassMesh.rotation.x = 0.42;
    this.bodyMeshGroup.add(rearGlassMesh);

    // Front Bumper & Aggressive Lower Grille
    const frontBumperGeom = new THREE.BoxGeometry(2.05, 0.4, 0.45);
    const frontBumper = new THREE.Mesh(frontBumperGeom, darkTrimMaterial);
    frontBumper.position.set(0, 0.38, -2.25);
    this.bodyMeshGroup.add(frontBumper);

    // Honeycomb Grille Center
    const grilleGeom = new THREE.BoxGeometry(1.2, 0.26, 0.08);
    const grilleMesh = new THREE.Mesh(grilleGeom, darkTrimMaterial);
    grilleMesh.position.set(0, 0.58, -2.37);
    this.bodyMeshGroup.add(grilleMesh);

    // Rear Bumper & Aerodynamic Diffuser
    const rearBumperGeom = new THREE.BoxGeometry(2.05, 0.45, 0.4);
    const rearBumper = new THREE.Mesh(rearBumperGeom, darkTrimMaterial);
    rearBumper.position.set(0, 0.42, 2.25);
    this.bodyMeshGroup.add(rearBumper);

    // Dual Chrome Exhaust Tips
    const exhaustGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.2, 16);
    const exhaustMaterial = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.95, roughness: 0.1 });
    const exhaustLeft = new THREE.Mesh(exhaustGeom, exhaustMaterial);
    exhaustLeft.rotation.x = Math.PI / 2;
    exhaustLeft.position.set(-0.65, 0.26, 2.45);
    this.bodyMeshGroup.add(exhaustLeft);

    const exhaustRight = new THREE.Mesh(exhaustGeom, exhaustMaterial);
    exhaustRight.rotation.x = Math.PI / 2;
    exhaustRight.position.set(0.65, 0.26, 2.45);
    this.bodyMeshGroup.add(exhaustRight);

    // Side Mirrors
    const mirrorGeom = new THREE.BoxGeometry(0.28, 0.14, 0.18);
    const mirrorLeft = new THREE.Mesh(mirrorGeom, darkTrimMaterial);
    mirrorLeft.position.set(-1.05, 1.05, -0.75);
    this.bodyMeshGroup.add(mirrorLeft);

    const mirrorRight = new THREE.Mesh(mirrorGeom, darkTrimMaterial);
    mirrorRight.position.set(1.05, 1.05, -0.75);
    this.bodyMeshGroup.add(mirrorRight);

    // 3. Headlights & Taillights
    this.headlightMeshMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 2.2,
      roughness: 0.1,
    });

    const headlightGeom = new THREE.BoxGeometry(0.38, 0.14, 0.15);
    const leftHeadlight = new THREE.Mesh(headlightGeom, this.headlightMeshMaterial);
    leftHeadlight.position.set(-0.75, 0.66, -2.34);
    this.bodyMeshGroup.add(leftHeadlight);

    const rightHeadlight = new THREE.Mesh(headlightGeom, this.headlightMeshMaterial);
    rightHeadlight.position.set(0.75, 0.66, -2.34);
    this.bodyMeshGroup.add(rightHeadlight);

    // Real Three.js Headlight SpotLight Beams
    this.leftHeadlightSpot = new THREE.SpotLight(0xfffaed, 25, 65, Math.PI / 6, 0.35, 1.2);
    this.leftHeadlightSpot.position.set(-0.75, 0.66, -2.4);
    this.leftHeadlightSpot.target.position.set(-0.75, 0.1, -25);
    this.group.add(this.leftHeadlightSpot);
    this.group.add(this.leftHeadlightSpot.target);

    this.rightHeadlightSpot = new THREE.SpotLight(0xfffaed, 25, 65, Math.PI / 6, 0.35, 1.2);
    this.rightHeadlightSpot.position.set(0.75, 0.66, -2.4);
    this.rightHeadlightSpot.target.position.set(0.75, 0.1, -25);
    this.group.add(this.rightHeadlightSpot);
    this.group.add(this.rightHeadlightSpot.target);

    // Taillights
    this.taillightMaterial = new THREE.MeshStandardMaterial({
      color: 0xcc0000,
      emissive: 0xaa0000,
      emissiveIntensity: 1.0,
      roughness: 0.2,
    });

    const taillightGeom = new THREE.BoxGeometry(0.42, 0.12, 0.12);
    const leftTaillight = new THREE.Mesh(taillightGeom, this.taillightMaterial);
    leftTaillight.position.set(-0.75, 0.72, 2.36);
    this.bodyMeshGroup.add(leftTaillight);

    const rightTaillight = new THREE.Mesh(taillightGeom, this.taillightMaterial);
    rightTaillight.position.set(0.75, 0.72, 2.36);
    this.bodyMeshGroup.add(rightTaillight);

    // Reverse Lights
    this.reverseLightMaterial = new THREE.MeshStandardMaterial({
      color: 0x555555,
      emissive: 0x000000,
      emissiveIntensity: 0,
    });
    const revLightGeom = new THREE.BoxGeometry(0.18, 0.08, 0.1);
    const leftRevLight = new THREE.Mesh(revLightGeom, this.reverseLightMaterial);
    leftRevLight.position.set(-0.45, 0.72, 2.36);
    this.bodyMeshGroup.add(leftRevLight);

    const rightRevLight = new THREE.Mesh(revLightGeom, this.reverseLightMaterial);
    rightRevLight.position.set(0.45, 0.72, 2.36);
    this.bodyMeshGroup.add(rightRevLight);

    // 4. Create Detailed Wheels
    const wheelTrack = 1.02; // meters from centerline
    const frontWheelZ = -1.45;
    const rearWheelZ = 1.45;
    const wheelY = 0.42;

    const [flw, fls] = this.createWheelMesh();
    this.frontLeftWheel = flw;
    this.frontLeftSpin = fls;
    this.frontLeftWheel.position.set(-wheelTrack, wheelY, frontWheelZ);
    this.group.add(this.frontLeftWheel);

    const [frw, frs] = this.createWheelMesh(true);
    this.frontRightWheel = frw;
    this.frontRightSpin = frs;
    this.frontRightWheel.position.set(wheelTrack, wheelY, frontWheelZ);
    this.group.add(this.frontRightWheel);

    const [rlw, rls] = this.createWheelMesh();
    this.rearLeftWheel = rlw;
    this.rearLeftSpin = rls;
    this.rearLeftWheel.position.set(-wheelTrack, wheelY, rearWheelZ);
    this.group.add(this.rearLeftWheel);

    const [rrw, rrs] = this.createWheelMesh(true);
    this.rearRightWheel = rrw;
    this.rearRightSpin = rrs;
    this.rearRightWheel.position.set(wheelTrack, wheelY, rearWheelZ);
    this.group.add(this.rearRightWheel);
  }

  private createWheelMesh(isRightSide: boolean = false): [THREE.Group, THREE.Group] {
    const wheelGroup = new THREE.Group(); // Steer pivot (rotates around Y)
    const spinGroup = new THREE.Group(); // Spin pivot (rotates around X)
    wheelGroup.add(spinGroup);

    // Tire rubber
    const tireGeom = new THREE.CylinderGeometry(0.42, 0.42, 0.32, 24);
    const tireMaterial = new THREE.MeshStandardMaterial({
      color: 0x1b1d20,
      roughness: 0.85,
      metalness: 0.15,
    });
    const tire = new THREE.Mesh(tireGeom, tireMaterial);
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    spinGroup.add(tire);

    // Alloy Rim
    const rimGeom = new THREE.CylinderGeometry(0.28, 0.28, 0.33, 16);
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: 0xd0d5dd,
      metalness: 0.9,
      roughness: 0.25,
    });
    const rim = new THREE.Mesh(rimGeom, rimMaterial);
    rim.rotation.z = Math.PI / 2;
    spinGroup.add(rim);

    // Center Hub Cap (Black with green accent)
    const hubGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.34, 12);
    const hubMaterial = new THREE.MeshStandardMaterial({
      color: 0x0c6834,
      metalness: 0.8,
      roughness: 0.3,
    });
    const hub = new THREE.Mesh(hubGeom, hubMaterial);
    hub.rotation.z = Math.PI / 2;
    spinGroup.add(hub);

    // 5 Rim Spokes
    const spokeGeom = new THREE.BoxGeometry(0.06, 0.46, 0.332);
    for (let i = 0; i < 5; i++) {
      const spoke = new THREE.Mesh(spokeGeom, rimMaterial);
      spoke.rotation.x = (i * Math.PI) / 2.5;
      spinGroup.add(spoke);
    }

    // Brake Disc & Caliper inside wheel
    const discGeom = new THREE.CylinderGeometry(0.24, 0.24, 0.04, 16);
    const discMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8, roughness: 0.4 });
    const disc = new THREE.Mesh(discGeom, discMaterial);
    disc.rotation.z = Math.PI / 2;
    disc.position.x = isRightSide ? -0.06 : 0.06;
    spinGroup.add(disc);

    const caliperGeom = new THREE.BoxGeometry(0.08, 0.16, 0.12);
    const caliperMaterial = new THREE.MeshStandardMaterial({ color: 0xc8102e, metalness: 0.6, roughness: 0.3 });
    const caliper = new THREE.Mesh(caliperGeom, caliperMaterial);
    caliper.position.set(isRightSide ? -0.06 : 0.06, 0.14, 0);
    wheelGroup.add(caliper); // caliper stays attached to knuckle, does not spin

    return [wheelGroup, spinGroup];
  }

  setPrimaryColor(hex: string) {
    this.bodyMaterial.color.set(hex);
  }

  setHeadlights(active: boolean) {
    this.leftHeadlightSpot.visible = active;
    this.rightHeadlightSpot.visible = active;
    this.headlightMeshMaterial.emissiveIntensity = active ? 2.5 : 0.2;
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
    speedKmH: number,
    isBraking: boolean,
    isReversing: boolean
  ) {
    // 1. Position and Heading
    this.group.position.copy(position);
    this.group.rotation.y = headingAngle;

    // 2. Body pitch & roll
    this.bodyMeshGroup.rotation.x = pitchAngle;
    this.bodyMeshGroup.rotation.z = rollAngle;

    // 3. Front wheels steering pivot
    this.frontLeftWheel.rotation.y = steerAngle;
    this.frontRightWheel.rotation.y = steerAngle;

    // 4. Wheels spin
    this.frontLeftSpin.rotation.x = wheelSpinAngle;
    this.frontRightSpin.rotation.x = wheelSpinAngle;
    this.rearLeftSpin.rotation.x = wheelSpinAngle;
    this.rearRightSpin.rotation.x = wheelSpinAngle;

    // 5. Lights feedback
    this.setBraking(isBraking);
    this.setReversing(isReversing);
  }
}
