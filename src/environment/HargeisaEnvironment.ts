import * as THREE from 'three';
import { CollisionObstacle } from '../physics/VehiclePhysics';

export class HargeisaEnvironment {
  public scene: THREE.Scene;
  public obstacles: CollisionObstacle[] = [];
  private textureLoader: THREE.TextureLoader;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.textureLoader = new THREE.TextureLoader();
    this.buildWorld();
  }

  private buildWorld() {
    // 1. Sky, Atmosphere & Lighting
    this.scene.background = new THREE.Color(0x82bcee);
    this.scene.fog = new THREE.FogExp2(0xd6cfb6, 0.0035);

    // Warm African Sun
    const sunLight = new THREE.DirectionalLight(0xfff6dd, 2.4);
    sunLight.position.set(120, 250, 100);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 600;
    const shadowD = 150;
    sunLight.shadow.camera.left = -shadowD;
    sunLight.shadow.camera.right = shadowD;
    sunLight.shadow.camera.top = shadowD;
    sunLight.shadow.camera.bottom = -shadowD;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    // Ambient light
    const hemiLight = new THREE.HemisphereLight(0xb1e1ff, 0xcaa373, 1.2);
    this.scene.add(hemiLight);

    // 2. Main Ground (Hargeisa plateau earth)
    const groundGeom = new THREE.PlaneGeometry(800, 800, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xc2a677, // Somaliland arid golden soil
      roughness: 0.95,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Distant Hills (Naasa Hablood twin hills backdrop)
    this.buildDistantHills();

    // 3. Road Network
    this.buildRoadNetwork();

    // 4. Freedom Square & MiG-17 Memorial Monument
    this.buildMemorialPlaza();

    // 5. Buildings & Skyline
    this.buildCityBuildings();

    // 6. Somaliland Flagpoles
    this.buildFlagpoles();

    // 7. Road Signs and Traffic Lights
    this.buildRoadSigns();

    // 8. Trees and Palms
    this.buildVegetation();

    // 9. Streetlights
    this.buildStreetlights();

    // 10. Road Barriers & Cones
    this.buildRoadsideProps();
  }

  private buildDistantHills() {
    // Twin conical hills inspired by Naasa Hablood ("Virgin's Breasts")
    const hillMat = new THREE.MeshStandardMaterial({
      color: 0x9b7e55,
      roughness: 0.9,
    });

    // Hill 1
    const hillGeom1 = new THREE.ConeGeometry(55, 65, 18);
    const hill1 = new THREE.Mesh(hillGeom1, hillMat);
    hill1.position.set(-260, 32, -320);
    this.scene.add(hill1);

    // Hill 2
    const hillGeom2 = new THREE.ConeGeometry(50, 60, 18);
    const hill2 = new THREE.Mesh(hillGeom2, hillMat);
    hill2.position.set(-190, 30, -330);
    this.scene.add(hill2);
  }

  private buildRoadNetwork() {
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x24282c, // Dark asphalt
      roughness: 0.8,
      metalness: 0.1,
    });

    const curbMat = new THREE.MeshStandardMaterial({
      color: 0x8a9299,
      roughness: 0.7,
    });

    const yellowLineMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
    const whiteLineMat = new THREE.MeshBasicMaterial({ color: 0xf5f5f5 });

    // North-South Main Boulevard: 24m wide, 600m long
    const nsRoadGeom = new THREE.PlaneGeometry(24, 600);
    const nsRoad = new THREE.Mesh(nsRoadGeom, roadMat);
    nsRoad.rotation.x = -Math.PI / 2;
    nsRoad.position.set(0, 0.02, 0);
    nsRoad.receiveShadow = true;
    this.scene.add(nsRoad);

    // East-West Cross Avenue: 20m wide, 600m long
    const ewRoadGeom = new THREE.PlaneGeometry(600, 20);
    const ewRoad = new THREE.Mesh(ewRoadGeom, roadMat);
    ewRoad.rotation.x = -Math.PI / 2;
    ewRoad.position.set(0, 0.02, 0);
    ewRoad.receiveShadow = true;
    this.scene.add(ewRoad);

    // Secondary Parallel Loop Road at X = 120 and X = -120
    const loop1 = new THREE.Mesh(new THREE.PlaneGeometry(16, 500), roadMat);
    loop1.rotation.x = -Math.PI / 2;
    loop1.position.set(120, 0.02, 0);
    this.scene.add(loop1);

    const loop2 = new THREE.Mesh(new THREE.PlaneGeometry(16, 500), roadMat);
    loop2.rotation.x = -Math.PI / 2;
    loop2.position.set(-120, 0.02, 0);
    this.scene.add(loop2);

    // Cross connectors at Z = 160 and Z = -160
    const cross1 = new THREE.Mesh(new THREE.PlaneGeometry(300, 16), roadMat);
    cross1.rotation.x = -Math.PI / 2;
    cross1.position.set(0, 0.02, 160);
    this.scene.add(cross1);

    const cross2 = new THREE.Mesh(new THREE.PlaneGeometry(300, 16), roadMat);
    cross2.rotation.x = -Math.PI / 2;
    cross2.position.set(0, 0.02, -160);
    this.scene.add(cross2);

    // Sidewalks along Main Boulevard
    const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x9fa6ad, roughness: 0.85 });
    const swLeft = new THREE.Mesh(new THREE.BoxGeometry(4, 0.2, 600), sidewalkMat);
    swLeft.position.set(-14, 0.1, 0);
    swLeft.receiveShadow = true;
    this.scene.add(swLeft);

    const swRight = new THREE.Mesh(new THREE.BoxGeometry(4, 0.2, 600), sidewalkMat);
    swRight.position.set(14, 0.1, 0);
    swRight.receiveShadow = true;
    this.scene.add(swRight);

    // Road Markings: Double Yellow Center Line along North-South
    const doubleYellow1 = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 600), yellowLineMat);
    doubleYellow1.rotation.x = -Math.PI / 2;
    doubleYellow1.position.set(-0.25, 0.04, 0);
    this.scene.add(doubleYellow1);

    const doubleYellow2 = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 600), yellowLineMat);
    doubleYellow2.rotation.x = -Math.PI / 2;
    doubleYellow2.position.set(0.25, 0.04, 0);
    this.scene.add(doubleYellow2);

    // Dashed White Lane Dividers
    for (let z = -280; z < 280; z += 12) {
      if (Math.abs(z) < 25 || Math.abs(z - 160) < 18 || Math.abs(z + 160) < 18) continue; // Skip intersections
      const dashLeft = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 5.5), whiteLineMat);
      dashLeft.rotation.x = -Math.PI / 2;
      dashLeft.position.set(-5.5, 0.04, z);
      this.scene.add(dashLeft);

      const dashRight = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 5.5), whiteLineMat);
      dashRight.rotation.x = -Math.PI / 2;
      dashRight.position.set(5.5, 0.04, z);
      this.scene.add(dashRight);
    }

    // Pedestrian Zebra Crossings near intersections
    this.buildZebraCrossing(0, 18, 22, 1);
    this.buildZebraCrossing(0, -18, 22, 1);
    this.buildZebraCrossing(18, 0, 1, 18);
    this.buildZebraCrossing(-18, 0, 1, 18);
  }

  private buildZebraCrossing(cx: number, cz: number, width: number, length: number) {
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xeeeeee });
    if (width > length) {
      // Crosses across X
      for (let x = -width / 2 + 1; x < width / 2 - 1; x += 1.8) {
        const stripe = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 3.8), whiteMat);
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(cx + x, 0.045, cz);
        this.scene.add(stripe);
      }
    } else {
      // Crosses across Z
      for (let z = -length / 2 + 1; z < length / 2 - 1; z += 1.8) {
        const stripe = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 1.0), whiteMat);
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(cx, 0.045, cz + z);
        this.scene.add(stripe);
      }
    }
  }

  private buildMemorialPlaza() {
    // Freedom Square (Fagaaraaxa Xorriyadda) with MiG-17 Monument
    const plazaMat = new THREE.MeshStandardMaterial({
      color: 0xded5be,
      roughness: 0.8,
    });

    const plazaGeom = new THREE.CylinderGeometry(28, 28, 0.4, 32);
    const plaza = new THREE.Mesh(plazaGeom, plazaMat);
    plaza.position.set(50, 0.2, 50);
    plaza.receiveShadow = true;
    this.scene.add(plaza);
    this.obstacles.push({ x: 50, z: 50, radius: 26, name: 'Freedom Square Plaza' });

    // Monument Base Pedestal
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.6 });
    const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(6, 4.5, 12), baseMat);
    baseMesh.position.set(50, 2.5, 50);
    baseMesh.rotation.y = Math.PI / 4;
    baseMesh.castShadow = true;
    this.scene.add(baseMesh);

    // Iconic MiG Jet Aircraft representation mounted atop pedestal
    const jetMat = new THREE.MeshStandardMaterial({ color: 0x4d6642, metalness: 0.8, roughness: 0.3 });
    const jetBody = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 11, 16), jetMat);
    jetBody.position.set(50, 6.2, 50);
    jetBody.rotation.set(0.3, Math.PI / 4, 0.1);
    this.scene.add(jetBody);

    const jetWings = new THREE.Mesh(new THREE.BoxGeometry(9, 0.15, 3.2), jetMat);
    jetWings.position.set(50, 6.3, 50);
    jetWings.rotation.set(0.3, Math.PI / 4, 0.1);
    this.scene.add(jetWings);
  }

  private buildCityBuildings() {
    const buildingColors = [0xdfd9ce, 0x0f4c3a, 0xb82626, 0x1f3c6e, 0xd0c4b2, 0xe5e2dc];

    // Landmark texture billboard
    this.textureLoader.load(
      './game_assets/environment/hargeisa_landmark_buildings.png',
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });

        // Add 2 large city skyline backdrop billboards
        const mesh1 = new THREE.Mesh(new THREE.PlaneGeometry(160, 52), mat);
        mesh1.position.set(-180, 26, 0);
        mesh1.rotation.y = Math.PI / 2;
        this.scene.add(mesh1);

        const mesh2 = new THREE.Mesh(new THREE.PlaneGeometry(160, 52), mat);
        mesh2.position.set(180, 26, 0);
        mesh2.rotation.y = -Math.PI / 2;
        this.scene.add(mesh2);
      },
      undefined,
      () => {}
    );

    // City Building Cluster Billboard
    this.textureLoader.load(
      './game_assets/environment/city_building_cluster.png',
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });

        const cluster1 = new THREE.Mesh(new THREE.PlaneGeometry(90, 40), mat);
        cluster1.position.set(-60, 20, -180);
        this.scene.add(cluster1);

        const cluster2 = new THREE.Mesh(new THREE.PlaneGeometry(90, 40), mat);
        cluster2.position.set(60, 20, 180);
        cluster2.rotation.y = Math.PI;
        this.scene.add(cluster2);
      },
      undefined,
      () => {}
    );

    // 3D Geometric Commercial Towers and Villas
    const buildingConfigs = [
      // Along West side of Main Boulevard
      { x: -32, z: -60, w: 22, d: 24, h: 42, color: 0x1e3a5f, name: 'Dahabshiil Center' },
      { x: -32, z: -110, w: 20, d: 20, h: 28, color: 0x0f4c3a, name: 'Telesom Tower' },
      { x: -32, z: 60, w: 24, d: 22, h: 36, color: 0xe0dad1, name: 'Hargeisa City Mall' },
      { x: -32, z: 110, w: 22, d: 20, h: 26, color: 0x9b4422, name: 'Ambassador Hotel Suites' },

      // Along East side of Main Boulevard
      { x: 32, z: -60, w: 20, d: 22, h: 32, color: 0xe5e0d8, name: 'Deero Commercial Building' },
      { x: 32, z: -110, w: 24, d: 20, h: 40, color: 0x224233, name: 'Somaliland National Bank District' },
      { x: 32, z: 110, w: 22, d: 24, h: 30, color: 0x364858, name: 'Golis Business Tower' },

      // Secondary Grid Buildings
      { x: -90, z: -80, w: 28, d: 30, h: 22, color: 0xcebda7, name: 'Commercial Block A' },
      { x: -90, z: 80, w: 30, d: 28, h: 24, color: 0xd9d3c5, name: 'Commercial Block B' },
      { x: 90, z: -80, w: 28, d: 28, h: 20, color: 0xd5cbba, name: 'Commercial Block C' },
      { x: 90, z: 80, w: 30, d: 30, h: 26, color: 0x2e463a, name: 'Commercial Block D' },
    ];

    for (const b of buildingConfigs) {
      const geom = new THREE.BoxGeometry(b.w, b.h, b.d);
      const mat = new THREE.MeshStandardMaterial({
        color: b.color,
        roughness: 0.6,
        metalness: 0.3,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(b.x, b.h / 2, b.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);

      // Windows Grid detail on facade
      const winGeom = new THREE.PlaneGeometry(b.w * 0.85, b.h * 0.75);
      const winMat = new THREE.MeshStandardMaterial({ color: 0x112233, roughness: 0.1, metalness: 0.9 });
      const winFront = new THREE.Mesh(winGeom, winMat);
      winFront.position.set(b.x, b.h / 2, b.z + (b.x < 0 ? -b.d / 2 - 0.05 : b.d / 2 + 0.05));
      this.scene.add(winFront);

      // Register collision box
      const radius = Math.max(b.w, b.d) / 1.7;
      this.obstacles.push({ x: b.x, z: b.z, radius, name: b.name });
    }
  }

  private buildFlagpoles() {
    this.textureLoader.load(
      './game_assets/flags/somaliland_flag_01.png',
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        const flagMat = new THREE.MeshStandardMaterial({
          map: texture,
          side: THREE.DoubleSide,
          roughness: 0.5,
        });

        // 8 Flagpoles along the boulevard median and plazas
        const flagPositions = [
          { x: 0, z: -120 },
          { x: 0, z: -60 },
          { x: 0, z: 60 },
          { x: 0, z: 120 },
          { x: 38, z: 38 },
          { x: 62, z: 38 },
          { x: 38, z: 62 },
          { x: 62, z: 62 },
        ];

        const poleGeom = new THREE.CylinderGeometry(0.08, 0.12, 10, 12);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0xd0d0d0, metalness: 0.9, roughness: 0.2 });

        for (const pos of flagPositions) {
          const pole = new THREE.Mesh(poleGeom, poleMat);
          pole.position.set(pos.x, 5, pos.z);
          pole.castShadow = true;
          this.scene.add(pole);

          // Somaliland Flag banner
          const flagGeom = new THREE.PlaneGeometry(3.0, 1.8);
          const flag = new THREE.Mesh(flagGeom, flagMat);
          flag.position.set(pos.x + 1.5, 8.8, pos.z);
          flag.rotation.y = Math.PI / 6; // Angled as if catching wind
          this.scene.add(flag);

          this.obstacles.push({ x: pos.x, z: pos.z, radius: 0.4, name: 'Flagpole' });
        }
      },
      undefined,
      () => {}
    );
  }

  private buildRoadSigns() {
    const signConfigs = [
      { path: './game_assets/signs/sign_hargeisa.png', x: -13.5, z: -35, w: 3.6, h: 1.5, rot: 0 },
      { path: './game_assets/signs/sign_berbera.png', x: 13.5, z: 35, w: 3.6, h: 1.5, rot: Math.PI },
      { path: './game_assets/signs/sign_borama.png', x: -35, z: 11.5, w: 3.6, h: 1.5, rot: -Math.PI / 2 },
      { path: './game_assets/signs/sign_burco.png', x: 35, z: -11.5, w: 3.6, h: 1.5, rot: Math.PI / 2 },
      { path: './game_assets/signs/speed_limit_60.png', x: -13.5, z: -90, w: 1.6, h: 1.6, rot: 0 },
      { path: './game_assets/signs/speed_limit_80.png', x: 13.5, z: 90, w: 1.6, h: 1.6, rot: Math.PI },
      { path: './game_assets/signs/pedestrian_crossing.png', x: -13.5, z: -14, w: 1.5, h: 1.5, rot: 0 },
      { path: './game_assets/signs/traffic_light.png', x: 13.5, z: -18, w: 1.2, h: 3.2, rot: Math.PI },
      { path: './game_assets/signs/traffic_light.png', x: -13.5, z: 18, w: 1.2, h: 3.2, rot: 0 },
    ];

    const postGeom = new THREE.CylinderGeometry(0.06, 0.08, 4.2, 8);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.6 });

    for (const sc of signConfigs) {
      // 3D Metal Signpost
      const post = new THREE.Mesh(postGeom, postMat);
      post.position.set(sc.x, 2.1, sc.z);
      this.scene.add(post);

      // Signboard texture
      this.textureLoader.load(
        sc.path,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          const signMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
          const board = new THREE.Mesh(new THREE.PlaneGeometry(sc.w, sc.h), signMat);
          board.position.set(sc.x, 3.2, sc.z);
          board.rotation.y = sc.rot;
          this.scene.add(board);
        },
        undefined,
        () => {}
      );

      this.obstacles.push({ x: sc.x, z: sc.z, radius: 0.45, name: 'Road Sign' });
    }
  }

  private buildVegetation() {
    // Palm Trees along avenue
    this.textureLoader.load(
      './game_assets/environment/palm_tree_cluster.png',
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        const palmMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });

        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6e5239, roughness: 0.9 });
        const trunkGeom = new THREE.CylinderGeometry(0.2, 0.35, 7.5, 8);

        for (let z = -240; z <= 240; z += 40) {
          if (Math.abs(z) < 30) continue;
          // Left side palm
          const trunkL = new THREE.Mesh(trunkGeom, trunkMat);
          trunkL.position.set(-15.5, 3.75, z);
          this.scene.add(trunkL);

          const crownL = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), palmMat);
          crownL.position.set(-15.5, 7.5, z);
          this.scene.add(crownL);

          // Right side palm
          const trunkR = new THREE.Mesh(trunkGeom, trunkMat);
          trunkR.position.set(15.5, 3.75, z);
          this.scene.add(trunkR);

          const crownR = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), palmMat);
          crownR.position.set(15.5, 7.5, z);
          this.scene.add(crownR);

          this.obstacles.push({ x: -15.5, z, radius: 0.5, name: 'Palm Tree' });
          this.obstacles.push({ x: 15.5, z, radius: 0.5, name: 'Palm Tree' });
        }
      },
      undefined,
      () => {}
    );

    // Green Shade Trees / Acacia
    this.textureLoader.load(
      './game_assets/environment/green_tree_cluster.png',
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        const treeMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });

        const treeCoords = [
          { x: -55, z: -35 },
          { x: -55, z: 35 },
          { x: 55, z: -35 },
          { x: -75, z: -140 },
          { x: 75, z: 140 },
          { x: -105, z: 40 },
          { x: 105, z: -40 },
        ];

        for (const tc of treeCoords) {
          const tree = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), treeMat);
          tree.position.set(tc.x, 5.0, tc.z);
          this.scene.add(tree);
          this.obstacles.push({ x: tc.x, z: tc.z, radius: 1.2, name: 'Acacia Tree' });
        }
      },
      undefined,
      () => {}
    );
  }

  private buildStreetlights() {
    const postMat = new THREE.MeshStandardMaterial({ color: 0x3a4047, metalness: 0.8, roughness: 0.3 });
    const lampMat = new THREE.MeshStandardMaterial({ color: 0xfff0aa, emissive: 0xffe077, emissiveIntensity: 1.5 });

    for (let z = -220; z <= 220; z += 55) {
      if (Math.abs(z) < 25) continue;
      // Left Streetlight
      const poleL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, 8.5, 10), postMat);
      poleL.position.set(-13.8, 4.25, z);
      this.scene.add(poleL);

      const armL = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.1, 0.1), postMat);
      armL.position.set(-12.8, 8.4, z);
      this.scene.add(armL);

      const lampL = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), lampMat);
      lampL.position.set(-11.8, 8.2, z);
      this.scene.add(lampL);

      // Right Streetlight
      const poleR = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, 8.5, 10), postMat);
      poleR.position.set(13.8, 4.25, z);
      this.scene.add(poleR);

      const armR = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.1, 0.1), postMat);
      armR.position.set(12.8, 8.4, z);
      this.scene.add(armR);

      const lampR = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), lampMat);
      lampR.position.set(11.8, 8.2, z);
      this.scene.add(lampR);

      this.obstacles.push({ x: -13.8, z, radius: 0.4, name: 'Streetlight Pole' });
      this.obstacles.push({ x: 13.8, z, radius: 0.4, name: 'Streetlight Pole' });
    }
  }

  private buildRoadsideProps() {
    // Road barriers & cones texture
    this.textureLoader.load(
      './game_assets/props/road_barriers_and_cones.png',
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        const propMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });

        // Barrier zones near construction / roadside
        const barrierCoords = [
          { x: 12.0, z: -150 },
          { x: 12.0, z: -154 },
          { x: -12.0, z: 150 },
          { x: -12.0, z: 154 },
        ];

        for (const bc of barrierCoords) {
          const barrier = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 1.4), propMat);
          barrier.position.set(bc.x, 0.7, bc.z);
          this.scene.add(barrier);
          this.obstacles.push({ x: bc.x, z: bc.z, radius: 0.8, name: 'Road Barrier' });
        }
      },
      undefined,
      () => {}
    );
  }
}
