import { Fish, Plant, Equipment } from '../types/aquarium';

// Type-sichere JSON-Imports mit Assertions
const fishData = require('../data/fish.json') as { species: Fish[] };
const plantsData = require('../data/plants.json') as { plants: Plant[] };
const equipmentData = require('../data/equipment.json') as { equipment: Equipment[] };

class DatabaseService {
  private static instance: DatabaseService;
  
  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Fish methods
  async getFish(): Promise<Fish[]> {
    return fishData.species;
  }

  async getFishById(id: string): Promise<Fish | undefined> {
    const fish = await this.getFish();
    return fish.find(f => f.id === id);
  }

  async searchFish(query: string): Promise<Fish[]> {
    const fish = await this.getFish();
    const searchTerm = query.toLowerCase();
    return fish.filter(f => 
      f.name.toLowerCase().includes(searchTerm) ||
      f.scientific_name.toLowerCase().includes(searchTerm) ||
      f.family.toLowerCase().includes(searchTerm)
    );
  }

  async getCompatibleFish(fishId: string): Promise<Fish[]> {
    const targetFish = await this.getFishById(fishId);
    if (!targetFish) return [];
    
    const allFish = await this.getFish();
    return allFish.filter(f => 
      targetFish.compatibility.compatible_species.includes(f.id) ||
      (f.compatibility.compatible_species.includes(targetFish.id) && 
       !targetFish.compatibility.incompatible_species.includes(f.id))
    );
  }

  async getFishByCareLevel(level: string): Promise<Fish[]> {
    const fish = await this.getFish();
    return fish.filter(f => f.care_level === level);
  }

  // Plant methods
  async getPlants(): Promise<Plant[]> {
    return plantsData.plants;
  }

  async getPlantById(id: string): Promise<Plant | undefined> {
    const plants = await this.getPlants();
    return plants.find(p => p.id === id);
  }

  async searchPlants(query: string): Promise<Plant[]> {
    const plants = await this.getPlants();
    const searchTerm = query.toLowerCase();
    return plants.filter(p => 
      p.name.toLowerCase().includes(searchTerm) ||
      p.scientific_name.toLowerCase().includes(searchTerm) ||
      p.family.toLowerCase().includes(searchTerm)
    );
  }

  async getPlantsByDifficulty(difficulty: string): Promise<Plant[]> {
    const plants = await this.getPlants();
    return plants.filter(p => p.difficulty === difficulty);
  }

  // Equipment methods
  async getEquipment(): Promise<Equipment[]> {
    return equipmentData.equipment;
  }

  async getEquipmentById(id: string): Promise<Equipment | undefined> {
    const equipment = await this.getEquipment();
    return equipment.find(e => e.id === id);
  }

  async getEquipmentByCategory(category: string): Promise<Equipment[]> {
    const equipment = await this.getEquipment();
    return equipment.filter(e => e.category === category);
  }

  async getEquipmentForTankSize(volume: number): Promise<Equipment[]> {
    const equipment = await this.getEquipment();
    return equipment.filter(e => 
      e.suitable_tank_sizes.some(size => Math.abs(size - volume) <= 20)
    );
  }

  // Utility methods
  async checkFishCompatibility(fishIds: string[]): Promise<{
    compatible: boolean;
    conflicts: string[];
    suggestions: Fish[];
  }> {
    const conflicts: string[] = [];
    const allFish = await this.getFish();
    const selectedFish = fishIds.map(id => allFish.find(f => f.id === id)).filter(Boolean) as Fish[];
    
    // Check compatibility between all selected fish
    for (let i = 0; i < selectedFish.length; i++) {
      for (let j = i + 1; j < selectedFish.length; j++) {
        const fish1 = selectedFish[i];
        const fish2 = selectedFish[j];
        
        if (fish1.compatibility.incompatible_species.includes(fish2.id) ||
            fish2.compatibility.incompatible_species.includes(fish1.id)) {
          conflicts.push(`${fish1.name} und ${fish2.name} sind nicht kompatibel`);
        }
      }
    }

    // Get suggestions for compatible fish
    const suggestions: Fish[] = [];
    if (selectedFish.length > 0) {
      const compatibleFish = await this.getCompatibleFish(selectedFish[0].id);
      suggestions.push(...compatibleFish.slice(0, 3));
    }

    return {
      compatible: conflicts.length === 0,
      conflicts,
      suggestions
    };
  }
}

export default DatabaseService;
