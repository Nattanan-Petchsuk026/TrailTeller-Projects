import React, { useState } from "react";
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { suggestDestinations } from "../api/ai";
import { createTrip } from "../api/trips";
import {
  ChevronLeft,
  DollarSign,
  Calendar,
  MapPin,
  Clock,
  Check,
  Sparkles,
  AlertCircle,
  FileText,
  Sun,
  TrendingUp,
} from "lucide-react-native";
import DatePickerInput from "../components/DatePickerInput";

const INTERESTS = [
  { label: "ชายหาด", value: "ชายหาด", icon: "🏖️" },
  { label: "ภูเขา", value: "ภูเขา", icon: "⛰️" },
  { label: "วัฒนธรรม", value: "วัฒนธรรม", icon: "🏛️" },
  { label: "อาหาร", value: "อาหาร", icon: "🍜" },
  { label: "ผจญภัย", value: "ผจญภัย", icon: "🏃" },
  { label: "ช้อปปิ้ง", value: "ช้อปปิ้ง", icon: "🛍️" },
];

const TRAVEL_STYLES = [
  { label: "ประหยัด", value: "budget", icon: "💰" },
  { label: "สบาย", value: "comfort", icon: "✨" },
  { label: "หรูหรา", value: "luxury", icon: "💎" },
];

interface TripOption {
  destination: string;
  country: string;
  duration: number;
  estimatedBudget: number;
  highlights: string[];
  bestTime: string;
  activities: string[];
  reason: string;
}

