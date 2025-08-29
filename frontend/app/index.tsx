import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  StatusBar,
  Dimensions
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import Svg, { Path, Line, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// DAW Store using Zustand
import { create } from 'zustand';

interface Track {
  id: string;
  name: string;
  instrument: string;
  color: string;
  audio_data?: string;
  duration?: number;
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  recording?: Audio.Recording;
  sound?: Audio.Sound;
  isRecording: boolean;
  isPlaying: boolean;
  bpm: number;
  waveformData: number[];
}

interface DAWStore {
  tracks: Track[];
  isPlaying: boolean;
  currentProject: string | null;
  tempo: number;
  playbackPosition: number;
  addTrack: () => void;
  removeTrack: (id: string) => void;
  updateTrack: (id: string, updates: Partial<Track>) => void;
  startRecording: (trackId: string) => void;
  stopRecording: (trackId: string) => void;
  playTrack: (trackId: string) => void;
  stopTrack: (trackId: string) => void;
  toggleMute: (trackId: string) => void;
  toggleSolo: (trackId: string) => void;
  setVolume: (trackId: string, volume: number) => void;
  setPlaybackPosition: (position: number) => void;
}

// Generate realistic waveform data
const generateWaveformData = (instrument: string) => {
  const data: number[] = [];
  const length = 200;
  
  for (let i = 0; i < length; i++) {
    const t = i / length;
    let amplitude = 0;
    
    // Different waveform patterns based on instrument
    switch (instrument) {
      case 'guitar':
        amplitude = Math.sin(t * 12) * Math.exp(-t * 2) * (0.6 + Math.random() * 0.4);
        break;
      case 'drums':
        amplitude = Math.random() > 0.8 ? (0.8 + Math.random() * 0.4) : Math.random() * 0.3;
        break;
      case 'vocal':
        amplitude = Math.sin(t * 8) * (0.4 + Math.sin(t * 20) * 0.3) * (0.7 + Math.random() * 0.3);
        break;
      case 'bass':
        amplitude = Math.sin(t * 6) * Math.exp(-t * 1.5) * (0.5 + Math.random() * 0.3);
        break;
      case 'keys':
        amplitude = Math.sin(t * 10) * Math.exp(-t * 2.5) * (0.6 + Math.random() * 0.2);
        break;
      default:
        amplitude = Math.sin(t * 8) * (0.5 + Math.random() * 0.3);
    }
    
    data.push(Math.max(0, Math.min(1, Math.abs(amplitude))));
  }
  
  return data;
};

const useDAWStore = create<DAWStore>((set, get) => ({
  tracks: [
    {
      id: 'track_1',
      name: 'Lead Guitar',
      instrument: 'guitar',
      color: '#ff6b6b',
      volume: 1.0,
      pan: 0.0,
      muted: false,
      solo: false,
      isRecording: false,
      isPlaying: false,
      bpm: 120,
      waveformData: generateWaveformData('guitar'),
      audio_data: 'sample_data'
    },
    {
      id: 'track_2',
      name: 'Vocals',
      instrument: 'vocal',
      color: '#ff9f40',
      volume: 0.9,
      pan: 0.0,
      muted: false,
      solo: false,
      isRecording: false,
      isPlaying: false,
      bpm: 120,
      waveformData: generateWaveformData('vocal'),
      audio_data: 'sample_data'
    },
    {
      id: 'track_3',
      name: 'Bass Guitar',
      instrument: 'bass',
      color: '#ffcd56',
      volume: 0.8,
      pan: 0.0,
      muted: false,
      solo: false,
      isRecording: false,
      isPlaying: false,
      bpm: 120,
      waveformData: generateWaveformData('bass'),
      audio_data: 'sample_data'
    },
    {
      id: 'track_4',
      name: 'Drums',
      instrument: 'drums',
      color: '#c9cbcf',
      volume: 1.0,
      pan: 0.0,
      muted: false,
      solo: false,
      isRecording: false,
      isPlaying: false,
      bpm: 120,
      waveformData: generateWaveformData('drums'),
      audio_data: 'sample_data'
    },
    {
      id: 'track_5',
      name: 'Synth Keys',
      instrument: 'keys',
      color: '#9966ff',
      volume: 0.7,
      pan: 0.0,
      muted: false,
      solo: false,
      isRecording: false,
      isPlaying: false,
      bpm: 120,
      waveformData: generateWaveformData('keys'),
      audio_data: 'sample_data'
    }
  ],
  isPlaying: false,
  currentProject: null,
  tempo: 120,
  playbackPosition: 0.3,
  
  addTrack: () => {
    const instruments = ['guitar', 'vocal', 'bass', 'drums', 'keys'];
    const colors = ['#ff6b6b', '#ff9f40', '#ffcd56', '#4bc0c0', '#9966ff'];
    const trackCount = get().tracks.length;
    const instrument = instruments[trackCount % instruments.length];
    const color = colors[trackCount % colors.length];
    
    const newTrack: Track = {
      id: `track_${Date.now()}`,
      name: `Track ${trackCount + 1}`,
      instrument,
      color,
      volume: 1.0,
      pan: 0.0,
      muted: false,
      solo: false,
      isRecording: false,
      isPlaying: false,
      bpm: 120,
      waveformData: generateWaveformData(instrument)
    };
    set(state => ({ tracks: [...state.tracks, newTrack] }));
  },
  
  removeTrack: (id: string) => {
    set(state => ({ 
      tracks: state.tracks.filter(track => track.id !== id)
    }));
  },
  
  updateTrack: (id: string, updates: Partial<Track>) => {
    set(state => ({
      tracks: state.tracks.map(track => 
        track.id === id ? { ...track, ...updates } : track
      )
    }));
  },
  
  startRecording: async (trackId: string) => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Audio recording permission is needed');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      
      get().updateTrack(trackId, { recording, isRecording: true });
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  },
  
  stopRecording: async (trackId: string) => {
    const track = get().tracks.find(t => t.id === trackId);
    if (!track?.recording) return;
    
    try {
      await track.recording.stopAndUnloadAsync();
      const uri = track.recording.getURI();
      
      if (uri) {
        const response = await fetch(uri);
        const blob = await response.blob();
        const reader = new FileReader();
        
        reader.onloadend = () => {
          const base64 = reader.result as string;
          get().updateTrack(trackId, { 
            audio_data: base64,
            recording: undefined,
            isRecording: false
          });
        };
        reader.readAsDataURL(blob);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  },
  
  playTrack: async (trackId: string) => {
    const track = get().tracks.find(t => t.id === trackId);
    if (!track?.audio_data) return;
    
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: track.audio_data },
        { shouldPlay: true, volume: track.volume }
      );
      
      get().updateTrack(trackId, { sound, isPlaying: true });
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          get().updateTrack(trackId, { isPlaying: false });
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Failed to play track:', error);
    }
  },
  
  stopTrack: async (trackId: string) => {
    const track = get().tracks.find(t => t.id === trackId);
    if (track?.sound) {
      await track.sound.stopAsync();
      await track.sound.unloadAsync();
      get().updateTrack(trackId, { sound: undefined, isPlaying: false });
    }
  },
  
  toggleMute: (trackId: string) => {
    const track = get().tracks.find(t => t.id === trackId);
    if (track) {
      get().updateTrack(trackId, { muted: !track.muted });
    }
  },
  
  toggleSolo: (trackId: string) => {
    const track = get().tracks.find(t => t.id === trackId);
    if (track) {
      get().updateTrack(trackId, { solo: !track.solo });
    }
  },
  
  setVolume: (trackId: string, volume: number) => {
    const track = get().tracks.find(t => t.id === trackId);
    if (track?.sound) {
      track.sound.setVolumeAsync(volume);
    }
    get().updateTrack(trackId, { volume });
  },
  
  setPlaybackPosition: (position: number) => {
    set({ playbackPosition: position });
  }
}));

