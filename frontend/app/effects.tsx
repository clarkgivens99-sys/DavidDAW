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
    name: 'Equalizer',
    type: 'equalizer',
    enabled: false,
    icon: 'options',
    parameters: [
      { id: 'bass', name: 'Bass', value: 0, min: -12, max: 12, unit: 'dB' },
      { id: 'mid', name: 'Mid', value: 0, min: -12, max: 12, unit: 'dB' },
      { id: 'treble', name: 'Treble', value: 0, min: -12, max: 12, unit: 'dB' },
    ]
  },
  {
    id: 'compressor',
    name: 'Compressor',
    type: 'compression',
    enabled: false,
    icon: 'contract',
    parameters: [
      { id: 'threshold', name: 'Threshold', value: -18, min: -40, max: 0, unit: 'dB' },
      { id: 'ratio', name: 'Ratio', value: 4, min: 1, max: 20, unit: ':1' },
      { id: 'attack', name: 'Attack', value: 10, min: 1, max: 100, unit: 'ms' },
      { id: 'release', name: 'Release', value: 100, min: 10, max: 1000, unit: 'ms' },
    ]
  },
  {
    id: 'reverb',
    name: 'Reverb',
    type: 'reverb',
    enabled: false,
    icon: 'radio-wave',
    parameters: [
      { id: 'roomSize', name: 'Room Size', value: 0.5, min: 0, max: 1, unit: '' },
      { id: 'wetLevel', name: 'Wet Level', value: 0.3, min: 0, max: 1, unit: '' },
      { id: 'dryLevel', name: 'Dry Level', value: 0.7, min: 0, max: 1, unit: '' },
    ]
  },
  {
    id: 'autotune',
    name: 'Auto-Tune',
    type: 'autotune',
    enabled: false,
    icon: 'musical-note',
    parameters: [
      { id: 'correction', name: 'Correction', value: 50, min: 0, max: 100, unit: '%' },
      { id: 'key', name: 'Key', value: 0, min: -6, max: 6, unit: 'semi' },
    ]
  },
  {
    id: 'delay',
    name: 'Delay',
    type: 'delay',
    enabled: false,
    icon: 'repeat',
    parameters: [
      { id: 'time', name: 'Time', value: 250, min: 1, max: 1000, unit: 'ms' },
      { id: 'feedback', name: 'Feedback', value: 0.3, min: 0, max: 0.9, unit: '' },
      { id: 'mix', name: 'Mix', value: 0.25, min: 0, max: 1, unit: '' },
    ]
  },
  {
    id: 'distortion',
    name: 'Distortion',
    type: 'distortion',
    enabled: false,
    icon: 'flash',
    parameters: [
      { id: 'drive', name: 'Drive', value: 0, min: 0, max: 100, unit: '%' },
      { id: 'tone', name: 'Tone', value: 50, min: 0, max: 100, unit: '%' },
    ]
  }
];

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

  const getEffectStatusColor = (enabled: boolean) => {
    return enabled ? '#00ff00' : '#666';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Effects Rack</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="save" size={20} color="#fff" />
        </TouchableOpacity>
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
                <Ionicons 
                  name={effect.icon as any} 
                  size={24} 
                  color={getEffectStatusColor(effect.enabled)} 
                />
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
                    color={effect.enabled ? '#1a1a1a' : '#666'} 
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
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEffectModal(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedEffect?.name} Settings
            </Text>
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
                {selectedEffect?.enabled ? 'ON' : 'OFF'}
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
                  minimumTrackTintColor="#007AFF"
                  maximumTrackTintColor="#333"
                  thumbTintColor="#007AFF"
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

      {/* Preset Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.presetButton}>
          <Ionicons name="folder" size={20} color="#fff" />
          <Text style={styles.presetButtonText}>Load Preset</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.presetButton}>
          <Ionicons name="save" size={20} color="#fff" />
          <Text style={styles.presetButtonText}>Save Preset</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.resetButton}>
          <Ionicons name="refresh" size={20} color="#ff4444" />
          <Text style={styles.resetButtonText}>Reset All</Text>
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
  headerButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  effectsContainer: {
    flex: 1,
    padding: 16,
  },
  effectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  effectCard: {
    width: '47%',
    backgroundColor: '#1a2332',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(74, 144, 226, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  effectCardEnabled: {
    borderColor: '#4a90e2',
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
  },
  effectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  powerButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(45, 74, 122, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  powerButtonOn: {
    backgroundColor: '#4a90e2',
    borderColor: '#ffffff',
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  effectName: {
    color: '#a8bce8',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  effectNameEnabled: {
    color: '#ffffff',
  },
  quickControls: {
    gap: 8,
  },
  quickControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  paramLabel: {
    color: '#6b7d9e',
    fontSize: 12,
    fontWeight: '500',
  },
  paramValue: {
    color: '#4a90e2',
    fontSize: 12,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0f1419',
  },
  modalHeader: {
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
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  modalToggle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(45, 74, 122, 0.4)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalToggleOn: {
    backgroundColor: '#4a90e2',
    borderColor: '#ffffff',
  },
  modalToggleText: {
    color: '#a8bce8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalToggleTextOn: {
    color: '#ffffff',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  parameterControl: {
    marginBottom: 32,
    backgroundColor: '#1a2332',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.2)',
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
    color: '#4a90e2',
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
    color: '#6b7d9e',
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#162032',
    borderTopWidth: 1,
    borderTopColor: 'rgba(74, 144, 226, 0.2)',
  },
  presetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(45, 74, 122, 0.4)',
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  presetButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  resetButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
});