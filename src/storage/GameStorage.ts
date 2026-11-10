/**
 * Comprehensive Persistent Storage for Somaliland Driving Simulator
 * Handles player wallet, XP, level, vehicle ownership, customization,
 * completed missions, stars, and game settings.
 */

import { CityId } from '../environment/CityEnvironments';

export interface GameSettings {
  graphicsQuality: 'low' | 'high';
  steeringMode: 'buttons' | 'wheel';
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number; // 0 to 1
  selectedCity: CityId;
  timeOfDay: 'sunny' | 'sunset' | 'night';
  selectedVehicleId: string;
  selectedColorIndex: number;
  windowTintLevel: number; // 0 to 1
}

export interface PlayerProfile {
  coins: number;
  xp: number;
  level: number;
  unlockedVehicles: string[];
  completedMissions: Record<string, number>; // missionId -> stars (1-3)
  totalDistanceKm: number;
  topSpeedReached: number;
  totalDriftPoints: number;
}

const DEFAULT_SETTINGS: GameSettings = {
  graphicsQuality: 'high',
  steeringMode: 'buttons',
  soundEnabled: true,
  musicEnabled: true,
  soundVolume: 0.8,
  selectedCity: 'hargeisa',
  timeOfDay: 'sunny',
  selectedVehicleId: 'suv_flagship',
  selectedColorIndex: 0,
  windowTintLevel: 0.85,
};

const DEFAULT_PROFILE: PlayerProfile = {
  coins: 1250,
  xp: 450,
  level: 2,
  unlockedVehicles: ['suv_flagship', 'minibus_caasi'],
  completedMissions: {},
  totalDistanceKm: 18.2,
  topSpeedReached: 184,
  totalDriftPoints: 3200,
};

const SETTINGS_KEY = 'somaliland_driving_settings_v2';
const PROFILE_KEY = 'somaliland_driving_profile_v2';

export class GameStorage {
  static getSettings(): GameSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (data) return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  }

  static saveSettings(partial: Partial<GameSettings>): GameSettings {
    const current = this.getSettings();
    const updated = { ...current, ...partial };
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return updated;
  }

  static getProfile(): PlayerProfile {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      if (data) return { ...DEFAULT_PROFILE, ...JSON.parse(data) };
    } catch {
      // fallback
    }
    return DEFAULT_PROFILE;
  }

  static saveProfile(partial: Partial<PlayerProfile>): PlayerProfile {
    const current = this.getProfile();
    const updated = { ...current, ...partial };
    // Recalculate level (every 500 XP = 1 level)
    updated.level = Math.max(1, Math.floor(updated.xp / 500) + 1);
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return updated;
  }

  static unlockVehicle(vehicleId: string, cost: number): boolean {
    const profile = this.getProfile();
    if (profile.unlockedVehicles.includes(vehicleId)) return true;
    if (profile.coins >= cost) {
      profile.coins -= cost;
      profile.unlockedVehicles.push(vehicleId);
      this.saveProfile(profile);
      return true;
    }
    return false;
  }

  static completeMission(missionId: string, coins: number, xp: number, stars: number) {
    const profile = this.getProfile();
    profile.coins += coins;
    profile.xp += xp;
    const currentStars = profile.completedMissions[missionId] || 0;
    if (stars > currentStars) {
      profile.completedMissions[missionId] = stars;
    }
    this.saveProfile(profile);
  }

  static addTelemetry(distanceKm: number, speedKmH: number, driftPts: number = 0) {
    const profile = this.getProfile();
    profile.totalDistanceKm += distanceKm;
    if (speedKmH > profile.topSpeedReached) {
      profile.topSpeedReached = Math.round(speedKmH);
    }
    profile.totalDriftPoints += driftPts;
    this.saveProfile(profile);
  }
}
