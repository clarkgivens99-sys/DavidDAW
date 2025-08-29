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
import Svg, { Path, Circle, Line, Defs, LinearGradient, Stop } from 'react-native-svg';

interface SamplePack {
  id: string;
  name: string;
  category: 'drums' | 'loops' | 'vocals' | 'instruments' | 'fx' | 'blessed';
  samples: Sample[];
  color: string;
  description: string;
  sacredTheme: string;
}

interface Sample {
  id: string;
  name: string;
  duration: number;
  bpm?: number;
  key?: string;
  tags: string[];
  blessing: string; // Religious blessing for each sample
}

const samplePacks: SamplePack[] = [
  {
    id: 'gospel-drums',
    name: 'Gospel Foundation',
    category: 'drums',
    color: '#ff4444',
    description: 'Holy rhythms blessed with divine power',
    sacredTheme: 'Rock of Ages',
    samples: [
      { id: 'gd-kick-01', name: 'Cornerstone Kick', duration: 1.2, tags: ['kick', 'deep', 'foundation'], blessing: 'Upon this rock I build' },
      { id: 'gd-snare-01', name: 'Truth Snare', duration: 0.6, tags: ['snare', 'crisp', 'truth'], blessing: 'The truth shall set free' },
      { id: 'gd-hihat-01', name: 'Grace Hat', duration: 0.2, tags: ['hihat', 'grace', 'gentle'], blessing: 'Amazing grace how sweet' },
    ]
  },
  {
    id: 'worship-loops',
    name: 'Heavenly Melodies',
    category: 'loops',
    color: '#ff8844',
    description: 'Celestial harmonies from above',
    sacredTheme: 'Angelic Chorus',
    samples: [
      { id: 'wl-melody-01', name: 'Angels Singing', duration: 8.0, bpm: 120, key: 'C', tags: ['melody', 'angels', 'praise'], blessing: 'Holy holy holy Lord' },
      { id: 'wl-bass-01', name: 'Foundation Bass', duration: 4.0, bpm: 120, key: 'C', tags: ['bass', 'foundation', 'solid'], blessing: 'Built upon solid rock' },
    ]
  },
  {
    id: 'praise-vocals',
    name: 'Voices of Heaven',
    category: 'vocals',
    color: '#8844ff',
    description: 'Divine vocal expressions',
    sacredTheme: 'Hallelujah Chorus',
    samples: [
      { id: 'pv-chop-01', name: 'Hallelujah Call', duration: 2.0, bpm: 120, key: 'G', tags: ['vocal', 'praise', 'hallelujah'], blessing: 'Praise the Lord almighty' },
      { id: 'pv-phrase-01', name: 'Worship Phrase', duration: 4.0, bpm: 100, key: 'D', tags: ['vocal', 'worship', 'reverent'], blessing: 'Come let us worship Him' },
    ]
  },
  {
    id: 'blessed-instruments',
    name: 'Sacred Instruments',
    category: 'instruments',
    color: '#44ff88',
    description: 'Instruments consecrated for worship',
    sacredTheme: 'Temple Orchestra',
    samples: [
      { id: 'bi-organ-01', name: 'Cathedral Organ', duration: 8.0, bpm: 80, key: 'Fm', tags: ['organ', 'cathedral', 'majestic'], blessing: 'Make a joyful noise' },
      { id: 'bi-harp-01', name: 'Heavenly Harp', duration: 4.0, bpm: 90, key: 'C', tags: ['harp', 'heavenly', 'peaceful'], blessing: 'Angels play their harps' },
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
    
    {/* Musical notes with crosses */}
    <Circle cx="80" cy="300" r="4" fill="url(#sacredGradient)" />
    <Line x1="84" y1="300" x2="84" y2="280" stroke="#ff4500" strokeWidth="2" opacity="0.2" />
    <Path d="M86 278L86 282L90 280L90 276L86 278Z" fill="url(#sacredGradient)" />
    
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
        style={styles.navButton}
        onPress={() => router.push('/effects')}
      >
        <Ionicons name="options" size={20} color="#ffffff" />
        <Text style={[styles.navButtonText, styles.inactiveNavText]}>Effects</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => router.push('/sequencer')}
      >
        <Ionicons name="grid" size={20} color="#ffffff" />
        <Text style={[styles.navButtonText, styles.inactiveNavText]}>Beats</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.navButton, styles.activeNavButton]}
      >
        <Ionicons name="library" size={20} color="#ffffff" />
        <Text style={styles.navButtonText}>Library</Text>
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

