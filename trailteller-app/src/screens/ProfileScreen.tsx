import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from "@react-navigation/native";
import { useAuthStore } from "../store/authStore";
import { logout } from "../api/auth";
import { getTripStats, TripStats } from "../api/trips";
import {
  ChevronLeft,
  User,
  Wallet,
  Star,
  Edit3,
  Calendar,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
  MapPin,
  TrendingUp,
  Info
} from 'lucide-react-native';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout: logoutStore } = useAuthStore();
  const [stats, setStats] = useState<TripStats | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await getTripStats();
      setStats(response.data);
    } catch (error) {
      console.error("Load stats error:", error);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
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
          <Text style={styles.headerTitle}>โปรไฟล์</Text>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Avatar */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#0066FF', '#0047B3'] as const}
              style={styles.avatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <User size={48} color="#FFFFFF" strokeWidth={2.5} />
            </LinearGradient>
          </View>
          <Text style={styles.name}>{user?.name || "ผู้ใช้"}</Text>
          <Text style={styles.email}>{user?.email || "ไม่มีอีเมล"}</Text>
        </View>

        {/* Stats */}
        {loading ? (
          <View style={styles.statsContainer}>
            <ActivityIndicator size="large" color="#0066FF" />
          </View>
        ) : (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Calendar size={24} color="#0066FF" strokeWidth={2.5} />
              </View>
              <Text style={styles.statNumber}>{stats?.totalTrips || 0}</Text>
              <Text style={styles.statLabel}>ทริปทั้งหมด</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <MapPin size={24} color="#10B981" strokeWidth={2.5} />
              </View>
              <Text style={styles.statNumber}>
                {stats?.countriesVisited || 0}
              </Text>
              <Text style={styles.statLabel}>ประเทศที่เยือน</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Heart size={24} color="#EF4444" strokeWidth={2.5} />
              </View>
              <Text style={styles.statNumber}>
                {stats?.favoriteDestinations?.length || 0}
              </Text>
              <Text style={styles.statLabel}>จุดหมายโปรด</Text>
            </View>
          </View>
        )}

        {/* Budget Card */}
        {!loading && stats && stats.totalBudget > 0 && (
          <View style={styles.budgetCard}>
            <LinearGradient
              colors={['#10B981', '#059669'] as const}
              style={styles.budgetGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.budgetIconContainer}>
                <Wallet size={28} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <View style={styles.budgetContent}>
                <Text style={styles.budgetLabel}>งบประมาณรวมทั้งหมด</Text>
                <Text style={styles.budgetAmount}>
                  ฿{stats.totalBudget.toLocaleString('th-TH')}
                </Text>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Favorite Destinations */}
        {!loading && stats && stats.favoriteDestinations.length > 0 && (
          <View style={styles.favoritesSection}>
            <View style={styles.sectionHeader}>
              <Star size={20} color="#F59E0B" fill="#F59E0B" strokeWidth={0} />
              <Text style={styles.sectionTitle}>จุดหมายที่คุณชอบ</Text>
            </View>
            {stats.favoriteDestinations.map((item, index) => (
              <View key={index} style={styles.favoriteItem}>
                <View style={styles.favoriteRank}>
                  <TrendingUp size={14} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={styles.favoriteRankText}>{index + 1}</Text>
                </View>
                <View style={styles.favoriteContent}>
                  <Text style={styles.favoriteDestination}>
                    {item.destination}
                  </Text>
                  <Text style={styles.favoriteCount}>{item.count} ครั้ง</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <View style={styles.menuIconContainer}>
              <Edit3 size={20} color="#0066FF" strokeWidth={2.5} />
            </View>
            <Text style={styles.menuText}>แก้ไขโปรไฟล์</Text>
            <ChevronRight size={20} color="#94A3B8" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("MyTrips")}
          >
            <View style={styles.menuIconContainer}>
              <Calendar size={20} color="#0066FF" strokeWidth={2.5} />
            </View>
            <Text style={styles.menuText}>ทริปของฉัน</Text>
            <ChevronRight size={20} color="#94A3B8" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("Favorites")}
          >
            <View style={styles.menuIconContainer}>
              <Heart size={20} color="#EF4444" strokeWidth={2.5} />
            </View>
            <Text style={styles.menuText}>จุดหมายที่ชื่นชอบ</Text>
            <ChevronRight size={20} color="#94A3B8" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              Alert.alert("Coming Soon", "ฟีเจอร์นี้กำลังพัฒนา");
            }}
          >
            <View style={styles.menuIconContainer}>
              <Settings size={20} color="#64748B" strokeWidth={2.5} />
            </View>
            <Text style={styles.menuText}>การตั้งค่า</Text>
            <ChevronRight size={20} color="#94A3B8" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LinearGradient
            colors={['#EF4444', '#DC2626'] as const}
            style={styles.logoutGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <LogOut size={20} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.logoutText}>ออกจากระบบ</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Info size={14} color="#94A3B8" strokeWidth={2} />
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

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
    paddingBottom: 16,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.4,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  avatarContainer: {
    marginBottom: 16,
    shadowColor: "#0066FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  email: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    textAlign: "center",
  },
  budgetCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  budgetGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  budgetIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  budgetContent: {
    flex: 1,
  },
  budgetLabel: {
    fontSize: 13,
    color: "#FFFFFF",
    marginBottom: 6,
    fontWeight: "600",
    opacity: 0.9,
  },
  budgetAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  favoritesSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  favoriteItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  favoriteRank: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0066FF",
    marginRight: 12,
    gap: 4,
  },
  favoriteRankText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  favoriteContent: {
    flex: 1,
  },
  favoriteDestination: {
    fontSize: 15,
    color: "#0F172A",
    fontWeight: "600",
    marginBottom: 2,
  },
  favoriteCount: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  menuSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    color: "#0F172A",
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  logoutButton: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  versionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingBottom: 20,
  },
  version: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "500",
  },
});