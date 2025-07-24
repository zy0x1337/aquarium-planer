import React, { Suspense, useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  Html,
  useProgress,
  Stats,
  useTexture,
  Sparkles,
  Text
} from '@react-three/drei';
import * as THREE from 'three';
import {
  Box as MuiBox,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Switch,
  FormControlLabel,
  Slider,
  Paper,
  IconButton,
  Tooltip,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Alert,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Badge,
  Divider,
  Avatar,
  AvatarGroup,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  Thermostat as TempIcon,
  WaterDrop as WaterIcon,
  LightMode as LightIcon,
  FilterAlt as FilterIcon,
  BubbleChart as BubbleIcon,
  Waves as WavesIcon,
  Psychology as PsychologyIcon,
  EmojiEvents as TrophyIcon,
  Favorite as HeartIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  School as SchoolIcon,
  LocalFlorist as PlantIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  FastForward as FastForwardIcon,
  SkipPrevious as RewindIcon,
  Restaurant as FeedIcon,
  CleaningServices as CleanIcon,
  Opacity as WaterChangeIcon,
  SentimentVeryDissatisfied as StressedIcon,
  SentimentVerySatisfied as HappyIcon,
  SentimentNeutral as NeutralIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useAppSelector } from '../../hooks/redux';
import DatabaseService from '../../services/DatabaseService';
import { Fish, Plant } from '../../types/aquarium';

// === ENHANCED INTERFACES ===
interface AquariumMood {
  overall: 'thriving' | 'good' | 'attention' | 'critical';
  fishHappiness: number;
  plantHealth: number;
  waterQuality: number;
  ecosystemBalance: number;
}

interface PredictiveScenario {
  timeframe: '1_day' | '3_days' | '7_days' | '1_month';
  scenario: 'maintain' | 'neglect' | 'optimize';
  outcomes: {
    fishHealth: number;
    plantGrowth: number;
    waterQuality: number;
    problems: string[];
    recommendations: string[];
  };
}

interface FishSocialNetwork {
  species: string;
  schoolingPartners: string[];
  territorialConflicts: string[];
  compatibilityScore: number;
  stressLevel: number;
  socialBehavior: 'schooling' | 'territorial' | 'peaceful' | 'aggressive';
}

interface PlantGrowthStage {
  week: number;
  height: number;
  spread: number;
  healthLevel: number;
  maintenanceNeeded: string[];
  shadingEffect: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  unlocked: boolean;
  category: 'breeding' | 'maintenance' | 'ecology' | 'rare_species';
}

interface Fish3DProps {
  position: [number, number, number];
  size: number;
  color: string;
  species: string;
  swimming?: boolean;
  speed?: number;
  id: string;
  aquariumBounds: {
    length: number;
    width: number;
    height: number;
  };
  environmentalFactors: {
    waterFlow: number;
    temperature: number;
    ph: number;
    oxygenLevel: number;
    feedingTime: boolean;
    lightIntensity: number;
  };
  socialNetwork: FishSocialNetwork;
  thoughtBubble?: string;
  emotionalState: 'happy' | 'neutral' | 'stressed' | 'excited';
}

interface Plant3DProps {
  position: [number, number, number];
  height: number;
  color: string;
  species: string;
  swaying?: boolean;
  id: string;
  environmentalFactors: {
    waterFlow: number;
    lightIntensity: number;
    co2Level: number;
    nutrients: number;
  };
  growthStage: PlantGrowthStage;
  healthIndicators: {
    photosynthesis: number;
    nutrientUptake: number;
    growthRate: number;
  };
}

interface ExtendedFish extends Fish {
  temperament?: 'peaceful' | 'semi-aggressive' | 'aggressive';
  schooling?: boolean;
}

// Erweiterte Plant Interface  
interface ExtendedPlant extends Plant {
  growthRate?: 'slow' | 'medium' | 'fast';
  lightRequirement?: 'low' | 'medium' | 'high';
}

// === INTELLIGENT MOOD SYSTEM ===
const calculateAquariumMood = (
  temperature: number,
  ph: number,
  oxygenLevel: number,
  clarity: number,
  fishCount: number,
  plantCount: number,
  filterStrength: number
): AquariumMood => {
  // Water quality score
  const tempScore = temperature >= 22 && temperature <= 26 ? 1 : 0.5;
  const phScore = ph >= 6.5 && ph <= 7.5 ? 1 : 0.5;
  const oxygenScore = oxygenLevel >= 0.7 ? 1 : oxygenLevel / 0.7;
  const clarityScore = clarity >= 0.8 ? 1 : clarity;
  const waterQuality = (tempScore + phScore + oxygenScore + clarityScore) / 4;

  // Fish happiness (affected by water quality and overcrowding)
  const overcrowdingPenalty = fishCount > 20 ? 0.8 : 1.0;
  const fishHappiness = waterQuality * overcrowdingPenalty;

  // Plant health (affected by light, CO2, nutrients)
  const plantHealth = Math.min(1.0, (clarity + oxygenLevel) / 2);

  // Ecosystem balance
  const fishPlantRatio = plantCount > 0 ? Math.min(1, fishCount / plantCount / 2) : 0.5;
  const ecosystemBalance = (fishPlantRatio + waterQuality + plantHealth) / 3;

  // Overall mood calculation
  const overallScore = (fishHappiness + plantHealth + waterQuality + ecosystemBalance) / 4;
  
  let overall: AquariumMood['overall'];
  if (overallScore >= 0.85) overall = 'thriving';
  else if (overallScore >= 0.7) overall = 'good';
  else if (overallScore >= 0.5) overall = 'attention';
  else overall = 'critical';

  return {
    overall,
    fishHappiness,
    plantHealth,
    waterQuality,
    ecosystemBalance
  };
};

// === PREDICTIVE ANALYSIS SYSTEM ===
const generatePredictiveScenarios = (
  currentConditions: any,
  scenario: PredictiveScenario['scenario'],
  timeframe: PredictiveScenario['timeframe']
): PredictiveScenario['outcomes'] => {
  const timeMultiplier = {
    '1_day': 1,
    '3_days': 3,
    '7_days': 7,
    '1_month': 30
  }[timeframe];

  let fishHealth = currentConditions.fishHappiness;
  let plantGrowth = currentConditions.plantHealth;
  let waterQuality = currentConditions.waterQuality;
  const problems: string[] = [];
  const recommendations: string[] = [];

  switch (scenario) {
    case 'maintain':
      // Gradual improvement with maintenance
      fishHealth = Math.min(1.0, fishHealth + 0.1 * (timeMultiplier / 7));
      plantGrowth = Math.min(1.0, plantGrowth + 0.15 * (timeMultiplier / 7));
      waterQuality = Math.max(0.8, waterQuality);
      recommendations.push('Continue current care routine');
      break;

    case 'neglect':
      // Degradation over time
      fishHealth = Math.max(0.2, fishHealth - 0.2 * (timeMultiplier / 7));
      plantGrowth = Math.max(0.3, plantGrowth - 0.1 * (timeMultiplier / 7));
      waterQuality = Math.max(0.3, waterQuality - 0.15 * (timeMultiplier / 7));
      
      if (timeMultiplier >= 3) problems.push('Algae bloom risk');
      if (timeMultiplier >= 7) problems.push('Fish stress symptoms');
      recommendations.push('Schedule water change');
      break;

    case 'optimize':
      // Enhanced care results
      fishHealth = Math.min(1.0, fishHealth + 0.2 * (timeMultiplier / 7));
      plantGrowth = Math.min(1.0, plantGrowth + 0.25 * (timeMultiplier / 7));
      waterQuality = Math.min(1.0, waterQuality + 0.1 * (timeMultiplier / 7));
      recommendations.push('Optimal breeding conditions achieved');
      break;
  }

  return {
    fishHealth,
    plantGrowth,
    waterQuality,
    problems,
    recommendations
  };
};

