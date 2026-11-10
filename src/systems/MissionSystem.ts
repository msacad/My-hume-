import * as THREE from 'three';
import { CityId } from '../environment/CityEnvironments';

export type GameMode = 'freedrive' | 'career' | 'parking' | 'checkpoint' | 'timetrial';

export interface CheckpointData {
  x: number;
  z: number;
  radius: number;
  label: string;
}

export interface MissionDefinition {
  id: string;
  title: string;
  somaliTitle: string;
  cityId: CityId;
  mode: GameMode;
  description: string;
  timeLimitSec: number;
  rewardCoins: number;
  rewardXP: number;
  checkpoints: CheckpointData[];
  parkingZone?: { x: number; z: number; heading: number; width: number; length: number };
}

export const MISSIONS: MissionDefinition[] = [
  {
    id: 'm1_hargeisa_tour',
    title: 'Hargeisa City Tour',
    somaliTitle: 'Socdaalka Hargeysa',
    cityId: 'hargeisa',
    mode: 'checkpoint',
    description: 'Drive along Independence Avenue and pass through 4 city checkpoints to Freedom Square.',
    timeLimitSec: 75,
    rewardCoins: 500,
    rewardXP: 300,
    checkpoints: [
      { x: 0, z: -40, radius: 6.0, label: 'Ministry Junction' },
      { x: 0, z: 20, radius: 6.0, label: 'Independence Cross' },
      { x: 45, z: 45, radius: 7.0, label: 'Freedom Square Plaza' },
      { x: 0, z: 120, radius: 6.0, label: 'South Gate' },
    ],
  },
  {
    id: 'm2_hargeisa_parking',
    title: 'Precision Parallel Parking',
    somaliTitle: 'Baakinka Toosan',
    cityId: 'hargeisa',
    mode: 'parking',
    description: 'Navigate to the Dahabshiil Center bay and park inside the marked zone within 45 seconds.',
    timeLimitSec: 50,
    rewardCoins: 650,
    rewardXP: 400,
    checkpoints: [],
    parkingZone: {
      x: -16.5,
      z: -60,
      heading: 0,
      width: 3.2,
      length: 6.5,
    },
  },
  {
    id: 'm3_berbera_cargo',
    title: 'Berbera Container Express',
    somaliTitle: 'Gudbinta Dekedda Barbara',
    cityId: 'berbera',
    mode: 'timetrial',
    description: 'Sprint along the coastal highway from the port entrance gate to the lighthouse terminal.',
    timeLimitSec: 80,
    rewardCoins: 900,
    rewardXP: 550,
    checkpoints: [
      { x: 40, z: -80, radius: 7.0, label: 'Port Customs Gate' },
      { x: 40, z: 40, radius: 7.0, label: 'Container Yard 1' },
      { x: 40, z: 140, radius: 7.0, label: 'Beach Corniche' },
      { x: 80, z: -200, radius: 8.0, label: 'Lighthouse Pier' },
    ],
  },
  {
    id: 'm4_borama_hillclimb',
    title: 'Amoud University Hillclimb',
    somaliTitle: 'Buuralayda Jaamacadda Camuud',
    cityId: 'borama',
    mode: 'checkpoint',
    description: 'Ascend the winding mountain highway and reach the grand Amoud University entrance arch.',
    timeLimitSec: 70,
    rewardCoins: 1100,
    rewardXP: 650,
    checkpoints: [
      { x: 0, z: -60, radius: 6.5, label: 'Highland Bridge' },
      { x: 0, z: 20, radius: 6.5, label: 'Terrace Road' },
      { x: 0, z: 135, radius: 8.0, label: 'Amoud Grand Arch' },
    ],
  },
  {
    id: 'm5_burco_bridge',
    title: 'Togdheer Bridge Highway Sprint',
    somaliTitle: 'Buundada Togdheer Burao',
    cityId: 'burco',
    mode: 'timetrial',
    description: 'Cross the iconic Togdheer dry-river bridge at high speed and reach the central livestock gate.',
    timeLimitSec: 65,
    rewardCoins: 1250,
    rewardXP: 750,
    checkpoints: [
      { x: 0, z: -90, radius: 7.0, label: 'North Approach' },
      { x: 0, z: 0, radius: 8.0, label: 'Togdheer Bridge Midpoint' },
      { x: 0, z: 100, radius: 7.0, label: 'Livestock Trading Gate' },
    ],
  },
];

export class MissionManager {
  public scene: THREE.Scene;
  public activeMission: MissionDefinition | null = null;
  public currentCheckpointIndex: number = 0;
  public timeRemaining: number = 0;
  public isCompleted: boolean = false;
  public isFailed: boolean = false;
  public earnedCoins: number = 0;
  public earnedXP: number = 0;
  public earnedStars: number = 0;

  // 3D visual markers
  private checkpointMesh: THREE.Group | null = null;
  private parkingZoneMesh: THREE.Group | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  startMission(mission: MissionDefinition) {
    this.clearVisuals();
    this.activeMission = mission;
    this.currentCheckpointIndex = 0;
    this.timeRemaining = mission.timeLimitSec;
    this.isCompleted = false;
    this.isFailed = false;
    this.earnedCoins = 0;
    this.earnedXP = 0;
    this.earnedStars = 0;

    if (mission.checkpoints.length > 0) {
      this.spawnCheckpointVisual(mission.checkpoints[0]);
    } else if (mission.parkingZone) {
      this.spawnParkingVisual(mission.parkingZone);
    }
  }

