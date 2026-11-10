/**
 * Somaliland Driving Simulator - Master Asset Manifest
 * Stage 1 Asset Catalog mapping supplied assets to engine & UI roles.
 */

export interface AssetEntry {
  id: string;
  category: 'signs' | 'flags' | 'environment' | 'city_previews' | 'vehicles' | 'ui' | 'props';
  path: string;
  name: string;
  description: string;
  usage: '3d_billboard' | '3d_texture' | 'ui_element' | 'menu_reference';
}

export const ASSET_MANIFEST: AssetEntry[] = [
  // Signs
  {
    id: 'sign_hargeisa',
    category: 'signs',
    path: './game_assets/signs/sign_hargeisa.png',
    name: 'Hargeisa Direction Sign',
    description: 'Highway directional sign to Hargeisa city center',
    usage: '3d_billboard',
  },
  {
    id: 'sign_berbera',
    category: 'signs',
    path: './game_assets/signs/sign_berbera.png',
    name: 'Berbera Direction Sign',
    description: 'Highway directional sign to the Red Sea port city of Berbera',
    usage: '3d_billboard',
  },
  {
    id: 'sign_borama',
    category: 'signs',
    path: './game_assets/signs/sign_borama.png',
    name: 'Borama Direction Sign',
    description: 'Highway directional sign to Borama educational city',
    usage: '3d_billboard',
  },
  {
    id: 'sign_burco',
    category: 'signs',
    path: './game_assets/signs/sign_burco.png',
    name: 'Burco Direction Sign',
    description: 'Highway directional sign to Burco trade hub',
    usage: '3d_billboard',
  },
  {
    id: 'traffic_light',
    category: 'signs',
    path: './game_assets/signs/traffic_light.png',
    name: 'Traffic Light Post',
    description: 'Intersection traffic signal fixture',
    usage: '3d_billboard',
  },
  {
    id: 'speed_limit_60',
    category: 'signs',
    path: './game_assets/signs/speed_limit_60.png',
    name: 'Speed Limit 60 km/h',
    description: 'Urban road speed limit regulation sign',
    usage: '3d_billboard',
  },
  {
    id: 'speed_limit_80',
    category: 'signs',
    path: './game_assets/signs/speed_limit_80.png',
    name: 'Speed Limit 80 km/h',
    description: 'Highway speed limit regulation sign',
    usage: '3d_billboard',
  },
  {
    id: 'speed_bump',
    category: 'signs',
    path: './game_assets/signs/speed_bump.png',
    name: 'Speed Bump Warning',
    description: 'Road humps warning sign',
    usage: '3d_billboard',
  },
  {
    id: 'pedestrian_crossing',
    category: 'signs',
    path: './game_assets/signs/pedestrian_crossing.png',
    name: 'Pedestrian Crossing Sign',
    description: 'Zebra crossing ahead warning sign',
    usage: '3d_billboard',
  },
  {
    id: 'turn_warning',
    category: 'signs',
    path: './game_assets/signs/turn_warning.png',
    name: 'Sharp Turn Warning',
    description: 'Road curve warning sign',
    usage: '3d_billboard',
  },
  {
    id: 'no_overtaking',
    category: 'signs',
    path: './game_assets/signs/no_overtaking.png',
    name: 'No Overtaking Sign',
    description: 'Traffic regulation sign',
    usage: '3d_billboard',
  },
  {
    id: 'no_stopping',
    category: 'signs',
    path: './game_assets/signs/no_stopping.png',
    name: 'No Stopping Sign',
    description: 'Urban traffic restriction sign',
    usage: '3d_billboard',
  },

  // Flags
  {
    id: 'somaliland_flag_01',
    category: 'flags',
    path: './game_assets/flags/somaliland_flag_01.png',
    name: 'Somaliland National Flag (Pole 1)',
    description: 'Authentic green, white, red horizontal flag with black star and Shahada',
    usage: '3d_texture',
  },
  {
    id: 'somaliland_flag_02',
    category: 'flags',
    path: './game_assets/flags/somaliland_flag_02.png',
    name: 'Somaliland National Flag (Pole 2)',
    description: 'Waving Somaliland flag variation',
    usage: '3d_texture',
  },

  // Environment
  {
    id: 'hargeisa_landmark_buildings',
    category: 'environment',
    path: './game_assets/environment/hargeisa_landmark_buildings.png',
    name: 'Hargeisa City Skyline Buildings',
    description: 'Iconic commercial and government buildings of Hargeisa',
    usage: '3d_billboard',
  },
  {
    id: 'city_building_cluster',
    category: 'environment',
    path: './game_assets/environment/city_building_cluster.png',
    name: 'City Building Cluster',
    description: 'Urban architecture cluster of Hargeisa',
    usage: '3d_billboard',
  },
  {
    id: 'palm_tree_cluster',
    category: 'environment',
    path: './game_assets/environment/palm_tree_cluster.png',
    name: 'Palm Trees',
    description: 'Tropical and desert palms common in Somaliland urban avenues',
    usage: '3d_billboard',
  },
  {
    id: 'green_tree_cluster',
    category: 'environment',
    path: './game_assets/environment/green_tree_cluster.png',
    name: 'Acacia & Shade Trees',
    description: 'Shade trees commonly planted along streets in Hargeisa',
    usage: '3d_billboard',
  },
  {
    id: 'boulders',
    category: 'environment',
    path: './game_assets/environment/boulders.png',
    name: 'Desert Boulders',
    description: 'Granite and limestone boulders reminiscent of Naasa Hablood hills',
    usage: '3d_billboard',
  },
  {
    id: 'rocky_hills',
    category: 'environment',
    path: './game_assets/environment/rocky_hills.png',
    name: 'Rocky Hills Horizon',
    description: 'Distant hill ranges surrounding Hargeisa basin',
    usage: '3d_billboard',
  },

  // Props
  {
    id: 'road_barriers_and_cones',
    category: 'props',
    path: './game_assets/props/road_barriers_and_cones.png',
    name: 'Road Construction Barriers & Cones',
    description: 'Traffic barriers and safety cones',
    usage: '3d_billboard',
  },

  // City Previews
  {
    id: 'city_preview_hargeisa',
    category: 'city_previews',
    path: './game_assets/city_previews/hargeisa_menu_preview.png',
    name: 'Hargeisa Capital City',
    description: 'The vibrant capital and commercial heart of Somaliland',
    usage: 'ui_element',
  },
  {
    id: 'city_preview_berbera',
    category: 'city_previews',
    path: './game_assets/city_previews/berbera_city_preview.png',
    name: 'Berbera Port City',
    description: 'Historic Gulf of Aden maritime trade hub with coastal highways',
    usage: 'ui_element',
  },
  {
    id: 'city_preview_borama',
    category: 'city_previews',
    path: './game_assets/city_previews/borama_city_preview.png',
    name: 'Borama University City',
    description: 'Lush mountain town known for Amoud University',
    usage: 'ui_element',
  },
  {
    id: 'city_preview_burco',
    category: 'city_previews',
    path: './game_assets/city_previews/burco_city_preview.png',
    name: 'Burco Commercial City',
    description: 'Second largest city, bustling livestock trade and central crossroads',
    usage: 'ui_element',
  },

  // Vehicle References
  {
    id: 'vehicle_white_suv',
    category: 'vehicles',
    path: './game_assets/vehicles/white_suv.png',
    name: 'Luxury SUV Reference',
    description: 'High performance sports SUV',
    usage: 'ui_element',
  },
  {
    id: 'vehicle_somaliland_sedan',
    category: 'vehicles',
    path: './game_assets/vehicles/somaliland_sedan_green_white_red.png',
    name: 'Somaliland Livery Sedan',
    description: 'Patriotic colored vehicle reference',
    usage: 'ui_element',
  },

  // UI Icons
  {
    id: 'ui_speedometer',
    category: 'ui',
    path: './game_assets/ui/speedometer.png',
    name: 'Speedometer Housing',
    description: 'HUD Speed dial graphics',
    usage: 'ui_element',
  },
  {
    id: 'ui_fuel_gauge',
    category: 'ui',
    path: './game_assets/ui/fuel_gauge.png',
    name: 'Fuel Gauge',
    description: 'HUD Fuel indicator',
    usage: 'ui_element',
  },
  {
    id: 'ui_minimap',
    category: 'ui',
    path: './game_assets/ui/minimap.png',
    name: 'Minimap Frame',
    description: 'HUD Radar frame',
    usage: 'ui_element',
  },
  {
    id: 'ui_accelerator',
    category: 'ui',
    path: './game_assets/ui/accelerator_control.png',
    name: 'Gas Pedal',
    description: 'Touch throttle pedal',
    usage: 'ui_element',
  },
  {
    id: 'ui_brake',
    category: 'ui',
    path: './game_assets/ui/brake_control.png',
    name: 'Brake Pedal',
    description: 'Touch brake pedal',
    usage: 'ui_element',
  },
];
