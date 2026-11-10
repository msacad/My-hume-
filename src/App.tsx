import React, { useState, useEffect } from 'react';
import { MainMenu } from './scenes/MainMenu';
import { GameCanvas } from './game/GameCanvas';
import { GarageScene, GARAGE_PAINTS } from './garage/GarageScene';
import { GameSettings, GameStorage, PlayerProfile } from './storage/GameStorage';
import { CityId } from './environment/CityEnvironments';
import { MissionDefinition } from './systems/MissionSystem';

type ScreenState = 'menu' | 'playing' | 'garage';

export const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenState>('menu');
  const [settings, setSettings] = useState<GameSettings>(GameStorage.getSettings());
  const [profile, setProfile] = useState<PlayerProfile>(GameStorage.getProfile());
  const [activeCity, setActiveCity] = useState<CityId>(settings.selectedCity || 'hargeisa');
  const [activeMission, setActiveMission] = useState<MissionDefinition | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const selectedColorHex = GARAGE_PAINTS[settings.selectedColorIndex || 0]?.hex || '#0c6834';

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 400);

    const handleAndroidBack = () => {
      setScreen((prev) => {
        if (prev === 'playing' || prev === 'garage') {
          return 'menu';
        }
        return prev;
      });
    };

    window.addEventListener('androidBackPressed', handleAndroidBack);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('androidBackPressed', handleAndroidBack);
    };
  }, []);

  const handleStartFreeDrive = (cityId: CityId) => {
    setActiveCity(cityId);
    setActiveMission(null);
    setScreen('playing');
  };

  const handleStartMission = (mission: MissionDefinition) => {
    setActiveCity(mission.cityId);
    setActiveMission(mission);
    setScreen('playing');
  };

  const handleOpenGarage = () => {
    setProfile(GameStorage.getProfile());
    setSettings(GameStorage.getSettings());
    setScreen('garage');
  };

  const handleExitToMenu = () => {
    setProfile(GameStorage.getProfile());
    setSettings(GameStorage.getSettings());
    setActiveMission(null);
    setScreen('menu');
  };

  const handleUpdateSettings = (partial: Partial<GameSettings>) => {
    const updated = GameStorage.saveSettings(partial);
    setSettings(updated);
  };

  const handleUpdateProfile = (partial: Partial<PlayerProfile>) => {
    const updated = GameStorage.saveProfile(partial);
    setProfile(updated);
  };

  const handleMissionCompleted = (_stars: number, _coins: number, _xp: number) => {
    setProfile(GameStorage.getProfile());
  };

  if (loading) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#0a0e14',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontFamily: 'system-ui, sans-serif',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', gap: '4px' }}>
          <div style={{ width: '22px', height: '14px', backgroundColor: '#0c6834' }} />
          <div
            style={{
              width: '22px',
              height: '14px',
              backgroundColor: '#ffffff',
              color: '#000',
              fontSize: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
            }}
          >
            ★
          </div>
          <div style={{ width: '22px', height: '14px', backgroundColor: '#c8102e' }} />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '1px' }}>
          SOMALILAND DRIVING SIMULATOR
        </h2>
        <div style={{ fontSize: '12px', color: '#69f0ae' }}>
          Loading 3D Cities, Traffic AI & Vehicles...
        </div>
        <div
          style={{
            width: '180px',
            height: '4px',
            backgroundColor: '#222',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#00e676',
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#000000',
      }}
    >
      {screen === 'menu' && (
        <MainMenu
          settings={settings}
          profile={profile}
          onStartFreeDrive={handleStartFreeDrive}
          onStartMission={handleStartMission}
          onOpenGarage={handleOpenGarage}
          onUpdateSettings={handleUpdateSettings}
        />
      )}

      {screen === 'garage' && (
        <GarageScene
          settings={settings}
          profile={profile}
          onUpdateSettings={handleUpdateSettings}
          onUpdateProfile={handleUpdateProfile}
          onBackToMenu={handleExitToMenu}
        />
      )}

      {screen === 'playing' && (
        <GameCanvas
          settings={settings}
          vehicleColorHex={selectedColorHex}
          activeCity={activeCity}
          activeMission={activeMission}
          onExitToMenu={handleExitToMenu}
          onMissionCompleted={handleMissionCompleted}
        />
      )}
    </div>
  );
};

export default App;
