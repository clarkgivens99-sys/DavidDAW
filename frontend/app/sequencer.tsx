import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Line, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');

interface DrumPad {
  id: string;
  name: string;
  sound: string;
  color: string;
  volume: number;
  sacredName: string; // Religious themed names
}

interface SequenceStep {
  kick: boolean;
  snare: boolean;
  hihat: boolean;
  openhat: boolean;
  crash: boolean;
  ride: boolean;
  clap: boolean;
  perc: boolean;
}

const drumPads: DrumPad[] = [
  { id: 'kick', name: 'Foundation', sacredName: 'Rock of Ages', sound: 'kick_sample', color: '#ef4444', volume: 1.0 },
  { id: 'snare', name: 'Truth', sacredName: 'Voice of Truth', sound: 'snare_sample', color: '#f59e0b', volume: 0.8 },
  { id: 'hihat', name: 'Grace', sacredName: 'Amazing Grace', sound: 'hihat_sample', color: '#eab308', volume: 0.6 },
  { id: 'openhat', name: 'Spirit', sacredName: 'Holy Spirit', sound: 'openhat_sample', color: '#22c55e', volume: 0.7 },
  { id: 'crash', name: 'Glory', sacredName: 'Glory Hallelujah', sound: 'crash_sample', color: '#10b981', volume: 0.9 },
  { id: 'ride', name: 'Peace', sacredName: 'Prince of Peace', sound: 'ride_sample', color: '#06b6d4', volume: 0.7 },
  { id: 'clap', name: 'Praise', sacredName: 'Clap Your Hands', sound: 'clap_sample', color: '#8b5cf6', volume: 0.8 },
  { id: 'perc', name: 'Joy', sacredName: 'Joy to World', sound: 'perc_sample', color: '#ec4899', volume: 0.6 },
];

const initialPattern: SequenceStep[] = Array(16).fill(null).map(() => ({
  kick: false,
  snare: false,
  hihat: false,
  openhat: false,
  crash: false,
  ride: false,
  clap: false,
  perc: false,
}));

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

