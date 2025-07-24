import { useEffect, useRef } from 'react';
import { useAppSelector } from './redux';
import StorageService from '../services/StorageService';

export const useAutoSave = () => {
  const aquariumState = useAppSelector(state => state.aquarium);
  const storage = StorageService.getInstance();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>('');

  useEffect(() => {
    const currentState = JSON.stringify(aquariumState);
    
    // Nur speichern wenn sich etwas geändert hat
    if (currentState !== lastSavedRef.current) {
      // Debounce: Warte 2 Sekunden nach der letzten Änderung
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(async () => {
        try {
          const autoSaveProject = {
            id: 'autosave',
            name: 'Automatische Speicherung',
            dimensions: aquariumState.dimensions,
            selectedFish: aquariumState.selectedFish,
            selectedPlants: aquariumState.selectedPlants,
            createdAt: new Date(),
            updatedAt: new Date(),
            notes: 'Automatisch gespeichert'
          };
          
          await storage.saveProject(autoSaveProject);
          lastSavedRef.current = currentState;
          console.log('Auto-Save durchgeführt');
        } catch (error) {
          console.error('Auto-Save fehlgeschlagen:', error);
        }
      }, 2000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [aquariumState, storage]);
};
