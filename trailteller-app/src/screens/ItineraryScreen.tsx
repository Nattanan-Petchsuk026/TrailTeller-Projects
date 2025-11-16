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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ChevronLeft, 
  MapPin, 
  Wallet, 
  Sparkles,
  RefreshCw,
  Calendar,
  Clock,
  DollarSign,
  Sun,
  Moon,
  Coffee,
} from 'lucide-react-native';
import { generateItinerary } from '../api/ai';
import DatePickerInput from '../components/DatePickerInput';

const INTERESTS = [
  { label: '🏖️ ชายหาด', value: 'ชายหาด' },
  { label: '⛰️ ภูเขา', value: 'ภูเขา' },
  { label: '🏛️ วัฒนธรรม', value: 'วัฒนธรรม' },
  { label: '🍜 อาหาร', value: 'อาหาร' },
  { label: '🏃 ผจญภัย', value: 'ผจญภัย' },
  { label: '🛍️ ช้อปปิ้ง', value: 'ช้อปปิ้ง' },
];

interface ActivityInfo {
  location: string;
  description: string;
  cost: string;
}

interface DaySchedule {
  day: number;
  date: string;
  morning?: ActivityInfo;
  afternoon?: ActivityInfo;
  evening?: ActivityInfo;
  total?: string;
}

