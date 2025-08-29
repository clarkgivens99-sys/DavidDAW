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
  headerButton: {
    padding: 8,
    backgroundColor: '#333',
    borderRadius: 6,
  },
  effectsContainer: {
    flex: 1,
    padding: 16,
  },
  effectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  effectCard: {
    width: '48%',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  effectCardEnabled: {
    borderColor: '#00ff00',
    backgroundColor: '#2a3a2a',
  },
  effectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  powerButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  powerButtonOn: {
    backgroundColor: '#00ff00',
  },
  effectName: {
    color: '#ccc',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  effectNameEnabled: {
    color: '#fff',
  },
  quickControls: {
    gap: 6,
  },
  quickControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paramLabel: {
    color: '#888',
    fontSize: 12,
  },
  paramValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#2a2a2a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#333',
    borderRadius: 6,
  },
  modalToggleOn: {
    backgroundColor: '#00ff00',
  },
  modalToggleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalToggleTextOn: {
    color: '#1a1a1a',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  parameterControl: {
    marginBottom: 24,
  },
  parameterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  parameterName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  parameterValue: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sliderLabel: {
    color: '#666',
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#2a2a2a',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  presetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#333',
    borderRadius: 6,
    gap: 6,
  },
  presetButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4a2a2a',
    borderRadius: 6,
    gap: 6,
  },
  resetButtonText: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: '500',
  },
});