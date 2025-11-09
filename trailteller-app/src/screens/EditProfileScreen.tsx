import React, { useState } from 'react';
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
import { useAuthStore } from '../store/authStore';
import { updateProfile } from '../api/auth';

const INTERESTS_OPTIONS = [
  { label: '🏖️ ชายหาด', value: 'beach' },
  { label: '⛰️ ภูเขา', value: 'mountain' },
  { label: '🏛️ วัฒนธรรม', value: 'culture' },
  { label: '🍜 อาหาร', value: 'food' },
  { label: '🏃 ผจญภัย', value: 'adventure' },
  { label: '🛍️ ช้อปปิ้ง', value: 'shopping' },
];

export default function EditProfileScreen({ navigation }: any) {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    user?.preferences?.interests || []
  );

  const toggleInterest = (value: string) => {
    setSelectedInterests((prev) =>
      prev.includes(value)
        ? prev.filter((i) => i !== value)
        : [...prev, value]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกชื่อ');
      return;
    }

    setLoading(true);
    try {
      const response = await updateProfile({
        name,
        phone,
        preferences: {
          ...user?.preferences,
          interests: selectedInterests,
        },
      });

      setUser(response.data);
      Alert.alert('สำเร็จ', 'อัปเดตโปรไฟล์เรียบร้อยแล้ว', [
        { text: 'ตกลง', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert(
        'ข้อผิดพลาด',
        error.response?.data?.message || 'ไม่สามารถอัปเดตโปรไฟล์ได้'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← ยกเลิก</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>แก้ไขโปรไฟล์</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          <Text style={[styles.saveButton, loading && styles.saveButtonDisabled]}>
            บันทึก
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <Text style={styles.label}>ชื่อ-นามสกุล *</Text>
          <TextInput
            style={styles.input}
            placeholder="กรอกชื่อของคุณ"
            value={name}
            onChangeText={setName}
            editable={!loading}
          />

          <Text style={styles.label}>เบอร์โทรศัพท์</Text>
          <TextInput
            style={styles.input}
            placeholder="0812345678"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            editable={!loading}
          />

          <Text style={styles.label}>ความสนใจ</Text>
          <Text style={styles.sublabel}>เลือกสิ่งที่คุณชอบเพื่อให้ AI แนะนำทริปที่ใช่</Text>
          <View style={styles.interestsContainer}>
            {INTERESTS_OPTIONS.map((interest) => (
              <TouchableOpacity
                key={interest.value}
                style={[
                  styles.interestChip,
                  selectedInterests.includes(interest.value) &&
                    styles.interestChipSelected,
                ]}
                onPress={() => toggleInterest(interest.value)}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.interestText,
                    selectedInterests.includes(interest.value) &&
                      styles.interestTextSelected,
                  ]}
                >
                  {interest.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.saveButtonBottom, loading && styles.saveButtonBottomDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>💾 บันทึกการเปลี่ยนแปลง</Text>
            )}
          </TouchableOpacity>
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
  saveButtonDisabled: {
    color: '#95a5a6',
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
  sublabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  interestChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  interestChipSelected: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  interestText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  interestTextSelected: {
    color: '#fff',
    fontWeight: '600',
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
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
