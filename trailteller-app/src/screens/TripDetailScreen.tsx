import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { getTrip, deleteTrip, Trip } from '../api/trips';
import {
  ChevronLeft,
  MapPin,
  Calendar,
  Wallet,
  Edit3,
  Trash2,
  Share2,
  Hotel,
  UtensilsCrossed,
  Ticket,
  Clock,
  Star,
  ChevronRight,
  TrendingUp,
  CheckCircle,
  FileText,
  Sun,
  Coffee,
  Moon,
  Plane,
} from 'lucide-react-native';

const STATUS_COLORS: Record<string, readonly [string, string]> = {
  planning: ['#0066FF', '#0047B3'],
  confirmed: ['#10B981', '#059669'],
  in_progress: ['#F59E0B', '#D97706'],
  completed: ['#8B5CF6', '#7C3AED'],
  cancelled: ['#EF4444', '#DC2626'],
};

const STATUS_LABELS: Record<string, string> = {
  planning: 'กำลังวางแผน',
  confirmed: 'ยืนยันแล้ว',
  in_progress: 'กำลังเดินทาง',
  completed: 'เสร็จสิ้น',
  cancelled: 'ยกเลิก',
};

export default function TripDetailScreen({ route, navigation }: any) {
  const { tripId } = route.params;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'hotels' | 'flights' | 'restaurants' | 'activities'>('overview');

  useFocusEffect(
    useCallback(() => {
      loadTrip();
    }, [tripId])
  );

  const loadTrip = async () => {
    try {
      setLoading(true);
      const response = await getTrip(tripId);
      setTrip(response.data);
    } catch (error) {
      console.error('Load trip error:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลทริปได้');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'ลบทริป',
      `คุณต้องการลบทริป "${trip?.destination}" หรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ลบ',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTrip(tripId);
              Alert.alert('สำเร็จ', 'ลบทริปเรียบร้อยแล้ว');
              navigation.goBack();
            } catch (error) {
              Alert.alert('ข้อผิดพลาด', 'ไม่สามารถลบทริปได้');
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    if (!trip) return;
    try {
      await Share.share({
        message: `🌍 ${trip.destination}\n📅 ${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}\n💰 งบประมาณ: ฿${trip.budget.toLocaleString('th-TH')}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderTabButton = (
    tab: 'overview' | 'hotels' | 'flights' | 'restaurants' | 'activities',
    icon: any,
    label: string,
    count?: number
  ) => {
    const Icon = icon;
    const isActive = activeTab === tab;
    
    return (
      <TouchableOpacity
        style={[styles.tabButton, isActive && styles.tabButtonActive]}
        onPress={() => setActiveTab(tab)}
      >
        <Icon 
          size={20} 
          color={isActive ? '#FFFFFF' : '#64748B'} 
          strokeWidth={2.5} 
        />
        <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
          {label}
        </Text>
        {count !== undefined && count > 0 && (
          <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>{count}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderOverview = () => {
    if (!trip) return null;

    return (
      <View style={styles.tabContent}>
        {/* Trip Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Calendar size={20} color="#0066FF" strokeWidth={2.5} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>วันเดินทาง</Text>
              <Text style={styles.infoValue}>
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Wallet size={20} color="#10B981" strokeWidth={2.5} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>งบประมาณ</Text>
              <Text style={styles.infoValue}>
                ฿{trip.budget.toLocaleString('th-TH')}
              </Text>
            </View>
          </View>

          {trip.notes && (
            <>
              <View style={styles.divider} />
              <View style={styles.notesSection}>
                <FileText size={18} color="#F59E0B" strokeWidth={2.5} />
                <Text style={styles.notesText}>{trip.notes}</Text>
              </View>
            </>
          )}
        </View>

        {/* Highlights */}
        {trip.aiSuggestions?.highlights && (
          <View style={styles.highlightsCard}>
            <View style={styles.cardHeader}>
              <Star size={20} color="#F59E0B" fill="#F59E0B" strokeWidth={0} />
              <Text style={styles.cardTitle}>ไฮไลท์ของทริป</Text>
            </View>
            {trip.aiSuggestions.highlights.map((highlight: string, index: number) => (
              <View key={index} style={styles.highlightItem}>
                <View style={styles.highlightDot} />
                <Text style={styles.highlightText}>{highlight}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Day by Day Plan */}
        {trip.aiSuggestions?.dayByDayPlan && (
          <View style={styles.planCard}>
            <View style={styles.cardHeader}>
              <Clock size={20} color="#0066FF" strokeWidth={2.5} />
              <Text style={styles.cardTitle}>แผนการเดินทางรายวัน</Text>
            </View>
            {trip.aiSuggestions.dayByDayPlan.map((day: any, index: number) => (
              <View key={index} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayNumber}>DAY {day.day}</Text>
                </View>
                <View style={styles.dayContent}>
                  <View style={styles.timeSlot}>
                    <Sun size={16} color="#F59E0B" strokeWidth={2.5} />
                    <Text style={styles.timeLabel}>เช้า</Text>
                    <Text style={styles.timeActivity}>{day.morning}</Text>
                  </View>
                  <View style={styles.timeSlot}>
                    <Coffee size={16} color="#0066FF" strokeWidth={2.5} />
                    <Text style={styles.timeLabel}>บ่าย</Text>
                    <Text style={styles.timeActivity}>{day.afternoon}</Text>
                  </View>
                  <View style={styles.timeSlot}>
                    <Moon size={16} color="#8B5CF6" strokeWidth={2.5} />
                    <Text style={styles.timeLabel}>เย็น</Text>
                    <Text style={styles.timeActivity}>{day.evening}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderHotels = () => {
    if (!trip?.aiSuggestions?.recommendedHotels) {
      return (
        <View style={styles.emptyState}>
          <Hotel size={48} color="#94A3B8" strokeWidth={2} />
          <Text style={styles.emptyTitle}>ไม่มีข้อมูลโรงแรม</Text>
          <Text style={styles.emptySubtitle}>ลองค้นหาโรงแรมเพิ่มเติม</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('HotelSearch', { tripId })}
          >
            <Text style={styles.emptyButtonText}>ค้นหาโรงแรม</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        {trip.aiSuggestions.recommendedHotels.map((hotel: any, index: number) => (
          <View key={index} style={styles.hotelCard}>
            <View style={styles.hotelHeader}>
              <View style={styles.hotelIconContainer}>
                <Hotel size={24} color="#0066FF" strokeWidth={2.5} />
              </View>
              <View style={styles.hotelInfo}>
                <Text style={styles.hotelName}>{hotel.name}</Text>
                <View style={styles.hotelTypeRow}>
                  <View style={[
                    styles.hotelTypeBadge,
                    hotel.type === 'luxury' && styles.hotelTypeLuxury,
                    hotel.type === 'mid-range' && styles.hotelTypeMidRange,
                    hotel.type === 'budget' && styles.hotelTypeBudget,
                  ]}>
                    <Text style={styles.hotelTypeText}>
                      {hotel.type === 'luxury' ? '⭐ Luxury' : 
                       hotel.type === 'mid-range' ? '✨ Mid-Range' : 
                       '💰 Budget'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.hotelDetails}>
              <View style={styles.hotelDetailRow}>
                <MapPin size={14} color="#64748B" strokeWidth={2} />
                <Text style={styles.hotelDetailText}>{hotel.location}</Text>
              </View>
              <View style={styles.hotelDetailRow}>
                <Wallet size={14} color="#64748B" strokeWidth={2} />
                <Text style={styles.hotelDetailText}>
                  ฿{hotel.estimatedPrice?.toLocaleString('th-TH')}/คืน
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => navigation.navigate('HotelSearch', { tripId })}
            >
              <Text style={styles.bookButtonText}>ค้นหา & จอง</Text>
              <ChevronRight size={18} color="#FFFFFF" strokeWidth={3} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  // ✅ NEW: Render Flights Tab
  const renderFlights = () => {
    return (
      <View style={styles.emptyState}>
        <Plane size={48} color="#94A3B8" strokeWidth={2} />
        <Text style={styles.emptyTitle}>ไม่มีข้อมูลเที่ยวบิน</Text>
        <Text style={styles.emptySubtitle}>ลองค้นหาเที่ยวบินเพิ่มเติม</Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.navigate('FlightSearch', { tripId })}
        >
          <Text style={styles.emptyButtonText}>ค้นหาเที่ยวบิน</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ✅ NEW: Render Restaurants Tab
  const renderRestaurants = () => {
    if (!trip?.aiSuggestions?.recommendedRestaurants) {
      return (
        <View style={styles.emptyState}>
          <UtensilsCrossed size={48} color="#94A3B8" strokeWidth={2} />
          <Text style={styles.emptyTitle}>ไม่มีข้อมูลร้านอาหาร</Text>
          <Text style={styles.emptySubtitle}>ลองค้นหาร้านอาหารเพิ่มเติม</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('RestaurantSearch', { tripId })}
          >
            <Text style={styles.emptyButtonText}>ค้นหาร้านอาหาร</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        {trip.aiSuggestions.recommendedRestaurants.map((restaurant: any, index: number) => (
          <View key={index} style={styles.restaurantCard}>
            <View style={styles.restaurantHeader}>
              <View style={styles.restaurantIconContainer}>
                <UtensilsCrossed size={24} color="#F59E0B" strokeWidth={2.5} />
              </View>
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <Text style={styles.restaurantCuisine}>{restaurant.cuisine}</Text>
              </View>
              <Text style={styles.priceRange}>{restaurant.priceRange}</Text>
            </View>
            <View style={styles.specialtySection}>
              <Star size={14} color="#F59E0B" fill="#F59E0B" strokeWidth={0} />
              <Text style={styles.specialtyText}>เมนูเด็ด: {restaurant.specialty}</Text>
            </View>
            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => navigation.navigate('RestaurantSearch', { tripId })}
            >
              <Text style={styles.bookButtonText}>ค้นหา & จอง</Text>
              <ChevronRight size={18} color="#FFFFFF" strokeWidth={3} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  const renderActivities = () => {
    if (!trip?.aiSuggestions?.recommendedActivities) {
      return (
        <View style={styles.emptyState}>
          <Ticket size={48} color="#94A3B8" strokeWidth={2} />
          <Text style={styles.emptyTitle}>ไม่มีข้อมูลกิจกรรม</Text>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        {trip.aiSuggestions.recommendedActivities.map((activity: any, index: number) => (
          <View key={index} style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <View style={styles.activityIconContainer}>
                <Ticket size={24} color="#8B5CF6" strokeWidth={2.5} />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityName}>{activity.name}</Text>
                <View style={styles.activityTypeBadge}>
                  <Text style={styles.activityTypeText}>{activity.type}</Text>
                </View>
              </View>
            </View>
            <View style={styles.activityDetails}>
              <View style={styles.activityDetailItem}>
                <Clock size={14} color="#64748B" strokeWidth={2} />
                <Text style={styles.activityDetailText}>{activity.duration}</Text>
              </View>
              <View style={styles.activityDetailItem}>
                <Wallet size={14} color="#64748B" strokeWidth={2} />
                <Text style={styles.activityDetailText}>{activity.cost}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
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
            <Text style={styles.headerTitle}>รายละเอียดทริป</Text>
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

  if (!trip) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={STATUS_COLORS[trip.status] || (['#64748B', '#475569'] as const)}
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
            <Text style={styles.headerTitle}>{trip.destination}</Text>
            <Text style={styles.headerSubtitle}>{STATUS_LABELS[trip.status]}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerIconButton} onPress={handleShare}>
              <Share2 size={20} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('EditTrip', { tripId })}
          >
            <Edit3 size={18} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.quickActionText}>แก้ไข</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Expenses', {
              tripId,
              tripBudget: trip.budget,
              tripDestination: trip.destination,
            })}
          >
            <Wallet size={18} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.quickActionText}>ค่าใช้จ่าย</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickActionButton, styles.dangerButton]}
            onPress={handleDelete}
          >
            <Trash2 size={18} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.quickActionText}>ลบ</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderTabButton('overview', TrendingUp, 'ภาพรวม')}
          {renderTabButton('hotels', Hotel, 'โรงแรม', trip.aiSuggestions?.recommendedHotels?.length)}
          {renderTabButton('flights', Plane, 'เที่ยวบิน')}
          {renderTabButton('restaurants', UtensilsCrossed, 'ร้านอาหาร', trip.aiSuggestions?.recommendedRestaurants?.length)}
          {renderTabButton('activities', Ticket, 'กิจกรรม', trip.aiSuggestions?.recommendedActivities?.length)}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'hotels' && renderHotels()}
        {activeTab === 'flights' && renderFlights()}
        {activeTab === 'restaurants' && renderRestaurants()}
        {activeTab === 'activities' && renderActivities()}
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerRight: {
    width: 40,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 10,
    gap: 6,
  },
  dangerButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 12,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 20,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: '#0066FF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  notesSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  notesText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    fontWeight: '500',
  },
  highlightsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  highlightDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0066FF',
    marginRight: 12,
    marginTop: 7,
  },
  highlightText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    fontWeight: '500',
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dayCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  dayHeader: {
    backgroundColor: '#0066FF',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  dayContent: {
    padding: 16,
    gap: 12,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  timeLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    width: 40,
  },
  timeActivity: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
    lineHeight: 20,
  },
  hotelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hotelHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  hotelIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  hotelInfo: {
    flex: 1,
  },
  hotelName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  hotelTypeRow: {
    flexDirection: 'row',
  },
  hotelTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hotelTypeLuxury: {
    backgroundColor: '#FEF3C7',
  },
  hotelTypeMidRange: {
    backgroundColor: '#DBEAFE',
  },
  hotelTypeBudget: {
    backgroundColor: '#D1FAE5',
  },
  hotelTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  hotelDetails: {
    gap: 8,
    marginBottom: 12,
  },
  hotelDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hotelDetailText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066FF',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  restaurantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  restaurantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  restaurantIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  restaurantCuisine: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  priceRange: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F59E0B',
  },
  specialtySection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
    marginBottom: 12,
  },
  specialtyText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    fontWeight: '600',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  activityTypeBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  activityTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C3AED',
  },
  activityDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  activityDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activityDetailText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  emptyButton: {
    backgroundColor: '#0066FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});