export default function TripPlanningScreen({ navigation }: any) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Basic Info
  const [budget, setBudget] = useState("");
  const [duration, setDuration] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [travelStyle, setTravelStyle] = useState("comfort");

  // Step 2: Trip Options
  const [tripOptions, setTripOptions] = useState<TripOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<TripOption | null>(null);

  // Step 3: Finalize
  const [startDate, setStartDate] = useState("");
  const [notes, setNotes] = useState("");

  const toggleInterest = (value: string) => {
    setSelectedInterests((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]
    );
  };

  // Step 1 -> Step 2: Get AI Suggestions
  const handleGetSuggestions = async () => {
    if (!budget || !duration || selectedInterests.length === 0) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setLoading(true);
    try {
      const response = await suggestDestinations({
        budget: parseFloat(budget),
        duration: parseInt(duration),
        interests: selectedInterests,
        travelStyle,
      });

      console.log("AI Response:", response.data.suggestion);

      // Parse JSON response
      if (Array.isArray(response.data.suggestion)) {
        setTripOptions(response.data.suggestion);
      } else {
        setTripOptions([]);
      }

      setStep(2);
    } catch (error: any) {
      console.error("Get suggestions error:", error);
      Alert.alert("ข้อผิดพลาด", "ไม่สามารถรับคำแนะนำได้ กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 -> Step 3: Select Option
  const handleSelectOption = (option: TripOption) => {
    setSelectedOption(option);
    setStep(3);
  };

  // Step 3: Save Trip
  const handleSaveTrip = async () => {
    if (!selectedOption || !startDate) {
      Alert.alert("ข้อผิดพลาด", "กรุณาระบุวันเริ่มต้น");
      return;
    }

    setLoading(true);
    try {
      // คำนวณวันสิ้นสุด
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(end.getDate() + selectedOption.duration);

      await createTrip({
        destination: selectedOption.destination,
        country: selectedOption.country,
        startDate: startDate,
        endDate: end.toISOString().split("T")[0],
        budget: selectedOption.estimatedBudget,
        notes: notes,
        aiSuggestions: selectedOption,
      });

      Alert.alert("สำเร็จ! 🎉", "บันทึกทริปเรียบร้อยแล้ว", [
        {
          text: "ดูทริป",
          onPress: () => navigation.navigate("MyTrips"),
        },
      ]);
    } catch (error: any) {
      console.error("Save trip error:", error);
      Alert.alert("ข้อผิดพลาด", "ไม่สามารถบันทึกทริปได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#0066FF", "#0047B3"] as const}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButtonContainer}
            onPress={() => {
              if (step > 1) setStep(step - 1);
              else navigation.goBack();
            }}
          >
            <ChevronLeft size={28} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>วางแผนทริปใหม่</Text>
            <Text style={styles.headerSubtitle}>ขั้นตอนที่ {step} จาก 3</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View
            style={[styles.progressBar, { width: `${(step / 3) * 100}%` }]}
          />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* STEP 1: Basic Information */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <View style={styles.stepIconContainer}>
                <FileText size={28} color="#0066FF" strokeWidth={2.5} />
              </View>
              <View style={styles.stepHeaderText}>
                <Text style={styles.stepTitle}>ข้อมูลพื้นฐาน</Text>
                <Text style={styles.stepDescription}>
                  บอกเราเกี่ยวกับแผนการเดินทางของคุณ
                </Text>
              </View>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.label}>งบประมาณ (บาท)</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.currencyPrefix}>฿</Text>
                <TextInput
                  style={styles.input}
                  placeholder="30,000"
                  value={budget}
                  onChangeText={setBudget}
                  keyboardType="numeric"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <Text style={styles.label}>ระยะเวลา (วัน)</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Clock size={20} color="#64748B" strokeWidth={2} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="5"
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="numeric"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <Text style={styles.label}>ความสนใจของคุณ</Text>
              <Text style={styles.sublabel}>เลือกได้มากกว่า 1 อย่าง</Text>
              <View style={styles.chipContainer}>
                {INTERESTS.map((interest) => (
                  <TouchableOpacity
                    key={interest.value}
                    style={[
                      styles.chip,
                      selectedInterests.includes(interest.value) &&
                        styles.chipSelected,
                    ]}
                    onPress={() => toggleInterest(interest.value)}
                  >
                    {selectedInterests.includes(interest.value) && (
                      <View style={styles.chipCheckIcon}>
                        <Check size={14} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    )}
                    <Text style={styles.chipEmoji}>{interest.icon}</Text>
                    <Text
                      style={[
                        styles.chipText,
                        selectedInterests.includes(interest.value) &&
                          styles.chipTextSelected,
                      ]}
                    >
                      {interest.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>สไตล์การเดินทาง</Text>
              <View style={styles.styleContainer}>
                {TRAVEL_STYLES.map((style) => (
                  <TouchableOpacity
                    key={style.value}
                    style={[
                      styles.styleButton,
                      travelStyle === style.value && styles.styleButtonSelected,
                    ]}
                    onPress={() => setTravelStyle(style.value)}
                  >
                    <Text style={styles.styleEmoji}>{style.icon}</Text>
                    <Text
                      style={[
                        styles.styleText,
                        travelStyle === style.value && styles.styleTextSelected,
                      ]}
                    >
                      {style.label}
                    </Text>
                    {travelStyle === style.value && (
                      <View style={styles.styleCheckmark}>
                        <Check size={16} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleGetSuggestions}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Sparkles size={20} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={styles.primaryButtonText}>รับคำแนะนำจาก AI</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2: Choose Trip Option */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <View style={styles.stepIconContainer}>
                <Sparkles size={28} color="#0066FF" strokeWidth={2.5} />
              </View>
              <View style={styles.stepHeaderText}>
                <Text style={styles.stepTitle}>เลือกแผนทริป</Text>
                <Text style={styles.stepDescription}>
                  {tripOptions.length} ตัวเลือกที่แนะนำโดย AI
                </Text>
              </View>
            </View>

            {tripOptions.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <AlertCircle size={48} color="#94A3B8" strokeWidth={2} />
                </View>
                <Text style={styles.emptyTitle}>ไม่พบคำแนะนำ</Text>
                <Text style={styles.emptySubtitle}>
                  กรุณาลองปรับเปลี่ยนข้อมูลและค้นหาใหม่อีกครั้ง
                </Text>
              </View>
            ) : (
              tripOptions.map((option, index) => (
                <View key={index} style={styles.optionCard}>
                  <View style={styles.optionBadge}>
                    <TrendingUp size={12} color="#F59E0B" strokeWidth={2.5} />
                    <Text style={styles.optionBadgeText}>
                      แนะนำ #{index + 1}
                    </Text>
                  </View>

                  <View style={styles.optionHeader}>
                    <Text style={styles.optionDestination}>
                      {option.destination}
                    </Text>
                    <View style={styles.optionCountryRow}>
                      <MapPin size={14} color="#64748B" strokeWidth={2} />
                      <Text style={styles.optionCountry}>{option.country}</Text>
                    </View>
                  </View>

                  <Text style={styles.optionReason}>{option.reason}</Text>

                  <View style={styles.optionDetailsGrid}>
                    <View style={styles.optionDetailBox}>
                      <View style={styles.optionDetailIconContainer}>
                        <Clock size={20} color="#0066FF" strokeWidth={2.5} />
                      </View>
                      <Text style={styles.optionDetailLabel}>ระยะเวลา</Text>
                      <Text style={styles.optionDetailValue}>
                        {option.duration} วัน
                      </Text>
                    </View>
                    <View style={styles.optionDetailBox}>
                      <View style={styles.optionDetailIconContainer}>
                        <DollarSign
                          size={20}
                          color="#0066FF"
                          strokeWidth={2.5}
                        />
                      </View>
                      <Text style={styles.optionDetailLabel}>งบประมาณ</Text>
                      <Text style={styles.optionDetailValue}>
                        ฿{option.estimatedBudget.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.optionDetailBox}>
                      <View style={styles.optionDetailIconContainer}>
                        <Sun size={20} color="#0066FF" strokeWidth={2.5} />
                      </View>
                      <Text style={styles.optionDetailLabel}>ช่วงเวลา</Text>
                      <Text style={styles.optionDetailValue}>
                        {option.bestTime}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.highlightsContainer}>
                    <Text style={styles.highlightsTitle}>ไฮไลท์ของทริป</Text>
                    {option.highlights.slice(0, 3).map((highlight, i) => (
                      <View key={i} style={styles.highlightItem}>
                        <View style={styles.highlightDot} />
                        <Text style={styles.highlightText}>{highlight}</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => handleSelectOption(option)}
                  >
                    <Text style={styles.selectButtonText}>เลือกแผนนี้</Text>
                    <Check size={18} color="#FFFFFF" strokeWidth={3} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* STEP 3: Finalize & Save */}
        {step === 3 && selectedOption && (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <View style={styles.stepIconContainer}>
                <Check size={28} color="#10B981" strokeWidth={2.5} />
              </View>
              <View style={styles.stepHeaderText}>
                <Text style={styles.stepTitle}>ยืนยันการจอง</Text>
                <Text style={styles.stepDescription}>
                  เพิ่มรายละเอียดเพื่อบันทึกทริป
                </Text>
              </View>
            </View>

            <View style={styles.summaryCard}>
              <LinearGradient
                colors={["#0066FF", "#0047B3"] as const}
                style={styles.summaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.summaryHeader}>
                  <MapPin size={24} color="#FFFFFF" strokeWidth={2.5} />
                  <View style={styles.summaryHeaderText}>
                    <Text style={styles.summaryTitle}>
                      {selectedOption.destination}
                    </Text>
                    <Text style={styles.summarySubtitle}>
                      {selectedOption.country}
                    </Text>
                  </View>
                </View>
              </LinearGradient>

              <View style={styles.summaryDetails}>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryLabelRow}>
                    <Clock size={16} color="#64748B" strokeWidth={2} />
                    <Text style={styles.summaryLabel}>ระยะเวลา</Text>
                  </View>
                  <Text style={styles.summaryValue}>
                    {selectedOption.duration} วัน
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryLabelRow}>
                    <DollarSign size={16} color="#64748B" strokeWidth={2} />
                    <Text style={styles.summaryLabel}>งบประมาณ</Text>
                  </View>
                  <Text style={styles.summaryValue}>
                    ฿{selectedOption.estimatedBudget.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.formCard}>
              {/* ✅ ใช้ DatePicker แทน TextInput */}
              <DatePickerInput
                label="วันเริ่มต้นการเดินทาง"
                value={startDate}
                onChange={setStartDate}
                disabled={loading}
                placeholder="เลือกวันเริ่มต้น"
              />

              <Text style={styles.label}>บันทึกเพิ่มเติม</Text>
              <Text style={styles.sublabel}>ไม่บังคับ</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <TextInput
                  style={styles.textArea}
                  placeholder="เช่น ต้องการห้องพักติดชายหาด, ชอบอาหารญี่ปุ่น..."
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor="#94A3B8"
                  textAlignVertical="top"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                styles.successButton,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleSaveTrip}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Check size={20} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={styles.primaryButtonText}>บันทึกทริป</Text>
                </>
              )}
            </TouchableOpacity>
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
    backgroundColor: "#F8FAFC",
  },
  headerGradient: {
    paddingBottom: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.9,
    marginTop: 2,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  headerRight: {
    width: 40,
  },
  progressContainer: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: 20,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  stepIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  stepHeaderText: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  stepDescription: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
    marginTop: 16,
    letterSpacing: -0.2,
  },
  sublabel: {
    fontSize: 12,
    color: "#94A3B8",
    marginBottom: 10,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0066FF",
    marginRight: 8,
  },

  inputIconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#0F172A",
    fontWeight: "500",
    letterSpacing: -0.1,
  },
  textAreaContainer: {
    minHeight: 120,
    paddingVertical: 16,
    alignItems: "flex-start",
  },
  textArea: {
    flex: 1,
    width: "100%",
    fontSize: 15,
    color: "#0F172A",
    fontWeight: "500",
    letterSpacing: -0.1,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  chip: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chipSelected: {
    backgroundColor: "#0066FF",
    borderColor: "#0066FF",
  },
  chipCheckIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  chipEmoji: {
    fontSize: 16,
  },
  chipText: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "600",
    letterSpacing: -0.1,
  },
  chipTextSelected: {
    color: "#FFFFFF",
  },
  styleContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  styleButton: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    position: "relative",
  },
  styleButtonSelected: {
    backgroundColor: "#0066FF",
    borderColor: "#0066FF",
  },
  styleEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  styleText: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  styleTextSelected: {
    color: "#FFFFFF",
  },
  styleCheckmark: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#0066FF",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#0066FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  successButton: {
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  optionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  optionBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
    gap: 4,
  },
  optionBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#F59E0B",
    letterSpacing: 0.2,
  },
  optionHeader: {
    marginBottom: 12,
  },
  optionDestination: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  optionCountryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  optionCountry: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  optionReason: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
    marginBottom: 20,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  optionDetailsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#F1F5F9",
  },
  optionDetailBox: {
    flex: 1,
    alignItems: "center",
  },
  optionDetailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  optionDetailLabel: {
    fontSize: 11,
    color: "#94A3B8",
    marginBottom: 4,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  optionDetailValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  highlightsContainer: {
    marginBottom: 20,
  },
  highlightsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  highlightItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  highlightDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#0066FF",
    marginRight: 12,
    marginTop: 7,
  },
  highlightText: {
    fontSize: 13,
    color: "#475569",
    flex: 1,
    lineHeight: 20,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  selectButton: {
    backgroundColor: "#0066FF",
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#0066FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  selectButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  summaryGradient: {
    padding: 20,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  summaryHeaderText: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  summarySubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.95,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  summaryDetails: {
    padding: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  summaryLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  summaryValue: {
    fontSize: 16,
    color: "#0F172A",
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 80,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
});
