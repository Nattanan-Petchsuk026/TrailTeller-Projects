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
      >
        <Calendar size={20} color="#64748B" strokeWidth={2} />
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
            <Text style={styles.iosDoneButtonText}>เสร็จสิ้น</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  buttonDisabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  placeholder: {
    color: '#95a5a6',
  },
  iosButtonContainer: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  iosDoneButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  iosDoneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});