// === ENHANCED FISH WITH SOCIAL BEHAVIOR ===
const EnhancedIntelligentFish3D: React.FC<Fish3DProps> = ({
  position,
  size,
  color,
  species,
  swimming = true,
  speed = 1,
  id,
  aquariumBounds,
  environmentalFactors,
  socialNetwork,
  thoughtBubble,
  emotionalState
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const [localPosition, setLocalPosition] = useState<[number, number, number]>(position);
  const [targetPosition, setTargetPosition] = useState<[number, number, number]>(position);
  const [socialRadius, setSocialRadius] = useState(0);

  const bounds = {
    x: aquariumBounds.length / 20,
    y: aquariumBounds.height / 20,
    z: aquariumBounds.width / 20
  };

  const behavior = useMemo(() => {
    const { temperature, ph, oxygenLevel, feedingTime, lightIntensity } = environmentalFactors;
    
    let activityLevel = 1.0;
    let stressLevel = socialNetwork.stressLevel;
    
    // Environmental stress factors
    if (temperature < 20 || temperature > 28) stressLevel += 0.3;
    if (ph < 6.5 || ph > 7.5) stressLevel += 0.2;
    if (oxygenLevel < 0.7) stressLevel += 0.4;
    
    // Social behavior modifications
    if (socialNetwork.socialBehavior === 'schooling') {
      activityLevel *= 1.2;
      stressLevel *= 0.8; // Schooling reduces stress
    }
    
    return {
      activityLevel: Math.max(0.1, Math.min(2.0, activityLevel)),
      stressLevel: Math.max(0.0, Math.min(1.0, stressLevel)),
      schoolingBehavior: socialNetwork.socialBehavior === 'schooling',
      territorialBehavior: socialNetwork.socialBehavior === 'territorial'
    };
  }, [species, environmentalFactors, socialNetwork]);

  useFrame((state, delta) => {
    if (!meshRef.current || !swimming) return;

    const time = state.clock.getElapsedTime();
    const effectiveSpeed = speed * behavior.activityLevel;

    // Social behavior animation
    if (behavior.schoolingBehavior) {
      setSocialRadius(0.8 + Math.sin(time * 2) * 0.2);
    } else if (behavior.territorialBehavior) {
      setSocialRadius(1.5 + Math.sin(time * 0.5) * 0.3);
    }

    // Enhanced movement with emotional states
    let emotionalMovement = 0;
    switch (emotionalState) {
      case 'excited':
        emotionalMovement = Math.sin(time * 12) * 0.08;
        break;
      case 'stressed':
        emotionalMovement = Math.sin(time * 18) * 0.05;
        break;
      case 'happy':
        emotionalMovement = Math.sin(time * 6) * 0.03;
        break;
    }

    // Update position with social and emotional factors
    const swimAnimation = Math.sin(time * 8 * effectiveSpeed) * 0.05 + emotionalMovement;
    
    const [targetX, targetY, targetZ] = targetPosition;
    const [currentX, currentY, currentZ] = localPosition;
    const dx = targetX - currentX;
    const dy = targetY - currentY;
    const dz = targetZ - currentZ;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (distance > 0.1) {
      const moveSpeed = effectiveSpeed * delta * 2;
      const newX = currentX + (dx / distance) * moveSpeed;
      const newY = currentY + (dy / distance) * moveSpeed + swimAnimation;
      const newZ = currentZ + (dz / distance) * moveSpeed;

      const boundedPosition: [number, number, number] = [
        Math.max(-bounds.x * 0.9, Math.min(bounds.x * 0.9, newX)),
        Math.max(0.2, Math.min(bounds.y - 0.2, newY)),
        Math.max(-bounds.z * 0.9, Math.min(bounds.z * 0.9, newZ))
      ];

      setLocalPosition(boundedPosition);
      meshRef.current.position.set(...boundedPosition);
      
      if (distance > 0.01) {
        meshRef.current.lookAt(targetX, targetY, targetZ);
      }
    } else if (Math.random() < 0.01 * behavior.activityLevel) {
      // Set new target based on social behavior
      setTargetPosition([
        (Math.random() - 0.5) * bounds.x * 1.6,
        Math.random() * (bounds.y - 0.4) + 0.2,
        (Math.random() - 0.5) * bounds.z * 1.6
      ]);
    }
  });

  const scaledSize = size / 100;
  const emotionalColor = useMemo(() => {
    const baseColor = new THREE.Color(color);
    switch (emotionalState) {
      case 'happy':
        return baseColor.multiplyScalar(1.2);
      case 'excited':
        return baseColor.lerp(new THREE.Color('#FFD700'), 0.3);
      case 'stressed':
        return baseColor.multiplyScalar(0.7);
      default:
        return baseColor;
    }
  }, [color, emotionalState]);

  return (
    <group ref={meshRef} position={position}>
      {/* Enhanced fish body with emotional coloring */}
      <mesh>
        <sphereGeometry args={[scaledSize, 12, 8]} />
        <meshStandardMaterial
          color={emotionalColor}
          metalness={0.1}
          roughness={0.8}
          transparent={behavior.stressLevel > 0.7}
          opacity={behavior.stressLevel > 0.7 ? 0.8 : 1.0}
        />
      </mesh>

      {/* Social behavior indicators */}
      {socialNetwork.socialBehavior === 'schooling' && (
        <mesh>
          <ringGeometry args={[socialRadius * 0.8, socialRadius * 1.0, 16]} />
          <meshBasicMaterial
            color="#4FC3F7"
            transparent
            opacity={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {socialNetwork.socialBehavior === 'territorial' && (
        <mesh>
          <ringGeometry args={[socialRadius * 0.9, socialRadius * 1.1, 8]} />
          <meshBasicMaterial
            color="#FF6B6B"
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Thought bubble */}
      {thoughtBubble && (
        <Html distanceFactor={10} position={[0, scaledSize * 2, 0]}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            whiteSpace: 'nowrap'
          }}>
            {thoughtBubble}
          </div>
        </Html>
      )}

      {/* Emotional state indicator */}
      <Html distanceFactor={15} position={[scaledSize * 1.5, scaledSize, 0]}>
        <div style={{ fontSize: '16px' }}>
          {emotionalState === 'happy' && 'ðŸ˜Š'}
          {emotionalState === 'excited' && 'ðŸ¤©'}
          {emotionalState === 'stressed' && 'ðŸ˜°'}
          {emotionalState === 'neutral' && 'ðŸ˜'}
        </div>
      </Html>
    </group>
  );
};

// === PLANT GROWTH TIMELINE COMPONENT ===
const EnhancedPlantWithGrowth: React.FC<Plant3DProps> = ({
  position,
  height,
  color,
  species,
  swaying = true,
  id,
  environmentalFactors,
  growthStage,
  healthIndicators
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const scaledHeight = (height / 25) * growthStage.height;

  useFrame((state) => {
    if (!groupRef.current || !swaying) return;

    const time = state.clock.getElapsedTime();
    const flowIntensity = 0.3 + environmentalFactors.waterFlow * 0.7;
    const healthFactor = healthIndicators.growthRate;

    const sway = Math.sin(time * 0.5 * flowIntensity + position[0] * 0.1) * 0.15 * flowIntensity * healthFactor;
    const secondarySway = Math.sin(time * 0.3 * flowIntensity + position[2] * 0.1) * 0.08 * flowIntensity * healthFactor;

    groupRef.current.rotation.z = sway;
    groupRef.current.rotation.x = secondarySway;
  });

  const leafCount = Math.max(3, Math.floor(scaledHeight * 6 * healthIndicators.growthRate));
  const plantColor = new THREE.Color(color).multiplyScalar(0.5 + healthIndicators.photosynthesis * 0.5);

  return (
    <group ref={groupRef} position={position}>
      {/* Enhanced stem with growth rings */}
      <mesh>
        <cylinderGeometry args={[0.02, 0.04, scaledHeight, 8]} />
        <meshStandardMaterial color={plantColor} />
      </mesh>

      {/* Growth stage indicator */}
      {Array.from({ length: Math.floor(growthStage.week / 4) }, (_, i) => (
        <mesh key={i} position={[0, (i + 1) * (scaledHeight / 6), 0]}>
          <torusGeometry args={[0.06, 0.005, 4, 8]} />
          <meshBasicMaterial color="#8BC34A" transparent opacity={0.6} />
        </mesh>
      ))}

      {/* Enhanced leaves */}
      {Array.from({ length: leafCount }, (_, i) => {
        const leafHeight = (i / leafCount) * scaledHeight * 0.9 + scaledHeight * 0.1;
        const leafSize = (1 - i / leafCount * 0.4) * 0.12 * healthIndicators.growthRate;
        const leafAngle = (i * 137.5) * (Math.PI / 180);

        return (
          <group key={i} position={[0, leafHeight, 0]} rotation={[0, leafAngle, 0]}>
            <mesh position={[leafSize * 0.5, 0, 0]}>
              <planeGeometry args={[leafSize, leafSize * 0.6]} />
              <meshStandardMaterial
                color={plantColor}
                side={THREE.DoubleSide}
                transparent
                opacity={0.8}
              />
            </mesh>
          </group>
        );
      })}

      {/* Photosynthesis visualization */}
      {healthIndicators.photosynthesis > 0.7 && (
        <Sparkles
          count={5}
          scale={[scaledHeight * 2, scaledHeight * 2, scaledHeight * 2]}
          size={2}
          speed={0.3}
          color="#90EE90"
        />
      )}

      {/* Health status */}
      <Html distanceFactor={12} position={[0, scaledHeight + 0.2, 0]}>
        <div style={{
          background: healthIndicators.growthRate > 0.8 ? 'rgba(76, 175, 80, 0.8)' : 
                      healthIndicators.growthRate > 0.5 ? 'rgba(255, 193, 7, 0.8)' : 'rgba(244, 67, 54, 0.8)',
          color: 'white',
          padding: '2px 6px',
          borderRadius: '8px',
          fontSize: '10px',
          textAlign: 'center'
        }}>
          Week {growthStage.week}
        </div>
      </Html>
    </group>
  );
};

// === MOOD VISUALIZATION COMPONENT ===
const AquariumMoodIndicator: React.FC<{ mood: AquariumMood }> = ({ mood }) => {
  const getMoodIcon = () => {
    switch (mood.overall) {
      case 'thriving': return <HappyIcon sx={{ color: '#4CAF50', fontSize: 40 }} />;
      case 'good': return <HappyIcon sx={{ color: '#8BC34A', fontSize: 40 }} />;
      case 'attention': return <NeutralIcon sx={{ color: '#FF9800', fontSize: 40 }} />;
      case 'critical': return <StressedIcon sx={{ color: '#F44336', fontSize: 40 }} />;
    }
  };

  const getMoodColor = () => {
    switch (mood.overall) {
      case 'thriving': return '#4CAF50';
      case 'good': return '#8BC34A';
      case 'attention': return '#FF9800';
      case 'critical': return '#F44336';
    }
  };

  const getMoodDescription = () => {
    switch (mood.overall) {
      case 'thriving': return 'Your aquarium is a thriving ecosystem! Fish are schooling beautifully and plants are growing vigorously.';
      case 'good': return 'Everything looks healthy! Your fish are active and plants are showing good growth.';
      case 'attention': return 'Some parameters need attention. Check water quality and consider maintenance.';
      case 'critical': return 'Immediate action needed! Fish are showing stress signs and water quality is poor.';
    }
  };

  return (
    <Card sx={{ mb: 2, background: `linear-gradient(135deg, ${getMoodColor()}15, ${getMoodColor()}05)` }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          {getMoodIcon()}
          <MuiBox sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ color: getMoodColor(), fontWeight: 'bold' }}>
              Aquarium Status: {mood.overall.charAt(0).toUpperCase() + mood.overall.slice(1)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {getMoodDescription()}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Chip
                size="small"
                label={`Fish: ${Math.round(mood.fishHappiness * 100)}%`}
                color={mood.fishHappiness > 0.7 ? 'success' : mood.fishHappiness > 0.5 ? 'warning' : 'error'}
              />
              <Chip
                size="small"
                label={`Plants: ${Math.round(mood.plantHealth * 100)}%`}
                color={mood.plantHealth > 0.7 ? 'success' : mood.plantHealth > 0.5 ? 'warning' : 'error'}
              />
              <Chip
                size="small"
                label={`Water: ${Math.round(mood.waterQuality * 100)}%`}
                color={mood.waterQuality > 0.7 ? 'success' : mood.waterQuality > 0.5 ? 'warning' : 'error'}
              />
            </Stack>
          </MuiBox>
        </Stack>
      </CardContent>
    </Card>
  );
};

// === PREDICTIVE TIMELINE COMPONENT ===
const PredictiveTimeline: React.FC<{
  currentConditions: any;
  onScenarioChange: (scenario: PredictiveScenario) => void;
}> = ({ currentConditions, onScenarioChange }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<PredictiveScenario['timeframe']>('7_days');
  const [selectedScenario, setSelectedScenario] = useState<PredictiveScenario['scenario']>('maintain');

  const scenarios = useMemo(() => {
    return {
      maintain: generatePredictiveScenarios(currentConditions, 'maintain', selectedTimeframe),
      neglect: generatePredictiveScenarios(currentConditions, 'neglect', selectedTimeframe),
      optimize: generatePredictiveScenarios(currentConditions, 'optimize', selectedTimeframe)
    };
  }, [currentConditions, selectedTimeframe]);

  const timeframeLabels = {
    '1_day': '24 Hours',
    '3_days': '3 Days',
    '7_days': '1 Week',
    '1_month': '1 Month'
  };

  const scenarioLabels = {
    maintain: 'Continue Current Care',
    neglect: 'Skip Maintenance',
    optimize: 'Enhanced Care'
  };

  const getTimelineColor = (scenario: PredictiveScenario['scenario']) => {
    switch (scenario) {
      case 'maintain': return '#2196F3';
      case 'neglect': return '#FF5722';
      case 'optimize': return '#4CAF50';
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <TimelineIcon />
          <Typography variant="h6">Predictive Analysis</Typography>
        </Stack>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Timeframe</InputLabel>
              <Select
                value={selectedTimeframe}
                label="Timeframe"
                onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              >
                {Object.entries(timeframeLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Scenario</InputLabel>
              <Select
                value={selectedScenario}
                label="Scenario"
                onChange={(e) => setSelectedScenario(e.target.value as any)}
              >
                {Object.entries(scenarioLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <List>
          {Object.entries(scenarios).map(([scenario, outcomes], index) => (
            <ListItem key={scenario} sx={{ 
              border: selectedScenario === scenario ? '2px solid #1976d2' : '1px solid #e0e0e0',
              borderRadius: 2,
              mb: 1,
              bgcolor: selectedScenario === scenario ? '#f5f5f5' : 'transparent'
            }}>
              <ListItemIcon>
                <MuiBox
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: getTimelineColor(scenario as any),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}
                >
                  {scenario === 'maintain' && <PlayIcon />}
                  {scenario === 'neglect' && <WarningIcon />}
                  {scenario === 'optimize' && <TrophyIcon />}
                </MuiBox>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {scenarioLabels[scenario as keyof typeof scenarioLabels]}
                  </Typography>
                }
                secondary={
                  <MuiBox>
                    <Stack direction="row" spacing={1} sx={{ my: 1 }}>
                      <Chip
                        size="small"
                        label={`Fish: ${Math.round(outcomes.fishHealth * 100)}%`}
                        color={outcomes.fishHealth > 0.7 ? 'success' : outcomes.fishHealth > 0.5 ? 'warning' : 'error'}
                      />
                      <Chip
                        size="small"
                        label={`Plants: ${Math.round(outcomes.plantGrowth * 100)}%`}
                        color={outcomes.plantGrowth > 0.7 ? 'success' : outcomes.plantGrowth > 0.5 ? 'warning' : 'error'}
                      />
                    </Stack>
                    {outcomes.problems.length > 0 && (
                      <Alert severity="warning" sx={{ mt: 1, fontSize: '0.75rem' }}>
                        {outcomes.problems.join(', ')}
                      </Alert>
                    )}
                    {outcomes.recommendations.length > 0 && (
                      <Alert severity="info" sx={{ mt: 1, fontSize: '0.75rem' }}>
                        {outcomes.recommendations.join(', ')}
                      </Alert>
                    )}
                  </MuiBox>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

// === SPECIES COMPATIBILITY MATRIX ===
const SpeciesCompatibilityMatrix: React.FC<{
  fishData: Fish[];
  selectedFish: any[];
}> = ({ fishData, selectedFish }) => {
  const compatibilityMatrix = useMemo(() => {
    return selectedFish.map((fish1, i) => 
      selectedFish.map((fish2, j) => {
        if (i === j) return { compatibility: 1, relationship: 'self' };
        
        const fish1Data = fishData.find(f => f.id === fish1.id) as ExtendedFish;
        const fish2Data = fishData.find(f => f.id === fish2.id) as ExtendedFish;
        
        if (!fish1Data || !fish2Data) return { compatibility: 0.5, relationship: 'unknown' };
        
        // Simple compatibility logic based on fish characteristics
        let compatibility = 0.8;
        let relationship = 'neutral';
        
        // Size compatibility
        const sizeDiff = Math.abs(fish1Data.size.max - fish2Data.size.max);
        if (sizeDiff > 5) compatibility -= 0.2;
        
        // Temperament compatibility (safe defaults)
        const fish1Temperament = fish1Data.temperament || 'peaceful';
        const fish2Temperament = fish2Data.temperament || 'peaceful';
        
        if (fish1Temperament === 'aggressive' || fish2Temperament === 'aggressive') {
          compatibility -= 0.4;
          relationship = 'territorial';
        }
        
        // Schooling fish are more compatible with same species
        const fish1Schooling = fish1Data.schooling || false;
        const fish2Schooling = fish2Data.schooling || false;
        
        if (fish1Schooling && fish2Schooling && fish1.id === fish2.id) {
          compatibility = 1.0;
          relationship = 'schooling';
        }
        
        return { compatibility: Math.max(0.1, compatibility), relationship };
      })
    );
  }, [fishData, selectedFish]);

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <SchoolIcon />
          <Typography variant="h6">Species Compatibility</Typography>
        </Stack>
        
        <Grid container spacing={1}>
          {compatibilityMatrix.map((row, i) => (
            <Grid item xs={12} key={i}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" sx={{ minWidth: 80, fontSize: '0.75rem' }}>
                  {fishData.find(f => f.id === selectedFish[i]?.id)?.name || 'Unknown'}
                </Typography>
                {row.map((cell, j) => (
                  <Tooltip
                    key={j}
                    title={`Compatibility: ${Math.round(cell.compatibility * 100)}% (${cell.relationship})`}
                  >
                    <MuiBox
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: cell.compatibility > 0.8 ? '#4CAF50' :
                                cell.compatibility > 0.6 ? '#FF9800' : '#F44336',
                        cursor: 'pointer'
                      }}
                    />
                  </Tooltip>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>
        
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <MuiBox sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4CAF50' }} />
            <Typography variant="caption">Excellent</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <MuiBox sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FF9800' }} />
            <Typography variant="caption">Fair</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <MuiBox sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#F44336' }} />
            <Typography variant="caption">Poor</Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

// === PLANT GROWTH SIMULATOR ===
const PlantGrowthSimulator: React.FC<{
  plantData: Plant[];
  selectedPlants: any[];
}> = ({ plantData, selectedPlants }) => {
  const [selectedWeek, setSelectedWeek] = useState(12);
  const maxWeeks = 52;

  const simulateGrowthAtWeek = (plantId: string, week: number): PlantGrowthStage => {
    const plantInfo = plantData.find(p => p.id === plantId);
    const baseHeight = plantInfo ? (plantInfo.size.height.min + plantInfo.size.height.max) / 2 : 15;
    
    // Growth curve - rapid initial growth, then slower
    const growthFactor = 1 - Math.exp(-week / 20);
    const height = baseHeight * (0.3 + growthFactor * 0.7);
    const spread = height * 0.6;
    
    // Health decreases if not maintained
    const healthLevel = week < 4 ? 1.0 : Math.max(0.6, 1.0 - (week - 4) * 0.01);
    
    const maintenanceNeeded = [];
    if (week > 8 && week % 4 === 0) maintenanceNeeded.push('Pruning recommended');
    if (week > 16 && week % 8 === 0) maintenanceNeeded.push('Fertilizer needed');
    if (week > 24) maintenanceNeeded.push('Consider propagation');
    
    return {
      week,
      height,
      spread,
      healthLevel,
      maintenanceNeeded,
      shadingEffect: Math.min(spread / 30, 0.8)
    };
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <PlantIcon />
          <Typography variant="h6">Plant Growth Timeline</Typography>
        </Stack>
        
        <MuiBox sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Growth Timeline: Week {selectedWeek} of {maxWeeks}
          </Typography>
          <Slider
            value={selectedWeek}
            onChange={(_, value) => setSelectedWeek(value as number)}
            min={1}
            max={maxWeeks}
            step={1}
            marks={[
              { value: 1, label: 'Week 1' },
              { value: 12, label: '3 Months' },
              { value: 24, label: '6 Months' },
              { value: 52, label: '1 Year' }
            ]}
            valueLabelDisplay="auto"
          />
        </MuiBox>

        {selectedPlants.map((plant, index) => {
          const growthStage = simulateGrowthAtWeek(plant.id, selectedWeek);
          const plantInfo = plantData.find(p => p.id === plant.id);
          
          return (
            <Card key={plant.id} variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">
                    {plantInfo?.name || 'Unknown Plant'}
                  </Typography>
                  <Chip
                    size="small"
                    label={`Health: ${Math.round(growthStage.healthLevel * 100)}%`}
                    color={growthStage.healthLevel > 0.8 ? 'success' : 
                           growthStage.healthLevel > 0.6 ? 'warning' : 'error'}
                  />
                </Stack>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Height</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(growthStage.height / 40) * 100}
                      sx={{ mb: 0.5 }}
                    />
                    <Typography variant="body2">{growthStage.height.toFixed(1)} cm</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Spread</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(growthStage.spread / 25) * 100}
                      sx={{ mb: 0.5 }}
                    />
                    <Typography variant="body2">{growthStage.spread.toFixed(1)} cm</Typography>
                  </Grid>
                </Grid>
                
                {growthStage.maintenanceNeeded.length > 0 && (
                  <Alert severity="info" sx={{ mt: 1, fontSize: '0.75rem' }}>
                    {growthStage.maintenanceNeeded.join(', ')}
                  </Alert>
                )}
                
                {growthStage.shadingEffect > 0.5 && (
                  <Alert severity="warning" sx={{ mt: 1, fontSize: '0.75rem' }}>
                    Plant may shade neighboring plants ({Math.round(growthStage.shadingEffect * 100)}% coverage)
                  </Alert>
                )}
              </CardContent>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
};

// === ACHIEVEMENT SYSTEM ===
const AchievementSystem: React.FC<{
  aquariumHealth: AquariumMood;
  fishCount: number;
  plantCount: number;
  maintenanceStreak: number;
}> = ({ aquariumHealth, fishCount, plantCount, maintenanceStreak }) => {
  const [achievements] = useState<Achievement[]>([
    {
      id: 'first_aquarium',
      title: 'Aquarium Pioneer',
      description: 'Create your first aquarium',
      icon: 'ðŸ ',
      progress: fishCount > 0 || plantCount > 0 ? 1 : 0,
      unlocked: fishCount > 0 || plantCount > 0,
      category: 'ecology'
    },
    {
      id: 'thriving_ecosystem',
      title: 'Ecosystem Master',
      description: 'Maintain a thriving aquarium for 7 days',
      icon: 'ðŸŒŸ',
      progress: aquariumHealth.overall === 'thriving' ? 1 : 0,
      unlocked: aquariumHealth.overall === 'thriving',
      category: 'ecology'
    },
    {
      id: 'fish_whisperer',
      title: 'Fish Whisperer',
      description: 'Keep fish happiness above 80%',
      icon: 'ðŸŸ',
      progress: aquariumHealth.fishHappiness > 0.8 ? 1 : aquariumHealth.fishHappiness,
      unlocked: aquariumHealth.fishHappiness > 0.8,
      category: 'breeding'
    },
    {
      id: 'plant_master',
      title: 'Green Thumb',
      description: 'Achieve 90% plant health',
      icon: 'ðŸŒ±',
      progress: aquariumHealth.plantHealth > 0.9 ? 1 : aquariumHealth.plantHealth,
      unlocked: aquariumHealth.plantHealth > 0.9,
      category: 'ecology'
    },
    {
      id: 'maintenance_streak',
      title: 'Dedicated Caretaker',
      description: 'Maintain excellent care for 30 days',
      icon: 'ðŸ”§',
      progress: Math.min(1, maintenanceStreak / 30),
      unlocked: maintenanceStreak >= 30,
      category: 'maintenance'
    },
    {
      id: 'biodiversity',
      title: 'Biodiversity Champion',
      description: 'Have 5+ fish species and 3+ plant species',
      icon: 'ðŸ†',
      progress: Math.min(1, (fishCount / 5 + plantCount / 3) / 2),
      unlocked: fishCount >= 5 && plantCount >= 3,
      category: 'ecology'
    }
  ]);

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const totalProgress = achievements.reduce((sum, a) => sum + a.progress, 0);
  const avgProgress = totalProgress / achievements.length;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <TrophyIcon />
          <Typography variant="h6">Achievements</Typography>
          <Chip
            size="small"
            label={`${unlockedAchievements.length}/${achievements.length}`}
            color="primary"
          />
        </Stack>

        <MuiBox sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Overall Progress: {Math.round(avgProgress * 100)}%
          </Typography>
          <LinearProgress variant="determinate" value={avgProgress * 100} />
        </MuiBox>

        <Grid container spacing={1}>
          {achievements.map((achievement) => (
            <Grid item xs={6} sm={4} key={achievement.id}>
              <Card
                variant="outlined"
                sx={{
                  p: 1,
                  textAlign: 'center',
                  bgcolor: achievement.unlocked ? 'success.light' : 'grey.100',
                  opacity: achievement.unlocked ? 1 : 0.6,
                  transition: 'all 0.3s ease'
                }}
              >
                <Typography variant="h4" sx={{ mb: 0.5 }}>
                  {achievement.icon}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
                  {achievement.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  {achievement.description}
                </Typography>
                {!achievement.unlocked && (
                  <LinearProgress
                    variant="determinate"
                    value={achievement.progress * 100}
                    sx={{ mt: 0.5, height: 4 }}
                  />
                )}
              </Card>
            </Grid>
          ))}
        </Grid>

        {unlockedAchievements.length > 0 && (
          <MuiBox sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>Recently Unlocked:</Typography>
            <Stack direction="row" spacing={1}>
              {unlockedAchievements.slice(-3).map((achievement) => (
                <Chip
                  key={achievement.id}
                  label={`${achievement.icon} ${achievement.title}`}
                  color="success"
                  variant="outlined"
                  size="small"
                />
              ))}
            </Stack>
          </MuiBox>
        )}
      </CardContent>
    </Card>
  );
};

// === ENHANCED MAIN COMPONENT ===
const EnhancedAquarium3DViewer: React.FC = () => {
  // State management
  const [fishData, setFishData] = useState<Fish[]>([]);
  const [plantData, setPlantData] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 3D Settings
  const [autoRotate, setAutoRotate] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [fishAnimation, setFishAnimation] = useState(true);
  const [plantAnimation, setPlantAnimation] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [lightingIntensity, setLightingIntensity] = useState(1);

  // Environmental System
  const [temperature, setTemperature] = useState(24);
  const [phLevel, setPhLevel] = useState(7.0);
  const [waterLevel, setWaterLevel] = useState(90);
  const [waterFlow, setWaterFlow] = useState(0.5);
  const [lightingType, setLightingType] = useState<'daylight' | 'sunset' | 'night'>('daylight');
  const [filterStrength, setFilterStrength] = useState(3);
  const [feedingTime, setFeedingTime] = useState(false);
  const [oxygenLevel, setOxygenLevel] = useState(0.8);
  const [clarity, setClarity] = useState(0.9);
  const [co2Level, setCo2Level] = useState(0.6);
  const [nutrients, setNutrients] = useState(0.7);

  // New intelligent features
  const [currentTimeframe, setCurrentTimeframe] = useState<PredictiveScenario['timeframe']>('7_days');
  const [maintenanceStreak, setMaintenanceStreak] = useState(0);
  const [selectedPrediction, setSelectedPrediction] = useState<PredictiveScenario | null>(null);

  const aquarium = useAppSelector(state => state.aquarium);
  const { dimensions, selectedFish, selectedPlants, projectName } = aquarium;

  // Intelligent mood calculation
  const aquariumMood = useMemo(() => 
    calculateAquariumMood(temperature, phLevel, oxygenLevel, clarity, selectedFish.length, selectedPlants.length, filterStrength),
    [temperature, phLevel, oxygenLevel, clarity, selectedFish.length, selectedPlants.length, filterStrength]
  );

  // Helper functions
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

  // Fish social network generation
  const generateFishSocialNetwork = useCallback((fishId: string, species: string): FishSocialNetwork => {
    const fishInfo = fishData.find(f => f.id === fishId);
    const isSchooling = fishInfo?.schooling || species.includes('tetra') || species.includes('guppy');
    const isTerritorial = fishInfo?.temperament === 'aggressive' || species.includes('betta');
    
    return {
      species,
      schoolingPartners: isSchooling ? selectedFish.filter(f => f.id === fishId).map(f => f.id) : [],
      territorialConflicts: isTerritorial ? selectedFish.filter(f => f.id !== fishId).map(f => f.id) : [],
      compatibilityScore: 0.8,
      stressLevel: aquariumMood.fishHappiness < 0.6 ? 0.4 : 0.1,
      socialBehavior: isSchooling ? 'schooling' : isTerritorial ? 'territorial' : 'peaceful'
    };
  }, [fishData, selectedFish, aquariumMood.fishHappiness]);

  // Enhanced fish generation with social behavior
  const fish3D = useMemo(() => {
    return selectedFish.flatMap((selection, speciesIndex) => {
      const fishInfo = fishData.find(f => f.id === selection.id);
      const baseSize = fishInfo ? (fishInfo.size.min + fishInfo.size.max) / 2 : 5;
      const species = fishInfo?.name || 'unknown';

      const bounds = {
        x: (dimensions.length / 20) * 0.85,
        y: (dimensions.height / 20) * 0.75,
        z: (dimensions.width / 20) * 0.85
      };

      return Array.from({ length: selection.quantity }, (_, i) => {
        const socialNetwork = generateFishSocialNetwork(selection.id, species);
        
        // Position based on social behavior
        let position: [number, number, number];
        if (socialNetwork.socialBehavior === 'schooling') {
          const clusterAngle = (speciesIndex / selectedFish.length) * Math.PI * 2;
          const clusterRadius = 0.5 + Math.random() * 0.3;
          const x = Math.cos(clusterAngle) * clusterRadius + (Math.random() - 0.5) * 0.4;
          const z = Math.sin(clusterAngle) * clusterRadius + (Math.random() - 0.5) * 0.4;
          position = [x, 0.8 + Math.random() * 1.2, z];
        } else {
          position = [
            (Math.random() - 0.5) * bounds.x * 1.6,
            0.8 + Math.random() * 1.2,
            (Math.random() - 0.5) * bounds.z * 1.6
          ];
        }

        // Bounded position
        position = [
          Math.max(-bounds.x, Math.min(bounds.x, position[0])),
          Math.max(0.3, Math.min(bounds.y, position[1])),
          Math.max(-bounds.z, Math.min(bounds.z, position[2]))
        ];

        // Generate thought bubbles based on state
        let thoughtBubble = '';
        if (feedingTime) thoughtBubble = 'ðŸ½ï¸ Yummy!';
        else if (socialNetwork.stressLevel > 0.5) thoughtBubble = 'ðŸ˜° Stressed';
        else if (aquariumMood.overall === 'thriving') thoughtBubble = 'ðŸ˜Š Happy';

        // Determine emotional state
        let emotionalState: Fish3DProps['emotionalState'] = 'neutral';
        if (feedingTime) emotionalState = 'excited';
        else if (socialNetwork.stressLevel > 0.5) emotionalState = 'stressed';
        else if (aquariumMood.fishHappiness > 0.8) emotionalState = 'happy';

        return {
          id: `${selection.id}_${i}`,
          position,
          size: baseSize * (0.8 + Math.random() * 0.4),
          color: getFishColor(selection.id, i),
          species: species.toLowerCase(),
          swimming: fishAnimation,
          speed: 1,
          aquariumBounds: dimensions,
          environmentalFactors: {
            waterFlow,
            temperature,
            ph: phLevel,
            oxygenLevel,
            feedingTime,
            lightIntensity: lightingIntensity
          },
          socialNetwork,
          thoughtBubble,
          emotionalState
        };
      });
    });
  }, [selectedFish, fishData, dimensions, getFishColor, fishAnimation, waterFlow, temperature, phLevel, oxygenLevel, feedingTime, lightingIntensity, generateFishSocialNetwork, aquariumMood]);

  // Enhanced plant generation with growth simulation
  const plants3D = useMemo(() => {
    return selectedPlants.flatMap((selection, speciesIndex) => {
      const plantInfo = plantData.find(p => p.id === selection.id);
      const baseHeight = plantInfo ? (plantInfo.size.height.min + plantInfo.size.height.max) / 2 : 15;
      const species = plantInfo?.name || 'unknown';

      const bounds = {
        x: dimensions.length / 20,
        z: dimensions.width / 20
      };

      return Array.from({ length: selection.quantity }, (_, i) => {
        // Simulate growth stage (random for demo)
        const currentWeek = Math.floor(Math.random() * 24) + 1;
        const growthStage: PlantGrowthStage = {
          week: currentWeek,
          height: 0.3 + (1 - Math.exp(-currentWeek / 15)) * 0.7,
          spread: (0.3 + (1 - Math.exp(-currentWeek / 20)) * 0.7) * 0.6,
          healthLevel: Math.max(0.6, 1.0 - (currentWeek > 8 ? (currentWeek - 8) * 0.02 : 0)),
          maintenanceNeeded: currentWeek > 12 && currentWeek % 6 === 0 ? ['Pruning needed'] : [],
          shadingEffect: Math.min((0.3 + (1 - Math.exp(-currentWeek / 20)) * 0.7) * 0.6 / 30, 0.8)
        };

        const healthIndicators = {
          photosynthesis: Math.min(1.0, lightingIntensity * 0.8 + 0.2),
          nutrientUptake: nutrients,
          growthRate: growthStage.healthLevel * (co2Level * 0.5 + 0.5)
        };

        // Position plants around edges and scattered
        let position: [number, number, number];
        if (i === 0 || Math.random() < 0.4) {
          const side = Math.floor(Math.random() * 4);
          const edgeDistance = 2.2;
          switch (side) {
            case 0:
              position = [(Math.random() - 0.5) * bounds.x * 1.6, 0.12, -edgeDistance - Math.random() * 0.8];
              break;
            case 1:
              position = [(Math.random() - 0.5) * bounds.x * 1.6, 0.12, edgeDistance + Math.random() * 0.8];
              break;
            case 2:
              position = [-edgeDistance - Math.random() * 0.8, 0.12, (Math.random() - 0.5) * bounds.z * 1.4];
              break;
            default:
              position = [edgeDistance + Math.random() * 0.8, 0.12, (Math.random() - 0.5) * bounds.z * 1.4];
              break;
          }
        } else {
          position = [
            (Math.random() - 0.5) * bounds.x * 1.6,
            0.12 + Math.random() * 0.06,
            (Math.random() - 0.5) * bounds.z * 1.6
          ];
        }

        return {
          id: `${selection.id}_${i}`,
          position,
          height: baseHeight * (0.75 + Math.random() * 0.5),
          color: getPlantColor(selection.id, i),
          species: species.toLowerCase(),
          swaying: plantAnimation,
          environmentalFactors: {
            waterFlow,
            lightIntensity: lightingIntensity,
            co2Level,
            nutrients
          },
          growthStage,
          healthIndicators
        };
      });
    });
  }, [selectedPlants, plantData, dimensions, getPlantColor, plantAnimation, waterFlow, lightingIntensity, co2Level, nutrients]);

  // Load data
  const db = DatabaseService.getInstance();
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const [fish, plants] = await Promise.all([
          db.getFish(),
          db.getPlants()
        ]);
        if (mounted) {
          setFishData(fish);
          setPlantData(plants);
        }
      } catch (err) {
        console.error('Error loading 3D data:', err);
        if (mounted) {
          setError('Fehler beim Laden der 3D-Daten');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    loadData();
    return () => { mounted = false; };
  }, []);

  // Auto-feeding timer
  useEffect(() => {
    if (feedingTime) {
      const timer = setTimeout(() => {
        setFeedingTime(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [feedingTime]);

  // Environmental parameter interactions
  useEffect(() => {
    const filterEffect = filterStrength / 5;
    const flowEffect = waterFlow;
    const tempEffect = temperature > 25 ? (temperature - 25) * 0.02 : 0;

    setOxygenLevel(prev => Math.max(0.3, Math.min(1.0, 0.6 + filterEffect * 0.4 + flowEffect * 0.1 - tempEffect)));
    setClarity(prev => Math.min(1.0, 0.7 + filterEffect * 0.3));

    if (lightingType === 'daylight' && lightingIntensity > 0.5) {
      setCo2Level(prev => Math.max(0.3, prev - 0.05));
      setNutrients(prev => Math.max(0.4, prev - 0.02));
    }
  }, [filterStrength, waterFlow, temperature, lightingIntensity, lightingType]);

  // Utility functions
  const takeScreenshot = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `${projectName}_Enhanced_${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    }
  }, [projectName]);

  const triggerFeeding = useCallback(() => {
    setFeedingTime(true);
    setMaintenanceStreak(prev => prev + 1);
  }, []);

  const performWaterChange = useCallback(() => {
    setClarity(Math.min(1.0, clarity + 0.2));
    setOxygenLevel(Math.min(1.0, oxygenLevel + 0.1));
    setNutrients(Math.min(1.0, nutrients + 0.3));
    setMaintenanceStreak(prev => prev + 2);
  }, [clarity, oxygenLevel, nutrients]);

  if (loading) {
    return (
      <MuiBox display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={60} />
          <Typography variant="h6">Initializing Enhanced 3D Intelligence...</Typography>
          <Typography variant="body2" color="text.secondary">
            Loading AI-powered aquarium companion
          </Typography>
        </Stack>
      </MuiBox>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        <Typography variant="h6">3D Engine Error</Typography>
        <Typography>{error}</Typography>
        <Button onClick={() => window.location.reload()} sx={{ mt: 1 }}>
          Reload
        </Button>
      </Alert>
    );
  }

  return (
    <MuiBox sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Enhanced Header */}
      <Paper elevation={2} sx={{ p: 2, mb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <MuiBox>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              ðŸ§  Intelligent Aquarium Companion
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {projectName} â€¢ AI-Powered Ecosystem Management
            </Typography>
          </MuiBox>
          <Stack direction="row" spacing={1}>
            <Chip
              icon={<TempIcon />}
              label={`${temperature}Â°C`}
              size="small"
              color={temperature >= 22 && temperature <= 26 ? 'success' : 'error'}
            />
            <Chip
              icon={<WaterIcon />}
              label={`pH ${phLevel}`}
              size="small"
              color={phLevel >= 6.5 && phLevel <= 7.5 ? 'success' : 'error'}
            />
            <Chip
              icon={<BubbleIcon />}
              label={`Oâ‚‚ ${Math.round(oxygenLevel * 100)}%`}
              size="small"
              color={oxygenLevel >= 0.7 ? 'success' : 'warning'}
            />
            <IconButton onClick={() => setShowSettings(!showSettings)} size="small">
              <SettingsIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Paper>

      <Grid container spacing={1} sx={{ flex: 1 }}>
        {/* Left Panel - Intelligence Dashboard */}
        <Grid item xs={12} md={4} sx={{ height: '100%', overflow: 'auto' }}>
          <Stack spacing={1} sx={{ p: 1 }}>
            {/* Mood Indicator */}
            <AquariumMoodIndicator mood={aquariumMood} />

            {/* Predictive Timeline */}
            <PredictiveTimeline
              currentConditions={aquariumMood}
              onScenarioChange={setSelectedPrediction}
            />

            {/* Species Compatibility */}
            <SpeciesCompatibilityMatrix
              fishData={fishData}
              selectedFish={selectedFish}
            />

            {/* Plant Growth Simulator */}
            <PlantGrowthSimulator
              plantData={plantData}
              selectedPlants={selectedPlants}
            />

            {/* Achievement System */}
            <AchievementSystem
              aquariumHealth={aquariumMood}
              fishCount={selectedFish.reduce((sum, f) => sum + f.quantity, 0)}
              plantCount={selectedPlants.reduce((sum, p) => sum + p.quantity, 0)}
              maintenanceStreak={maintenanceStreak}
            />
          </Stack>
        </Grid>

        {/* Center Panel - 3D Viewer */}
        <Grid item xs={12} md={8}>
          <Paper elevation={1} sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
            <Canvas
              camera={{ position: [8, 6, 8], fov: 60 }}
              style={{ height: '100%' }}
            >
              <Suspense fallback={<Html center><CircularProgress /></Html>}>
                <ambientLight intensity={0.4} />
                <pointLight position={[10, 10, 10]} intensity={0.8} />
                <directionalLight
                  position={[0, 10, 0]}
                  intensity={lightingIntensity}
                  color={lightingType === 'daylight' ? '#FFFFFF' : lightingType === 'sunset' ? '#FF6B42' : '#4A90E2'}
                />

                {/* Enhanced fish with intelligence */}
                {fish3D.map((fish) => (
                  <EnhancedIntelligentFish3D key={fish.id} {...fish} />
                ))}

                {/* Enhanced plants with growth simulation */}
                {plants3D.map((plant) => (
                  <EnhancedPlantWithGrowth key={plant.id} {...plant} />
                ))}

                {/* Aquarium frame and water */}
                <EnhancedAquariumFrame
                  dimensions={dimensions}
                  waterLevel={waterLevel}
                  temperature={temperature}
                  ph={phLevel}
                  clarity={clarity}
                  oxygenLevel={oxygenLevel}
                  filterStrength={filterStrength}
                  lightingType={lightingType}
                />

                <OrbitControls
                  autoRotate={autoRotate}
                  autoRotateSpeed={rotationSpeed * 2}
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                />
                
                <Environment preset="apartment" />
                {showStats && <Stats />}
              </Suspense>
            </Canvas>

            {/* Floating Action Button for Quick Actions */}
            <SpeedDial
              ariaLabel="Quick Actions"
              sx={{ position: 'absolute', bottom: 16, right: 16 }}
              icon={<SpeedDialIcon />}
            >
              <SpeedDialAction
                icon={<FeedIcon />}
                tooltipTitle={feedingTime ? 'Feeding...' : 'Feed Fish'}
                onClick={triggerFeeding}
              />
              <SpeedDialAction
                icon={<WaterChangeIcon />}
                tooltipTitle="Water Change"
                onClick={performWaterChange}
              />
              <SpeedDialAction
                icon={<CameraIcon />}
                tooltipTitle="Screenshot"
                onClick={takeScreenshot}
              />
            </SpeedDial>

            {/* Status Overlay */}
            <MuiBox
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                p: 1,
                borderRadius: 1,
                fontSize: '0.75rem'
              }}
            >
              <Typography variant="caption" sx={{ display: 'block' }}>
                ðŸ  Tank: {dimensions.length}Ã—{dimensions.width}Ã—{dimensions.height}cm ({dimensions.volume}L)
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                ðŸŸ Fish: {fish3D.length} â€¢ ðŸŒ± Plants: {plants3D.length}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                ðŸŒŠ Flow: {Math.round(waterFlow * 100)}% â€¢ ðŸ’¡ Light: {Math.round(lightingIntensity * 100)}%
              </Typography>
              {feedingTime && (
                <Typography variant="caption" sx={{ display: 'block', color: '#FFD700' }}>
                  ðŸ½ï¸ Feeding Time Active
                </Typography>
              )}
            </MuiBox>
          </Paper>
        </Grid>
      </Grid>

      {/* Enhanced Settings Dialog */}
      <Dialog
        open={showSettings}
        onClose={() => setShowSettings(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <PsychologyIcon />
            <Typography variant="h6">Intelligent Control System</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            {/* Environmental Controls */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>ðŸŒŠ Water Chemistry</Typography>
              
              <MuiBox sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  ðŸŒ¡ï¸ Temperature: {temperature}Â°C
                </Typography>
                <Slider
                  value={temperature}
                  onChange={(_, value) => setTemperature(value as number)}
                  min={18}
                  max={32}
                  step={0.5}
                  marks={[
                    { value: 22, label: 'Min' },
                    { value: 24, label: 'Optimal' },
                    { value: 26, label: 'Max' }
                  ]}
                  color={temperature >= 22 && temperature <= 26 ? 'success' : 'error'}
                />
              </MuiBox>

              <MuiBox sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  âš—ï¸ pH Level: {phLevel.toFixed(1)}
                </Typography>
                <Slider
                  value={phLevel}
                  onChange={(_, value) => setPhLevel(value as number)}
                  min={5.0}
                  max={9.0}
                  step={0.1}
                  marks={[
                    { value: 6.5, label: 'Acidic' },
                    { value: 7.0, label: 'Neutral' },
                    { value: 7.5, label: 'Basic' }
                  ]}
                  color={phLevel >= 6.5 && phLevel <= 7.5 ? 'success' : 'error'}
                />
              </MuiBox>

              <MuiBox sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  ðŸŒŠ Water Flow: {Math.round(waterFlow * 100)}%
                </Typography>
                <Slider
                  value={waterFlow}
                  onChange={(_, value) => setWaterFlow(value as number)}
                  min={0}
                  max={1}
                  step={0.1}
                />
              </MuiBox>

              <MuiBox sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  ðŸ”„ Filter Strength: Level {filterStrength}
                </Typography>
                <Slider
                  value={filterStrength}
                  onChange={(_, value) => setFilterStrength(value as number)}
                  min={1}
                  max={5}
                  step={1}
                  marks={[
                    { value: 1, label: 'Low' },
                    { value: 3, label: 'Medium' },
                    { value: 5, label: 'High' }
                  ]}
                />
              </MuiBox>
            </Grid>

            {/* Lighting and Animation */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>ðŸ’¡ Lighting & Animation</Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Lighting Mode</InputLabel>
                <Select
                  value={lightingType}
                  label="Lighting Mode"
                  onChange={(e) => setLightingType(e.target.value as any)}
                >
                  <MenuItem value="daylight">â˜€ï¸ Full Spectrum Daylight</MenuItem>
                  <MenuItem value="sunset">ðŸŒ… Warm Sunset</MenuItem>
                  <MenuItem value="night">ðŸŒ™ Blue Night Light</MenuItem>
                </Select>
              </FormControl>

              <MuiBox sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  ðŸ’¡ Light Intensity: {Math.round(lightingIntensity * 100)}%
                </Typography>
                <Slider
                  value={lightingIntensity}
                  onChange={(_, value) => setLightingIntensity(value as number)}
                  min={0.1}
                  max={2}
                  step={0.1}
                />
              </MuiBox>

              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={fishAnimation}
                      onChange={(e) => setFishAnimation(e.target.checked)}
                    />
                  }
                  label="ðŸŸ Intelligent Fish Behavior"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={plantAnimation}
                      onChange={(e) => setPlantAnimation(e.target.checked)}
                    />
                  }
                  label="ðŸŒ± Dynamic Plant Growth"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoRotate}
                      onChange={(e) => setAutoRotate(e.target.checked)}
                    />
                  }
                  label="ðŸ”„ Auto Camera Movement"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={showStats}
                      onChange={(e) => setShowStats(e.target.checked)}
                    />
                  }
                  label="ðŸ“Š Performance Analytics"
                />
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettings(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </MuiBox>
  );
};

// === WATER SYSTEM COMPONENTS ===
const EnhancedWaterSystem: React.FC<{
  dimensions: { length: number; width: number; height: number };
  waterLevel: number;
  temperature: number;
  ph: number;
  clarity: number;
  oxygenLevel: number;
  filterStrength: number;
  lightingType: 'daylight' | 'sunset' | 'night';
}> = ({ dimensions, waterLevel, temperature, ph, clarity, oxygenLevel, filterStrength, lightingType }) => {
  const waterRef = useRef<THREE.Mesh>(null);
  const bubblesRef = useRef<THREE.Group>(null);

  const length = dimensions.length / 20;
  const width = dimensions.width / 20;
  const height = dimensions.height / 20;
  const actualWaterHeight = height * (waterLevel / 100);

  useFrame((state) => {
    if (!waterRef.current) return;

    const time = state.clock.getElapsedTime();
    waterRef.current.position.y = actualWaterHeight / 2 + Math.sin(time * 0.5) * 0.005;

    if (bubblesRef.current && (filterStrength > 2 || oxygenLevel > 0.8)) {
      bubblesRef.current.children.forEach((bubble) => {
        const bubbleMesh = bubble as THREE.Mesh;
        bubbleMesh.position.y += 0.01 * (1 + filterStrength * 0.2);
        if (bubbleMesh.position.y > actualWaterHeight) {
          bubbleMesh.position.y = 0.1;
          bubbleMesh.position.x = (Math.random() - 0.5) * length * 0.8;
          bubbleMesh.position.z = (Math.random() - 0.5) * width * 0.8;
        }
      });
    }
  });

  const getWaterColor = () => {
    let baseColor = new THREE.Color('#4FC3F7');
    
    if (temperature < 22) {
      baseColor = baseColor.lerp(new THREE.Color('#87CEEB'), 0.3);
    } else if (temperature > 26) {
      baseColor = baseColor.lerp(new THREE.Color('#FF6B35'), 0.2);
    }

    if (ph < 6.5) {
      baseColor = baseColor.lerp(new THREE.Color('#FFA500'), 0.2);
    } else if (ph > 7.5) {
      baseColor = baseColor.lerp(new THREE.Color('#00CED1'), 0.2);
    }

    const clarityFactor = Math.max(0.3, clarity);
    baseColor = baseColor.multiplyScalar(clarityFactor);
    return baseColor;
  };

  const waterOpacity = Math.max(0.2, Math.min(0.6, 0.3 + (1 - clarity) * 0.3));

  return (
    <group>
      <mesh ref={waterRef} position={[0, actualWaterHeight / 2, 0]}>
        <boxGeometry args={[length, actualWaterHeight, width]} />
        <meshStandardMaterial
          color={getWaterColor()}
          transparent
          opacity={waterOpacity}
          roughness={0.1}
          metalness={0.0}
        />
      </mesh>

      <group ref={bubblesRef}>
        {Array.from({ length: Math.floor(filterStrength * 5 + oxygenLevel * 10) }, (_, i) => (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * length * 0.8,
              Math.random() * actualWaterHeight * 0.8,
              (Math.random() - 0.5) * width * 0.8
            ]}
          >
            <sphereGeometry args={[0.02 + Math.random() * 0.02, 6, 6]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={0.6} />
          </mesh>
        ))}
      </group>

      {clarity < 0.7 && (
        <Sparkles
          count={20}
          scale={[length, actualWaterHeight, width]}
          size={1}
          speed={0.1}
          color="#8B4513"
        />
      )}
    </group>
  );
};

const EnhancedAquariumFrame: React.FC<{
  dimensions: { length: number; width: number; height: number };
  waterLevel: number;
  temperature: number;
  ph: number;
  clarity: number;
  oxygenLevel: number;
  filterStrength: number;
  lightingType: 'daylight' | 'sunset' | 'night';
}> = ({ dimensions, waterLevel, temperature, ph, clarity, oxygenLevel, filterStrength, lightingType }) => {
  const frameThickness = 0.03;
  const length = dimensions.length / 20;
  const width = dimensions.width / 20;
  const height = dimensions.height / 20;

  return (
    <group>
      <EnhancedWaterSystem
        dimensions={dimensions}
        waterLevel={waterLevel}
        temperature={temperature}
        ph={ph}
        clarity={clarity}
        oxygenLevel={oxygenLevel}
        filterStrength={filterStrength}
        lightingType={lightingType}
      />

      {/* Glass panels with realistic reflections */}
      {[
        { pos: [0, height / 2, width / 2], rot: [0, 0, 0], name: 'front' },
        { pos: [0, height / 2, -width / 2], rot: [0, Math.PI, 0], name: 'back' },
        { pos: [-length / 2, height / 2, 0], rot: [0, Math.PI / 2, 0], name: 'left' },
        { pos: [length / 2, height / 2, 0], rot: [0, -Math.PI / 2, 0], name: 'right' }
      ].map((panel, i) => (
        <mesh
          key={panel.name}
          position={panel.pos as [number, number, number]}
          rotation={panel.rot as [number, number, number]}
        >
          <planeGeometry args={[length, height]} />
          <meshPhysicalMaterial
            color="#FFFFFF"
            transparent
            opacity={0.1}
            roughness={0.05}
            metalness={0.0}
            clearcoat={1.0}
            clearcoatRoughness={0.0}
            transmission={0.9}
            thickness={0.1}
          />
        </mesh>
      ))}

      {/* Enhanced frame structure */}
      {/* Bottom frame */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[length + frameThickness * 2, frameThickness, width + frameThickness * 2]} />
        <meshStandardMaterial
          color="#2C2C2C"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Top frame */}
      <mesh position={[0, height, 0]}>
        <boxGeometry args={[length + frameThickness * 2, frameThickness, width + frameThickness * 2]} />
        <meshStandardMaterial
          color="#2C2C2C"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Vertical frame edges */}
      {[
        [-length/2, height/2, -width/2],
        [length/2, height/2, -width/2],
        [length/2, height/2, width/2],
        [-length/2, height/2, width/2]
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <cylinderGeometry args={[frameThickness, frameThickness, height, 8]} />
          <meshStandardMaterial
            color="#2C2C2C"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* Enhanced substrate with realistic texture */}
      <mesh position={[0, frameThickness / 2, 0]}>
        <boxGeometry args={[length * 0.98, 0.08, width * 0.98]} />
        <meshStandardMaterial
          color="#8B4513"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Substrate detail particles */}
      {Array.from({ length: 30 }, (_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * length * 0.9,
            0.05 + Math.random() * 0.03,
            (Math.random() - 0.5) * width * 0.9
          ]}
        >
          <sphereGeometry args={[0.01 + Math.random() * 0.01, 6, 6]} />
          <meshStandardMaterial
            color={`hsl(${25 + Math.random() * 20}, 60%, ${30 + Math.random() * 20}%)`}
            roughness={0.8}
          />
        </mesh>
      ))}

      {/* Decorative elements - rocks and driftwood */}
      {Array.from({ length: Math.floor(Math.random() * 3) + 2 }, (_, i) => (
        <mesh
          key={`decoration_${i}`}
          position={[
            (Math.random() - 0.5) * length * 0.7,
            0.1 + Math.random() * 0.1,
            (Math.random() - 0.5) * width * 0.7
          ]}
          rotation={[
            Math.random() * Math.PI,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI
          ]}
        >
          <boxGeometry 
            args={[
              0.1 + Math.random() * 0.2,
              0.05 + Math.random() * 0.15,
              0.08 + Math.random() * 0.15
            ]} 
          />
          <meshStandardMaterial
            color={`hsl(${Math.random() * 60}, 30%, ${20 + Math.random() * 30}%)`}
            roughness={0.9}
            metalness={0.0}
          />
        </mesh>
      ))}
    </group>
  );
};

// === CAMERA CONTROLLER ===
const CameraController: React.FC<{
  autoRotate: boolean;
  rotationSpeed: number;
}> = ({ autoRotate, rotationSpeed }) => {
  const controlsRef = useRef<any>(null);

  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
      controlsRef.current.autoRotateSpeed = rotationSpeed * 2;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      maxDistance={15}
      minDistance={3}
    />
  );
};

// === ENHANCED LOADER ===
const Loader: React.FC = () => {
  const { progress } = useProgress();
  
  return (
    <Html center>
      <MuiBox sx={{ textAlign: 'center', color: 'white' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          ðŸ§  Initializing AI Aquarium Companion...
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          {progress.toFixed(0)}% â€¢ Loading Enhanced WebGL Intelligence
        </Typography>
      </MuiBox>
    </Html>
  );
};

// === ENHANCED AQUARIUM SCENE ===
const AquariumScene: React.FC<{
  fish3D: Array<{
    id: string;
    position: [number, number, number];
    size: number;
    color: string;
    species: string;
    aquariumBounds: any;
    environmentalFactors: any;
    socialNetwork: any;
    thoughtBubble?: string;
    emotionalState: any;
  }>;
  plants3D: Array<{
    id: string;
    position: [number, number, number];
    height: number;
    color: string;
    species: string;
    environmentalFactors: any;
    growthStage: any;
    healthIndicators: any;
  }>;
  dimensions: { length: number; width: number; height: number };
  fishAnimation: boolean;
  plantAnimation: boolean;
  lightingIntensity: number;
  lightingType: 'daylight' | 'sunset' | 'night';
  environmentalFactors: {
    waterFlow: number;
    temperature: number;
    ph: number;
    oxygenLevel: number;
    clarity: number;
    co2Level: number;
    nutrients: number;
    feedingTime: boolean;
    filterStrength: number;
  };
  waterLevel: number;
}> = ({
  fish3D,
  plants3D,
  dimensions,
  fishAnimation,
  plantAnimation,
  lightingIntensity,
  lightingType,
  environmentalFactors,
  waterLevel
}) => {
  // Enhanced dynamic lighting
  const getLightingColor = () => {
    switch (lightingType) {
      case 'daylight': return '#FFFFFF';
      case 'sunset': return '#FF6B42';
      case 'night': return '#4A90E2';
      default: return '#FFFFFF';
    }
  };

  const getAmbientIntensity = () => {
    const baseIntensity = lightingIntensity;
    switch (lightingType) {
      case 'daylight': return 0.7 * baseIntensity;
      case 'sunset': return 0.5 * baseIntensity;
      case 'night': return 0.3 * baseIntensity;
      default: return 0.5 * baseIntensity;
    }
  };

  return (
    <>
      {/* Enhanced lighting system */}
      <ambientLight 
        intensity={getAmbientIntensity()} 
        color={getLightingColor()} 
      />
      
      <directionalLight
        position={[0, 10, 0]}
        intensity={lightingIntensity}
        color={getLightingColor()}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Additional rim lighting for depth */}
      <pointLight 
        position={[8, 8, 8]} 
        intensity={0.3 * lightingIntensity} 
        color={getLightingColor()} 
      />
      <pointLight 
        position={[-8, 4, -8]} 
        intensity={0.2 * lightingIntensity} 
        color={getLightingColor()} 
      />

      {/* Enhanced fish with environmental interactions */}
      {fish3D.map((fish) => (
        <EnhancedIntelligentFish3D
          key={fish.id}
          {...fish}
          swimming={fishAnimation}
        />
      ))}

      {/* Enhanced plants with environmental interactions */}
      {plants3D.map((plant) => (
        <EnhancedPlantWithGrowth
          key={plant.id}
          {...plant}
          swaying={plantAnimation}
        />
      ))}

      {/* Enhanced aquarium frame */}
      <EnhancedAquariumFrame
        dimensions={dimensions}
        waterLevel={waterLevel}
        temperature={environmentalFactors.temperature}
        ph={environmentalFactors.ph}
        clarity={environmentalFactors.clarity}
        oxygenLevel={environmentalFactors.oxygenLevel}
        filterStrength={environmentalFactors.filterStrength}
        lightingType={lightingType}
      />

      {/* Camera controller */}
      <CameraController autoRotate={false} rotationSpeed={1} />
      
      <Environment preset="apartment" />
    </>
  );
};

export default EnhancedAquarium3DViewer;