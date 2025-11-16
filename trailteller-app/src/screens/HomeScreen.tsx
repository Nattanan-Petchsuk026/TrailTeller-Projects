import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "../store/authStore";
import { logout } from "../api/auth";
import { 
  User, 
  Sparkles,
  MapPin,
  Calendar,
  ChevronRight,
  LogOut,
  Compass,
  Hotel,
  UtensilsCrossed,
  Ticket,
  TrendingUp,
  Bot
} from "lucide-react-native";

interface QuickAction {
  icon: any;
  title: string;
  subtitle: string;
  color: readonly [string, string];
  screen: string;
}

export default function HomeScreen({ navigation }: any) {
  const { user, logout: logoutStore } = useAuthStore();

  const handleLogout = async () => {
    Alert.alert("ออกจากระบบ", "คุณต้องการออกจากระบบหรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ออกจากระบบ",
        style: "destructive",
        onPress: async () => {
          await logout();
          logoutStore();
        },
      },
    ]);
  };

  // 🎯 Main Features - สิ่งที่ผู้ใช้ทำได้
  const mainFeatures: QuickAction[] = [
    {
      icon: Sparkles,
      title: "วางแผนทริปใหม่",
      subtitle: "AI จัดให้ทุกอย่าง",
      color: ["#FF6B6B", "#FF8E53"] as const,
      screen: "NewTrip",
    },
    {
      icon: Calendar,
      title: "ทริปของฉัน",
      subtitle: "ดูและจัดการทริป",
      color: ["#4ECDC4", "#44A08D"] as const,
      screen: "MyTrips",
    },
  ];

  // 🔥 Popular Services
  const popularServices = [
    {
      icon: Hotel,
      title: "ค้นหาโรงแรม",
      subtitle: "ที่พักคุณภาพดี",
      color: "#0066FF",
      screen: "HotelSearch",
    },
    {
      icon: UtensilsCrossed,
      title: "ร้านอาหาร",
      subtitle: "แนะนำร้านดัง",
      color: "#F59E0B",
      onPress: () => Alert.alert("Coming Soon", "ฟีเจอร์นี้กำลังพัฒนา"),
    },
    {
      icon: Ticket,
      title: "กิจกรรม & ทัวร์",
      subtitle: "สำรวจกิจกรรม",
      color: "#8B5CF6",
      onPress: () => Alert.alert("Coming Soon", "ฟีเจอร์นี้กำลังพัฒนา"),
    },
    {
      icon: MapPin,
      title: "แหล่งท่องเที่ยว",
      subtitle: "จุดหมายยอดนิยม",
      color: "#10B981",
      screen: "Search",
    },
  ];

  // 🎨 AI Features
  const aiFeatures = [
    {
      icon: Bot,
      title: "AI ผู้ช่วย",
      subtitle: "คุยกับ AI ตลอด 24 ชม.",
      screen: "AIAssistant",
    },
    {
      icon: Compass,
      title: "แนะนำเส้นทาง",
      subtitle: "ให้ AI วางแผนทริป",
      screen: "Itinerary",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Profile */}
        <LinearGradient
          colors={["#0066FF", "#0047B3"] as const}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>สวัสดี</Text>
              <Text style={styles.userName}>{user?.name || "ผู้ใช้"}</Text>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.navigate("Profile")}
            >
              <User size={24} color="#0066FF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* 🎯 Hero Section - แนะนำฟีเจอร์หลัก */}
          <View style={styles.heroCard}>
            <View style={styles.heroContent}>
              <View style={styles.heroIconContainer}>
                <Sparkles size={28} color="#0066FF" strokeWidth={2.5} />
              </View>
              <View style={styles.heroText}>
                <Text style={styles.heroTitle}>วางแผนทริปใหม่</Text>
                <Text style={styles.heroSubtitle}>
                  ✨ AI จัดการให้ครบ ตั้งแต่โรงแรม กิจกรรม ไปจนถึงการจอง
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.heroButton}
              onPress={() => navigation.navigate("NewTrip")}
            >
              <Text style={styles.heroButtonText}>เริ่มวางแผน</Text>
              <ChevronRight size={18} color="#FFFFFF" strokeWidth={3} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* 🎯 Main Features */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ฟีเจอร์หลัก</Text>
            <View style={styles.trendingBadge}>
              <TrendingUp size={12} color="#10B981" strokeWidth={2.5} />
              <Text style={styles.trendingText}>ยอดนิยม</Text>
            </View>
          </View>
          <View style={styles.mainFeaturesGrid}>
            {mainFeatures.map((feature, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => navigation.navigate(feature.screen)}
                activeOpacity={0.8}
                style={styles.mainFeatureWrapper}
              >
                <LinearGradient
                  colors={feature.color}
                  style={styles.mainFeatureCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.mainFeatureIconContainer}>
                    <feature.icon size={32} color="#FFFFFF" strokeWidth={2.5} />
                  </View>
                  <Text style={styles.mainFeatureTitle}>{feature.title}</Text>
                  <Text style={styles.mainFeatureSubtitle}>
                    {feature.subtitle}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 🔥 บริการยอดนิยม */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>บริการยอดนิยม</Text>
          <View style={styles.servicesGrid}>
            {popularServices.map((service, index) => (
              <TouchableOpacity
                key={index}
                style={styles.serviceCard}
                onPress={() => 
                  service.screen 
                    ? navigation.navigate(service.screen)
                    : service.onPress?.()
                }
                activeOpacity={0.7}
              >
                <View 
                  style={[
                    styles.serviceIconContainer,
                    { backgroundColor: service.color + '15' }
                  ]}
                >
                  <service.icon 
                    size={24} 
                    color={service.color} 
                    strokeWidth={2.5} 
                  />
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceTitle}>{service.title}</Text>
                  <Text style={styles.serviceSubtitle}>
                    {service.subtitle}
                  </Text>
                </View>
                <ChevronRight size={20} color="#CBD5E1" strokeWidth={2} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 🤖 AI Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI ช่วยวางแผน</Text>
          {aiFeatures.map((feature, index) => (
            <TouchableOpacity
              key={index}
              style={styles.aiFeatureCard}
              onPress={() => navigation.navigate(feature.screen)}
            >
              <View style={styles.aiFeatureIconContainer}>
                <feature.icon size={24} color="#0066FF" strokeWidth={2.5} />
              </View>
              <View style={styles.aiFeatureContent}>
                <Text style={styles.aiFeatureTitle}>{feature.title}</Text>
                <Text style={styles.aiFeatureSubtitle}>
                  {feature.subtitle}
                </Text>
              </View>
              <ChevronRight size={24} color="#CBD5E1" strokeWidth={2} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Spacer for bottom */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Logout Button */}
      <TouchableOpacity style={styles.floatingLogout} onPress={handleLogout}>
        <LogOut size={24} color="#FFFFFF" strokeWidth={2.5} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  headerGradient: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  userName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 4,
    letterSpacing: -0.5,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  heroCard: {
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  heroContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  heroIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  heroButton: {
    backgroundColor: "#0066FF",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0066FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  heroButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 8,
    letterSpacing: -0.2,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  trendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  trendingText: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "600",
  },
  mainFeaturesGrid: {
    flexDirection: "row",
    gap: 12,
  },
  mainFeatureWrapper: {
    flex: 1,
  },
  mainFeatureCard: {
    borderRadius: 16,
    padding: 20,
    minHeight: 160,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  mainFeatureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  mainFeatureTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  mainFeatureSubtitle: {
    fontSize: 13,
    color: "#FFFFFF",
    opacity: 0.95,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  servicesGrid: {
    gap: 12,
  },
  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  serviceSubtitle: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  aiFeatureCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  aiFeatureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  aiFeatureContent: {
    flex: 1,
  },
  aiFeatureTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  aiFeatureSubtitle: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  floatingLogout: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});