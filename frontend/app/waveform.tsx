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
import Svg, { Path, Line, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

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

// Sacred Background Graphics
const SacredBackground: React.FC<{ width: number; height: number }> = ({ width, height }) => (
  <Svg width={width} height={height} style={styles.backgroundDecoration}>
    <Defs>
      <LinearGradient id="sacredGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#ff4500" stopOpacity="0.1" />
        <Stop offset="50%" stopColor="#ffcd56" stopOpacity="0.05" />
        <Stop offset="100%" stopColor="#ff4500" stopOpacity="0.1" />
      </LinearGradient>
    </Defs>
    
    {/* Large Cross */}
    <Line x1="200" y1="50" x2="200" y2="200" stroke="url(#sacredGradient)" strokeWidth="4" />
    <Line x1="150" y1="100" x2="250" y2="100" stroke="url(#sacredGradient)" strokeWidth="4" />
    
    {/* Musical notes */}
    <Path d="M80 300 Q90 290 100 300 Q110 310 100 320 Q90 310 80 300Z" fill="url(#sacredGradient)" />
    <Line x1="320" y1="150" x2="320" y2="120" stroke="url(#sacredGradient)" strokeWidth="2" />
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
        style={[styles.navButton, styles.activeNavButton]}
      >
        <Ionicons name="pulse" size={20} color="#ffffff" />
        <Text style={styles.navButtonText}>Waveform</Text>
      </TouchableOpacity>
    </View>
  );
};

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
        <Text style={styles.emptyWaveformText}>No blessed audio loaded</Text>
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
            stroke="#4a2a2a"
            strokeWidth={1}
          />
          
          {/* Waveform path */}
          <Path
            d={generateWaveformPath()}
            stroke="#ff4500"
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
              fill="rgba(255, 69, 0, 0.2)"
            />
          )}
          
          {/* Playhead */}
          {playheadPosition >= 0 && playheadPosition <= waveformWidth && (
            <Line
              x1={playheadPosition}
              y1={0}
              x2={playheadPosition}
              y2={waveformHeight}
              stroke="#ffcd56"
              strokeWidth={3}
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
    { id: 0, name: 'Praise Vocal', waveform: sampleWaveform, volume: 0.8 },
    { id: 1, name: 'Worship Guitar', waveform: sampleWaveform, volume: 0.6 },
    { id: 2, name: 'Holy Drums', waveform: sampleWaveform, volume: 1.0 },
    { id: 3, name: 'Sacred Bass', waveform: sampleWaveform, volume: 0.7 },
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
      {/* Background Cross */}
      <SacredBackground width={400} height={800} />
      
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
          <View style={[styles.progressFill, { width: `${((currentTime / sampleWaveform.duration) * 100)}%` }]} />
        </View>
      </View>
      
      {/* Time Display */}
      <View style={styles.timeDisplay}>
        <CrossIcon size={16} color="#ff4500" />
        <Text style={styles.timeText}>
          {formatTime(currentTime)} / {formatTime(sampleWaveform.duration)}
        </Text>
        <CrossIcon size={16} color="#ff4500" />
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
            <CrossIcon size={12} color="#ff4500" />
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
          
          <Text style={styles.zoomText}>Sacred Zoom: {zoomScale.toFixed(1)}x</Text>
          
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
        <View style={styles.timelineTitleContainer}>
          <CrossIcon size={16} color="#ff4500" />
          <Text style={styles.timelineTitle}>Blessed Multi-track Timeline</Text>
          <CrossIcon size={16} color="#ff4500" />
        </View>
        <ScrollView style={styles.timeline}>
          {tracks.map(track => (
            <View key={track.id} style={styles.timelineTrack}>
              <View style={styles.trackInfo}>
                <View style={styles.trackNameContainer}>
                  <CrossIcon size={10} color="#ffcd56" />
                  <Text style={styles.trackName}>{track.name}</Text>
                </View>
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
          <Ionicons name="play-back" size={20} color="#ff4500" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.transportButton, styles.playButton]}
          onPress={() => setIsPlaying(!isPlaying)}
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.transportButton}>
          <Ionicons name="play-forward" size={20} color="#ff4500" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.transportButton}>
          <Ionicons name="stop" size={20} color="#ff4500" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.transportButton}>
          <Ionicons name="recording" size={20} color="#ff4444" />
        </TouchableOpacity>
      </View>
      
      {/* Edit Tools */}
      <View style={styles.editTools}>
        <TouchableOpacity style={styles.editButton}>
          <CrossIcon size={14} color="#ff4500" />
          <Ionicons name="cut" size={18} color="#fff" />
          <Text style={styles.editButtonText}>Sacred Cut</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.editButton}>
          <CrossIcon size={14} color="#ff4500" />
          <Ionicons name="copy" size={18} color="#fff" />
          <Text style={styles.editButtonText}>Blessed Copy</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.editButton}>
          <CrossIcon size={14} color="#ff4500" />
          <Ionicons name="clipboard" size={18} color="#fff" />
          <Text style={styles.editButtonText}>Holy Paste</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.editButton}>
          <CrossIcon size={14} color="#ff4500" />
          <Ionicons name="trash" size={18} color="#ff4444" />
          <Text style={[styles.editButtonText, { color: '#ff4444' }]}>Purify</Text>
        </TouchableOpacity>
      </View>

      {/* Sacred Footer */}
      <View style={styles.sacredFooter}>
        <CrossIcon size={24} color="#ffcd56" />
        <Text style={styles.blessingText}>"Sing to the Lord a new song"</Text>
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
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#2a1212',
    gap: 12,
  },
  timeText: {
    color: '#ff4500',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  tracksList: {
    backgroundColor: '#2a1a1a',
    zIndex: 5,
  },
  trackTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  trackTabActive: {
    borderBottomColor: '#ff4500',
    backgroundColor: 'rgba(255, 69, 0, 0.1)',
  },
  trackTabText: {
    color: '#ffb366',
    fontSize: 14,
    fontWeight: '600',
  },
  trackTabTextActive: {
    color: '#ff4500',
    fontWeight: '700',
  },
  mainWaveformArea: {
    flex: 1,
    padding: 20,
    zIndex: 5,
  },
  waveformContainer: {
    backgroundColor: '#2a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 69, 0, 0.3)',
    shadowColor: '#ff4500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  waveformTouchArea: {
    width: '100%',
    height: 120,
  },
  waveformSvg: {
    backgroundColor: '#1a0f0f',
    borderRadius: 8,
  },
  emptyWaveform: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a1a1a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 0, 0.2)',
  },
  emptyWaveformText: {
    color: '#cc6633',
    fontSize: 14,
    marginTop: 8,
    fontStyle: 'italic',
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
    backgroundColor: 'rgba(139, 69, 19, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 69, 0, 0.3)',
  },
  zoomText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  timelineContainer: {
    maxHeight: 220,
    backgroundColor: '#2a1212',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 69, 0, 0.2)',
    zIndex: 5,
  },
  timelineTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  timelineTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
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
    backgroundColor: '#2a1a1a',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 69, 0, 0.2)',
  },
  trackInfo: {
    width: 120,
    paddingHorizontal: 16,
  },
  trackNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  trackName: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  trackVolume: {
    color: '#ffb366',
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
    backgroundColor: '#2a1212',
    gap: 16,
    zIndex: 5,
  },
  transportButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(139, 69, 19, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 69, 0, 0.3)',
  },
  playButton: {
    backgroundColor: '#ff4500',
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#ff4500',
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
    backgroundColor: '#2a1a1a',
    zIndex: 5,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 4,
  },
  editButtonText: {
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
    color: '#ffcd56',
    fontSize: 12,
    fontStyle: 'italic',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});