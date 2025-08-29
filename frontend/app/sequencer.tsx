import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Svg, { Path, Line, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

interface DrumPad {
  id: string;
  name: string;
  sacredName: string;
  sound: string;
  color: string;
  isActive: boolean;
  blessing: string;
}

interface Pattern {
  [padId: string]: boolean[];
}

const drumPads: DrumPad[] = [
  { 
    id: 'kick', 
    name: 'Kick', 
    sacredName: 'Rock of Ages',
    sound: 'kick.wav', 
    color: '#ff4444', 
    isActive: false,
    blessing: 'The foundation upon which we build'
  },
  { 
    id: 'snare', 
    name: 'Snare', 
    sacredName: 'Voice of Truth',
    sound: 'snare.wav', 
    color: '#44ff44', 
    isActive: false,
    blessing: 'The sharp call to righteousness'
  },
  { 
    id: 'hihat', 
    name: 'Hi-Hat', 
    sacredName: 'Gentle Whisper',
    sound: 'hihat.wav', 
    color: '#4444ff', 
    isActive: false,
    blessing: 'The soft guidance of the Spirit'
  },
  { 
    id: 'openhat', 
    name: 'Open Hat', 
    sacredName: 'Joyful Noise',
    sound: 'openhat.wav', 
    color: '#ffff44', 
    isActive: false,
    blessing: 'The celebration of salvation'
  },
  { 
    id: 'crash', 
    name: 'Crash', 
    sacredName: 'Thunder of Glory',
    sound: 'crash.wav', 
    color: '#ff44ff', 
    isActive: false,
    blessing: 'The mighty sound of His presence'
  },
  { 
    id: 'ride', 
    name: 'Ride', 
    sacredName: 'Eternal Rhythm',
    sound: 'ride.wav', 
    color: '#44ffff', 
    isActive: false,
    blessing: 'The steady beat of forever'
  },
  { 
    id: 'tom1', 
    name: 'High Tom', 
    sacredName: 'Heavenly Call',
    sound: 'tom1.wav', 
    color: '#ff8844', 
    isActive: false,
    blessing: 'The high calling of praise'
  },
  { 
    id: 'tom2', 
    name: 'Low Tom', 
    sacredName: 'Deep Faith',
    sound: 'tom2.wav', 
    color: '#8844ff', 
    isActive: false,
    blessing: 'The depth of our devotion'
  },
  { 
    id: 'clap', 
    name: 'Clap', 
    sacredName: 'Hands of Praise',
    sound: 'clap.wav', 
    color: '#44ff88', 
    isActive: false,
    blessing: 'Clap your hands all you peoples'
  },
  { 
    id: 'perc', 
    name: 'Percussion', 
    sacredName: 'Sacred Rhythm',
    sound: 'perc.wav', 
    color: '#ff4488', 
    isActive: false,
    blessing: 'The heartbeat of worship'
  },
  { 
    id: 'shaker', 
    name: 'Shaker', 
    sacredName: 'Spirit Shake',
    sound: 'shaker.wav', 
    color: '#88ff44', 
    isActive: false,
    blessing: 'Shake with holy fire'
  },
  { 
    id: 'cowbell', 
    name: 'Cowbell', 
    sacredName: 'Divine Bell',
    sound: 'cowbell.wav', 
    color: '#4488ff', 
    isActive: false,
    blessing: 'Ring out the good news'
  }
];

// Cross SVG Component - Standard Christian Cross
const CrossIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <LinearGradient id="crossGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={color} stopOpacity="1" />
        <Stop offset="50%" stopColor="#ffcd56" stopOpacity="0.9" />
        <Stop offset="100%" stopColor={color} stopOpacity="0.8" />
      </LinearGradient>
    </Defs>
    {/* Standard Christian Cross: one vertical line with one horizontal line at 2/3 height */}
    <Line
      x1="12" y1="3" x2="12" y2="21"
      stroke="url(#crossGradient)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <Line
      x1="6" y1="9" x2="18" y2="9"
      stroke="url(#crossGradient)"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </Svg>
);

