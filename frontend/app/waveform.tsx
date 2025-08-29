import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  PanGestureHandler,
  State,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Svg, { Path, Line, Rect } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface WaveformData {
  peaks: number[];
  duration: number;
  sampleRate: number;
}

interface WaveformViewerProps {
  waveformData: WaveformData | null;
  isPlaying: boolean;
  currentTime: number;
  onSeek: (time: number) => void;
  onZoom: (scale: number) => void;
  zoomScale: number;
}

// Generate sample waveform data for demonstration
const generateSampleWaveform = (): WaveformData => {
  const duration = 180; // 3 minutes
  const sampleRate = 44100;
  const peaks: number[] = [];
  
  // Generate realistic audio waveform pattern
  for (let i = 0; i < 1000; i++) {
    const t = i / 1000;
    let amplitude = 0;
    
    // Add multiple frequency components for realistic waveform
    amplitude += Math.sin(t * 2 * Math.PI * 0.5) * 0.6; // Low frequency
    amplitude += Math.sin(t * 2 * Math.PI * 2) * 0.3; // Mid frequency
    amplitude += Math.sin(t * 2 * Math.PI * 8) * 0.1; // High frequency
    
    // Add some randomness and envelope
    const envelope = Math.exp(-t * 2) + 0.2; // Decay envelope
    amplitude *= envelope * (0.8 + Math.random() * 0.4);
    
    peaks.push(Math.max(0, Math.min(1, Math.abs(amplitude))));
  }
  
  return { peaks, duration, sampleRate };
};

