import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Linking } from "react-native";
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
import SearchDestinationsScreen from "../screens/SearchDestinationsScreen";
import ExpensesScreen from "../screens/ExpensesScreen";
import BookingSummaryScreen from "../screens/BookingSummaryScreen";
import HotelSearchScreen from "../screens/HotelSearchScreen";
import BookingConfirmScreen from "../screens/BookingConfirmScreen";
import FlightSearchScreen from "../screens/FlightSearchScreen";
import RestaurantSearchScreen from "../screens/RestaurantSearchScreen";
import FlightBookingConfirmScreen from "../screens/FlightBookingConfirmScreen";
import RestaurantBookingConfirmScreen from "../screens/RestaurantBookingConfirmScreen";
import PaymentWebViewScreen from "../screens/PaymentWebViewScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, setUser, setLoading } = useAuthStore();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    checkAuth();
    setupDeepLinking();
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

  // ✅ ตั้งค่า Deep Linking สำหรับรับ callback จาก Omise
  const setupDeepLinking = () => {
    // จัดการ Deep Link เมื่อแอพเปิดอยู่
    const handleDeepLink = (event: { url: string }) => {
      console.log('🔗 Deep Link received:', event.url);
      
      if (event.url.includes('payment-success')) {
        console.log('✅ Payment successful via deep link');
        // Navigation จะถูกจัดการโดย PaymentWebViewScreen
      } else if (event.url.includes('payment-cancel')) {
        console.log('❌ Payment cancelled via deep link');
      }
    };

    // ฟัง Deep Link events
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // ตรวจสอบ Deep Link เมื่อแอพเปิดครั้งแรก
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('🔗 Initial URL:', url);
        handleDeepLink({ url });
      }
    });

    // Cleanup
    return () => {
      subscription.remove();
    };
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
            component={SearchDestinationsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MyTrips"
            component={MyTripsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="TripDetail"
            component={TripDetailScreen}
            options={{ headerShown: false }}
          />
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
          <Stack.Screen
            name="Expenses"
            component={ExpensesScreen}
            options={{ headerShown: false }}
          />

          {/* ✅ Hotel Booking Screens */}
          <Stack.Screen
            name="HotelSearch"
            component={HotelSearchScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="BookingConfirm"
            component={BookingConfirmScreen}
            options={{ headerShown: false }}
          />

          {/* ✅ Flight Booking Screens */}
          <Stack.Screen
            name="FlightSearch"
            component={FlightSearchScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="FlightBookingConfirm"
            component={FlightBookingConfirmScreen}
            options={{ headerShown: false }}
          />

          {/* ✅ Restaurant Booking Screens */}
          <Stack.Screen
            name="RestaurantSearch"
            component={RestaurantSearchScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="RestaurantBookingConfirm"
            component={RestaurantBookingConfirmScreen}
            options={{ headerShown: false }}
          />

          {/* ✅ Booking Summary Screen */}
          <Stack.Screen
            name="BookingSummary"
            component={BookingSummaryScreen}
            options={{ headerShown: false }}
          />

          {/* ✅ NEW: Payment WebView Screen (Modal) */}
          <Stack.Screen
            name="PaymentWebView"
            component={PaymentWebViewScreen}
            options={{
              headerShown: false,
              presentation: 'modal', // เปิดแบบ Modal
              gestureEnabled: false, // ปิดการ swipe ลง
            }}
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
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}