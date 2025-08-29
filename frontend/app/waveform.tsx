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
  timeDisplay: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#2a2a2a',
  },
  timeText: {
    color: '#00ff00',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  tracksList: {
    backgroundColor: '#333',
  },
  trackTab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  trackTabActive: {
    borderBottomColor: '#007AFF',
  },
  trackTabText: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '500',
  },
  trackTabTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  mainWaveformArea: {
    flex: 1,
    padding: 16,
  },
  waveformContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  waveformTouchArea: {
    width: '100%',
    height: 120,
  },
  waveformSvg: {
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
  },
  emptyWaveform: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
  },
  emptyWaveformText: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
  waveformControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  timelineContainer: {
    maxHeight: 200,
    backgroundColor: '#2a2a2a',
    padding: 16,
  },
  timelineTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  timeline: {
    flex: 1,
  },
  timelineTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: '#333',
    borderRadius: 6,
  },
  trackInfo: {
    width: 100,
    paddingHorizontal: 12,
  },
  trackName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  trackVolume: {
    color: '#ccc',
    fontSize: 10,
    marginTop: 2,
  },
  miniWaveform: {
    flex: 1,
    height: 40,
  },
  transportControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#2a2a2a',
    gap: 16,
  },
  transportButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    backgroundColor: '#007AFF',
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  editTools: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 12,
    backgroundColor: '#333',
  },
  editButton: {
    alignItems: 'center',
    padding: 8,
    gap: 4,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});