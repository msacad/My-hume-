import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { VehicleControlInput } from '../physics/VehiclePhysics';

interface MobileControlsProps {
  steeringMode: 'buttons' | 'wheel';
  onInputChange: (input: VehicleControlInput) => void;
  onToggleCamera: () => void;
  onHornStart: () => void;
  onHornEnd: () => void;
  onPause: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  steeringMode,
  onInputChange,
  onToggleCamera,
  onHornStart,
  onHornEnd,
  onPause,
}) => {
  // Active control states
  const [throttle, setThrottle] = useState(0);
  const [brake, setBrake] = useState(0);
  const [reverse, setReverse] = useState(0);
  const [steer, setSteer] = useState(0);
  const [handbrake, setHandbrake] = useState(false);
  const [isReverseGear, setIsReverseGear] = useState(false);

  // Wheel drag state
  const wheelRef = useRef<HTMLDivElement>(null);
  const [wheelAngle, setWheelAngle] = useState(0);
  const wheelPointerId = useRef<number | null>(null);

  // Keep a ref of current input to dispatch smoothly
  const inputRef = useRef<VehicleControlInput>({
    throttle: 0,
    brake: 0,
    reverse: 0,
    steer: 0,
    handbrake: false,
    isReverseGear: false,
  });

  const updateInput = (partial: Partial<VehicleControlInput>) => {
    inputRef.current = { ...inputRef.current, ...partial };
    onInputChange(inputRef.current);
  };

  // Keyboard controls listener for PC/laptop testing
  useEffect(() => {
    const activeKeys: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      activeKeys[e.code] = true;

      if (e.code === 'KeyC') onToggleCamera();
      if (e.code === 'KeyH') onHornStart();
      if (e.code === 'Escape' || e.code === 'KeyP') onPause();

      syncKeyboard();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      activeKeys[e.code] = false;
      if (e.code === 'KeyH') onHornEnd();
      syncKeyboard();
    };

    const syncKeyboard = () => {
      const isUp = activeKeys['KeyW'] || activeKeys['ArrowUp'];
      const isDown = activeKeys['KeyS'] || activeKeys['ArrowDown'];
      const isLeft = activeKeys['KeyA'] || activeKeys['ArrowLeft'];
      const isRight = activeKeys['KeyD'] || activeKeys['ArrowRight'];
      const isSpace = activeKeys['Space'];

      const newThrottle = isUp ? 1 : 0;
      const newBrake = isDown ? 1 : 0;
      let newSteer = 0;
      if (isLeft && !isRight) newSteer = -1;
      else if (isRight && !isLeft) newSteer = 1;

      setThrottle(newThrottle);
      setBrake(newBrake);
      setSteer(newSteer);
      setHandbrake(!!isSpace);

      updateInput({
        throttle: newThrottle,
        brake: newBrake,
        steer: newSteer,
        handbrake: !!isSpace,
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onToggleCamera, onHornStart, onHornEnd, onPause]);

  // Touch pointer handlers for buttons
  const handleSteerLeft = (active: boolean) => {
    const val = active ? -1 : steer === -1 ? 0 : steer;
    setSteer(val);
    updateInput({ steer: val });
  };

  const handleSteerRight = (active: boolean) => {
    const val = active ? 1 : steer === 1 ? 0 : steer;
    setSteer(val);
    updateInput({ steer: val });
  };

  const handleGas = (active: boolean) => {
    const val = active ? 1 : 0;
    setThrottle(val);
    updateInput({ throttle: val });
  };

  const handleBrake = (active: boolean) => {
    const val = active ? 1 : 0;
    setBrake(val);
    updateInput({ brake: val });
  };

  const handleHandbrake = (active: boolean) => {
    setHandbrake(active);
    updateInput({ handbrake: active });
  };

  const toggleReverseGear = () => {
    const next = !isReverseGear;
    setIsReverseGear(next);
    updateInput({ isReverseGear: next });
  };

  // Interactive Steering Wheel Touch Handler
  const handleWheelPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    wheelPointerId.current = e.pointerId;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    calculateWheelAngle(e.clientX, e.clientY);
  };

  const handleWheelPointerMove = (e: React.PointerEvent) => {
    if (wheelPointerId.current === e.pointerId) {
      calculateWheelAngle(e.clientX, e.clientY);
    }
  };

  const handleWheelPointerUp = (e: React.PointerEvent) => {
    if (wheelPointerId.current === e.pointerId) {
      wheelPointerId.current = null;
      setWheelAngle(0);
      setSteer(0);
      updateInput({ steer: 0 });
    }
  };

  const calculateWheelAngle = (clientX: number, clientY: number) => {
    if (!wheelRef.current) return;
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;

    let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (deg > 180) deg -= 360;

    // Clamp wheel rotation to +/- 120 degrees
    const clampedDeg = Math.max(-120, Math.min(120, deg));
    setWheelAngle(clampedDeg);

    const steerNormalized = Math.max(-1, Math.min(1, clampedDeg / 90));
    setSteer(steerNormalized);
    updateInput({ steer: steerNormalized });
  };

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
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        padding: '16px 20px',
        boxSizing: 'border-box',
        touchAction: 'none',
      }}
    >
      {/* LEFT CONTROLS: Steering (Buttons or Wheel) */}
      <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'flex-end' }}>
        {steeringMode === 'buttons' ? (
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {/* Steer Left Button */}
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                handleSteerLeft(true);
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                handleSteerLeft(false);
              }}
              onPointerCancel={(e) => {
                e.preventDefault();
                handleSteerLeft(false);
              }}
              style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                backgroundColor: steer === -1 ? 'rgba(12, 104, 52, 0.95)' : 'rgba(20, 28, 36, 0.78)',
                border: '3px solid ' + (steer === -1 ? '#00e676' : 'rgba(255, 255, 255, 0.25)'),
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: steer === -1 ? 'scale(0.92)' : 'scale(1)',
                transition: 'transform 0.08s, background-color 0.08s',
                boxShadow: '0 6px 16px rgba(0,0,0,0.5)',
                touchAction: 'none',
              }}
            >
              <ChevronLeft size={42} />
            </button>

            {/* Steer Right Button */}
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                handleSteerRight(true);
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                handleSteerRight(false);
              }}
              onPointerCancel={(e) => {
                e.preventDefault();
                handleSteerRight(false);
              }}
              style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                backgroundColor: steer === 1 ? 'rgba(12, 104, 52, 0.95)' : 'rgba(20, 28, 36, 0.78)',
                border: '3px solid ' + (steer === 1 ? '#00e676' : 'rgba(255, 255, 255, 0.25)'),
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: steer === 1 ? 'scale(0.92)' : 'scale(1)',
                transition: 'transform 0.08s, background-color 0.08s',
                boxShadow: '0 6px 16px rgba(0,0,0,0.5)',
                touchAction: 'none',
              }}
            >
              <ChevronRight size={42} />
            </button>
          </div>
        ) : (
          /* Interactive Rotatable Steering Wheel */
          <div
            ref={wheelRef}
            onPointerDown={handleWheelPointerDown}
            onPointerMove={handleWheelPointerMove}
            onPointerUp={handleWheelPointerUp}
            onPointerCancel={handleWheelPointerUp}
            style={{
              width: '130px',
              height: '130px',
              borderRadius: '50%',
              backgroundColor: 'rgba(15, 20, 25, 0.85)',
              border: '6px solid #2e3842',
              boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `rotate(${wheelAngle}deg)`,
              touchAction: 'none',
              cursor: 'grab',
            }}
          >
            {/* Center Cap with Somaliland Green and Star */}
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: '#0c6834',
                border: '2px solid #ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000000',
                fontSize: '20px',
                fontWeight: 900,
              }}
            >
              ★
            </div>
            {/* Spokes */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '10px',
                backgroundColor: '#2e3842',
                top: 'calc(50% - 5px)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                height: '50%',
                width: '10px',
                backgroundColor: '#2e3842',
                bottom: 0,
                left: 'calc(50% - 5px)',
              }}
            />
          </div>
        )}
      </div>

      {/* RIGHT CONTROLS: Pedals & Handbrake */}
      <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'flex-end', gap: '14px' }}>
        {/* Handbrake (Drift) Button */}
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            handleHandbrake(true);
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            handleHandbrake(false);
          }}
          onPointerCancel={(e) => {
            e.preventDefault();
            handleHandbrake(false);
          }}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            backgroundColor: handbrake ? 'rgba(255, 87, 34, 0.95)' : 'rgba(25, 32, 40, 0.8)',
            border: '2px solid ' + (handbrake ? '#ff5722' : 'rgba(255, 255, 255, 0.25)'),
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '11px',
            letterSpacing: '0.5px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            transform: handbrake ? 'scale(0.92)' : 'scale(1)',
            transition: 'transform 0.08s',
            touchAction: 'none',
          }}
        >
          <span style={{ fontSize: '18px' }}>(P)</span>
          DRIFT
        </button>

        {/* Reverse Gear Toggle Button */}
        <button
          onClick={toggleReverseGear}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            backgroundColor: isReverseGear ? '#ff1744' : 'rgba(30, 40, 50, 0.8)',
            border: '2px solid ' + (isReverseGear ? '#ffffff' : 'rgba(255, 255, 255, 0.2)'),
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '10px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
            touchAction: 'none',
          }}
        >
          <span style={{ fontSize: '16px' }}>{isReverseGear ? 'R' : 'D'}</span>
          GEAR
        </button>

        {/* Brake Pedal */}
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            handleBrake(true);
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            handleBrake(false);
          }}
          onPointerCancel={(e) => {
            e.preventDefault();
            handleBrake(false);
          }}
          style={{
            width: '68px',
            height: '84px',
            borderRadius: '14px',
            backgroundColor: brake > 0 ? 'rgba(210, 16, 52, 0.95)' : 'rgba(25, 30, 36, 0.85)',
            border: '3px solid ' + (brake > 0 ? '#ff1744' : 'rgba(255, 255, 255, 0.3)'),
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            fontWeight: 900,
            fontSize: '12px',
            boxShadow: '0 6px 16px rgba(0,0,0,0.6)',
            transform: brake > 0 ? 'scale(0.92)' : 'scale(1)',
            transition: 'transform 0.08s',
            touchAction: 'none',
          }}
        >
          <div style={{ width: '36px', height: '4px', backgroundColor: '#666', borderRadius: '2px' }} />
          <div style={{ width: '36px', height: '4px', backgroundColor: '#666', borderRadius: '2px' }} />
          <span>BRAKE</span>
        </button>

        {/* Accelerator Pedal (Gas) */}
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            handleGas(true);
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            handleGas(false);
          }}
          onPointerCancel={(e) => {
            e.preventDefault();
            handleGas(false);
          }}
          style={{
            width: '74px',
            height: '110px',
            borderRadius: '16px',
            backgroundColor: throttle > 0 ? 'rgba(12, 104, 52, 0.95)' : 'rgba(25, 30, 36, 0.85)',
            border: '3px solid ' + (throttle > 0 ? '#00e676' : 'rgba(255, 255, 255, 0.35)'),
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontWeight: 900,
            fontSize: '13px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.7)',
            transform: throttle > 0 ? 'scale(0.92)' : 'scale(1)',
            transition: 'transform 0.08s',
            touchAction: 'none',
          }}
        >
          <div style={{ width: '40px', height: '4px', backgroundColor: '#00e676', borderRadius: '2px' }} />
          <div style={{ width: '40px', height: '4px', backgroundColor: '#00e676', borderRadius: '2px' }} />
          <div style={{ width: '40px', height: '4px', backgroundColor: '#00e676', borderRadius: '2px' }} />
          <span>GAS</span>
        </button>
      </div>
    </div>
  );
};
