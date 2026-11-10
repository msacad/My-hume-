import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { CityEnvironmentManager, CityId, CITY_CONFIGS } from '../environment/CityEnvironments';
import { Vehicle3DModel } from '../vehicle/VehicleModels';
import { VEHICLE_CATALOG } from '../vehicle/VehicleRegistry';
import { VehiclePhysics, VehicleControlInput } from '../physics/VehiclePhysics';
import { CameraController, CameraViewMode } from '../camera/CameraController';
import { AudioEngine } from '../audio/AudioEngine';
import { GameHUD } from '../hud/GameHUD';
import { MobileControls } from '../controls/MobileControls';
import { GameSettings, GameStorage } from '../storage/GameStorage';
import { TrafficSystem } from '../systems/TrafficSystem';
import { MissionManager, MissionDefinition } from '../systems/MissionSystem';
import { Play, RotateCcw, Home } from 'lucide-react';

interface GameCanvasProps {
  settings: GameSettings;
  vehicleColorHex: string;
  activeCity: CityId;
  activeMission: MissionDefinition | null;
  onExitToMenu: () => void;
  onMissionCompleted?: (stars: number, coins: number, xp: number) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  settings,
  vehicleColorHex,
  activeCity,
  activeMission,
  onExitToMenu,
  onMissionCompleted,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Engine references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const vehicleModelRef = useRef<Vehicle3DModel | null>(null);
  const physicsRef = useRef<VehiclePhysics>(new VehiclePhysics());
  const cameraControllerRef = useRef<CameraController | null>(null);
  const cityManagerRef = useRef<CityEnvironmentManager | null>(null);
  const trafficSystemRef = useRef<TrafficSystem | null>(null);
  const missionManagerRef = useRef<MissionManager | null>(null);

  // HUD & Game State
  const [speedKmH, setSpeedKmH] = useState(0);
  const [gear, setGear] = useState('P');
  const [rpm, setRpm] = useState(850);
  const [fuel, setFuel] = useState(96);
  const [damage, setDamage] = useState(0);
  const [driftScore, setDriftScore] = useState(0);
  const [isDrifting, setIsDrifting] = useState(false);
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('chase');
  const [headlightsOn, setHeadlightsOn] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [vehicleX, setVehicleX] = useState(0);
  const [vehicleZ, setVehicleZ] = useState(0);
  const [headingAngle, setHeadingAngle] = useState(0);