// Corner Crosses Component - White crosses in upper corners
const CornerCrosses: React.FC = () => (
  <View style={styles.cornerCrossesContainer}>
    {/* Top Left Cross */}
    <View style={styles.topLeftCross}>
      <Svg width={32} height={32} viewBox="0 0 24 24">
        <Line x1="12" y1="3" x2="12" y2="21" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        <Line x1="6" y1="9" x2="18" y2="9" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      </Svg>
    </View>
    
    {/* Top Right Cross */}
    <View style={styles.topRightCross}>
      <Svg width={32} height={32} viewBox="0 0 24 24">
        <Line x1="12" y1="3" x2="12" y2="21" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        <Line x1="6" y1="9" x2="18" y2="9" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      </Svg>
    </View>
  </View>
);

// Sacred Background Graphics
const MusicalBackground: React.FC<{ width: number; height: number }> = ({ width, height }) => (
  <Svg width={width} height={height} style={styles.backgroundDecoration}>
    <Defs>
      <LinearGradient id="musicalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#ff4500" stopOpacity="0.1" />
        <Stop offset="50%" stopColor="#ffcd56" stopOpacity="0.05" />
        <Stop offset="100%" stopColor="#ff4500" stopOpacity="0.1" />
      </LinearGradient>
    </Defs>
    
    {/* Large Cross */}
    <Line x1="200" y1="50" x2="200" y2="200" stroke="url(#musicalGradient)" strokeWidth="4" />
    <Line x1="150" y1="100" x2="250" y2="100" stroke="url(#musicalGradient)" strokeWidth="4" />
    
    {/* Musical notes */}
    <Circle cx="80" cy="300" r="4" fill="url(#musicalGradient)" />
    <Line x1="84" y1="300" x2="84" y2="280" stroke="#ff4500" strokeWidth="2" opacity="0.2" />
    <Path d="M86 278L86 282L90 280L90 276L86 278Z" fill="url(#musicalGradient)" />
    
    <Circle cx="320" cy="150" r="3" fill="url(#musicalGradient)" />
    <Line x1="323" y1="150" x2="323" y2="135" stroke="#ff4500" strokeWidth="1.5" opacity="0.2" />
    
    {/* Drum pattern visualization */}
    <Circle cx="150" cy="350" r="12" fill="none" stroke="url(#musicalGradient)" strokeWidth="2" />
    <Circle cx="180" cy="350" r="8" fill="none" stroke="url(#musicalGradient)" strokeWidth="1.5" />
    <Circle cx="210" cy="350" r="6" fill="none" stroke="url(#musicalGradient)" strokeWidth="1" />
  </Svg>
);

