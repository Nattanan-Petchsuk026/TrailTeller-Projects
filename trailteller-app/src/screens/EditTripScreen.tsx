import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { getTrip, updateTrip, Trip } from '../api/trips';
import DatePickerInput from '../components/DatePickerInput';

const STATUS_OPTIONS = [
  { label: '📝 กำลังวางแผน', value: 'planning' },
  { label: '✅ ยืนยันแล้ว', value: 'confirmed' },
  { label: '✈️ กำลังเดินทาง', value: 'in_progress' },
  { label: '🎉 เสร็จสิ้น', value: 'completed' },
  { label: '❌ ยกเลิก', value: 'cancelled' },
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

  // ✅ State สำหรับ dropdown
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  useEffect(() => {
    loadTrip();
  }, []);

  const loadTrip = async () => {
    try {
      const response = await getTrip(tripId);
      const trip: Trip = response.data;

      // Pre-fill form
      setDestination(trip.destination);
      setCountry(trip.country || '');
      setStartDate(trip.startDate.split('T')[0]); // YYYY-MM-DD
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

  // ✅ ฟังก์ชันดึงสีตาม status
  const getStatusColor = (statusValue: string) => {
    const colors: Record<string, string> = {
      planning: '#3498db',
      confirmed: '#2ecc71',
      in_progress: '#f39c12',
      completed: '#9b59b6',
      cancelled: '#e74c3c',
    };
    return colors[statusValue] || '#95a5a6';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← ยกเลิก</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>แก้ไขทริป</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← ยกเลิก</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>แก้ไขทริป</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text
            style={[
              styles.saveButton,
              saving && styles.saveButtonDisabledText,
            ]}
          >
            บันทึก
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          {/* Destination */}
          <Text style={styles.label}>จุดหมายปลายทาง *</Text>
          <TextInput
            style={styles.input}
            placeholder="เช่น เชียงใหม่"
            value={destination}
            onChangeText={setDestination}
            editable={!saving}
          />

          {/* Country */}
          <Text style={styles.label}>ประเทศ</Text>
          <TextInput
            style={styles.input}
            placeholder="เช่น ไทย"
            value={country}
            onChangeText={setCountry}
            editable={!saving}
          />

         {/* Start Date - ใช้ DatePicker แทน TextInput */}
<DatePickerInput
  label="วันที่เริ่มต้น *"
  value={startDate}
  onChange={setStartDate}
  disabled={saving}
  placeholder="เลือกวันเริ่มต้น"
/>

{/* End Date - ใช้ DatePicker แทน TextInput */}
<DatePickerInput
  label="วันที่สิ้นสุด *"
  value={endDate}
  onChange={setEndDate}
  disabled={saving}
  placeholder="เลือกวันสิ้นสุด"
/>

          {/* Budget */}
          <Text style={styles.label}>งบประมาณ (บาท) *</Text>
          <TextInput
            style={styles.input}
            placeholder="เช่น 15000"
            value={budget}
            onChangeText={setBudget}
            keyboardType="numeric"
            editable={!saving}
          />

          {/* ✅ Status - Dropdown แบบใหม่ */}
          <Text style={styles.label}>สถานะ</Text>
          <TouchableOpacity
            style={styles.statusDropdownButton}
            onPress={() => setShowStatusPicker(!showStatusPicker)}
            disabled={saving}
          >
            <View style={styles.statusDropdownContent}>
              <View style={styles.statusCurrentDisplay}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]} />
                <Text style={styles.statusDropdownText}>
                  {STATUS_OPTIONS.find(opt => opt.value === status)?.label || 'เลือกสถานะ'}
                </Text>
              </View>
              <Text style={styles.statusDropdownIcon}>{showStatusPicker ? '▲' : '▼'}</Text>
            </View>
          </TouchableOpacity>

          {/* ✅ Dropdown รายการ Status */}
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
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(option.value) }]} />
                  <Text
                    style={[
                      styles.statusPickerItemText,
                      status === option.value && styles.statusPickerItemTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {status === option.value && (
                    <Text style={styles.statusPickerCheckmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Notes */}
          <Text style={styles.label}>บันทึกเพิ่มเติม</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="เช่น ต้องการห้องพักติดชายหาด..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            editable={!saving}
          />

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButtonBottom,
              saving && styles.saveButtonBottomDisabled,
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>💾 บันทึกการเปลี่ยนแปลง</Text>
            )}
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    fontSize: 16,
    color: '#e74c3c',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  saveButton: {
    fontSize: 16,
    color: '#2ecc71',
    fontWeight: '600',
  },
  saveButtonDisabledText: {
    color: '#95a5a6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  // ✅ Styles สำหรับ Status Dropdown
  statusDropdownButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
  },
  statusDropdownContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusCurrentDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusDropdownText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
  },
  statusDropdownIcon: {
    fontSize: 12,
    color: '#95a5a6',
  },
  statusPickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  statusPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statusPickerItemSelected: {
    backgroundColor: '#f8f9fa',
  },
  statusPickerItemText: {
    flex: 1,
    fontSize: 15,
    color: '#2c3e50',
    fontWeight: '500',
  },
  statusPickerItemTextSelected: {
    fontWeight: '700',
    color: '#3498db',
  },
  statusPickerCheckmark: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: 'bold',
  },

  saveButtonBottom: {
    backgroundColor: '#2ecc71',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonBottomDisabled: {
    backgroundColor: '#95a5a6',
    opacity: 0.9,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});