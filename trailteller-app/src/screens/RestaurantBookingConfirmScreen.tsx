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
  UtensilsCrossed,
  Calendar,
  Users,
  MapPin,
  Clock,
  FileText,
  CreditCard,
  AlertCircle,
  Star,
  Phone,
} from 'lucide-react-native';
import { createBooking } from '../api/bookings';

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

export default function RestaurantBookingConfirmScreen({ route, navigation }: any) {
  const { restaurant, tripId, reservationDate, partySize } = route.params;

  const [reservationTime, setReservationTime] = useState('18:00');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const handleConfirmBooking = async () => {
    if (!tripId) {
      Alert.alert('ข้อผิดพลาด', 'ไม่พบข้อมูลทริป');
      return;
    }

    if (!reservationTime) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาระบุเวลาที่ต้องการจอง');
      return;
    }

    Alert.alert(
      'ยืนยันการจอง',
      `คุณต้องการจองโต๊ะที่ ${restaurant.name} หรือไม่?\n\nวันที่: ${formatDate(reservationDate)}\nเวลา: ${reservationTime}\nจำนวนคน: ${partySize}`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ยืนยัน',
          onPress: async () => {
            setLoading(true);
            try {
              await createBooking({
                tripId,
                type: 'restaurant',
                title: restaurant.name,
                description: `จองโต๊ะ ${partySize} คน - ${restaurant.cuisine}`,
                price: 0, // ร้านอาหารไม่มีราคาล่วงหน้า
                startDate: reservationDate,
                status: 'confirmed',
                details: {
                  restaurantName: restaurant.name,
                  reservationDate: reservationDate,
                  reservationTime: reservationTime,
                  partySize: parseInt(partySize),
                  cuisine: restaurant.cuisine,
                  location: restaurant.location,
                  phoneNumber: restaurant.phoneNumber,
                  rating: restaurant.rating,
                  priceRange: restaurant.priceRange,
                  imageUrl: restaurant.imageUrl,
                },
                notes: notes,
              });

              Alert.alert('สำเร็จ! 🎉', 'จองโต๊ะเรียบร้อยแล้ว', [
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
        {/* Restaurant Card */}
        <View style={styles.restaurantCard}>
          <Image
            source={{ uri: restaurant.imageUrl }}
            style={styles.restaurantImage}
            resizeMode="cover"
          />
          <View style={styles.restaurantOverlay}>
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)'] as const}
              style={styles.restaurantGradient}
            >
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <View style={styles.restaurantMeta}>
                  <UtensilsCrossed size={14} color="#FFFFFF" strokeWidth={2} />
                  <Text style={styles.cuisineText}>{restaurant.cuisine}</Text>
                  <View style={styles.priceRangeBadge}>
                    <Text style={styles.priceRangeText}>{restaurant.priceRange}</Text>
                  </View>
                </View>
              </View>
              {restaurant.rating > 0 && (
                <View style={styles.ratingBadge}>
                  <Star size={14} color="#F59E0B" fill="#F59E0B" strokeWidth={0} />
                  <Text style={styles.ratingText}>{restaurant.rating.toFixed(1)}</Text>
                </View>
              )}
            </LinearGradient>
          </View>
        </View>

        {/* Reservation Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color="#10B981" strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>รายละเอียดการจอง</Text>
          </View>

          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Calendar size={20} color="#10B981" strokeWidth={2.5} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>วันที่จอง</Text>
                <Text style={styles.detailValue}>{formatDate(reservationDate)}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Clock size={20} color="#0066FF" strokeWidth={2.5} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>เวลา</Text>
                <View style={styles.timeInputContainer}>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="18:00"
                    placeholderTextColor="#94A3B8"
                    value={reservationTime}
                    onChangeText={setReservationTime}
                    editable={!loading}
                  />
                  <Text style={styles.timeHint}>น.</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Users size={20} color="#8B5CF6" strokeWidth={2.5} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>จำนวนคน</Text>
                <Text style={styles.detailValue}>{partySize} คน</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Restaurant Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color="#10B981" strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>ข้อมูลร้านอาหาร</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MapPin size={18} color="#64748B" strokeWidth={2} />
              <Text style={styles.infoText}>{restaurant.location}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Phone size={18} color="#10B981" strokeWidth={2} />
              <Text style={styles.infoText}>{restaurant.phoneNumber}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Clock size={18} color="#0066FF" strokeWidth={2} />
              <Text style={styles.infoText}>{restaurant.openingHours}</Text>
            </View>

            {restaurant.description && (
              <>
                <View style={styles.divider} />
                <Text style={styles.description}>{restaurant.description}</Text>
              </>
            )}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={20} color="#10B981" strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>หมายเหตุ (ไม่บังคับ)</Text>
          </View>

          <View style={styles.notesCard}>
            <TextInput
              style={styles.notesInput}
              placeholder="เช่น ต้องการโต๊ะริมหน้าต่าง, แพ้อาหาร, วันเกิด..."
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
            <AlertCircle size={20} color="#10B981" strokeWidth={2.5} />
          </View>
          <View style={styles.infoBannerContent}>
            <Text style={styles.infoBannerTitle}>💡 คำแนะนำ</Text>
            <Text style={styles.infoText}>
              การจองนี้จะถูกบันทึกในแผนการเดินทาง แนะนำให้โทรยืนยันกับร้านโดยตรงอีกครั้งก่อนวันเดินทาง
            </Text>
          </View>
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
  restaurantCard: {
    position: 'relative',
    height: 250,
    marginBottom: 16,
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
  },
  restaurantOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  restaurantGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cuisineText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.95,
    fontWeight: '600',
  },
  priceRangeBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priceRangeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
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
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  timeInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  timeHint: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  infoCard: {
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    fontWeight: '500',
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
    backgroundColor: '#ECFDF5',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  infoIconContainer: {
    marginTop: 2,
  },
  infoBannerContent: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 4,
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