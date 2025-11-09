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

  const renderFavoriteCard = ({ item }: { item: Favorite }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => handleCreateTrip(item)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.destinationInfo}>
            <Text style={styles.destination}>{item.destination}</Text>
            {item.country && (
              <Text style={styles.country}>📍 {item.country}</Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => handleDelete(item)}
            style={styles.deleteIcon}
          >
            <Text style={styles.deleteIconText}>❌</Text>
          </TouchableOpacity>
        </View>

        {item.description && (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {item.aiSuggestions && (
          <View style={styles.suggestionsContainer}>
            {item.aiSuggestions.estimatedBudget && (
              <View style={styles.suggestionItem}>
                <Text style={styles.suggestionIcon}>💰</Text>
                <Text style={styles.suggestionText}>
                  ~฿{item.aiSuggestions.estimatedBudget.toLocaleString()}
                </Text>
              </View>
            )}
            {item.aiSuggestions.duration && (
              <View style={styles.suggestionItem}>
                <Text style={styles.suggestionIcon}>⏱️</Text>
                <Text style={styles.suggestionText}>
                  {item.aiSuggestions.duration} วัน
                </Text>
              </View>
            )}
            {item.aiSuggestions.bestTime && (
              <View style={styles.suggestionItem}>
                <Text style={styles.suggestionIcon}>📅</Text>
                <Text style={styles.suggestionText}>
                  {item.aiSuggestions.bestTime}
                </Text>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity
          style={styles.createTripButton}
          onPress={() => handleCreateTrip(item)}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.createTripGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.createTripText}>✈️ สร้างทริป</Text>
          </LinearGradient>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>❤️</Text>
      <Text style={styles.emptyTitle}>ยังไม่มีสถานที่โปรด</Text>
      <Text style={styles.emptySubtitle}>
        เริ่มเพิ่มจุดหมายที่อยากไปในอนาคตกันเลย!
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← กลับ</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>สถานที่โปรด</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← กลับ</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>สถานที่โปรด</Text>
        <View style={{ width: 50 }} />
      </View>

      <FlatList
        data={favorites}
        renderItem={renderFavoriteCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          favorites.length === 0 ? styles.emptyListContainer : styles.listContainer
        }
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    fontSize: 16,
    color: '#3498db',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  destinationInfo: {
    flex: 1,
  },
  destination: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  country: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  deleteIcon: {
    padding: 4,
  },
  deleteIconText: {
    fontSize: 20,
  },
  description: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#e8f4f8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#3498db',
    fontWeight: '600',
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  suggestionText: {
    fontSize: 13,
    color: '#7f8c8d',
  },
  createTripButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  createTripGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  createTripText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});