export default function SampleLibrary() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPack, setSelectedPack] = useState<SamplePack | null>(null);

  const categories = [
    { id: 'all', name: 'All Blessed', icon: 'grid' },
    { id: 'drums', name: 'Foundation', icon: 'radio-button-on' },
    { id: 'loops', name: 'Melodies', icon: 'repeat' },
    { id: 'vocals', name: 'Voices', icon: 'mic' },
    { id: 'instruments', name: 'Sacred', icon: 'musical-notes' },
    { id: 'blessed', name: 'Divine', icon: 'heart' },
  ];

  const filteredPacks = samplePacks.filter(pack => {
    const matchesCategory = selectedCategory === 'all' || pack.category === selectedCategory;
    const matchesSearch = pack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pack.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pack.sacredTheme.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const SamplePackCard = ({ pack }: { pack: SamplePack }) => (
    <TouchableOpacity
      style={[styles.packCard, { borderLeftColor: pack.color }]}
      onPress={() => setSelectedPack(pack)}
    >
      <View style={styles.packHeader}>
        <View style={styles.packTitleContainer}>
          <CrossIcon size={16} color={pack.color} />
          <Text style={styles.packName}>{pack.name}</Text>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: pack.color }]}>
          <Text style={styles.categoryBadgeText}>{pack.category.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.packDescription}>{pack.description}</Text>
      <Text style={styles.sacredTheme}>Sacred Theme: {pack.sacredTheme}</Text>
      <Text style={styles.sampleCount}>{pack.samples.length} blessed samples</Text>
    </TouchableOpacity>
  );

  const SampleItem = ({ sample }: { sample: Sample }) => (
    <View style={styles.sampleItem}>
      <View style={styles.sampleInfo}>
        <View style={styles.sampleHeader}>
          <CrossIcon size={12} color="#ff4500" />
          <Text style={styles.sampleName}>{sample.name}</Text>
        </View>
        <View style={styles.sampleDetails}>
          <Text style={styles.sampleDuration}>{sample.duration.toFixed(1)}s</Text>
          {sample.bpm && <Text style={styles.sampleBpm}>{sample.bpm} BPM</Text>}
          {sample.key && <Text style={styles.sampleKey}>{sample.key}</Text>}
        </View>
        <Text style={styles.sampleBlessing}>"{sample.blessing}"</Text>
        <View style={styles.sampleTags}>
          {sample.tags.slice(0, 3).map(tag => (
            <Text key={tag} style={styles.sampleTag}>#{tag}</Text>
          ))}
        </View>
      </View>
      
      <View style={styles.sampleControls}>
        <TouchableOpacity style={styles.sampleButton}>
          <Ionicons name="play" size={16} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.sampleButton, styles.loadButton]}>
          <Ionicons name="add" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (selectedPack) {
    return (
      <SafeAreaView style={styles.container}>
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

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '75%' }]} />
          </View>
        </View>

        {/* Pack Detail Header */}
        <View style={styles.packDetailHeader}>
          <TouchableOpacity onPress={() => setSelectedPack(null)} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.packDetailTitle}>
            <CrossIcon size={20} color="#ff4500" />
            <View style={styles.packTitleContainer}>
              <Text style={styles.packDetailName}>{selectedPack.name}</Text>
              <Text style={styles.packDetailSubtitle}>{selectedPack.samples.length} blessed samples</Text>
            </View>
            <CrossIcon size={20} color="#ff4500" />
          </View>
        </View>

        <FlatList
          data={selectedPack.samples}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <SampleItem sample={item} />}
          style={styles.samplesList}
          contentContainerStyle={styles.samplesListContent}
        />

        {/* Sacred Footer */}
        <View style={styles.sacredFooter}>
          <CrossIcon size={24} color="#ffcd56" />
          <Text style={styles.blessingText}>"Make a joyful noise unto the Lord"</Text>
          <CrossIcon size={24} color="#ffcd56" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Corner Crosses */}
      <CornerCrosses />
      
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
          <View style={[styles.progressFill, { width: '40%' }]} />
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#cc6633" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search blessed samples..."
            placeholderTextColor="#cc6633"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <CrossIcon size={16} color="#ff4500" />
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
              color={selectedCategory === category.id ? '#ffffff' : '#ffb366'} 
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

      {/* Sacred Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton}>
          <Ionicons name="mic" size={20} color="#fff" />
          <Text style={styles.footerButtonText}>Record Praise</Text>
        </TouchableOpacity>
        
        <CrossIcon size={32} color="#ff4500" />
        
        <TouchableOpacity style={styles.footerButton}>
          <Ionicons name="heart" size={20} color="#dc143c" />
          <Text style={styles.footerButtonText}>My Blessed</Text>
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
  backButton: {
    padding: 8,
  },
  packTitleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  packDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#4a2a2a',
    zIndex: 5,
  },
  packDetailTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  packDetailName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  packDetailSubtitle: {
    color: '#ffb366',
    fontSize: 12,
    fontWeight: '500',
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
  searchContainer: {
    padding: 16,
    backgroundColor: '#2a1a1a',
    zIndex: 5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(42, 26, 26, 0.8)',
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
    backgroundColor: '#2a1a1a',
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 5,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: 'rgba(139, 69, 19, 0.4)',
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 0, 0.1)',
  },
  categoryButtonActive: {
    backgroundColor: '#ff4500',
    borderColor: '#ffffff',
  },
  categoryButtonText: {
    color: '#ffb366',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  packsList: {
    flex: 1,
    zIndex: 5,
  },
  packsListContent: {
    padding: 16,
  },
  packCard: {
    backgroundColor: 'rgba(42, 26, 26, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 0, 0.2)',
  },
  packHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  packName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginLeft: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  packDescription: {
    color: '#ffb366',
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
    fontWeight: '500',
  },
  sacredTheme: {
    color: '#ff4500',
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  sampleCount: {
    color: '#cc6633',
    fontSize: 12,
    fontWeight: '600',
  },
  samplesList: {
    flex: 1,
    zIndex: 5,
  },
  samplesListContent: {
    padding: 16,
  },
  sampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(42, 26, 26, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 0, 0.2)',
  },
  sampleInfo: {
    flex: 1,
  },
  sampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  sampleName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  sampleDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
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
  sampleBlessing: {
    color: '#ffcd56',
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: 6,
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
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#2a1a1a',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 69, 0, 0.2)',
    zIndex: 5,
  },
  footerButton: {
    alignItems: 'center',
    gap: 4,
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
});