// Waveform Component
const WaveformDisplay: React.FC<{ waveformData: number[], color: string, isPlaying: boolean }> = ({ 
  waveformData, 
  color, 
  isPlaying 
}) => {
  const waveformWidth = width - 120;
  const waveformHeight = 50;
  
  const generatePath = () => {
    let path = '';
    const centerY = waveformHeight / 2;
    
    waveformData.forEach((amplitude, index) => {
      const x = (index / waveformData.length) * waveformWidth;
      const y1 = centerY - (amplitude * centerY * 0.8);
      const y2 = centerY + (amplitude * centerY * 0.8);
      
      if (index === 0) {
        path += `M ${x} ${y1}`;
      } else {
        path += ` L ${x} ${y1}`;
      }
    });
    
    // Add bottom path
    for (let i = waveformData.length - 1; i >= 0; i--) {
      const x = (i / waveformData.length) * waveformWidth;
      const amplitude = waveformData[i];
      const y2 = (waveformHeight / 2) + (amplitude * (waveformHeight / 2) * 0.8);
      path += ` L ${x} ${y2}`;
    }
    
    path += ' Z';
    return path;
  };
  
  return (
    <Svg width={waveformWidth} height={waveformHeight} style={styles.waveform}>
      <Defs>
        <LinearGradient id="waveformGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor={color} stopOpacity="0.8" />
          <Stop offset="100%" stopColor={color} stopOpacity="0.3" />
        </LinearGradient>
      </Defs>
      <Path
        d={generatePath()}
        fill="url(#waveformGradient)"
        stroke={color}
        strokeWidth="1"
      />
    </Svg>
  );
};

