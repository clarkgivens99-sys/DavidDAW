import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  Slider,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Svg, { Path, Line, Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

interface EffectParameter {
  id: string;
  name: string;
  value: number;
  min: number;
  max: number;
  unit: string;
}

interface AudioEffect {
  id: string;
  name: string;
  type: 'equalizer' | 'compression' | 'reverb' | 'autotune' | 'delay' | 'distortion';
  enabled: boolean;
  parameters: EffectParameter[];
  icon: string;
}

const defaultEffects: AudioEffect[] = [
  {
    id: 'eq',
    name: 'Divine EQ',
    type: 'equalizer',
    enabled: false,
    icon: 'options',
    parameters: [
      { id: 'bass', name: 'Foundation', value: 0, min: -12, max: 12, unit: 'dB' },
      { id: 'mid', name: 'Soul', value: 0, min: -12, max: 12, unit: 'dB' },
      { id: 'treble', name: 'Heaven', value: 0, min: -12, max: 12, unit: 'dB' },
    ]
  },
  {
    id: 'compressor',
    name: 'Holy Compression',
    type: 'compression',
    enabled: false,
    icon: 'contract',
    parameters: [
      { id: 'threshold', name: 'Grace Threshold', value: -18, min: -40, max: 0, unit: 'dB' },
      { id: 'ratio', name: 'Divine Ratio', value: 4, min: 1, max: 20, unit: ':1' },
      { id: 'attack', name: 'Swift Mercy', value: 10, min: 1, max: 100, unit: 'ms' },
      { id: 'release', name: 'Eternal Peace', value: 100, min: 10, max: 1000, unit: 'ms' },
    ]
  },
  {
    id: 'reverb',
    name: 'Cathedral Reverb',
    type: 'reverb',
    enabled: false,
    icon: 'radio-wave',
    parameters: [
      { id: 'roomSize', name: 'Sacred Space', value: 0.5, min: 0, max: 1, unit: '' },
      { id: 'wetLevel', name: 'Holy Presence', value: 0.3, min: 0, max: 1, unit: '' },
      { id: 'dryLevel', name: 'Earthly Sound', value: 0.7, min: 0, max: 1, unit: '' },
    ]
  },
  {
    id: 'autotune',
    name: 'Angelic Tune',
    type: 'autotune',
    enabled: false,
    icon: 'musical-note',
    parameters: [
      { id: 'correction', name: 'Divine Correction', value: 50, min: 0, max: 100, unit: '%' },
      { id: 'key', name: 'Heavenly Key', value: 0, min: -6, max: 6, unit: 'semi' },
    ]
  },
  {
    id: 'delay',
    name: 'Echo of Eternity',
    type: 'delay',
    enabled: false,
    icon: 'repeat',
    parameters: [
      { id: 'time', name: 'Time Divine', value: 250, min: 1, max: 1000, unit: 'ms' },
      { id: 'feedback', name: 'Eternal Echo', value: 0.3, min: 0, max: 0.9, unit: '' },
      { id: 'mix', name: 'Sacred Mix', value: 0.25, min: 0, max: 1, unit: '' },
    ]
  },
  {
    id: 'distortion',
    name: 'Righteous Fire',
    type: 'distortion',
    enabled: false,
    icon: 'flash',
    parameters: [
      { id: 'drive', name: 'Holy Fire', value: 0, min: 0, max: 100, unit: '%' },
      { id: 'tone', name: 'Sacred Tone', value: 50, min: 0, max: 100, unit: '%' },
    ]
  }
];

// Cross SVG Component
const CrossIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <LinearGradient id="crossGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={color} stopOpacity="1" />
        <Stop offset="100%" stopColor="#ffcd56" stopOpacity="0.8" />
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

// Musical Note Decorations
const MusicalNotes: React.FC<{ width: number; height: number }> = ({ width, height }) => (
  <Svg width={width} height={height} style={styles.backgroundDecoration}>
    <Defs>
      <LinearGradient id="noteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#ff4500" stopOpacity="0.3" />
        <Stop offset="100%" stopColor="#ffcd56" stopOpacity="0.1" />
      </LinearGradient>
    </Defs>
    {/* Musical notes scattered across */}
    <Circle cx="50" cy="80" r="4" fill="url(#noteGradient)" />
    <Line x1="54" y1="80" x2="54" y2="60" stroke="#ff4500" strokeWidth="2" opacity="0.3" />
    
    <Circle cx="150" cy="120" r="3" fill="url(#noteGradient)" />
    <Line x1="153" y1="120" x2="153" y2="105" stroke="#ff4500" strokeWidth="1.5" opacity="0.3" />
    
    <Circle cx="280" cy="200" r="4" fill="url(#noteGradient)" />
    <Line x1="284" y1="200" x2="284" y2="180" stroke="#ff4500" strokeWidth="2" opacity="0.3" />
    
    <Circle cx="320" cy="50" r="3" fill="url(#noteGradient)" />
    <Line x1="323" y1="50" x2="323" y2="35" stroke="#ff4500" strokeWidth="1.5" opacity="0.3" />
  </Svg>
);

export default function EffectsRack() {
  const router = useRouter();
  const [effects, setEffects] = useState<AudioEffect[]>(defaultEffects);
  const [selectedEffect, setSelectedEffect] = useState<AudioEffect | null>(null);
  const [showEffectModal, setShowEffectModal] = useState(false);

  const toggleEffect = (effectId: string) => {
    setEffects(prev => prev.map(effect => 
      effect.id === effectId ? { ...effect, enabled: !effect.enabled } : effect
    ));
  };

  const updateParameter = (effectId: string, parameterId: string, value: number) => {
    setEffects(prev => prev.map(effect => 
      effect.id === effectId 
        ? {
            ...effect,
            parameters: effect.parameters.map(param => 
              param.id === parameterId ? { ...param, value } : param
            )
          }
        : effect
    ));
  };

  const openEffectSettings = (effect: AudioEffect) => {
    setSelectedEffect(effect);
    setShowEffectModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Musical Decorations */}
      <MusicalNotes width={400} height={800} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <CrossIcon size={24} color="#ff4500" />
          <Text style={styles.title}>Divine Effects</Text>
          <CrossIcon size={24} color="#ff4500" />
        </View>
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
          <View style={styles.progressFill} />
        </View>
      </View>

      {/* Effects Grid */}
      <ScrollView style={styles.effectsContainer}>
        <View style={styles.effectsGrid}>
          {effects.map(effect => (
            <TouchableOpacity
              key={effect.id}
              style={[
                styles.effectCard,
                effect.enabled && styles.effectCardEnabled
              ]}
              onPress={() => openEffectSettings(effect)}
            >
              <View style={styles.effectHeader}>
                <View style={styles.effectIconContainer}>
                  <Ionicons 
                    name={effect.icon as any} 
                    size={24} 
                    color={effect.enabled ? "#ff4500" : "#8b4513"} 
                  />
                  <CrossIcon size={16} color="#ffcd56" />
                </View>
                <TouchableOpacity
                  style={[
                    styles.powerButton,
                    effect.enabled && styles.powerButtonOn
                  ]}
                  onPress={() => toggleEffect(effect.id)}
                >
                  <Ionicons 
                    name="power" 
                    size={16} 
                    color={effect.enabled ? "#ffffff" : "#8b4513"} 
                  />
                </TouchableOpacity>
              </View>
              
              <Text style={[
                styles.effectName,
                effect.enabled && styles.effectNameEnabled
              ]}>
                {effect.name}
              </Text>
              
              <View style={styles.quickControls}>
                {effect.parameters.slice(0, 2).map(param => (
                  <View key={param.id} style={styles.quickControl}>
                    <Text style={styles.paramLabel}>{param.name}</Text>
                    <Text style={styles.paramValue}>
                      {param.value.toFixed(param.unit === 'dB' || param.unit === 'ms' ? 0 : 1)}
                      {param.unit}
                    </Text>
                  </View>
                ))}
              </View>
              
              {/* Sacred waveform visualization */}
              <View style={styles.miniWaveform}>
                <Svg width="100%" height="20" viewBox="0 0 100 20">
                  <Path
                    d="M0 10 Q25 5 50 10 T100 10"
                    stroke="#ff4500"
                    strokeWidth="2"
                    fill="none"
                    opacity={effect.enabled ? 0.8 : 0.3}
                  />
                </Svg>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Effect Settings Modal */}
      <Modal
        visible={showEffectModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <MusicalNotes width={400} height={800} />
          
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEffectModal(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.modalTitleContainer}>
              <CrossIcon size={20} color="#ff4500" />
              <Text style={styles.modalTitle}>
                {selectedEffect?.name} Settings
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.modalToggle,
                selectedEffect?.enabled && styles.modalToggleOn
              ]}
              onPress={() => selectedEffect && toggleEffect(selectedEffect.id)}
            >
              <Text style={[
                styles.modalToggleText,
                selectedEffect?.enabled && styles.modalToggleTextOn
              ]}>
                {selectedEffect?.enabled ? 'BLESSED' : 'IDLE'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedEffect?.parameters.map(param => (
              <View key={param.id} style={styles.parameterControl}>
                <View style={styles.parameterHeader}>
                  <Text style={styles.parameterName}>{param.name}</Text>
                  <Text style={styles.parameterValue}>
                    {param.value.toFixed(param.unit === 'dB' || param.unit === 'ms' ? 0 : 2)}
                    {param.unit}
                  </Text>
                </View>
                
                <Slider
                  style={styles.slider}
                  minimumValue={param.min}
                  maximumValue={param.max}
                  value={param.value}
                  onValueChange={(value) => 
                    selectedEffect && updateParameter(selectedEffect.id, param.id, value)
                  }
                  minimumTrackTintColor="#ff4500"
                  maximumTrackTintColor="#8b4513"
                  thumbTintColor="#ff4500"
                />
                
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>{param.min}{param.unit}</Text>
                  <Text style={styles.sliderLabel}>{param.max}{param.unit}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Footer with Cross */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.presetButton}>
          <Ionicons name="folder" size={20} color="#fff" />
          <Text style={styles.presetButtonText}>Load Blessing</Text>
        </TouchableOpacity>
        
        <View style={styles.footerCross}>
          <CrossIcon size={32} color="#ff4500" />
        </View>
        
        <TouchableOpacity style={styles.resetButton}>
          <Ionicons name="refresh" size={20} color="#dc143c" />
          <Text style={styles.resetButtonText}>Purify All</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
    backgroundColor: '#2a1a1a',
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
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
    width: '60%',
    backgroundColor: '#ff4500',
    borderRadius: 2,
  },
  effectsContainer: {
    flex: 1,
    padding: 16,
    zIndex: 5,
  },
  effectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  effectCard: {
    width: '47%',
    backgroundColor: 'rgba(42, 26, 26, 0.9)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 69, 0, 0.2)',
  },
  effectCardEnabled: {
    borderColor: '#ff4500',
    backgroundColor: 'rgba(255, 69, 0, 0.15)',
  },
  effectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  effectIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  powerButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(139, 69, 19, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 0, 0.2)',
  },
  powerButtonOn: {
    backgroundColor: '#ff4500',
    borderColor: '#ffffff',
  },
  effectName: {
    color: '#ffb366',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  effectNameEnabled: {
    color: '#ffffff',
  },
  quickControls: {
    gap: 6,
    marginBottom: 8,
  },
  quickControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  paramLabel: {
    color: '#cc6633',
    fontSize: 10,
    fontWeight: '500',
  },
  paramValue: {
    color: '#ff4500',
    fontSize: 10,
    fontWeight: '600',
  },
  miniWaveform: {
    height: 20,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#1a0f0f',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 20,
    backgroundColor: '#2a1a1a',
    zIndex: 10,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  modalToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(139, 69, 19, 0.4)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 0, 0.2)',
  },
  modalToggleOn: {
    backgroundColor: '#ff4500',
    borderColor: '#ffffff',
  },
  modalToggleText: {
    color: '#ffb366',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalToggleTextOn: {
    color: '#ffffff',
  },
  modalContent: {
    flex: 1,
    padding: 20,
    zIndex: 5,
  },
  parameterControl: {
    marginBottom: 24,
    backgroundColor: 'rgba(42, 26, 26, 0.9)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 0, 0.2)',
  },
  parameterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  parameterName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  parameterValue: {
    color: '#ff4500',
    fontSize: 16,
    fontWeight: '700',
  },
  slider: {
    width: '100%',
    height: 40,
    marginVertical: 8,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabel: {
    color: '#cc6633',
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#2a1a1a',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 69, 0, 0.2)',
  },
  footerCross: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(139, 69, 19, 0.4)',
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 0, 0.1)',
  },
  presetButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(220, 20, 60, 0.2)',
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.3)',
  },
  resetButtonText: {
    color: '#dc143c',
    fontSize: 12,
    fontWeight: '600',
  },
});