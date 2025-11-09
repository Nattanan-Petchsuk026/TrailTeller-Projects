import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthStore } from "../store/authStore";
import { getProfile, hasToken } from "../api/auth";

// Screens
import SplashScreen from "../screens/SplashScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import AIChatScreen from "../screens/AIChatScreen";
import TripPlanningScreen from "../screens/TripPlanningScreen";
import ItineraryScreen from "../screens/ItineraryScreen";
import ProfileScreen from "../screens/ProfileScreen";
import MyTripsScreen from "../screens/MyTripsScreen";
import TripDetailScreen from "../screens/TripDetailScreen";
import EditTripScreen from "../screens/EditTripScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import SearchDestinationsScreen from "../screens/SearchDestinationsScreen"; // ✅ เพิ่ม import

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, setUser, setLoading } = useAuthStore();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // แสดง Splash อย่างน้อย 2 วินาที
    const splashTimer = new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const tokenExists = await hasToken();
      if (tokenExists) {
        const response = await getProfile();
        setUser(response.data);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setLoading(false);
    }

    // รอให้ Splash แสดงครบ 2 วินาที
    await splashTimer;
    setShowSplash(false);
  };

  // แสดง Splash Screen ก่อน
  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AIAssistant"
            component={AIChatScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="NewTrip"
            component={TripPlanningScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Itinerary"
            component={ItineraryScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Search"
            component={SearchDestinationsScreen} // ✅ เปลี่ยนเป็นหน้า Search
            options={{ headerShown: false }}
          />
          {/* หน้าทริปทั้งหมด */}
          <Stack.Screen
            name="MyTrips"
            component={MyTripsScreen}
            options={{ headerShown: false }}
          />
          {/* หน้ารายละเอียดทริป */}
          <Stack.Screen
            name="TripDetail"
            component={TripDetailScreen}
            options={{ headerShown: false }}
          />
          {/* หน้าแก้ไขทริป */}
          <Stack.Screen
            name="EditTrip"
            component={EditTripScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Favorites"
            component={FavoritesScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{
              title: "ลงทะเบียน",
              headerBackTitle: "กลับ",
            }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
