export interface AquariumDimensions {
  length: number;
  width: number;
  height: number;
  volume?: number;
}

export interface WaterParameters {
  temperature: { min: number; max: number; unit: string };
  ph: { min: number; max: number };
  hardness: { min: number; max: number; unit: string };
}

export interface TankRequirements {
  min_volume: number;
  min_length: number;
  swimming_zone: 'top' | 'middle' | 'bottom';
  school_size: { min: number; max: number };
}

export interface Compatibility {
  peaceful: boolean;
  aggressive: boolean;
  compatible_species: string[];
  incompatible_species: string[];
}

export interface Fish {
  id: string;
  name: string;
  scientific_name: string;
  family: string;
  size: { min: number; max: number; unit: string };
  water_parameters: WaterParameters;
  tank_requirements: TankRequirements;
  compatibility: Compatibility;
  care_level: 'beginner' | 'intermediate' | 'advanced';
  feeding: string[];
  behavior: string;
  image_url: string;
  // Neue Properties für Enhanced 3D Viewer
  schooling?: boolean;
  temperament?: 'peaceful' | 'semi-aggressive' | 'aggressive';
  preferredTemperature?: { min: number; max: number };
  preferredPh?: { min: number; max: number };
  oxygenRequirement?: number;
}

export interface Plant {
  id: string;
  name: string;
  scientific_name: string;
  family: string;
  size: {
    height: { min: number; max: number; unit: string };
    width: { min: number; max: number; unit: string };
  };
  placement: string[];
  lighting: {
    requirement: 'low' | 'medium' | 'high';
    min_lumens: number;
    max_lumens: number;
    unit: string;
  };
  co2: {
    required: boolean;
    beneficial: boolean;
  };
  growth_rate: 'slow' | 'medium' | 'fast';
  difficulty: 'easy' | 'medium' | 'hard';
  propagation: string;
  substrate: string;
  fertilization: string;
  image_url: string;
}

export interface Equipment {
  id: string;
  category: string;
  name: string;
  specifications: Record<string, any>;
  suitable_tank_sizes: number[];
  price_range: { min: number; max: number; currency: string };
}
