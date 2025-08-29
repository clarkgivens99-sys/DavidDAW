import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  FlatList,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface SamplePack {
  id: string;
  name: string;
  category: 'drums' | 'loops' | 'vocals' | 'instruments' | 'fx';
  samples: Sample[];
  color: string;
  description: string;
}

interface Sample {
  id: string;
  name: string;
  duration: number;
  bpm?: number;
  key?: string;
  tags: string[];
}

const samplePacks: SamplePack[] = [
  {
    id: 'hip-hop-drums',
    name: 'Hip Hop Drums',
    category: 'drums',
    color: '#ff4444',
    description: 'Classic boom-bap and trap drum samples',
    samples: [
      { id: 'hh-kick-01', name: 'Deep Kick', duration: 1.2, tags: ['kick', 'deep', 'punchy'] },
      { id: 'hh-kick-02', name: 'Trap Kick', duration: 0.8, tags: ['kick', 'trap', '808'] },
      { id: 'hh-snare-01', name: 'Crispy Snare', duration: 0.6, tags: ['snare', 'crisp', 'boom-bap'] },
      { id: 'hh-snare-02', name: 'Layered Snare', duration: 0.9, tags: ['snare', 'layered', 'wide'] },
      { id: 'hh-hihat-01', name: 'Closed Hat', duration: 0.2, tags: ['hihat', 'closed', 'tight'] },
      { id: 'hh-hihat-02', name: 'Open Hat', duration: 0.8, tags: ['hihat', 'open', 'sizzle'] },
    ]
  },
  {
    id: 'trap-loops',
    name: 'Trap Loops',
    category: 'loops',
    color: '#ff8844',
    description: 'Dark and melodic trap loops',
    samples: [
      { id: 'tl-melody-01', name: 'Dark Bell Loop', duration: 8.0, bpm: 140, key: 'Am', tags: ['melody', 'bells', 'dark'] },
      { id: 'tl-melody-02', name: 'Flute Melody', duration: 16.0, bpm: 130, key: 'F#m', tags: ['melody', 'flute', 'atmospheric'] },
      { id: 'tl-bass-01', name: '808 Bass Loop', duration: 4.0, bpm: 140, key: 'A', tags: ['bass', '808', 'sub'] },
      { id: 'tl-perc-01', name: 'Trap Percussion', duration: 8.0, bpm: 140, tags: ['percussion', 'rhythm', 'trap'] },
    ]
  },
  {
    id: 'house-loops',
    name: 'House Loops',
    category: 'loops',
    color: '#44ff88',
    description: 'Pumping house and techno loops',
    samples: [
      { id: 'hl-bass-01', name: 'Pumping Bassline', duration: 8.0, bpm: 128, key: 'Gm', tags: ['bass', 'house', 'groovy'] },
      { id: 'hl-pad-01', name: 'Ethereal Pad', duration: 16.0, bpm: 128, key: 'Cm', tags: ['pad', 'atmospheric', 'warm'] },
      { id: 'hl-lead-01', name: 'Acid Lead', duration: 4.0, bpm: 128, key: 'Fm', tags: ['lead', 'acid', 'resonant'] },
      { id: 'hl-perc-01', name: 'Latin Percussion', duration: 8.0, bpm: 128, tags: ['percussion', 'latin', 'organic'] },
    ]
  },
  {
    id: 'vocal-chops',
    name: 'Vocal Chops',
    category: 'vocals',
    color: '#8844ff',
    description: 'Processed vocal samples and chops',
    samples: [
      { id: 'vc-chop-01', name: 'Soul Vocal Chop', duration: 2.0, bpm: 120, key: 'C', tags: ['vocal', 'soul', 'chopped'] },
      { id: 'vc-chop-02', name: 'R&B Vocal Run', duration: 4.0, bpm: 90, key: 'Bb', tags: ['vocal', 'rnb', 'melodic'] },
      { id: 'vc-phrase-01', name: 'Gospel Phrase', duration: 8.0, bpm: 110, key: 'F', tags: ['vocal', 'gospel', 'harmony'] },
      { id: 'vc-texture-01', name: 'Vocal Texture', duration: 12.0, bpm: 100, tags: ['vocal', 'texture', 'ambient'] },
    ]
  },
  {
    id: 'organic-drums',
    name: 'Organic Drums',
    category: 'drums',
    color: '#44ffff',
    description: 'Live recorded acoustic drum samples',
    samples: [
      { id: 'od-kick-01', name: 'Live Kick', duration: 1.5, tags: ['kick', 'acoustic', 'punchy'] },
      { id: 'od-snare-01', name: 'Jazz Snare', duration: 0.8, tags: ['snare', 'jazz', 'natural'] },
      { id: 'od-rim-01', name: 'Rim Shot', duration: 0.3, tags: ['rim', 'crack', 'sharp'] },
      { id: 'od-crash-01', name: 'Crash Cymbal', duration: 3.2, tags: ['crash', 'cymbal', 'bright'] },
    ]
  },
  {
    id: 'sound-fx',
    name: 'Sound FX',
    category: 'fx',
    color: '#ff44ff',
    description: 'Risers, drops, and sound effects',
    samples: [
      { id: 'fx-riser-01', name: 'White Noise Riser', duration: 4.0, tags: ['riser', 'build', 'tension'] },
      { id: 'fx-drop-01', name: 'Impact Drop', duration: 2.0, tags: ['drop', 'impact', 'heavy'] },
      { id: 'fx-sweep-01', name: 'Filter Sweep', duration: 8.0, tags: ['sweep', 'filter', 'transition'] },
      { id: 'fx-glitch-01', name: 'Digital Glitch', duration: 1.0, tags: ['glitch', 'digital', 'stutter'] },
    ]
  }
];

