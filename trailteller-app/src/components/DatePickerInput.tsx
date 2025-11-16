import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface DatePickerInputProps {
  label: string;
  value: string; // รูปแบบ YYYY-MM-DD
  onChange: (date: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function DatePickerInput({
  label,
  value,
  onChange,
  disabled = false,
  placeholder = 'เลือกวันที่',
}: DatePickerInputProps) {
  const [show, setShow] = useState(false);

  // แปลง string YYYY-MM-DD เป็น Date object
  const getDateFromString = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // แปลง Date object เป็น string YYYY-MM-DD
  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // แสดงวันที่แบบ ภาษาไทย
  const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return placeholder;
    const date = getDateFromString(dateStr);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleChange = (event: any, selectedDate?: Date) => {
    // Android: ปิด picker ทันที
    if (Platform.OS === 'android') {
      setShow(false);
    }

    if (selectedDate) {
      const formattedDate = formatDateToString(selectedDate);
      onChange(formattedDate);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={() => !disabled && setShow(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Calendar size={20} color="#0066FF" strokeWidth={2.5} />
        </View>
        <Text style={[styles.buttonText, !value && styles.placeholder]}>
          {formatDisplayDate(value)}
        </Text>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={getDateFromString(value)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          locale="th-TH"
          minimumDate={new Date()} // ไม่ให้เลือกวันที่ผ่านมาแล้ว
        />
      )}

      {/* iOS: แสดงปุ่ม Done */}
      {show && Platform.OS === 'ios' && (
        <View style={styles.iosButtonContainer}>
          <TouchableOpacity
            style={styles.iosDoneButton}
            onPress={() => setShow(false)}
          >
            <LinearGradient
              colors={['#0066FF', '#0047B3'] as const}
              style={styles.iosDoneButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.iosDoneButtonText}>เสร็จสิ้น</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  buttonDisabled: {
    backgroundColor: '#F8FAFC',
    opacity: 0.6,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  placeholder: {
    color: '#94A3B8',
    fontWeight: '500',
  },
  iosButtonContainer: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  iosDoneButton: {
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iosDoneButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  iosDoneButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});