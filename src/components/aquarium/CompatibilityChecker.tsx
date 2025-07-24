import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  Pets as FishIcon,
  LocalFlorist as PlantIcon
} from '@mui/icons-material';
import { useAppSelector } from '../../hooks/redux';
import DatabaseService from '../../services/DatabaseService';
import { Fish, Plant } from '../../types/aquarium';

interface CompatibilityIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  species?: string[];
}

const CompatibilityChecker: React.FC = () => {
  const [fishData, setFishData] = useState<Fish[]>([]);
  const [plantData, setPlantData] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<CompatibilityIssue[]>([]);
  
  // Redux State
  const selectedFishData = useAppSelector(state => state.aquarium.selectedFish);
  const selectedPlantData = useAppSelector(state => state.aquarium.selectedPlants);
  const dimensions = useAppSelector(state => state.aquarium.dimensions);

  // Memoized selectors für stabile References
  const selectedFishIds = useMemo(() => 
    selectedFishData.map(f => f.id), 
    [selectedFishData]
  );
  
  const fishQuantityMap = useMemo(() => 
    new Map(selectedFishData.map(f => [f.id, f.quantity])), 
    [selectedFishData]
  );

  const db = DatabaseService.getInstance();

  // KRITISCH: Einmalig Daten laden, KEINE Dependencies die sich ändern
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        console.log('Loading fish and plant data...'); // Debug
        const [fish, plants] = await Promise.all([
          db.getFish(),
          db.getPlants()
        ]);
        
        if (mounted) {
          console.log(`Loaded ${fish.length} fish and ${plants.length} plants`); // Debug
          setFishData(fish);
          setPlantData(plants);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []); // LEER! Keine dependencies

  // Separate useEffect für Kompatibilitätsprüfung
  // KRITISCH: Stabile dependencies verwenden
  const checkCompatibility = useCallback(() => {
    if (fishData.length === 0) return; // Warten bis Daten geladen

    console.log('Checking compatibility...'); // Debug
    const newIssues: CompatibilityIssue[] = [];

    // 1. Volumen-Check
    if (dimensions.volume && dimensions.volume > 0) {
      const totalFish = selectedFishData.reduce((sum, f) => sum + f.quantity, 0);
      const estimatedBioload = totalFish * 5; // 5cm pro Fisch vereinfacht
      const stockingLevel = (estimatedBioload / dimensions.volume) * 100;

      if (stockingLevel > 100) {
        newIssues.push({
          type: 'error',
          message: `Überbesatz: ${stockingLevel.toFixed(1)}% (empfohlen: max 80%)`
        });
      } else if (stockingLevel > 80) {
        newIssues.push({
          type: 'warning',
          message: `Hoher Besatz: ${stockingLevel.toFixed(1)}% (empfohlen: max 80%)`
        });
      }
    }

    // 2. Kompatibilitäts-Check zwischen Fischen
    for (let i = 0; i < selectedFishIds.length; i++) {
      for (let j = i + 1; j < selectedFishIds.length; j++) {
        const fish1 = fishData.find(f => f.id === selectedFishIds[i]);
        const fish2 = fishData.find(f => f.id === selectedFishIds[j]);
        
        if (fish1 && fish2) {
          // Prüfe Inkompatibilitäten
          if (fish1.compatibility.incompatible_species.includes(fish2.id)) {
            newIssues.push({
              type: 'error',
              message: `${fish1.name} und ${fish2.name} sind nicht kompatibel`,
              species: [fish1.id, fish2.id]
            });
          }
          
          // Prüfe Temperatur-Kompatibilität
          const temp1 = fish1.water_parameters.temperature;
          const temp2 = fish2.water_parameters.temperature;
          
          if (temp1.max < temp2.min || temp2.max < temp1.min) {
            newIssues.push({
              type: 'warning',
              message: `Temperaturkonflikt: ${fish1.name} (${temp1.min}-${temp1.max}°C) und ${fish2.name} (${temp2.min}-${temp2.max}°C)`,
              species: [fish1.id, fish2.id]
            });
          }
        }
      }
    }

    // 3. Mindestvolumen-Check
    selectedFishIds.forEach(fishId => {
      const fish = fishData.find(f => f.id === fishId);
      if (fish && dimensions.volume && fish.tank_requirements.min_volume > dimensions.volume) {
        newIssues.push({
          type: 'error',
          message: `${fish.name} benötigt mindestens ${fish.tank_requirements.min_volume}L (aktuell: ${dimensions.volume}L)`,
          species: [fishId]
        });
      }
    });

    // 4. Schwarmgröße-Check
    selectedFishIds.forEach(fishId => {
      const fish = fishData.find(f => f.id === fishId);
      const quantity = fishQuantityMap.get(fishId) || 0;
      
      if (fish && fish.tank_requirements.school_size.min > 1) {
        if (quantity < fish.tank_requirements.school_size.min) {
          newIssues.push({
            type: 'warning',
            message: `${fish.name}: Mindestens ${fish.tank_requirements.school_size.min} Tiere empfohlen (aktuell: ${quantity})`,
            species: [fishId]
          });
        }
      }
    });

    console.log(`Found ${newIssues.length} compatibility issues`); // Debug
    setIssues(newIssues);
  }, [fishData, selectedFishIds, selectedFishData, dimensions.volume, fishQuantityMap]);

  // KRITISCH: Separate useEffect für Compatibility Check
  useEffect(() => {
    if (!loading && fishData.length > 0) {
      console.log('Running compatibility check...'); // Debug
      checkCompatibility();
    }
  }, [loading, fishData.length, checkCompatibility]); // Stabile dependencies

  const getTotalFishCount = () => {
    return selectedFishData.reduce((total, fish) => total + fish.quantity, 0);
  };

  const getTotalPlantCount = () => {
    return selectedPlantData.reduce((total, plant) => total + plant.quantity, 0);
  };

  const getOverallStatus = (): 'good' | 'warning' | 'error' => {
    if (issues.some(issue => issue.type === 'error')) return 'error';
    if (issues.some(issue => issue.type === 'warning')) return 'warning';
    return 'good';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckIcon color="success" />;
      case 'warning': return <WarningIcon color="warning" />;
      case 'error': return <ErrorIcon color="error" />;
      default: return <CheckIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Kompatibilitätsprüfung
          </Typography>
          <LinearProgress />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Lade Daten für Kompatibilitätsprüfung...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const overallStatus = getOverallStatus();

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {getStatusIcon(overallStatus)}
          <Typography variant="h6" sx={{ ml: 1 }}>
            Kompatibilitätsprüfung
          </Typography>
        </Box>

        {/* Übersicht */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            <FishIcon sx={{ verticalAlign: 'middle', mr: 0.5 }} />
            {selectedFishData.length} Fischart(en) • {getTotalFishCount()} Fische insgesamt
          </Typography>
          <Typography variant="body2" gutterBottom>
            <PlantIcon sx={{ verticalAlign: 'middle', mr: 0.5 }} />
            {selectedPlantData.length} Pflanzenart(en) • {getTotalPlantCount()} Pflanzen insgesamt
          </Typography>
          <Typography variant="body2">
            Aquarium: {dimensions.length} × {dimensions.width} × {dimensions.height} cm ({dimensions.volume}L)
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Ergebnisse */}
        {issues.length === 0 ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2">
              ✅ Alle Kompatibilitätsprüfungen bestanden! Ihre Auswahl ist gut kompatibel.
            </Typography>
          </Alert>
        ) : (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Gefundene Probleme ({issues.length}):
            </Typography>
            
            {issues.map((issue, index) => (
              <Alert 
                key={index} 
                severity={issue.type === 'error' ? 'error' : issue.type === 'warning' ? 'warning' : 'info'}
                sx={{ mb: 1 }}
              >
                <Typography variant="body2">
                  {issue.message}
                </Typography>
              </Alert>
            ))}
          </Box>
        )}

        {/* Empfehlungen */}
        {selectedFishData.length === 0 && selectedPlantData.length === 0 && (
          <Alert severity="info">
            <Typography variant="body2">
              Wählen Sie Fische und Pflanzen aus, um eine Kompatibilitätsprüfung durchzuführen.
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default CompatibilityChecker;