// Navigation Component
const NavigationBar: React.FC = () => {
  const router = useRouter();
  
  return (
    <View style={styles.navigationBar}>
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => router.push('/')}
      >
        <Ionicons name="recording" size={20} color="#ffffff" />
        <Text style={[styles.navButtonText, styles.inactiveNavText]}>Multitrack</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => router.push('/effects')}
      >
        <Ionicons name="options" size={20} color="#ffffff" />
        <Text style={[styles.navButtonText, styles.inactiveNavText]}>Effects</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.navButton, styles.activeNavButton]}
      >
        <Ionicons name="grid" size={20} color="#ffffff" />
        <Text style={styles.navButtonText}>Beats</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => router.push('/samples')}
      >
        <Ionicons name="library" size={20} color="#ffffff" />
        <Text style={[styles.navButtonText, styles.inactiveNavText]}>Library</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => router.push('/waveform')}
      >
        <Ionicons name="pulse" size={20} color="#ffffff" />
        <Text style={[styles.navButtonText, styles.inactiveNavText]}>Waveform</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function BeatSequencer() {
  const router = useRouter();
  const [drumPadsState, setDrumPadsState] = useState(drumPads);
  const [pattern, setPattern] = useState<Pattern>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [selectedPad, setSelectedPad] = useState<string | null>(null);

  const steps = 16;

  // Initialize pattern
  React.useEffect(() => {
    const initialPattern: Pattern = {};
    drumPads.forEach(pad => {
      initialPattern[pad.id] = new Array(steps).fill(false);
    });
    setPattern(initialPattern);
  }, []);

  const toggleStep = (padId: string, stepIndex: number) => {
    setPattern(prev => ({
      ...prev,
      [padId]: prev[padId]?.map((active, index) => 
        index === stepIndex ? !active : active
      ) || []
    }));
  };

  const DrumPadComponent = ({ pad }: { pad: DrumPad }) => (
    <TouchableOpacity
      style={[
        styles.drumPad,
        { backgroundColor: pad.color + '33' },
        { borderColor: pad.color },
        selectedPad === pad.id && styles.drumPadSelected,
        pad.isActive && styles.drumPadActive
      ]}
      onPress={() => setSelectedPad(pad.id)}
    >
      <View style={styles.padHeader}>
        <CrossIcon size={12} color="#ff4500" />
        <Text style={styles.padName}>{pad.sacredName}</Text>
      </View>
      <Text style={styles.padBlessing}>"{pad.blessing}"</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Corner Crosses */}
      <CornerCrosses />
      
      {/* Background Graphics */}
      <MusicalBackground width={400} height={800} />
      
      {/* Header with Graffiti Title */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <CrossIcon size={32} color="#ff4500" />
          <View style={styles.titleTextContainer}>
            <Text style={styles.mainTitle}>The David D.A.W.</Text>
            <Text style={styles.subTitle}>for Chasing Away the Evil Spirit</Text>
          </View>
          <CrossIcon size={32} color="#ff4500" />
        </View>
      </View>
      
      {/* Navigation Bar */}
      <NavigationBar />

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '75%' }]} />
        </View>
      </View>

      {/* Sacred Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.bpmContainer}>
          <CrossIcon size={16} color="#ff4500" />
          <Text style={styles.bpmLabel}>Sacred BPM</Text>
          <Text style={styles.bpmValue}>{bpm}</Text>
        </View>
        
        <TouchableOpacity
          style={[styles.playButton, isPlaying && styles.playButtonActive]}
          onPress={() => setIsPlaying(!isPlaying)}
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.resetButton}>
          <CrossIcon size={14} color="#ff4500" />
          <Ionicons name="refresh" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Pattern Grid */}
      <View style={styles.patternContainer}>
        <View style={styles.stepsHeader}>
          <CrossIcon size={16} color="#ff4500" />
          <Text style={styles.patternTitle}>Sacred Beat Pattern</Text>
          <CrossIcon size={16} color="#ff4500" />
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.patternGrid}>
            {/* Step indicators */}
            <View style={styles.stepIndicators}>
              {Array.from({ length: steps }, (_, index) => (
                <View
                  key={index}
                  style={[
                    styles.stepIndicator,
                    currentStep === index && styles.currentStepIndicator
                  ]}
                >
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                </View>
              ))}
            </View>
            
            {/* Pattern rows */}
            {drumPadsState.map(pad => (
              <View key={pad.id} style={styles.patternRow}>
                <View style={styles.padLabel}>
                  <CrossIcon size={8} color={pad.color} />
                  <Text style={[styles.padLabelText, { color: pad.color }]}>
                    {pad.sacredName}
                  </Text>
                </View>
                <View style={styles.stepsRow}>
                  {Array.from({ length: steps }, (_, stepIndex) => (
                    <TouchableOpacity
                      key={stepIndex}
                      style={[
                        styles.stepButton,
                        pattern[pad.id]?.[stepIndex] && { backgroundColor: pad.color },
                        (stepIndex + 1) % 4 === 1 && styles.beatOneStep
                      ]}
                      onPress={() => toggleStep(pad.id, stepIndex)}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Drum Pads Grid */}
      <View style={styles.drumPadsContainer}>
        <View style={styles.padsHeader}>
          <CrossIcon size={16} color="#ff4500" />
          <Text style={styles.padsTitle}>Sacred Drum Pads</Text>
          <CrossIcon size={16} color="#ff4500" />
        </View>
        
        <View style={styles.drumPadsGrid}>
          {drumPadsState.map(pad => (
            <DrumPadComponent key={pad.id} pad={pad} />
          ))}
        </View>
      </View>

      {/* Sacred Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton}>
          <CrossIcon size={16} color="#ff4500" />
          <Ionicons name="save" size={20} color="#fff" />
          <Text style={styles.footerButtonText}>Save Pattern</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.footerButton}>
          <CrossIcon size={16} color="#ff4500" />
          <Ionicons name="download" size={20} color="#fff" />
          <Text style={styles.footerButtonText}>Export Beats</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sacredFooter}>
        <CrossIcon size={24} color="#ffffff" />
        <Text style={styles.blessingText}>"Praise him with tambourine and dance"</Text>
        <CrossIcon size={24} color="#ffffff" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0f0f',
  },
  backgroundDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  cornerCrossesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  topLeftCross: {
    opacity: 0.8,
  },
  topRightCross: {
    opacity: 0.8,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 20,
    backgroundColor: '#2a1a1a',
    zIndex: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  titleTextContainer: {
    alignItems: 'center',
  },
  mainTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textShadowColor: '#ff4500',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    fontStyle: 'italic',
  },
  subTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textShadowColor: '#ff4500',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    fontStyle: 'italic',
    marginTop: -2,
  },
  navigationBar: {
    flexDirection: 'row',
    backgroundColor: '#2a1a1a',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#4a2a2a',
    zIndex: 10,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 4,
  },
  activeNavButton: {
    backgroundColor: 'rgba(255, 69, 0, 0.2)',
    borderRadius: 8,
  },
  navButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  inactiveNavText: {
    color: '#ffffff',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2a1a1a',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#4a2a2a',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ff4500',
    borderRadius: 2,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#2a1212',
    zIndex: 5,
  },
  bpmContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bpmLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  bpmValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    minWidth: 40,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(139, 69, 19, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 69, 0, 0.3)',
  },
  playButtonActive: {
    backgroundColor: '#ff4500',
    shadowColor: '#ff4500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 12,
  },
  patternContainer: {
    backgroundColor: '#2a1a1a',
    padding: 16,
    zIndex: 5,
  },
  stepsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  patternTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  patternGrid: {
    gap: 8,
  },
  stepIndicators: {
    flexDirection: 'row',
    gap: 2,
    marginLeft: 80,
    marginBottom: 8,
  },
  stepIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 69, 19, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 0, 0.2)',
  },
  currentStepIndicator: {
    backgroundColor: '#ff4500',
    borderColor: '#ffffff',
  },
  stepNumber: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  patternRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  padLabel: {
    width: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  padLabelText: {
    fontSize: 10,
    fontWeight: '600',
  },
  stepsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  stepButton: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: 'rgba(139, 69, 19, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 0, 0.2)',
  },
  beatOneStep: {
    borderColor: '#ffffff',
    borderWidth: 2,
  },
  drumPadsContainer: {
    flex: 1,
    padding: 16,
    zIndex: 5,
  },
  padsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  padsTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  drumPadsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  drumPad: {
    width: '48%',
    aspectRatio: 1.5,
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drumPadSelected: {
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  drumPadActive: {
    shadowColor: '#ff4500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  padHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  padName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  padBlessing: {
    color: '#ffffff',
    fontSize: 9,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#2a1212',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 69, 0, 0.2)',
    zIndex: 5,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  sacredFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#2a1a1a',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#4a2a2a',
    zIndex: 5,
  },
  blessingText: {
    color: '#ffffff',
    fontSize: 12,
    fontStyle: 'italic',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});