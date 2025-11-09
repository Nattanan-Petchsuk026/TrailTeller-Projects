import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { searchDestinations } from '../api/ai';
import { addFavorite } from '../api/favorites';
import {
  Search,
  MapPin,
  Heart,
  Calendar,
  Sparkles,
  TrendingUp,
  ChevronLeft,
  X,
  Lightbulb,
  Star
} from 'lucide-react-native';

interface Destination {
  name: string;
  country: string;
  description: string;
  tags: string[];
  bestTime: string;
  estimatedBudget: number;
  highlights: string[];
  activities: string[];
}

export default function SearchDestinationsScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกคำค้นหา');
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const response = await searchDestinations(searchQuery);
      setResults(response.data.results || []);
    } catch (error: any) {
      console.error('Search error:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถค้นหาได้ กรุณาลองใหม่อีกครั้ง');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToFavorites = async (destination: Destination) => {
    try {
      await addFavorite({
        destination: destination.name,
        country: destination.country,
        description: destination.description,
        tags: destination.tags,
        aiSuggestions: {
          bestTime: destination.bestTime,
          estimatedBudget: destination.estimatedBudget,
          highlights: destination.highlights,
        },
      });

      Alert.alert('สำเร็จ', `เพิ่ม "${destination.name}" เข้าสถานที่โปรดแล้ว`, [
        {
          text: 'ดูสถานที่โปรด',
          onPress: () => navigation.navigate('Favorites'),
        },
        { text: 'ตกลง', style: 'cancel' },
      ]);
    } catch (error: any) {
      Alert.alert(
        'ข้อผิดพลาด',
        error.response?.data?.message || 'ไม่สามารถเพิ่มเข้าสถานที่โปรดได้'
      );
    }
  };

  const handleCreateTrip = (destination: Destination) => {
    navigation.navigate('NewTrip', {
      prefillData: {
        destination: destination.name,
        country: destination.country,
        aiSuggestions: {
          bestTime: destination.bestTime,
          estimatedBudget: destination.estimatedBudget,
          highlights: destination.highlights,
          activities: destination.activities,
        },
      },
    });
  };

  const renderDestinationCard = (destination: Destination, index: number) => (
    <View key={index} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.rankBadge}>
          <TrendingUp size={12} color="#F59E0B" strokeWidth={2.5} />
          <Text style={styles.rankText}>#{index + 1}</Text>
        </View>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => handleAddToFavorites(destination)}
        >
          <Heart size={20} color="#EF4444" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.destinationHeader}>
        <Text style={styles.destinationName}>{destination.name}</Text>
        <View style={styles.countryRow}>
          <MapPin size={14} color="#64748B" strokeWidth={2} />
          <Text style={styles.country}>{destination.country}</Text>
        </View>
      </View>

      <Text style={styles.description}>{destination.description}</Text>

      {destination.tags && destination.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {destination.tags.slice(0, 3).map((tag, i) => (
            <View key={i} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.infoGrid}>
        <View style={styles.infoBox}>
          <View style={styles.infoIconContainer}>
            <Calendar size={16} color="#0066FF" strokeWidth={2} />
          </View>
          <Text style={styles.infoLabel}>ช่วงเวลา</Text>
          <Text style={styles.infoValue}>{destination.bestTime}</Text>
        </View>
        <View style={styles.infoBox}>
          <View style={styles.infoIconContainer}>
            <Text style={styles.infoCurrency}>฿</Text>
          </View>
          <Text style={styles.infoLabel}>งบประมาณ</Text>
          <Text style={styles.infoValue}>
            {destination.estimatedBudget.toLocaleString('th-TH')}
          </Text>
        </View>
      </View>

      {destination.highlights && destination.highlights.length > 0 && (
        <View style={styles.highlightsContainer}>
          <View style={styles.highlightsTitleRow}>
            <Star size={14} color="#F59E0B" fill="#F59E0B" strokeWidth={0} />
            <Text style={styles.highlightsTitle}>ไฮไลท์</Text>
          </View>
          {destination.highlights.slice(0, 3).map((highlight, i) => (
            <View key={i} style={styles.highlightItem}>
              <View style={styles.highlightDot} />
              <Text style={styles.highlightText}>{highlight}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.createTripButton}
        onPress={() => handleCreateTrip(destination)}
      >
        <LinearGradient
          colors={['#0066FF', '#0047B3'] as const}
          style={styles.createTripGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Sparkles size={18} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.createTripText}>วางแผนทริป</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={['#0066FF', '#0047B3'] as const}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={28} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ค้นหาสถานที่</Text>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color="#64748B" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="ค้นหาจุดหมาย เช่น ชายหาดสวย, ภูเขา..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            placeholderTextColor="#94A3B8"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color="#94A3B8" strokeWidth={2.5} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.searchButton, loading && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Sparkles size={18} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.searchButtonText}>ค้นหา</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Results */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066FF" />
            <Text style={styles.loadingText}>กำลังค้นหา...</Text>
          </View>
        ) : hasSearched && results.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Search size={48} color="#94A3B8" strokeWidth={2} />
            </View>
            <Text style={styles.emptyTitle}>ไม่พบผลลัพธ์</Text>
            <Text style={styles.emptySubtitle}>
              ลองเปลี่ยนคำค้นหาหรือค้นหาแบบอื่นดูนะคะ
            </Text>
          </View>
        ) : (
          <>
            {results.length > 0 && (
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsCount}>
                  พบ {results.length} สถานที่
                </Text>
                <Text style={styles.resultsQuery}>
                  จากคำค้นหา "{searchQuery}"
                </Text>
              </View>
            )}
            {results.map((destination, index) =>
              renderDestinationCard(destination, index)
            )}
          </>
        )}

        {!hasSearched && (
          <View style={styles.suggestionsContainer}>
            <View style={styles.suggestionsTitleRow}>
              <Lightbulb size={20} color="#F59E0B" strokeWidth={2.5} />
              <Text style={styles.suggestionsTitle}>ลองค้นหา</Text>
            </View>
            {[
              'ชายหาดสวยในไทย',
              'ภูเขาใกล้กรุงเทพ',
              'เมืองท่องเที่ยวญี่ปุ่น',
              'จุดหมายโรแมนติก',
              'ที่เที่ยวครอบครัว',
            ].map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionChip}
                onPress={() => {
                  setSearchQuery(suggestion);
                  setTimeout(handleSearch, 100);
                }}
              >
                <Search size={14} color="#0066FF" strokeWidth={2} />
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerGradient: {
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  headerRight: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  searchButton: {
    backgroundColor: '#0066FF',
    borderRadius: 12,
    paddingHorizontal: 20,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  resultsCount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  resultsQuery: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
  },
  favoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  destinationHeader: {
    marginBottom: 12,
  },
  destinationName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  country: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 16,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#0066FF',
    fontWeight: '600',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  infoBox: {
    flex: 1,
    alignItems: 'center',
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoCurrency: {
    fontSize: 16,
    color: '#0066FF',
    fontWeight: '700',
  },
  infoLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 4,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  highlightsContainer: {
    marginBottom: 16,
  },
  highlightsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  highlightsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  highlightDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#0066FF',
    marginRight: 10,
    marginTop: 7,
  },
  highlightText: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    fontWeight: '500',
  },
  createTripButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  createTripGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  createTripText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  emptyState: {
    paddingVertical: 80,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  suggestionsContainer: {
    padding: 20,
  },
  suggestionsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  suggestionText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
});