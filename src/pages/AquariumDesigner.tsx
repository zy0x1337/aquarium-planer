import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import {
  Box,
  Grid,
  Paper,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Chip,
  Tooltip,
  AppBar,
  Toolbar,
  Divider,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Badge,
  Avatar,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Breadcrumbs,
  Link,
  Alert,
  Snackbar,
  LinearProgress,
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Pets as FishIcon,
  Grass as PlantIcon,
  Architecture as DecorationIcon,
  Build as EquipmentIcon,
  Straighten as RulerIcon,
  Palette as ColorIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  ThreeDRotation as ThreeDIcon,
  CropFree as TwoDIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Close as CloseIcon,
  FullscreenExit as ExitFullscreenIcon,
  Fullscreen as FullscreenIcon,
  GridOn as GridIcon,
  PhotoCamera as CameraIcon
} from '@mui/icons-material';

// Import JSON data
import fishData from '../data/fish.json';
import equipmentData from '../data/equipment.json';
import plantData from '../data/plants.json';

// Enhanced Types
interface AquariumElement {
  id: string;
  type: 'fish' | 'plant' | 'decoration' | 'equipment';
  name: string;
  species?: string;
  x: number;
  y: number;
  z?: number;
  width: number;
  height: number;
  depth?: number;
  color: string;
  rotation?: number;
  scale?: number;
  opacity?: number;
  properties: {
    [key: string]: any;
  };
  metadata: {
    dateAdded: string;
    category: string;
    compatibility: string[];
    requirements: {
      temperature?: [number, number];
      ph?: [number, number];
      hardness?: string;
      lighting?: string;
      flow?: string;
    };
  };
}

interface AquariumSettings {
  width: number;
  height: number;
  depth: number;
  volume: number;
  waterType: 'freshwater' | 'saltwater' | 'brackish';
  temperature: number;
  ph: number;
  lighting: string;
  filtration: string;
  substrate: string;
  backgroundImage?: string;
  glassThickness: number;
  rimless: boolean;
}

interface ViewSettings {
  is3D: boolean;
  showGrid: boolean;
  showRuler: boolean;
  showWaterLevel: boolean;
  showLabels: boolean;
  cameraPosition: [number, number, number];
  lightingIntensity: number;
}

