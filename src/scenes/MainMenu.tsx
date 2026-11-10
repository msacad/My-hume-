import React, { useState } from 'react';
import {
  Play,
  Compass,
  MapPin,
  Car,
  Award,
  Settings as SettingsIcon,
  Trophy,
  Volume2,
  VolumeX,
  ChevronRight,
  Sun,
  Sunset,
  Moon,
  Coins,
} from 'lucide-react';
import { GameSettings, PlayerProfile } from '../storage/GameStorage';
import { AudioEngine } from '../audio/AudioEngine';
import { CityId, CITY_CONFIGS } from '../environment/CityEnvironments';
import { MISSIONS, MissionDefinition } from '../systems/MissionSystem';
import { VEHICLE_CATALOG } from '../vehicle/VehicleRegistry';

interface MainMenuProps {
  settings: GameSettings;
  profile: PlayerProfile;
  onStartFreeDrive: (cityId: CityId) => void;
  onStartMission: (mission: MissionDefinition) => void;
  onOpenGarage: () => void;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
}

type MenuTab = 'home' | 'city_select' | 'missions' | 'settings' | 'leaderboard';

export const CITIES_LIST = [
  {
    id: 'hargeisa' as CityId,
    name: 'Hargeisa',
    somaliName: 'Hargeysa',
    tag: 'Capital City • Independence Avenue',
    image: './game_assets/city_previews/hargeisa_menu_preview.png',
    description: 'Explore the bustling heart of Somaliland, Freedom Square MiG monument, and grand avenues.',
  },
  {
    id: 'berbera' as CityId,
    name: 'Berbera',
    somaliName: 'Barbara',
    tag: 'Red Sea Port • Coastal Highway',
    image: './game_assets/city_previews/berbera_city_preview.png',
    description: 'Cruise along the Gulf of Aden coastal highway, shipping container terminals, and lighthouse.',
  },
  {
    id: 'borama' as CityId,
    name: 'Borama',
    somaliName: 'Boorama',
    tag: 'Mountain Roads • Amoud University',
    image: './game_assets/city_previews/borama_city_preview.png',
    description: 'Navigate scenic winding mountain passes, terraced villas, and the grand university arch.',
  },
  {
    id: 'burco' as CityId,
    name: 'Burco',
    somaliName: 'Burao',
    tag: 'Crossroads • Togdheer Bridge',
    image: './game_assets/city_previews/burco_city_preview.png',
    description: 'Cross the massive Togdheer dry-river bridge, trade crossroads, and livestock market gates.',
  },
];

