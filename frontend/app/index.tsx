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

const { width, height } = Dimensions.get('window');

// DAW Store using Zustand
import { create } from 'zustand';

interface Track {
  id: string;
  name: string;
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
}

interface DAWStore {
  tracks: Track[];
  isPlaying: boolean;
  currentProject: string | null;
  tempo: number;
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
}

const useDAWStore = create<DAWStore>((set, get) => ({
  tracks: [],
  isPlaying: false,
  currentProject: null,
  tempo: 120,
  
  addTrack: () => {
    const newTrack: Track = {
      id: `track_${Date.now()}`,
      name: `Track ${get().tracks.length + 1}`,
      volume: 1.0,
      pan: 0.0,
      muted: false,
      solo: false,
      isRecording: false,
      isPlaying: false
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
        // Convert recording to base64 for storage
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
  }
}));

// Track Component
const TrackComponent: React.FC<{ track: Track }> = ({ track }) => {
  const { 
    startRecording, 
    stopRecording, 
    playTrack, 
    stopTrack, 
    toggleMute, 
    toggleSolo, 
    setVolume, 
    removeTrack 
  } = useDAWStore();

  const handleRecordToggle = () => {
    if (track.isRecording) {
      stopRecording(track.id);
    } else {
      startRecording(track.id);
    }
  };

  const handlePlayToggle = () => {
    if (track.isPlaying) {
      stopTrack(track.id);
    } else {
      playTrack(track.id);
    }
  };

  return (
    <View style={styles.trackContainer}>
      <View style={styles.trackHeader}>
        <Text style={styles.trackName}>{track.name}</Text>
        <TouchableOpacity 
          onPress={() => removeTrack(track.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash" size={16} color="#ff4444" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.trackControls}>
        {/* Record Button */}
        <TouchableOpacity
          style={[styles.controlButton, track.isRecording && styles.recordingButton]}
          onPress={handleRecordToggle}
        >
          <Ionicons 
            name={track.isRecording ? "stop" : "radio-button-on"} 
            size={24} 
            color={track.isRecording ? "#fff" : "#ff4444"} 
          />
        </TouchableOpacity>
        
        {/* Play Button */}
        <TouchableOpacity
          style={[styles.controlButton, track.isPlaying && styles.playingButton]}
          onPress={handlePlayToggle}
          disabled={!track.audio_data}
        >
          <Ionicons 
            name={track.isPlaying ? "pause" : "play"} 
            size={24} 
            color={track.audio_data ? (track.isPlaying ? "#fff" : "#00ff00") : "#666"} 
          />
        </TouchableOpacity>
        
        {/* Mute Button */}
        <TouchableOpacity
          style={[styles.controlButton, track.muted && styles.activeButton]}
          onPress={() => toggleMute(track.id)}
        >
          <Ionicons 
            name={track.muted ? "volume-mute" : "volume-medium"} 
            size={20} 
            color={track.muted ? "#fff" : "#ffa500"} 
          />
        </TouchableOpacity>
        
        {/* Solo Button */}
        <TouchableOpacity
          style={[styles.controlButton, track.solo && styles.activeButton]}
          onPress={() => toggleSolo(track.id)}
        >
          <Text style={[styles.controlButtonText, track.solo && styles.activeButtonText]}>S</Text>
        </TouchableOpacity>
      </View>
      
      {/* Volume Slider Placeholder */}
      <View style={styles.volumeContainer}>
        <Text style={styles.volumeLabel}>Vol: {Math.round(track.volume * 100)}%</Text>
      </View>
      
      {/* Waveform Placeholder */}
      <View style={styles.waveformContainer}>
        {track.audio_data ? (
          <View style={styles.waveformPlaceholder}>
            <Text style={styles.waveformText}>♪ Audio Recorded</Text>
          </View>
        ) : (
          <View style={styles.emptyWaveform}>
            <Text style={styles.emptyWaveformText}>No audio</Text>
          </View>
        )}
      </View>
    </View>
  );
};

// Transport Controls Component
const TransportControls: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { tracks, tempo } = useDAWStore();

  return (
    <View style={styles.transportContainer}>
      <TouchableOpacity style={styles.transportButton}>
        <Ionicons name="play-back" size={24} color="#fff" />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.transportButton, styles.mainPlayButton]}
        onPress={() => setIsPlaying(!isPlaying)}
      >
        <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="#fff" />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.transportButton}>
        <Ionicons name="play-forward" size={24} color="#fff" />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.transportButton}>
        <Ionicons name="stop" size={24} color="#fff" />
      </TouchableOpacity>
      
      <Text style={styles.tempoText}>BPM: {tempo}</Text>
    </View>
  );
};