export default function ItineraryScreen({ navigation }: any) {
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [structuredItinerary, setStructuredItinerary] = useState<DaySchedule[]>([]);

  const toggleInterest = (interestValue: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestValue)
        ? prev.filter((i) => i !== interestValue)
        : [...prev, interestValue]
    );
  };

  const parseItinerary = (text: string): DaySchedule[] => {
    // Parse AI response into structured format
    const days: DaySchedule[] = [];
    const lines = text.split('\n');
    let currentDay: Partial<DaySchedule> = {};
    
    lines.forEach(line => {
      const trimmed = line.trim();
      
      // Match day header
      if (trimmed.match(/^📅.*วันที่\s*(\d+)/)) {
        if (currentDay.day) days.push(currentDay as DaySchedule);
        const dayMatch = trimmed.match(/วันที่\s*(\d+)/);
        currentDay = { day: parseInt(dayMatch?.[1] || '0'), date: trimmed };
      }
      
      // Match morning activities
      else if (trimmed.includes('🌅') || trimmed.includes('เช้า')) {
        currentDay.morning = { location: '', description: '', cost: '' };
      }
      else if (currentDay.morning && trimmed.includes('📍')) {
        currentDay.morning.location = trimmed.replace(/📍/g, '').trim();
      }
      else if (currentDay.morning && trimmed.includes('💰')) {
        currentDay.morning.cost = trimmed.replace(/💰/g, '').trim();
      }
      
      // Match afternoon activities
      else if (trimmed.includes('🌞') || trimmed.includes('บ่าย')) {
        currentDay.afternoon = { location: '', description: '', cost: '' };
      }
      else if (currentDay.afternoon && trimmed.includes('📍')) {
        currentDay.afternoon.location = trimmed.replace(/📍/g, '').trim();
      }
      else if (currentDay.afternoon && trimmed.includes('💰')) {
        currentDay.afternoon.cost = trimmed.replace(/💰/g, '').trim();
      }
      
      // Match evening activities
      else if (trimmed.includes('🌙') || trimmed.includes('เย็น')) {
        currentDay.evening = { location: '', description: '', cost: '' };
      }
      else if (currentDay.evening && (trimmed.includes('🍽️') || trimmed.includes('📍'))) {
        currentDay.evening.location = trimmed.replace(/[🍽️📍]/g, '').trim();
      }
      else if (currentDay.evening && trimmed.includes('💰')) {
        currentDay.evening.cost = trimmed.replace(/💰/g, '').trim();
      }
      
      // Match daily total
      else if (trimmed.includes('💵') && trimmed.includes('รวม')) {
        currentDay.total = trimmed.replace(/💵/g, '').trim();
      }
    });
    
    if (currentDay.day) days.push(currentDay as DaySchedule);
    return days;
  };

  const handleGenerate = async () => {
    if (!destination || !startDate || !endDate || !budget) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setLoading(true);
    setResult('');
    setStructuredItinerary([]);

    try {
      const response = await generateItinerary({
        destination,
        startDate,
        endDate,
        budget: parseFloat(budget),
        interests: selectedInterests,
      });

      const itineraryText = response.data.itinerary || 'ไม่สามารถสร้างแผนได้';
      setResult(itineraryText);
      
      // Try to parse into structured format
      const parsed = parseItinerary(itineraryText);
      if (parsed.length > 0) {
        setStructuredItinerary(parsed);
      }
    } catch (error: any) {
      console.error('Itinerary error:', error);
      const message = error.response?.data?.message || 'ไม่สามารถสร้างแผนได้ กรุณาลองใหม่อีกครั้ง';
      Alert.alert('ข้อผิดพลาด', message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDestination('');
    setStartDate('');
    setEndDate('');
    setBudget('');
    setSelectedInterests([]);
    setResult('');
    setStructuredItinerary([]);
  };

  const renderActivityCard = (
    icon: any,
    title: string,
    activity: ActivityInfo | undefined,
    color: string
  ) => {
    if (!activity?.location) return null;

    const Icon = icon;
    return (
      <View style={styles.activityCard}>
        <View style={[styles.activityIconContainer, { backgroundColor: color + '15' }]}>
          <Icon size={20} color={color} strokeWidth={2.5} />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityTime}>{title}</Text>
          <Text style={styles.activityLocation}>{activity.location}</Text>
          {activity.cost && (
            <View style={styles.costBadge}>
              <DollarSign size={14} color="#10B981" strokeWidth={2.5} />
              <Text style={styles.costText}>{activity.cost}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderDayCard = (day: DaySchedule, index: number) => (
    <View key={index} style={styles.dayCard}>
      <LinearGradient
        colors={['#0066FF', '#0047B3']}
        style={styles.dayHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.dayNumberContainer}>
          <Text style={styles.dayNumber}>DAY</Text>
          <Text style={styles.dayNumberLarge}>{day.day}</Text>
        </View>
        <View style={styles.dayDateContainer}>
          <Calendar size={16} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.dayDate}>{day.date.replace(/📅|วันที่\s*\d+/g, '').trim()}</Text>
        </View>
      </LinearGradient>

      <View style={styles.dayContent}>
        {renderActivityCard(Sun, 'เช้า (8:00-12:00)', day.morning, '#F59E0B')}
        {renderActivityCard(Coffee, 'บ่าย (13:00-17:00)', day.afternoon, '#0066FF')}
        {renderActivityCard(Moon, 'เย็น (18:00-21:00)', day.evening, '#8B5CF6')}

        {day.total && (
          <View style={styles.dailyTotalCard}>
            <Wallet size={20} color="#10B981" strokeWidth={2.5} />
            <Text style={styles.dailyTotalText}>{day.total}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
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
          <View style={styles.headerTitleContainer}>
            <Calendar size={20} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.headerTitle}>สร้างแผนการเดินทาง</Text>
          </View>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {!result ? (
          <View style={styles.form}>
            {/* Info Banner */}
            <View style={styles.infoBanner}>
              <Sparkles size={20} color="#0066FF" strokeWidth={2.5} />
              <Text style={styles.infoBannerText}>
                กรอกข้อมูลเพื่อสร้างแผนการเดินทางที่เหมาะกับคุณ
              </Text>
            </View>

            {/* Destination Input */}
            <View style={styles.inputCard}>
              <Text style={styles.label}>จุดหมายปลายทาง</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIconContainer}>
                  <MapPin size={20} color="#0066FF" strokeWidth={2} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="เช่น เชียงใหม่, โตเกียว, บาหลี"
                  placeholderTextColor="#94A3B8"
                  value={destination}
                  onChangeText={setDestination}
                />
              </View>
            </View>

            {/* Date Pickers - Vertical Layout */}
            <View style={styles.dateColumn}>
              <View style={styles.dateInputGroup}>
                <DatePickerInput
                  label="วันที่เริ่มต้น"
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="เลือกวันที่เริ่มต้น"
                />
              </View>
              <View style={styles.dateInputGroup}>
                <DatePickerInput
                  label="วันที่สิ้นสุด"
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="เลือกวันที่สิ้นสุด"
                />
              </View>
            </View>

            {/* Budget Input */}
            <View style={styles.inputCard}>
              <Text style={styles.label}>งบประมาณทั้งหมด</Text>
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
                />
                <Text style={styles.currency}>บาท</Text>
              </View>
            </View>

            {/* Interests */}
            <View style={styles.inputCard}>
              <Text style={styles.label}>ความสนใจของคุณ</Text>
              <Text style={styles.sublabel}>เลือกได้มากกว่า 1 รายการ</Text>
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
            </View>

            {/* Generate Button */}
            <TouchableOpacity
              style={styles.generateButton}
              onPress={handleGenerate}
              disabled={loading}
            >
              <LinearGradient
                colors={
                  loading
                    ? ['#94A3B8', '#64748B']
                    : (['#0066FF', '#0047B3'] as const)
                }
                style={styles.generateButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {loading ? (
                  <>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                    <Text style={styles.buttonText}>กำลังสร้างแผน...</Text>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} color="#FFFFFF" strokeWidth={2.5} />
                    <Text style={styles.buttonText}>สร้างแผนการเดินทาง</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.resultContainer}>
            {/* Result Header */}
            <View style={styles.resultHeaderCard}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.resultIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Sparkles size={32} color="#FFFFFF" strokeWidth={2.5} />
              </LinearGradient>
              <Text style={styles.resultTitle}>แผนการเดินทางของคุณ</Text>
              <View style={styles.resultMetadata}>
                <View style={styles.metadataItem}>
                  <MapPin size={16} color="#64748B" strokeWidth={2} />
                  <Text style={styles.metadataText}>{destination}</Text>
                </View>
                <View style={styles.metadataItem}>
                  <Calendar size={16} color="#64748B" strokeWidth={2} />
                  <Text style={styles.metadataText}>{startDate} - {endDate}</Text>
                </View>
              </View>
            </View>

            {/* Structured Itinerary */}
            {structuredItinerary.length > 0 ? (
              <View style={styles.itineraryList}>
                {structuredItinerary.map((day, index) => renderDayCard(day, index))}
              </View>
            ) : (
              <View style={styles.rawResultCard}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.rawResultText}>{result}</Text>
                </ScrollView>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.resetButton]}
                onPress={handleReset}
              >
                <RefreshCw size={20} color="#0066FF" strokeWidth={2.5} />
                <Text style={styles.resetButtonText}>สร้างแผนใหม่</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 14,
    color: '#0066FF',
    fontWeight: '600',
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  sublabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 10,
  },
  inputIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    paddingVertical: 12,
    fontWeight: '600',
  },
  currency: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
  },
  dateColumn: {
    gap: 16,
    marginBottom: 16,
  },
  dateInputGroup: {
    width: '100%',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
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
  generateButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  resultContainer: {
    padding: 20,
  },
  resultHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  resultIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  resultMetadata: {
    gap: 8,
    alignItems: 'center',
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metadataText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  itineraryList: {
    gap: 16,
    marginBottom: 20,
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  dayNumberContainer: {
    alignItems: 'center',
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 1,
  },
  dayNumberLarge: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  dayDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  dayDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dayContent: {
    padding: 16,
    gap: 12,
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  activityIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
    gap: 4,
  },
  activityTime: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activityLocation: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  costBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
    gap: 4,
  },
  costText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
  },
  dailyTotalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    gap: 8,
  },
  dailyTotalText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#10B981',
  },
  rawResultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    maxHeight: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 20,
  },
  rawResultText: {
    fontSize: 15,
    color: '#0F172A',
    lineHeight: 24,
    fontWeight: '500',
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  resetButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#0066FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0066FF',
  },
});