import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  LinearProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Pets as FishIcon,           // Pets Icon als Alternative zu Fish
  LocalFlorist as PlantIcon,
  Science as ChemistryIcon,
  TrendingUp as TrendIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useAppSelector } from '../hooks/redux';
import { useNavigate } from 'react-router-dom';
import DatabaseService from '../services/DatabaseService';
import { Fish, Plant } from '../types/aquarium';

const Dashboard: React.FC = () => {
  const aquarium = useAppSelector(state => state.aquarium);
  const navigate = useNavigate();
  const [fishData, setFishData] = useState<Fish[]>([]);
  const [plantData, setPlantData] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);

  const db = DatabaseService.getInstance();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [fish, plants] = await Promise.all([
          db.getFish(),
          db.getPlants()
        ]);
        setFishData(fish);
        setPlantData(plants);
      } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [db]);

  const getFishName = (fishId: string): string => {
    const fish = fishData.find(f => f.id === fishId);
    return fish ? fish.name : fishId;
  };

  const getPlantName = (plantId: string): string => {
    const plant = plantData.find(p => p.id === plantId);
    return plant ? plant.name : plantId;
  };

  const getTotalFishCount = () => {
    return aquarium.selectedFish.reduce((total, fish) => total + fish.quantity, 0);
  };

  const getTotalPlantCount = () => {
    return aquarium.selectedPlants.reduce((total, plant) => total + plant.quantity, 0);
  };

  const getStockingLevel = () => {
    const totalFish = getTotalFishCount();
    const volume = aquarium.dimensions.volume || 0;
    
    if (volume === 0) return 0;
    
    // Grobe Regel: 1cm Fisch pro Liter (vereinfacht)
    const averageFishSize = 5; // Annahme: 5cm pro Fisch
    const estimatedBioload = totalFish * averageFishSize;
    
    return Math.min((estimatedBioload / volume) * 100, 100);
  };

  const stockingLevel = getStockingLevel();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Aquarium Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Aquarium Übersicht */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {aquarium.projectName}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Abmessungen: {aquarium.dimensions.length} × {aquarium.dimensions.width} × {aquarium.dimensions.height} cm
              </Typography>
              
              <Typography variant="h4" color="primary" gutterBottom>
                {aquarium.dimensions.volume} Liter
              </Typography>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Besatz: {stockingLevel.toFixed(1)}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={stockingLevel}
                  color={stockingLevel > 80 ? 'error' : stockingLevel > 60 ? 'warning' : 'success'}
                />
              </Box>

              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => navigate('/designer')}
                sx={{ mt: 2 }}
                fullWidth
              >
                Aquarium bearbeiten
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Ausgewählte Fische */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FishIcon sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Fische ({aquarium.selectedFish.length} Arten, {getTotalFishCount()} insgesamt)
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {aquarium.selectedFish.length > 0 ? (
                  aquarium.selectedFish.map(fishSelection => (
                    <Chip 
                      key={fishSelection.id} 
                      label={`${getFishName(fishSelection.id)} (${fishSelection.quantity}x)`}
                      size="small" 
                      sx={{ mr: 0.5, mb: 0.5 }} 
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Keine Fische ausgewählt
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Ausgewählte Pflanzen */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PlantIcon sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Pflanzen ({aquarium.selectedPlants.length} Arten, {getTotalPlantCount()} insgesamt)
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {aquarium.selectedPlants.length > 0 ? (
                  aquarium.selectedPlants.map(plantSelection => (
                    <Chip 
                      key={plantSelection.id} 
                      label={`${getPlantName(plantSelection.id)} (${plantSelection.quantity}x)`}
                      size="small" 
                      sx={{ mr: 0.5, mb: 0.5 }} 
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Keine Pflanzen ausgewählt
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Warnungen und Empfehlungen */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Empfehlungen
              </Typography>
              
              <List dense>
                {stockingLevel > 80 && (
                  <ListItem>
                    <ListItemIcon>
                      <TrendIcon color="error" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Hoher Besatz"
                      secondary="Das Aquarium könnte überbesetzt sein. Erwägen Sie weniger Fische oder ein größeres Becken."
                    />
                  </ListItem>
                )}
                
                {aquarium.selectedFish.length === 0 && (
                  <ListItem>
                    <ListItemIcon>
                      <FishIcon color="info" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Keine Fische ausgewählt"
                      secondary="Beginnen Sie mit der Auswahl kompatibler Fischarten für Ihr Aquarium."
                    />
                  </ListItem>
                )}
                
                {aquarium.selectedPlants.length === 0 && (
                  <ListItem>
                    <ListItemIcon>
                      <PlantIcon color="info" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Keine Pflanzen ausgewählt"
                      secondary="Pflanzen verbessern die Wasserqualität und bieten Versteckmöglichkeiten."
                    />
                  </ListItem>
                )}
                
                {stockingLevel < 30 && aquarium.selectedFish.length > 0 && (
                  <ListItem>
                    <ListItemIcon>
                      <TrendIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Niedriger Besatz"
                      secondary="Ihr Aquarium hat noch Kapazität für weitere Fische."
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {loading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Lade Aquarium-Daten...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;
