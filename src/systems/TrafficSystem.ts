import * as THREE from 'three';
import { CollisionObstacle } from '../physics/VehiclePhysics';

export interface TrafficVehicle {
  id: number;
  mesh: THREE.Group;
  category: 'sedan' | 'minibus' | 'pickup';
  x: number;
  z: number;
  heading: number; // in radians
  speed: number; // m/s
  targetSpeed: number; // m/s
  lane: 'NS_South' | 'NS_North' | 'EW_East' | 'EW_West';
  color: number;
}

export interface Pedestrian {
  id: number;
  mesh: THREE.Group;
  x: number;
  z: number;
  targetX: number;
  targetZ: number;
  speed: number;
  isCrossing: boolean;
}

export class TrafficSystem {
  public scene: THREE.Scene;
  public vehicles: TrafficVehicle[] = [];
  public pedestrians: Pedestrian[] = [];
  public obstacles: CollisionObstacle[] = [];

  // Traffic Light state machine
  public trafficLightState: 'NS_GREEN' | 'NS_YELLOW' | 'EW_GREEN' | 'EW_YELLOW' = 'NS_GREEN';
  private lightTimer: number = 0;

  // Max vehicles based on graphics setting
  private maxVehicles: number = 10;
  private maxPedestrians: number = 8;
  private nextVehicleId: number = 1;

  constructor(scene: THREE.Scene, isHighGraphics: boolean = true) {
    this.scene = scene;
    this.maxVehicles = isHighGraphics ? 12 : 6;
    this.maxPedestrians = isHighGraphics ? 8 : 4;
    this.initTraffic();
    this.initPedestrians();
  }

  private initTraffic() {
    for (let i = 0; i < this.maxVehicles; i++) {
      this.spawnRandomVehicle();
    }
  }

  private initPedestrians() {
    for (let i = 0; i < this.maxPedestrians; i++) {
      this.spawnPedestrian(i);
    }
  }

  private spawnRandomVehicle() {
    const lanes: Array<'NS_South' | 'NS_North' | 'EW_East' | 'EW_West'> = [
      'NS_South',
      'NS_North',
      'EW_East',
      'EW_West',
    ];
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    const categories: Array<'sedan' | 'minibus' | 'pickup'> = ['sedan', 'minibus', 'pickup'];
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const colors = [0xd32f2f, 0x1976d2, 0x388e3c, 0xf5f5f5, 0x212121, 0xffa000, 0x0c6834];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const mesh = this.createAIVehicleMesh(cat, color);

    let x = 0;
    let z = 0;
    let heading = 0;

    switch (lane) {
      case 'NS_South':
        x = 5.5;
        z = (Math.random() - 0.5) * 440;
        heading = 0; // forward along -Z
        break;
      case 'NS_North':
        x = -5.5;
        z = (Math.random() - 0.5) * 440;
        heading = Math.PI; // forward along +Z
        break;
      case 'EW_East':
        x = (Math.random() - 0.5) * 440;
        z = 4.5;
        heading = -Math.PI / 2;
        break;
      case 'EW_West':
        x = (Math.random() - 0.5) * 440;
        z = -4.5;
        heading = Math.PI / 2;
        break;
    }

    mesh.position.set(x, 0.45, z);
    mesh.rotation.y = heading;
    this.scene.add(mesh);

    const vehicle: TrafficVehicle = {
      id: this.nextVehicleId++,
      mesh,
      category: cat,
      x,
      z,
      heading,
      speed: 8 + Math.random() * 6,
      targetSpeed: 10 + Math.random() * 5,
      lane,
      color,
    };

    this.vehicles.push(vehicle);
  }