const WaveformViewer: React.FC<WaveformViewerProps> = ({
  waveformData,
  isPlaying,
  currentTime,
  onSeek,
  onZoom,
  zoomScale
}) => {
  const [viewportStart, setViewportStart] = useState(0);
  const waveformWidth = screenWidth - 32;
  const waveformHeight = 120;
  
  if (!waveformData) {
    return (
      <View style={styles.emptyWaveform}>
        <Ionicons name="pulse" size={48} color="#666" />
        <Text style={styles.emptyWaveformText}>No audio loaded</Text>
      </View>
    );
  }
  
  const { peaks, duration } = waveformData;
  const totalWidth = waveformWidth * zoomScale;
  const samplesPerPixel = peaks.length / totalWidth;
  
  // Generate waveform path
  const generateWaveformPath = () => {
    let path = '';
    const centerY = waveformHeight / 2;
    
    for (let x = 0; x < waveformWidth; x++) {
      const sampleIndex = Math.floor((viewportStart + x) * samplesPerPixel);
      const amplitude = peaks[sampleIndex] || 0;
      const y = centerY - (amplitude * centerY * 0.8);
      
      if (x === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    }
    
    return path;
  };
  
  const handleSeek = (x: number) => {
    const timeRatio = (viewportStart + x) / totalWidth;
    const seekTime = timeRatio * duration;
    onSeek(seekTime);
  };
  
  const playheadPosition = ((currentTime / duration) * totalWidth) - viewportStart;
  
  return (
    <View style={styles.waveformContainer}>
      <TouchableOpacity
        style={styles.waveformTouchArea}
        onPress={(event) => {
          const x = event.nativeEvent.locationX;
          handleSeek(x);
        }}
      >
        <Svg width={waveformWidth} height={waveformHeight} style={styles.waveformSvg}>
          {/* Background grid */}
          <Line
            x1={0}
            y1={waveformHeight / 2}
            x2={waveformWidth}
            y2={waveformHeight / 2}
            stroke="#333"
            strokeWidth={1}
          />
          
          {/* Waveform path */}
          <Path
            d={generateWaveformPath()}
            stroke="#00ff00"
            strokeWidth={2}
            fill="none"
          />
          
          {/* Played portion */}
          {playheadPosition > 0 && playheadPosition < waveformWidth && (
            <Rect
              x={0}
              y={0}
              width={Math.max(0, playheadPosition)}
              height={waveformHeight}
              fill="rgba(0, 255, 0, 0.2)"
            />
          )}
          
          {/* Playhead */}
          {playheadPosition >= 0 && playheadPosition <= waveformWidth && (
            <Line
              x1={playheadPosition}
              y1={0}
              x2={playheadPosition}
              y2={waveformHeight}
              stroke="#fff"
              strokeWidth={2}
            />
          )}
        </Svg>
      </TouchableOpacity>
    </View>
  );
};

export default function WaveformEditor() {
  const router = useRouter();
  const [sampleWaveform] = useState(generateSampleWaveform());
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);
  const [selectedTrack, setSelectedTrack] = useState(0);
  
  const tracks = [
    { id: 0, name: 'Lead Vocal', waveform: sampleWaveform, volume: 0.8 },
    { id: 1, name: 'Guitar', waveform: sampleWaveform, volume: 0.6 },
    { id: 2, name: 'Drums', waveform: sampleWaveform, volume: 1.0 },
  ];
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 0.1;
          return next >= sampleWaveform.duration ? 0 : next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, sampleWaveform.duration]);
  
  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };
  
  const handleZoom = (scale: number) => {
    setZoomScale(scale);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Waveform Editor</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="cut" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="copy" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Time Display */}
      <View style={styles.timeDisplay}>
        <Text style={styles.timeText}>
          {formatTime(currentTime)} / {formatTime(sampleWaveform.duration)}
        </Text>
      </View>
      
      {/* Tracks List */}
      <ScrollView horizontal style={styles.tracksList}>
        {tracks.map(track => (
          <TouchableOpacity
            key={track.id}
            style={[
              styles.trackTab,
              selectedTrack === track.id && styles.trackTabActive
            ]}
            onPress={() => setSelectedTrack(track.id)}
          >
            <Text style={[
              styles.trackTabText,
              selectedTrack === track.id && styles.trackTabTextActive
            ]}>
              {track.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Main Waveform Display */}
      <View style={styles.mainWaveformArea}>
        <WaveformViewer
          waveformData={tracks[selectedTrack]?.waveform || null}
          isPlaying={isPlaying}
          currentTime={currentTime}
          onSeek={handleSeek}
          onZoom={handleZoom}
          zoomScale={zoomScale}
        />
        
        {/* Waveform Controls */}
        <View style={styles.waveformControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleZoom(Math.max(0.5, zoomScale - 0.5))}
          >
            <Ionicons name="remove" size={20} color="#fff" />
          </TouchableOpacity>
          
          <Text style={styles.zoomText}>Zoom: {zoomScale.toFixed(1)}x</Text>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleZoom(Math.min(10, zoomScale + 0.5))}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Multi-track Timeline */}
      <View style={styles.timelineContainer}>
        <Text style={styles.timelineTitle}>Multi-track Timeline</Text>
        <ScrollView style={styles.timeline}>
          {tracks.map(track => (
            <View key={track.id} style={styles.timelineTrack}>
              <View style={styles.trackInfo}>
                <Text style={styles.trackName}>{track.name}</Text>
                <Text style={styles.trackVolume}>Vol: {Math.round(track.volume * 100)}%</Text>
              </View>
              <View style={styles.miniWaveform}>
                <WaveformViewer
                  waveformData={track.waveform}
                  isPlaying={isPlaying}
                  currentTime={currentTime}
                  onSeek={handleSeek}
                  onZoom={() => {}}
                  zoomScale={0.5}
                />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
      
      {/* Transport Controls */}
      <View style={styles.transportControls}>
        <TouchableOpacity style={styles.transportButton}>
          <Ionicons name="play-back" size={20} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.transportButton, styles.playButton]}
          onPress={() => setIsPlaying(!isPlaying)}
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.transportButton}>
          <Ionicons name="play-forward" size={20} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.transportButton}>
          <Ionicons name="stop" size={20} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.transportButton}>
          <Ionicons name="recording" size={20} color="#ff4444" />
        </TouchableOpacity>
      </View>
      
      {/* Edit Tools */}
      <View style={styles.editTools}>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="cut" size={18} color="#fff" />
          <Text style={styles.editButtonText}>Cut</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="copy" size={18} color="#fff" />
          <Text style={styles.editButtonText}>Copy</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="clipboard" size={18} color="#fff" />
          <Text style={styles.editButtonText}>Paste</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="trash" size={18} color="#ff4444" />
          <Text style={[styles.editButtonText, { color: '#ff4444' }]}>Delete</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 20,
    backgroundColor: '#1e2a4a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
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
  },
  timeDisplay: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#162032',
  },
  timeText: {
    color: '#4a90e2',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  tracksList: {
    backgroundColor: '#1a2332',
  },
  trackTab: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  trackTabActive: {
    borderBottomColor: '#4a90e2',
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
  },
  trackTabText: {
    color: '#a8bce8',
    fontSize: 14,
    fontWeight: '600',
  },
  trackTabTextActive: {
    color: '#4a90e2',
    fontWeight: '700',
  },
  mainWaveformArea: {
    flex: 1,
    padding: 20,
  },
  waveformContainer: {
    backgroundColor: '#1a2332',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  waveformTouchArea: {
    width: '100%',
    height: 120,
  },
  waveformSvg: {
    backgroundColor: '#0f1419',
    borderRadius: 8,
  },
  emptyWaveform: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a2332',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.2)',
  },
  emptyWaveformText: {
    color: '#6b7d9e',
    fontSize: 14,
    marginTop: 8,
  },
  waveformControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(45, 74, 122, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  zoomText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  timelineContainer: {
    maxHeight: 220,
    backgroundColor: '#162032',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(74, 144, 226, 0.2)',
  },
  timelineTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  timeline: {
    flex: 1,
  },
  timelineTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#1a2332',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.2)',
  },
  trackInfo: {
    width: 120,
    paddingHorizontal: 16,
  },
  trackName: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  trackVolume: {
    color: '#a8bce8',
    fontSize: 10,
    marginTop: 4,
  },
  miniWaveform: {
    flex: 1,
    height: 40,
  },
  transportControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#162032',
    gap: 16,
  },
  transportButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(45, 74, 122, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  playButton: {
    backgroundColor: '#4a90e2',
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  editTools: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#1a2332',
  },
  editButton: {
    alignItems: 'center',
    padding: 12,
    gap: 6,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});