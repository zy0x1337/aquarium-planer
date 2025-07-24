import { AquariumDimensions } from './aquarium';

export interface FishSelection {
  id: string;
  quantity: number;
}

export interface PlantSelection {
  id: string;
  quantity: number;
}

export interface AquariumProject {
  id: string;
  name: string;
  dimensions: AquariumDimensions;
  selectedFish: FishSelection[];
  selectedPlants: PlantSelection[];
  createdAt: Date;          // Geändert von string zu Date
  updatedAt: Date;          // Hinzugefügt (erforderlich)
  lastModified?: Date;      // Geändert von string zu Date (optional)
  version?: number;
}

export interface StorageData {
  projects: AquariumProject[];
  currentProject?: AquariumProject;
  version: number;
}

export interface ProjectSummary {
  id: string;
  name: string;
  createdAt: Date;          // Geändert von string zu Date
  lastModified?: Date;      // Geändert von string zu Date
  fishCount: number;
  plantCount: number;
  volume: number;
}

// Migration helper types
export interface LegacyAquariumProject {
  id: string;
  name: string;
  dimensions: AquariumDimensions;
  selectedFish: string[];  // Legacy format
  selectedPlants: string[]; // Legacy format
  createdAt: string | Date; // Kann beides sein für Migration
  lastModified?: string | Date;
  updatedAt?: string | Date;
}

// Storage configuration
export interface StorageConfig {
  maxProjects: number;
  autoSave: boolean;
  backupEnabled: boolean;
}

export const DEFAULT_STORAGE_CONFIG: StorageConfig = {
  maxProjects: 50,
  autoSave: true,
  backupEnabled: true
};

// Storage error types
export class StorageError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'StorageError';
  }
}

export class ProjectNotFoundError extends StorageError {
  constructor(projectId: string) {
    super(`Project with ID "${projectId}" not found`, 'PROJECT_NOT_FOUND');
  }
}

export class StorageQuotaExceededError extends StorageError {
  constructor() {
    super('Storage quota exceeded', 'QUOTA_EXCEEDED');
  }
}

// Utility functions for type checking
export const isLegacyProject = (project: any): project is LegacyAquariumProject => {
  return project && 
         Array.isArray(project.selectedFish) && 
         project.selectedFish.length > 0 &&
         typeof project.selectedFish[0] === 'string';
};

export const isModernProject = (project: any): project is AquariumProject => {
  return project && 
         Array.isArray(project.selectedFish) && 
         (project.selectedFish.length === 0 || 
          (typeof project.selectedFish[0] === 'object' && 'quantity' in project.selectedFish[0]));
};

// Migration helper - konvertiert Datum-Strings zu Date-Objekten
export const migrateProject = (legacyProject: LegacyAquariumProject): AquariumProject => {
  const now = new Date();
  
  return {
    ...legacyProject,
    selectedFish: legacyProject.selectedFish.map(fishId => ({
      id: fishId,
      quantity: 1
    })),
    selectedPlants: legacyProject.selectedPlants.map(plantId => ({
      id: plantId,
      quantity: 1
    })),
    createdAt: typeof legacyProject.createdAt === 'string' 
      ? new Date(legacyProject.createdAt) 
      : legacyProject.createdAt || now,
    updatedAt: typeof legacyProject.updatedAt === 'string'
      ? new Date(legacyProject.updatedAt)
      : legacyProject.updatedAt || now,
    lastModified: legacyProject.lastModified 
      ? (typeof legacyProject.lastModified === 'string' 
         ? new Date(legacyProject.lastModified) 
         : legacyProject.lastModified)
      : undefined,
    version: 1
  };
};

// Helper-Funktionen für Datum-Formatierung
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export const formatDateTime = (date: Date): string => {
  return date.toLocaleString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};
