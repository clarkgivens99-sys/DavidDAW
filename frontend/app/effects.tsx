import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Svg, { Path, Line, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

interface Effect {
  id: string;
  name: string;
  type: 'EQ' | 'Compressor' | 'Reverb' | 'Delay' | 'Distortion' | 'Auto-Tune';
  sacredName: string;
  parameters: EffectParameter[];
  enabled: boolean;
  blessing: string;
  icon: string;
}

interface EffectParameter {
  name: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  sacredName: string;
}

const effects: Effect[] = [
  {
    id: 'eq',
    name: 'Equalizer',
    sacredName: 'Divine EQ',
    type: 'EQ',
    blessing: 'Balance the frequencies of worship',
    icon: 'bar-chart',
    enabled: false,
    parameters: [
      { name: 'Low', sacredName: 'Foundation', value: 0, min: -12, max: 12, unit: 'dB' },
      { name: 'Mid', sacredName: 'Heart', value: 0, min: -12, max: 12, unit: 'dB' },
      { name: 'High', sacredName: 'Heaven', value: 0, min: -12, max: 12, unit: 'dB' },
    ]
  },
  {
    id: 'compressor',
    name: 'Compressor',
    sacredName: 'Holy Compression',
    type: 'Compressor',
    blessing: 'Bind together in perfect unity',
    icon: 'contract',
    enabled: false,
    parameters: [
      { name: 'Threshold', sacredName: 'Sacred Limit', value: -10, min: -40, max: 0, unit: 'dB' },
      { name: 'Ratio', sacredName: 'Divine Ratio', value: 4, min: 1, max: 20, unit: ':1' },
      { name: 'Attack', sacredName: 'Swift Justice', value: 10, min: 0.1, max: 100, unit: 'ms' },
    ]
  },
  {
    id: 'reverb',
    name: 'Reverb',
    sacredName: 'Cathedral Reverb',
    type: 'Reverb',
    blessing: 'Echo through the halls of heaven',
    icon: 'radio-waves',
    enabled: false,
    parameters: [
      { name: 'Room Size', sacredName: 'Temple Size', value: 0.5, min: 0, max: 1, unit: '' },
      { name: 'Damping', sacredName: 'Sacred Absorption', value: 0.3, min: 0, max: 1, unit: '' },
      { name: 'Mix', sacredName: 'Divine Blend', value: 0.25, min: 0, max: 1, unit: '' },
    ]
  },
  {
    id: 'autotune',
    name: 'Auto-Tune',
    sacredName: 'Angelic Tune',
    type: 'Auto-Tune',
    blessing: 'Perfect pitch for perfect praise',
    icon: 'musical-notes',
    enabled: false,
    parameters: [
      { name: 'Correction', sacredName: 'Divine Correction', value: 85, min: 0, max: 100, unit: '%' },
      { name: 'Speed', sacredName: 'Holy Speed', value: 50, min: 0, max: 100, unit: '%' },
    ]
  },
  {
    id: 'delay',
    name: 'Delay',
    sacredName: 'Echo of Eternity',
    type: 'Delay',
    blessing: 'Let your voice resonate forever',
    icon: 'repeat',
    enabled: false,
    parameters: [
      { name: 'Time', sacredName: 'Eternal Time', value: 250, min: 1, max: 2000, unit: 'ms' },
      { name: 'Feedback', sacredName: 'Divine Echo', value: 35, min: 0, max: 95, unit: '%' },
      { name: 'Mix', sacredName: 'Sacred Mix', value: 20, min: 0, max: 100, unit: '%' },
    ]
  },
  {
    id: 'distortion',
    name: 'Distortion',
    sacredName: 'Righteous Fire',
    type: 'Distortion',
    blessing: 'Burn with holy passion',
    icon: 'flame',
    enabled: false,
    parameters: [
      { name: 'Drive', sacredName: 'Holy Fire', value: 30, min: 0, max: 100, unit: '%' },
      { name: 'Tone', sacredName: 'Sacred Tone', value: 50, min: 0, max: 100, unit: '%' },
    ]
  }
];

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

// Corner Crosses Component - White crosses in upper corners
const CornerCrosses: React.FC = () => (
  <View style={styles.cornerCrossesContainer}>
    {/* Top Left Cross */}
    <View style={styles.topLeftCross}>
      <Svg width={32} height={32} viewBox="0 0 24 24">
        <Line x1="12" y1="3" x2="12" y2="21" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        <Line x1="6" y1="9" x2="18" y2="9" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      </Svg>
    </View>
    
    {/* Top Right Cross */}
    <View style={styles.topRightCross}>
      <Svg width={32} height={32} viewBox="0 0 24 24">
        <Line x1="12" y1="3" x2="12" y2="21" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        <Line x1="6" y1="9" x2="18" y2="9" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      </Svg>
    </View>
  </View>
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
    
    {/* Dove silhouette */}
    <Path
      d="M100 200 Q120 190 140 200 Q130 210 120 205 Q110 210 100 200Z"
      fill="url(#sacredGradient)"
    />
    
    {/* Musical notes */}
    <Circle cx="80" cy="300" r="4" fill="url(#sacredGradient)" />
    <Line x1="84" y1="300" x2="84" y2="280" stroke="#ff4500" strokeWidth="2" opacity="0.2" />
    
    <Circle cx="320" cy="150" r="3" fill="url(#sacredGradient)" />
    <Line x1="323" y1="150" x2="323" y2="135" stroke="#ff4500" strokeWidth="1.5" opacity="0.2" />
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
        <Ionicons name="recording" size={20} color="#ffffff" />
        <Text style={[styles.navButtonText, styles.inactiveNavText]}>Multitrack</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.navButton, styles.activeNavButton]}
      >
        <Ionicons name="options" size={20} color="#ffffff" />
        <Text style={styles.navButtonText}>Effects</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => router.push('/sequencer')}
      >
        <Ionicons name="grid" size={20} color="#ffffff" />
        <Text style={[styles.navButtonText, styles.inactiveNavText]}>Beats</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => router.push('/samples')}
      >
        <Ionicons name="library" size={20} color="#ffffff" />
        <Text style={[styles.navButtonText, styles.inactiveNavText]}>Library</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => router.push('/waveform')}
      >
        <Ionicons name="pulse" size={20} color="#ffffff" />
        <Text style={[styles.navButtonText, styles.inactiveNavText]}>Waveform</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function EffectsRack() {
  const router = useRouter();
  const [effectsState, setEffectsState] = useState(effects);

  const toggleEffect = (effectId: string) => {
    setEffectsState(prev => prev.map(effect => 
      effect.id === effectId 
        ? { ...effect, enabled: !effect.enabled }
        : effect
    ));
  };

  const updateParameter = (effectId: string, paramIndex: number, value: number) => {
    setEffectsState(prev => prev.map(effect => 
      effect.id === effectId 
        ? {
            ...effect,
            parameters: effect.parameters.map((param, index) => 
              index === paramIndex ? { ...param, value } : param
            )
          }
        : effect
    ));
  };

  const EffectCard = ({ effect }: { effect: Effect }) => {
    return (
    <View style={[styles.effectCard, effect.enabled && styles.effectCardActive]}>
      <View style={styles.effectHeader}>
        <View style={styles.effectTitleContainer}>
          <CrossIcon size={16} color="#ff4500" />
          <View style={styles.effectTitleText}>
            <Text style={styles.effectName}>{effect.sacredName}</Text>
            <Text style={styles.effectBlessing}>"{effect.blessing}"</Text>
          </View>
          <TouchableOpacity
            style={[styles.enableButton, effect.enabled && styles.enableButtonActive]}
            onPress={() => toggleEffect(effect.id)}
          >
            <Ionicons 
              name={effect.enabled ? "checkmark-circle" : "ellipse-outline"} 
              size={24} 
              color={effect.enabled ? "#ffffff" : "#ffffff"} 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.parametersContainer}>
        {effect.parameters.map((param, index) => (
          <View key={index} style={styles.parameterRow}>
            <View style={styles.parameterHeader}>
              <CrossIcon size={10} color="#ff4500" />
              <Text style={styles.parameterName}>{param.sacredName}</Text>
              <Text style={styles.parameterValue}>
                {param.value.toFixed(param.unit === '%' || param.unit === ':1' ? 0 : 1)}{param.unit}
              </Text>
            </View>
            <View style={styles.sliderContainer}>
              <TouchableOpacity 
                style={styles.parameterAdjustButton}
                onPress={() => updateParameter(effect.id, index, Math.max(param.min, param.value - 1))}
                disabled={!effect.enabled}
              >
                <Text style={styles.adjustButtonText}>-</Text>
              </TouchableOpacity>
              
              <View style={styles.parameterBar}>
                <View 
                  style={[
                    styles.parameterFill, 
                    { 
                      width: `${((param.value - param.min) / (param.max - param.min)) * 100}%`,
                      backgroundColor: effect.enabled ? '#ff4500' : '#4a2a2a'
                    }
                  ]} 
                />
              </View>
              
              <TouchableOpacity 
                style={styles.parameterAdjustButton}
                onPress={() => updateParameter(effect.id, index, Math.min(param.max, param.value + 1))}
                disabled={!effect.enabled}
              >
                <Text style={styles.adjustButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Corner Crosses */}
      <CornerCrosses />
      
      {/* Background Cross */}
      <SacredBackground width={400} height={800} />
      
      {/* Header with Graffiti Title */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <CrossIcon size={32} color="#ff4500" />
          <View style={styles.titleTextContainer}>
            <Text style={styles.mainTitle}>The David D.A.W.</Text>
            <Text style={styles.subTitle}>for Chasing Away the Evil Spirit</Text>
          </View>
          <CrossIcon size={32} color="#ff4500" />
        </View>
      </View>
      
      {/* Navigation Bar */}
      <NavigationBar />

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '60%' }]} />
        </View>
      </View>

      {/* Sacred Status */}
      <View style={styles.statusContainer}>
        <CrossIcon size={20} color="#ff4500" />
        <Text style={styles.statusText}>Divine Audio Processing</Text>
        <View style={styles.statusIndicator}>
          <Text style={styles.statusValue}>
            {effectsState.filter(e => e.enabled).length} of {effectsState.length} blessed
          </Text>
        </View>
      </View>

      {/* Effects List */}
      <ScrollView style={styles.effectsList} showsVerticalScrollIndicator={false}>
        {effectsState.map(effect => (
          <EffectCard key={effect.id} effect={effect} />
        ))}
      </ScrollView>

      {/* Sacred Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton}>
          <CrossIcon size={16} color="#ff4500" />
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.footerButtonText}>Reset Sacred</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.footerButton}>
          <CrossIcon size={16} color="#ff4500" />
          <Ionicons name="save" size={20} color="#fff" />
          <Text style={styles.footerButtonText}>Save Blessing</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sacredFooter}>
        <CrossIcon size={24} color="#ffffff" />
        <Text style={styles.blessingText}>"Let everything that breathes praise the Lord"</Text>
        <CrossIcon size={24} color="#ffffff" />
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
  cornerCrossesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  topLeftCross: {
    opacity: 0.8,
  },
  topRightCross: {
    opacity: 0.8,
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
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textShadowColor: '#ff4500',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
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
    color: '#ffffff',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2a1a1a',
    zIndex: 5,
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#2a1212',
    gap: 12,
    zIndex: 5,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusIndicator: {
    backgroundColor: 'rgba(255, 69, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ff4500',
  },
  statusValue: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  effectsList: {
    flex: 1,
    padding: 20,
    zIndex: 5,
    backgroundColor: 'transparent', // Ensure it's not hidden
    minHeight: 400, // Ensure minimum height
  },
  effectCard: {
    backgroundColor: 'rgba(42, 26, 26, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 69, 0, 0.2)',
    shadowColor: '#ff4500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  effectCardActive: {
    borderColor: '#ff4500',
    backgroundColor: 'rgba(255, 69, 0, 0.1)',
    shadowOpacity: 0.4,
  },
  effectHeader: {
    marginBottom: 16,
  },
  effectTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  effectTitleText: {
    flex: 1,
  },
  effectName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  effectBlessing: {
    color: '#ffffff',
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  enableButton: {
    padding: 8,
  },
  enableButtonActive: {
    backgroundColor: 'rgba(255, 69, 0, 0.2)',
    borderRadius: 20,
  },
  parametersContainer: {
    gap: 16,
  },
  parameterRow: {
    gap: 8,
  },
  parameterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  parameterName: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  parameterValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    minWidth: 60,
    textAlign: 'right',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
  },
  parameterAdjustButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 69, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ff4500',
  },
  adjustButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  parameterBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#4a2a2a',
    borderRadius: 3,
    overflow: 'hidden',
  },
  parameterFill: {
    height: '100%',
    borderRadius: 3,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#2a1212',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 69, 0, 0.2)',
    zIndex: 5,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerButtonText: {
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
    color: '#ffffff',
    fontSize: 12,
    fontStyle: 'italic',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});