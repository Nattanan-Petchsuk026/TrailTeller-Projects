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
import {
  ChevronLeft,
  Search,
  MapPin,
  Calendar,
  Users,
  Plane,
  Clock,
  Sparkles,
} from 'lucide-react-native';
import DatePickerInput from '../components/DatePickerInput';
import apiClient from '../api/client';

interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  currency: string;
  seatClass: string;
  availableSeats: number;
  bookingUrl?: string;
  returnFlight?: {
    flightNumber: string;
    departureTime: string;
    arrivalTime: string;
  };
}

export default function FlightSearchScreen({ route, navigation }: any) {
  const { tripId } = route.params || {};

  // Form State
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState('1');
  const [seatClass, setSeatClass] = useState('Economy');

  // Results State
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!origin || !destination || !departureDate || !passengers) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const response = await apiClient.get('/bookings/search/flights', {
        params: {
          origin,
          destination,
          departureDate,
          returnDate: returnDate || undefined,
          passengers: parseInt(passengers),
          seatClass,
        },
      });

      setFlights(response.data.data || []);
    } catch (error: any) {
      console.error('Search flights error:', error);
      Alert.alert(
        'ข้อผิดพลาด',
        error.response?.data?.message || 'ไม่สามารถค้นหาเที่ยวบินได้'
      );
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookFlight = (flight: Flight) => {
    navigation.navigate('FlightBookingConfirm', {
      flight,
      tripId,
      departureDate,
      returnDate,
      passengers,
    });
  };

  const renderFlightCard = (flight: Flight, index: number) => (
    <View key={index} style={styles.flightCard}>
      <View style={styles.flightHeader}>
        <View style={styles.airlineContainer}>
          <Plane size={24} color="#0066FF" strokeWidth={2.5} />
          <View>
            <Text style={styles.airlineName}>{flight.airline}</Text>
            <Text style={styles.flightNumber}>{flight.flightNumber}</Text>
          </View>
        </View>
        <View style={styles.seatClassBadge}>
          <Text style={styles.seatClassText}>{flight.seatClass}</Text>
        </View>
      </View>

      <View style={styles.flightRoute}>
        <View style={styles.routePoint}>
          <Text style={styles.airportCode}>{flight.departureAirport}</Text>
          <Text style={styles.timeText}>{flight.departureTime}</Text>
        </View>

        <View style={styles.routeLine}>
          <View style={styles.routeDot} />
          <View style={styles.routePath} />
          <Plane size={16} color="#0066FF" strokeWidth={2.5} style={styles.routePlane} />
          <View style={styles.routePath} />
          <View style={styles.routeDot} />
        </View>

        <View style={styles.routePoint}>
          <Text style={styles.airportCode}>{flight.arrivalAirport}</Text>
          <Text style={styles.timeText}>{flight.arrivalTime}</Text>
        </View>
      </View>

      <View style={styles.flightInfo}>
        <View style={styles.infoItem}>
          <Clock size={16} color="#64748B" strokeWidth={2} />
          <Text style={styles.infoText}>{flight.duration}</Text>
        </View>
        <View style={styles.infoItem}>
          <Users size={16} color="#64748B" strokeWidth={2} />
          <Text style={styles.infoText}>{flight.availableSeats} ที่นั่งว่าง</Text>
        </View>
      </View>

      <View style={styles.flightFooter}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>เริ่มต้น</Text>
          <Text style={styles.priceValue}>
            ฿{flight.price.toLocaleString('th-TH')}
          </Text>
          <Text style={styles.priceUnit}>/คน</Text>
        </View>

        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => handleBookFlight(flight)}
        >
          <LinearGradient
            colors={['#0066FF', '#0047B3'] as const}
            style={styles.bookButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Plane size={18} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.bookButtonText}>จอง</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={['#F59E0B', '#D97706'] as const}
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
            <Text style={styles.headerTitle}>ค้นหาเที่ยวบิน</Text>
            <Text style={styles.headerSubtitle}>
              เปรียบเทียบราคาเที่ยวบิน
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
            <Sparkles size={24} color="#F59E0B" strokeWidth={2.5} />
            <Text style={styles.searchTitle}>ค้นหาเที่ยวบิน</Text>
          </View>

          {/* Origin Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>ต้นทาง</Text>
            <View style={styles.inputContainer}>
              <MapPin size={20} color="#64748B" strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="เช่น BKK, DMK"
                placeholderTextColor="#94A3B8"
                value={origin}
                onChangeText={setOrigin}
                editable={!loading}
              />
            </View>
          </View>

          {/* Destination Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>ปลายทาง</Text>
            <View style={styles.inputContainer}>
              <MapPin size={20} color="#64748B" strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="เช่น CNX, HKT"
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
                label="วันไป"
                value={departureDate}
                onChange={setDepartureDate}
                disabled={loading}
                placeholder="เลือกวันไป"
              />
            </View>
            <View style={styles.dateGroup}>
              <DatePickerInput
                label="วันกลับ (ถ้ามี)"
                value={returnDate}
                onChange={setReturnDate}
                disabled={loading}
                placeholder="เลือกวันกลับ"
              />
            </View>
          </View>

          {/* Passengers & Class */}
          <View style={styles.rowGroup}>
            <View style={styles.halfGroup}>
              <Text style={styles.label}>ผู้โดยสาร</Text>
              <View style={styles.inputContainer}>
                <Users size={20} color="#64748B" strokeWidth={2} />
                <TextInput
                  style={styles.input}
                  placeholder="1"
                  placeholderTextColor="#94A3B8"
                  value={passengers}
                  onChangeText={setPassengers}
                  keyboardType="numeric"
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.halfGroup}>
              <Text style={styles.label}>ชั้นโดยสาร</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Economy"
                  placeholderTextColor="#94A3B8"
                  value={seatClass}
                  onChangeText={setSeatClass}
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
                  : (['#F59E0B', '#D97706'] as const)
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
                  <Text style={styles.searchButtonText}>ค้นหาเที่ยวบิน</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Results */}
        {searched && (
          <View style={styles.resultsSection}>
            <View style={styles.resultHeader}>
              <Plane size={20} color="#F59E0B" strokeWidth={2.5} />
              <Text style={styles.resultTitle}>
                {loading
                  ? 'กำลังค้นหา...'
                  : `พบ ${flights.length} เที่ยวบิน`}
              </Text>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#F59E0B" />
                <Text style={styles.loadingText}>กำลังค้นหาเที่ยวบิน...</Text>
              </View>
            ) : flights.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Plane size={48} color="#94A3B8" strokeWidth={2} />
                </View>
                <Text style={styles.emptyTitle}>ไม่พบเที่ยวบิน</Text>
                <Text style={styles.emptySubtitle}>
                  ลองเปลี่ยนเงื่อนไขการค้นหาดูนะคะ
                </Text>
              </View>
            ) : (
              flights.map((flight, index) => renderFlightCard(flight, index))
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
  dateRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  dateGroup: {
    flex: 1,
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
    shadowColor: '#F59E0B',
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
  flightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  flightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  airlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  airlineName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  flightNumber: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  seatClassBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  seatClassText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0066FF',
  },
  flightRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  routePoint: {
    alignItems: 'center',
  },
  airportCode: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  timeText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 4,
  },
  routeLine: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0066FF',
  },
  routePath: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
  },
  routePlane: {
    marginHorizontal: 8,
  },
  flightInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  flightFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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