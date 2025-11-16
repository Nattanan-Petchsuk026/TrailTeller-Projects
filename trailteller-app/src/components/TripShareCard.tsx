import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { MapPin, Calendar, Wallet, Share2, X, Compass } from 'lucide-react-native';
import { Trip } from '../api/trips';

interface TripShareCardProps {
  trip: Trip;
  visible: boolean;
  onClose: () => void;
}

export default function TripShareCard({ trip, visible, onClose }: TripShareCardProps) {
  const viewRef = useRef<View>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleShare = async () => {
    try {
      if (!viewRef.current) {
        Alert.alert('ข้อผิดพลาด', 'ไม่สามารถสร้างภาพได้');
        return;
      }

      const capturedUri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
      });

      const normalizedUri = capturedUri.startsWith('file://')
        ? capturedUri
        : `file://${capturedUri}`;

      const filename = `trip-${trip.id}-${Date.now()}.png`;
      const cacheDir =
        (FileSystem as any).cacheDirectory || (FileSystem as any).documentDirectory;
      if (!cacheDir) {
        throw new Error('ไม่พบไดเรกทอรีสำหรับจัดเก็บไฟล์ชั่วคราว');
      }
      const fileUri = `${cacheDir}${filename}`;

      await FileSystem.copyAsync({ from: normalizedUri, to: fileUri });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'image/png',
          dialogTitle: `แชร์ทริป ${trip.destination}`,
        });
      } else {
        Alert.alert('ไม่สามารถแชร์ได้', 'อุปกรณ์นี้ไม่รองรับการแชร์');
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถแชร์ทริปได้');
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Card ที่จะถูกจับภาพ */}
      <View style={styles.cardWrapper} ref={viewRef} collapsable={false}>
        <LinearGradient
          colors={['#0066FF', '#0047B3', '#003380'] as const}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIconContainer}>
                <Compass size={28} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <View>
                <Text style={styles.logoText}>TrailTeller</Text>
                <Text style={styles.tagline}>We Plan, You Go.</Text>
              </View>
            </View>
          </View>

          {/* Trip Info */}
          <View style={styles.tripInfo}>
            <View style={styles.destinationContainer}>
              <View style={styles.iconCircle}>
                <MapPin size={24} color="#0066FF" strokeWidth={2.5} />
              </View>
              <View style={styles.destinationTextContainer}>
                <Text style={styles.destination}>{trip.destination}</Text>
                {trip.country && (
                  <Text style={styles.country}>{trip.country}</Text>
                )}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <Calendar size={18} color="#0066FF" strokeWidth={2.5} />
                </View>
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>วันที่เดินทาง</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(trip.startDate)}
                  </Text>
                  <Text style={styles.detailValue}>
                    ถึง {formatDate(trip.endDate)}
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <Wallet size={18} color="#0066FF" strokeWidth={2.5} />
                </View>
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>งบประมาณ</Text>
                  <Text style={styles.detailValue}>
                    ฿{trip.budget.toLocaleString('th-TH')}
                  </Text>
                </View>
              </View>
            </View>

            {trip.notes && (
              <>
                <View style={styles.divider} />
                <View style={styles.notesContainer}>
                  <Text style={styles.notesLabel}>📝 หมายเหตุ</Text>
                  <Text style={styles.notesText} numberOfLines={3}>
                    {trip.notes}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              สร้างด้วย TrailTeller • AI Travel Planner
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleShare}>
          <LinearGradient
            colors={['#10B981', '#059669'] as const}
            style={styles.shareButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Share2 size={20} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.shareButtonText}>แชร์ภาพนี้</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <X size={20} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.cancelButtonText}>ปิด</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 400,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  tripInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  destinationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  destinationTextContainer: {
    flex: 1,
  },
  destination: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  country: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
  },
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 4,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  notesContainer: {
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  footerText: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.8,
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  actions: {
    width: '100%',
    maxWidth: 400,
    marginTop: 20,
    gap: 12,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});