// Musical Note Background
const MusicalBackground: React.FC<{ width: number; height: number }> = ({ width, height }) => (
  <Svg width={width} height={height} style={styles.backgroundDecoration}>
    <Defs>
      <LinearGradient id="noteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#ff4500" stopOpacity="0.2" />
        <Stop offset="100%" stopColor="#ffcd56" stopOpacity="0.1" />
      </LinearGradient>
    </Defs>
    {/* Treble Clef */}
    <Path
      d="M80 120 Q85 100 90 120 Q95 140 85 150 Q80 160 85 170"
      stroke="url(#noteGradient)"
      strokeWidth="3"
      fill="none"
    />
    {/* Staff lines */}
    <Line x1="30" y1="140" x2="370" y2="140" stroke="url(#noteGradient)" strokeWidth="1" />
    <Line x1="30" y1="150" x2="370" y2="150" stroke="url(#noteGradient)" strokeWidth="1" />
    <Line x1="30" y1="160" x2="370" y2="160" stroke="url(#noteGradient)" strokeWidth="1" />
    <Line x1="30" y1="170" x2="370" y2="170" stroke="url(#noteGradient)" strokeWidth="1" />
    <Line x1="30" y1="180" x2="370" y2="180" stroke="url(#noteGradient)" strokeWidth="1" />
    
    {/* Cross in corner */}
    <Path
      d="M320 60L320 40L324 40L324 60L340 60L340 64L324 64L324 80L320 80L320 64L304 64L304 60L320 60Z"
      fill="url(#noteGradient)"
    />
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
        <Ionicons name="recording" size={20} color="#ffb366" />
        <Text style={[styles.navButtonText, styles.inactiveNavText]}>Multitrack</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => router.push('/effects')}
      >
        <Ionicons name="options" size={20} color="#ffb366" />
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
        <Ionicons name="library" size={20} color="#ffb366" />
        <Text style={[styles.navButtonText, styles.inactiveNavText]}>Library</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => router.push('/waveform')}
      >
        <Ionicons name="pulse" size={20} color="#ffb366" />
        <Text style={[styles.navButtonText, styles.inactiveNavText]}>Waveform</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function BeatSequencer() {
  const router = useRouter();
  const [pattern, setPattern] = useState<SequenceStep[]>(initialPattern);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [selectedDrum, setSelectedDrum] = useState<string>('kick');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const stepDuration = (60 / bpm / 4) * 1000;

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentStep(prev => (prev + 1) % 16);
      }, stepDuration);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, stepDuration]);

  const toggleStep = (stepIndex: number, drumId: string) => {
    setPattern(prev => prev.map((step, index) => 
      index === stepIndex 
        ? { ...step, [drumId]: !step[drumId as keyof SequenceStep] }
        : step
    ));
  };

  const getStepColor = (stepIndex: number, drumId: string) => {
    const drum = drumPads.find(d => d.id === drumId);
    const isActive = pattern[stepIndex][drumId as keyof SequenceStep];
    const isCurrent = stepIndex === currentStep && isPlaying;
    
    if (isCurrent && isActive) return drum?.color || '#ffffff';
    if (isCurrent) return '#ff4500';
    if (isActive) return drum?.color || '#cc6633';
    return 'rgba(139, 69, 19, 0.3)';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Musical Decorations */}
      <MusicalBackground width={400} height={800} />
      
      {/* Header with Graffiti Title */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <CrossIcon size={32} color="#ff4500" />
          <View style={styles.titleTextContainer}>
            <Text style={styles.mainTitle}>Gospel and Praise</Text>
            <Text style={styles.subTitle}>D.A.W. To Worship Yahweh</Text>
          </View>
          <CrossIcon size={32} color="#ff4500" />
        </View>
      </View>
      
      {/* Navigation Bar */}
      <NavigationBar />

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((currentStep + 1) / 16) * 100}%` }]} />
        </View>
      </View>

      {/* Transport Controls */}
      <View style={styles.transportContainer}>
        <TouchableOpacity
          style={[styles.transportButton, isPlaying && styles.transportActive]}
          onPress={() => setIsPlaying(!isPlaying)}
        >
          <View style={styles.transportIcon}>
            <Ionicons name={isPlaying ? "pause" : "play"} size={20} color="#ff4500" />
          </View>
          <Text style={styles.transportLabel}>{isPlaying ? 'Pause' : 'Play'}</Text>
        </TouchableOpacity>
        
        <View style={styles.bpmContainer}>
          <CrossIcon size={20} color="#ffcd56" />
          <Text style={styles.bpmValue}>{bpm}</Text>
          <Text style={styles.bpmLabel}>BPM</Text>
        </View>
        
        <TouchableOpacity
          style={styles.transportButton}
          onPress={() => {
            setIsPlaying(false);
            setCurrentStep(0);
          }}
        >
          <View style={styles.transportIcon}>
            <View style={styles.stopButton} />
          </View>
          <Text style={styles.transportLabel}>Stop</Text>
        </TouchableOpacity>
      </View>

      {/* Step Sequencer Grid */}
      <ScrollView style={styles.sequencerContainer}>
        <View style={styles.stepNumbers}>
          {Array(16).fill(null).map((_, index) => (
            <View
              key={index}
              style={[
                styles.stepNumber,
                currentStep === index && isPlaying && styles.stepNumberActive
              ]}
            >
              <Text style={[
                styles.stepNumberText,
                currentStep === index && isPlaying && styles.stepNumberTextActive
              ]}>
                {index + 1}
              </Text>
            </View>
          ))}
        </View>

        {drumPads.map(drum => (
          <View key={drum.id} style={styles.sequencerRow}>
            <View style={styles.drumLabelContainer}>
              <TouchableOpacity
                style={[
                  styles.drumLabel,
                  { backgroundColor: drum.color },
                  selectedDrum === drum.id && styles.drumLabelSelected
                ]}
                onPress={() => setSelectedDrum(drum.id)}
              >
                <Text style={styles.drumLabelText}>{drum.name}</Text>
              </TouchableOpacity>
              <Text style={styles.sacredName}>{drum.sacredName}</Text>
            </View>
            
            <View style={styles.stepsRow}>
              {Array(16).fill(null).map((_, stepIndex) => (
                <TouchableOpacity
                  key={stepIndex}
                  style={[
                    styles.stepButton,
                    { backgroundColor: getStepColor(stepIndex, drum.id) }
                  ]}
                  onPress={() => toggleStep(stepIndex, drum.id)}
                >
                  {pattern[stepIndex][drum.id as keyof SequenceStep] && (
                    <CrossIcon size={12} color="#ffffff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Divine Controls Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton}>
          <CrossIcon size={16} color="#ff4500" />
          <Text style={styles.footerButtonText}>Bless Pattern</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.footerButton}>
          <Ionicons name="refresh" size={16} color="#ffffff" />
          <Text style={styles.footerButtonText}>Sanctify</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.footerButton}>
          <Ionicons name="heart" size={16} color="#dc143c" />
          <Text style={styles.footerButtonText}>Sacred Heart</Text>
        </TouchableOpacity>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 20,
    backgroundColor: '#2a1a1a',
    zIndex: 10,
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
  transportContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#2a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#4a2a2a',
    zIndex: 5,
  },
  transportButton: {
    alignItems: 'center',
    gap: 8,
  },
  transportIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(74, 42, 42, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ff4500',
  },
  transportActive: {
    opacity: 1,
  },
  transportLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  bpmContainer: {
    alignItems: 'center',
    gap: 4,
  },
  bpmValue: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  bpmLabel: {
    color: '#ffb366',
    fontSize: 12,
    fontWeight: '600',
  },
  stopButton: {
    width: 16,
    height: 4,
    backgroundColor: '#ff4500',
    borderRadius: 2,
  },
  sequencerContainer: {
    flex: 1,
    padding: 16,
    zIndex: 5,
  },
  stepNumbers: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingLeft: 120,
    gap: 2,
  },
  stepNumber: {
    width: 28,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  stepNumberActive: {
    backgroundColor: '#ff4500',
  },
  stepNumberText: {
    color: '#cc6633',
    fontSize: 10,
    fontWeight: '600',
  },
  stepNumberTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  sequencerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  drumLabelContainer: {
    width: 110,
    marginRight: 8,
  },
  drumLabel: {
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  drumLabelSelected: {
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  drumLabelText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  sacredName: {
    color: '#ffb366',
    fontSize: 9,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  stepsRow: {
    flexDirection: 'row',
    flex: 1,
    gap: 2,
  },
  stepButton: {
    width: 28,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#2a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#4a2a2a',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
  },
  footerButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
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
    color: '#ffcd56',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textShadowColor: '#ff4500',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
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
    color: '#ffb366',
  },
});