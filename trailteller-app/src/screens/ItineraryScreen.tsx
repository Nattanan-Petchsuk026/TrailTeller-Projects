import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { generateItinerary } from '../api/ai';

const INTERESTS = [
  { label: '🏖️ ชายหาด', value: 'ชายหาด' },
  { label: '⛰️ ภูเขา', value: 'ภูเขา' },
  { label: '🏛️ วัฒนธรรม', value: 'วัฒนธรรม' },
  { label: '🍜 อาหาร', value: 'อาหาร' },
  { label: '🏃 ผจญภัย', value: 'ผจญภัย' },
  { label: '🛍️ ช้อปปิ้ง', value: 'ช้อปปิ้ง' },
];

export default function ItineraryScreen({ navigation }: any) {
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const toggleInterest = (interestValue: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestValue)
        ? prev.filter((i) => i !== interestValue)
        : [...prev, interestValue]
    );
  };

  const handleGenerate = async () => {
    if (!destination || !startDate || !endDate || !budget) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const requestData = {
        destination,
        startDate,
        endDate,
        budget: parseFloat(budget),
        interests: selectedInterests,
      };

      console.log('Sending request:', requestData);

      const response = await generateItinerary(requestData);

      console.log('Response:', response);

      setResult(response.data.itinerary || 'ไม่สามารถสร้างแผนได้');
    } catch (error: any) {
      console.error('Itinerary error:', error);
      console.error('Error response:', error.response?.data);
      
      const message = error.response?.data?.message || 'ไม่สามารถสร้างแผนได้ กรุณาลองใหม่อีกครั้ง';
      Alert.alert('ข้อผิดพลาด', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← กลับ</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📋 สร้างแผนการเดินทาง</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {!result ? (
          <View style={styles.form}>
            <Text style={styles.label}>จุดหมายปลายทาง</Text>
            <TextInput
              style={styles.input}
              placeholder="เช่น เชียงใหม่"
              value={destination}
              onChangeText={setDestination}
            />

            <Text style={styles.label}>วันที่เริ่มต้น (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="2025-12-20"
              value={startDate}
              onChangeText={setStartDate}
            />

            <Text style={styles.label}>วันที่สิ้นสุด (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="2025-12-24"
              value={endDate}
              onChangeText={setEndDate}
            />

            <Text style={styles.label}>งบประมาณ (บาท)</Text>
            <TextInput
              style={styles.input}
              placeholder="เช่น 15000"
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
            />

            <Text style={styles.label}>ความสนใจ</Text>
            <View style={styles.interestsContainer}>
              {INTERESTS.map((interest) => (
                <TouchableOpacity
                  key={interest.value}
                  style={[
                    styles.interestChip,
                    selectedInterests.includes(interest.value) &&
                      styles.interestChipSelected,
                  ]}
                  onPress={() => toggleInterest(interest.value)}
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
              style={[styles.generateButton, loading && styles.buttonDisabled]}
              onPress={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>🎯 สร้างแผนการเดินทาง</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>✨ แผนการเดินทางของคุณ</Text>
            <View style={styles.resultBox}>
              <Text style={styles.resultText}>{result}</Text>
            </View>
            <TouchableOpacity
              style={styles.newButton}
              onPress={() => setResult('')}
            >
              <Text style={styles.buttonText}>📝 สร้างแผนใหม่</Text>
            </TouchableOpacity>
          </View>
        )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    fontSize: 16,
    color: '#3498db',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  scrollView: {
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
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
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
  },
  generateButton: {
    backgroundColor: '#9b59b6',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 32,
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  resultContainer: {
    padding: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  resultBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultText: {
    fontSize: 16,
    color: '#2c3e50',
    lineHeight: 24,
  },
  newButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
});