  update(delta: number, playerX: number, playerZ: number, playerHeading: number, playerSpeed: number): {
    completed: boolean;
    failed: boolean;
    checkpointPassed: boolean;
  } {
    if (!this.activeMission || this.isCompleted || this.isFailed) {
      return { completed: false, failed: false, checkpointPassed: false };
    }

    // Countdown Timer
    this.timeRemaining = Math.max(0, this.timeRemaining - delta);
    if (this.timeRemaining <= 0) {
      this.isFailed = true;
      this.clearVisuals();
      return { completed: false, failed: true, checkpointPassed: false };
    }

    // Pulse visual ring
    if (this.checkpointMesh) {
      this.checkpointMesh.rotation.y += delta * 2;
    }

    // Checkpoint Mode Logic
    if (this.activeMission.checkpoints.length > 0) {
      const targetCp = this.activeMission.checkpoints[this.currentCheckpointIndex];
      const dist = Math.hypot(playerX - targetCp.x, playerZ - targetCp.z);

      if (dist < targetCp.radius) {
        this.currentCheckpointIndex++;
        if (this.currentCheckpointIndex >= this.activeMission.checkpoints.length) {
          // Mission Complete!
          this.completeMission();
          return { completed: true, failed: false, checkpointPassed: true };
        } else {
          // Next checkpoint
          this.spawnCheckpointVisual(this.activeMission.checkpoints[this.currentCheckpointIndex]);
          return { completed: false, failed: false, checkpointPassed: true };
        }
      }
    }

    // Parking Mode Logic
    if (this.activeMission.parkingZone) {
      const pz = this.activeMission.parkingZone;
      const dx = Math.abs(playerX - pz.x);
      const dz = Math.abs(playerZ - pz.z);
      const isStopped = Math.abs(playerSpeed) < 0.2;

      if (dx < pz.width * 0.45 && dz < pz.length * 0.45 && isStopped) {
        this.completeMission();
        return { completed: true, failed: false, checkpointPassed: true };
      }
    }

    return { completed: false, failed: false, checkpointPassed: false };
  }

  private completeMission() {
    if (!this.activeMission) return;
    this.isCompleted = true;
    this.clearVisuals();

    // Calculate stars based on remaining time percentage
    const timeRatio = this.timeRemaining / this.activeMission.timeLimitSec;
    if (timeRatio > 0.4) this.earnedStars = 3;
    else if (timeRatio > 0.15) this.earnedStars = 2;
    else this.earnedStars = 1;

    this.earnedCoins = this.activeMission.rewardCoins;
    this.earnedXP = this.activeMission.rewardXP;
  }

  private spawnCheckpointVisual(cp: CheckpointData) {
    this.clearVisuals();
    const group = new THREE.Group();

    // Glowing green-gold pulsed torus ring
    const ringGeom = new THREE.TorusGeometry(cp.radius * 0.7, 0.35, 16, 32);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x00e676,
      emissive: 0x00e676,
      emissiveIntensity: 2.2,
      roughness: 0.2,
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 1.8;
    group.add(ring);

    // Vertical beacon light beam
    const beamGeom = new THREE.CylinderGeometry(cp.radius * 0.5, cp.radius * 0.5, 25, 16);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x00e676,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const beam = new THREE.Mesh(beamGeom, beamMat);
    beam.position.y = 12.5;
    group.add(beam);

    group.position.set(cp.x, 0, cp.z);
    this.scene.add(group);
    this.checkpointMesh = group;
  }

  private spawnParkingVisual(pz: { x: number; z: number; heading: number; width: number; length: number }) {
    this.clearVisuals();
    const group = new THREE.Group();

    // Glowing green bay outline
    const outlineMat = new THREE.MeshBasicMaterial({ color: 0x00e676 });
    const floorMat = new THREE.MeshBasicMaterial({ color: 0x00e676, transparent: true, opacity: 0.25 });

    const bayFloor = new THREE.Mesh(new THREE.PlaneGeometry(pz.width, pz.length), floorMat);
    bayFloor.rotation.x = -Math.PI / 2;
    bayFloor.position.y = 0.05;
    group.add(bayFloor);

    // Corner posts
    for (const sx of [-pz.width / 2, pz.width / 2]) {
      for (const sz of [-pz.length / 2, pz.length / 2]) {
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.12, 1.2, 8),
          new THREE.MeshStandardMaterial({ color: 0xffd600, emissive: 0xffab00, emissiveIntensity: 1 })
        );
        post.position.set(sx, 0.6, sz);
        group.add(post);
      }
    }

    group.position.set(pz.x, 0, pz.z);
    group.rotation.y = pz.heading;
    this.scene.add(group);
    this.parkingZoneMesh = group;
  }

  clearVisuals() {
    if (this.checkpointMesh) {
      this.scene.remove(this.checkpointMesh);
      this.checkpointMesh = null;
    }
    if (this.parkingZoneMesh) {
      this.scene.remove(this.parkingZoneMesh);
      this.parkingZoneMesh = null;
    }
  }

  dispose() {
    this.clearVisuals();
    this.activeMission = null;
  }
}
