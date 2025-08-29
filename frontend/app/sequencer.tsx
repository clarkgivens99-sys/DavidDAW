import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';

const { width: screenWidth } = Dimensions.get('window');

interface DrumPad {
  id: string;
  name: string;
  sound: string; // base64 or sample name
  color: string;
  volume: number;
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
  { id: 'kick', name: 'Kick', sound: 'kick_sample', color: '#ff4444', volume: 1.0 },
  { id: 'snare', name: 'Snare', sound: 'snare_sample', color: '#ff8844', volume: 0.8 },
  { id: 'hihat', name: 'Hi-Hat', sound: 'hihat_sample', color: '#ffff44', volume: 0.6 },
  { id: 'openhat', name: 'Open Hat', sound: 'openhat_sample', color: '#88ff44', volume: 0.7 },
  { id: 'crash', name: 'Crash', sound: 'crash_sample', color: '#44ff88', volume: 0.9 },
  { id: 'ride', name: 'Ride', sound: 'ride_sample', color: '#44ffff', volume: 0.7 },
  { id: 'clap', name: 'Clap', sound: 'clap_sample', color: '#8844ff', volume: 0.8 },
  { id: 'perc', name: 'Perc', sound: 'perc_sample', color: '#ff44ff', volume: 0.6 },
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

export default function BeatSequencer() {
  const router = useRouter();
  const [pattern, setPattern] = useState<SequenceStep[]>(initialPattern);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [selectedDrum, setSelectedDrum] = useState<string>('kick');
  const [volume, setVolume] = useState(0.8);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate step duration based on BPM
  const stepDuration = (60 / bpm / 4) * 1000; // 16th notes

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

  const playDrumSound = async (drumId: string) => {
    try {
      // In a real implementation, you would load and play actual drum samples
      console.log(`Playing ${drumId} sound`);
      
      // Simulate drum hit with haptic feedback if available
      // You could add actual audio samples here
    } catch (error) {
      console.error('Error playing drum sound:', error);
    }
  };

  const handleDrumPadPress = (drumId: string) => {
    setSelectedDrum(drumId);
    playDrumSound(drumId);
  };

  const clearPattern = () => {
    setPattern(initialPattern);
  };

  const randomizePattern = () => {
    setPattern(prev => prev.map(() => ({
      kick: Math.random() > 0.7,
      snare: Math.random() > 0.8,
      hihat: Math.random() > 0.5,
      openhat: Math.random() > 0.9,
      crash: Math.random() > 0.95,
      ride: Math.random() > 0.9,
      clap: Math.random() > 0.85,
      perc: Math.random() > 0.8,
    })));
  };

  const getStepColor = (stepIndex: number, drumId: string) => {
    const drum = drumPads.find(d => d.id === drumId);
    const isActive = pattern[stepIndex][drumId as keyof SequenceStep];
    const isCurrent = stepIndex === currentStep && isPlaying;
    
    if (isCurrent && isActive) return drum?.color || '#fff';
    if (isCurrent) return '#fff';
    if (isActive) return drum?.color || '#666';
    return '#333';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Beat Sequencer</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="save" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="folder" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Transport Controls */}
      <View style={styles.transportContainer}>
        <TouchableOpacity
          style={[styles.playButton, isPlaying && styles.playButtonActive]}
          onPress={() => setIsPlaying(!isPlaying)}
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.stopButton}
          onPress={() => {
            setIsPlaying(false);
            setCurrentStep(0);
          }}
        >
          <Ionicons name="stop" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.bpmContainer}>
          <Text style={styles.bpmLabel}>BPM</Text>
          <Text style={styles.bpmValue}>{bpm}</Text>
          <View style={styles.bpmControls}>
            <TouchableOpacity
              style={styles.bpmButton}
              onPress={() => setBpm(Math.max(60, bpm - 5))}
            >
              <Ionicons name="remove" size={16} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bpmButton}
              onPress={() => setBpm(Math.min(200, bpm + 5))}
            >
              <Ionicons name="add" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
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
            <TouchableOpacity
              style={[
                styles.drumLabel,
                { backgroundColor: drum.color },
                selectedDrum === drum.id && styles.drumLabelSelected
              ]}
              onPress={() => handleDrumPadPress(drum.id)}
            >
              <Text style={styles.drumLabelText}>{drum.name}</Text>
            </TouchableOpacity>
            
            <View style={styles.stepsRow}>
              {Array(16).fill(null).map((_, stepIndex) => (
                <TouchableOpacity
                  key={stepIndex}
                  style={[
                    styles.stepButton,
                    { backgroundColor: getStepColor(stepIndex, drum.id) }
                  ]}
                  onPress={() => toggleStep(stepIndex, drum.id)}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Drum Pads */}
      <View style={styles.drumPadsContainer}>
        <Text style={styles.drumPadsTitle}>Drum Pads</Text>
        <View style={styles.drumPadsGrid}>
          {drumPads.map(drum => (
            <TouchableOpacity
              key={drum.id}
              style={[
                styles.drumPad,
                { backgroundColor: drum.color },
                selectedDrum === drum.id && styles.drumPadSelected
              ]}
              onPress={() => handleDrumPadPress(drum.id)}
            >
              <Text style={styles.drumPadText}>{drum.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Pattern Controls */}
      <View style={styles.patternControls}>
        <TouchableOpacity style={styles.patternButton} onPress={clearPattern}>
          <Ionicons name="trash" size={16} color="#ff4444" />
          <Text style={[styles.patternButtonText, { color: '#ff4444' }]}>Clear</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.patternButton} onPress={randomizePattern}>
          <Ionicons name="shuffle" size={16} color="#fff" />
          <Text style={styles.patternButtonText}>Random</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.patternButton}>
          <Ionicons name="copy" size={16} color="#fff" />
          <Text style={styles.patternButtonText}>Copy</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.patternButton}>
          <Ionicons name="clipboard" size={16} color="#fff" />
          <Text style={styles.patternButtonText}>Paste</Text>
        </TouchableOpacity>
      </View>

      {/* Volume Control */}
      <View style={styles.volumeContainer}>
        <Ionicons name="volume-medium" size={20} color="#fff" />
        <Text style={styles.volumeText}>Master: {Math.round(volume * 100)}%</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#2a2a2a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
    backgroundColor: '#333',
    borderRadius: 6,
  },
  transportContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#2a2a2a',
    gap: 16,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonActive: {
    backgroundColor: '#00ff00',
  },
  stopButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bpmContainer: {
    alignItems: 'center',
  },
  bpmLabel: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 4,
  },
  bpmValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bpmControls: {
    flexDirection: 'row',
    gap: 8,
  },
  bpmButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sequencerContainer: {
    flex: 1,
    padding: 16,
  },
  stepNumbers: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingLeft: 80,
  },
  stepNumber: {
    width: 30,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  stepNumberActive: {
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  stepNumberText: {
    color: '#666',
    fontSize: 10,
    fontWeight: '500',
  },
  stepNumberTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sequencerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  drumLabel: {
    width: 70,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  drumLabelSelected: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  drumLabelText: {
    color: '#1a1a1a',
    fontSize: 11,
    fontWeight: 'bold',
  },
  stepsRow: {
    flexDirection: 'row',
    flex: 1,
  },
  stepButton: {
    width: 30,
    height: 32,
    backgroundColor: '#333',
    marginRight: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#555',
  },
  drumPadsContainer: {
    backgroundColor: '#2a2a2a',
    padding: 16,
  },
  drumPadsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  drumPadsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  drumPad: {
    width: (screenWidth - 64) / 4 - 6,
    height: 60,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drumPadSelected: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  drumPadText: {
    color: '#1a1a1a',
    fontSize: 12,
    fontWeight: 'bold',
  },
  patternControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#333',
  },
  patternButton: {
    alignItems: 'center',
    padding: 8,
    gap: 4,
  },
  patternButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#2a2a2a',
    gap: 8,
  },
  volumeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});