import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { VEHICLE_CATALOG, VehicleDefinition } from '../vehicle/VehicleRegistry';
import { Vehicle3DModel } from '../vehicle/VehicleModels';
import { GameSettings, GameStorage, PlayerProfile } from '../storage/GameStorage';
import { AudioEngine } from '../audio/AudioEngine';
import { ChevronLeft, ChevronRight, Lock, Check, Sparkles, ArrowLeft, Coins } from 'lucide-react';

interface GarageSceneProps {
  settings: GameSettings;
  profile: PlayerProfile;
  onUpdateSettings: (partial: Partial<GameSettings>) => void;
  onUpdateProfile: (partial: Partial<PlayerProfile>) => void;
  onBackToMenu: () => void;
}

export const GARAGE_PAINTS = [
  { name: 'Somaliland Heritage Pearl', hex: '#f4f6f8' },
  { name: 'Golis Emerald Green', hex: '#0c6834' },
  { name: 'Red Sea Crimson', hex: '#c8102e' },
  { name: 'Obsidian Midnight', hex: '#14171a' },
  { name: 'Sahil Gold Dune', hex: '#d6b27a' },
  { name: 'Gulf of Aden Sky Blue', hex: '#1976d2' },
];

export const GarageScene: React.FC<GarageSceneProps> = ({
  settings,
  profile,
  onUpdateSettings,
  onUpdateProfile,
  onBackToMenu,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const audio = AudioEngine.getInstance();

  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    const idx = VEHICLE_CATALOG.findIndex((v) => v.id === settings.selectedVehicleId);
    return idx >= 0 ? idx : 0;
  });

  const [currentColorIdx, setCurrentColorIdx] = useState<number>(settings.selectedColorIndex || 0);

  const currentVehicle: VehicleDefinition = VEHICLE_CATALOG[currentIndex];
  const isOwned = profile.unlockedVehicles.includes(currentVehicle.id);
  const isSelected = settings.selectedVehicleId === currentVehicle.id;

  // Three.js Showroom Scene references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const turntableRef = useRef<THREE.Group | null>(null);
  const currentModelRef = useRef<Vehicle3DModel | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0c1117);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.2, 7.8);
    camera.lookAt(0, 0.8, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 3. Studio Showroom Lighting
    const hemi = new THREE.HemisphereLight(0xffffff, 0x223344, 1.2);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.8);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x69f0ae, 1.5);
    rimLight.position.set(-6, 4, -5);
    scene.add(rimLight);

    // 4. Circular Showroom Turntable Floor
    const turntable = new THREE.Group();
    turntableRef.current = turntable;
    scene.add(turntable);

    const floorGeom = new THREE.CylinderGeometry(4.5, 4.5, 0.15, 48);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x182028,
      metalness: 0.8,
      roughness: 0.25,
    });
    const floorMesh = new THREE.Mesh(floorGeom, floorMat);
    floorMesh.position.y = -0.075;
    floorMesh.receiveShadow = true;
    turntable.add(floorMesh);

    // Green Somaliland Ring on Turntable Edge
    const ringGeom = new THREE.RingGeometry(4.2, 4.45, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00e676, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.005;
    turntable.add(ring);

    // 5. Mount Initial 3D Vehicle
    const initialVehicle = new Vehicle3DModel(currentVehicle, GARAGE_PAINTS[currentColorIdx].hex);
    initialVehicle.setHeadlights(true);
    turntable.add(initialVehicle.group);
    currentModelRef.current = initialVehicle;

    // 6. Animation loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      turntable.rotation.y += 0.007; // Gentle auto turntable spin
      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update vehicle model when index or color changes
  useEffect(() => {
    if (!turntableRef.current) return;
    if (currentModelRef.current) {
      turntableRef.current.remove(currentModelRef.current.group);
    }
    const newModel = new Vehicle3DModel(currentVehicle, GARAGE_PAINTS[currentColorIdx].hex);
    newModel.setHeadlights(true);
    turntableRef.current.add(newModel.group);
    currentModelRef.current = newModel;
  }, [currentIndex, currentColorIdx, currentVehicle]);

  const handleNext = () => {
    audio.playButtonClick();
    setCurrentIndex((prev) => (prev + 1) % VEHICLE_CATALOG.length);
  };

  const handlePrev = () => {
    audio.playButtonClick();
    setCurrentIndex((prev) => (prev - 1 + VEHICLE_CATALOG.length) % VEHICLE_CATALOG.length);
  };

  const handleSelectColor = (idx: number) => {
    audio.playButtonClick();
    setCurrentColorIdx(idx);
    onUpdateSettings({ selectedColorIndex: idx });
  };

  const handleEquipVehicle = () => {
    audio.playButtonClick();
    onUpdateSettings({ selectedVehicleId: currentVehicle.id });
  };

  const handleUnlockVehicle = () => {
    if (profile.coins >= currentVehicle.price) {
      audio.playButtonClick();
      const success = GameStorage.unlockVehicle(currentVehicle.id, currentVehicle.price);
      if (success) {
        onUpdateProfile({
          coins: profile.coins - currentVehicle.price,
          unlockedVehicles: [...profile.unlockedVehicles, currentVehicle.id],
        });
        onUpdateSettings({ selectedVehicleId: currentVehicle.id });
      }
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#0c1117',
        color: '#ffffff',
        fontFamily: 'system-ui, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* 3D Turntable Background Canvas */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Top Header Bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          padding: '16px 24px',
          boxSizing: 'border-box',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(to bottom, rgba(12,17,23,0.95), rgba(12,17,23,0))',
          pointerEvents: 'none',
        }}
      >
        <button
          onClick={() => {
            audio.playButtonClick();
            onBackToMenu();
          }}
          style={{
            pointerEvents: 'auto',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '10px',
            padding: '8px 16px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          <ArrowLeft size={18} />
          <span>MAIN MENU</span>
        </button>

        {/* Player Wallet & Level */}
        <div style={{ display: 'flex', gap: '14px', pointerEvents: 'auto' }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '6px 14px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 800,
            }}
          >
            <Coins size={16} color="#ffd54f" />
            <span>{profile.coins.toLocaleString()} COINS</span>
          </div>
          <div
            style={{
              background: 'rgba(12, 104, 52, 0.8)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 800,
            }}
          >
            LVL {profile.level}
          </div>
        </div>
      </div>

      {/* Vehicle Carousel Arrow Buttons */}
      <button
        onClick={handlePrev}
        style={{
          position: 'absolute',
          left: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          backgroundColor: 'rgba(20,28,36,0.85)',
          border: '2px solid rgba(255,255,255,0.2)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
        }}
      >
        <ChevronLeft size={30} />
      </button>

      <button
        onClick={handleNext}
        style={{
          position: 'absolute',
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          backgroundColor: 'rgba(20,28,36,0.85)',
          border: '2px solid rgba(255,255,255,0.2)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
        }}
      >
        <ChevronRight size={30} />
      </button>

      {/* Bottom Panel: Specifications & Color Palette & Action Button */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '94%',
          maxWidth: '880px',
          backgroundColor: 'rgba(15, 22, 30, 0.92)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '18px',
          padding: '16px 24px',
          boxSizing: 'border-box',
          boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {/* Title, Category & Equip/Unlock Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 900,
                  backgroundColor: '#0c6834',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                }}
              >
                {currentVehicle.category}
              </span>
              <h2 style={{ fontSize: '20px', fontWeight: 900, margin: 0 }}>{currentVehicle.name}</h2>
            </div>
            <p style={{ color: '#90a4ae', fontSize: '12px', margin: '2px 0 0 0' }}>
              {currentVehicle.description}
            </p>
          </div>

          <div>
            {isOwned ? (
              <button
                onClick={handleEquipVehicle}
                style={{
                  backgroundColor: isSelected ? '#00e676' : 'rgba(255,255,255,0.1)',
                  color: isSelected ? '#000' : '#fff',
                  border: '1px solid ' + (isSelected ? '#00e676' : '#fff'),
                  borderRadius: '12px',
                  padding: '10px 24px',
                  fontWeight: 900,
                  fontSize: '13px',
                  cursor: isSelected ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {isSelected ? <Check size={16} /> : null}
                <span>{isSelected ? 'SELECTED' : 'SELECT VEHICLE'}</span>
              </button>
            ) : (
              <button
                onClick={handleUnlockVehicle}
                disabled={profile.coins < currentVehicle.price}
                style={{
                  backgroundColor: profile.coins >= currentVehicle.price ? '#ffd54f' : '#444',
                  color: '#000',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 24px',
                  fontWeight: 900,
                  fontSize: '13px',
                  cursor: profile.coins >= currentVehicle.price ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Lock size={16} />
                <span>UNLOCK FOR {currentVehicle.price} COINS</span>
              </button>
            )}
          </div>
        </div>

        {/* Specs Bars & Color Selection */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'center' }}>
          {/* 4 Stat Bars */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
                <span style={{ color: '#90a4ae' }}>TOP SPEED</span>
                <span>{currentVehicle.topSpeedKmH} KM/H</span>
              </div>
              <div style={{ width: '100%', height: '5px', backgroundColor: '#333', borderRadius: '3px', marginTop: '3px' }}>
                <div
                  style={{
                    width: `${(currentVehicle.topSpeedKmH / 260) * 100}%`,
                    height: '100%',
                    backgroundColor: '#00e676',
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
                <span style={{ color: '#90a4ae' }}>0-100 ACCEL</span>
                <span>{currentVehicle.acceleration0to100}s</span>
              </div>
              <div style={{ width: '100%', height: '5px', backgroundColor: '#333', borderRadius: '3px', marginTop: '3px' }}>
                <div
                  style={{
                    width: `${Math.max(10, 100 - currentVehicle.acceleration0to100 * 10)}%`,
                    height: '100%',
                    backgroundColor: '#4fc3f7',
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
                <span style={{ color: '#90a4ae' }}>HANDLING</span>
                <span>{currentVehicle.handlingRating}%</span>
              </div>
              <div style={{ width: '100%', height: '5px', backgroundColor: '#333', borderRadius: '3px', marginTop: '3px' }}>
                <div
                  style={{
                    width: `${currentVehicle.handlingRating}%`,
                    height: '100%',
                    backgroundColor: '#ffb74d',
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700 }}>
                <span style={{ color: '#90a4ae' }}>BRAKING</span>
                <span>{currentVehicle.brakingRating}%</span>
              </div>
              <div style={{ width: '100%', height: '5px', backgroundColor: '#333', borderRadius: '3px', marginTop: '3px' }}>
                <div
                  style={{
                    width: `${currentVehicle.brakingRating}%`,
                    height: '100%',
                    backgroundColor: '#f06292',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Paint Swatches */}
          <div>
            <div style={{ fontSize: '11px', color: '#90a4ae', fontWeight: 700, marginBottom: '6px' }}>
              PAINT FINISH
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {GARAGE_PAINTS.map((p, idx) => (
                <button
                  key={p.name}
                  onClick={() => handleSelectColor(idx)}
                  title={p.name}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: p.hex,
                    border: '2px solid ' + (currentColorIdx === idx ? '#00e676' : 'rgba(255,255,255,0.3)'),
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