export const MainMenu: React.FC<MainMenuProps> = ({
  settings,
  profile,
  onStartFreeDrive,
  onStartMission,
  onOpenGarage,
  onUpdateSettings,
}) => {
  const [activeTab, setActiveTab] = useState<MenuTab>('home');
  const [selectedCityId, setSelectedCityId] = useState<CityId>(settings.selectedCity || 'hargeisa');

  const audio = AudioEngine.getInstance();
  const activeVehicle = VEHICLE_CATALOG.find((v) => v.id === settings.selectedVehicleId) || VEHICLE_CATALOG[0];

  const handleTabClick = (tab: MenuTab) => {
    audio.playButtonClick();
    setActiveTab(tab);
  };

  const handlePlayNow = () => {
    audio.playButtonClick();
    onStartFreeDrive(selectedCityId);
  };

  const toggleSound = () => {
    const next = !settings.soundEnabled;
    audio.setEnabled(next);
    onUpdateSettings({ soundEnabled: next });
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#0a0e14',
        backgroundImage: 'radial-gradient(circle at 60% 40%, #152720 0%, #080c10 90%)',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          height: '56px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          backgroundColor: 'rgba(10, 15, 20, 0.95)',
          borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '26px',
              height: '22px',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <div style={{ flex: 1, backgroundColor: '#0c6834' }} />
            <div
              style={{
                flex: 1,
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000',
                fontSize: '8px',
                fontWeight: 900,
              }}
            >
              ★
            </div>
            <div style={{ flex: 1, backgroundColor: '#c8102e' }} />
          </div>

          <div>
            <div style={{ fontSize: '17px', fontWeight: 900, letterSpacing: '1px' }}>
              SOMALILAND DRIVING SIMULATOR
            </div>
            <div style={{ fontSize: '10px', color: '#69f0ae', fontWeight: 700 }}>
              4 EXPLORABLE CITIES • TRAFFIC AI • MISSIONS
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Coins size={15} color="#ffd54f" />
            <span>{profile.coins.toLocaleString()}</span>
          </div>

          <div
            style={{
              background: 'rgba(12, 104, 52, 0.8)',
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: 800,
            }}
          >
            LVL {profile.level} ({profile.xp} XP)
          </div>

          <button
            onClick={toggleSound}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              color: settings.soundEnabled ? '#00e676' : '#999',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {settings.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div style={{ display: 'flex', flex: 1, height: 'calc(100% - 56px)', position: 'relative' }}>
        {/* Left Navigation Sidebar */}
        <div
          style={{
            width: '210px',
            backgroundColor: 'rgba(12, 17, 24, 0.95)',
            borderRight: '1px solid rgba(255,255,255,0.08)',
            padding: '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            zIndex: 5,
          }}
        >
          <button
            onClick={handlePlayNow}
            style={{
              background: 'linear-gradient(135deg, #0c6834 0%, #158a47 100%)',
              border: '2px solid #00e676',
              borderRadius: '12px',
              padding: '12px 14px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              fontWeight: 900,
              fontSize: '14px',
              letterSpacing: '1px',
              boxShadow: '0 6px 16px rgba(12, 104, 52, 0.6)',
              marginBottom: '4px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Play size={18} fill="#ffffff" />
              <span>PLAY NOW</span>
            </div>
            <ChevronRight size={16} />
          </button>

          <button
            onClick={() => handleTabClick('home')}
            style={{
              backgroundColor: activeTab === 'home' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)',
              border: '1px solid ' + (activeTab === 'home' ? '#00e676' : 'rgba(255,255,255,0.08)'),
              borderRadius: '10px',
              padding: '10px 14px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
            }}
          >
            <Compass size={16} color="#69f0ae" />
            <span>FREE DRIVE</span>
          </button>

          <button
            onClick={() => handleTabClick('city_select')}
            style={{
              backgroundColor: activeTab === 'city_select' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)',
              border: '1px solid ' + (activeTab === 'city_select' ? '#00e676' : 'rgba(255,255,255,0.08)'),
              borderRadius: '10px',
              padding: '10px 14px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
            }}
          >
            <MapPin size={16} color="#ffb74d" />
            <span>FOUR CITIES</span>
          </button>

          {/* GARAGE Button */}
          <button
            onClick={() => {
              audio.playButtonClick();
              onOpenGarage();
            }}
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              padding: '10px 14px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
            }}
          >
            <Car size={16} color="#4fc3f7" />
            <span>GARAGE (5 CARS)</span>
          </button>

          <button
            onClick={() => handleTabClick('missions')}
            style={{
              backgroundColor: activeTab === 'missions' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)',
              border: '1px solid ' + (activeTab === 'missions' ? '#00e676' : 'rgba(255,255,255,0.08)'),
              borderRadius: '10px',
              padding: '10px 14px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
            }}
          >
            <Award size={16} color="#ab47bc" />
            <span>CAREER MISSIONS</span>
          </button>

          <button
            onClick={() => handleTabClick('settings')}
            style={{
              backgroundColor: activeTab === 'settings' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)',
              border: '1px solid ' + (activeTab === 'settings' ? '#00e676' : 'rgba(255,255,255,0.08)'),
              borderRadius: '10px',
              padding: '10px 14px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
            }}
          >
            <SettingsIcon size={16} color="#e0e0e0" />
            <span>SETTINGS</span>
          </button>

          <button
            onClick={() => handleTabClick('leaderboard')}
            style={{
              backgroundColor: activeTab === 'leaderboard' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)',
              border: '1px solid ' + (activeTab === 'leaderboard' ? '#00e676' : 'rgba(255,255,255,0.08)'),
              borderRadius: '10px',
              padding: '10px 14px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
            }}
          >
            <Trophy size={16} color="#ffd54f" />
            <span>LEADERBOARD</span>
          </button>
        </div>

        {/* Central Dynamic Content Pane */}
        <div style={{ flex: 1, padding: '20px 28px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {/* HOME / FREE DRIVE TAB */}
          {activeTab === 'home' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <div>
                <span
                  style={{
                    backgroundColor: '#0c6834',
                    color: '#ffffff',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 900,
                    letterSpacing: '1px',
                  }}
                >
                  ACTIVE CITY: {selectedCityId.toUpperCase()}
                </span>
                <h1 style={{ fontSize: '28px', fontWeight: 900, margin: '8px 0 4px 0' }}>
                  {activeVehicle.name.toUpperCase()}
                </h1>
                <p style={{ color: '#b0bec5', fontSize: '13px', maxWidth: '600px', margin: 0, lineHeight: 1.5 }}>
                  Drive with AI traffic across four full Somaliland environments. Experience responsive steering, drifting, automatic gears, and realistic vehicle weight.
                </p>
              </div>

              {/* Time of Day Weather Selector */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: 'rgba(20,28,36,0.7)',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  margin: '12px 0',
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#90a4ae' }}>TIME OF DAY:</span>
                {(['sunny', 'sunset', 'night'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => onUpdateSettings({ timeOfDay: t })}
                    style={{
                      background: settings.timeOfDay === t ? '#0c6834' : 'transparent',
                      border: '1px solid ' + (settings.timeOfDay === t ? '#00e676' : 'rgba(255,255,255,0.2)'),
                      color: '#fff',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {t === 'sunny' && <Sun size={14} color="#ffd54f" />}
                    {t === 'sunset' && <Sunset size={14} color="#ff9800" />}
                    {t === 'night' && <Moon size={14} color="#81d4fa" />}
                    <span style={{ textTransform: 'capitalize' }}>{t}</span>
                  </button>
                ))}
              </div>

              {/* Vehicle Specs Bar */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '14px',
                  backgroundColor: 'rgba(20, 28, 36, 0.75)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '14px',
                  padding: '14px 20px',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: '#90a4ae', fontWeight: 700 }}>TOP SPEED</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#00e676' }}>{activeVehicle.topSpeedKmH} KM/H</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#90a4ae', fontWeight: 700 }}>0-100 ACCEL</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#4fc3f7' }}>{activeVehicle.acceleration0to100}s</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#90a4ae', fontWeight: 700 }}>HANDLING</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#ffb74d' }}>{activeVehicle.handlingRating}%</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#90a4ae', fontWeight: 700 }}>BRAKING</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#f06292' }}>{activeVehicle.brakingRating}%</div>
                </div>
              </div>

              {/* Action */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
                <button
                  onClick={handlePlayNow}
                  style={{
                    background: 'linear-gradient(90deg, #0c6834, #1b8e49)',
                    color: '#ffffff',
                    border: '2px solid #69f0ae',
                    borderRadius: '14px',
                    padding: '14px 40px',
                    fontSize: '16px',
                    fontWeight: 900,
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(12, 104, 52, 0.6)',
                  }}
                >
                  START ENGINE & DRIVE
                </button>
              </div>
            </div>
          )}

          {/* FOUR CITIES TAB */}
          {activeTab === 'city_select' && (
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '4px' }}>EXPLORE SOMALILAND CITIES</h2>
              <p style={{ color: '#90a4ae', fontSize: '12px', marginBottom: '16px' }}>
                All four cities are fully explorable with AI traffic and unique regional landmarks!
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                {CITIES_LIST.map((city) => (
                  <div
                    key={city.id}
                    onClick={() => {
                      audio.playButtonClick();
                      setSelectedCityId(city.id);
                      onUpdateSettings({ selectedCity: city.id });
                    }}
                    style={{
                      backgroundColor: 'rgba(20, 28, 36, 0.85)',
                      border: '2px solid ' + (selectedCityId === city.id ? '#00e676' : 'rgba(255,255,255,0.1)'),
                      borderRadius: '14px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      boxShadow: '0 6px 18px rgba(0,0,0,0.4)',
                    }}
                  >
                    <div style={{ height: '100px', position: 'relative', overflow: 'hidden' }}>
                      <img src={city.image} alt={city.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <span
                        style={{
                          position: 'absolute',
                          top: '6px',
                          right: '8px',
                          backgroundColor: '#0c6834',
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        EXPLORABLE NOW
                      </span>
                    </div>

                    <div style={{ padding: '10px 14px' }}>
                      <div style={{ fontSize: '16px', fontWeight: 800 }}>
                        {city.somaliName} ({city.name})
                      </div>
                      <div style={{ fontSize: '11px', color: '#ffb74d', fontWeight: 700, margin: '2px 0' }}>
                        {city.tag}
                      </div>
                      <div style={{ fontSize: '11px', color: '#90a4ae', lineHeight: 1.4 }}>{city.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CAREER MISSIONS TAB */}
          {activeTab === 'missions' && (
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '4px' }}>CAREER MISSIONS</h2>
              <p style={{ color: '#90a4ae', fontSize: '12px', marginBottom: '16px' }}>
                Select a mission to earn coins, XP, and unlock new vehicles.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                {MISSIONS.map((m) => {
                  const stars = profile.completedMissions[m.id] || 0;
                  return (
                    <div
                      key={m.id}
                      style={{
                        backgroundColor: 'rgba(20, 28, 36, 0.85)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '14px',
                        padding: '14px 18px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '8px',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 900,
                              backgroundColor: '#0c6834',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              textTransform: 'uppercase',
                            }}
                          >
                            {m.cityId} • {m.mode}
                          </span>
                          <div style={{ color: '#ffd54f', fontSize: '14px' }}>
                            {'★'.repeat(stars)}
                            {'☆'.repeat(3 - stars)}
                          </div>
                        </div>

                        <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '6px 0 2px 0' }}>{m.title}</h3>
                        <div style={{ fontSize: '11px', color: '#69f0ae', fontWeight: 700 }}>{m.somaliTitle}</div>
                        <p style={{ fontSize: '12px', color: '#90a4ae', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                          {m.description}
                        </p>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                        <div style={{ fontSize: '11px', color: '#ffd54f', fontWeight: 700 }}>
                          +{m.rewardCoins} COINS • +{m.rewardXP} XP
                        </div>
                        <button
                          onClick={() => {
                            audio.playButtonClick();
                            onStartMission(m);
                          }}
                          style={{
                            backgroundColor: '#0c6834',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '6px 16px',
                            fontSize: '12px',
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          LAUNCH
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '6px' }}>SETTINGS & CONTROLS</h2>
              <div
                style={{
                  backgroundColor: 'rgba(20, 28, 36, 0.85)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  maxWidth: '540px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '14px' }}>Steering Control Mode</div>
                    <div style={{ fontSize: '11px', color: '#90a4ae' }}>Buttons or interactive rotatable wheel</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => onUpdateSettings({ steeringMode: 'buttons' })}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: '1px solid ' + (settings.steeringMode === 'buttons' ? '#00e676' : '#444'),
                        backgroundColor: settings.steeringMode === 'buttons' ? '#0c6834' : 'transparent',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      Buttons
                    </button>
                    <button
                      onClick={() => onUpdateSettings({ steeringMode: 'wheel' })}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: '1px solid ' + (settings.steeringMode === 'wheel' ? '#00e676' : '#444'),
                        backgroundColor: settings.steeringMode === 'wheel' ? '#0c6834' : 'transparent',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      Steering Wheel
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '14px' }}>Graphics Quality</div>
                    <div style={{ fontSize: '11px', color: '#90a4ae' }}>Shadow map & draw distance</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => onUpdateSettings({ graphicsQuality: 'low' })}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: '1px solid ' + (settings.graphicsQuality === 'low' ? '#00e676' : '#444'),
                        backgroundColor: settings.graphicsQuality === 'low' ? '#0c6834' : 'transparent',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      Low
                    </button>
                    <button
                      onClick={() => onUpdateSettings({ graphicsQuality: 'high' })}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: '1px solid ' + (settings.graphicsQuality === 'high' ? '#00e676' : '#444'),
                        backgroundColor: settings.graphicsQuality === 'high' ? '#0c6834' : 'transparent',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      High
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '14px' }}>Audio & Engine Sound</div>
                    <div style={{ fontSize: '11px', color: '#90a4ae' }}>Procedural engine audio & horns</div>
                  </div>
                  <button
                    onClick={toggleSound}
                    style={{
                      padding: '6px 16px',
                      borderRadius: '8px',
                      border: '1px solid ' + (settings.soundEnabled ? '#00e676' : '#444'),
                      backgroundColor: settings.soundEnabled ? '#0c6834' : 'transparent',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    {settings.soundEnabled ? 'ENABLED' : 'MUTED'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* LEADERBOARD TAB */}
          {activeTab === 'leaderboard' && (
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '6px' }}>SOMALILAND HIGH SCORES</h2>
              <div
                style={{
                  backgroundColor: 'rgba(20, 28, 36, 0.85)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  maxWidth: '650px',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr 120px 100px',
                    padding: '12px 18px',
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#90a4ae',
                  }}
                >
                  <span>RANK</span>
                  <span>DRIVER</span>
                  <span>DRIFT PTS</span>
                  <span>TOP SPEED</span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr 120px 100px',
                    padding: '14px 18px',
                    alignItems: 'center',
                    backgroundColor: 'rgba(12, 104, 52, 0.25)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <span style={{ fontWeight: 900, color: '#ffd54f' }}>#1 👑</span>
                  <div>
                    <div style={{ fontWeight: 800 }}>YOU (Driver 1)</div>
                    <div style={{ fontSize: '11px', color: '#69f0ae' }}>Level {profile.level}</div>
                  </div>
                  <span style={{ fontWeight: 900, color: '#00e676' }}>{profile.totalDriftPoints}</span>
                  <span style={{ fontWeight: 800 }}>{profile.topSpeedReached} km/h</span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr 120px 100px',
                    padding: '12px 18px',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <span style={{ fontWeight: 800 }}>#2</span>
                  <div>HargeisaExpress</div>
                  <span style={{ color: '#b0bec5' }}>2,450</span>
                  <span>192 km/h</span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr 120px 100px',
                    padding: '12px 18px',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontWeight: 800 }}>#3</span>
                  <div>BerberaRacer</div>
                  <span style={{ color: '#b0bec5' }}>1,880</span>
                  <span>185 km/h</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
