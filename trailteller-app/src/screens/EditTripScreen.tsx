import React, { useState, useEffect } from 'react';
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
import { getTrip, updateTrip, Trip } from '../api/trips';
import DatePickerInput from '../components/DatePickerInput';
import {
  ChevronLeft,
  MapPin,
  Globe,
  Calendar,
  Wallet,
  FileText,
  ListChecks,
  Save,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';

const STATUS_OPTIONS = [
  { label: '📝 กำลังวางแผน', value: 'planning', color: '#0066FF' },
  { label: '✅ ยืนยันแล้ว', value: 'confirmed', color: '#10B981' },
  { label: '✈️ กำลังเดินทาง', value: 'in_progress', color: '#F59E0B' },
  { label: '🎉 เสร็จสิ้น', value: 'completed', color: '#8B5CF6' },
  { label: '❌ ยกเลิก', value: 'cancelled', color: '#EF4444' },
];

export default function EditTripScreen({ route, navigation }: any) {
  const { tripId } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [destination, setDestination] = useState('');
  const [country, setCountry] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('planning');

  const [showStatusPicker, setShowStatusPicker] = useState(false);

  useEffect(() => {
    loadTrip();
  }, []);

  const loadTrip = async () => {
    try {
      const response = await getTrip(tripId);
      const trip: Trip = response.data;

      setDestination(trip.destination);
      setCountry(trip.country || '');
      setStartDate(trip.startDate.split('T')[0]);
      setEndDate(trip.endDate.split('T')[0]);
      setBudget(trip.budget.toString());
      setNotes(trip.notes || '');
      setStatus(trip.status);
    } catch (error) {
      console.error('Load trip error:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลทริปได้');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!destination || !startDate || !endDate || !budget) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setSaving(true);
    try {
      await updateTrip(tripId, {
        destination,
        country,
        startDate,
        endDate,
        budget: parseFloat(budget),
        notes,
        status: status as any,
      });

      Alert.alert('สำเร็จ', 'อัปเดทข้อมูลทริปเรียบร้อยแล้ว', [
        { text: 'ตกลง', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error('Update trip error:', error);
      Alert.alert(
        'ข้อผิดพลาด',
        error.response?.data?.message || 'ไม่สามารถอัปเดททริปได้'
      );
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (statusValue: string) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === statusValue);
    return option?.color || '#64748B';
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
            <Text style={styles.headerTitle}>แก้ไขทริป</Text>
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
          <Text style={styles.headerTitle}>แก้ไขทริป</Text>
          <TouchableOpacity
            style={styles.saveHeaderButton}
            onPress={handleSave}
            disabled={saving}
          >
            <Save size={20} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          {/* Destination */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={20} color="#0066FF" strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>จุดหมายปลายทาง</Text>
            </View>
            <View style={styles.inputCard}>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIconContainer}>
                  <MapPin size={20} color="#0066FF" strokeWidth={2} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="เช่น เชียงใหม่"
                  placeholderTextColor="#94A3B8"
                  value={destination}
                  onChangeText={setDestination}
                  editable={!saving}
                />
              </View>
            </View>
          </View>

          {/* Country */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Globe size={20} color="#10B981" strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>ประเทศ</Text>
            </View>
            <View style={styles.inputCard}>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIconContainer}>
                  <Globe size={20} color="#10B981" strokeWidth={2} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="เช่น ไทย"
                  placeholderTextColor="#94A3B8"
                  value={country}
                  onChangeText={setCountry}
                  editable={!saving}
                />
              </View>
            </View>
          </View>

          {/* Dates */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Calendar size={20} color="#0066FF" strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>วันที่เดินทาง</Text>
            </View>
            <View style={styles.dateColumn}>
              <DatePickerInput
                label="วันที่เริ่มต้น"
                value={startDate}
                onChange={setStartDate}
                disabled={saving}
                placeholder="เลือกวันเริ่มต้น"
              />
              <DatePickerInput
                label="วันที่สิ้นสุด"
                value={endDate}
                onChange={setEndDate}
                disabled={saving}
                placeholder="เลือกวันสิ้นสุด"
              />
            </View>
          </View>

          {/* Budget */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Wallet size={20} color="#10B981" strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>งบประมาณ</Text>
            </View>
            <View style={styles.inputCard}>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIconContainer}>
                  <Wallet size={20} color="#10B981" strokeWidth={2} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="15,000"
                  placeholderTextColor="#94A3B8"
                  value={budget}
                  onChangeText={setBudget}
                  keyboardType="numeric"
                  editable={!saving}
                />
                <Text style={styles.currency}>บาท</Text>
              </View>
            </View>
          </View>

          {/* Status */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ListChecks size={20} color="#8B5CF6" strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>สถานะ</Text>
            </View>
            <TouchableOpacity
              style={styles.statusCard}
              onPress={() => setShowStatusPicker(!showStatusPicker)}
              disabled={saving}
            >
              <View style={styles.statusContent}>
                <View style={styles.statusLeft}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(status) },
                    ]}
                  />
                  <Text style={styles.statusText}>
                    {STATUS_OPTIONS.find((opt) => opt.value === status)?.label ||
                      'เลือกสถานะ'}
                  </Text>
                </View>
                {showStatusPicker ? (
                  <ChevronUp size={20} color="#64748B" strokeWidth={2.5} />
                ) : (
                  <ChevronDown size={20} color="#64748B" strokeWidth={2.5} />
                )}
              </View>
            </TouchableOpacity>

            {showStatusPicker && (
              <View style={styles.statusPickerContainer}>
                {STATUS_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.statusPickerItem,
                      status === option.value && styles.statusPickerItemSelected,
                    ]}
                    onPress={() => {
                      setStatus(option.value);
                      setShowStatusPicker(false);
                    }}
                    disabled={saving}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: option.color },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusPickerItemText,
                        status === option.value &&
                          styles.statusPickerItemTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {status === option.value && (
                      <Text style={styles.statusCheckmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FileText size={20} color="#F59E0B" strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>บันทึกเพิ่มเติม</Text>
            </View>
            <View style={styles.textAreaCard}>
              <TextInput
                style={styles.textArea}
                placeholder="เช่น ต้องการห้องพักติดชายหาด..."
                placeholderTextColor="#94A3B8"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                editable={!saving}
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={saving}
          >
            <LinearGradient
              colors={
                saving
                  ? ['#94A3B8', '#64748B']
                  : (['#10B981', '#059669'] as const)
              }
              style={styles.saveButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {saving ? (
                <>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.saveButtonText}>กำลังบันทึก...</Text>
                </>
              ) : (
                <>
                  <Save size={20} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={styles.saveButtonText}>บันทึกการเปลี่ยนแปลง</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </View>
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
    width: 40,
  },
  saveHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  form: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
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
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  inputIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
  },
  currency: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
  },
  dateColumn: {
    gap: 12,
  },
  statusCard: {
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
  statusContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
  },
  statusPickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  statusPickerItemSelected: {
    backgroundColor: '#F8FAFC',
  },
  statusPickerItemText: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
  },
  statusPickerItemTextSelected: {
    fontWeight: '700',
    color: '#0066FF',
  },
  statusCheckmark: {
    fontSize: 16,
    color: '#0066FF',
    fontWeight: '700',
  },
  textAreaCard: {
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
  textArea: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
    minHeight: 120,
    lineHeight: 22,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});