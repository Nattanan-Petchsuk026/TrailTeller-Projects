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
  Hotel,
  Star,
  Sparkles,
} from 'lucide-react-native';
import DatePickerInput from '../components/DatePickerInput';
import apiClient from '../api/client';

interface Hotel {
  id: string;
  name: string;
  location: string;
  rating: number;
  price: number;
  currency: string;
  imageUrl: string;
  amenities: string[];
  roomType: string;
  description: string;
  address: string;
  checkIn: string;
  checkOut: string;
}

export default function HotelSearchScreen({ route, navigation }: any) {
  const { tripId } = route.params || {};

  // Form State
  const [destination, setDestination] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState('2');

  // Results State
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!destination || !checkInDate || !checkOutDate || !guests) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    // ตรวจสอบวันที่
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    
    if (checkOut <= checkIn) {
      Alert.alert('ข้อผิดพลาด', 'วันเช็คเอาท์ต้องหลังจากวันเช็คอิน');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const response = await apiClient.get('/bookings/search/hotels', {
        params: {
          destination,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          guests: parseInt(guests),
        },
      });

      setHotels(response.data.data || []);
    } catch (error: any) {
      console.error('Search hotels error:', error);
      Alert.alert(
        'ข้อผิดพลาด',
        error.response?.data?.message || 'ไม่สามารถค้นหาโรงแรมได้'
      );
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookHotel = (hotel: Hotel) => {
  // นำไปยังหน้ายืนยันการจอง พร้อมส่งข้อมูลที่จำเป็น
  navigation.navigate('BookingConfirm', {
    hotel,
    tripId,
    checkInDate,
    checkOutDate,
    guests,
  });
};


  const renderHotelCard = (hotel: Hotel, index: number) => (
    <View key={index} style={styles.hotelCard}>
      <Image
        source={{ uri: hotel.imageUrl }}
        style={styles.hotelImage}
        resizeMode="cover"
      />

      <View style={styles.hotelContent}>
        <View style={styles.hotelHeader}>
          <Text style={styles.hotelName} numberOfLines={2}>
            {hotel.name}
          </Text>
          {hotel.rating > 0 && (
            <View style={styles.ratingContainer}>
              <Star size={14} color="#F59E0B" fill="#F59E0B" strokeWidth={0} />
              <Text style={styles.ratingText}>{hotel.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>

        <View style={styles.locationRow}>
          <MapPin size={14} color="#64748B" strokeWidth={2} />
          <Text style={styles.locationText} numberOfLines={1}>
            {hotel.location}
          </Text>
        </View>

        {hotel.description && (
          <Text style={styles.hotelDescription} numberOfLines={2}>
            {hotel.description}
          </Text>
        )}

        {hotel.amenities && hotel.amenities.length > 0 && (
          <View style={styles.amenitiesContainer}>
            {hotel.amenities.slice(0, 3).map((amenity, i) => (
              <View key={i} style={styles.amenityChip}>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.hotelFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>เริ่มต้น</Text>
            <Text style={styles.priceValue}>
              ฿{hotel.price.toLocaleString('th-TH')}
            </Text>
            <Text style={styles.priceUnit}>/คืน</Text>
          </View>

          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => handleBookHotel(hotel)}
          >
            <LinearGradient
              colors={['#0066FF', '#0047B3'] as const}
              style={styles.bookButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Hotel size={18} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.bookButtonText}>จอง</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
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
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>ค้นหาโรงแรม</Text>
            <Text style={styles.headerSubtitle}>
              ค้นหาที่พักที่เหมาะกับคุณ
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
            <Sparkles size={24} color="#0066FF" strokeWidth={2.5} />
            <Text style={styles.searchTitle}>ค้นหาที่พัก</Text>
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

          {/* Date Pickers */}
          <View style={styles.dateRow}>
            <View style={styles.dateGroup}>
              <DatePickerInput
                label="เช็คอิน"
                value={checkInDate}
                onChange={setCheckInDate}
                disabled={loading}
                placeholder="เลือกวันเช็คอิน"
              />
            </View>
            <View style={styles.dateGroup}>
              <DatePickerInput
                label="เช็คเอาท์"
                value={checkOutDate}
                onChange={setCheckOutDate}
                disabled={loading}
                placeholder="เลือกวันเช็คเอาท์"
              />
            </View>
          </View>

          {/* Guests Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>จำนวนผู้เข้าพัก</Text>
            <View style={styles.inputContainer}>
              <Users size={20} color="#64748B" strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="2"
                placeholderTextColor="#94A3B8"
                value={guests}
                onChangeText={setGuests}
                keyboardType="numeric"
                editable={!loading}
              />
              <Text style={styles.inputSuffix}>คน</Text>
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
                  : (['#0066FF', '#0047B3'] as const)
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
                  <Text style={styles.searchButtonText}>ค้นหาโรงแรม</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Results */}
        {searched && (
          <View style={styles.resultsSection}>
            <View style={styles.resultHeader}>
              <Hotel size={20} color="#0066FF" strokeWidth={2.5} />
              <Text style={styles.resultTitle}>
                {loading
                  ? 'กำลังค้นหา...'
                  : `พบ ${hotels.length} โรงแรม`}
              </Text>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0066FF" />
                <Text style={styles.loadingText}>กำลังค้นหาโรงแรม...</Text>
              </View>
            ) : hotels.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Hotel size={48} color="#94A3B8" strokeWidth={2} />
                </View>
                <Text style={styles.emptyTitle}>ไม่พบโรงแรม</Text>
                <Text style={styles.emptySubtitle}>
                  ลองเปลี่ยนเงื่อนไขการค้นหาดูนะคะ
                </Text>
              </View>
            ) : (
              hotels.map((hotel, index) => renderHotelCard(hotel, index))
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
  inputSuffix: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  dateGroup: {
    flex: 1,
  },
  searchButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#0066FF',
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
  hotelCard: {
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
  hotelImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F1F5F9',
  },
  hotelContent: {
    padding: 16,
  },
  hotelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  hotelName: {
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
  hotelDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 12,
    fontWeight: '500',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  amenityChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  amenityText: {
    fontSize: 12,
    color: '#0066FF',
    fontWeight: '600',
  },
  hotelFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EF4444',
    letterSpacing: -0.5,
  },
  priceUnit: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  bookButton: {
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  bookButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 6,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});