import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
  useMemo
} from 'react';
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
  Paper,
  Card,
  CardContent,
  Slider,
  Switch,
  FormControlLabel,
  Chip,
  CircularProgress,
  Fade
} from '@mui/material';
import {
  ViewInAr as View3DIcon,
  ViewQuilt as View2DIcon
} from '@mui/icons-material';
import { useAppSelector } from '../../hooks/redux';
import DatabaseService from '../../services/DatabaseService';
import { Fish, Plant } from '../../types/aquarium';
import Aquarium3DViewer from './Aquarium3DViewer';

type DisplayMode = '2d' | '3d';

// Fish movement patterns for more realistic swimming
interface FishState {
  id: string;
  size: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  angle: number;
  species: string;
  depth: number;
  tailPhase: number;
  finPhase: number;
}

// Plant swaying state
interface PlantState {
  id: string;
  height: number;
  x: number;
  color: string;
  swayPhase: number;
  leafCount: number;
  type: 'tall' | 'bushy' | 'grass';
}

const AquariumViewer: React.FC = () => {
  /************ Gemeinsamer State ************/
  const [mode, setMode] = useState<DisplayMode>('2d');
  const [loading, setLoading] = useState(false);
  const aquarium = useAppSelector((s) => s.aquarium);
  const { dimensions, selectedFish, selectedPlants, projectName } = aquarium;

  /************ 2D-spezifischer State ************/
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [view, setView] = useState<'front' | 'top'>('front');
  const [showGrid, setShowGrid] = useState(false);
  const [showFish, setShowFish] = useState(true);
  const [showPlants, setShowPlants] = useState(true);
  const [showBubbles, setShowBubbles] = useState(true);
  const [showLighting, setShowLighting] = useState(true);
  const [speed, setSpeed] = useState(30);
  const [frame, setFrame] = useState(0);
  const [fishDB, setFishDB] = useState<Fish[]>([]);
  const [plantDB, setPlantDB] = useState<Plant[]>([]);

  // Enhanced animation states
  const [fishStates, setFishStates] = useState<FishState[]>([]);
  const [plantStates, setPlantStates] = useState<PlantState[]>([]);
  const [bubbles, setBubbles] = useState<Array<{id: string, x: number, y: number, size: number, speed: number}>>([]);

  /************ Daten einmalig laden ************/
  useEffect(() => {
    const db = DatabaseService.getInstance();
    (async () => {
      try {
        const [f, p] = await Promise.all([db.getFish(), db.getPlants()]);
        setFishDB(f);
        setPlantDB(p);
      } catch (e) {
        console.error('Load species failed', e);
      }
    })();
  }, []);

  /************ Initialize fish and plant states ************/
  useEffect(() => {
    if (mode !== '2d') return;

    // Initialize fish states
    const newFishStates: FishState[] = [];
    selectedFish.forEach((sel) => {
      const info = fishDB.find((f) => f.id === sel.id);
      for (let i = 0; i < sel.quantity; i++) {
        newFishStates.push({
          id: `${sel.id}_${i}`,
          size: info ? (info.size.min + info.size.max) / 2 : 5,
          x: Math.random() * 0.7 + 0.15,
          y: Math.random() * 0.5 + 0.3,
          vx: (Math.random() - 0.5) * 0.002,
          vy: (Math.random() - 0.5) * 0.001,
          color: getFishColor(sel.id, i),
          angle: Math.random() * Math.PI * 2,
          species: sel.id,
          depth: Math.random(),
          tailPhase: Math.random() * Math.PI * 2,
          finPhase: Math.random() * Math.PI * 2
        });
      }
    });
    setFishStates(newFishStates);

    // Initialize plant states
    const newPlantStates: PlantState[] = [];
    selectedPlants.forEach((sel) => {
      const info = plantDB.find((p) => p.id === sel.id);
      for (let i = 0; i < sel.quantity; i++) {
        newPlantStates.push({
          id: `${sel.id}_${i}`,
          height: info ? (info.size.height.min + info.size.height.max) / 2 : 15,
          x: Math.random() * 0.85 + 0.075,
          color: getPlantColor(sel.id, i),
          swayPhase: Math.random() * Math.PI * 2,
          leafCount: Math.floor(Math.random() * 3) + 3,
          type: Math.random() > 0.7 ? 'bushy' : Math.random() > 0.5 ? 'tall' : 'grass'
        });
      }
    });
    setPlantStates(newPlantStates);

    // Initialize bubbles
    const newBubbles = Array.from({ length: 8 }, (_, i) => ({
      id: `bubble_${i}`,
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 3 + 2,
      speed: Math.random() * 0.002 + 0.001
    }));
    setBubbles(newBubbles);

  }, [selectedFish, selectedPlants, fishDB, plantDB, mode]);

  /************ Enhanced Animation Loop ************/
  useEffect(() => {
    if (mode !== '2d' || speed === 0) return;
    
    const interval = setInterval(() => {
      setFrame(f => f + 1);
      
      // Update fish positions and animations
      setFishStates(currentFish => 
        currentFish.map(fish => {
          let newX = fish.x + fish.vx;
          let newY = fish.y + fish.vy;
          let newVx = fish.vx;
          let newVy = fish.vy;
          let newAngle = fish.angle;

          // Boundary bouncing with more natural turning
          if (newX <= 0.05 || newX >= 0.95) {
            newVx = -newVx * 0.8;
            newAngle = Math.atan2(newVy, newVx);
          }
          if (newY <= 0.15 || newY >= 0.85) {
            newVy = -newVy * 0.8;
            newAngle = Math.atan2(newVy, newVx);
          }

          // Add slight random movement
          newVx += (Math.random() - 0.5) * 0.0001;
          newVy += (Math.random() - 0.5) * 0.0001;

          // Limit speed
          const speed = Math.sqrt(newVx * newVx + newVy * newVy);
          if (speed > 0.003) {
            newVx = (newVx / speed) * 0.003;
            newVy = (newVy / speed) * 0.003;
          }

          return {
            ...fish,
            x: Math.max(0.05, Math.min(0.95, newX)),
            y: Math.max(0.15, Math.min(0.85, newY)),
            vx: newVx,
            vy: newVy,
            angle: newAngle,
            tailPhase: fish.tailPhase + 0.3,
            finPhase: fish.finPhase + 0.2
          };
        })
      );

      // Update bubble positions
      setBubbles(currentBubbles =>
        currentBubbles.map(bubble => ({
          ...bubble,
          y: bubble.y - bubble.speed,
          x: bubble.x + Math.sin(frame * 0.02 + bubble.x * 10) * 0.0005,
          ...(bubble.y < 0.1 && {
            y: 0.9,
            x: Math.random()
          })
        }))
      );

    }, 120 - speed);

    return () => clearInterval(interval);
  }, [mode, speed, frame]);

  /************ Enhanced Drawing Function ************/
  const draw = useCallback(() => {
    if (mode !== '2d') return;
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, cv.width, cv.height);

    const pad = 40;
    const aw = cv.width - pad * 2;
    const ah = cv.height - pad * 2;
    const scale = view === 'front'
      ? Math.min(aw / dimensions.length, ah / dimensions.height)
      : Math.min(aw / dimensions.length, ah / dimensions.width);

    const w = dimensions.length * scale;
    const h = view === 'front' ? dimensions.height * scale : dimensions.width * scale;
    const ox = (cv.width - w) / 2;
    const oy = (cv.height - h) / 2;

    // Enhanced background gradient
    const bgGradient = ctx.createLinearGradient(ox, oy, ox, oy + h);
    bgGradient.addColorStop(0, '#87CEEB');
    bgGradient.addColorStop(0.3, '#4682B4');
    bgGradient.addColorStop(1, '#191970');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(ox, oy, w, h);

    // Grid
    if (showGrid) {
      ctx.setLineDash([2, 2]);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= w; x += 20) {
        ctx.beginPath();
        ctx.moveTo(ox + x, oy);
        ctx.lineTo(ox + x, oy + h);
        ctx.stroke();
      }
      for (let y = 0; y <= h; y += 20) {
        ctx.beginPath();
        ctx.moveTo(ox, oy + y);
        ctx.lineTo(ox + w, oy + y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // Enhanced substrate with texture
    if (view === 'front') {
      const substrateHeight = h * 0.12;
      const substrateY = oy + h - substrateHeight;
      
      // Base substrate
      const substrateGrad = ctx.createLinearGradient(ox, substrateY, ox, oy + h);
      substrateGrad.addColorStop(0, '#8D6E63');
      substrateGrad.addColorStop(0.5, '#6D4C41');
      substrateGrad.addColorStop(1, '#5D4037');
      ctx.fillStyle = substrateGrad;
      ctx.fillRect(ox, substrateY, w, substrateHeight);

      // Add gravel texture
      ctx.fillStyle = 'rgba(139, 126, 102, 0.6)';
      for (let i = 0; i < w / 3; i++) {
        const gx = ox + Math.random() * w;
        const gy = substrateY + Math.random() * substrateHeight;
        const size = Math.random() * 2 + 1;
        ctx.beginPath();
        ctx.arc(gx, gy, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Enhanced Plants
    if (showPlants) {
      plantStates.forEach((plant, index) => {
        const px = ox + plant.x * w;
        const plantHeight = (plant.height / 30) * h * 0.6;
        const py = view === 'front' ? oy + h - h * 0.12 - plantHeight : oy + h - plantHeight;
        
        drawEnhancedPlant(ctx, px, py, plantHeight, plant, frame + index);
      });
    }

    // Enhanced bubbles
    if (showBubbles) {
      bubbles.forEach(bubble => {
        const bx = ox + bubble.x * w;
        const by = oy + bubble.y * h;
        
        ctx.save();
        ctx.globalAlpha = 0.7;
        
        // Bubble gradient
        const bubbleGrad = ctx.createRadialGradient(bx, by, 0, bx, by, bubble.size);
        bubbleGrad.addColorStop(0, 'rgba(255,255,255,0.8)');
        bubbleGrad.addColorStop(0.7, 'rgba(173,216,230,0.4)');
        bubbleGrad.addColorStop(1, 'rgba(70,130,180,0.2)');
        
        ctx.fillStyle = bubbleGrad;
        ctx.beginPath();
        ctx.arc(bx, by, bubble.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Bubble highlight
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.beginPath();
        ctx.arc(bx - bubble.size * 0.3, by - bubble.size * 0.3, bubble.size * 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      });
    }

    // Enhanced Fish
    if (showFish) {
      // Sort fish by depth for proper layering
      const sortedFish = [...fishStates].sort((a, b) => a.depth - b.depth);
      
      sortedFish.forEach((fish, index) => {
        const fx = ox + fish.x * w;
        const fy = oy + fish.y * h;
        const fs = Math.max((fish.size / 10) * scale, 12);
        
        drawEnhancedFish(ctx, fx, fy, fs, fish);
      });
    }

    // Water surface effect
    if (view === 'front' && showLighting) {
      const waterY = oy + h * 0.15;
      ctx.strokeStyle = rgba(255, 255, 255, 0.3);
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.moveTo(ox, waterY);
      ctx.lineTo(ox + w, waterY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Light rays
      ctx.save();
      ctx.globalAlpha = 0.1;
      for (let i = 0; i < 5; i++) {
        const rayX = ox + (i / 4) * w;
        const rayGrad = ctx.createLinearGradient(rayX, waterY, rayX, oy + h);
        rayGrad.addColorStop(0, 'rgba(255,255,255,0.5)');
        rayGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = rayGrad;
        ctx.fillRect(rayX - 5, waterY, 10, h - h * 0.15);
      }
      ctx.restore();
    }

    // Glass frame with reflections
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#2C3E50';
    ctx.strokeRect(ox - 2, oy - 2, w + 4, h + 4);

    // Glass reflection effect
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = 'white';
    ctx.fillRect(ox, oy, w * 0.1, h);
    ctx.restore();

    // Dimensions labels
    ctx.fillStyle = '#34495E';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${dimensions.length} cm`, ox + w / 2, oy + h + 25);
    
    ctx.save();
    ctx.translate(ox + w + 25, oy + h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(
      `${view === 'front' ? dimensions.height : dimensions.width} cm`,
      0, 0
    );
    ctx.restore();

  }, [mode, view, showGrid, showFish, showPlants, showBubbles, showLighting, fishStates, plantStates, bubbles, frame, dimensions]);

  // Enhanced fish drawing function
  const drawEnhancedFish = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, fish: FishState) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(fish.angle);

    // Fish body shadow
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(2, 2, size * 0.8, size * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Main body gradient
    const bodyGrad = ctx.createRadialGradient(0, -size * 0.2, 0, 0, 0, size);
    const baseColor = fish.color;
    bodyGrad.addColorStop(0, lightenColor(baseColor, 40));
    bodyGrad.addColorStop(0.7, baseColor);
    bodyGrad.addColorStop(1, darkenColor(baseColor, 20));
    
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.8, size * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body outline
    ctx.strokeStyle = darkenColor(baseColor, 30);
    ctx.lineWidth = 1;
    ctx.stroke();

    // Animated tail
    const tailWave = Math.sin(fish.tailPhase) * 0.3;
    ctx.fillStyle = fish.color;
    ctx.beginPath();
    ctx.moveTo(-size * 0.8, 0);
    ctx.quadraticCurveTo(
      -size * 1.3,
      -size * 0.4 + tailWave * size * 0.3,
      -size * 1.1,
      -size * 0.1 + tailWave * size * 0.2
    );
    ctx.quadraticCurveTo(
      -size * 1.3,
      size * 0.4 + tailWave * size * 0.3,
      -size * 0.8,
      0
    );
    ctx.fill();
    ctx.stroke();

    // Dorsal fin
    const dorsalWave = Math.sin(fish.finPhase) * 0.2;
    ctx.beginPath();
    ctx.moveTo(-size * 0.2, -size * 0.5);
    ctx.quadraticCurveTo(
      size * 0.1,
      -size * 0.8 + dorsalWave * size * 0.2,
      size * 0.4,
      -size * 0.5
    );
    ctx.lineTo(size * 0.2, -size * 0.5);
    ctx.fill();

    // Pectoral fins
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = lightenColor(fish.color, 20);
    
    // Left fin
    ctx.beginPath();
    ctx.ellipse(-size * 0.1, size * 0.3, size * 0.25, size * 0.15, Math.PI * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Right fin
    ctx.beginPath();
    ctx.ellipse(-size * 0.1, -size * 0.3, size * 0.25, size * 0.15, -Math.PI * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(size * 0.3, -size * 0.2, size * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Pupil
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(size * 0.35, -size * 0.2, size * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Eye highlight
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(size * 0.38, -size * 0.25, size * 0.03, 0, Math.PI * 2);
    ctx.fill();

    // Scales pattern
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = darkenColor(fish.color, 15);
    ctx.lineWidth = 0.5;
    for (let i = -2; i < 3; i++) {
      for (let j = -1; j < 2; j++) {
        ctx.beginPath();
        ctx.arc(i * size * 0.15, j * size * 0.2, size * 0.08, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();

    ctx.restore();
  };

  // Enhanced plant drawing function
  const drawEnhancedPlant = (ctx: CanvasRenderingContext2D, x: number, y: number, height: number, plant: PlantState, animFrame: number) => {
    const sway = Math.sin(animFrame * 0.02 + plant.swayPhase) * 5;
    
    ctx.save();
    ctx.translate(x, y + height);

    if (plant.type === 'tall') {
      // Tall plant with single stem
      ctx.save();
      ctx.rotate(sway * 0.01);
      
      // Stem
      const stemGrad = ctx.createLinearGradient(0, 0, 0, -height);
      stemGrad.addColorStop(0, darkenColor(plant.color, 20));
      stemGrad.addColorStop(1, plant.color);
      ctx.fillStyle = stemGrad;
      ctx.fillRect(-2, -height, 4, height);

      // Leaves along stem
      for (let i = 1; i <= plant.leafCount; i++) {
        const leafY = -(height * i) / plant.leafCount;
        const leafSize = (plant.leafCount - i + 1) * 3;
        const leafSway = Math.sin(animFrame * 0.03 + i) * 3;
        
        // Left leaf
        ctx.save();
        ctx.translate(-2, leafY);
        ctx.rotate(-0.5 + leafSway * 0.02);
        ctx.fillStyle = plant.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, leafSize, leafSize * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Right leaf
        ctx.save();
        ctx.translate(2, leafY);
        ctx.rotate(0.5 + leafSway * 0.02);
        ctx.fillStyle = lightenColor(plant.color, 10);
        ctx.beginPath();
        ctx.ellipse(0, 0, leafSize, leafSize * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();

    } else if (plant.type === 'bushy') {
      // Bushy plant with multiple stems
      for (let stem = 0; stem < 3; stem++) {
        const stemX = (stem - 1) * 4;
        const stemHeight = height * (0.7 + Math.random() * 0.3);
        const stemSway = Math.sin(animFrame * 0.02 + stem + plant.swayPhase) * 3;
        
        ctx.save();
        ctx.translate(stemX, 0);
        ctx.rotate(stemSway * 0.01);
        
        // Stem
        ctx.fillStyle = darkenColor(plant.color, 15);
        ctx.fillRect(-1, -stemHeight, 2, stemHeight);

        // Bushy leaves at top
        for (let leaf = 0; leaf < 5; leaf++) {
          const leafAngle = (leaf / 5) * Math.PI * 2;
          const leafDist = 8 + Math.random() * 4;
          const leafX = Math.cos(leafAngle) * leafDist;
          const leafY = Math.sin(leafAngle) * leafDist - stemHeight * 0.8;
          
          ctx.fillStyle = leaf % 2 === 0 ? plant.color : lightenColor(plant.color, 15);
          ctx.beginPath();
          ctx.ellipse(leafX, leafY, 4, 7, leafAngle, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

    } else { // grass type
      // Grass-like plant with thin blades
      for (let blade = 0; blade < 8; blade++) {
        const bladeX = (blade - 4) * 2;
        const bladeHeight = height * (0.8 + Math.random() * 0.4);
        const bladeSway = Math.sin(animFrame * 0.04 + blade + plant.swayPhase) * 8;
        
        ctx.save();
        ctx.translate(bladeX, 0);
        
        // Curved grass blade
        ctx.strokeStyle = blade % 2 === 0 ? plant.color : lightenColor(plant.color, 20);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(
          bladeSway * 0.5,
          -bladeHeight * 0.5,
          bladeSway,
          -bladeHeight
        );
        ctx.stroke();
        
        ctx.restore();
      }
    }

    ctx.restore();
  };

  // Color helper functions
  const lightenColor = (color: string, percent: number): string => {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + percent);
    const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + percent);
    const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + percent);
    return `rgb(${r},${g},${b})`;
  };

  const darkenColor = (color: string, percent: number): string => {
    return lightenColor(color, -percent);
  };

  const rgba = (r: number, g: number, b: number, a: number): string => {
    return `rgba(${r},${g},${b},${a})`;
  };

  // Neuzeichnen im 2D-Modus
  useEffect(() => {
    if (mode === '2d') draw();
  }, [draw, mode]);

  // Color functions
  const getFishColor = useCallback((fishId: string, index: number): string => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
      '#FF9FF3', '#A8E6CF', '#FFD93D', '#74B9FF', '#FD79A8'
    ];
    const hash = (fishId + index).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  }, []);

  const getPlantColor = useCallback((plantId: string, index: number): string => {
    const colors = [
      '#2ECC71', '#27AE60', '#16A085', '#1ABC9C',
      '#52C41A', '#73D13D', '#95DE64', '#B7EB8F'
    ];
    const hash = (plantId + index).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  }, []);

  // Mode switching handler
  const switchMode = (_: any, m: DisplayMode | null) => {
    if (!m || m === mode) return;
    setLoading(true);
    setTimeout(() => {
      setMode(m);
      setLoading(false);
    }, 200);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight="bold">
            Aquarium – {projectName}
          </Typography>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={switchMode}
            size="small"
          >
            <ToggleButton value="2d">
              <View2DIcon sx={{ mr: 1 }} />
              2D
            </ToggleButton>
            <ToggleButton value="3d">
              <View3DIcon sx={{ mr: 1 }} />
              3D
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Paper>

      {/* Loading overlay */}
      {loading && (
        <Fade in={loading}>
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            bgcolor="rgba(255,255,255,0.8)"
            zIndex={1000}
          >
            <Box textAlign="center">
              <CircularProgress size={40} />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Ansicht wird geladen …
              </Typography>
            </Box>
          </Box>
        </Fade>
      )}

      {/* Content */}
      {!loading && (
        <Grid container spacing={2} sx={{ flexGrow: 1 }}>
          {mode === '2d' ? (
            <>
              {/* 2D Canvas */}
              <Grid item xs={12} lg={8}>
                <Paper elevation={1} sx={{ height: '70vh', p: 1 }}>
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </Paper>
              </Grid>

              {/* Enhanced 2D Controls */}
              <Grid item xs={12} lg={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      2D Einstellungen
                    </Typography>

                    {/* View Selection */}
                    <ToggleButtonGroup
                      value={view}
                      exclusive
                      onChange={(_, v) => v && setView(v)}
                      size="small"
                      fullWidth
                      sx={{ mb: 2 }}
                    >
                      <ToggleButton value="front">Front</ToggleButton>
                      <ToggleButton value="top">Top</ToggleButton>
                    </ToggleButtonGroup>

                    {/* Display Options */}
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showGrid}
                          onChange={(e) => setShowGrid(e.target.checked)}
                        />
                      }
                      label="Raster"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showFish}
                          onChange={(e) => setShowFish(e.target.checked)}
                        />
                      }
                      label="Fische"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showPlants}
                          onChange={(e) => setShowPlants(e.target.checked)}
                        />
                      }
                      label="Pflanzen"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showBubbles}
                          onChange={(e) => setShowBubbles(e.target.checked)}
                        />
                      }
                      label="Luftblasen"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showLighting}
                          onChange={(e) => setShowLighting(e.target.checked)}
                        />
                      }
                      label="Beleuchtung"
                    />

                    {/* Animation Speed */}
                    <Typography gutterBottom sx={{ mt: 2 }}>
                      Animation
                    </Typography>
                    <Slider
                      value={speed}
                      onChange={(_, v) => setSpeed(v as number)}
                      min={0}
                      max={60}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(v) => `${v}%`}
                    />

                    {/* Statistics */}
                    <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                      Statistiken
                    </Typography>
                    <Chip
                      label={`${selectedFish.reduce((s, f) => s + f.quantity, 0)} Fische`}
                      sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip
                      label={`${selectedPlants.reduce((s, p) => s + p.quantity, 0)} Pflanzen`}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </>
          ) : (
            /* 3D Component */
            <Grid item xs={12}>
              <Aquarium3DViewer />
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default AquariumViewer;
