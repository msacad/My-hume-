import * as THREE from 'three';
import { CollisionObstacle } from '../physics/VehiclePhysics';

export type CityId = 'hargeisa' | 'berbera' | 'borama' | 'burco';

export interface CityConfig {
  id: CityId;
  name: string;
  somaliName: string;
  tagline: string;
  weather: 'sunny' | 'sunset' | 'night' | 'cloudy';
  groundColor: number;
  skyColor: number;
  fogColor: number;
  spawnPoint: { x: number; z: number; heading: number };
}

export const CITY_CONFIGS: Record<CityId, CityConfig> = {
  hargeisa: {
    id: 'hargeisa',
    name: 'Hargeisa',
    somaliName: 'Hargeysa',
    tagline: 'Capital Heart & Commercial Hub',
    weather: 'sunny',
    groundColor: 0xc4a778,
    skyColor: 0x82bcee,
    fogColor: 0xd6cfb6,
    spawnPoint: { x: 0, z: -100, heading: 0 },
  },
  berbera: {
    id: 'berbera',
    name: 'Berbera',
    somaliName: 'Barbara',
    tagline: 'Red Sea Port & Coastal Highway',
    weather: 'sunny',
    groundColor: 0xdac49b,
    skyColor: 0x64b5f6,
    fogColor: 0xa0c4df,
    spawnPoint: { x: -40, z: -120, heading: 0 },
  },
  borama: {
    id: 'borama',
    name: 'Borama',
    somaliName: 'Boorama',
    tagline: 'Mountain Terraces & Amoud University',
    weather: 'cloudy',
    groundColor: 0x5d8058, // Verdant highland soil
    skyColor: 0x78909c,
    fogColor: 0x90a4ae,
    spawnPoint: { x: 0, z: -120, heading: 0 },
  },
  burco: {
    id: 'burco',
    name: 'Burco',
    somaliName: 'Burao',
    tagline: 'Togdheer Bridge & Desert Crossroads',
    weather: 'sunset',
    groundColor: 0xba7d52, // Reddish dry desert earth
    skyColor: 0xf57c00,
    fogColor: 0xffb74d,
    spawnPoint: { x: 0, z: -140, heading: 0 },
  },
};

export class CityEnvironmentManager {
  public scene: THREE.Scene;
  public obstacles: CollisionObstacle[] = [];
  public currentCity: CityId;
  private textureLoader: THREE.TextureLoader;

  constructor(scene: THREE.Scene, city: CityId = 'hargeisa') {
    this.scene = scene;
    this.currentCity = city;
    this.textureLoader = new THREE.TextureLoader();
    this.buildCity(city);
  }

  buildCity(city: CityId) {
    this.currentCity = city;
    this.obstacles = [];

    // Clear previous environment meshes (keeping lights handled dynamically)
    while (this.scene.children.length > 0) {
      const obj = this.scene.children[0];
      this.scene.remove(obj);
    }

    const cfg = CITY_CONFIGS[city];
    this.setupAtmosphereAndLighting(cfg);

    switch (city) {
      case 'berbera':
        this.buildBerbera();
        break;
      case 'borama':
        this.buildBorama();
        break;
      case 'burco':
        this.buildBurco();
        break;
      case 'hargeisa':
      default:
        this.buildHargeisa();
        break;
    }
  }

  private setupAtmosphereAndLighting(cfg: CityConfig) {
    this.scene.background = new THREE.Color(cfg.skyColor);
    this.scene.fog = new THREE.FogExp2(cfg.fogColor, 0.0035);

    // Sun / Main Directional Light
    const sunLight = new THREE.DirectionalLight(
      cfg.weather === 'sunset' ? 0xffaa66 : 0xfffae8,
      cfg.weather === 'sunset' ? 3.0 : 2.5
    );
    sunLight.position.set(100, 220, 100);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 600;
    const shadowD = 160;
    sunLight.shadow.camera.left = -shadowD;
    sunLight.shadow.camera.right = shadowD;
    sunLight.shadow.camera.top = shadowD;
    sunLight.shadow.camera.bottom = -shadowD;
    this.scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(
      cfg.skyColor,
      cfg.groundColor,
      cfg.weather === 'sunset' ? 0.9 : 1.2
    );
    this.scene.add(hemiLight);
  }

