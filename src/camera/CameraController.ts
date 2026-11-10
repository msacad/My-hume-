import * as THREE from 'three';

export type CameraViewMode = 'chase' | 'hood' | 'cockpit' | 'cinematic';

export class CameraController {
  public camera: THREE.PerspectiveCamera;
  public mode: CameraViewMode = 'chase';

  // Smooth interpolation vectors
  private currentCameraPos: THREE.Vector3 = new THREE.Vector3(0, 5, 10);
  private currentLookAt: THREE.Vector3 = new THREE.Vector3(0, 1, 0);

  // Cinematic orbit angle
  private orbitAngle: number = 0;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
  }

  nextMode(): CameraViewMode {
    const modes: CameraViewMode[] = ['chase', 'hood', 'cockpit', 'cinematic'];
    const idx = modes.indexOf(this.mode);
    this.mode = modes[(idx + 1) % modes.length];
    return this.mode;
  }

  setMode(mode: CameraViewMode) {
    this.mode = mode;
  }

  update(
    delta: number,
    vehiclePos: THREE.Vector3,
    headingAngle: number,
    speedKmH: number
  ) {
    const dt = Math.min(delta, 0.05);

    // Forward and Right vectors of the vehicle
    const forwardX = -Math.sin(headingAngle);
    const forwardZ = -Math.cos(headingAngle);

    const targetPos = new THREE.Vector3();
    const targetLookAt = new THREE.Vector3();

    switch (this.mode) {
      case 'chase': {
        // Dynamic camera distance expanding with speed
        const speedExpansion = Math.min(3.5, (speedKmH / 180) * 3.0);
        const distance = 8.5 + speedExpansion;
        const height = 3.6 + speedExpansion * 0.35;

        // Position camera behind the vehicle
        targetPos.set(
          vehiclePos.x - forwardX * distance,
          vehiclePos.y + height,
          vehiclePos.z - forwardZ * distance
        );

        // Look at point slightly in front of and above the vehicle
        targetLookAt.set(
          vehiclePos.x + forwardX * 4.0,
          vehiclePos.y + 1.2,
          vehiclePos.z + forwardZ * 4.0
        );

        // Smooth follow lerp (faster at higher speeds to keep vehicle in frame)
        const lerpFactor = Math.min(1.0, 7.5 * dt);
        this.currentCameraPos.lerp(targetPos, lerpFactor);
        this.currentLookAt.lerp(targetLookAt, lerpFactor * 1.2);

        this.camera.position.copy(this.currentCameraPos);
        this.camera.lookAt(this.currentLookAt);
        break;
      }

      case 'hood': {
        // Hood mounted camera
        targetPos.set(
          vehiclePos.x + forwardX * 1.6,
          vehiclePos.y + 1.25,
          vehiclePos.z + forwardZ * 1.6
        );
        targetLookAt.set(
          vehiclePos.x + forwardX * 35.0,
          vehiclePos.y + 1.2,
          vehiclePos.z + forwardZ * 35.0
        );

        this.camera.position.copy(targetPos);
        this.camera.lookAt(targetLookAt);
        break;
      }

      case 'cockpit': {
        // Driver seat view (left hand drive, inside cabin)
        const rightX = Math.cos(headingAngle);
        const rightZ = -Math.sin(headingAngle);
        targetPos.set(
          vehiclePos.x - rightX * 0.38 + forwardX * 0.1,
          vehiclePos.y + 1.35,
          vehiclePos.z - rightZ * 0.38 + forwardZ * 0.1
        );
        targetLookAt.set(
          vehiclePos.x + forwardX * 25.0,
          vehiclePos.y + 1.2,
          vehiclePos.z + forwardZ * 25.0
        );

        this.camera.position.copy(targetPos);
        this.camera.lookAt(targetLookAt);
        break;
      }

      case 'cinematic': {
        // Cinematic rotating drone angle around vehicle
        this.orbitAngle += 0.35 * dt;
        const radius = 12.0;
        const height = 4.5;
        targetPos.set(
          vehiclePos.x + Math.sin(this.orbitAngle) * radius,
          vehiclePos.y + height,
          vehiclePos.z + Math.cos(this.orbitAngle) * radius
        );
        targetLookAt.set(vehiclePos.x, vehiclePos.y + 1.2, vehiclePos.z);

        this.camera.position.lerp(targetPos, 4.0 * dt);
        this.camera.lookAt(targetLookAt);
        break;
      }
    }
  }
}
