import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { getTrip, deleteTrip, Trip } from '../api/trips';
import {
  ChevronLeft,
  Share2,
  Edit3,
  Trash2,
  MapPin,
  Calendar,
  Wallet,
  FileText,
  Sparkles,
  Lightbulb,
  Clock,
  Star,
  Activity,
  ListChecks,
  MessageSquare
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

const STATUS_ICON_COMPONENTS: Record<string, React.ComponentType<any>> = {
  planning: FileText,
  confirmed: ListChecks,
  in_progress: Activity,
  completed: Star,
  cancelled: MessageSquare,
};

export default function TripDetailScreen({ route, navigation }: any) {
  const { tripId } = route.params;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadTripDetail();
    }, [tripId])
  );

  const loadTripDetail = async () => {
    try {
      setLoading(true);
      const response = await getTrip(tripId);
      setTrip(response.data);
    } catch (error) {
      console.error('Load trip detail error:', error);
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
              Alert.alert('สำเร็จ', 'ลบทริปเรียบร้อยแล้ว', [
                { text: 'ตกลง', onPress: () => navigation.goBack() },
              ]);
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
      const message = `
🧭 TrailTeller - แผนการเดินทาง

📍 จุดหมาย: ${trip.destination}${trip.country ? ` (${trip.country})` : ''}
📅 วันที่: ${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}
💰 งบประมาณ: ฿${trip.budget.toLocaleString('th-TH')}
📋 สถานะ: ${STATUS_LABELS[trip.status]}

${trip.notes ? `📝 หมายเหตุ: ${trip.notes}\n` : ''}
${trip.aiSuggestions?.reason ? `\n💡 ${trip.aiSuggestions.reason}` : ''}

---
วางแผนด้วย TrailTeller 🌍
      `.trim();

      const result = await Share.share({
        message: message,
        title: `แผนทริป ${trip.destination}`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถแชร์ทริปได้');
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

  if (!trip) {
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
            <Text style={styles.headerTitle}>ไม่พบทริป</Text>
            <View style={styles.headerRight} />
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const StatusIconComponent = STATUS_ICON_COMPONENTS[trip.status] || FileText;

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
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleShare}
              style={styles.headerIconButton}
            >
              <Share2 size={20} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('EditTrip', { tripId })}
              style={styles.headerIconButton}
            >
              <Edit3 size={20} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.headerIconButton}
            >
              <Trash2 size={20} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Badge */}
        <LinearGradient
          colors={STATUS_COLORS[trip.status] || (['#64748B', '#475569'] as StatusColorTuple)}
          style={styles.statusBadge}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.statusIconContainer}>
            <StatusIconComponent size={18} color="#FFFFFF" strokeWidth={2.5} />
          </View>
          <Text style={styles.statusText}>{STATUS_LABELS[trip.status]}</Text>
        </LinearGradient>

        {/* Destination */}
        <View style={styles.destinationSection}>
          <Text style={styles.destination}>{trip.destination}</Text>
          {trip.country && (
            <View style={styles.countryRow}>
              <MapPin size={18} color="#64748B" strokeWidth={2} />
              <Text style={styles.country}>{trip.country}</Text>
            </View>
          )}
        </View>

        {/* Date & Budget */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Calendar size={24} color="#0066FF" strokeWidth={2.5} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>วันที่เดินทาง</Text>
              <Text style={styles.infoValue}>
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Wallet size={24} color="#10B981" strokeWidth={2.5} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>งบประมาณ</Text>
              <Text style={styles.infoValue}>
                ฿{trip.budget.toLocaleString('th-TH')}
              </Text>
            </View>
          </View>
        </View>

        {/* Share Card */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.shareCard} onPress={handleShare}>
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED'] as StatusColorTuple}
              style={styles.shareCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.shareCardIconContainer}>
                <Share2 size={32} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <Text style={styles.shareCardTitle}>แชร์แผนทริปนี้</Text>
              <Text style={styles.shareCardSubtitle}>
                แชร์ให้เพื่อนหรือครอบครัวดู
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Notes */}
        {trip.notes && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FileText size={20} color="#0066FF" strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>บันทึก</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.notesText}>{trip.notes}</Text>
            </View>
          </View>
        )}

        {/* AI Suggestions */}
        {trip.aiSuggestions && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Sparkles size={20} color="#8B5CF6" strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>คำแนะนำจาก AI</Text>
            </View>
            
            {trip.aiSuggestions.reason && (
              <View style={styles.aiCard}>
                <View style={styles.aiCardHeader}>
                  <Lightbulb size={18} color="#F59E0B" strokeWidth={2.5} />
                  <Text style={styles.aiCardTitle}>เหตุผลที่แนะนำ</Text>
                </View>
                <Text style={styles.aiCardText}>{trip.aiSuggestions.reason}</Text>
              </View>
            )}
            {trip.aiSuggestions.bestTime && (
              <View style={styles.aiCard}>
                <View style={styles.aiCardHeader}>
                  <Calendar size={18} color="#0066FF" strokeWidth={2.5} />
                  <Text style={styles.aiCardTitle}>ช่วงเวลาที่เหมาะสม</Text>
                </View>
                <Text style={styles.aiCardText}>{trip.aiSuggestions.bestTime}</Text>
              </View>
            )}
            {trip.aiSuggestions.duration && (
              <View style={styles.aiCard}>
                <View style={styles.aiCardHeader}>
                  <Clock size={18} color="#10B981" strokeWidth={2.5} />
                  <Text style={styles.aiCardTitle}>ระยะเวลาแนะนำ</Text>
                </View>
                <Text style={styles.aiCardText}>{trip.aiSuggestions.duration} วัน</Text>
              </View>
            )}
            {trip.aiSuggestions.estimatedBudget && (
              <View style={styles.aiCard}>
                <View style={styles.aiCardHeader}>
                  <Wallet size={18} color="#10B981" strokeWidth={2.5} />
                  <Text style={styles.aiCardTitle}>งบประมาณประมาณการ</Text>
                </View>
                <Text style={styles.aiCardText}>
                  ฿{trip.aiSuggestions.estimatedBudget.toLocaleString('th-TH')}
                </Text>
              </View>
            )}
            {trip.aiSuggestions.highlights && Array.isArray(trip.aiSuggestions.highlights) && (
              <View style={styles.aiCard}>
                <View style={styles.aiCardHeader}>
                  <Star size={18} color="#F59E0B" fill="#F59E0B" strokeWidth={0} />
                  <Text style={styles.aiCardTitle}>ไฮไลท์</Text>
                </View>
                {trip.aiSuggestions.highlights.map((highlight: string, index: number) => (
                  <View key={index} style={styles.highlightItem}>
                    <View style={styles.highlightDot} />
                    <Text style={styles.highlightText}>{highlight}</Text>
                  </View>
                ))}
              </View>
            )}
            {trip.aiSuggestions.activities && Array.isArray(trip.aiSuggestions.activities) && (
              <View style={styles.aiCard}>
                <View style={styles.aiCardHeader}>
                  <Activity size={18} color="#EF4444" strokeWidth={2.5} />
                  <Text style={styles.aiCardTitle}>กิจกรรมแนะนำ</Text>
                </View>
                {trip.aiSuggestions.activities.map((activity: string, index: number) => (
                  <View key={index} style={styles.highlightItem}>
                    <View style={styles.highlightDot} />
                    <Text style={styles.highlightText}>{activity}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Itinerary */}
        {trip.itinerary && Array.isArray(trip.itinerary) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ListChecks size={20} color="#0066FF" strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>แผนการเดินทาง</Text>
            </View>
            {trip.itinerary.map((day: any, index: number) => (
              <View key={index} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <View style={styles.dayNumber}>
                    <Text style={styles.dayNumberText}>{day.day}</Text>
                  </View>
                  <Text style={styles.dayTitle}>วันที่ {day.day}</Text>
                </View>
                {day.activities && (
                  <View style={styles.dayDetailRow}>
                    <Activity size={16} color="#64748B" strokeWidth={2} />
                    <Text style={styles.dayContent}>
                      กิจกรรม: {day.activities.join(', ')}
                    </Text>
                  </View>
                )}
                {day.places && (
                  <View style={styles.dayDetailRow}>
                    <MapPin size={16} color="#64748B" strokeWidth={2} />
                    <Text style={styles.dayContent}>
                      สถานที่: {day.places.join(', ')}
                    </Text>
                  </View>
                )}
                {day.notes && (
                  <View style={styles.dayNotesContainer}>
                    <Text style={styles.dayNotes}>{day.notes}</Text>
                  </View>
                )}
              </View>
            ))}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerRight: {
    width: 120,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
  content: {
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
  },
  statusIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  destinationSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  destination: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: -0.7,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  country: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
  infoCard: {
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
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  section: {
    padding: 16,
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
  shareCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  shareCardGradient: {
    padding: 24,
    alignItems: 'center',
  },
  shareCardIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  shareCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  shareCardSubtitle: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notesText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
    fontWeight: '500',
  },
  aiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 3,
    borderLeftColor: '#8B5CF6',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  aiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  aiCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  aiCardText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    fontWeight: '500',
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  highlightDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#8B5CF6',
    marginRight: 10,
    marginTop: 8,
  },
  highlightText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    fontWeight: '500',
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  dayNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0066FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dayTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  dayDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  dayContent: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    fontWeight: '500',
  },
  dayNotesContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  dayNotes: {
    fontSize: 13,
    color: '#64748B',
    fontStyle: 'italic',
    lineHeight: 20,
    fontWeight: '500',
  },
});