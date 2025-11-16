import React, { useState } from 'react';
import {
  View,
  Text,
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
  Hotel,
  Plane,
  UtensilsCrossed,
  CreditCard,
  AlertCircle,
  CheckCircle,
} from 'lucide-react-native';
import { createBooking } from '../api/bookings';
import { createPaymentIntent } from '../api/payment';

export default function BookingSummaryScreen({ route, navigation }: any) {
  const { tripId, bookingsToCreate, tripDestination, onComplete } = route.params;
  const [loading, setLoading] = useState(false);

  // คำนวณยอดรวม
  const totalAmount = bookingsToCreate.reduce((sum: number, booking: any) => sum + booking.price, 0);
  const itemsRequiringPayment = bookingsToCreate.filter((b: any) => b.price > 0);

  const getIcon = (type: string) => {
    switch (type) {
      case 'hotel': return Hotel;
      case 'flight': return Plane;
      case 'restaurant': return UtensilsCrossed;
      default: return CheckCircle;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'hotel': return '#0066FF';
      case 'flight': return '#F59E0B';
      case 'restaurant': return '#10B981';
      default: return '#64748B';
    }
  };

  const handleConfirmBookings = async () => {
    if (itemsRequiringPayment.length === 0) {
      Alert.alert(
        'ยืนยันการจอง',
        'บันทึกการจองเรียบร้อยแล้ว\n\n💡 การจองร้านอาหารไม่ต้องชำระเงินล่วงหน้า',
        [
          {
            text: 'ดูทริป',
            onPress: () => {
              if (onComplete) onComplete();
              else navigation.navigate('TripDetail', { tripId });
            }
          }
        ]
      );
      return;
    }

    Alert.alert(
      'ยืนยันการจอง',
      `ยอดชำระทั้งหมด: ฿${totalAmount.toLocaleString('th-TH')}\n\n⚠️ คุณจะถูกนำไปยังหน้าชำระเงินเพื่อยืนยันการจองทั้งหมด`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ดำเนินการต่อ',
          onPress: async () => {
            setLoading(true);
            try {
              const createdBookings = [];

              // 1️⃣ สร้าง Bookings ทั้งหมด
              for (const bookingData of bookingsToCreate) {
                console.log(`📝 Creating ${bookingData.type} booking...`);
                
                const bookingResponse = await createBooking({
                  tripId,
                  type: bookingData.type,
                  title: bookingData.title,
                  description: bookingData.description,
                  price: bookingData.price,
                  startDate: bookingData.startDate,
                  endDate: bookingData.endDate,
                  status: 'pending',
                  details: bookingData.details,
                  notes: bookingData.notes || '',
                });

                createdBookings.push({
                  ...bookingResponse.data,
                  originalData: bookingData,
                });

                console.log(`✅ ${bookingData.type} booking created:`, bookingResponse.data.id);
              }

              // 2️⃣ สร้าง Payment Intent สำหรับรายการที่ต้องชำระเงิน
              if (totalAmount > 0) {
                const bookingIds = createdBookings
                  .filter(b => b.originalData.price > 0)
                  .map(b => b.id);

                console.log('💳 Creating payment intent for bookings:', bookingIds);

                // ✅ เพิ่ม try-catch เฉพาะส่วน payment
                let paymentResponse;
                try {
                  paymentResponse = await createPaymentIntent({
                    bookingId: bookingIds[0],
                    amount: totalAmount,
                    metadata: {
                      tripId,
                      bookingIds: bookingIds.join(','),
                      itemCount: bookingIds.length,
                    }
                  });

                  console.log('✅ Payment Response:', paymentResponse);
                } catch (paymentError: any) {
                  console.error('❌ Payment Intent Error:', paymentError);
                  Alert.alert(
                    'ข้อผิดพลาด',
                    `ไม่สามารถสร้างหน้าชำระเงินได้\n\nรายละเอียด: ${paymentError.message}\n\nการจองของคุณถูกบันทึกแล้ว คุณสามารถชำระเงินภายหลังได้`,
                    [
                      {
                        text: 'ตกลง',
                        onPress: () => {
                          if (onComplete) onComplete();
                          else navigation.navigate('TripDetail', { tripId });
                        }
                      }
                    ]
                  );
                  return;
                }

                // ✅ ตรวจสอบ response structure
                if (!paymentResponse || !paymentResponse.data || !paymentResponse.data.authorizeUri) {
                  console.error('❌ Invalid payment response:', paymentResponse);
                  Alert.alert(
                    'ข้อผิดพลาด',
                    'ไม่สามารถสร้างหน้าชำระเงินได้ (response ไม่ถูกต้อง)\n\nการจองของคุณถูกบันทึกแล้ว คุณสามารถชำระเงินภายหลังได้',
                    [
                      {
                        text: 'ตกลง',
                        onPress: () => {
                          if (onComplete) onComplete();
                          else navigation.navigate('TripDetail', { tripId });
                        }
                      }
                    ]
                  );
                  return;
                }

                // 3️⃣ เปิดหน้า WebView แทนเปิด Browser
                const paymentUrl = String(paymentResponse.data.authorizeUri);
                
                console.log('🔗 Opening Payment WebView:', paymentUrl);
                
                // ✅ นำไปหน้า PaymentWebView
                navigation.navigate('PaymentWebView', {
                  paymentUrl,
                  tripId,
                  onComplete,
                });
              }
            } catch (error: any) {
              console.error('❌ Booking error:', error);
              Alert.alert(
                'ข้อผิดพลาด',
                error.message || error.response?.data?.message || 'ไม่สามารถสร้างการจองได้'
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
            <Text style={styles.headerTitle}>สรุปการจอง</Text>
            <Text style={styles.headerSubtitle}>{tripDestination}</Text>
          </View>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <CheckCircle size={24} color="#10B981" strokeWidth={2.5} />
            <Text style={styles.summaryTitle}>รายการจอง</Text>
          </View>
          <Text style={styles.summarySubtitle}>
            คุณกำลังจะจอง {bookingsToCreate.length} รายการ
          </Text>
        </View>

        {/* รายการจอง */}
        <View style={styles.itemsSection}>
          {bookingsToCreate.map((booking: any, index: number) => {
            const Icon = getIcon(booking.type);
            const color = getColor(booking.type);

            return (
              <View key={index} style={styles.bookingItem}>
                <View style={[styles.itemIconContainer, { backgroundColor: color + '15' }]}>
                  <Icon size={24} color={color} strokeWidth={2.5} />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{booking.title}</Text>
                  <Text style={styles.itemDescription}>{booking.description}</Text>
                  {booking.price > 0 ? (
                    <Text style={styles.itemPrice}>
                      ฿{booking.price.toLocaleString('th-TH')}
                    </Text>
                  ) : (
                    <Text style={styles.itemFree}>ไม่ต้องชำระเงินล่วงหน้า</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* สรุปราคา */}
        {totalAmount > 0 && (
          <View style={styles.priceCard}>
            <View style={styles.priceHeader}>
              <CreditCard size={20} color="#0066FF" strokeWidth={2.5} />
              <Text style={styles.priceTitle}>สรุปราคา</Text>
            </View>

            <View style={styles.priceBreakdown}>
              {bookingsToCreate
                .filter((b: any) => b.price > 0)
                .map((booking: any, index: number) => (
                  <View key={index} style={styles.priceRow}>
                    <Text style={styles.priceLabel}>{booking.title}</Text>
                    <Text style={styles.priceValue}>
                      ฿{booking.price.toLocaleString('th-TH')}
                    </Text>
                  </View>
                ))}
            </View>

            <View style={styles.priceDivider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>ยอดรวมทั้งหมด</Text>
              <Text style={styles.totalValue}>
                ฿{totalAmount.toLocaleString('th-TH')}
              </Text>
            </View>
          </View>
        )}

        {/* คำเตือน */}
        <View style={styles.infoBanner}>
          <View style={styles.infoIconContainer}>
            <AlertCircle size={20} color="#0066FF" strokeWidth={2.5} />
          </View>
          <Text style={styles.infoText}>
            การจองจะถูกบันทึกในสถานะ "รอชำระเงิน"{'\n'}
            หลังชำระเงินสำเร็จ สถานะจะเปลี่ยนเป็น "ยืนยันแล้ว" อัตโนมัติ
          </Text>
        </View>

        {/* ปุ่มยืนยัน */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
            onPress={handleConfirmBookings}
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
                  <Text style={styles.confirmButtonText}>
                    {totalAmount > 0 ? 'ชำระเงิน' : 'ยืนยันการจอง'}
                  </Text>
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
  summaryCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
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
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  itemsSection: {
    paddingHorizontal: 16,
    gap: 12,
  },
  bookingItem: {
    flexDirection: 'row',
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
  itemIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  itemDescription: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EF4444',
    letterSpacing: -0.4,
  },
  itemFree: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
  priceCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
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
  priceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  priceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  priceBreakdown: {
    gap: 12,
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
    flex: 1,
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    marginHorizontal: 16,
    marginTop: 16,
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
});