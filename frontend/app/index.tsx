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
import Svg, { Path, Line, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';

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
      name: 'Praise Guitar',
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
      name: 'Worship Vocals',
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
      name: 'Foundation Bass',
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
      name: 'Holy Drums',
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
    }
  ],
  isPlaying: false,
  currentProject: null,
  tempo: 120,
  playbackPosition: 0.3,
  
  addTrack: () => {
    const instruments = ['guitar', 'vocal', 'bass', 'drums', 'keys'];
    const colors = ['#ff6b6b', '#ff9f40', '#ffcd56', '#4bc0c0', '#9966ff'];
    const names = ['Divine Guitar', 'Sacred Vocals', 'Holy Bass', 'Blessed Drums', 'Worship Keys'];
    const trackCount = get().tracks.length;
    const instrument = instruments[trackCount % instruments.length];
    const color = colors[trackCount % colors.length];
    const name = names[trackCount % names.length];
    
    const newTrack: Track = {
      id: `track_${Date.now()}`,
      name,
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
        Alert.alert('Permission required', 'Audio recording permission is needed for worship recording');
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
      Alert.alert('Error', 'Failed to start blessed recording');
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
      Alert.alert('Error', 'Failed to complete blessed recording');
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

// Cross SVG Component
const CrossIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <LinearGradient id="crossGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={color} stopOpacity="1" />
        <Stop offset="50%" stopColor="#ffcd56" stopOpacity="0.9" />
        <Stop offset="100%" stopColor={color} stopOpacity="0.8" />
      </LinearGradient>
    </Defs>
    <Path
      d="M12 2L12 8L18 8L18 10L12 10L12 14L18 14L18 16L12 16L12 22L10 22L10 16L4 16L4 14L10 14L10 10L4 10L4 8L10 8L10 2L12 2Z"
      fill="url(#crossGradient)"
      stroke={color}
      strokeWidth="0.5"
    />
  </Svg>
);

// Large Decorative Cross
const DecorateCross: React.FC<{ width: number; height: number }> = ({ width, height }) => (
  <Svg width={width} height={height} style={styles.backgroundDecoration}>
    <Defs>
      <LinearGradient id="largeCrossGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#ff4500" stopOpacity="0.15" />
        <Stop offset="50%" stopColor="#ffcd56" stopOpacity="0.1" />
        <Stop offset="100%" stopColor="#ff4500" stopOpacity="0.05" />
      </LinearGradient>
    </Defs>
    {/* Large Cross Background */}
    <Path
      d="M180 20L180 120L120 120L120 140L180 140L180 240L200 240L200 140L260 140L260 120L200 120L200 20L180 20Z"
      fill="url(#largeCrossGradient)"
      stroke="#ff4500"
      strokeWidth="1"
      opacity="0.3"
    />
    {/* Small crosses scattered */}
    <Path d="M50 150L50 130L55 130L55 150L65 150L65 155L55 155L55 170L50 170L50 155L40 155L40 150L50 150Z" fill="url(#largeCrossGradient)" />
    <Path d="M320 200L320 185L325 185L325 200L335 200L335 205L325 205L325 220L320 220L320 205L310 205L310 200L320 200Z" fill="url(#largeCrossGradient)" />
  </Svg>
);

// Waveform Component
const WaveformDisplay: React.FC<{ waveformData: number[], color: string, isPlaying: boolean }> = ({ 
  waveformData, 
  color, 
  isPlaying 
}) => {
  const waveformWidth = width - 140;
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
        <Text style={styles.trackName}>{track.name}</Text>
        <Text style={styles.bpmText}>{track.bpm} BPM</Text>
        <View style={styles.trackControls}>
          <TouchableOpacity 
            style={[styles.trackControlButton, track.isRecording && styles.recordingActive]}
            onPress={() => track.isRecording ? stopRecording(track.id) : startRecording(track.id)}
          >
            <View style={[styles.recordDot, track.isRecording && styles.recordingDot]} />
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

// Navigation Component
const NavigationBar: React.FC = () => {
  const router = useRouter();
  
  return (
    <View style={styles.navigationBar}>
      <TouchableOpacity 
        style={[styles.navButton, styles.activeNavButton]}
      >
        <Ionicons name="recording" size={20} color="#ffffff" />
        <Text style={styles.navButtonText}>Multitrack</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => router.push('/effects')}
      >
        <Ionicons name="options" size={20} color="#ffb366" />
        <Text style={[styles.navButtonText, styles.inactiveNavText]}>Effects</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => router.push('/sequencer')}
      >
        <Ionicons name="grid" size={20} color="#ffb366" />
        <Text style={[styles.navButtonText, styles.inactiveNavText]}>Beats</Text>
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

// Main DAW Component
export default function DAWApp() {
  const { tracks, addTrack, isPlaying, playbackPosition } = useDAWStore();
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
      
      {/* Background Cross */}
      <DecorateCross width={400} height={800} />
      
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
          <View style={[styles.progressFill, { width: `${playbackPosition * 100}%` }]} />
        </View>
      </View>
      
      {/* Add Track Button */}
      <View style={styles.addTrackContainer}>
        <TouchableOpacity style={styles.addTrackButton} onPress={addTrack}>
          <CrossIcon size={16} color="#ffffff" />
          <Text style={styles.addTrackText}>Add Blessed Track</Text>
        </TouchableOpacity>
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
            <Ionicons name="play-back" size={18} color="#ff4500" />
          </View>
          <Text style={styles.transportLabel}>Previous</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.transportButton}
          onPress={() => setMasterPlay(!masterPlay)}
        >
          <View style={[styles.transportIcon, styles.mainTransportIcon, masterPlay && styles.transportActive]}>
            <Ionicons name={masterPlay ? "pause" : "play"} size={24} color="#ffffff" />
          </View>
          <Text style={styles.transportLabel}>{masterPlay ? 'Pause' : 'Play'}</Text>
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
        
        <TouchableOpacity style={styles.transportButton}>
          <View style={styles.transportIcon}>
            <Ionicons name="play-forward" size={18} color="#ff4500" />
          </View>
          <Text style={styles.transportLabel}>Next</Text>
        </TouchableOpacity>
      </View>
      
      {/* Sacred Footer */}
      <View style={styles.sacredFooter}>
        <CrossIcon size={24} color="#ffcd56" />
        <Text style={styles.blessingText}>"Make a joyful noise unto the Lord"</Text>
        <CrossIcon size={24} color="#ffcd56" />
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