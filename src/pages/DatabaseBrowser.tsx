import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardMedia,
  TextField,
  InputAdornment,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { Fish, Plant, Equipment } from '../types/aquarium';
import DatabaseService from '../services/DatabaseService';
import { useAppDispatch } from '../hooks/redux';
import { addFish, addPlant } from '../store/slices/aquariumSlice';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const DatabaseBrowser: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [fish, setFish] = useState<Fish[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filteredFish, setFilteredFish] = useState<Fish[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<Plant[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  const [selectedItem, setSelectedItem] = useState<Fish | Plant | Equipment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useAppDispatch();
  const db = DatabaseService.getInstance();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterData();
  }, [searchTerm, fish, plants, equipment, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fishData, plantsData, equipmentData] = await Promise.all([
        db.getFish(),
        db.getPlants(),
        db.getEquipment(),
      ]);
      setFish(fishData);
      setPlants(plantsData);
      setEquipment(equipmentData);
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
  const term = searchTerm.toLowerCase();
  
  // Safe filtering with fallback to empty arrays
  setFilteredFish(
    (fish || []).filter(f =>
      f.name.toLowerCase().includes(term) ||
      f.scientific_name.toLowerCase().includes(term) ||
      f.family.toLowerCase().includes(term)
    )
  );
  
  setFilteredPlants(
    (plants || []).filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.scientific_name.toLowerCase().includes(term) ||
      p.family.toLowerCase().includes(term)
    )
  );
  
  setFilteredEquipment(
    (equipment || []).filter(e =>
      e.name.toLowerCase().includes(term) ||
      e.category.toLowerCase().includes(term)
    )
  );
};

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setSearchTerm('');
  };

  const handleItemClick = (item: Fish | Plant | Equipment) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleAddToProject = (item: Fish | Plant) => {
    if ('tank_requirements' in item) {
      dispatch(addFish(item.id));
    } else {
      dispatch(addPlant(item.id));
    }
    setDialogOpen(false);
  };

  // Type guard functions
  const isFish = (item: Fish | Plant | Equipment): item is Fish => {
    return 'tank_requirements' in item;
  };

  const isPlant = (item: Fish | Plant | Equipment): item is Plant => {
    return 'lighting' in item;
  };

  const isEquipment = (item: Fish | Plant | Equipment): item is Equipment => {
    return 'category' in item && 'specifications' in item;
  };

  const renderFishCard = (fishItem: Fish) => (
    <Grid item xs={12} sm={6} md={4} key={fishItem.id}>
      <Card 
        sx={{ 
          height: '100%', 
          cursor: 'pointer',
          '&:hover': { boxShadow: 4 }
        }}
        onClick={() => handleItemClick(fishItem)}
      >
        <CardMedia
          component="div"
          sx={{ 
            height: 140, 
            bgcolor: 'grey.200',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '4rem'
          }}
        >
          🐟
        </CardMedia>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            {fishItem.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {fishItem.scientific_name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
            <Chip size="small" label={fishItem.care_level} />
            <Chip size="small" label={`${fishItem.tank_requirements.min_volume}L min`} />
            {fishItem.compatibility.peaceful && (
              <Chip size="small" label="Friedlich" color="success" />
            )}
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );

  const renderPlantCard = (plant: Plant) => (
    <Grid item xs={12} sm={6} md={4} key={plant.id}>
      <Card 
        sx={{ 
          height: '100%', 
          cursor: 'pointer',
          '&:hover': { boxShadow: 4 }
        }}
        onClick={() => handleItemClick(plant)}
      >
        <CardMedia
          component="div"
          sx={{ 
            height: 140, 
            bgcolor: 'green.50',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '4rem'
          }}
        >
          🌱
        </CardMedia>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            {plant.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {plant.scientific_name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
            <Chip size="small" label={plant.difficulty} />
            <Chip size="small" label={plant.lighting.requirement + ' Licht'} />
            <Chip size="small" label={plant.growth_rate + ' wachsend'} />
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );

  const renderEquipmentCard = (equipmentItem: Equipment) => (
    <Grid item xs={12} sm={6} md={4} key={equipmentItem.id}>
      <Card 
        sx={{ 
          height: '100%', 
          cursor: 'pointer',
          '&:hover': { boxShadow: 4 }
        }}
        onClick={() => handleItemClick(equipmentItem)}
      >
        <CardMedia
          component="div"
          sx={{ 
            height: 140, 
            bgcolor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '4rem'
          }}
        >
          ⚙️
        </CardMedia>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            {equipmentItem.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {equipmentItem.category}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
            <Chip 
              size="small" 
              label={`${equipmentItem.price_range.min}-${equipmentItem.price_range.max} ${equipmentItem.price_range.currency}`} 
            />
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );

  const renderDetailDialog = () => {
    if (!selectedItem) return null;

    // FIXED: Use type guards instead of property access
    const itemIsFish = isFish(selectedItem);
    const itemIsPlant = isPlant(selectedItem);
    const itemIsEquipment = isEquipment(selectedItem);

    return (
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 56, height: 56, fontSize: '2rem' }}>
              {itemIsFish ? '🐟' : itemIsPlant ? '🌱' : '⚙️'}
            </Avatar>
            <Box>
              <Typography variant="h6">{selectedItem.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {/* FIXED: Use type guards for safe property access */}
                {itemIsFish || itemIsPlant 
                  ? (selectedItem as Fish | Plant).scientific_name 
                  : (selectedItem as Equipment).category
                }
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {itemIsFish && (
            <Box>
              <Typography variant="h6" gutterBottom>Fisch-Details</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2"><strong>Familie:</strong> {selectedItem.family}</Typography>
                  <Typography variant="body2"><strong>Größe:</strong> {selectedItem.size.min}-{selectedItem.size.max} {selectedItem.size.unit}</Typography>
                  <Typography variant="body2"><strong>Pflegestufe:</strong> {selectedItem.care_level}</Typography>
                  <Typography variant="body2"><strong>Verhalten:</strong> {selectedItem.behavior}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2"><strong>Mindestbecken:</strong> {selectedItem.tank_requirements.min_volume}L</Typography>
                  <Typography variant="body2"><strong>Mindestlänge:</strong> {selectedItem.tank_requirements.min_length}cm</Typography>
                  <Typography variant="body2"><strong>Schwimmzone:</strong> {selectedItem.tank_requirements.swimming_zone}</Typography>
                  <Typography variant="body2"><strong>Gruppengröße:</strong> {selectedItem.tank_requirements.school_size.min}-{selectedItem.tank_requirements.school_size.max}</Typography>
                </Grid>
              </Grid>
              
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Wasserwerte</Typography>
              <Typography variant="body2"><strong>Temperatur:</strong> {selectedItem.water_parameters.temperature.min}-{selectedItem.water_parameters.temperature.max} {selectedItem.water_parameters.temperature.unit}</Typography>
              <Typography variant="body2"><strong>pH:</strong> {selectedItem.water_parameters.ph.min}-{selectedItem.water_parameters.ph.max}</Typography>
              <Typography variant="body2"><strong>Härte:</strong> {selectedItem.water_parameters.hardness.min}-{selectedItem.water_parameters.hardness.max} {selectedItem.water_parameters.hardness.unit}</Typography>
            </Box>
          )}

          {itemIsPlant && (
            <Box>
              <Typography variant="h6" gutterBottom>Pflanzen-Details</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2"><strong>Familie:</strong> {selectedItem.family}</Typography>
                  <Typography variant="body2"><strong>Höhe:</strong> {selectedItem.size.height.min}-{selectedItem.size.height.max} {selectedItem.size.height.unit}</Typography>
                  <Typography variant="body2"><strong>Breite:</strong> {selectedItem.size.width.min}-{selectedItem.size.width.max} {selectedItem.size.width.unit}</Typography>
                  <Typography variant="body2"><strong>Schwierigkeit:</strong> {selectedItem.difficulty}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2"><strong>Lichtbedarf:</strong> {selectedItem.lighting.requirement}</Typography>
                  <Typography variant="body2"><strong>Wachstumsrate:</strong> {selectedItem.growth_rate}</Typography>
                  <Typography variant="body2"><strong>CO₂:</strong> {selectedItem.co2.required ? 'Erforderlich' : 'Optional'}</Typography>
                  <Typography variant="body2"><strong>Vermehrung:</strong> {selectedItem.propagation}</Typography>
                </Grid>
              </Grid>
              
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Platzierung</Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {selectedItem.placement.map(place => (
                  <Chip key={place} size="small" label={place} />
                ))}
              </Box>
            </Box>
          )}

          {itemIsEquipment && (
            <Box>
              <Typography variant="h6" gutterBottom>Equipment-Details</Typography>
              <Typography variant="body2"><strong>Kategorie:</strong> {selectedItem.category}</Typography>
              <Typography variant="body2"><strong>Preis:</strong> {selectedItem.price_range.min}-{selectedItem.price_range.max} {selectedItem.price_range.currency}</Typography>
              
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Spezifikationen</Typography>
              {Object.entries(selectedItem.specifications).map(([key, value]) => (
                <Typography key={key} variant="body2">
                  <strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : value}
                </Typography>
              ))}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Schließen
          </Button>
          {(itemIsFish || itemIsPlant) && (
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleAddToProject(selectedItem as Fish | Plant)}
            >
              Zum Projekt hinzufügen
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Lade Datenbank...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Wissensdatenbank
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Durchsuche und erkunde unsere umfangreiche Datenbank mit Fischen, Pflanzen und Ausrüstung.
      </Typography>

      <TextField
        fullWidth
        placeholder="Suche nach Namen, Familie oder Kategorie..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label={`Fische (${filteredFish.length})`} />
          <Tab label={`Pflanzen (${filteredPlants.length})`} />
          <Tab label={`Ausrüstung (${filteredEquipment.length})`} />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          {filteredFish.map(renderFishCard)}
        </Grid>
        {filteredFish.length === 0 && (
          <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
            Keine Fische gefunden. Versuche einen anderen Suchbegriff.
          </Typography>
        )}
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          {filteredPlants.map(renderPlantCard)}
        </Grid>
        {filteredPlants.length === 0 && (
          <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
            Keine Pflanzen gefunden. Versuche einen anderen Suchbegriff.
          </Typography>
        )}
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          {filteredEquipment.map(renderEquipmentCard)}
        </Grid>
        {filteredEquipment.length === 0 && (
          <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
            Keine Ausrüstung gefunden. Versuche einen anderen Suchbegriff.
          </Typography>
        )}
      </TabPanel>

      {renderDetailDialog()}
    </Box>
  );
};

export default DatabaseBrowser;