  // -------------------------------------------------------------
  // 1. HARGEISA CITY
  // -------------------------------------------------------------
  private buildHargeisa() {
    const groundGeom = new THREE.PlaneGeometry(900, 900, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xc4a778, roughness: 0.95 });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Distant Naasa Hablood hills
    this.buildConicalHills(-260, -320, 55, 65, 0x9b7e55);
    this.buildConicalHills(-190, -330, 50, 60, 0x9b7e55);

    // Independence Avenue (North-South, 24m wide)
    this.buildAsphaltRoad(0, 0, 24, 600, true);
    // Cross Avenue (East-West, 20m wide)
    this.buildAsphaltRoad(0, 0, 600, 20, false);
    // Outer loop roads
    this.buildAsphaltRoad(130, 0, 16, 500, true);
    this.buildAsphaltRoad(-130, 0, 16, 500, true);
    this.buildAsphaltRoad(0, 160, 320, 16, false);
    this.buildAsphaltRoad(0, -160, 320, 16, false);

    // Freedom Square with MiG-17 Monument
    this.buildMiGMonument(50, 50);

    // Commercial towers and villas
    this.buildUrbanBlocks([
      { x: -32, z: -60, w: 22, d: 24, h: 42, color: 0x1e3a5f, name: 'Dahabshiil Bank Tower' },
      { x: -32, z: -110, w: 20, d: 20, h: 28, color: 0x0f4c3a, name: 'Telesom HQ' },
      { x: -32, z: 60, w: 24, d: 22, h: 36, color: 0xe0dad1, name: 'Hargeisa City Center' },
      { x: 32, z: -60, w: 20, d: 22, h: 32, color: 0xe5e0d8, name: 'Deero Commercial' },
      { x: 32, z: -110, w: 24, d: 20, h: 40, color: 0x224233, name: 'Somaliland Ministry District' },
      { x: 32, z: 110, w: 22, d: 24, h: 30, color: 0x364858, name: 'Golis Business Tower' },
    ]);

    // Somaliland Flagpoles & Signs
    this.buildFlagpoles([
      { x: 0, z: -120 }, { x: 0, z: -60 }, { x: 0, z: 60 }, { x: 0, z: 120 },
      { x: 38, z: 38 }, { x: 62, z: 38 },
    ]);

