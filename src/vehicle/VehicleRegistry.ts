/**
 * Vehicle definitions, specs, and physics parameters
 */

export interface VehicleDefinition {
  id: string;
  name: string;
  category: 'suv' | 'minibus' | 'pickup' | 'sports' | 'sedan';
  description: string;
  price: number;
  unlockedByDefault: boolean;
  topSpeedKmH: number;
  acceleration0to100: number; // in seconds
  handlingRating: number; // 0 to 100
  brakingRating: number; // 0 to 100
  massKg: number;
  engineSoundType: 'v8' | 'inline4' | 'diesel' | 'v10';
  dimensions: {
    width: number;
    height: number;
    length: number;
    wheelbase: number;
    wheelRadius: number;
  };
}

export const VEHICLE_CATALOG: VehicleDefinition[] = [
  {
    id: 'suv_flagship',
    name: 'Golis Luxury V8 SUV',
    category: 'suv',
    description: 'High performance twin-turbo luxury SUV engineered for Somaliland city boulevards and desert terrain.',
    price: 0, // Starter vehicle
    unlockedByDefault: true,
    topSpeedKmH: 205,
    acceleration0to100: 3.8,
    handlingRating: 92,
    brakingRating: 94,
    massKg: 2180,
    engineSoundType: 'v8',
    dimensions: {
      width: 2.1,
      height: 1.65,
      length: 4.8,
      wheelbase: 2.85,
      wheelRadius: 0.42,
    },
  },
  {
    id: 'minibus_caasi',
    name: 'Hargeisa City Caasi Minibus',
    category: 'minibus',
    description: 'The iconic Somaliland public commuter bus. Rugged, high passenger capacity, and unmatched street presence.',
    price: 800,
    unlockedByDefault: true,
    topSpeedKmH: 145,
    acceleration0to100: 8.2,
    handlingRating: 78,
    brakingRating: 82,
    massKg: 2450,
    engineSoundType: 'diesel',
    dimensions: {
      width: 1.95,
      height: 2.1,
      length: 5.1,
      wheelbase: 2.95,
      wheelRadius: 0.4,
    },
  },
  {
    id: 'pickup_safari',
    name: 'Sahil Heavy Pickup 4x4',
    category: 'pickup',
    description: 'Heavy-duty off-road utility truck equipped with high ground clearance, cargo bed, and snorkel exhaust.',
    price: 1500,
    unlockedByDefault: false,
    topSpeedKmH: 165,
    acceleration0to100: 6.5,
    handlingRating: 84,
    brakingRating: 86,
    massKg: 2300,
    engineSoundType: 'diesel',
    dimensions: {
      width: 2.0,
      height: 1.85,
      length: 5.2,
      wheelbase: 3.1,
      wheelRadius: 0.46,
    },
  },
  {
    id: 'sports_redsea',
    name: 'Red Sea GT Coupe',
    category: 'sports',
    description: 'Ultra-aerodynamic grand tourer with ferocious acceleration and track-tuned suspension for high speed sprints.',
    price: 3200,
    unlockedByDefault: false,
    topSpeedKmH: 260,
    acceleration0to100: 3.1,
    handlingRating: 98,
    brakingRating: 97,
    massKg: 1560,
    engineSoundType: 'v10',
    dimensions: {
      width: 1.98,
      height: 1.28,
      length: 4.6,
      wheelbase: 2.68,
      wheelRadius: 0.38,
    },
  },
  {
    id: 'sedan_presidential',
    name: 'Xorriya Executive Sedan',
    category: 'sedan',
    description: 'Diplomatic luxury executive saloon delivering cloud-like ride comfort, smooth shifting, and prestige.',
    price: 2400,
    unlockedByDefault: false,
    topSpeedKmH: 215,
    acceleration0to100: 4.9,
    handlingRating: 89,
    brakingRating: 91,
    massKg: 1980,
    engineSoundType: 'v8',
    dimensions: {
      width: 1.92,
      height: 1.45,
      length: 5.0,
      wheelbase: 3.0,
      wheelRadius: 0.39,
    },
  },
];