// Main DAW Component
export default function DAWApp() {
  const { tracks, addTrack } = useDAWStore();
  const router = useRouter();

  useEffect(() => {
    // Initialize audio session
    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>ProDAW Studio</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.push('/waveform')}
          >
            <Ionicons name="pulse" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.push('/effects')}
          >
            <Ionicons name="options" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.push('/sequencer')}
          >
            <Ionicons name="grid" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.push('/samples')}
          >
            <Ionicons name="library" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="settings" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Transport Controls */}
      <TransportControls />
      
      {/* Tracks Section */}
      <View style={styles.tracksSection}>
        <View style={styles.tracksSectionHeader}>
          <Text style={styles.tracksSectionTitle}>Tracks ({tracks.length})</Text>
          <TouchableOpacity style={styles.addTrackButton} onPress={addTrack}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addTrackText}>Add Track</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.tracksContainer}>
          {tracks.length === 0 ? (
            <View style={styles.emptyTracksContainer}>
              <Ionicons name="musical-notes" size={48} color="#666" />
              <Text style={styles.emptyTracksText}>No tracks yet</Text>
              <Text style={styles.emptyTracksSubtext}>Tap "Add Track" to start recording</Text>
            </View>
          ) : (
            tracks.map(track => (
              <TrackComponent key={track.id} track={track} />
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1419',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
    backgroundColor: '#1e2a4a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
  },
  transportContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#162032',
    borderBottomWidth: 1,
    borderBottomColor: '#2d4a7a',
    gap: 20,
  },
  transportButton: {
    padding: 14,
    backgroundColor: 'rgba(45, 74, 122, 0.6)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  mainPlayButton: {
    backgroundColor: '#4a90e2',
    padding: 18,
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  tempoText: {
    color: '#a8bce8',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 16,
  },
  tracksSection: {
    flex: 1,
    padding: 16,
    backgroundColor: '#0f1419',
  },
  tracksSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  tracksSectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  addTrackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#4a90e2',
    borderRadius: 20,
    gap: 6,
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addTrackText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  tracksContainer: {
    flex: 1,
  },
  emptyTracksContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTracksText: {
    color: '#6b7d9e',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyTracksSubtext: {
    color: '#4a5568',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  trackContainer: {
    backgroundColor: '#1a2332',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  trackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  trackName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
  },
  trackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(45, 74, 122, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  recordingButton: {
    backgroundColor: '#ef4444',
    borderColor: '#f87171',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  playingButton: {
    backgroundColor: '#10b981',
    borderColor: '#34d399',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  activeButton: {
    backgroundColor: '#f59e0b',
    borderColor: '#fbbf24',
  },
  controlButtonText: {
    color: '#f59e0b',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeButtonText: {
    color: '#ffffff',
  },
  volumeContainer: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  volumeLabel: {
    color: '#a8bce8',
    fontSize: 12,
    fontWeight: '500',
  },
  waveformContainer: {
    height: 50,
    backgroundColor: '#0f1419',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.2)',
  },
  waveformPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveformText: {
    color: '#4a90e2',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyWaveform: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWaveformText: {
    color: '#6b7d9e',
    fontSize: 12,
  },
});