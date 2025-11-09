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
  Plane, 
  MessageCircle, 
  Calendar, 
  MapPin, 
  User, 
  Sparkles,
  Star,
  ChevronRight,
  LogOut,
  TrendingUp,
  ListChecks,
  Bot
} from "lucide-react-native";

interface QuickAction {
  icon: any;
  title: string;
  subtitle: string;
  color: readonly [string, string];
  screen: string;
}

interface Destination {
  id: string;
  name: string;
  country: string;
  icon: string;
  price: string;
  rating: number;
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

  const quickActions: QuickAction[] = [
    {
      icon: Plane,
      title: "วางแผนทริป",
      subtitle: "เริ่มต้นการผจญภัย",
      color: ["#FF6B6B", "#FF8E53"] as const,
      screen: "NewTrip",
    },
    {
      icon: Bot,
      title: "ถาม AI",
      subtitle: "คำแนะนำจาก AI",
      color: ["#4ECDC4", "#44A08D"] as const,
      screen: "AIAssistant",
    },
    {
      icon: Calendar,
      title: "ทริปของฉัน",
      subtitle: "ดูทริปที่บันทึกไว้",
      color: ["#FFB84D", "#F59E0B"] as const,
      screen: "MyTrips",
    },
    {
      icon: MapPin,
      title: "ค้นหาจุดหมาย",
      subtitle: "สำรวจสถานที่ใหม่",
      color: ["#A78BFA", "#8B5CF6"] as const,
      screen: "Search",
    },
  ];

