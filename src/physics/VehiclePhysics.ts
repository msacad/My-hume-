import * as THREE from 'three';

export interface VehicleControlInput {
  throttle: number; // 0 to 1
  brake: number; // 0 to 1
  reverse: number; // 0 to 1
  steer: number; // -1 (left) to 1 (right)
  handbrake: boolean;
  isReverseGear?: boolean;
}

export interface CollisionObstacle {
  x: number;
  z: number;
  radius: number;
  name?: string;
}

export class VehiclePhysics {
  // Vehicle transform state
  public position: THREE.Vector3 = new THREE.Vector3(0, 0.45, 0);
  public headingAngle: number = 0; // In radians, 0 = forward along -Z
  public speed: number = 0; // in m/s (positive = forward, negative = reverse)
  public lateralVelocity: number = 0; // lateral drift velocity
  public steerAngle: number = 0; // current wheel steer angle in radians
  public wheelSpinAngle: number = 0; // wheel rotation angle for all wheels

  // Dynamic visual pitch & roll
  public pitchAngle: number = 0;
  public rollAngle: number = 0;

  // Transmission and engine telemetry
  public currentGear: string = 'D';
  public gearNumber: number = 1;
  public engineRPM: number = 850;
  public fuelLevel: number = 96.0; // 0 - 100%
  public damagePercent: number = 0; // 0 - 100%
  public driftScore: number = 0;
  public isDrifting: boolean = false;

  // Dynamic tuning parameters
  public maxSpeed: number = 55.0; // ~198 km/h in m/s
  public maxReverseSpeed: number = 12.5; // ~45 km/h in m/s
  public acceleration: number = 14.5; // m/s^2
  public brakeDecel: number = 24.0; // m/s^2
  public naturalDecel: number = 3.5; // rolling resistance
  public wheelRadius: number = 0.42; // meters
  public wheelbase: number = 2.85; // meters
  public maxSteerLimit: number = 0.58; // ~33 degrees at standstill
  public collisionRadius: number = 1.9; // bounding radius

  // Map boundary
  public readonly mapLimit: number = 480; // meters

  // Audio / event callbacks
  public onCollision?: (impactRatio: number) => void;
  public onGearShift?: (newGear: number) => void;

  constructor() {
    this.reset();
  }

  applyVehicleDefinition(def: {
    topSpeedKmH: number;
    acceleration0to100: number;
    brakingRating: number;
    dimensions: { wheelRadius: number; wheelbase: number; width: number };
  }) {
    this.maxSpeed = def.topSpeedKmH / 3.6;
    this.maxReverseSpeed = Math.min(15, this.maxSpeed * 0.28);
    // Acceleration: a = v / t (e.g. (100 / 3.6) / 3.8s ~ 7.3 to 15 m/s^2)
    this.acceleration = (27.78 / Math.max(2.5, def.acceleration0to100)) * 1.8;
    this.brakeDecel = 18.0 + (def.brakingRating / 100) * 12.0;
    this.wheelRadius = def.dimensions.wheelRadius;
    this.wheelbase = def.dimensions.wheelbase;
    this.collisionRadius = Math.max(1.7, def.dimensions.width * 0.95);
  }

  reset(x: number = 0, z: number = 0, heading: number = 0) {
    this.position.set(x, 0.45, z);
    this.headingAngle = heading;
    this.speed = 0;
    this.lateralVelocity = 0;
    this.steerAngle = 0;
    this.wheelSpinAngle = 0;
    this.pitchAngle = 0;
    this.rollAngle = 0;
    this.currentGear = 'D';
    this.gearNumber = 1;
    this.engineRPM = 850;
    this.fuelLevel = 96.0;
    this.damagePercent = 0;
    this.driftScore = 0;
    this.isDrifting = false;
  }

  getSpeedKmH(): number {
    return Math.abs(this.speed * 3.6);
  }

