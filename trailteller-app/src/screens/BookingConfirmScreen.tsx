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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  Check,
  Hotel,
  Calendar,
  Users,
  MapPin,
  Clock,
  Star,
  FileText,
  CreditCard,
  AlertCircle,
} from 'lucide-react-native';
import { createBooking } from '../api/bookings';
import { createPaymentIntent } from '../api/payment';
import { Linking } from 'react-native';

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

export default function BookingConfirmScreen({ route, navigation }: any) {
  const { hotel, tripId, checkInDate, checkOutDate, guests } = route.params;

  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // คำนวณจำนวนคืน
  const calculateNights = () => {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const nights = calculateNights();
  const totalPrice = hotel.price * nights;

  // Format วันที่
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
    `คุณต้องการจอง ${hotel.name} หรือไม่?\n\nยอดรวม: ฿${totalPrice.toLocaleString('th-TH')}\n\n⚠️ คุณจะถูกนำไปยังหน้าชำระเงินเพื่อยืนยันการจอง`,
    [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ดำเนินการต่อ',
        onPress: async () => {
          setLoading(true);
          try {
            // Step 1: สร้าง Booking (สถานะ pending)
            console.log('📝 Creating booking...');
            const bookingResponse = await createBooking({
              tripId,
              type: 'hotel',
              title: hotel.name,
              description: `${hotel.roomType} - ${nights} คืน`,
              price: totalPrice,
              startDate: checkInDate,
              endDate: checkOutDate,
              status: 'pending', // ← จะถูก override เป็น pending ที่ backend
              details: {
                hotelName: hotel.name,
                roomType: hotel.roomType,
                checkIn: hotel.checkIn,
                checkOut: hotel.checkOut,
                guests: parseInt(guests),
                nights: nights,
                address: hotel.address,
                rating: hotel.rating,
                imageUrl: hotel.imageUrl,
                amenities: hotel.amenities,
              },
              notes: notes,
            });

            const bookingId = bookingResponse.data.id;
            console.log('✅ Booking created:', bookingId);

            // Step 2: สร้าง Payment Intent
            console.log('💳 Creating payment intent...');
            const paymentResponse = await createPaymentIntent({
              bookingId,
              amount: totalPrice,
            });

            console.log('✅ Payment intent created:', paymentResponse.data);

            // Step 3: เปิด URL ชำระเงิน
            const paymentUrl = paymentResponse.data.authorizeUri;
            
            Alert.alert(
              'เปิดหน้าชำระเงิน',
              'คุณจะถูกนำไปยังหน้าชำระเงิน Omise\n\n💡 หลังจากชำระเงินสำเร็จ กรุณากลับมาที่แอพเพื่อตรวจสอบสถานะการจอง',
              [
                {
                  text: 'เปิดหน้าชำระเงิน',
                  onPress: async () => {
                    const supported = await Linking.canOpenURL(paymentUrl);
                    if (supported) {
                      await Linking.openURL(paymentUrl);
                      
                      // นำทางกลับไปหน้า TripDetail
                      setTimeout(() => {
                        navigation.navigate('TripDetail', { tripId });
                      }, 1000);
                    } else {
                      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเปิดหน้าชำระเงินได้');
                    }
                  },
                },
                {
                  text: 'ยกเลิก',
                  style: 'cancel',
                  onPress: () => {
                    Alert.alert(
                      'การจองยังไม่สมบูรณ์',
                      'การจองของคุณถูกบันทึกแล้ว แต่ยังไม่ได้ชำระเงิน\n\nคุณสามารถชำระเงินภายหลังได้จากหน้ารายละเอียดทริป',
                      [
                        {
                          text: 'ตกลง',
                          onPress: () => navigation.navigate('TripDetail', { tripId }),
                        },
                      ]
                    );
                  },
                },
              ]
            );
          } catch (error: any) {
            console.error('Booking error:', error);
            Alert.alert(
              'ข้อผิดพลาด',
              error.response?.data?.message || 'ไม่สามารถสร้างการจองได้'
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
        {/* Hotel Card */}
        <View style={styles.hotelCard}>
          <Image
            source={{ uri: hotel.imageUrl }}
            style={styles.hotelImage}
            resizeMode="cover"
          />
          <View style={styles.hotelOverlay}>
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)'] as const}
              style={styles.hotelGradient}
            >
              <View style={styles.hotelInfo}>
                <Text style={styles.hotelName}>{hotel.name}</Text>
                <View style={styles.hotelLocationRow}>
                  <MapPin size={14} color="#FFFFFF" strokeWidth={2} />
                  <Text style={styles.hotelLocation}>{hotel.location}</Text>
                </View>
              </View>
              {hotel.rating > 0 && (
                <View style={styles.ratingBadge}>
                  <Star size={14} color="#F59E0B" fill="#F59E0B" strokeWidth={0} />
                  <Text style={styles.ratingText}>{hotel.rating.toFixed(1)}</Text>
                </View>
              )}
            </LinearGradient>
          </View>
        </View>

        {/* Booking Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color="#0066FF" strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>รายละเอียดการจอง</Text>
          </View>

          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Calendar size={20} color="#0066FF" strokeWidth={2.5} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>เช็คอิน</Text>
                <Text style={styles.detailValue}>{formatDate(checkInDate)}</Text>
                <Text style={styles.detailTime}>เวลา {hotel.checkIn}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Calendar size={20} color="#EF4444" strokeWidth={2.5} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>เช็คเอาท์</Text>
                <Text style={styles.detailValue}>{formatDate(checkOutDate)}</Text>
                <Text style={styles.detailTime}>เวลา {hotel.checkOut}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Clock size={20} color="#10B981" strokeWidth={2.5} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>ระยะเวลา</Text>
                <Text style={styles.detailValue}>{nights} คืน</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Users size={20} color="#8B5CF6" strokeWidth={2.5} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>จำนวนผู้เข้าพัก</Text>
                <Text style={styles.detailValue}>{guests} คน</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Room Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Hotel size={20} color="#0066FF" strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>ห้องพัก</Text>
          </View>

          <View style={styles.roomCard}>
            <Text style={styles.roomType}>{hotel.roomType}</Text>
            {hotel.description && (
              <Text style={styles.roomDescription}>{hotel.description}</Text>
            )}

            {hotel.amenities && hotel.amenities.length > 0 && (
              <View style={styles.amenitiesContainer}>
                <Text style={styles.amenitiesTitle}>สิ่งอำนวยความสะดวก</Text>
                <View style={styles.amenitiesGrid}>
                  {hotel.amenities.map((amenity: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined, index: React.Key | null | undefined) => (
                    <View key={index} style={styles.amenityItem}>
                      <Check size={16} color="#10B981" strokeWidth={2.5} />
                      <Text style={styles.amenityText}>{amenity}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Price Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CreditCard size={20} color="#0066FF" strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>สรุปราคา</Text>
          </View>

          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                ฿{hotel.price.toLocaleString('th-TH')} × {nights} คืน
              </Text>
              <Text style={styles.priceValue}>
                ฿{totalPrice.toLocaleString('th-TH')}
              </Text>
            </View>

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
            <FileText size={20} color="#0066FF" strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>หมายเหตุ (ไม่บังคับ)</Text>
          </View>

          <View style={styles.notesCard}>
            <TextInput
              style={styles.notesInput}
              placeholder="เช่น ต้องการห้องชั้นสูง, เตียงเสริม..."
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
    <AlertCircle size={20} color="#0066FF" strokeWidth={2.5} />
  </View>
  <Text style={styles.infoText}>
    การจองนี้จะถูกบันทึกในสถานะ "รอชำระเงิน" ก่อน{'\n'}
    หลังจากชำระเงินสำเร็จ สถานะจะเปลี่ยนเป็น "ยืนยันแล้ว" อัตโนมัติ
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
        <Text style={styles.confirmButtonText}>กำลังดำเนินการ...</Text>
      </>
    ) : (
      <>
        <Check size={20} color="#FFFFFF" strokeWidth={2.5} />
        <Text style={styles.confirmButtonText}>ดำเนินการจอง</Text>
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
  hotelCard: {
    position: 'relative',
    height: 250,
    marginBottom: 16,
  },
  hotelImage: {
    width: '100%',
    height: '100%',
  },
  hotelOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  hotelGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  hotelInfo: {
    flex: 1,
  },
  hotelName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  hotelLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hotelLocation: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.95,
    fontWeight: '600',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(254, 243, 199, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F59E0B',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
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
  detailTime: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  roomCard: {
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
  roomType: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  roomDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
    fontWeight: '500',
  },
  amenitiesContainer: {
    marginTop: 8,
  },
  amenitiesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  amenitiesGrid: {
    gap: 10,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amenityText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
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
    backgroundColor: '#EFF6FF',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoIconContainer: {
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#0066FF',
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
})