import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Grid,
  Alert
} from '@mui/material';
import { 
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/redux';
import { 
  setDimensions, 
  addFish, 
  addPlant, 
  setProjectName,
  resetProject,
  updateFishQuantity,
  updatePlantQuantity
} from '../../store/slices/aquariumSlice';
import StorageService from '../../services/StorageService';
import { AquariumProject } from '../../types/storage';

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<AquariumProject[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<AquariumProject | null>(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const storage = StorageService.getInstance();

  const loadProjects = async () => {
    try {
      const savedProjects = await storage.getAllProjects();
      setProjects(savedProjects);
      setError(null);
    } catch (err) {
      setError('Fehler beim Laden der Projekte');
      console.error('Fehler beim Laden der Projekte:', err);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    
    try {
      await storage.deleteProject(projectToDelete);
      await loadProjects();
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
      setError(null);
    } catch (err) {
      setError('Fehler beim Löschen des Projekts');
      console.error('Fehler beim Löschen des Projekts:', err);
    }
  };

  const handleEditProject = async () => {
    if (!projectToEdit || !editName.trim()) return;
    
    try {
      const updatedProject = { ...projectToEdit, name: editName.trim() };
      await storage.saveProject(updatedProject);
      await loadProjects();
      setEditDialogOpen(false);
      setProjectToEdit(null);
      setEditName('');
      setError(null);
    } catch (err) {
      setError('Fehler beim Bearbeiten des Projekts');
      console.error('Fehler beim Bearbeiten des Projekts:', err);
    }
  };

  const handleLoadProject = async (project: AquariumProject) => {
    try {
      // Redux Store zurücksetzen
      dispatch(resetProject());
      
      // Projekt daten laden
      dispatch(setDimensions(project.dimensions));
      dispatch(setProjectName(project.name));
      
      // Fische laden - jetzt mit quantity
      project.selectedFish.forEach(fishSelection => {
        dispatch(addFish(fishSelection.id));
        if (fishSelection.quantity > 1) {
          dispatch(updateFishQuantity({ 
            id: fishSelection.id, 
            quantity: fishSelection.quantity 
          }));
        }
      });
      
      // Pflanzen laden - jetzt mit quantity
      project.selectedPlants.forEach(plantSelection => {
        dispatch(addPlant(plantSelection.id));
        if (plantSelection.quantity > 1) {
          dispatch(updatePlantQuantity({ 
            id: plantSelection.id, 
            quantity: plantSelection.quantity 
          }));
        }
      });
      
      navigate('/designer');
    } catch (err) {
      setError('Fehler beim Laden des Projekts');
      console.error('Fehler beim Laden des Projekts:', err);
    }
  };

  const openDeleteDialog = (projectId: string) => {
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };

  const openEditDialog = (project: AquariumProject) => {
    setProjectToEdit(project);
    setEditName(project.name);
    setEditDialogOpen(true);
  };

  const getTotalFishCount = (fish: { id: string; quantity: number }[]) => {
    return fish.reduce((total, f) => total + f.quantity, 0);
  };

  const getTotalPlantCount = (plants: { id: string; quantity: number }[]) => {
    return plants.reduce((total, p) => total + p.quantity, 0);
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={loadProjects} variant="outlined">
          Erneut versuchen
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Meine Aquarium-Projekte
      </Typography>
      
      {projects.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Keine Projekte vorhanden
            </Typography>
            <Typography color="text.secondary">
              Erstellen Sie Ihr erstes Aquarium-Projekt im Designer.
            </Typography>
          </CardContent>
          <CardActions>
            <Button 
              variant="contained" 
              onClick={() => navigate('/designer')}
            >
              Neues Projekt starten
            </Button>
          </CardActions>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} md={6} lg={4} key={project.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {project.name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {project.dimensions.length} × {project.dimensions.width} × {project.dimensions.height} cm
                    ({project.dimensions.volume} L)
                  </Typography>
                  
                  <Typography variant="body2" gutterBottom>
                    Erstellt: {new Date(project.createdAt).toLocaleDateString()}
                  </Typography>
                  
                  {project.lastModified && (
                    <Typography variant="body2" gutterBottom>
                      Geändert: {new Date(project.lastModified).toLocaleDateString()}
                    </Typography>
                  )}
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">
                      Fische ({project.selectedFish.length} Arten, {getTotalFishCount(project.selectedFish)} insgesamt):
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {project.selectedFish.slice(0, 3).map((fish) => (
                        <Chip 
                          key={fish.id} 
                          label={`${fish.id} (${fish.quantity}x)`}
                          size="small" 
                        />
                      ))}
                      {project.selectedFish.length > 3 && (
                        <Chip 
                          label={`+${project.selectedFish.length - 3} weitere`}
                          size="small" 
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">
                      Pflanzen ({project.selectedPlants.length} Arten, {getTotalPlantCount(project.selectedPlants)} insgesamt):
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {project.selectedPlants.slice(0, 3).map((plant) => (
                        <Chip 
                          key={plant.id} 
                          label={`${plant.id} (${plant.quantity}x)`}
                          size="small" 
                        />
                      ))}
                      {project.selectedPlants.length > 3 && (
                        <Chip 
                          label={`+${project.selectedPlants.length - 3} weitere`}
                          size="small" 
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                </CardContent>
                
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleLoadProject(project)}
                  >
                    Öffnen
                  </Button>
                  
                  <IconButton
                    size="small"
                    onClick={() => openEditDialog(project)}
                  >
                    <EditIcon />
                  </IconButton>
                  
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => openDeleteDialog(project.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Löschen Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Projekt löschen</DialogTitle>
        <DialogContent>
          <Typography>
            Sind Sie sicher, dass Sie dieses Projekt löschen möchten? 
            Diese Aktion kann nicht rückgängig gemacht werden.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleDeleteProject} 
            color="error" 
            variant="contained"
          >
            Löschen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bearbeiten Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Projekt umbenennen</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Projektname"
            fullWidth
            variant="outlined"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleEditProject} 
            variant="contained"
            disabled={!editName.trim()}
          >
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectList;