  // Mission State
  const [currentCheckpointIdx, setCurrentCheckpointIdx] = useState(0);
  const [missionTimeRemaining, setMissionTimeRemaining] = useState(activeMission ? activeMission.timeLimitSec : 0);
  const [missionCompleted, setMissionCompleted] = useState(false);
  const [missionFailed, setMissionFailed] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);

  // Audio Engine
  const audio = AudioEngine.getInstance();

  // Control input ref
  const controlInputRef = useRef<VehicleControlInput>({
    throttle: 0,
    brake: 0,
    reverse: 0,
    steer: 0,
    handbrake: false,
    isReverseGear: false,
  });

  // Initialize Three.js scene, city, traffic, vehicle and loop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.2, 800);
    camera.position.set(0, 4, 10);
    cameraRef.current = camera;

    const cameraController = new CameraController(camera);
    cameraControllerRef.current = cameraController;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: settings.graphicsQuality === 'high',
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, settings.graphicsQuality === 'high' ? 2 : 1.2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    if (settings.graphicsQuality === 'high') {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    } else {
      renderer.shadowMap.enabled = false;
    }

    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. City Environment (Hargeisa, Berbera, Borama, Burco)
    const cityManager = new CityEnvironmentManager(scene, activeCity);
    cityManagerRef.current = cityManager;

    // 4. Player Vehicle Model (Selected vehicle from catalog)
    const vehicleDef =
      VEHICLE_CATALOG.find((v) => v.id === settings.selectedVehicleId) || VEHICLE_CATALOG[0];

    const vehicleModel = new Vehicle3DModel(vehicleDef, vehicleColorHex);
    scene.add(vehicleModel.group);
    vehicleModelRef.current = vehicleModel;

    // 5. Physics setup with vehicle definition specs
    const physics = physicsRef.current;
    physics.applyVehicleDefinition(vehicleDef);

    // Initial Spawn Location
    const defaultSpawn = CITY_CONFIGS[activeCity]?.spawnPoint || { x: 0, z: -90, heading: 0 };
    let spawnX = defaultSpawn.x;
    let spawnZ = defaultSpawn.z;
    let spawnHeading = defaultSpawn.heading;

    if (activeMission) {
      if (activeMission.parkingZone) {
        spawnX = activeMission.parkingZone.x;
        spawnZ = activeMission.parkingZone.z + 18;
        spawnHeading = 0;
      } else if (activeMission.checkpoints.length > 0) {
        // Spawn slightly before first checkpoint
        const firstCp = activeMission.checkpoints[0];
        spawnX = firstCp.x;
        spawnZ = firstCp.z - 30;
        spawnHeading = 0;
      }
    }

    physics.reset(spawnX, spawnZ, spawnHeading);

    physics.onCollision = (impact) => {
      audio.playCrash(impact);
    };

    physics.onGearShift = () => {
      audio.playGearShift();
    };

    // 6. Traffic AI & Pedestrians System
    const traffic = new TrafficSystem(scene, settings.graphicsQuality === 'high');
    trafficSystemRef.current = traffic;

    // 7. Mission System
    const missionMgr = new MissionManager(scene);
    missionManagerRef.current = missionMgr;

    if (activeMission) {
      missionMgr.startMission(activeMission);
      setCurrentCheckpointIdx(0);
      setMissionTimeRemaining(activeMission.timeLimitSec);
      setMissionCompleted(false);
      setMissionFailed(false);
    }

    // 8. Audio Engine Start
    audio.startEngine();
    audio.setEnabled(settings.soundEnabled);

    // 9. Main Animation Loop
    let lastTime = performance.now();
    let animationFrameId: number;
    let distanceTracker = 0;

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (!isPaused && !missionCompleted && !missionFailed) {
        // Combine static city obstacles with dynamic AI traffic obstacles
        const allObstacles = [...cityManager.obstacles, ...traffic.obstacles];

        // Update Physics
        physics.update(delta, controlInputRef.current, allObstacles);

        const currentSpeed = physics.getSpeedKmH();
        const isBraking = controlInputRef.current.brake > 0;
        const isReversing = physics.speed < -0.2;

        // Update 3D Vehicle visuals (wheels, steering, pitch/roll)
        vehicleModel.update(
          physics.position,
          physics.headingAngle,
          physics.steerAngle,
          physics.wheelSpinAngle,
          physics.pitchAngle,
          physics.rollAngle,
          isBraking,
          isReversing
        );

        // Update AI Traffic & Pedestrians
        traffic.update(delta, physics.position);

        // Update Camera
        cameraController.update(delta, physics.position, physics.headingAngle, currentSpeed);

        // Update Audio
        audio.updateEngine(physics.engineRPM, controlInputRef.current.throttle, currentSpeed);
        audio.updateSkid(physics.isDrifting ? 1.0 : isBraking && currentSpeed > 30 ? 0.6 : 0);

        // Update Mission progress
        if (activeMission && missionMgr.activeMission) {
          const mState = missionMgr.update(
            delta,
            physics.position.x,
            physics.position.z,
            physics.headingAngle,
            currentSpeed
          );

          setMissionTimeRemaining(missionMgr.timeRemaining);
          setCurrentCheckpointIdx(missionMgr.currentCheckpointIndex);

          if (mState.checkpointPassed) {
            audio.playButtonClick();
          }

          if (mState.completed) {
            setMissionCompleted(true);
            setEarnedCoins(missionMgr.earnedCoins);
            setEarnedXP(missionMgr.earnedXP);
            setEarnedStars(missionMgr.earnedStars);
            GameStorage.completeMission(
              activeMission.id,
              missionMgr.earnedCoins,
              missionMgr.earnedXP,
              missionMgr.earnedStars
            );
            onMissionCompleted?.(missionMgr.earnedStars, missionMgr.earnedCoins, missionMgr.earnedXP);
          } else if (mState.failed) {
            setMissionFailed(true);
          }
        }

        // Sync HUD telemetry
        setSpeedKmH(currentSpeed);
        setGear(physics.currentGear);
        setRpm(physics.engineRPM);
        setFuel(physics.fuelLevel);
        setDamage(physics.damagePercent);
        setDriftScore(physics.driftScore);
        setIsDrifting(physics.isDrifting);
        setVehicleX(physics.position.x);
        setVehicleZ(physics.position.z);
        setHeadingAngle(physics.headingAngle);

        // Accumulate player statistics
        distanceTracker += (Math.abs(physics.speed) * delta) / 1000;
        if (distanceTracker > 0.05) {
          GameStorage.addTelemetry(distanceTracker, currentSpeed, physics.isDrifting ? 15 : 0);
          distanceTracker = 0;
        }
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // 10. Handle Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      audio.stopEngine();
      traffic.dispose();
      missionMgr.clearVisuals();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [
    activeCity,
    activeMission,
    settings.graphicsQuality,
    settings.selectedVehicleId,
    vehicleColorHex,
    isPaused,
  ]);

  // Input change handler from mobile/keyboard controls
  const handleInputChange = useCallback((input: VehicleControlInput) => {
    controlInputRef.current = input;
  }, []);

  // Camera switch
  const handleToggleCamera = useCallback(() => {
    if (cameraControllerRef.current) {
      const next = cameraControllerRef.current.nextMode();
      setCameraMode(next);
      audio.playButtonClick();
    }
  }, [audio]);

  // Headlights switch
  const handleToggleHeadlights = useCallback(() => {
    setHeadlightsOn((prev) => {
      const next = !prev;
      vehicleModelRef.current?.setHeadlights(next);
      audio.playButtonClick();
      return next;
    });
  }, [audio]);

  // Horn
  const handleHornStart = useCallback(() => {
    audio.setHorn(true);
  }, [audio]);

  const handleHornEnd = useCallback(() => {
    audio.setHorn(false);
  }, [audio]);

  // Pause
  const handlePause = useCallback(() => {
    audio.playButtonClick();
    setIsPaused(true);
  }, [audio]);

  const handleResume = useCallback(() => {
    audio.playButtonClick();
    setIsPaused(false);
  }, [audio]);

  const handleRestart = useCallback(() => {
    audio.playButtonClick();
    const defaultSpawn = CITY_CONFIGS[activeCity]?.spawnPoint || { x: 0, z: -90, heading: 0 };
    let sx = defaultSpawn.x;
    let sz = defaultSpawn.z;
    let sh = defaultSpawn.heading;

    if (activeMission) {
      if (activeMission.parkingZone) {
        sx = activeMission.parkingZone.x;
        sz = activeMission.parkingZone.z + 18;
      } else if (activeMission.checkpoints.length > 0) {
        sx = activeMission.checkpoints[0].x;
        sz = activeMission.checkpoints[0].z - 30;
      }
      missionManagerRef.current?.startMission(activeMission);
      setMissionTimeRemaining(activeMission.timeLimitSec);
      setCurrentCheckpointIdx(0);
      setMissionCompleted(false);
      setMissionFailed(false);
    }

    physicsRef.current.reset(sx, sz, sh);
    setIsPaused(false);
  }, [activeCity, activeMission, audio]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#000',
        touchAction: 'none',
      }}
    >
      {/* Real-time Game HUD with Minimap Radar, Compass, Mission Overlay */}
      <GameHUD
        speedKmH={speedKmH}
        gear={gear}
        rpm={rpm}
        fuel={fuel}
        damage={damage}
        driftScore={driftScore}
        isDrifting={isDrifting}
        cameraMode={cameraMode}
        headlightsOn={headlightsOn}
        vehicleX={vehicleX}
        vehicleZ={vehicleZ}
        headingAngle={headingAngle}
        activeCity={activeCity}
        activeMission={activeMission}
        currentCheckpointIdx={currentCheckpointIdx}
        missionTimeRemaining={missionTimeRemaining}
        missionCompleted={missionCompleted}
        missionFailed={missionFailed}
        earnedCoins={earnedCoins}
        earnedXP={earnedXP}
        earnedStars={earnedStars}
        onToggleCamera={handleToggleCamera}
        onToggleHeadlights={handleToggleHeadlights}
        onHornStart={handleHornStart}
        onHornEnd={handleHornEnd}
        onPause={handlePause}
        onRestartMission={handleRestart}
        onExitMission={onExitToMenu}
      />

      {/* Multi-Touch Driving Controls (Left/Right Steering & Pedals) */}
      <MobileControls
        steeringMode={settings.steeringMode}
        onInputChange={handleInputChange}
        onToggleCamera={handleToggleCamera}
        onHornStart={handleHornStart}
        onHornEnd={handleHornEnd}
        onPause={handlePause}
      />

      {/* Pause Menu Modal Overlay */}
      {isPaused && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(5, 10, 15, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            backdropFilter: 'blur(8px)',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(20, 28, 36, 0.95)',
              border: '2px solid rgba(12, 104, 52, 0.8)',
              borderRadius: '20px',
              padding: '30px 40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              minWidth: '320px',
              boxShadow: '0 12px 36px rgba(0,0,0,0.8)',
              color: '#ffffff',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 900,
                color: '#69f0ae',
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}
            >
              SOMALILAND DRIVING SIMULATOR
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 900, margin: '0 0 10px 0' }}>GAME PAUSED</h2>

            {/* Resume */}
            <button
              onClick={handleResume}
              style={{
                width: '100%',
                backgroundColor: '#0c6834',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '15px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
              }}
            >
              <Play size={18} fill="#fff" />
              <span>RESUME DRIVING</span>
            </button>

            {/* Restart at start line */}
            <button
              onClick={handleRestart}
              style={{
                width: '100%',
                backgroundColor: 'rgba(255,255,255,0.08)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={18} />
              <span>RESTART MISSION / POSITION</span>
            </button>

            {/* Return to Main Menu */}
            <button
              onClick={() => {
                audio.playButtonClick();
                onExitToMenu();
              }}
              style={{
                width: '100%',
                backgroundColor: 'rgba(210, 16, 52, 0.85)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
              }}
            >
              <Home size={18} />
              <span>MAIN MENU</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
