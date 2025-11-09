import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { getAllTrips, deleteTrip, Trip } from '../api/trips';
import {
  ChevronLeft,
  Plus,
  Search,
  X,
  Calendar,
  MapPin,
  Trash2,
  Eye,
  Filter,
  FileText,
  CheckCircle,
  Plane,
  PartyPopper,
  XCircle
} from 'lucide-react-native';

type StatusColorTuple = [string, string];

const STATUS_COLORS: Record<string, StatusColorTuple> = {
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

// Status icon components mapping
const STATUS_ICON_COMPONENTS: Record<string, React.ComponentType<any>> = {
  planning: FileText,
  confirmed: CheckCircle,
  in_progress: Plane,
  completed: PartyPopper,
  cancelled: XCircle,
};

// Filter options with icon components
const FILTER_OPTIONS = [
  { label: 'ทั้งหมด', value: 'all', IconComponent: null },
  { label: 'วางแผน', value: 'planning', IconComponent: FileText },
  { label: 'ยืนยัน', value: 'confirmed', IconComponent: CheckCircle },
  { label: 'กำลังไป', value: 'in_progress', IconComponent: Plane },
  { label: 'เสร็จสิ้น', value: 'completed', IconComponent: PartyPopper },
];

export default function MyTripsScreen({ navigation }: any) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useFocusEffect(
    useCallback(() => {
      loadTrips();
    }, [])
  );

  React.useEffect(() => {
    filterTrips();
  }, [trips, searchQuery, selectedFilter]);

  const loadTrips = async () => {
    try {
      const response = await getAllTrips();
      setTrips(response.data);
    } catch (error) {
      console.error('Load trips error:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลทริปได้');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ ฟังก์ชันกรองทริป (แก้ไขแล้ว)
  const filterTrips = () => {
    let result = [...trips];

    // ✅ กรองตาม status
    if (selectedFilter !== 'all') {
      result = result.filter((trip) => trip.status === selectedFilter);
    }

    // ✅ กรองตามคำค้นหา
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (trip) =>
          trip.destination.toLowerCase().includes(query) ||
          trip.country?.toLowerCase().includes(query)
      );
    }

    setFilteredTrips(result);
  };

  // ✅ นับจำนวนทริปแต่ละ status
  const getStatusCount = (statusValue: string) => {
    if (statusValue === 'all') return trips.length;
    return trips.filter(trip => trip.status === statusValue).length;
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTrips();
  };

  const handleDeleteTrip = (trip: Trip) => {
    Alert.alert('ลบทริป', `คุณต้องการลบทริป "${trip.destination}" หรือไม่?`, [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ลบ',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTrip(trip.id);
            setTrips(trips.filter((t) => t.id !== trip.id));
            Alert.alert('สำเร็จ', 'ลบทริปเรียบร้อยแล้ว');
          } catch (error) {
            Alert.alert('ข้อผิดพลาด', 'ไม่สามารถลบทริปได้');
          }
        },
      },
    ]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderTripCard = ({ item }: { item: Trip }) => {
    const StatusIconComponent = STATUS_ICON_COMPONENTS[item.status] || FileText;
    
    return (
    <TouchableOpacity
      style={styles.tripCard}
      onPress={() => navigation.navigate('TripDetail', { tripId: item.id })}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={STATUS_COLORS[item.status] || (['#64748B', '#475569'] as StatusColorTuple)}
        style={styles.statusBadge}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.statusIconContainer}>
          <StatusIconComponent size={16} color="#FFFFFF" strokeWidth={2.5} />
        </View>
        <Text style={styles.statusText}>{STATUS_LABELS[item.status]}</Text>
      </LinearGradient>

      <View style={styles.tripContent}>
        <View style={styles.tripHeader}>
          <View style={styles.tripHeaderLeft}>
            <Text style={styles.tripDestination}>{item.destination}</Text>
            {item.country && (
              <View style={styles.countryRow}>
                <MapPin size={14} color="#64748B" strokeWidth={2} />
                <Text style={styles.tripCountry}>{item.country}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.tripDetails}>
          <View style={styles.tripDetailCard}>
            <View style={styles.tripDetailIconContainer}>
              <Calendar size={18} color="#0066FF" strokeWidth={2.5} />
            </View>
            <View style={styles.tripDetailContent}>
              <Text style={styles.tripDetailLabel}>วันเดินทาง</Text>
              <Text style={styles.tripDetailText}>
                {formatDate(item.startDate)} - {formatDate(item.endDate)}
              </Text>
            </View>
          </View>

          <View style={styles.tripDetailCard}>
            <View style={styles.tripDetailIconContainer}>
              <Text style={styles.tripDetailCurrency}>฿</Text>
            </View>
            <View style={styles.tripDetailContent}>
              <Text style={styles.tripDetailLabel}>งบประมาณ</Text>
              <Text style={styles.tripDetailText}>
                {item.budget.toLocaleString('th-TH')} บาท
              </Text>
            </View>
          </View>
        </View>

        {item.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.tripNotes} numberOfLines={2}>
              {item.notes}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.tripActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={(e) => {
            e.stopPropagation();
            navigation.navigate('TripDetail', { tripId: item.id });
          }}
        >
          <Eye size={18} color="#0066FF" strokeWidth={2.5} />
          <Text style={styles.actionButtonText}>ดูรายละเอียด</Text>
        </TouchableOpacity>

        <View style={styles.actionDivider} />

        <TouchableOpacity
          style={styles.actionButton}
          onPress={(e) => {
            e.stopPropagation();
            handleDeleteTrip(item);
          }}
        >
          <Trash2 size={18} color="#EF4444" strokeWidth={2.5} />
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
            ลบ
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (searchQuery || selectedFilter !== 'all') {
      return (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Search size={48} color="#94A3B8" strokeWidth={2} />
          </View>
          <Text style={styles.emptyTitle}>ไม่พบทริป</Text>
          <Text style={styles.emptySubtitle}>
            ลองเปลี่ยนคำค้นหาหรือตัวกรองดูนะคะ
          </Text>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setSearchQuery('');
              setSelectedFilter('all');
            }}
          >
            <Text style={styles.clearButtonText}>ล้างการค้นหา</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <MapPin size={56} color="#94A3B8" strokeWidth={2} />
        </View>
        <Text style={styles.emptyTitle}>ยังไม่มีทริป</Text>
        <Text style={styles.emptySubtitle}>เริ่มวางแผนทริปแรกของคุณเลย!</Text>
        <TouchableOpacity
          style={styles.createTripButton}
          onPress={() => navigation.navigate('NewTrip')}
        >
          <LinearGradient
            colors={['#0066FF', '#0047B3'] as StatusColorTuple}
            style={styles.createTripGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.createTripButtonText}>สร้างทริปใหม่</Text>
          </LinearGradient>
        </TouchableOpacity>
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
            <Text style={styles.headerTitle}>ทริปของฉัน</Text>
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
          <Text style={styles.headerTitle}>ทริปของฉัน</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('NewTrip')}
          >
            <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Search size={20} color="#64748B" strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              placeholder="ค้นหาจุดหมาย..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#94A3B8"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={20} color="#64748B" strokeWidth={2.5} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* ✅ Filter Chips with Count */}
      <View style={styles.filterContainer}>
        <View style={styles.filterHeader}>
          <Filter size={16} color="#64748B" strokeWidth={2} />
          <Text style={styles.filterHeaderText}>กรองตาม:</Text>
        </View>
        <View style={styles.filterChipsContainer}>
          {FILTER_OPTIONS.map((option) => {
            const IconComp = option.IconComponent;
            const count = getStatusCount(option.value); // ✅ นับจำนวน
            
            return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.filterChip,
                selectedFilter === option.value && styles.filterChipSelected,
              ]}
              onPress={() => setSelectedFilter(option.value)}
            >
              {IconComp && (
                <IconComp 
                  size={14} 
                  color={selectedFilter === option.value ? '#FFFFFF' : '#64748B'} 
                  strokeWidth={2.5} 
                />
              )}
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === option.value && styles.filterChipTextSelected,
                ]}
              >
                {option.label}
              </Text>
              {/* ✅ Badge แสดงจำนวน */}
              <View style={[
                styles.filterChipBadge,
                selectedFilter === option.value && styles.filterChipBadgeSelected,
              ]}>
                <Text style={[
                  styles.filterChipBadgeText,
                  selectedFilter === option.value && styles.filterChipBadgeTextSelected,
                ]}>
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Result Info */}
      <View style={styles.resultInfo}>
        <Text style={styles.resultText}>
          พบ {filteredTrips.length} ทริป
          {searchQuery && ` จาก "${searchQuery}"`}
        </Text>
      </View>

      <FlatList
        data={filteredTrips}
        renderItem={renderTripCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          filteredTrips.length === 0 ? styles.emptyListContainer : styles.listContainer
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
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  searchContainer: {
    paddingHorizontal: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterHeaderText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  filterChipSelected: {
    backgroundColor: '#0066FF',
    borderColor: '#0066FF',
  },
  filterChipText: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
  },
  // ✅ Styles สำหรับ Badge นับจำนวน
  filterChipBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 6,
  },
  filterChipBadgeSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterChipBadgeText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '700',
  },
  filterChipBadgeTextSelected: {
    color: '#FFFFFF',
  },
  resultInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  resultText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    letterSpacing: 0.1,
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
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  tripCard: {
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  statusIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  tripContent: {
    padding: 16,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tripHeaderLeft: {
    flex: 1,
  },
  tripDestination: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tripCountry: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  tripDetails: {
    gap: 12,
    marginBottom: 16,
  },
  tripDetailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  tripDetailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tripDetailCurrency: {
    fontSize: 18,
    color: '#0066FF',
    fontWeight: '700',
  },
  tripDetailContent: {
    flex: 1,
  },
  tripDetailLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 2,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  tripDetailText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  notesContainer: {
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    borderRadius: 8,
    padding: 12,
  },
  tripNotes: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  tripActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#0066FF',
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  actionDivider: {
    width: 1,
    backgroundColor: '#F1F5F9',
  },
  deleteButtonText: {
    color: '#EF4444',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
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
    letterSpacing: -0.4,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  createTripButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createTripGradient: {
    flexDirection: 'row',
    paddingHorizontal: 32,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
  },
  createTripButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  clearButton: {
    backgroundColor: '#0066FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
});