export default function SampleLibrary() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPack, setSelectedPack] = useState<SamplePack | null>(null);

  const categories = [
    { id: 'all', name: 'All', icon: 'grid' },
    { id: 'drums', name: 'Drums', icon: 'radio-button-on' },
    { id: 'loops', name: 'Loops', icon: 'repeat' },
    { id: 'vocals', name: 'Vocals', icon: 'mic' },
    { id: 'instruments', name: 'Instruments', icon: 'musical-notes' },
    { id: 'fx', name: 'FX', icon: 'flash' },
  ];

  const filteredPacks = samplePacks.filter(pack => {
    const matchesCategory = selectedCategory === 'all' || pack.category === selectedCategory;
    const matchesSearch = pack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pack.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const playSample = (sample: Sample) => {
    console.log(`Playing sample: ${sample.name}`);
    // In a real implementation, you would play the actual audio sample
  };

  const loadSampleToPad = (sample: Sample) => {
    console.log(`Loading sample to pad: ${sample.name}`);
    // Logic to load sample to drum pad or track
  };

  const SamplePackCard = ({ pack }: { pack: SamplePack }) => (
    <TouchableOpacity
      style={[styles.packCard, { borderLeftColor: pack.color }]}
      onPress={() => setSelectedPack(pack)}
    >
      <View style={styles.packHeader}>
        <Text style={styles.packName}>{pack.name}</Text>
        <View style={[styles.categoryBadge, { backgroundColor: pack.color }]}>
          <Text style={styles.categoryBadgeText}>{pack.category.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.packDescription}>{pack.description}</Text>
      <Text style={styles.sampleCount}>{pack.samples.length} samples</Text>
    </TouchableOpacity>
  );

  const SampleItem = ({ sample }: { sample: Sample }) => (
    <View style={styles.sampleItem}>
      <View style={styles.sampleInfo}>
        <Text style={styles.sampleName}>{sample.name}</Text>
        <View style={styles.sampleDetails}>
          <Text style={styles.sampleDuration}>{sample.duration.toFixed(1)}s</Text>
          {sample.bpm && <Text style={styles.sampleBpm}>{sample.bpm} BPM</Text>}
          {sample.key && <Text style={styles.sampleKey}>{sample.key}</Text>}
        </View>
        <View style={styles.sampleTags}>
          {sample.tags.slice(0, 3).map(tag => (
            <Text key={tag} style={styles.sampleTag}>#{tag}</Text>
          ))}
        </View>
      </View>
      
      <View style={styles.sampleControls}>
        <TouchableOpacity
          style={styles.sampleButton}
          onPress={() => playSample(sample)}
        >
          <Ionicons name="play" size={16} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.sampleButton, styles.loadButton]}
          onPress={() => loadSampleToPad(sample)}
        >
          <Ionicons name="add" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (selectedPack) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Pack Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedPack(null)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.packTitleContainer}>
            <Text style={styles.title}>{selectedPack.name}</Text>
            <Text style={styles.subtitle}>{selectedPack.samples.length} samples</Text>
          </View>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="download" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Samples List */}
        <FlatList
          data={selectedPack.samples}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <SampleItem sample={item} />}
          style={styles.samplesList}
          contentContainerStyle={styles.samplesListContent}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Sample Library</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="cloud-download" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search samples and packs..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Categories */}
      <ScrollView horizontal style={styles.categoriesContainer}>
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Ionicons 
              name={category.icon as any} 
              size={16} 
              color={selectedCategory === category.id ? '#1a1a1a' : '#fff'} 
            />
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === category.id && styles.categoryButtonTextActive
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sample Packs */}
      <FlatList
        data={filteredPacks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <SamplePackCard pack={item} />}
        style={styles.packsList}
        contentContainerStyle={styles.packsListContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionButton}>
          <Ionicons name="mic" size={20} color="#fff" />
          <Text style={styles.quickActionText}>Record</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionButton}>
          <Ionicons name="folder" size={20} color="#fff" />
          <Text style={styles.quickActionText}>Import</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionButton}>
          <Ionicons name="create" size={20} color="#fff" />
          <Text style={styles.quickActionText}>My Samples</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 20,
    backgroundColor: '#4a1a1a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 69, 0, 0.2)',
    borderRadius: 12,
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#ffb366',
    fontSize: 12,
    fontWeight: '500',
  },
  packTitleContainer: {
    alignItems: 'center',
  },
  headerButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 69, 0, 0.2)',
    borderRadius: 12,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#2a1212',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 0, 0.2)',
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  categoriesContainer: {
    backgroundColor: '#2a1212',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 12,
    backgroundColor: 'rgba(139, 69, 19, 0.4)',
    borderRadius: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 0, 0.1)',
  },
  categoryButtonActive: {
    backgroundColor: '#ff4500',
    borderColor: '#ffffff',
  },
  categoryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  packsList: {
    flex: 1,
  },
  packsListContent: {
    padding: 16,
  },
  packCard: {
    backgroundColor: '#2a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  packHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  packName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  packDescription: {
    color: '#ffb366',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
    fontWeight: '500',
  },
  sampleCount: {
    color: '#cc6633',
    fontSize: 12,
    fontWeight: '600',
  },
  samplesList: {
    flex: 1,
  },
  samplesListContent: {
    padding: 16,
  },
  sampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 0, 0.2)',
  },
  sampleInfo: {
    flex: 1,
  },
  sampleName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  sampleDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 16,
  },
  sampleDuration: {
    color: '#ff8c00',
    fontSize: 12,
    fontWeight: '600',
  },
  sampleBpm: {
    color: '#ff4500',
    fontSize: 12,
    fontWeight: '600',
  },
  sampleKey: {
    color: '#dc143c',
    fontSize: 12,
    fontWeight: '600',
  },
  sampleTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sampleTag: {
    color: '#cc6633',
    fontSize: 10,
    fontWeight: '500',
  },
  sampleControls: {
    flexDirection: 'row',
    gap: 12,
  },
  sampleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(139, 69, 19, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 0, 0.1)',
  },
  loadButton: {
    backgroundColor: '#ff4500',
    borderColor: '#ffffff',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#2a1212',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 69, 0, 0.2)',
  },
  quickActionButton: {
    alignItems: 'center',
    gap: 6,
  },
  quickActionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});