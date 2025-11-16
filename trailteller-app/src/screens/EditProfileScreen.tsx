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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../store/authStore';
import { updateProfile } from '../api/auth';
import {
  ChevronLeft,
  User,
  Phone,
  Heart,
  Save,
} from 'lucide-react-native';

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
          <Text style={styles.headerTitle}>แก้ไขโปรไฟล์</Text>
          <TouchableOpacity
            style={styles.saveHeaderButton}
            onPress={handleSave}
            disabled={loading}
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
          {/* Name Input */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <User size={20} color="#0066FF" strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>ชื่อ-นามสกุล</Text>
            </View>
            <View style={styles.inputCard}>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIconContainer}>
                  <User size={20} color="#0066FF" strokeWidth={2} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="กรอกชื่อของคุณ"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={setName}
                  editable={!loading}
                />
              </View>
            </View>
          </View>

          {/* Phone Input */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Phone size={20} color="#10B981" strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>เบอร์โทรศัพท์</Text>
            </View>
            <View style={styles.inputCard}>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIconContainer}>
                  <Phone size={20} color="#10B981" strokeWidth={2} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="0812345678"
                  placeholderTextColor="#94A3B8"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  editable={!loading}
                />
              </View>
            </View>
          </View>

          {/* Interests */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Heart size={20} color="#EF4444" strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>ความสนใจ</Text>
            </View>
            <Text style={styles.sublabel}>
              เลือกสิ่งที่คุณชอบเพื่อให้ AI แนะนำทริปที่ใช่
            </Text>
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
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={loading}
          >
            <LinearGradient
              colors={
                loading
                  ? ['#94A3B8', '#64748B']
                  : (['#10B981', '#059669'] as const)
              }
              style={styles.saveButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {loading ? (
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
  saveHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
  sublabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
    fontWeight: '500',
    lineHeight: 20,
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
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  interestChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  interestChipSelected: {
    backgroundColor: '#0066FF',
    borderColor: '#0066FF',
  },
  interestText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  interestTextSelected: {
    color: '#FFFFFF',
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