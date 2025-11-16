import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  Check,
  Plane,
  Calendar,
  Users,
  MapPin,
  Clock,
  FileText,
  CreditCard,
  AlertCircle,
  ArrowRight,
} from 'lucide-react-native';
import { createBooking } from '../api/bookings';

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

export default function FlightBookingConfirmScreen({ route, navigation }: any) {
  const { flight, tripId, departureDate, returnDate, passengers } = route.params;

  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const totalPassengers = parseInt(passengers) || 1;
  const totalPrice = flight.price * totalPassengers;
  const isRoundTrip = !!returnDate && !!flight.returnFlight;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleConfirmBooking = async () => {
    if (!tripId) {
      Alert.alert('ข้อผิดพลาด', 'ไม่พบข้อมูลทริป');
      return;
    }

    Alert.alert(
      'ยืนยันการจอง',
      `คุณต้องการจอง ${flight.airline} ${flight.flightNumber} หรือไม่?\n\nยอดรวม: ฿${totalPrice.toLocaleString('th-TH')}`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ยืนยัน',
          onPress: async () => {
            setLoading(true);
            try {
              await createBooking({
                tripId,
                type: 'flight',
                title: `${flight.airline} ${flight.flightNumber}`,
                description: `${flight.departureAirport} → ${flight.arrivalAirport}${isRoundTrip ? ' (ไป-กลับ)' : ''}`,
                price: totalPrice,
                startDate: departureDate,
                endDate: returnDate || departureDate,
                status: 'confirmed',
                details: {
                  flightNumber: flight.flightNumber,
                  airline: flight.airline,
                  departureAirport: flight.departureAirport,
                  arrivalAirport: flight.arrivalAirport,
                  departureTime: flight.departureTime,
                  arrivalTime: flight.arrivalTime,
                  seatClass: flight.seatClass,
                  passengers: totalPassengers,
                  returnFlight: flight.returnFlight,
                  bookingUrl: flight.bookingUrl,
                },
                notes: notes,
              });

              Alert.alert('สำเร็จ! 🎉', 'จองเที่ยวบินเรียบร้อยแล้ว', [
                {
                  text: 'ดูทริป',
                  onPress: () => {
                    navigation.navigate('TripDetail', { tripId });
                  },
                },
              ]);
            } catch (error: any) {
              console.error('Booking error:', error);
              Alert.alert(
                'ข้อผิดพลาด',
                error.response?.data?.message || 'ไม่สามารถจองได้'
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

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
            <Text style={styles.headerTitle}>ยืนยันการจอง</Text>
            <Text style={styles.headerSubtitle}>ตรวจสอบรายละเอียด</Text>
          </View>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Flight Card */}
        <View style={styles.flightCard}>
          <LinearGradient
            colors={['#F59E0B', '#D97706'] as const}
            style={styles.flightGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.airlineHeader}>
              <Plane size={32} color="#FFFFFF" strokeWidth={2.5} />
              <View style={styles.airlineInfo}>
                <Text style={styles.airlineName}>{flight.airline}</Text>
                <Text style={styles.flightNumber}>{flight.flightNumber}</Text>
              </View>
              <View style={styles.classBadge}>
                <Text style={styles.classText}>{flight.seatClass}</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Outbound Flight */}
          <View style={styles.flightDetails}>
            <Text style={styles.flightLabel}>เที่ยวบินไป</Text>
            <View style={styles.routeContainer}>
              <View style={styles.routePoint}>
                <Text style={styles.airportCode}>{flight.departureAirport}</Text>
                <Text style={styles.timeText}>{flight.departureTime}</Text>
                <Text style={styles.dateText}>{formatDate(departureDate)}</Text>
              </View>

              <View style={styles.routeMiddle}>
                <View style={styles.routeDot} />
                <View style={styles.routeLine} />
                <Plane size={20} color="#F59E0B" strokeWidth={2.5} style={styles.routePlane} />
                <View style={styles.routeLine} />
                <View style={styles.routeDot} />
                <Text style={styles.durationText}>{flight.duration}</Text>
              </View>

              <View style={styles.routePoint}>
                <Text style={styles.airportCode}>{flight.arrivalAirport}</Text>
                <Text style={styles.timeText}>{flight.arrivalTime}</Text>
                <Text style={styles.dateText}>{formatDate(departureDate)}</Text>
              </View>
            </View>

            {/* Return Flight */}
            {isRoundTrip && flight.returnFlight && (
              <>
                <View style={styles.divider} />
                <Text style={styles.flightLabel}>เที่ยวบินกลับ</Text>
                <View style={styles.routeContainer}>
                  <View style={styles.routePoint}>
                    <Text style={styles.airportCode}>{flight.arrivalAirport}</Text>
                    <Text style={styles.timeText}>{flight.returnFlight.departureTime}</Text>
                    <Text style={styles.dateText}>{formatDate(returnDate)}</Text>
                  </View>

                  <View style={styles.routeMiddle}>
                    <View style={styles.routeDot} />
                    <View style={styles.routeLine} />
                    <Plane size={20} color="#F59E0B" strokeWidth={2.5} style={styles.routePlane} />
                    <View style={styles.routeLine} />
                    <View style={styles.routeDot} />
                    <Text style={styles.durationText}>{flight.duration}</Text>
                  </View>

                  <View style={styles.routePoint}>
                    <Text style={styles.airportCode}>{flight.departureAirport}</Text>
                    <Text style={styles.timeText}>{flight.returnFlight.arrivalTime}</Text>
                    <Text style={styles.dateText}>{formatDate(returnDate)}</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Passenger Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={20} color="#F59E0B" strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>รายละเอียดผู้โดยสาร</Text>
          </View>

          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Users size={20} color="#F59E0B" strokeWidth={2.5} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>จำนวนผู้โดยสาร</Text>
                <Text style={styles.detailValue}>{totalPassengers} คน</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Calendar size={20} color="#0066FF" strokeWidth={2.5} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>ประเภทเที่ยวบิน</Text>
                <Text style={styles.detailValue}>
                  {isRoundTrip ? 'ไป-กลับ' : 'เที่ยวเดียว'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Clock size={20} color="#10B981" strokeWidth={2.5} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>ระยะเวลาการบิน</Text>
                <Text style={styles.detailValue}>{flight.duration}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Price Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CreditCard size={20} color="#F59E0B" strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>สรุปราคา</Text>
          </View>

          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                ฿{flight.price.toLocaleString('th-TH')} × {totalPassengers} คน
              </Text>
              <Text style={styles.priceValue}>
                ฿{totalPrice.toLocaleString('th-TH')}
              </Text>
            </View>

            {isRoundTrip && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>
                  เที่ยวบินไป-กลับ
                </Text>
                <Text style={styles.priceTag}>รวมแล้ว</Text>
              </View>
            )}

            <View style={styles.priceDivider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>ยอดรวมทั้งหมด</Text>
              <Text style={styles.totalValue}>
                ฿{totalPrice.toLocaleString('th-TH')}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={20} color="#F59E0B" strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>หมายเหตุ (ไม่บังคับ)</Text>
          </View>

          <View style={styles.notesCard}>
            <TextInput
              style={styles.notesInput}
              placeholder="เช่น ต้องการที่นั่งติดหน้าต่าง, อาหารพิเศษ..."
              placeholderTextColor="#94A3B8"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!loading}
            />
          </View>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <View style={styles.infoIconContainer}>
            <AlertCircle size={20} color="#F59E0B" strokeWidth={2.5} />
          </View>
          <Text style={styles.infoText}>
            การจองนี้จะถูกบันทึกในแผนการเดินทางของคุณ
            และคุณสามารถดูหรือแก้ไขได้ในภายหลัง
          </Text>
        </View>

        {/* Confirm Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
            onPress={handleConfirmBooking}
            disabled={loading}
          >
            <LinearGradient
              colors={
                loading
                  ? ['#94A3B8', '#64748B']
                  : (['#10B981', '#059669'] as const)
              }
              style={styles.confirmButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {loading ? (
                <>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.confirmButtonText}>กำลังจอง...</Text>
                </>
              ) : (
                <>
                  <Check size={20} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={styles.confirmButtonText}>ยืนยันการจอง</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

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
  flightCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  flightGradient: {
    padding: 20,
  },
  airlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  airlineInfo: {
    flex: 1,
  },
  airlineName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  flightNumber: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.95,
    fontWeight: '600',
  },
  classBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  classText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  flightDetails: {
    padding: 20,
  },
  flightLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  routePoint: {
    alignItems: 'center',
    flex: 1,
  },
  airportCode: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  timeText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 4,
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 2,
  },
  routeMiddle: {
    flex: 2,
    alignItems: 'center',
    position: 'relative',
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    position: 'absolute',
    left: 0,
  },
  routeLine: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: '#E2E8F0',
  },
  routePlane: {
    zIndex: 1,
  },
  durationText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 28,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  priceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  priceTag: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: -0.5,
  },
  notesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notesInput: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  infoIconContainer: {
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 20,
    fontWeight: '600',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  confirmButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});