// Track Component
const TrackStrip: React.FC<{ track: Track, index: number }> = ({ track, index }) => {
  const { 
    startRecording, 
    stopRecording, 
    playTrack, 
    stopTrack, 
    toggleMute, 
    toggleSolo, 
    removeTrack 
  } = useDAWStore();

  const getInstrumentIcon = (instrument: string) => {
    switch (instrument) {
      case 'guitar': return 'musical-note';
      case 'vocal': return 'mic';
      case 'bass': return 'radio';
      case 'drums': return 'radio-button-on';
      case 'keys': return 'keypad';
      default: return 'musical-notes';
    }
  };

  return (
    <View style={[styles.trackStrip, { borderColor: track.color }]}>
      {/* Track Icon */}
      <View style={[styles.trackIcon, { backgroundColor: track.color }]}>
        <Ionicons 
          name={getInstrumentIcon(track.instrument)} 
          size={24} 
          color="#ffffff" 
        />
      </View>
      
      {/* Waveform Display */}
      <View style={styles.waveformContainer}>
        <WaveformDisplay 
          waveformData={track.waveformData} 
          color={track.color}
          isPlaying={track.isPlaying}
        />
      </View>
      
      {/* Track Info */}
      <View style={styles.trackInfo}>
        <Text style={styles.bpmText}>{track.bpm} BPM</Text>
        <View style={styles.trackControls}>
          <TouchableOpacity 
            style={[styles.trackControlButton, track.isRecording && styles.recordingActive]}
            onPress={() => track.isRecording ? stopRecording(track.id) : startRecording(track.id)}
          >
            <View style={styles.recordDot} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.trackControlButton, track.muted && styles.muteActive]}
            onPress={() => toggleMute(track.id)}
          >
            <View style={styles.controlDot} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.trackControlButton, track.solo && styles.soloActive]}
            onPress={() => toggleSolo(track.id)}
          >
            <View style={styles.controlDot} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Main DAW Component
export default function DAWApp() {
  const { tracks, addTrack, isPlaying, playbackPosition, setPlaybackPosition } = useDAWStore();
  const router = useRouter();
  const [masterPlay, setMasterPlay] = useState(false);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a0f0f" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.appTitle}>Multi Track Recording</Text>
        <TouchableOpacity style={styles.menuButton}>
          <View style={styles.menuLines}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </View>
        </TouchableOpacity>
      </View>
      
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${playbackPosition * 100}%` }]} />
        </View>
      </View>
      
      {/* Tracks */}
      <ScrollView style={styles.tracksScrollView} showsVerticalScrollIndicator={false}>
        {tracks.map((track, index) => (
          <TrackStrip key={track.id} track={track} index={index} />
        ))}
      </ScrollView>
      
      {/* Transport Controls */}
      <View style={styles.transportContainer}>
        <TouchableOpacity style={styles.transportButton}>
          <View style={styles.transportIcon}>
            <Ionicons name="play" size={20} color="#ff4500" />
          </View>
          <Text style={styles.transportLabel}>Play</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.transportButton}
          onPress={() => setMasterPlay(!masterPlay)}
        >
          <View style={[styles.transportIcon, masterPlay && styles.transportActive]}>
            <Ionicons name={masterPlay ? "pause" : "play"} size={20} color="#ff4500" />
          </View>
          <Text style={styles.transportLabel}>Play</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.transportButton}>
          <View style={styles.transportIcon}>
            <View style={styles.recordButton} />
          </View>
          <Text style={styles.transportLabel}>Record</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.transportButton}>
          <View style={styles.transportIcon}>
            <View style={styles.recordButton} />
          </View>
          <Text style={styles.transportLabel}>Record</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.transportButton}>
          <View style={styles.transportIcon}>
            <View style={styles.stopButton} />
          </View>
          <Text style={styles.transportLabel}>Stop</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
    backgroundColor: '#2a1a1a',
  },
  backButton: {
    padding: 8,
  },
  appTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  menuButton: {
    padding: 8,
  },
  menuLines: {
    gap: 3,
  },
  menuLine: {
    width: 20,
    height: 2,
    backgroundColor: '#ffffff',
    borderRadius: 1,
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
  tracksScrollView: {
    flex: 1,
    padding: 16,
  },
  trackStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(42, 26, 26, 0.8)',
    borderRadius: 12,
    padding: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  trackIcon: {
    width: 50,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  waveformContainer: {
    flex: 1,
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 12,
  },
  waveform: {
    flex: 1,
  },
  trackInfo: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  bpmText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  trackControls: {
    flexDirection: 'row',
    gap: 4,
  },
  trackControlButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff4444',
  },
  controlDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  recordingActive: {
    backgroundColor: '#ff4444',
  },
  muteActive: {
    backgroundColor: '#ffaa00',
  },
  soloActive: {
    backgroundColor: '#00ff00',
  },
  transportContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 32,
    paddingVertical: 20,
    backgroundColor: '#2a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#4a2a2a',
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
    backgroundColor: '#ff4500',
  },
  recordButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ff4500',
  },
  stopButton: {
    width: 16,
    height: 4,
    backgroundColor: '#ff4500',
    borderRadius: 2,
  },
  transportLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
});