  private createAIVehicleMesh(category: 'sedan' | 'minibus' | 'pickup', color: number): THREE.Group {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.6 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x111b24, roughness: 0.1, metalness: 0.9 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x1f2226, roughness: 0.9 });

    if (category === 'minibus') {
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.4, 4.8), bodyMat);
      body.position.set(0, 0.85, 0);
      body.castShadow = true;
      group.add(body);

      const winL = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.5), glassMat);
      winL.position.set(-0.96, 1.1, 0.1);
      winL.rotation.y = -Math.PI / 2;
      group.add(winL);

      const winR = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.5), glassMat);
      winR.position.set(0.96, 1.1, 0.1);
      winR.rotation.y = Math.PI / 2;
      group.add(winR);
    } else if (category === 'pickup') {
      const cab = new THREE.Mesh(new THREE.BoxGeometry(1.95, 1.1, 2.4), bodyMat);
      cab.position.set(0, 0.75, -1.0);
      cab.castShadow = true;
      group.add(cab);

      const bed = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.5, 2.2), bodyMat);
      bed.position.set(0, 0.6, 1.1);
      bed.castShadow = true;
      group.add(bed);
    } else {
      // Sedan
      const lower = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.5, 4.4), bodyMat);
      lower.position.set(0, 0.5, 0);
      lower.castShadow = true;
      group.add(lower);

      const upper = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.48, 2.2), glassMat);
      upper.position.set(0, 0.95, 0.1);
      group.add(upper);
    }

    // 4 Wheels
    for (const sx of [-0.9, 0.9]) {
      for (const sz of [-1.4, 1.4]) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.26, 12), tireMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(sx, 0.36, sz);
        group.add(wheel);
      }
    }

    // Headlights
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xfff9e6 });
    const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.08), lightMat);
    hl1.position.set(-0.65, 0.55, -2.25);
    group.add(hl1);

    const hl2 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.08), lightMat);
    hl2.position.set(0.65, 0.55, -2.25);
    group.add(hl2);

    return group;
  }

  private spawnPedestrian(idx: number) {
    const pedGroup = new THREE.Group();
    // Torso / shirt
    const shirtMat = new THREE.MeshStandardMaterial({
      color: [0x1565c0, 0x2e7d32, 0xc62828, 0xef6c00, 0x6a1b9a][idx % 5],
      roughness: 0.8,
    });
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 0.25), shirtMat);
    torso.position.set(0, 1.0, 0);
    pedGroup.add(torso);

    // Head
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.8 })
    );
    head.position.set(0, 1.5, 0);
    pedGroup.add(head);

    // Legs
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.9 });
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.7, 0.18), pantsMat);
    legL.position.set(-0.12, 0.35, 0);
    pedGroup.add(legL);

    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.7, 0.18), pantsMat);
    legR.position.set(0.12, 0.35, 0);
    pedGroup.add(legR);

    // Spawn on sidewalk
    const side = idx % 2 === 0 ? -14.5 : 14.5;
    const startZ = -180 + idx * 45;
    pedGroup.position.set(side, 0.1, startZ);
    this.scene.add(pedGroup);

    this.pedestrians.push({
      id: idx,
      mesh: pedGroup,
      x: side,
      z: startZ,
      targetX: side,
      targetZ: startZ + (Math.random() > 0.5 ? 80 : -80),
      speed: 1.2 + Math.random() * 0.4,
      isCrossing: false,
    });
  }

  update(delta: number, playerPos: THREE.Vector3) {
    const dt = Math.min(delta, 0.05);

    // 1. Update Traffic Light Cycle
    this.lightTimer += dt;
    if (this.trafficLightState === 'NS_GREEN' && this.lightTimer > 12) {
      this.trafficLightState = 'NS_YELLOW';
      this.lightTimer = 0;
    } else if (this.trafficLightState === 'NS_YELLOW' && this.lightTimer > 3) {
      this.trafficLightState = 'EW_GREEN';
      this.lightTimer = 0;
    } else if (this.trafficLightState === 'EW_GREEN' && this.lightTimer > 12) {
      this.trafficLightState = 'EW_YELLOW';
      this.lightTimer = 0;
    } else if (this.trafficLightState === 'EW_YELLOW' && this.lightTimer > 3) {
      this.trafficLightState = 'NS_GREEN';
      this.lightTimer = 0;
    }

    // 2. Update AI Traffic Vehicles
    this.obstacles = [];

    for (let i = 0; i < this.vehicles.length; i++) {
      const v = this.vehicles[i];

      // Check distance to traffic light stop lines at central intersection (X: 0, Z: 0)
      let mustStopForLight = false;
      if (v.lane === 'NS_South' && (this.trafficLightState === 'EW_GREEN' || this.trafficLightState === 'NS_YELLOW')) {
        if (v.z < -22 && v.z > -36) mustStopForLight = true;
      } else if (v.lane === 'NS_North' && (this.trafficLightState === 'EW_GREEN' || this.trafficLightState === 'NS_YELLOW')) {
        if (v.z > 22 && v.z < 36) mustStopForLight = true;
      } else if (v.lane === 'EW_East' && (this.trafficLightState === 'NS_GREEN' || this.trafficLightState === 'EW_YELLOW')) {
        if (v.x < -22 && v.x > -36) mustStopForLight = true;
      } else if (v.lane === 'EW_West' && (this.trafficLightState === 'NS_GREEN' || this.trafficLightState === 'EW_YELLOW')) {
        if (v.x > 22 && v.x < 36) mustStopForLight = true;
      }

      // Check distance to player vehicle
      const distToPlayer = Math.hypot(v.x - playerPos.x, v.z - playerPos.z);
      const isPlayerAhead = distToPlayer < 18;

      // Check distance to preceding AI vehicle
      let isVehicleAhead = false;
      for (let j = 0; j < this.vehicles.length; j++) {
        if (i === j) continue;
        const other = this.vehicles[j];
        if (other.lane === v.lane) {
          const dist = Math.hypot(v.x - other.x, v.z - other.z);
          if (dist < 14) {
            isVehicleAhead = true;
            break;
          }
        }
      }

      // Brake or accelerate
      if (mustStopForLight || isPlayerAhead || isVehicleAhead) {
        v.speed = Math.max(0, v.speed - 12 * dt);
      } else {
        v.speed = Math.min(v.targetSpeed, v.speed + 6 * dt);
      }

      // Move along lane
      switch (v.lane) {
        case 'NS_South':
          v.z += v.speed * dt;
          if (v.z > 260) v.z = -260; // Loop lane
          break;
        case 'NS_North':
          v.z -= v.speed * dt;
          if (v.z < -260) v.z = 260;
          break;
        case 'EW_East':
          v.x += v.speed * dt;
          if (v.x > 260) v.x = -260;
          break;
        case 'EW_West':
          v.x -= v.speed * dt;
          if (v.x < -260) v.x = 260;
          break;
      }

      v.mesh.position.set(v.x, 0.45, v.z);

      // Register as obstacle for player collision
      this.obstacles.push({
        x: v.x,
        z: v.z,
        radius: 1.8,
        name: `AI Traffic ${v.category}`,
      });
    }

    // 3. Update Pedestrians
    for (const p of this.pedestrians) {
      const dz = p.targetZ - p.z;
      if (Math.abs(dz) < 1.0) {
        p.targetZ = p.z + (Math.random() > 0.5 ? 90 : -90);
      } else {
        const step = Math.sign(dz) * p.speed * dt;
        p.z += step;
        p.mesh.position.set(p.x, 0.1, p.z);
        // Face walking direction
        p.mesh.rotation.y = dz > 0 ? 0 : Math.PI;
      }
    }
  }

  dispose() {
    for (const v of this.vehicles) {
      this.scene.remove(v.mesh);
    }
    for (const p of this.pedestrians) {
      this.scene.remove(p.mesh);
    }
    this.vehicles = [];
    this.pedestrians = [];
    this.obstacles = [];
  }
}