  update(delta: number, input: VehicleControlInput, obstacles: CollisionObstacle[] = []) {
    // Clamp delta to avoid large physics steps
    const dt = Math.min(delta, 0.05);

    // 1. Steering calculation with speed sensitivity
    const currentSpeedKmH = this.getSpeedKmH();
    // High speeds reduce steering angle to avoid sudden loss of control
    const speedSteerFactor = Math.max(0.25, 1.0 - (currentSpeedKmH / 220) * 0.7);
    const targetSteerAngle = -input.steer * this.maxSteerLimit * speedSteerFactor;
    // Smooth steering interpolation
    this.steerAngle = THREE.MathUtils.lerp(this.steerAngle, targetSteerAngle, 12 * dt);

    // 2. Acceleration and Braking calculation
    let effectiveThrottle = input.throttle;
    let effectiveBrake = input.brake;
    let effectiveReverse = input.reverse;

    // Support combined brake-as-reverse when stationary or toggle
    if (input.isReverseGear) {
      if (effectiveThrottle > 0) {
        effectiveReverse = effectiveThrottle;
        effectiveThrottle = 0;
      }
    } else if (this.speed <= 0.2 && effectiveBrake > 0 && effectiveThrottle === 0) {
      // Automatic brake-to-reverse when stopped
      effectiveReverse = effectiveBrake;
      effectiveBrake = 0;
    }

    if (effectiveThrottle > 0 && this.speed >= -0.5) {
      // Forward acceleration
      const accelPower = this.acceleration * (1.0 - Math.min(1.0, this.speed / this.maxSpeed));
      this.speed += accelPower * effectiveThrottle * dt;
      if (this.speed > this.maxSpeed) this.speed = this.maxSpeed;
    } else if (effectiveReverse > 0 && this.speed <= 0.5) {
      // Reverse acceleration
      const revPower = this.acceleration * 0.6 * (1.0 - Math.min(1.0, Math.abs(this.speed) / this.maxReverseSpeed));
      this.speed -= revPower * effectiveReverse * dt;
      if (this.speed < -this.maxReverseSpeed) this.speed = -this.maxReverseSpeed;
    } else if (effectiveBrake > 0) {
      // Active braking
      const brakeForce = this.brakeDecel * effectiveBrake * dt;
      if (this.speed > 0) {
        this.speed = Math.max(0, this.speed - brakeForce);
      } else if (this.speed < 0) {
        this.speed = Math.min(0, this.speed + brakeForce);
      }
    } else {
      // Coasting deceleration (rolling resistance + air drag)
      const airDrag = 0.0018 * this.speed * this.speed;
      const totalCoastDecel = (this.naturalDecel + airDrag) * dt;
      if (this.speed > 0) {
        this.speed = Math.max(0, this.speed - totalCoastDecel);
      } else if (this.speed < 0) {
        this.speed = Math.min(0, this.speed + totalCoastDecel);
      }
    }

    // Handbrake: strong deceleration and lateral drift
    if (input.handbrake) {
      const handbrakeDecel = this.brakeDecel * 1.5 * dt;
      if (Math.abs(this.speed) > 0.1) {
        this.speed = Math.sign(this.speed) * Math.max(0, Math.abs(this.speed) - handbrakeDecel);
      }
    }

    // 3. Vehicle rotation and lateral drift
    const isMovingForward = this.speed >= 0;
    const directionSign = isMovingForward ? 1 : -1;
    const wheelbase = 2.85; // meters
    // Turning yaw angular velocity
    let turnRate = (this.speed / wheelbase) * Math.tan(this.steerAngle);

    // Drift physics with handbrake or sharp turn
    const isHandbrakeSlide = input.handbrake && currentSpeedKmH > 25;
    const isSharpTurnSlide = Math.abs(this.steerAngle) > 0.35 && currentSpeedKmH > 65;

    if (isHandbrakeSlide || isSharpTurnSlide) {
      this.isDrifting = true;
      // Extra yaw rate for drifting
      turnRate *= 1.6;
      this.lateralVelocity = THREE.MathUtils.lerp(
        this.lateralVelocity,
        Math.sign(this.steerAngle) * this.speed * 0.45,
        6 * dt
      );
      this.driftScore += Math.round(currentSpeedKmH * dt * 8);
    } else {
      this.isDrifting = false;
      this.lateralVelocity = THREE.MathUtils.lerp(this.lateralVelocity, 0, 10 * dt);
    }

    this.headingAngle += turnRate * dt;

    // 4. Update Position along heading vector
    const forwardX = -Math.sin(this.headingAngle);
    const forwardZ = -Math.cos(this.headingAngle);
    const rightX = Math.cos(this.headingAngle);
    const rightZ = -Math.sin(this.headingAngle);

    this.position.x += (forwardX * this.speed + rightX * this.lateralVelocity) * dt;
    this.position.z += (forwardZ * this.speed + rightZ * this.lateralVelocity) * dt;

    // 5. Map Boundaries collision
    if (Math.abs(this.position.x) > this.mapLimit || Math.abs(this.position.z) > this.mapLimit) {
      this.position.x = THREE.MathUtils.clamp(this.position.x, -this.mapLimit, this.mapLimit);
      this.position.z = THREE.MathUtils.clamp(this.position.z, -this.mapLimit, this.mapLimit);
      if (Math.abs(this.speed) > 3) {
        this.damagePercent = Math.min(100, this.damagePercent + Math.abs(this.speed) * 0.4);
        this.onCollision?.(Math.min(1, Math.abs(this.speed) / 20));
      }
      this.speed = -this.speed * 0.35; // bounce back
    }

    // 6. Obstacle Collisions
    for (const obs of obstacles) {
      const dx = this.position.x - obs.x;
      const dz = this.position.z - obs.z;
      const distSq = dx * dx + dz * dz;
      const minDist = this.collisionRadius + obs.radius;
      if (distSq < minDist * minDist) {
        const dist = Math.sqrt(distSq) || 0.001;
        const pushX = (dx / dist) * (minDist - dist);
        const pushZ = (dz / dist) * (minDist - dist);
        this.position.x += pushX;
        this.position.z += pushZ;

        if (Math.abs(this.speed) > 2) {
          const impact = Math.min(1, Math.abs(this.speed) / 25);
          this.damagePercent = Math.min(100, this.damagePercent + impact * 15);
          this.onCollision?.(impact);
        }
        this.speed = -this.speed * 0.4;
      }
    }

    // 7. Wheel spin rotation
    const distanceTraveled = this.speed * dt;
    const wheelAngleDelta = distanceTraveled / this.wheelRadius;
    this.wheelSpinAngle += wheelAngleDelta;

    // 8. Transmission & Gear simulation
    if (this.speed < -0.2) {
      this.currentGear = 'R';
      this.gearNumber = -1;
      const revRatio = Math.abs(this.speed) / this.maxReverseSpeed;
      this.engineRPM = 850 + revRatio * 4200;
    } else if (Math.abs(this.speed) < 0.2 && effectiveThrottle === 0 && effectiveBrake === 0) {
      this.currentGear = 'P';
      this.gearNumber = 0;
      this.engineRPM = THREE.MathUtils.lerp(this.engineRPM, 800, 5 * dt);
    } else {
      // Forward automatic gears (1 to 5)
      let targetGear = 1;
      if (currentSpeedKmH > 135) targetGear = 5;
      else if (currentSpeedKmH > 95) targetGear = 4;
      else if (currentSpeedKmH > 60) targetGear = 3;
      else if (currentSpeedKmH > 28) targetGear = 2;
      else targetGear = 1;

      if (targetGear !== this.gearNumber) {
        this.gearNumber = targetGear;
        this.onGearShift?.(targetGear);
      }
      this.currentGear = `${this.gearNumber}`;

      // Calculate RPM within current gear
      const gearSpeeds = [0, 32, 65, 102, 142, 205];
      const minGearSpeed = gearSpeeds[this.gearNumber - 1];
      const maxGearSpeed = gearSpeeds[this.gearNumber];
      const gearProgress = Math.max(0, Math.min(1, (currentSpeedKmH - minGearSpeed) / (maxGearSpeed - minGearSpeed)));

      const targetRPM = 1000 + gearProgress * 4800 + effectiveThrottle * 700;
      this.engineRPM = THREE.MathUtils.lerp(this.engineRPM, targetRPM, 8 * dt);
    }

    // 9. Visual Pitch and Roll (suspension inertia)
    // Pitch: nose up when accelerating, nose down when braking
    const targetPitch = (effectiveThrottle * 0.04 - effectiveBrake * 0.06) * (currentSpeedKmH > 5 ? 1 : 0.2);
    this.pitchAngle = THREE.MathUtils.lerp(this.pitchAngle, targetPitch, 8 * dt);

    // Roll: body leans outward in corners
    const targetRoll = -(this.steerAngle * (currentSpeedKmH / 100) * 0.12);
    this.rollAngle = THREE.MathUtils.lerp(this.rollAngle, targetRoll, 8 * dt);

    // 10. Fuel consumption
    const fuelBurnRate = 0.003 * (0.2 + effectiveThrottle * 0.8 + (this.engineRPM / 6500) * 0.5);
    this.fuelLevel = Math.max(0, this.fuelLevel - fuelBurnRate * dt);
  }
}
