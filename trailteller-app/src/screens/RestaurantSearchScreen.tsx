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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  Search,
  MapPin,
  Calendar,
  Users,
  UtensilsCrossed,
  Star,
  Phone,
  Clock,
  Sparkles,
} from 'lucide-react-native';
import DatePickerInput from '../components/DatePickerInput';
import apiClient from '../api/client';

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  location: string;
  rating: number;
  priceRange: string;
  imageUrl: string;
  description: string;
  phoneNumber: string;
  openingHours: string;
}

export default function RestaurantSearchScreen({ route, navigation }: any) {
  const { tripId } = route.params || {};

  // Form State
  const [destination, setDestination] = useState('');
  const [reservationDate, setReservationDate] = useState('');
  const [partySize, setPartySize] = useState('2');
  const [cuisine, setCuisine] = useState('');

  // Results State
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!destination || !reservationDate || !partySize) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const response = await apiClient.get('/bookings/search/restaurants', {
        params: {
          destination,
          date: reservationDate,
          partySize: parseInt(partySize),
          cuisine: cuisine || undefined,
        },
      });

      setRestaurants(response.data.data || []);
    } catch (error: any) {
      console.error('Search restaurants error:', error);
      Alert.alert(
        'ข้อผิดพลาด',
        error.response?.data?.message || 'ไม่สามารถค้นหาร้านอาหารได้'
      );
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookRestaurant = (restaurant: Restaurant) => {
    navigation.navigate('RestaurantBookingConfirm', {
      restaurant,
      tripId,
      reservationDate,
      partySize,
    });
  };

  const renderRestaurantCard = (restaurant: Restaurant, index: number) => (
    <View key={index} style={styles.restaurantCard}>
      <Image
        source={{ uri: restaurant.imageUrl }}
        style={styles.restaurantImage}
        resizeMode="cover"
      />

      <View style={styles.restaurantContent}>
        <View style={styles.restaurantHeader}>
          <Text style={styles.restaurantName} numberOfLines={2}>
            {restaurant.name}
          </Text>
          {restaurant.rating > 0 && (
            <View style={styles.ratingContainer}>
              <Star size={14} color="#F59E0B" fill="#F59E0B" strokeWidth={0} />
              <Text style={styles.ratingText}>{restaurant.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>

        <View style={styles.cuisineRow}>
          <UtensilsCrossed size={14} color="#64748B" strokeWidth={2} />
          <Text style={styles.cuisineText}>{restaurant.cuisine}</Text>
          <View style={styles.priceRangeBadge}>
            <Text style={styles.priceRangeText}>{restaurant.priceRange}</Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <MapPin size={14} color="#64748B" strokeWidth={2} />
          <Text style={styles.locationText} numberOfLines={1}>
            {restaurant.location}
          </Text>
        </View>

        {restaurant.description && (
          <Text style={styles.restaurantDescription} numberOfLines={2}>
            {restaurant.description}
          </Text>
        )}

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Phone size={14} color="#10B981" strokeWidth={2} />
            <Text style={styles.infoText}>{restaurant.phoneNumber}</Text>
          </View>
          <View style={styles.infoItem}>
            <Clock size={14} color="#0066FF" strokeWidth={2} />
            <Text style={styles.infoText}>{restaurant.openingHours}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => handleBookRestaurant(restaurant)}
        >
          <LinearGradient
            colors={['#10B981', '#059669'] as const}
            style={styles.bookButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <UtensilsCrossed size={18} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.bookButtonText}>จองโต๊ะ</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={['#10B981', '#059669'] as const}
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
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>ค้นหาร้านอาหาร</Text>
            <Text style={styles.headerSubtitle}>
              จองโต๊ะล่วงหน้า
            </Text>
          </View>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Form */}
        <View style={styles.searchCard}>
          <View style={styles.searchHeader}>
            <Sparkles size={24} color="#10B981" strokeWidth={2.5} />
            <Text style={styles.searchTitle}>ค้นหาร้านอาหาร</Text>
          </View>

          {/* Destination Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>จุดหมาย</Text>
            <View style={styles.inputContainer}>
              <MapPin size={20} color="#64748B" strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="เช่น กรุงเทพ, เชียงใหม่, ภูเก็ต"
                placeholderTextColor="#94A3B8"
                value={destination}
                onChangeText={setDestination}
                editable={!loading}
              />
            </View>
          </View>

          {/* Reservation Date */}
          <View style={styles.formGroup}>
            <DatePickerInput
              label="วันที่ต้องการจอง"
              value={reservationDate}
              onChange={setReservationDate}
              disabled={loading}
              placeholder="เลือกวันที่"
            />
          </View>

          {/* Party Size & Cuisine */}
          <View style={styles.rowGroup}>
            <View style={styles.halfGroup}>
              <Text style={styles.label}>จำนวนคน</Text>
              <View style={styles.inputContainer}>
                <Users size={20} color="#64748B" strokeWidth={2} />
                <TextInput
                  style={styles.input}
                  placeholder="2"
                  placeholderTextColor="#94A3B8"
                  value={partySize}
                  onChangeText={setPartySize}
                  keyboardType="numeric"
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.halfGroup}>
              <Text style={styles.label}>ประเภทอาหาร</Text>
              <View style={styles.inputContainer}>
                <UtensilsCrossed size={20} color="#64748B" strokeWidth={2} />
                <TextInput
                  style={styles.input}
                  placeholder="ไทย, ญี่ปุ่น..."
                  placeholderTextColor="#94A3B8"
                  value={cuisine}
                  onChangeText={setCuisine}
                  editable={!loading}
                />
              </View>
            </View>
          </View>

          {/* Search Button */}
          <TouchableOpacity
            style={[styles.searchButton, loading && styles.searchButtonDisabled]}
            onPress={handleSearch}
            disabled={loading}
          >
            <LinearGradient
              colors={
                loading
                  ? ['#94A3B8', '#64748B']
                  : (['#10B981', '#059669'] as const)
              }
              style={styles.searchButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {loading ? (
                <>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.searchButtonText}>กำลังค้นหา...</Text>
                </>
              ) : (
                <>
                  <Search size={20} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={styles.searchButtonText}>ค้นหาร้านอาหาร</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Results */}
        {searched && (
          <View style={styles.resultsSection}>
            <View style={styles.resultHeader}>
              <UtensilsCrossed size={20} color="#10B981" strokeWidth={2.5} />
              <Text style={styles.resultTitle}>
                {loading
                  ? 'กำลังค้นหา...'
                  : `พบ ${restaurants.length} ร้านอาหาร`}
              </Text>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#10B981" />
                <Text style={styles.loadingText}>กำลังค้นหาร้านอาหาร...</Text>
              </View>
            ) : restaurants.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <UtensilsCrossed size={48} color="#94A3B8" strokeWidth={2} />
                </View>
                <Text style={styles.emptyTitle}>ไม่พบร้านอาหาร</Text>
                <Text style={styles.emptySubtitle}>
                  ลองเปลี่ยนเงื่อนไขการค้นหาดูนะคะ
                </Text>
              </View>
            ) : (
              restaurants.map((restaurant, index) => renderRestaurantCard(restaurant, index))
            )}
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
    fontWeight: '500',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  searchCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
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
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
  },
  rowGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  halfGroup: {
    flex: 1,
  },
  searchButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  resultsSection: {
    paddingHorizontal: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  restaurantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  restaurantImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#F1F5F9',
  },
  restaurantContent: {
    padding: 16,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  restaurantName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F59E0B',
  },
  cuisineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  cuisineText: {
    flex: 1,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  priceRangeBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priceRangeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  restaurantDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 12,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  bookButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  bookButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});