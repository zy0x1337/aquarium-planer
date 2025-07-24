import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AquariumDimensions } from '../../types/aquarium';

interface FishSelection {
  id: string;
  quantity: number;
}

interface PlantSelection {
  id: string;
  quantity: number;
}

interface AquariumState {
  dimensions: AquariumDimensions;
  selectedFish: FishSelection[];
  selectedPlants: PlantSelection[];
  projectName: string;
}

const initialState: AquariumState = {
  dimensions: {
    length: 60,
    width: 30,
    height: 30,
    volume: 54,
  },
  selectedFish: [],
  selectedPlants: [],
  projectName: 'Mein Aquarium',
};

const aquariumSlice = createSlice({
  name: 'aquarium',
  initialState,
  reducers: {
    setDimensions: (state, action: PayloadAction<AquariumDimensions>) => {
      state.dimensions = action.payload;
      state.dimensions.volume =
        (action.payload.length * action.payload.width * action.payload.height) / 1000;
    },
    addFish: (state, action: PayloadAction<string>) => {
      const existingFish = state.selectedFish.find(f => f.id === action.payload);
      if (!existingFish) {
        state.selectedFish.push({ id: action.payload, quantity: 1 });
      }
    },
    removeFish: (state, action: PayloadAction<string>) => {
      state.selectedFish = state.selectedFish.filter(f => f.id !== action.payload);
    },
    updateFishQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const fish = state.selectedFish.find(f => f.id === action.payload.id);
      if (fish) {
        fish.quantity = Math.max(1, action.payload.quantity);
      }
    },
    addPlant: (state, action: PayloadAction<string>) => {
      const existingPlant = state.selectedPlants.find(p => p.id === action.payload);
      if (!existingPlant) {
        state.selectedPlants.push({ id: action.payload, quantity: 1 });
      }
    },
    removePlant: (state, action: PayloadAction<string>) => {
      state.selectedPlants = state.selectedPlants.filter(p => p.id !== action.payload);
    },
    updatePlantQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const plant = state.selectedPlants.find(p => p.id === action.payload.id);
      if (plant) {
        plant.quantity = Math.max(1, action.payload.quantity);
      }
    },
    setProjectName: (state, action: PayloadAction<string>) => {
      state.projectName = action.payload;
    },
    resetProject: (state) => {
      return initialState;
    },
  },
});

export const {
  setDimensions,
  addFish,
  removeFish,
  updateFishQuantity,
  addPlant,
  removePlant,
  updatePlantQuantity,
  setProjectName,
  resetProject
} = aquariumSlice.actions;

export default aquariumSlice.reducer;
