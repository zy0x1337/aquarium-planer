import { AquariumDimensions } from '../types/aquarium';

interface FishSelection {
  id: string;
  quantity: number;
}

interface PlantSelection {
  id: string;
  quantity: number;
}

export interface AquariumProject {
  id: string;
  name: string;
  dimensions: AquariumDimensions;
  selectedFish: FishSelection[];
  selectedPlants: PlantSelection[];
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  images?: string[];
}

class StorageService {
  private static instance: StorageService;
  private dbName = 'AquariumPlanerDB';
  private dbVersion = 2; // Version erhöht für Schema-Update
  private db: IDBDatabase | null = null;

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        reject(new Error('IndexedDB konnte nicht geöffnet werden'));
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Projects Store
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
          projectStore.createIndex('name', 'name', { unique: false });
          projectStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
        
        // Settings Store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
        
        // User Data Store
        if (!db.objectStoreNames.contains('userData')) {
          db.createObjectStore('userData', { keyPath: 'type' });
        }
      };
    });
  }

  async saveProject(project: AquariumProject): Promise<void> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['projects'], 'readwrite');
      const store = transaction.objectStore('projects');
      
      project.updatedAt = new Date();
      const request = store.put(project);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Projekt konnte nicht gespeichert werden'));
    });
  }

  async loadProject(id: string): Promise<AquariumProject | null> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['projects'], 'readonly');
      const store = transaction.objectStore('projects');
      const request = store.get(id);
      
      request.onsuccess = () => {
        const project = request.result;
        if (project) {
          // Migration für alte Projekte ohne Mengenangaben
          if (Array.isArray(project.selectedFish) && project.selectedFish.length > 0 && typeof project.selectedFish[0] === 'string') {
            project.selectedFish = project.selectedFish.map((id: string) => ({ id, quantity: 1 }));
          }
          if (Array.isArray(project.selectedPlants) && project.selectedPlants.length > 0 && typeof project.selectedPlants[0] === 'string') {
            project.selectedPlants = project.selectedPlants.map((id: string) => ({ id, quantity: 1 }));
          }
        }
        resolve(project || null);
      };
      request.onerror = () => reject(new Error('Projekt konnte nicht geladen werden'));
    });
  }

  async getAllProjects(): Promise<AquariumProject[]> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['projects'], 'readonly');
      const store = transaction.objectStore('projects');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const projects = request.result.map((project: AquariumProject) => {
          // Migration für alte Projekte
          if (Array.isArray(project.selectedFish) && project.selectedFish.length > 0 && typeof project.selectedFish[0] === 'string') {
            project.selectedFish = (project.selectedFish as any).map((id: string) => ({ id, quantity: 1 }));
          }
          if (Array.isArray(project.selectedPlants) && project.selectedPlants.length > 0 && typeof project.selectedPlants[0] === 'string') {
            project.selectedPlants = (project.selectedPlants as any).map((id: string) => ({ id, quantity: 1 }));
          }
          return project;
        }).sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        resolve(projects);
      };
      request.onerror = () => reject(new Error('Projekte konnten nicht geladen werden'));
    });
  }

  async deleteProject(id: string): Promise<void> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['projects'], 'readwrite');
      const store = transaction.objectStore('projects');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Projekt konnte nicht gelöscht werden'));
    });
  }

  async exportProject(id: string): Promise<string> {
    const project = await this.loadProject(id);
    if (!project) throw new Error('Projekt nicht gefunden');
    return JSON.stringify(project, null, 2);
  }

  async importProject(jsonData: string): Promise<AquariumProject> {
    try {
      const project: AquariumProject = JSON.parse(jsonData);
      
      // Neue ID generieren für Import
      project.id = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      project.name = `${project.name} (Importiert)`;
      project.createdAt = new Date();
      project.updatedAt = new Date();
      
      // Migration falls nötig
      if (Array.isArray(project.selectedFish) && project.selectedFish.length > 0 && typeof project.selectedFish[0] === 'string') {
        project.selectedFish = (project.selectedFish as any).map((id: string) => ({ id, quantity: 1 }));
      }
      if (Array.isArray(project.selectedPlants) && project.selectedPlants.length > 0 && typeof project.selectedPlants[0] === 'string') {
        project.selectedPlants = (project.selectedPlants as any).map((id: string) => ({ id, quantity: 1 }));
      }
      
      await this.saveProject(project);
      return project;
    } catch (error) {
      throw new Error('Ungültiges Projekt-Format');
    }
  }

  async saveSetting(key: string, value: any): Promise<void> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.put({ key, value });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Einstellung konnte nicht gespeichert werden'));
    });
  }

  async loadSetting(key: string): Promise<any> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get(key);
      
      request.onsuccess = () => {
        resolve(request.result?.value || null);
      };
      request.onerror = () => reject(new Error('Einstellung konnte nicht geladen werden'));
    });
  }

  generateProjectId(): string {
    return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default StorageService;
