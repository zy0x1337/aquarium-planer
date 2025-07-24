import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Checkbox,
  Typography,
  Chip,
  IconButton,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import { Fish, Plant } from '../../types/aquarium';
import DatabaseService from '../../services/DatabaseService';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { 
  addFish, 
  removeFish, 
  addPlant, 
  removePlant, 
  updateFishQuantity, 
  updatePlantQuantity 
} from '../../store/slices/aquariumSlice';

interface Props {
  type: 'fish' | 'plants';
}

const SpeciesSelector: React.FC<Props> = ({ type }) => {
  const [species, setSpecies] = useState<(Fish | Plant)[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
  const dispatch = useAppDispatch();
  const selectedFish = useAppSelector(state => state.aquarium.selectedFish);
  const selectedPlants = useAppSelector(state => state.aquarium.selectedPlants);
  const dimensions = useAppSelector(state => state.aquarium.dimensions);
  
  const db = DatabaseService.getInstance();

  // Memoized: Lade Daten nur einmal
  const loadSpecies = useCallback(async () => {
  if (loading) return;
  setLoading(true);
  try {
    if (type === 'fish') {
      const fishData = await db.getFish();
      setSpecies(fishData || []); // Fallback auf leeres Array
    } else {
      const plantsData = await db.getPlants();
      setSpecies(plantsData || []); // Fallback auf leeres Array
    }
  } catch (error) {
    console.error('Fehler beim Laden der Arten:', error);
    setSpecies([]); // Auch bei Fehlern leeres Array setzen
  } finally {
    setLoading(false);
  }
}, [type, db, loading]);

  // Memoized: Filtere Arten nur wenn sich relevante Daten ändern
  const filteredSpecies = useMemo(() => {
    let filtered = species;
    
    // Suchfilter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = species.filter(s =>
        s.name.toLowerCase().includes(searchLower) ||
        s.scientific_name.toLowerCase().includes(searchLower)
      );
    }

    // Volumenfilter für Fische
    if (type === 'fish' && dimensions.volume) {
      filtered = filtered.filter(s =>
        'tank_requirements' in s && s.tank_requirements.min_volume <= dimensions.volume!
      );
    }

    return filtered;
  }, [species, searchTerm, type, dimensions.volume]);

  // Memoized: Erstelle Set für schnelle Lookups
  const selectedFishIds = useMemo(() => 
    new Set(selectedFish.map(f => f.id)), 
    [selectedFish]
  );
  
  const selectedPlantIds = useMemo(() => 
    new Set(selectedPlants.map(p => p.id)), 
    [selectedPlants]
  );

  // Memoized: Erstelle Maps für schnelle Quantity-Lookups
  const fishQuantityMap = useMemo(() => 
    new Map(selectedFish.map(f => [f.id, f.quantity])), 
    [selectedFish]
  );
  
  const plantQuantityMap = useMemo(() => 
    new Map(selectedPlants.map(p => [p.id, p.quantity])), 
    [selectedPlants]
  );

  // Lade Daten beim ersten Render
  useEffect(() => {
    loadSpecies();
  }, [type]); // Nur type als Dependency

  // Optimierte Handler mit debouncing
  const handleSpeciesToggle = useCallback((speciesId: string) => {
    if (type === 'fish') {
      const isSelected = selectedFishIds.has(speciesId);
      if (isSelected) {
        dispatch(removeFish(speciesId));
      } else {
        dispatch(addFish(speciesId));
      }
    } else {
      const isSelected = selectedPlantIds.has(speciesId);
      if (isSelected) {
        dispatch(removePlant(speciesId));
      } else {
        dispatch(addPlant(speciesId));
      }
    }
  }, [type, selectedFishIds, selectedPlantIds, dispatch]);

  const handleQuantityChange = useCallback((speciesId: string, newQuantity: number) => {
    const quantity = Math.max(1, Math.min(50, newQuantity)); // Clamp zwischen 1 und 50
    
    if (type === 'fish') {
      dispatch(updateFishQuantity({ id: speciesId, quantity }));
    } else {
      dispatch(updatePlantQuantity({ id: speciesId, quantity }));
    }
  }, [type, dispatch]);

  // Memoized: Kompatibilitätsprüfung
  const getCompatibilityInfo = useMemo(() => {
    if (type !== 'fish') return () => true;
    
    return (fish: Fish): boolean => {
      if (selectedFishIds.size === 0) return true;
      return !fish.compatibility.incompatible_species.some(incompatible =>
        selectedFishIds.has(incompatible)
      );
    };
  }, [type, selectedFishIds]);

  const getRequirementStatus = useCallback((item: Fish | Plant): 'suitable' | 'warning' | 'unsuitable' => {
    if (!dimensions.volume) return 'suitable';
    
    if (type === 'fish' && 'tank_requirements' in item) {
      if (item.tank_requirements.min_volume > dimensions.volume) return 'unsuitable';
      if (item.tank_requirements.min_length > dimensions.length) return 'warning';
    }
    
    return 'suitable';
  }, [dimensions, type]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'suitable': return 'success';
      case 'warning': return 'warning';
      case 'unsuitable': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Lade Arten...</Typography>
      </Box>
    );
  }

  const selectedSpecies = type === 'fish' ? selectedFish : selectedPlants;
  const selectedIds = type === 'fish' ? selectedFishIds : selectedPlantIds;
  const quantityMap = type === 'fish' ? fishQuantityMap : plantQuantityMap;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {type === 'fish' ? 'Fische auswählen' : 'Pflanzen auswählen'}
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        placeholder={`${type === 'fish' ? 'Fische' : 'Pflanzen'} suchen...`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* Ausgewählte Arten mit Mengenangabe */}
      {selectedSpecies.length > 0 && (
        <Paper sx={{ mb: 2, p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Ausgewählt ({selectedSpecies.length}):
          </Typography>
          {selectedSpecies.map((selection) => {
            const item = species.find(s => s.id === selection.id);
            if (!item) return null;
            
            return (
              <Box key={selection.id} sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                py: 1,
                borderBottom: '1px solid #eee'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
                    {type === 'fish' ? '🐟' : '🌱'}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {item.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.scientific_name}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton 
                    size="small"
                    onClick={() => handleQuantityChange(selection.id, selection.quantity - 1)}
                    disabled={selection.quantity <= 1}
                  >
                    <RemoveIcon />
                  </IconButton>
                  
                  <TextField
                    size="small"
                    type="number"
                    value={selection.quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value)) {
                        handleQuantityChange(selection.id, value);
                      }
                    }}
                    inputProps={{ 
                      min: 1, 
                      max: 50,
                      style: { textAlign: 'center', width: '60px' }
                    }}
                  />
                  
                  <IconButton 
                    size="small"
                    onClick={() => handleQuantityChange(selection.id, selection.quantity + 1)}
                    disabled={selection.quantity >= 50}
                  >
                    <AddIcon />
                  </IconButton>
                  
                  <Chip 
                    label={`${selection.quantity}x`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </Box>
            );
          })}
        </Paper>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Scrollbare Artenliste */}
      <Paper sx={{ 
        maxHeight: '400px', 
        overflow: 'auto',
        border: '1px solid #e0e0e0'
      }}>
        <List dense>
          {filteredSpecies.map((item) => {
            const selected = selectedIds.has(item.id);
            const compatible = type === 'fish' ? getCompatibilityInfo(item as Fish) : true;
            const status = getRequirementStatus(item);
            const quantity = quantityMap.get(item.id) || 1;

            return (
              <ListItem
                key={item.id}
                sx={{
                  borderBottom: '1px solid #f0f0f0',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <ListItemAvatar>
                  <Checkbox
                    checked={selected}
                    onChange={() => handleSpeciesToggle(item.id)}
                    disabled={!compatible || status === 'unsuitable'}
                  />
                </ListItemAvatar>

                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: compatible ? 'primary.light' : 'grey.300' }}>
                    {type === 'fish' ? '🐟' : '🌱'}
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="body2" fontWeight="bold">
                        {item.name}
                      </Typography>
                      {selected && (
                        <Chip 
                          label={`${quantity}x`}
                          size="small"
                          color="primary"
                        />
                      )}
                      {!compatible && (
                        <Chip label="Inkompatibel" size="small" color="error" />
                      )}
                      <Chip 
                        label={status === 'suitable' ? 'Geeignet' : status === 'warning' ? 'Warnung' : 'Ungeeignet'}
                        size="small"
                        color={getStatusColor(status)}
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="caption" display="block">
                        {item.scientific_name}
                      </Typography>
                      
                      {type === 'fish' && 'tank_requirements' in item && (
                        <>
                          <Typography variant="caption" display="block">
                            Größe: {item.size.min}-{item.size.max} {item.size.unit} • 
                            Mindestbecken: {item.tank_requirements.min_volume}L • 
                            Schwimmzone: {item.tank_requirements.swimming_zone}
                          </Typography>
                          <Typography variant="caption" display="block">
                            Gruppengröße: {item.tank_requirements.school_size.min}-{item.tank_requirements.school_size.max}
                            {item.compatibility.peaceful && ' • Friedlich'}
                          </Typography>
                        </>
                      )}
                      
                      {type === 'plants' && 'lighting' in item && (
                        <>
                          <Typography variant="caption" display="block">
                            Größe: {item.size.height.min}-{item.size.height.max} {item.size.height.unit} hoch • 
                            Lichtbedarf: {item.lighting.requirement} • 
                            Schwierigkeit: {item.difficulty}
                          </Typography>
                        </>
                      )}
                    </>
                  }
                />
              </ListItem>
            );
          })}
        </List>
        
        {filteredSpecies.length === 0 && !loading && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              Keine passenden Arten gefunden
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default SpeciesSelector;
