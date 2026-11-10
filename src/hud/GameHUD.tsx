import React, { useEffect, useRef } from 'react';
import { Camera, Volume2, Lightbulb, Pause, AlertTriangle, Navigation, Trophy, CheckCircle, XCircle } from 'lucide-react';
import { CameraViewMode } from '../camera/CameraController';
import { MissionDefinition } from '../systems/MissionSystem';
import { CityId, CITY_CONFIGS } from '../environment/CityEnvironments';

interface GameHUDProps {
  speedKmH: number;
  gear: string;
  rpm: number;
  fuel: number;
  damage: number;
  driftScore: number;
  isDrifting: boolean;
  cameraMode: CameraViewMode;
  headlightsOn: boolean;
  vehicleX: number;
  vehicleZ: number;
  headingAngle: number;
  activeCity: CityId;
  activeMission: MissionDefinition | null;
  currentCheckpointIdx: number;
  missionTimeRemaining: number;
  missionCompleted: boolean;
  missionFailed: boolean;
  earnedCoins: number;
  earnedXP: number;
  earnedStars: number;
  onToggleCamera: () => void;
  onToggleHeadlights: () => void;
  onHornStart: () => void;
  onHornEnd: () => void;
  onPause: () => void;
  onRestartMission?: () => void;
  onExitMission?: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  speedKmH,
  gear,
  rpm,
  fuel,
  damage,
  driftScore,
  isDrifting,
  cameraMode,
  headlightsOn,
  vehicleX,
  vehicleZ,
  headingAngle,
  activeCity,
  activeMission,
  currentCheckpointIdx,
  missionTimeRemaining,
  missionCompleted,
  missionFailed,
  earnedCoins,
  earnedXP,
  earnedStars,
  onToggleCamera,
  onToggleHeadlights,
  onHornStart,
  onHornEnd,
  onPause,
  onRestartMission,
  onExitMission,
}) => {
  const minimapCanvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate target checkpoint direction
  let targetAngle = 0;
  let targetDistance = 0;
  if (activeMission && activeMission.checkpoints.length > 0) {
    const cp = activeMission.checkpoints[currentCheckpointIdx];
    if (cp) {
      const dx = cp.x - vehicleX;
      const dz = cp.z - vehicleZ;
      targetDistance = Math.round(Math.hypot(dx, dz));
      const angleToTarget = Math.atan2(dx, -dz);
      targetAngle = angleToTarget - headingAngle;
    }
  }

  // Draw functional Minimap Radar
  useEffect(() => {
    const canvas = minimapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 0.28;

    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(centerX, centerY);

    // Radar border
    ctx.beginPath();
    ctx.arc(0, 0, width / 2 - 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(10, 20, 26, 0.88)';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#0c6834';
    ctx.stroke();

    // Radar grid ring
    ctx.beginPath();
    ctx.arc(0, 0, (width / 2 - 4) * 0.5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(12, 104, 52, 0.35)';
    ctx.stroke();

    // Roads (relative to player vehicle)
    ctx.save();
    const roadOffsetX = -vehicleX * scale;
    const roadOffsetZ = -vehicleZ * scale;

    ctx.fillStyle = '#3a444c';
    ctx.fillRect(roadOffsetX - 12 * scale, -height, 24 * scale, height * 2);
    ctx.fillRect(-width, roadOffsetZ - 10 * scale, width * 2, 20 * scale);

    // Active Mission Checkpoint Marker on Minimap
    if (activeMission && activeMission.checkpoints.length > 0) {
      const cp = activeMission.checkpoints[currentCheckpointIdx];
      if (cp) {
        const cpMapX = (cp.x - vehicleX) * scale;
        const cpMapZ = (cp.z - vehicleZ) * scale;
        ctx.beginPath();
        ctx.arc(cpMapX, cpMapZ, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#00e676';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    ctx.restore();

    // Player Vehicle Icon (Centered)
    ctx.save();
    ctx.rotate(-headingAngle);
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(6, 7);
    ctx.lineTo(0, 4);
    ctx.lineTo(-6, 7);
    ctx.closePath();
    ctx.fillStyle = '#00e676';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.restore();
    ctx.restore();
  }, [vehicleX, vehicleZ, headingAngle, activeMission, currentCheckpointIdx]);

  const maxDisplaySpeed = 240;
  const speedRatio = Math.min(1.0, speedKmH / maxDisplaySpeed);
  const needleRotation = -120 + speedRatio * 240;
  const rpmRatio = Math.min(1.0, (rpm - 800) / (6500 - 800));
  const cityInfo = CITY_CONFIGS[activeCity] || CITY_CONFIGS.hargeisa;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '12px 16px',
        boxSizing: 'border-box',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          width: '100%',
        }}
      >
        {/* Left: Minimap & City Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '88px',
              height: '88px',
              position: 'relative',
              borderRadius: '50%',
              boxShadow: '0 4px 14px rgba(0,0,0,0.6)',
              border: '2px solid rgba(12, 104, 52, 0.8)',
              overflow: 'hidden',
            }}
          >
            <canvas ref={minimapCanvasRef} width={88} height={88} />
            <div
              style={{
                position: 'absolute',
                bottom: '2px',
                left: '0',
                right: '0',
                textAlign: 'center',
                fontSize: '8px',
                fontWeight: 800,
                color: '#69f0ae',
                textShadow: '0 1px 2px #000',
                textTransform: 'uppercase',
              }}
            >
              {cityInfo.name}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                background: 'rgba(0, 0, 0, 0.7)',
                padding: '3px 8px',
                borderRadius: '6px',
                borderLeft: '3px solid #0c6834',
              }}
            >
              {cityInfo.somaliName} • {cityInfo.name}
            </span>

            {/* Health / Damage Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(0,0,0,0.7)',
                padding: '2px 8px',
                borderRadius: '6px',
              }}
            >
              <AlertTriangle size={12} color={damage > 50 ? '#ff5252' : '#ffc107'} />
              <div
                style={{
                  width: '60px',
                  height: '5px',
                  backgroundColor: '#333',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${Math.max(0, 100 - damage)}%`,
                    height: '100%',
                    backgroundColor: damage > 60 ? '#f44336' : damage > 30 ? '#ff9800' : '#4caf50',
                    transition: 'width 0.2s ease',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center: Active Mission HUD or Drift notification */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          {activeMission && (
            <div
              style={{
                backgroundColor: 'rgba(10, 15, 20, 0.88)',
                border: '1px solid rgba(0, 230, 118, 0.4)',
                borderRadius: '12px',
                padding: '6px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
              }}
            >
              {/* Target Compass Arrow */}
              {targetDistance > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transform: `rotate(${targetAngle}rad)`,
                    color: '#00e676',
                  }}
                >
                  <Navigation size={18} fill="#00e676" />
                </div>
              )}

              <div>
                <div style={{ fontSize: '11px', fontWeight: 900, color: '#00e676', letterSpacing: '0.5px' }}>
                  {activeMission.title.toUpperCase()}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 800 }}>
                  {activeMission.checkpoints.length > 0
                    ? `CHECKPOINT ${currentCheckpointIdx + 1} / ${activeMission.checkpoints.length} • ${targetDistance}m`
                    : 'PARK ACCURATELY IN BAY'}
                </div>
              </div>

              {/* Mission Timer */}
              <div
                style={{
                  backgroundColor: missionTimeRemaining < 15 ? 'rgba(210,16,52,0.9)' : 'rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontWeight: 900,
                  fontSize: '14px',
                }}
              >
                ⏱ {Math.ceil(missionTimeRemaining)}s
              </div>
            </div>
          )}

          {isDrifting && (
            <div
              style={{
                background: 'linear-gradient(90deg, #d21034, #ff5722)',
                padding: '4px 16px',
                borderRadius: '16px',
                fontSize: '13px',
                fontWeight: 900,
                letterSpacing: '1px',
                boxShadow: '0 0 16px rgba(210, 16, 52, 0.8)',
              }}
            >
              DRIFT +{driftScore}
            </div>
          )}
        </div>

        {/* Right: Quick Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', pointerEvents: 'auto' }}>
          <button
            onClick={onToggleHeadlights}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: headlightsOn ? '#ffd600' : 'rgba(20, 28, 36, 0.75)',
              color: headlightsOn ? '#000000' : '#ffffff',
              border: '2px solid rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
            }}
          >
            <Lightbulb size={18} />
          </button>

          <button
            onPointerDown={onHornStart}
            onPointerUp={onHornEnd}
            onPointerCancel={onHornEnd}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(20, 28, 36, 0.75)',
              color: '#ffffff',
              border: '2px solid rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
            }}
          >
            <Volume2 size={18} />
          </button>

          <button
            onClick={onToggleCamera}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(20, 28, 36, 0.75)',
              color: '#ffffff',
              border: '2px solid rgba(255,255,255,0.2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
            }}
          >
            <Camera size={16} />
            <span style={{ fontSize: '7px', fontWeight: 800, textTransform: 'uppercase' }}>
              {cameraMode.slice(0, 3)}
            </span>
          </button>

          <button
            onClick={onPause}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(210, 16, 52, 0.85)',
              color: '#ffffff',
              border: '2px solid rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
            }}
          >
            <Pause size={18} />
          </button>
        </div>
      </div>

      {/* Bottom Center: Professional Digital Speedometer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          width: '100%',
          marginBottom: '6px',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '165px',
            height: '105px',
            background: 'radial-gradient(ellipse at bottom, rgba(12, 104, 52, 0.35) 0%, rgba(10, 15, 20, 0.85) 75%)',
            border: '2px solid rgba(255,255,255,0.15)',
            borderBottom: 'none',
            borderTopLeftRadius: '90px',
            borderTopRightRadius: '90px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingBottom: '8px',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.6)',
          }}
        >
          {/* Radial Needle */}
          <div
            style={{
              position: 'absolute',
              bottom: '15px',
              left: '50%',
              width: '3px',
              height: '62px',
              backgroundColor: '#ff334b',
              transformOrigin: 'bottom center',
              transform: `translateX(-50%) rotate(${needleRotation}deg)`,
              transition: 'transform 0.08s ease-out',
              boxShadow: '0 0 8px #ff334b',
              borderRadius: '2px',
            }}
          />

          <div
            style={{
              position: 'absolute',
              bottom: '9px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '15px',
              height: '15px',
              borderRadius: '50%',
              backgroundColor: '#111',
              border: '2px solid #00e676',
            }}
          />

          <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '32px',
                fontWeight: 900,
                letterSpacing: '-1px',
                color: '#ffffff',
                textShadow: '0 2px 8px rgba(0,0,0,0.9)',
                lineHeight: 1,
              }}
            >
              {Math.round(speedKmH)}
            </span>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#00e676', letterSpacing: '1px' }}>
              KM / H
            </span>
          </div>

          <div
            style={{
              position: 'absolute',
              top: '16px',
              fontSize: '14px',
              fontWeight: 900,
              color: gear === 'R' ? '#ff334b' : '#00e676',
              background: 'rgba(0,0,0,0.7)',
              padding: '2px 8px',
              borderRadius: '8px',
            }}
          >
            GEAR: {gear}
          </div>

          {/* RPM Bar */}
          <div
            style={{
              position: 'absolute',
              bottom: '2px',
              width: '85%',
              height: '4px',
              backgroundColor: '#222',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${rpmRatio * 100}%`,
                height: '100%',
                background:
                  rpmRatio > 0.85
                    ? 'linear-gradient(90deg, #ff9800, #f44336)'
                    : 'linear-gradient(90deg, #00e676, #ffeb3b)',
              }}
            />
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: '28px',
              left: '14px',
              fontSize: '8px',
              fontWeight: 700,
              color: fuel < 25 ? '#ff5252' : '#b0bec5',
            }}
          >
            ⛽ {Math.round(fuel)}%
          </div>
        </div>
      </div>

      {/* Mission Completed Modal Overlay */}
      {missionCompleted && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(5, 12, 18, 0.88)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 110,
            pointerEvents: 'auto',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(18, 25, 33, 0.96)',
              border: '2px solid #00e676',
              borderRadius: '20px',
              padding: '28px 36px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px',
              boxShadow: '0 12px 36px rgba(0,230,118,0.3)',
              textAlign: 'center',
            }}
          >
            <CheckCircle size={48} color="#00e676" />
            <h2 style={{ fontSize: '26px', fontWeight: 900, margin: 0 }}>MISSION COMPLETED!</h2>
            <div style={{ fontSize: '14px', color: '#69f0ae' }}>GUUL! HOWSHII WAY DHAMAYSTIRANTAHAY</div>

            {/* Stars */}
            <div style={{ display: 'flex', gap: '8px', fontSize: '28px' }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} style={{ color: i < earnedStars ? '#ffd54f' : '#444' }}>
                  ★
                </span>
              ))}
            </div>

            {/* Rewards */}
            <div style={{ display: 'flex', gap: '20px', margin: '8px 0' }}>
              <div style={{ background: 'rgba(255,255,255,0.08)', padding: '8px 16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', color: '#90a4ae' }}>COINS EARNED</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#ffd54f' }}>+{earnedCoins}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.08)', padding: '8px 16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', color: '#90a4ae' }}>XP EARNED</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#4fc3f7' }}>+{earnedXP} XP</div>
              </div>
            </div>

            <button
              onClick={onExitMission}
              style={{
                backgroundColor: '#0c6834',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 32px',
                fontSize: '15px',
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              CONTINUE TO GARAGE / MENU
            </button>
          </div>
        </div>
      )}

      {/* Mission Failed Modal Overlay */}
      {missionFailed && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(20, 5, 8, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 110,
            pointerEvents: 'auto',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(28, 18, 22, 0.96)',
              border: '2px solid #ff1744',
              borderRadius: '20px',
              padding: '28px 36px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px',
              boxShadow: '0 12px 36px rgba(255,23,68,0.3)',
              textAlign: 'center',
            }}
          >
            <XCircle size={48} color="#ff1744" />
            <h2 style={{ fontSize: '26px', fontWeight: 900, margin: 0 }}>TIME EXPIRED!</h2>
            <div style={{ fontSize: '13px', color: '#ff8a80' }}>WAQTIGII WAA KAABA DHAMAADAY</div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button
                onClick={onRestartMission}
                style={{
                  backgroundColor: '#0c6834',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 24px',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                RETRY MISSION
              </button>
              <button
                onClick={onExitMission}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: '1px solid #fff',
                  borderRadius: '12px',
                  padding: '10px 24px',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                MAIN MENU
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
