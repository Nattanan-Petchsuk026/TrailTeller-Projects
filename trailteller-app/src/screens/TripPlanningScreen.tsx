import React, { useEffect, useState } from "react";
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
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { suggestDestinations } from "../api/ai";
import { createTrip } from "../api/trips";
import { searchHotels, searchFlights, searchRestaurants } from "../api/bookings";
import {
  ChevronLeft,
  Wallet,
  Calendar,
  MapPin,
  Clock,
  Check,
  Sparkles,
  FileText,
  Sun,
  TrendingUp,
  Hotel,
  Users,
  Star,
  Plane,
  UtensilsCrossed,
  ChevronRight,
} from "lucide-react-native";
import DatePickerInput from "../components/DatePickerInput";
import apiClient from "../api/client";

const INTERESTS = [
  { label: "ชายหาด", value: "ชายหาด", icon: "🏖️" },
  { label: "ภูเขา", value: "ภูเขา", icon: "⛰️" },
  { label: "วัฒนธรรม", value: "วัฒนธรรม", icon: "🛕" },
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

interface HotelOption {
  id: string;
  name: string;
  location: string;
  rating: number;
  price: number;
  currency: string;
  imageUrl: string;
  amenities: string[];
  roomType: string;
  description: string;
  address: string;
  checkIn: string;
  checkOut: string;
}

interface FlightOption {
  id: string;
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  currency: string;
  seatClass: string;
  availableSeats: number;
}

interface RestaurantOption {
  id: string;
  name: string;
  cuisine: string;
  location: string;
  rating: number;
  priceRange: string;
  imageUrl: string;
  description: string;
  phoneNumber: string;
  openingHours: string;
}

export default function TripPlanningScreen({ navigation }: any) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // ✅ Budget Tracking
  const [totalBudget, setTotalBudget] = useState(0);
  const [remainingBudget, setRemainingBudget] = useState(0);
  const [spentBudget, setSpentBudget] = useState(0);

  // Step 1: Basic Info
  const [budget, setBudget] = useState("");
  const [duration, setDuration] = useState("");
  const [startDate, setStartDate] = useState("");
  const [guests, setGuests] = useState("2");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [travelStyle, setTravelStyle] = useState("comfort");

  // Step 2-5: Trip Options & Bookings
  const [tripOptions, setTripOptions] = useState<TripOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<TripOption | null>(null);
  const [hotels, setHotels] = useState<HotelOption[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<HotelOption | null>(null);
  const [flights, setFlights] = useState<FlightOption[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<FlightOption | null>(null);
  const [restaurants, setRestaurants] = useState<RestaurantOption[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantOption | null>(null);
  const [notes, setNotes] = useState("");

  // ✅ คำนวณงบคงเหลือทุกครั้งที่มีการเลือก
  useEffect(() => {
    let spent = 0;
    
    if (selectedHotel && selectedOption) {
      const nights = selectedOption.duration;
      spent += selectedHotel.price * nights;
    }
    
    if (selectedFlight) {
      spent += selectedFlight.price * parseInt(guests);
    }
    
    // ร้านอาหารไม่คิดค่าจอง (ชำระที่ร้าน)
    
    setSpentBudget(spent);
    setRemainingBudget(totalBudget - spent);
  }, [selectedHotel, selectedFlight, selectedOption, totalBudget, guests]);

  const toggleInterest = (value: string) => {
    setSelectedInterests((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]
    );
  };



 // Step 1 -> Step 2: Get AI Suggestions
  const handleGetSuggestions = async () => {
    if (!budget || !duration || !startDate || selectedInterests.length === 0) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const selectedStartDate = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedStartDate < today) {
      Alert.alert("ข้อผิดพลาด", "วันเริ่มต้นต้องไม่เป็นวันในอดีต");
      return;
    }

    // ✅ ตั้งค่างบประมาณ
    const budgetAmount = parseFloat(budget);
    setTotalBudget(budgetAmount);
    setRemainingBudget(budgetAmount);

    setLoading(true);
    try {
      const response = await suggestDestinations({
        budget: budgetAmount,
        duration: parseInt(duration),
        interests: selectedInterests,
        travelStyle,
      });

      if (Array.isArray(response.data.suggestion)) {
        // ✅ กรองเฉพาะที่อยู่ในงบ
        const affordableOptions = response.data.suggestion.filter(
          (option: TripOption) => option.estimatedBudget <= budgetAmount
        );
        
        if (affordableOptions.length === 0) {
          Alert.alert(
            "งบประมาณไม่เพียงพอ",
            `ไม่มีทริปที่เหมาะสมกับงบ ${budgetAmount.toLocaleString()} บาท\nกรุณาเพิ่มงบประมาณหรือลดระยะเวลา`
          );
          setLoading(false);
          return;
        }
        
        setTripOptions(affordableOptions);
        setStep(2);
      } else {
        Alert.alert("ข้อผิดพลาด", "ไม่สามารถรับคำแนะนำได้");
      }
    } catch (error: any) {
      console.error("Get suggestions error:", error);
      Alert.alert("ข้อผิดพลาด", "ไม่สามารถรับคำแนะนำได้");
    } finally {
      setLoading(false);
    }
  };

   // ✅ Step 2 -> Step 3: Select Option & Search Hotels (กรองตามงบ)
  // ใน handleSelectOption
const handleSelectOption = async (option: TripOption) => {
  setSelectedOption(option);
  setLoading(true);
  
  try {
    const checkIn = new Date(startDate);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkIn.getDate() + option.duration);

    // ✅ คำนวณงบสำหรับโรงแรม (40-50% ของงบทั้งหมด)
    const maxHotelBudgetPerNight = Math.floor(totalBudget * 0.45 / option.duration);

    // ✅ เรียกใช้ฟังก์ชันใหม่จาก AI Service (ผ่าน API endpoint ใหม่)
    const hotelResponse = await apiClient.post('/ai/search-affordable-hotels', {
      destination: option.destination,
      checkIn: checkIn.toISOString().split('T')[0],
      checkOut: checkOut.toISOString().split('T')[0],
      guests: parseInt(guests),
      maxBudgetPerNight: maxHotelBudgetPerNight,
      duration: option.duration,
    });

    setHotels(hotelResponse.data.data);
    setStep(3);
  } catch (error) {
    console.error("Search hotels error:", error);
    Alert.alert("ข้อผิดพลาด", "ไม่สามารถค้นหาโรงแรมได้");
  } finally {
    setLoading(false);
  }
};

   // ✅ Step 3 -> Step 4: Select Hotel & Search Flights (กรองตามงบที่เหลือ)
  const handleSelectHotel = async (hotel: HotelOption | null) => {
    setSelectedHotel(hotel);
    
    // คำนวณงบที่เหลือหลังจากเลือกโรงแรม
    let budgetAfterHotel = totalBudget;
    if (hotel && selectedOption) {
      budgetAfterHotel -= hotel.price * selectedOption.duration;
    }
    
    const needsFlight = selectedOption?.activities?.some(
      act => act.includes('บิน') || act.includes('เครื่องบิน')
    ) || selectedOption?.country !== 'ไทย';

    if (!needsFlight) {
      await handleSearchRestaurants(budgetAfterHotel);
      return;
    }

    setLoading(true);
    try {
      const departureDate = new Date(startDate);
      const returnDate = new Date(departureDate);
      returnDate.setDate(departureDate.getDate() + (selectedOption?.duration || 3));

      // ✅ คำนวณงบสำหรับเที่ยวบิน (ประมาณ 30-40% ของงบที่เหลือ)
      const maxFlightBudget = Math.floor(budgetAfterHotel * 0.4);

      console.log(`✈️ Searching flights with max ${maxFlightBudget} THB...`);

      const flightResponse = await searchFlights({
        origin: 'Bangkok',
        destination: selectedOption?.destination || '',
        departureDate: departureDate.toISOString().split('T')[0],
        returnDate: returnDate.toISOString().split('T')[0],
        passengers: parseInt(guests),
        seatClass: travelStyle === 'luxury' ? 'business' : 'economy',
      });

      // ✅ กรองเที่ยวบินที่อยู่ในงบ
      const affordableFlights = (flightResponse.data || []).filter((flight: FlightOption) => {
        const totalFlightCost = flight.price * parseInt(guests);
        return totalFlightCost <= budgetAfterHotel * 0.45; // ไม่เกิน 45% ของงบที่เหลือ
      });

      // เรียงตามราคา (ถูก -> แพง)
      affordableFlights.sort((a: FlightOption, b: FlightOption) => a.price - b.price);

      if (affordableFlights.length === 0) {
        Alert.alert(
          "ไม่พบเที่ยวบินที่เหมาะสม",
          `งบคงเหลือ: ${budgetAfterHotel.toLocaleString()} บาท\nไม่มีเที่ยวบินที่เหมาะสม`,
          [
            { text: "เลือกโรงแรมใหม่", onPress: () => { setSelectedHotel(null); setStep(3); } },
            { text: "ข้ามขั้นตอนนี้", onPress: () => handleSearchRestaurants(budgetAfterHotel) }
          ]
        );
        setFlights([]);
      } else {
        setFlights(affordableFlights);
        console.log(`✅ Found ${affordableFlights.length} affordable flights`);
      }

      setStep(4);
    } catch (error) {
      console.error("Search flights error:", error);
      await handleSearchRestaurants(budgetAfterHotel);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Step 4 -> Step 5: Select Flight & Search Restaurants (กรองตามงบที่เหลือ)
  const handleSelectFlight = async (flight: FlightOption | null) => {
    setSelectedFlight(flight);
    
    // คำนวณงบที่เหลือ
    let budgetAfterFlights = totalBudget;
    if (selectedHotel && selectedOption) {
      budgetAfterFlights -= selectedHotel.price * selectedOption.duration;
    }
    if (flight) {
      budgetAfterFlights -= flight.price * parseInt(guests);
    }
    
    await handleSearchRestaurants(budgetAfterFlights);
  };

  const handleSearchRestaurants = async (budgetLeft: number) => {
    setLoading(true);
    try {
      const reservationDate = new Date(startDate);

      console.log(`🍽️ Budget left for restaurants: ${budgetLeft.toLocaleString()} THB`);

      const restaurantResponse = await searchRestaurants({
        destination: selectedOption?.destination || '',
        date: reservationDate.toISOString().split('T')[0],
        partySize: parseInt(guests),
        cuisine: selectedInterests.includes('อาหาร') ? 'Thai' : undefined,
      });

      // ✅ กรองร้านอาหารตามราคา (ใช้ priceRange)
      const allRestaurants = restaurantResponse.data || [];
      
      // แปลง priceRange เป็นตัวเลข
      const getPriceLevel = (priceRange: string): number => {
        const bahtCount = (priceRange.match(/฿/g) || []).length;
        return bahtCount;
      };

      // กรองตามงบที่เหลือ
      let affordableRestaurants = allRestaurants;
      if (budgetLeft < totalBudget * 0.3) {
        // งบเหลือน้อย -> เอาแค่ ฿ และ ฿฿
        affordableRestaurants = allRestaurants.filter((r: RestaurantOption) => 
          getPriceLevel(r.priceRange) <= 2
        );
      } else if (budgetLeft < totalBudget * 0.5) {
        // งบเหลือปานกลาง -> เอาแค่ ฿฿฿ ลงมา
        affordableRestaurants = allRestaurants.filter((r: RestaurantOption) => 
          getPriceLevel(r.priceRange) <= 3
        );
      }
      // ถ้างบเหลือเยอะ -> แสดงทั้งหมด

      setRestaurants(affordableRestaurants);
      console.log(`✅ Found ${affordableRestaurants.length} suitable restaurants`);
      setStep(5);
    } catch (error) {
      console.error("Search restaurants error:", error);
      setStep(6);
    } finally {
      setLoading(false);
    }
  };

 // Step 5 -> Step 6
  const handleSelectRestaurant = (restaurant: RestaurantOption | null) => {
    setSelectedRestaurant(restaurant);
    setStep(6);
  };


  // Step 6: Save Trip + Create Bookings
  const handleSaveTrip = async () => {
    if (!selectedOption) {
      Alert.alert("ข้อผิดพลาด", "กรุณาเลือกจุดหมายปลายทาง");
      return;
    }

    setLoading(true);
    try {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(end.getDate() + selectedOption.duration);

      const tripResponse = await createTrip({
        destination: selectedOption.destination,
        country: selectedOption.country,
        startDate: startDate,
        endDate: end.toISOString().split("T")[0],
        budget: selectedOption.estimatedBudget,
        notes: notes,
        aiSuggestions: {
          ...selectedOption,
          selectedHotel: selectedHotel,
          selectedFlight: selectedFlight,
          selectedRestaurant: selectedRestaurant,
        },
      });

      const tripId = tripResponse.data.id;
      const bookingsToCreate = [];
      
      if (selectedHotel) {
        const checkOut = new Date(start);
        checkOut.setDate(start.getDate() + selectedOption.duration);
        const nights = selectedOption.duration;

        bookingsToCreate.push({
          type: 'hotel',
          item: selectedHotel,
          title: selectedHotel.name,
          description: `${selectedHotel.roomType} - ${nights} คืน`,
          price: selectedHotel.price * nights,
          startDate: startDate,
          endDate: checkOut.toISOString().split("T")[0],
          details: {
            hotelName: selectedHotel.name,
            roomType: selectedHotel.roomType,
            checkIn: selectedHotel.checkIn,
            checkOut: selectedHotel.checkOut,
            guests: parseInt(guests),
            nights: nights,
            address: selectedHotel.address,
            rating: selectedHotel.rating,
            imageUrl: selectedHotel.imageUrl,
            amenities: selectedHotel.amenities,
          }
        });
      }

      if (selectedFlight) {
        bookingsToCreate.push({
          type: 'flight',
          item: selectedFlight,
          title: `${selectedFlight.airline} ${selectedFlight.flightNumber}`,
          description: `${selectedFlight.departureAirport} → ${selectedFlight.arrivalAirport}`,
          price: selectedFlight.price,
          startDate: startDate,
          endDate: startDate,
          details: {
            airline: selectedFlight.airline,
            flightNumber: selectedFlight.flightNumber,
            departureAirport: selectedFlight.departureAirport,
            arrivalAirport: selectedFlight.arrivalAirport,
            departureTime: selectedFlight.departureTime,
            arrivalTime: selectedFlight.arrivalTime,
            duration: selectedFlight.duration,
            seatClass: selectedFlight.seatClass,
            passengers: parseInt(guests),
          }
        });
      }

      if (selectedRestaurant) {
        bookingsToCreate.push({
          type: 'restaurant',
          item: selectedRestaurant,
          title: selectedRestaurant.name,
          description: `${selectedRestaurant.cuisine} - ${selectedRestaurant.priceRange}`,
          price: 0,
          startDate: startDate,
          endDate: startDate,
          details: {
            restaurantName: selectedRestaurant.name,
            cuisine: selectedRestaurant.cuisine,
            location: selectedRestaurant.location,
            rating: selectedRestaurant.rating,
            priceRange: selectedRestaurant.priceRange,
            imageUrl: selectedRestaurant.imageUrl,
            phoneNumber: selectedRestaurant.phoneNumber,
            openingHours: selectedRestaurant.openingHours,
            partySize: parseInt(guests),
          }
        });
      }

      if (bookingsToCreate.length > 0) {
        navigation.replace('BookingSummary', {
          tripId,
          bookingsToCreate,
          tripDestination: selectedOption.destination,
          onComplete: () => {
            navigation.navigate('TripDetail', { tripId });
          }
        });
      } else {
        Alert.alert("สำเร็จ! 🎉", "บันทึกทริปเรียบร้อยแล้ว", [
          {
            text: "ดูทริป",
            onPress: () => navigation.navigate("TripDetail", { tripId }),
          },
        ]);
      }
    } catch (error: any) {
      console.error("Save trip error:", error);
      Alert.alert("ข้อผิดพลาด", "ไม่สามารถบันทึกทริปได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#0066FF", "#0047B3"] as const}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (step > 1) setStep(step - 1);
              else navigation.goBack();
            }}
          >
            <ChevronLeft size={28} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>วางแผนทริปใหม่</Text>
            <Text style={styles.headerSubtitle}>ขั้นตอนที่ {step} จาก 6</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${(step / 6) * 100}%` }]} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* STEP 1: Basic Information + Start Date */}
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
              {/* ✅ วันเริ่มต้นการเดินทาง - ย้ายมาขั้นตอนแรก */}
              <DatePickerInput
                label="วันเริ่มต้นการเดินทาง"
                value={startDate}
                onChange={setStartDate}
                disabled={loading}
                placeholder="เลือกวันเริ่มต้น"
              />

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

              <Text style={styles.label}>จำนวนผู้เดินทาง</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Users size={20} color="#64748B" strokeWidth={2} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="2"
                  value={guests}
                  onChangeText={setGuests}
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
                      selectedInterests.includes(interest.value) && styles.chipSelected,
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
                        selectedInterests.includes(interest.value) && styles.chipTextSelected,
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

        {/* STEP 2: Choose Destination */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <View style={styles.stepIconContainer}>
                <MapPin size={28} color="#0066FF" strokeWidth={2.5} />
              </View>
              <View style={styles.stepHeaderText}>
                <Text style={styles.stepTitle}>เลือกจุดหมาย</Text>
                <Text style={styles.stepDescription}>
                  {tripOptions.length} ตัวเลือกที่แนะนำโดย AI
                </Text>
              </View>
            </View>

            {tripOptions.map((option, index) => (
              <View key={index} style={styles.optionCard}>
                <View style={styles.optionBadge}>
                  <TrendingUp size={12} color="#F59E0B" strokeWidth={2.5} />
                  <Text style={styles.optionBadgeText}>แนะนำ #{index + 1}</Text>
                </View>

                <View style={styles.optionHeader}>
                  <Text style={styles.optionDestination}>{option.destination}</Text>
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
                    <Text style={styles.optionDetailValue}>{option.duration} วัน</Text>
                  </View>
                  <View style={styles.optionDetailBox}>
                    <View style={styles.optionDetailIconContainer}>
                      <Wallet size={20} color="#0066FF" strokeWidth={2.5} />
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
                    <Text style={styles.optionDetailValue}>{option.bestTime}</Text>
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
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Text style={styles.selectButtonText}>เลือกจุดหมายนี้</Text>
                      <ChevronRight size={18} color="#FFFFFF" strokeWidth={3} />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* STEP 3: Choose Hotel */}
        {step === 3 && selectedOption && (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <View style={styles.stepIconContainer}>
                <Hotel size={28} color="#0066FF" strokeWidth={2.5} />
              </View>
              <View style={styles.stepHeaderText}>
                <Text style={styles.stepTitle}>เลือกโรงแรม</Text>
                <Text style={styles.stepDescription}>
                  พบ {hotels.length} โรงแรมใน {selectedOption.destination}
                </Text>
              </View>
            </View>

            {hotels.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🏨</Text>
                <Text style={styles.emptyTitle}>ไม่พบโรงแรม</Text>
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={() => handleSelectHotel(null)}
                >
                  <Text style={styles.skipButtonText}>ข้ามขั้นตอนนี้</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {hotels.map((hotel, index) => (
                  <View key={index} style={styles.hotelCard}>
                    <Image
                      source={{ uri: hotel.imageUrl }}
                      style={styles.hotelImage}
                      resizeMode="cover"
                    />
                    <View style={styles.hotelContent}>
                      <View style={styles.hotelHeader}>
                        <Text style={styles.hotelName}>{hotel.name}</Text>
                        {hotel.rating > 0 && (
                          <View style={styles.ratingBadge}>
                            <Star size={12} color="#F59E0B" fill="#F59E0B" strokeWidth={0} />
                            <Text style={styles.ratingText}>{hotel.rating.toFixed(1)}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.hotelDescription} numberOfLines={2}>
                        {hotel.description}
                      </Text>
                      <View style={styles.hotelFooter}>
                        <View>
                          <Text style={styles.priceLabel}>เริ่มต้น</Text>
                          <Text style={styles.priceValue}>
                            ฿{hotel.price.toLocaleString()}/คืน
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.selectHotelButton}
                          onPress={() => handleSelectHotel(hotel)}
                        >
                          <Text style={styles.selectHotelText}>เลือก</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={() => handleSelectHotel(null)}
                >
                  <Text style={styles.skipButtonText}>ข้ามการเลือกโรงแรม</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* STEP 4: Choose Flight (NEW) */}
        {step === 4 && selectedOption && (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <View style={styles.stepIconContainer}>
                <Plane size={28} color="#F59E0B" strokeWidth={2.5} />
              </View>
              <View style={styles.stepHeaderText}>
                <Text style={styles.stepTitle}>เลือกเที่ยวบิน</Text>
                <Text style={styles.stepDescription}>
                  พบ {flights.length} เที่ยวบินไป {selectedOption.destination}
                </Text>
              </View>
            </View>

            {flights.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>✈️</Text>
                <Text style={styles.emptyTitle}>ไม่พบเที่ยวบิน</Text>
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={() => handleSelectFlight(null)}
                >
                  <Text style={styles.skipButtonText}>ข้ามขั้นตอนนี้</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {flights.map((flight, index) => (
                  <View key={index} style={styles.flightCard}>
                    <View style={styles.flightHeader}>
                      <View style={styles.flightAirline}>
                        <Plane size={20} color="#F59E0B" strokeWidth={2.5} />
                        <Text style={styles.flightAirlineName}>{flight.airline}</Text>
                      </View>
                      <View style={styles.flightClassBadge}>
                        <Text style={styles.flightClassText}>{flight.seatClass}</Text>
                      </View>
                    </View>

                    <View style={styles.flightRoute}>
                      <View style={styles.flightPoint}>
                        <Text style={styles.flightTime}>{flight.departureTime}</Text>
                        <Text style={styles.flightAirport}>{flight.departureAirport}</Text>
                      </View>
                      
                      <View style={styles.flightDuration}>
                        <View style={styles.flightLine} />
                        <Text style={styles.flightDurationText}>{flight.duration}</Text>
                      </View>

                      <View style={styles.flightPoint}>
                        <Text style={styles.flightTime}>{flight.arrivalTime}</Text>
                        <Text style={styles.flightAirport}>{flight.arrivalAirport}</Text>
                      </View>
                    </View>

                    <View style={styles.flightFooter}>
                      <View>
                        <Text style={styles.priceLabel}>ราคา</Text>
                        <Text style={styles.priceValue}>
                          ฿{flight.price.toLocaleString()}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.selectFlightButton}
                        onPress={() => handleSelectFlight(flight)}
                      >
                        <Text style={styles.selectFlightText}>เลือก</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={() => handleSelectFlight(null)}
                >
                  <Text style={styles.skipButtonText}>ข้ามการเลือกเที่ยวบิน</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* STEP 5: Choose Restaurant (NEW) */}
        {step === 5 && selectedOption && (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <View style={styles.stepIconContainer}>
                <UtensilsCrossed size={28} color="#10B981" strokeWidth={2.5} />
              </View>
              <View style={styles.stepHeaderText}>
                <Text style={styles.stepTitle}>เลือกร้านอาหาร</Text>
                <Text style={styles.stepDescription}>
                  พบ {restaurants.length} ร้านอาหารใน {selectedOption.destination}
                </Text>
              </View>
            </View>

            {restaurants.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🍽️</Text>
                <Text style={styles.emptyTitle}>ไม่พบร้านอาหาร</Text>
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={() => handleSelectRestaurant(null)}
                >
                  <Text style={styles.skipButtonText}>ข้ามขั้นตอนนี้</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {restaurants.map((restaurant, index) => (
                  <View key={index} style={styles.restaurantCard}>
                    <Image
                      source={{ uri: restaurant.imageUrl }}
                      style={styles.restaurantImage}
                      resizeMode="cover"
                    />
                    <View style={styles.restaurantContent}>
                      <View style={styles.restaurantHeader}>
                        <Text style={styles.restaurantName}>{restaurant.name}</Text>
                        {restaurant.rating > 0 && (
                          <View style={styles.ratingBadge}>
                            <Star size={12} color="#F59E0B" fill="#F59E0B" strokeWidth={0} />
                            <Text style={styles.ratingText}>{restaurant.rating.toFixed(1)}</Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.restaurantInfo}>
                        <View style={styles.restaurantCuisine}>
                          <Text style={styles.cuisineText}>{restaurant.cuisine}</Text>
                        </View>
                        <Text style={styles.restaurantPriceRange}>{restaurant.priceRange}</Text>
                      </View>

                      <Text style={styles.restaurantDescription} numberOfLines={2}>
                        {restaurant.description}
                      </Text>

                      <View style={styles.restaurantFooter}>
                        <View style={styles.restaurantLocation}>
                          <MapPin size={14} color="#64748B" strokeWidth={2} />
                          <Text style={styles.restaurantLocationText} numberOfLines={1}>
                            {restaurant.location}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.selectRestaurantButton}
                          onPress={() => handleSelectRestaurant(restaurant)}
                        >
                          <Text style={styles.selectRestaurantText}>เลือก</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={() => handleSelectRestaurant(null)}
                >
                  <Text style={styles.skipButtonText}>ข้ามการเลือกร้านอาหาร</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* STEP 6: Finalize */}
        {step === 6 && selectedOption && (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <View style={styles.stepIconContainer}>
                <Check size={28} color="#10B981" strokeWidth={2.5} />
              </View>
              <View style={styles.stepHeaderText}>
                <Text style={styles.stepTitle}>ยืนยันการจอง</Text>
                <Text style={styles.stepDescription}>
                  ตรวจสอบและบันทึกทริป
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
                <Text style={styles.summaryTitle}>{selectedOption.destination}</Text>
                <Text style={styles.summarySubtitle}>{selectedOption.country}</Text>
              </LinearGradient>

              <View style={styles.summaryDetails}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>ระยะเวลา</Text>
                  <Text style={styles.summaryValue}>{selectedOption.duration} วัน</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>งบประมาณ</Text>
                  <Text style={styles.summaryValue}>
                    ฿{selectedOption.estimatedBudget.toLocaleString()}
                  </Text>
                </View>
                {selectedHotel && (
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryIconLabel}>
                      <Hotel size={16} color="#0066FF" strokeWidth={2} />
                      <Text style={styles.summaryLabel}>โรงแรม</Text>
                    </View>
                    <Text style={styles.summaryValue}>{selectedHotel.name}</Text>
                  </View>
                )}
                {selectedFlight && (
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryIconLabel}>
                      <Plane size={16} color="#F59E0B" strokeWidth={2} />
                      <Text style={styles.summaryLabel}>เที่ยวบิน</Text>
                    </View>
                    <Text style={styles.summaryValue}>
                      {selectedFlight.airline} {selectedFlight.flightNumber}
                    </Text>
                  </View>
                )}
                {selectedRestaurant && (
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryIconLabel}>
                      <UtensilsCrossed size={16} color="#10B981" strokeWidth={2} />
                      <Text style={styles.summaryLabel}>ร้านอาหาร</Text>
                    </View>
                    <Text style={styles.summaryValue}>{selectedRestaurant.name}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.formCard}>
              <DatePickerInput
                label="วันเริ่มต้นการเดินทาง"
                value={startDate}
                onChange={setStartDate}
                disabled={loading}
                placeholder="เลือกวันเริ่มต้น"
              />

              <Text style={styles.label}>บันทึกเพิ่มเติม</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <TextInput
                  style={styles.textArea}
                  placeholder="บันทึกเพิ่มเติม..."
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
              style={[styles.primaryButton, styles.successButton, loading && styles.buttonDisabled]}
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
  backButton: {
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
  },
  optionReason: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
    marginBottom: 20,
    fontWeight: "500",
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
  },
  optionDetailValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  highlightsContainer: {
    marginBottom: 20,
  },
  highlightsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
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
  },
  selectButton: {
    backgroundColor: "#0066FF",
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  selectButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  hotelCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  hotelImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#F1F5F9",
  },
  hotelContent: {
    padding: 16,
  },
  hotelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  hotelName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginRight: 8,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#F59E0B",
  },
  hotelDescription: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
    marginBottom: 12,
    fontWeight: "500",
  },
  hotelFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  priceLabel: {
    fontSize: 11,
    color: "#94A3B8",
    marginBottom: 4,
    fontWeight: "600",
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#EF4444",
  },
  selectHotelButton: {
    backgroundColor: "#0066FF",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  selectHotelText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  skipButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#64748B",
  },
  // ✨ NEW: Flight Card Styles
  flightCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  flightHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  flightAirline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  flightAirlineName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  flightClassBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  flightClassText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#F59E0B",
  },
  flightRoute: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  flightPoint: {
    flex: 1,
    alignItems: "center",
  },
  flightTime: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  flightAirport: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },
  flightDuration: {
    flex: 1,
    alignItems: "center",
    position: "relative",
  },
  flightLine: {
    width: "100%",
    height: 2,
    backgroundColor: "#E2E8F0",
    position: "absolute",
    top: "50%",
  },
  flightDurationText: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    zIndex: 1,
  },
  flightFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  selectFlightButton: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  selectFlightText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  // ✨ NEW: Restaurant Card Styles
  restaurantCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  restaurantImage: {
    width: "100%",
    height: 180,
    backgroundColor: "#F1F5F9",
  },
  restaurantContent: {
    padding: 16,
  },
  restaurantHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  restaurantName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginRight: 8,
  },
  restaurantInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  restaurantCuisine: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cuisineText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10B981",
  },
  restaurantPriceRange: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F59E0B",
  },
  restaurantDescription: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
    marginBottom: 12,
    fontWeight: "500",
  },
  restaurantFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  restaurantLocation: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginRight: 12,
  },
  restaurantLocationText: {
    flex: 1,
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },
  selectRestaurantButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  selectRestaurantText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  // Summary Card Styles
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
  summaryTitle: {
    fontSize: 24,
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
  },
  summaryDetails: {
    padding: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  summaryIconLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: 16,
    color: "#0F172A",
    fontWeight: "700",
    flex: 1,
    textAlign: "right",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
});