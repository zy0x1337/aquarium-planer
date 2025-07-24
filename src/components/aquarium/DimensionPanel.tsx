import React from 'react';
import {
  TextField,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { setDimensions } from '../../store/slices/aquariumSlice';

const DimensionPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const dimensions = useAppSelector(state => state.aquarium.dimensions);

  const handleDimensionChange = (field: keyof typeof dimensions) => 
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(event.target.value) || 0;
      const newDimensions = { ...dimensions, [field]: value };
      dispatch(setDimensions(newDimensions));
    };

  const getAquariumType = (): string => {
    const { length, width, height } = dimensions;
    if (length >= width * 2) return 'Langbecken';
    if (height >= length * 0.8) return 'Hochbecken';
    return 'Standardbecken';
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Aquarium-Abmessungen
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Länge (cm)"
            type="number"
            value={dimensions.length || ''}
            onChange={handleDimensionChange('length')}
            inputProps={{ min: 10, max: 500 }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Breite (cm)"
            type="number"
            value={dimensions.width || ''}
            onChange={handleDimensionChange('width')}
            inputProps={{ min: 10, max: 200 }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Höhe (cm)"
            type="number"
            value={dimensions.height || ''}
            onChange={handleDimensionChange('height')}
            inputProps={{ min: 10, max: 100 }}
          />
        </Grid>
      </Grid>
      
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            Berechnete Werte
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            <Chip 
              label={`${dimensions.volume?.toFixed(1) || 0} Liter`}
              color="primary"
              variant="outlined"
            />
            <Chip 
              label={getAquariumType()}
              color="secondary"
              variant="outlined"
            />
          </Box>
          
          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Grundfläche:</strong> {(dimensions.length * dimensions.width / 100).toFixed(2)} dm²
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DimensionPanel;