    this.buildStandardRoadSigns('hargeisa');
  }

  // -------------------------------------------------------------
  // 2. BERBERA PORT CITY
  // -------------------------------------------------------------
  private buildBerbera() {
    // Ground: Sandy coastal beach & desert
    const groundGeom = new THREE.PlaneGeometry(900, 900);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xdec69a, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Gulf of Aden Ocean Plane on the East side (X > 110)
    const oceanGeom = new THREE.PlaneGeometry(400, 900);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x0b5d92,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.9,
    });
    const ocean = new THREE.Mesh(oceanGeom, oceanMat);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.set(310, 0.03, 0);
    this.scene.add(ocean);

    // Coastal Corniche Highway running parallel to ocean (X = 40, Z = -350 to 350)
    this.buildAsphaltRoad(40, 0, 22, 700, true);
    // Port Highway entering mainland
    this.buildAsphaltRoad(-70, 0, 20, 600, true);
    // Cross connections
    this.buildAsphaltRoad(-15, 0, 260, 18, false);
    this.buildAsphaltRoad(-15, 180, 260, 18, false);
    this.buildAsphaltRoad(-15, -180, 260, 18, false);

    // Port Terminal Cranes (Huge Gantry Cranes)
    this.buildPortCrane(85, -60);
    this.buildPortCrane(85, 40);

    // Stacked Shipping Containers (Red, Green, Blue, Yellow)
    this.buildContainerYard(75, -120);
    this.buildContainerYard(75, 120);

    // Berbera Historic Lighthouse
    this.buildLighthouse(90, -220);

    // Port Warehouses & Terminal Buildings
    this.buildUrbanBlocks([
      { x: -20, z: -60, w: 32, d: 24, h: 14, color: 0x334455, name: 'DP World Container Terminal' },
      { x: -20, z: 40, w: 36, d: 24, h: 16, color: 0x2e3b48, name: 'Berbera Customs & Quarantine' },
      { x: -110, z: 0, w: 26, d: 28, h: 22, color: 0xdeb887, name: 'Historic Ottoman Quarter' },
      { x: -110, z: 120, w: 30, d: 30, h: 18, color: 0xc8b291, name: 'Fish Market & Port Logistics' },
    ]);

    this.buildFlagpoles([{ x: 40, z: -100 }, { x: 40, z: 0 }, { x: 40, z: 100 }]);
    this.buildStandardRoadSigns('berbera');
  }

  // -------------------------------------------------------------
  // 3. BORAMA MOUNTAIN & UNIVERSITY CITY
  // -------------------------------------------------------------
  private buildBorama() {
    // Lush green highlands soil
    const groundGeom = new THREE.PlaneGeometry(900, 900);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x567d51, roughness: 0.95 });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Mountainous surrounding ridge
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = Math.cos(angle) * 310;
      const z = Math.sin(angle) * 310;
      this.buildConicalHills(x, z, 70 + (i % 2) * 20, 80 + (i % 3) * 25, 0x476b42);
    }

    // Winding Mountain Pass Highway (Connected S-curves and diagonals)
    this.buildAsphaltRoad(0, 0, 18, 600, true);
    this.buildAsphaltRoad(0, 0, 500, 16, false);
    this.buildAsphaltRoad(-100, 80, 16, 400, true);
    this.buildAsphaltRoad(100, -80, 16, 400, true);

    // Amoud University Grand Gate / Arch
    this.buildUniversityArch(0, 140);

    // University Campus Buildings & Terraced Stone Villas
    this.buildUrbanBlocks([
      { x: -45, z: 160, w: 35, d: 28, h: 22, color: 0xd7ccc8, name: 'Amoud Faculty of Medicine' },
      { x: 45, z: 160, w: 35, d: 28, h: 20, color: 0xbcaaa4, name: 'Amoud Central Library' },
      { x: -40, z: -50, w: 22, d: 22, h: 18, color: 0xa1887f, name: 'Borama Terrace Villa 1' },
      { x: 40, z: -50, w: 24, d: 24, h: 20, color: 0x8d6e63, name: 'Borama Terrace Villa 2' },
      { x: -50, z: -140, w: 26, d: 26, h: 16, color: 0x5d4037, name: 'Borama Trade Cooperative' },
    ]);

    this.buildFlagpoles([{ x: 0, z: 120 }, { x: 0, z: 80 }, { x: 0, z: -80 }]);
    this.buildStandardRoadSigns('borama');
  }

  // -------------------------------------------------------------
  // 4. BURCO TRADE CROSSROADS & TOGDHEER BRIDGE
  // -------------------------------------------------------------
  private buildBurco() {
    // Reddish arid plains earth
    const groundGeom = new THREE.PlaneGeometry(900, 900);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xb57348, roughness: 0.95 });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Sunken Togdheer Dry Riverbed (Wadi) running East-West at Z = 0
    const wadiGeom = new THREE.PlaneGeometry(900, 60);
    const wadiMat = new THREE.MeshStandardMaterial({ color: 0x935d3a, roughness: 0.9 });
    const wadi = new THREE.Mesh(wadiGeom, wadiMat);
    wadi.rotation.x = -Math.PI / 2;
    wadi.position.set(0, -0.4, 0);
    this.scene.add(wadi);

    // Massive Concrete Togdheer Bridge carrying North-South Highway over the wadi
    this.buildTogdheerBridge(0, 0);

    // Main Roads (Burco - Hargeisa / Burco - Berbera Highway)
    this.buildAsphaltRoad(0, -180, 22, 300, true);
    this.buildAsphaltRoad(0, 180, 22, 300, true);
    this.buildAsphaltRoad(-120, 0, 18, 500, true);
    this.buildAsphaltRoad(120, 0, 18, 500, true);
    this.buildAsphaltRoad(0, 160, 400, 16, false);
    this.buildAsphaltRoad(0, -160, 400, 16, false);

    // Livestock Market Trading Gates & Commercial Bazaars
    this.buildUrbanBlocks([
      { x: -40, z: -100, w: 32, d: 36, h: 14, color: 0x9e5432, name: 'Burco Central Livestock Market' },
      { x: 40, z: -100, w: 28, d: 30, h: 16, color: 0x794628, name: 'Togdheer Grain & Spice Bazaars' },
      { x: -40, z: 100, w: 26, d: 24, h: 24, color: 0xc49a6c, name: 'Burco Commercial Plaza' },
      { x: 40, z: 100, w: 30, d: 28, h: 28, color: 0xb58654, name: 'Burco Hotel & Travel Lodge' },
    ]);

    this.buildFlagpoles([{ x: 0, z: -60 }, { x: 0, z: 60 }, { x: 16, z: 0 }, { x: -16, z: 0 }]);
    this.buildStandardRoadSigns('burco');
  }

  // -------------------------------------------------------------
  // HELPER BUILDERS
  // -------------------------------------------------------------
  private buildAsphaltRoad(x: number, z: number, width: number, length: number, isVertical: boolean) {
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x22262a, roughness: 0.8, metalness: 0.1 });
    const road = new THREE.Mesh(new THREE.PlaneGeometry(width, length), roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(x, 0.02, z);
    road.receiveShadow = true;
    this.scene.add(road);

    // Yellow Center Lines
    const yellowMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xeeeeee });

    if (isVertical) {
      const line1 = new THREE.Mesh(new THREE.PlaneGeometry(0.2, length), yellowMat);
      line1.rotation.x = -Math.PI / 2;
      line1.position.set(x - 0.25, 0.035, z);
      this.scene.add(line1);

      const line2 = new THREE.Mesh(new THREE.PlaneGeometry(0.2, length), yellowMat);
      line2.rotation.x = -Math.PI / 2;
      line2.position.set(x + 0.25, 0.035, z);
      this.scene.add(line2);

      // Sidewalks
      const swMat = new THREE.MeshStandardMaterial({ color: 0x90969d, roughness: 0.85 });
      const swL = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.2, length), swMat);
      swL.position.set(x - width / 2 - 1.75, 0.1, z);
      this.scene.add(swL);

      const swR = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.2, length), swMat);
      swR.position.set(x + width / 2 + 1.75, 0.1, z);
      this.scene.add(swR);
    } else {
      const line1 = new THREE.Mesh(new THREE.PlaneGeometry(width, 0.2), yellowMat);
      line1.rotation.x = -Math.PI / 2;
      line1.position.set(x, 0.035, z - 0.25);
      this.scene.add(line1);

      const line2 = new THREE.Mesh(new THREE.PlaneGeometry(width, 0.2), yellowMat);
      line2.rotation.x = -Math.PI / 2;
      line2.position.set(x, 0.035, z + 0.25);
      this.scene.add(line2);
    }
  }

  private buildConicalHills(x: number, z: number, radius: number, height: number, color: number) {
    const geom = new THREE.ConeGeometry(radius, height, 16);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(x, height / 2, z);
    this.scene.add(mesh);
  }

  private buildMiGMonument(x: number, z: number) {
    const plaza = new THREE.Mesh(
      new THREE.CylinderGeometry(28, 28, 0.4, 32),
      new THREE.MeshStandardMaterial({ color: 0xded5be, roughness: 0.8 })
    );
    plaza.position.set(x, 0.2, z);
    plaza.receiveShadow = true;
    this.scene.add(plaza);
    this.obstacles.push({ x, z, radius: 26, name: 'Freedom Square' });

    const base = new THREE.Mesh(
      new THREE.BoxGeometry(6, 4.5, 12),
      new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.6 })
    );
    base.position.set(x, 2.5, z);
    base.rotation.y = Math.PI / 4;
    base.castShadow = true;
    this.scene.add(base);

    const jetMat = new THREE.MeshStandardMaterial({ color: 0x4d6642, metalness: 0.8, roughness: 0.3 });
    const jet = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 11, 16), jetMat);
    jet.position.set(x, 6.2, z);
    jet.rotation.set(0.3, Math.PI / 4, 0.1);
    this.scene.add(jet);
  }

  private buildPortCrane(x: number, z: number) {
    const craneMat = new THREE.MeshStandardMaterial({ color: 0x2979ff, metalness: 0.8, roughness: 0.3 });
    const craneGroup = new THREE.Group();

    // 4 Legs
    for (let dx = -4; dx <= 4; dx += 8) {
      for (let dz = -6; dz <= 6; dz += 12) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 24, 8), craneMat);
        leg.position.set(dx, 12, dz);
        craneGroup.add(leg);
      }
    }
    // Overhead Boom
    const boom = new THREE.Mesh(new THREE.BoxGeometry(10, 2, 38), craneMat);
    boom.position.set(0, 24, 6);
    craneGroup.add(boom);

    craneGroup.position.set(x, 0, z);
    this.scene.add(craneGroup);
    this.obstacles.push({ x, z, radius: 8, name: 'Port Gantry Crane' });
  }

  private buildContainerYard(x: number, z: number) {
    const colors = [0xd32f2f, 0x1976d2, 0x388e3c, 0xfbc02d, 0xf57c00];
    let idx = 0;
    for (let r = -2; r <= 2; r++) {
      for (let c = 0; c < 3; c++) {
        const h = (c + 1) * 2.6;
        const col = colors[(idx++) % colors.length];
        const box = new THREE.Mesh(
          new THREE.BoxGeometry(2.5, 2.5, 6.0),
          new THREE.MeshStandardMaterial({ color: col, roughness: 0.6 })
        );
        box.position.set(x + r * 3.0, h - 1.25, z + (idx % 2) * 6.5);
        box.castShadow = true;
        this.scene.add(box);
      }
    }
    this.obstacles.push({ x, z, radius: 10, name: 'Cargo Container Stack' });
  }

  private buildLighthouse(x: number, z: number) {
    const lhGroup = new THREE.Group();
    const tower = new THREE.Mesh(
      new THREE.CylinderGeometry(2.0, 3.8, 28, 16),
      new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.5 })
    );
    tower.position.set(0, 14, 0);
    lhGroup.add(tower);

    // Red bands
    const band = new THREE.Mesh(
      new THREE.CylinderGeometry(2.6, 2.9, 4, 16),
      new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.5 })
    );
    band.position.set(0, 16, 0);
    lhGroup.add(band);

    // Lamp
    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(1.4, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xfff9c4, emissive: 0xffeb3b, emissiveIntensity: 2 })
    );
    lamp.position.set(0, 29, 0);
    lhGroup.add(lamp);

    lhGroup.position.set(x, 0, z);
    this.scene.add(lhGroup);
    this.obstacles.push({ x, z, radius: 4, name: 'Berbera Lighthouse' });
  }

  private buildUniversityArch(x: number, z: number) {
    const archMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 8, 2.5), archMat);
    p1.position.set(x - 11, 4, z);
    this.scene.add(p1);

    const p2 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 8, 2.5), archMat);
    p2.position.set(x + 11, 4, z);
    this.scene.add(p2);

    const top = new THREE.Mesh(new THREE.BoxGeometry(26, 2.2, 3.0), archMat);
    top.position.set(x, 8.5, z);
    this.scene.add(top);

    // Somaliland Green Arch Badge
    const badge = new THREE.Mesh(
      new THREE.BoxGeometry(14, 1.2, 3.1),
      new THREE.MeshStandardMaterial({ color: 0x0c6834, roughness: 0.3 })
    );
    badge.position.set(x, 8.5, z);
    this.scene.add(badge);

    this.obstacles.push({ x: x - 11, z, radius: 2, name: 'Amoud Arch Left Pillar' });
    this.obstacles.push({ x: x + 11, z, radius: 2, name: 'Amoud Arch Right Pillar' });
  }

  private buildTogdheerBridge(x: number, z: number) {
    const bridgeMat = new THREE.MeshStandardMaterial({ color: 0x616161, roughness: 0.7 });
    // Road surface across wadi (60m gap)
    const deck = new THREE.Mesh(new THREE.BoxGeometry(22, 1.0, 68), bridgeMat);
    deck.position.set(x, 0.45, z);
    deck.castShadow = true;
    this.scene.add(deck);

    // Concrete Guardrails
    const railMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.5 });
    const railL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 68), railMat);
    railL.position.set(x - 10.6, 1.1, z);
    this.scene.add(railL);

    const railR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 68), railMat);
    railR.position.set(x + 10.6, 1.1, z);
    this.scene.add(railR);

    // Supporting Pillars
    for (const pz of [-20, 0, 20]) {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.2, 5.0, 16), bridgeMat);
      pillar.position.set(x, -2.0, z + pz);
      this.scene.add(pillar);
    }
  }

  private buildUrbanBlocks(
    blocks: Array<{ x: number; z: number; w: number; d: number; h: number; color: number; name: string }>
  ) {
    for (const b of blocks) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(b.w, b.h, b.d),
        new THREE.MeshStandardMaterial({ color: b.color, roughness: 0.65, metalness: 0.25 })
      );
      mesh.position.set(b.x, b.h / 2, b.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);

      // Windows
      const winMat = new THREE.MeshStandardMaterial({ color: 0x1a2634, metalness: 0.9, roughness: 0.1 });
      const win = new THREE.Mesh(new THREE.PlaneGeometry(b.w * 0.85, b.h * 0.75), winMat);
      win.position.set(b.x, b.h / 2, b.z + (b.z < 0 ? -b.d / 2 - 0.05 : b.d / 2 + 0.05));
      this.scene.add(win);

      this.obstacles.push({ x: b.x, z: b.z, radius: Math.max(b.w, b.d) / 1.7, name: b.name });
    }
  }

  private buildFlagpoles(positions: Array<{ x: number; z: number }>) {
    this.textureLoader.load(
      './game_assets/flags/somaliland_flag_01.png',
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        const flagMat = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide });
        const poleMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.2 });

        for (const pos of positions) {
          const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 10, 10), poleMat);
          pole.position.set(pos.x, 5, pos.z);
          this.scene.add(pole);

          const flag = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.8), flagMat);
          flag.position.set(pos.x + 1.5, 8.8, pos.z);
          flag.rotation.y = Math.PI / 6;
          this.scene.add(flag);

          this.obstacles.push({ x: pos.x, z: pos.z, radius: 0.4, name: 'Flagpole' });
        }
      },
      undefined,
      () => {}
    );
  }

  private buildStandardRoadSigns(activeCity: CityId) {
    const signs = [
      { path: './game_assets/signs/speed_limit_60.png', x: -13.5, z: -80, w: 1.6, h: 1.6, rot: 0 },
      { path: './game_assets/signs/speed_limit_80.png', x: 13.5, z: 80, w: 1.6, h: 1.6, rot: Math.PI },
      { path: './game_assets/signs/traffic_light.png', x: 13.5, z: -20, w: 1.2, h: 3.2, rot: Math.PI },
      { path: './game_assets/signs/traffic_light.png', x: -13.5, z: 20, w: 1.2, h: 3.2, rot: 0 },
      { path: './game_assets/signs/pedestrian_crossing.png', x: -13.5, z: -15, w: 1.5, h: 1.5, rot: 0 },
    ];

    // Direction sign specific to city
    let citySign = './game_assets/signs/sign_hargeisa.png';
    if (activeCity === 'berbera') citySign = './game_assets/signs/sign_berbera.png';
    if (activeCity === 'borama') citySign = './game_assets/signs/sign_borama.png';
    if (activeCity === 'burco') citySign = './game_assets/signs/sign_burco.png';

    signs.push({ path: citySign, x: -13.5, z: -35, w: 3.6, h: 1.5, rot: 0 });

    const postGeom = new THREE.CylinderGeometry(0.06, 0.08, 4.2, 8);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.6 });

    for (const sc of signs) {
      const post = new THREE.Mesh(postGeom, postMat);
      post.position.set(sc.x, 2.1, sc.z);
      this.scene.add(post);

      this.textureLoader.load(
        sc.path,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          const board = new THREE.Mesh(
            new THREE.PlaneGeometry(sc.w, sc.h),
            new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide })
          );
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
}