  const recommendedDestinations: Destination[] = [
    { id: "1", name: "โตเกียว", country: "ญี่ปุ่น", icon: "🗼", price: "35,000", rating: 4.9 },
    { id: "2", name: "บาหลี", country: "อินโดนีเซีย", icon: "🏖️", price: "25,000", rating: 4.8 },
    { id: "3", name: "เชียงใหม่", country: "ไทย", icon: "⛰️", price: "8,000", rating: 4.7 },
    { id: "4", name: "โซล", country: "เกาหลีใต้", icon: "🏙️", price: "30,000", rating: 4.8 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Profile - Agoda Style */}
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

          {/* AI Assistant Card - Inside Header */}
          <View style={styles.aiCard}>
            <View style={styles.aiCardContent}>
              <View style={styles.aiIconContainer}>
                <Sparkles size={24} color="#0066FF" strokeWidth={2.5} />
              </View>
              <View style={styles.aiCardText}>
                <Text style={styles.aiCardTitle}>AI ผู้ช่วยท่องเที่ยว</Text>
                <Text style={styles.aiCardSubtitle}>
                  พร้อมช่วยวางแผนทริปในฝันของคุณ
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.aiCardButton}
              onPress={() => navigation.navigate("NewTrip")}
            >
              <Text style={styles.aiCardButtonText}>เริ่มวางแผน</Text>
              <ChevronRight size={18} color="#FFFFFF" strokeWidth={3} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ฟีเจอร์หลัก</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => navigation.navigate(action.screen)}
                activeOpacity={0.8}
                style={styles.quickActionWrapper}
              >
                <LinearGradient
                  colors={action.color}
                  style={styles.quickActionCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.quickActionIconContainer}>
                    <action.icon size={28} color="#FFFFFF" strokeWidth={2.5} />
                  </View>
                  <Text style={styles.quickActionTitle}>{action.title}</Text>
                  <Text style={styles.quickActionSubtitle}>
                    {action.subtitle}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recommended Destinations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>จุดหมายยอดนิยม</Text>
              <Text style={styles.sectionSubtitle}>โปรโมชั่นและข้อเสนอพิเศษ</Text>
            </View>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => navigation.navigate("Search")}
            >
              <Text style={styles.seeAllText}>ดูทั้งหมด</Text>
              <ChevronRight size={16} color="#0066FF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.destinationsScroll}
          >
            {recommendedDestinations.map((dest) => (
              <TouchableOpacity
                key={dest.id}
                style={styles.destinationCard}
                onPress={() => {
                  Alert.alert(
                    dest.name,
                    `คุณสนใจเดินทางไป${dest.name}หรือไม่?`,
                    [
                      { text: "ยกเลิก", style: "cancel" },
                      {
                        text: "วางแผนทริป",
                        onPress: () => navigation.navigate("NewTrip"),
                      },
                    ]
                  );
                }}
              >
                <View style={styles.destinationImageContainer}>
                  <Text style={styles.destinationEmoji}>{dest.icon}</Text>
                  <View style={styles.ratingBadge}>
                    <Star size={12} color="#FFB84D" fill="#FFB84D" strokeWidth={0} />
                    <Text style={styles.ratingBadgeText}>{dest.rating}</Text>
                  </View>
                </View>
                <View style={styles.destinationInfo}>
                  <Text style={styles.destinationName}>{dest.name}</Text>
                  <View style={styles.destinationLocationRow}>
                    <MapPin size={12} color="#64748B" strokeWidth={2} />
                    <Text style={styles.destinationCountry}>{dest.country}</Text>
                  </View>
                  <View style={styles.destinationFooter}>
                    <View>
                      <Text style={styles.priceLabel}>เริ่มต้น</Text>
                      <Text style={styles.destinationPrice}>
                        ฿{dest.price}
                      </Text>
                    </View>
                    <View style={styles.bookButton}>
                      <Text style={styles.bookButtonText}>จอง</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Popular Features */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>บริการของเรา</Text>
            <View style={styles.trendingBadge}>
              <TrendingUp size={12} color="#10B981" strokeWidth={2.5} />
              <Text style={styles.trendingText}>ยอดนิยม</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate("Itinerary")}
          >
            <View style={styles.featureIconContainer}>
              <ListChecks size={24} color="#0066FF" strokeWidth={2.5} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>สร้างแผนการเดินทาง</Text>
              <Text style={styles.featureSubtitle}>
                AI จะช่วยสร้างแผนวันต่อวันให้คุณ
              </Text>
            </View>
            <ChevronRight size={24} color="#CBD5E1" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate("AIAssistant")}
          >
            <View style={styles.featureIconContainer}>
              <MessageCircle size={24} color="#0066FF" strokeWidth={2.5} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>คุยกับ AI ผู้ช่วย</Text>
              <Text style={styles.featureSubtitle}>
                ถามคำถามเกี่ยวกับการท่องเที่ยว
              </Text>
            </View>
            <ChevronRight size={24} color="#CBD5E1" strokeWidth={2} />
          </TouchableOpacity>
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
  aiCard: {
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  aiCardContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  aiIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  aiCardText: {
    flex: 1,
  },
  aiCardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  aiCardSubtitle: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  aiCardButton: {
    backgroundColor: "#0066FF",
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0066FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  aiCardButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginRight: 6,
    letterSpacing: -0.2,
  },
  section: {
    marginBottom: 32,
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
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
    marginTop: 4,
    letterSpacing: 0.1,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  seeAllText: {
    fontSize: 14,
    color: "#0066FF",
    fontWeight: "600",
    letterSpacing: -0.1,
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
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  quickActionWrapper: {
    width: "50%",
    padding: 6,
  },
  quickActionCard: {
    borderRadius: 16,
    padding: 20,
    minHeight: 140,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.95,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  destinationsScroll: {
    paddingRight: 20,
  },
  destinationCard: {
    width: 260,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginRight: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  destinationImageContainer: {
    height: 160,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  destinationEmoji: {
    fontSize: 72,
  },
  ratingBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.1,
  },
  destinationInfo: {
    padding: 16,
  },
  destinationName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  destinationLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 14,
  },
  destinationCountry: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  destinationFooter: {
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
    marginBottom: 3,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  destinationPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#EF4444",
    letterSpacing: -0.5,
  },
  bookButton: {
    backgroundColor: "#0066FF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: "#0066FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  featureCard: {
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
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  featureSubtitle: {
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