// 3D Fish Component
const Fish3D: React.FC<{ element: AquariumElement }> = ({ element }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useEffect(() => {
    const animate = () => {
      if (meshRef.current) {
        meshRef.current.rotation.y += 0.01;
        meshRef.current.position.x += Math.sin(Date.now() * 0.001) * 0.001;
      }
      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return (
    <mesh
      ref={meshRef}
      position={[element.x / 10, element.y / 10, element.z || 0]}
      scale={[element.scale || 1, element.scale || 1, element.scale || 1]}
    >
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color={element.color} />
    </mesh>
  );
};

// 3D Plant Component
const Plant3D: React.FC<{ element: AquariumElement }> = ({ element }) => {
  return (
    <group position={[element.x / 10, element.y / 10, element.z || 0]}>
      <mesh>
        <cylinderGeometry args={[0.1, 0.2, 2, 8]} />
        <meshStandardMaterial color={element.color} />
      </mesh>
      {[...Array(5)].map((_, i) => (
        <mesh key={i} position={[0, 1 + i * 0.3, 0]}>
          <sphereGeometry args={[0.3 - i * 0.05, 8, 8]} />
          <meshStandardMaterial color={element.color} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
};

// Enhanced Search and Filter Component
const ElementSearch: React.FC<{
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
}> = ({ searchTerm, onSearchChange, selectedCategory, onCategoryChange, categories }) => {
  return (
    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
      <TextField
        fullWidth
        size="small"
        placeholder="Elemente suchen..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: searchTerm && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => onSearchChange('')}>
                <CloseIcon />
              </IconButton>
            </InputAdornment>
          )
        }}
        sx={{ mb: 2 }}
      />
      
      <ToggleButtonGroup
        value={selectedCategory}
        exclusive
        onChange={(_, value) => value && onCategoryChange(value)}
        size="small"
        fullWidth
      >
        <ToggleButton value="all">Alle</ToggleButton>
        {categories.map(cat => (
          <ToggleButton key={cat} value={cat}>
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};

// Main Component
const AquariumDesigner: React.FC = () => {
  // Core State
  const [elements, setElements] = useState<AquariumElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [viewSettings, setViewSettings] = useState<ViewSettings>({
    is3D: false,
    showGrid: true,
    showRuler: false,
    showWaterLevel: true,
    showLabels: true,
    cameraPosition: [0, 0, 10],
    lightingIntensity: 1
  });

  // UI State
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [notification, setNotification] = useState<{ message: string; severity: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Canvas State
  const [zoom, setZoom] = useState(1);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [history, setHistory] = useState<AquariumElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [aquariumSettings, setAquariumSettings] = useState<AquariumSettings>({
    width: 120,
    height: 60,
    depth: 40,
    volume: 288,
    waterType: 'freshwater',
    temperature: 24,
    ph: 7.0,
    lighting: 'LED Full Spectrum',
    filtration: 'Canister Filter',
    substrate: 'Fine Gravel',
    glassThickness: 12,
    rimless: true
  });

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Processed Data
  const processedData = useMemo(() => {
    const allData = {
      fish: fishData || [],
      plants: plantData || [],
      equipment: equipmentData || [],
      decorations: [
        { id: 'driftwood', name: 'Treibholz', type: 'decoration', color: '#8B4513', category: 'natural' },
        { id: 'rock_cave', name: 'Steinhöhle', type: 'decoration', color: '#696969', category: 'natural' },
        { id: 'ceramic_ornament', name: 'Keramik-Ornament', type: 'decoration', color: '#DDA0DD', category: 'artificial' }
      ]
    };

    // Filter based on search and category
    const filterItems = (items: any[], type: string) => {
      return items.filter(item => {
        const matchesSearch = !searchTerm || 
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.species && item.species.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === 'all' || selectedCategory === type;
        return matchesSearch && matchesCategory;
      });
    };

    return {
      fish: filterItems(allData.fish, 'fish'),
      plants: filterItems(allData.plants, 'plants'),
      equipment: filterItems(allData.equipment, 'equipment'),
      decorations: filterItems(allData.decorations, 'decorations')
    };
  }, [searchTerm, selectedCategory]);

  // History Management
  const addToHistory = useCallback((newElements: AquariumElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newElements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements([...history[historyIndex - 1]]);
      showNotification('Aktion rückgängig gemacht', 'info');
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements([...history[historyIndex + 1]]);
      showNotification('Aktion wiederholt', 'info');
    }
  };

  // Enhanced Element Management
  const addElement = (type: AquariumElement['type'], template: any) => {
    setLoading(true);
    setTimeout(() => {
      const newElement: AquariumElement = {
        id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        name: template.name,
        species: template.species,
        x: Math.random() * 400 + 50,
        y: Math.random() * 250 + 50,
        z: viewSettings.is3D ? Math.random() * 30 + 10 : 0,
        width: getElementSize(type, template.size).width,
        height: getElementSize(type, template.size).height,
        depth: viewSettings.is3D ? getElementSize(type, template.size).depth : 0,
        color: template.color || getRandomColor(),
        rotation: 0,
        scale: 1,
        opacity: 1,
        properties: { ...template },
        metadata: {
          dateAdded: new Date().toISOString(),
          category: template.category || 'general',
          compatibility: template.compatibility || [],
          requirements: template.requirements || {}
        }
      };
      
      const newElements = [...elements, newElement];
      setElements(newElements);
      addToHistory(newElements);
      setSelectedElement(newElement.id);
      showNotification(`${template.name} hinzugefügt`, 'success');
      setLoading(false);
    }, 300);
  };

  const deleteElement = (id: string) => {
    const element = elements.find(el => el.id === id);
    const newElements = elements.filter(el => el.id !== id);
    setElements(newElements);
    addToHistory(newElements);
    setSelectedElement(null);
    showNotification(`${element?.name || 'Element'} entfernt`, 'warning');
  };

  const updateElement = (id: string, updates: Partial<AquariumElement>) => {
    const newElements = elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    setElements(newElements);
  };

  const duplicateElement = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      const newElement = {
        ...element,
        id: `${element.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        x: element.x + 30,
        y: element.y + 30,
        metadata: {
          ...element.metadata,
          dateAdded: new Date().toISOString()
        }
      };
      const newElements = [...elements, newElement];
      setElements(newElements);
      addToHistory(newElements);
      showNotification(`${element.name} dupliziert`, 'success');
    }
  };

  // Utility Functions
  const getElementSize = (type: string, size: string) => {
    const sizes = {
      fish: { small: { width: 25, height: 15, depth: 10 }, medium: { width: 40, height: 25, depth: 15 }, large: { width: 60, height: 35, depth: 20 } },
      plant: { small: { width: 20, height: 30, depth: 15 }, medium: { width: 35, height: 50, depth: 25 }, large: { width: 50, height: 80, depth: 35 } },
      equipment: { small: { width: 30, height: 20, depth: 15 }, medium: { width: 50, height: 35, depth: 25 }, large: { width: 80, height: 60, depth: 40 } },
      decoration: { small: { width: 35, height: 25, depth: 20 }, medium: { width: 50, height: 40, depth: 30 }, large: { width: 70, height: 60, depth: 45 } }
    };
    return sizes[type as keyof typeof sizes]?.[size as keyof typeof sizes.fish] || sizes.fish.medium;
  };

  const getRandomColor = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setNotification({ message, severity });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  // Enhanced Drag and Drop
  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setSelectedElement(elementId);
    setIsDragging(true);
    setDragOffset({
      x: (e.clientX - rect.left) / zoom - element.x,
      y: (e.clientY - rect.top) / zoom - element.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(800, (e.clientX - rect.left) / zoom - dragOffset.x));
    const newY = Math.max(0, Math.min(600, (e.clientY - rect.top) / zoom - dragOffset.y));

    updateElement(selectedElement, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      addToHistory(elements);
    }
  };

  // Enhanced Save/Load with metadata
  const saveProject = () => {
    const projectData = {
      version: '2.0',
      elements,
      settings: aquariumSettings,
      viewSettings,
      metadata: {
        created: new Date().toISOString(),
        elementCount: elements.length,
        compatibility: checkCompatibility()
      },
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(projectData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aquarium-design-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showNotification('Projekt gespeichert', 'success');
  };

  const loadProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const projectData = JSON.parse(e.target?.result as string);
        setElements(projectData.elements || []);
        setAquariumSettings(projectData.settings || aquariumSettings);
        setViewSettings(projectData.viewSettings || viewSettings);
        addToHistory(projectData.elements || []);
        showNotification('Projekt geladen', 'success');
      } catch (error) {
        showNotification('Fehler beim Laden des Projekts', 'error');
        console.error('Error loading project:', error);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  // Compatibility Check
  const checkCompatibility = () => {
    const fishElements = elements.filter(el => el.type === 'fish');
    const issues: string[] = [];
    
    fishElements.forEach(fish => {
      fishElements.forEach(otherFish => {
        if (fish.id !== otherFish.id) {
          if (fish.properties.temperament === 'aggressive' && otherFish.properties.temperament === 'peaceful') {
            issues.push(`${fish.name} könnte ${otherFish.name} bedrohen`);
          }
        }
      });
    });
    
    return { issues, compatible: issues.length === 0 };
  };

  // Statistics
  const getAquariumStats = () => {
    const fishCount = elements.filter(el => el.type === 'fish').length;
    const plantCount = elements.filter(el => el.type === 'plant').length;
    const equipmentCount = elements.filter(el => el.type === 'equipment').length;
    const decorationCount = elements.filter(el => el.type === 'decoration').length;
    
    const bioload = fishCount * 2; // Simplified calculation
    const maxBioload = aquariumSettings.volume * 0.1;
    const bioloadPercentage = Math.min(100, (bioload / maxBioload) * 100);
    
    return { 
      fishCount, 
      plantCount, 
      equipmentCount, 
      decorationCount, 
      bioload: bioloadPercentage,
      totalElements: elements.length
    };
  };

  const stats = getAquariumStats();
  const compatibility = checkCompatibility();

  // 2D Canvas Render
  const render2D = () => (
    <Box
      ref={canvasRef}
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: `linear-gradient(180deg, 
          ${aquariumSettings.waterType === 'saltwater' ? '#006994' : '#87CEEB'} 0%, 
          ${aquariumSettings.waterType === 'saltwater' ? '#003d5c' : '#4682B4'} 100%)`,
        transform: `scale(${zoom})`,
        transformOrigin: 'top left',
        cursor: isDragging ? 'grabbing' : 'default',
        overflow: 'hidden'
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Grid Overlay */}
      {viewSettings.showGrid && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Water Level Indicator */}
      {viewSettings.showWaterLevel && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '85%',
            border: '2px solid rgba(255,255,255,0.3)',
            borderBottom: 'none',
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Aquarium Elements */}
      {elements.map((element) => (
        <Paper
          key={element.id}
          elevation={selectedElement === element.id ? 8 : 2}
          sx={{
            position: 'absolute',
            left: element.x,
            top: element.y,
            width: element.width,
            height: element.height,
            bgcolor: element.color,
            borderRadius: element.type === 'fish' ? '50%' : 
                          element.type === 'plant' ? '0 0 50% 50%' : 2,
            cursor: 'grab',
            border: selectedElement === element.id ? '3px solid #1976d2' : '1px solid rgba(0,0,0,0.1)',
            boxShadow: selectedElement === element.id ? '0 0 20px rgba(25,118,210,0.5)' : undefined,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 'bold',
            color: 'white',
            textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: element.opacity || 1,
            transform: `rotate(${element.rotation || 0}deg) scale(${element.scale || 1})`,
            '&:hover': {
              transform: `rotate(${element.rotation || 0}deg) scale(${(element.scale || 1) * 1.05})`,
              zIndex: 10,
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
            },
            '&:active': {
              cursor: 'grabbing'
            }
          }}
          onMouseDown={(e) => handleMouseDown(e, element.id)}
        >
          {element.type === 'fish' && '🐠'}
          {element.type === 'plant' && '🌿'}
          {element.type === 'equipment' && '⚙️'}
          {element.type === 'decoration' && '🏺'}
          
          {viewSettings.showLabels && (
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                bottom: -20,
                left: '50%',
                transform: 'translateX(-50%)',
                bgcolor: 'rgba(0,0,0,0.7)',
                color: 'white',
                px: 1,
                borderRadius: 1,
                fontSize: '10px',
                whiteSpace: 'nowrap'
              }}
            >
              {element.name}
            </Typography>
          )}
        </Paper>
      ))}

      {/* Ruler */}
      {viewSettings.showRuler && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'rgba(0,0,0,0.7)',
            color: 'white',
            px: 1,
            py: 0.5,
            borderRadius: 1
          }}
        >
          <RulerIcon sx={{ mr: 1, fontSize: 16 }} />
          <Typography variant="caption">
            {aquariumSettings.width} × {aquariumSettings.height} cm
          </Typography>
        </Box>
      )}
    </Box>
  );

  // 3D Canvas Render
  const render3D = () => (
    <Canvas
      camera={{ position: viewSettings.cameraPosition, fov: 75 }}
      style={{ width: '100%', height: '100%' }}
    >
      <PerspectiveCamera makeDefault position={viewSettings.cameraPosition} />
      <OrbitControls enablePan enableZoom enableRotate />
      
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={viewSettings.lightingIntensity} />
      <pointLight position={[-10, -10, -5]} intensity={0.3} />
      
      <Environment preset="ocean" />
      
      {/* Aquarium Glass */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[aquariumSettings.width/10, aquariumSettings.height/10, aquariumSettings.depth/10]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.1}
          roughness={0}
          transmission={0.95}
          thickness={0.5}
        />
      </mesh>
      
      {/* Substrate */}
      <mesh position={[0, -aquariumSettings.height/20, 0]}>
        <boxGeometry args={[aquariumSettings.width/10, 0.5, aquariumSettings.depth/10]} />
        <meshStandardMaterial color="#D2B48C" />
      </mesh>
      
      {/* Elements */}
      {elements.map((element) => (
        <group key={element.id}>
          {element.type === 'fish' && <Fish3D element={element} />}
          {element.type === 'plant' && <Plant3D element={element} />}
          {element.type === 'equipment' && (
            <mesh position={[element.x/10, element.y/10, element.z || 0]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color={element.color} />
            </mesh>
          )}
          {element.type === 'decoration' && (
            <mesh position={[element.x/10, element.y/10, element.z || 0]}>
              <dodecahedronGeometry args={[0.5]} />
              <meshStandardMaterial color={element.color} />
            </mesh>
          )}
        </group>
      ))}
    </Canvas>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f8fafc' }}>
      {/* Enhanced Top Toolbar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: 1400,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ mr: 3, fontWeight: 600 }}>
              Aquarium Designer Pro
            </Typography>
            
            <Breadcrumbs sx={{ color: 'rgba(255,255,255,0.8)' }}>
              <Link color="inherit" href="#" underline="hover">
                Projekte
              </Link>
              <Typography color="inherit">Neues Design</Typography>
            </Breadcrumbs>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* 2D/3D Toggle */}
            <ToggleButtonGroup
              value={viewSettings.is3D ? '3d' : '2d'}
              exclusive
              onChange={(_, value) => value && setViewSettings(prev => ({ ...prev, is3D: value === '3d' }))}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  '&.Mui-selected': {
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white'
                  }
                }
              }}
            >
              <ToggleButton value="2d">
                <TwoDIcon sx={{ mr: 1 }} />
                2D
              </ToggleButton>
              <ToggleButton value="3d">
                <ThreeDIcon sx={{ mr: 1 }} />
                3D
              </ToggleButton>
            </ToggleButtonGroup>

            <Divider orientation="vertical" flexItem sx={{ mx: 1, bgcolor: 'rgba(255,255,255,0.3)' }} />
            
            {/* Action Buttons */}
            <Tooltip title="Rückgängig">
              <IconButton color="inherit" onClick={undo} disabled={historyIndex === 0}>
                <UndoIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Wiederholen">
              <IconButton color="inherit" onClick={redo} disabled={historyIndex === history.length - 1}>
                <RedoIcon />
              </IconButton>
            </Tooltip>
            
            {!viewSettings.is3D && (
              <>
                <Tooltip title="Verkleinern">
                  <IconButton color="inherit" onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}>
                    <ZoomOutIcon />
                  </IconButton>
                </Tooltip>
                
                <Chip 
                  label={`${Math.round(zoom * 100)}%`} 
                  size="small" 
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                
                <Tooltip title="Vergrößern">
                  <IconButton color="inherit" onClick={() => setZoom(Math.min(3, zoom + 0.25))}>
                    <ZoomInIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
            
            <Divider orientation="vertical" flexItem sx={{ mx: 1, bgcolor: 'rgba(255,255,255,0.3)' }} />
            
            <Tooltip title="Projekt laden">
              <IconButton color="inherit" onClick={() => fileInputRef.current?.click()}>
                <UploadIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Projekt speichern">
              <IconButton color="inherit" onClick={saveProject}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Teilen">
              <IconButton color="inherit" onClick={() => setShareDialogOpen(true)}>
                <ShareIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Einstellungen">
              <IconButton color="inherit" onClick={() => setSettingsOpen(true)}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
        
        {loading && <LinearProgress sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />}
      </AppBar>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".json"
        onChange={loadProject}
      />

      {/* Enhanced Left Sidebar */}
      <Drawer
        variant="persistent"
        open={drawerOpen}
        sx={{
          width: 380,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 380,
            boxSizing: 'border-box',
            mt: 8,
            bgcolor: '#ffffff',
            borderRight: '1px solid #e0e7ff'
          }
        }}
      >
        {/* Search and Filter */}
        <ElementSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={['fish', 'plants', 'equipment', 'decorations']}
        />

        {/* Tabs for different sections */}
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Elemente" />
          <Tab label="Eigenschaften" />
          <Tab label="Statistiken" />
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ height: 'calc(100vh - 200px)', overflow: 'auto' }}>
          {activeTab === 0 && (
            <Box>
              {/* Fish Section */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Badge badgeContent={stats.fishCount} color="primary">
                    <FishIcon sx={{ mr: 1, color: '#1976d2' }} />
                  </Badge>
                  <Typography sx={{ ml: 1, fontWeight: 500 }}>
                    Fische ({processedData.fish.length} verfügbar)
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 1 }}>
                  <Grid container spacing={1}>
                    {processedData.fish.map((fish, index) => (
                      <Grid item xs={12} key={index}>
                        <Card 
                          variant="outlined" 
                          sx={{ 
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: 3
                            }
                          }}
                          onClick={() => addElement('fish', fish)}
                        >
                          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  bgcolor: fish.color,
                                  mr: 2,
                                  fontSize: '16px'
                                }}
                              >
                                🐠
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  {fish.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {fish.species}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              <Chip size="small" label={fish.size} variant="outlined" />
                              <Chip size="small" label={fish.temperament} variant="outlined" />
                              <Chip size="small" label={fish.careLevel} variant="outlined" />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Plants Section */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Badge badgeContent={stats.plantCount} color="success">
                    <PlantIcon sx={{ mr: 1, color: '#2e7d0f' }} />
                  </Badge>
                  <Typography sx={{ ml: 1, fontWeight: 500 }}>
                    Pflanzen ({processedData.plants.length} verfügbar)
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 1 }}>
                  <Grid container spacing={1}>
                    {processedData.plants.map((plant, index) => (
                      <Grid item xs={12} key={index}>
                        <Card 
                          variant="outlined" 
                          sx={{ 
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: 3
                            }
                          }}
                          onClick={() => addElement('plant', plant)}
                        >
                          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  bgcolor: plant.color,
                                  mr: 2,
                                  fontSize: '16px'
                                }}
                              >
                                🌿
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  {plant.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {plant.species}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              <Chip size="small" label={plant.size} variant="outlined" />
                              <Chip size="small" label={plant.careLevel} variant="outlined" />
                              {plant.lighting && <Chip size="small" label={plant.lighting} variant="outlined" />}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Equipment Section */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Badge badgeContent={stats.equipmentCount} color="warning">
                    <EquipmentIcon sx={{ mr: 1, color: '#ed6c02' }} />
                  </Badge>
                  <Typography sx={{ ml: 1, fontWeight: 500 }}>
                    Technik ({processedData.equipment.length} verfügbar)
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 1 }}>
                  <Grid container spacing={1}>
                    {processedData.equipment.map((equipment, index) => (
                      <Grid item xs={12} key={index}>
                        <Card 
                          variant="outlined" 
                          sx={{ 
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: 3
                            }
                          }}
                          onClick={() => addElement('equipment', equipment)}
                        >
                          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  bgcolor: equipment.color || '#ff9800',
                                  mr: 2,
                                  fontSize: '16px'
                                }}
                              >
                                ⚙️
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  {equipment.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {equipment.type}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              <Chip size="small" label={equipment.size || 'Standard'} variant="outlined" />
                              {equipment.specs && <Chip size="small" label={equipment.specs} variant="outlined" />}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Decorations Section */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Badge badgeContent={stats.decorationCount} color="secondary">
                    <DecorationIcon sx={{ mr: 1, color: '#9c27b0' }} />
                  </Badge>
                  <Typography sx={{ ml: 1, fontWeight: 500 }}>
                    Dekoration ({processedData.decorations.length} verfügbar)
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 1 }}>
                  <Grid container spacing={1}>
                    {processedData.decorations.map((decoration, index) => (
                      <Grid item xs={12} key={index}>
                        <Card 
                          variant="outlined" 
                          sx={{ 
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: 3
                            }
                          }}
                          onClick={() => addElement('decoration', decoration)}
                        >
                          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  bgcolor: decoration.color,
                                  mr: 2,
                                  fontSize: '16px'
                                }}
                              >
                                🏺
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  {decoration.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {decoration.category}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              <Chip size="small" label={decoration.type} variant="outlined" />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}

          {/* Properties Tab */}
          {activeTab === 1 && selectedElement && (
            <Box sx={{ p: 2 }}>
              {(() => {
                const element = elements.find(el => el.id === selectedElement);
                if (!element) return null;
                
                return (
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {element.name}
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Name"
                            value={element.name}
                            onChange={(e) => updateElement(element.id, { name: e.target.value })}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Farbe"
                            type="color"
                            value={element.color}
                            onChange={(e) => updateElement(element.id, { color: e.target.value })}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Typography gutterBottom>Größe</Typography>
                          <Slider
                            value={element.scale || 1}
                            onChange={(_, value) => updateElement(element.id, { scale: value as number })}
                            min={0.5}
                            max={2}
                            step={0.1}
                            marks
                            valueLabelDisplay="auto"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Typography gutterBottom>Rotation</Typography>
                          <Slider
                            value={element.rotation || 0}
                            onChange={(_, value) => updateElement(element.id, { rotation: value as number })}
                            min={0}
                            max={360}
                            marks
                            valueLabelDisplay="auto"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Typography gutterBottom>Transparenz</Typography>
                          <Slider
                            value={element.opacity || 1}
                            onChange={(_, value) => updateElement(element.id, { opacity: value as number })}
                            min={0.1}
                            max={1}
                            step={0.1}
                            marks
                            valueLabelDisplay="auto"
                          />
                        </Grid>
                      </Grid>
                      
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<CopyIcon />}
                          onClick={() => duplicateElement(element.id)}
                        >
                          Duplizieren
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<DeleteIcon />}
                          onClick={() => deleteElement(element.id)}
                        >
                          Löschen
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })()}
            </Box>
          )}

          {/* Statistics Tab */}
          {activeTab === 2 && (
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Aquarium-Übersicht
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="primary">
                              {stats.totalElements}
                            </Typography>
                            <Typography variant="caption">
                              Gesamt Elemente
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="success.main">
                              {aquariumSettings.volume}L
                            </Typography>
                            <Typography variant="caption">
                              Volumen
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Besatz-Verteilung
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        <Chip icon={<FishIcon />} label={`${stats.fishCount} Fische`} color="primary" />
                        <Chip icon={<PlantIcon />} label={`${stats.plantCount} Pflanzen`} color="success" />
                        <Chip icon={<EquipmentIcon />} label={`${stats.equipmentCount} Technik`} color="warning" />
                        <Chip icon={<DecorationIcon />} label={`${stats.decorationCount} Deko`} color="secondary" />
                      </Box>
                      
                      <Typography variant="body2" gutterBottom>
                        Biologische Belastung: {stats.bioload.toFixed(1)}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={stats.bioload}
                        color={stats.bioload > 80 ? 'error' : stats.bioload > 60 ? 'warning' : 'success'}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Kompatibilität
                      </Typography>
                      {compatibility.compatible ? (
                        <Alert severity="success" icon={<CheckIcon />}>
                          Alle Elemente sind kompatibel
                        </Alert>
                      ) : (
                        <Alert severity="warning" icon={<WarningIcon />}>
                          {compatibility.issues.length} Kompatibilitätsprobleme gefunden
                          <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                            {compatibility.issues.slice(0, 3).map((issue, index) => (
                              <Typography component="li" key={index} variant="body2">
                                {issue}
                              </Typography>
                            ))}
                          </Box>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Aquarium-Parameter
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            <Chip size="small" label={`${aquariumSettings.waterType}`} />
                            <Chip size="small" label={`${aquariumSettings.temperature}°C`} />
                            <Chip size="small" label={`pH ${aquariumSettings.ph}`} />
                            <Chip size="small" label={aquariumSettings.lighting} />
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            <Chip size="small" label={aquariumSettings.filtration} />
                            <Chip size="small" label={aquariumSettings.substrate} />
                            <Chip size="small" label={aquariumSettings.rimless ? 'Rimless' : 'Mit Rahmen'} />
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* Main Canvas Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: 8,
          p: 2,
          ml: drawerOpen ? 0 : -47.5,
          transition: 'margin-left 0.3s ease'
        }}
      >
        <Paper
          elevation={4}
          sx={{
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 3,
            cursor: isDragging ? 'grabbing' : 'default',
            background: viewSettings.is3D ? '#000' : undefined
          }}
        >
          {/* Render 2D or 3D view */}
          {viewSettings.is3D ? render3D() : render2D()}

          {/* View Controls */}
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}
          >
            <Tooltip title="Raster umschalten">
              <IconButton
                size="small"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.9)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                }}
                onClick={() => setViewSettings(prev => ({ ...prev, showGrid: !prev.showGrid }))}
              >
                <GridIcon color={viewSettings.showGrid ? 'primary' : 'inherit'} />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Beschriftungen umschalten">
              <IconButton
                size="small"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.9)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                }}
                onClick={() => setViewSettings(prev => ({ ...prev, showLabels: !prev.showLabels }))}
              >
                <EditIcon color={viewSettings.showLabels ? 'primary' : 'inherit'} />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Vollbild">
              <IconButton
                size="small"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.9)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                }}
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>
          </Box>

          {/* Drawer Toggle */}
          <Fab
            size="small"
            sx={{
              position: 'absolute',
              top: 16,
              left: drawerOpen ? 396 : 16,
              transition: 'left 0.3s ease',
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
            onClick={() => setDrawerOpen(!drawerOpen)}
          >
            <ViewIcon />
          </Fab>

          {/* Speed Dial for quick actions */}
          {selectedElement && (
            <SpeedDial
              ariaLabel="Element Aktionen"
              sx={{ position: 'absolute', bottom: 16, right: 16 }}
              icon={<SpeedDialIcon />}
              direction="up"
            >
              <SpeedDialAction
                icon={<CopyIcon />}
                tooltipTitle="Duplizieren"
                onClick={() => duplicateElement(selectedElement)}
              />
              <SpeedDialAction
                icon={<EditIcon />}
                tooltipTitle="Bearbeiten"
                onClick={() => setActiveTab(1)}
              />
              <SpeedDialAction
                icon={<DeleteIcon />}
                tooltipTitle="Löschen"
                onClick={() => deleteElement(selectedElement)}
              />
            </SpeedDial>
          )}

          {/* Element count indicator */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              display: 'flex',
              gap: 1
            }}
          >
            <Chip size="small" label={`${stats.totalElements} Elemente`} />
            <Chip 
              size="small" 
              label={`Zoom: ${Math.round(zoom * 100)}%`}
              sx={{ display: viewSettings.is3D ? 'none' : 'inline-flex' }}
            />
          </Box>
        </Paper>
      </Box>

      {/* Enhanced Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Aquarium-Einstellungen
            <IconButton onClick={() => setSettingsOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Tabs value={0} sx={{ mb: 3 }}>
            <Tab label="Grundeinstellungen" />
            <Tab label="Erweitert" />
            <Tab label="Ansicht" />
          </Tabs>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Abmessungen
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Breite (cm)"
                        type="number"
                        value={aquariumSettings.width}
                        onChange={(e) => setAquariumSettings(prev => ({
                          ...prev,
                          width: Number(e.target.value),
                          volume: (Number(e.target.value) * prev.height * prev.depth) / 1000
                        }))}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Höhe (cm)"
                        type="number"
                        value={aquariumSettings.height}
                        onChange={(e) => setAquariumSettings(prev => ({
                          ...prev,
                          height: Number(e.target.value),
                          volume: (prev.width * Number(e.target.value) * prev.depth) / 1000
                        }))}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Tiefe (cm)"
                        type="number"
                        value={aquariumSettings.depth}
                        onChange={(e) => setAquariumSettings(prev => ({
                          ...prev,
                          depth: Number(e.target.value),
                          volume: (prev.width * prev.height * Number(e.target.value)) / 1000
                        }))}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Alert severity="info">
                        Berechnetes Volumen: {aquariumSettings.volume.toFixed(1)} Liter
                      </Alert>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Wasserparameter
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Wassertyp</InputLabel>
                        <Select
                          value={aquariumSettings.waterType}
                          label="Wassertyp"
                          onChange={(e) => setAquariumSettings(prev => ({
                            ...prev,
                            waterType: e.target.value as any
                          }))}
                        >
                          <MenuItem value="freshwater">Süßwasser</MenuItem>
                          <MenuItem value="saltwater">Salzwasser</MenuItem>
                          <MenuItem value="brackish">Brackwasser</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" gutterBottom>
                        Temperatur: {aquariumSettings.temperature}°C
                      </Typography>
                      <Slider
                        value={aquariumSettings.temperature}
                        onChange={(_, value) => setAquariumSettings(prev => ({
                          ...prev,
                          temperature: value as number
                        }))}
                        min={18}
                        max={32}
                        step={0.5}
                        marks={[
                          { value: 20, label: '20°C' },
                          { value: 26, label: '26°C' },
                          { value: 30, label: '30°C' }
                        ]}
                        valueLabelDisplay="auto"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" gutterBottom>
                        pH-Wert: {aquariumSettings.ph}
                      </Typography>
                      <Slider
                        value={aquariumSettings.ph}
                        onChange={(_, value) => setAquariumSettings(prev => ({
                          ...prev,
                          ph: value as number
                        }))}
                        min={5.5}
                        max={9.0}
                        step={0.1}
                        marks={[
                          { value: 6.0, label: '6.0' },
                          { value: 7.0, label: '7.0' },
                          { value: 8.0, label: '8.0' }
                        ]}
                        valueLabelDisplay="auto"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Technische Ausstattung
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Beleuchtung</InputLabel>
                        <Select
                          value={aquariumSettings.lighting}
                          label="Beleuchtung"
                          onChange={(e) => setAquariumSettings(prev => ({
                            ...prev,
                            lighting: e.target.value
                          }))}
                        >
                          <MenuItem value="LED Full Spectrum">LED Full Spectrum</MenuItem>
                          <MenuItem value="T5 Fluorescent">T5 Leuchtstoffröhre</MenuItem>
                          <MenuItem value="Metal Halide">Halogen-Metalldampf</MenuItem>
                          <MenuItem value="LED RGB">LED RGB</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Filterung</InputLabel>
                        <Select
                          value={aquariumSettings.filtration}
                          label="Filterung"
                          onChange={(e) => setAquariumSettings(prev => ({
                            ...prev,
                            filtration: e.target.value
                          }))}
                        >
                          <MenuItem value="Canister Filter">Außenfilter</MenuItem>
                          <MenuItem value="Internal Filter">Innenfilter</MenuItem>
                          <MenuItem value="HOB Filter">Aufhängefilter</MenuItem>
                          <MenuItem value="Sump">Technikbecken</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Bodengrund</InputLabel>
                        <Select
                          value={aquariumSettings.substrate}
                          label="Bodengrund"
                          onChange={(e) => setAquariumSettings(prev => ({
                            ...prev,
                            substrate: e.target.value
                          }))}
                        >
                          <MenuItem value="Fine Gravel">Feiner Kies</MenuItem>
                          <MenuItem value="Sand">Sand</MenuItem>
                          <MenuItem value="Aqua Soil">Aqua Soil</MenuItem>
                          <MenuItem value="Crushed Coral">Korallensand</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={aquariumSettings.rimless}
                            onChange={(e) => setAquariumSettings(prev => ({
                              ...prev,
                              rimless: e.target.checked
                            }))}
                          />
                        }
                        label="Rimless Design"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={() => {
              setSettingsOpen(false);
              showNotification('Einstellungen gespeichert', 'success');
            }} 
            variant="contained"
          >
            Speichern
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Design teilen</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Teilen Sie Ihr Aquarium-Design mit anderen oder exportieren Sie es für verschiedene Zwecke.
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<CameraIcon />}
                onClick={() => {
                  // Screenshot functionality
                  showNotification('Screenshot erstellt', 'success');
                }}
              >
                Screenshot erstellen
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={saveProject}
              >
                Als JSON exportieren
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ShareIcon />}
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify({ elements, settings: aquariumSettings }));
                  showNotification('Link kopiert', 'success');
                }}
              >
                Link kopieren
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>
            Schließen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={!!notification}
        autoHideDuration={4000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {notification && (
          <Alert
            onClose={closeNotification}
            severity={notification.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
};

export default AquariumDesigner;
