import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { getAllFavorites, deleteFavorite, Favorite } from '../api/favorites';
import {
  ChevronLeft,
  MapPin,
  Trash2,
  Sparkles,
  Calendar,
  Heart,
  Star,
} from 'lucide-react-native';

export default function FavoritesScreen({ navigation }: any) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    try {
      const response = await getAllFavorites();
      setFavorites(response.data);
    } catch (error) {
      console.error('Load favorites error:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFavorites();
  };

  const handleDelete = (favorite: Favorite) => {
    Alert.alert(
      'ลบสถานที่โปรด',
      `คุณต้องการลบ "${favorite.destination}" หรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ลบ',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFavorite(favorite.id);
              setFavorites(favorites.filter((f) => f.id !== favorite.id));
              Alert.alert('สำเร็จ', 'ลบสถานที่โปรดเรียบร้อยแล้ว');
            } catch (error) {
              Alert.alert('ข้อผิดพลาด', 'ไม่สามารถลบได้');
            }
          },
        },
      ]
    );
  };

  const handleCreateTrip = (favorite: Favorite) => {
    Alert.alert(
      'สร้างทริป',
      `ต้องการสร้างทริปไป ${favorite.destination} หรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'สร้างทริป',
          onPress: () => {
            navigation.navigate('NewTrip', {
              prefillData: {
                destination: favorite.destination,
                country: favorite.country,
                aiSuggestions: favorite.aiSuggestions,
              },
            });
          },
        },
      ]
    );
  };

  const renderFavoriteCard = ({ item, index }: { item: Favorite; index: number }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.favoriteIndicator}>
          <Heart size={16} color="#EF4444" fill="#EF4444" strokeWidth={0} />
        </View>
        <TouchableOpacity
          onPress={() => handleDelete(item)}
          style={styles.deleteButton}
        >
          <Trash2 size={18} color="#EF4444" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.destinationHeader}>
        <Text style={styles.destinationName}>{item.destination}</Text>
        {item.country && (
          <View style={styles.countryRow}>
            <MapPin size={14} color="#64748B" strokeWidth={2} />
            <Text style={styles.country}>{item.country}</Text>
          </View>
        )}
      </View>

      {item.description && (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 3).map((tag, i) => (
            <View key={i} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {item.aiSuggestions && (
        <View style={styles.infoGrid}>
          {item.aiSuggestions.bestTime && (
            <View style={styles.infoBox}>
              <View style={styles.infoIconContainer}>
                <Calendar size={16} color="#0066FF" strokeWidth={2} />
              </View>
              <Text style={styles.infoLabel}>ช่วงเวลา</Text>
              <Text style={styles.infoValue}>{item.aiSuggestions.bestTime}</Text>
            </View>
          )}
          {item.aiSuggestions.estimatedBudget && (
            <View style={styles.infoBox}>
              <View style={styles.infoIconContainer}>
                <Text style={styles.infoCurrency}>฿</Text>
              </View>
              <Text style={styles.infoLabel}>งบประมาณ</Text>
              <Text style={styles.infoValue}>
                {item.aiSuggestions.estimatedBudget.toLocaleString('th-TH')}
              </Text>
            </View>
          )}
          {item.aiSuggestions.duration && (
            <View style={styles.infoBox}>
              <View style={styles.infoIconContainer}>
                <Text style={styles.infoDuration}>⏱️</Text>
              </View>
              <Text style={styles.infoLabel}>ระยะเวลา</Text>
              <Text style={styles.infoValue}>{item.aiSuggestions.duration} วัน</Text>
            </View>
          )}
        </View>
      )}

      {item.aiSuggestions?.highlights && item.aiSuggestions.highlights.length > 0 && (
        <View style={styles.highlightsContainer}>
          <View style={styles.highlightsTitleRow}>
            <Star size={14} color="#F59E0B" fill="#F59E0B" strokeWidth={0} />
            <Text style={styles.highlightsTitle}>ไฮไลท์</Text>
          </View>
          {item.aiSuggestions.highlights.slice(0, 2).map((highlight, i) => (
            <View key={i} style={styles.highlightItem}>
              <View style={styles.highlightDot} />
              <Text style={styles.highlightText} numberOfLines={1}>
                {highlight}
              </Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.createTripButton}
        onPress={() => handleCreateTrip(item)}
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

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Heart size={48} color="#94A3B8" strokeWidth={2} />
      </View>
      <Text style={styles.emptyTitle}>ยังไม่มีสถานที่โปรด</Text>
      <Text style={styles.emptySubtitle}>
        เริ่มเพิ่มจุดหมายที่อยากไปในอนาคตกันเลย!
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
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
            <Text style={styles.headerTitle}>สถานที่โปรด</Text>
            <View style={styles.headerRight} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066FF" />
          <Text style={styles.loadingText}>กำลังโหลด...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
          <Text style={styles.headerTitle}>สถานที่โปรด</Text>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      {favorites.length > 0 && (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {favorites.length} สถานที่โปรด
          </Text>
          <Text style={styles.resultsSubtitle}>
            จุดหมายที่คุณอยากไป
          </Text>
        </View>
      )}

      <FlatList
        data={favorites}
        renderItem={renderFavoriteCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          favorites.length === 0 ? styles.emptyListContainer : styles.listContainer
        }
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#0066FF"
            colors={['#0066FF']}
          />
        }
        showsVerticalScrollIndicator={false}
      />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
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
  resultsSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyListContainer: {
    flexGrow: 1,
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
  favoriteIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
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
  infoDuration: {
    fontSize: 16,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
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
});