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
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="save" size={20} color="#fff" />
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
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2a2a2a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  appTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
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
  transportButton: {
    padding: 12,
    backgroundColor: '#333',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainPlayButton: {
    backgroundColor: '#007AFF',
    padding: 16,
  },
  tempoText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 16,
  },
  tracksSection: {
    flex: 1,
    padding: 16,
  },
  tracksSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tracksSectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addTrackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#007AFF',
    borderRadius: 6,
    gap: 4,
  },
  addTrackText: {
    color: '#fff',
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
    color: '#666',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyTracksSubtext: {
    color: '#555',
    fontSize: 14,
    marginTop: 8,
  },
  trackContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  trackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trackName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 4,
  },
  trackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingButton: {
    backgroundColor: '#ff4444',
  },
  playingButton: {
    backgroundColor: '#00ff00',
  },
  activeButton: {
    backgroundColor: '#ffa500',
  },
  controlButtonText: {
    color: '#ffa500',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeButtonText: {
    color: '#fff',
  },
  volumeContainer: {
    marginBottom: 8,
  },
  volumeLabel: {
    color: '#ccc',
    fontSize: 12,
  },
  waveformContainer: {
    height: 40,
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveformPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveformText: {
    color: '#00ff00',
    fontSize: 12,
  },
  emptyWaveform: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWaveformText: {
    color: '#666',
    fontSize: 12,
  },
});