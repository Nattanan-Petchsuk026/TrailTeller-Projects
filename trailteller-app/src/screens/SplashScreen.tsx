import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Plane, Sparkles, MapPin, Globe } from "lucide-react-native";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const loadingWidth = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Main animation sequence
    Animated.sequence([
      // Logo appears with scale and fade
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Subtle rotate animation
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rotate = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <LinearGradient
      colors={["#0066FF", "#0047B3", "#003380"] as const}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      {/* Decorative background elements */}
      <View style={styles.backgroundPattern}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
      </View>

      {/* Floating icons */}
      <Animated.View
        style={[
          styles.floatingIcon,
          styles.icon1,
          { transform: [{ translateY }] },
        ]}
      >
        <View style={styles.iconContainer}>
          <MapPin size={24} color="#FFFFFF" strokeWidth={2} />
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingIcon,
          styles.icon2,
          {
            transform: [
              {
                translateY: floatAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 10],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <Globe size={24} color="#FFFFFF" strokeWidth={2} />
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingIcon,
          styles.icon3,
          { transform: [{ translateY }] },
        ]}
      >
        <View style={styles.iconContainer}>
          <Sparkles size={24} color="#FFFFFF" strokeWidth={2} />
        </View>
      </Animated.View>

      {/* Main content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo with animation */}
        <Animated.View
          style={[styles.logoContainer, { transform: [{ rotate }] }]}
        >
          <View style={styles.logoCircle}>
            <Plane size={56} color="#FFFFFF" strokeWidth={2.5} />
          </View>
        </Animated.View>

        {/* App name */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>TrailTeller</Text>
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitle}>We Plan, You Go.</Text>
          </View>
        </View>

        {/* Loading indicator */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingBar}>
            <Animated.View
              style={[
                styles.loadingProgress,
                {
                  transform: [
                    {
                      scaleX: floatAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 0.7],
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>
          <Text style={styles.loadingText}>กำลังเริ่มต้นการเดินทาง...</Text>
        </View>
      </Animated.View>

      {/* Bottom branding */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by AI</Text>
        <View style={styles.footerDivider} />
        <Text style={styles.footerText}>Travel Smarter</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundPattern: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  circle: {
    position: "absolute",
    borderRadius: 9999,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  circle1: {
    width: width * 1.5,
    height: width * 1.5,
    top: -width * 0.6,
    right: -width * 0.4,
  },
  circle2: {
    width: width * 1.2,
    height: width * 1.2,
    bottom: -width * 0.5,
    left: -width * 0.3,
  },
  circle3: {
    width: width * 0.8,
    height: width * 0.8,
    top: height * 0.3,
    left: -width * 0.2,
  },
  floatingIcon: {
    position: "absolute",
    opacity: 0.3,
  },
  icon1: {
    top: height * 0.15,
    left: width * 0.15,
  },
  icon2: {
    top: height * 0.25,
    right: width * 0.12,
  },
  icon3: {
    bottom: height * 0.2,
    left: width * 0.2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  content: {
    alignItems: "center",
    zIndex: 10,
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  title: {
    fontSize: 42,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -1,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitleContainer: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  subtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    letterSpacing: 1,
    opacity: 0.95,
  },
  loadingContainer: {
    width: width * 0.6,
    alignItems: "center",
  },
  loadingBar: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 16,
  },
  loadingProgress: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
  },
  loadingText: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.8,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  footer: {
    position: "absolute",
    bottom: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  footerText: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.6,
    fontWeight: "600",
    letterSpacing: 1,
  },
  footerDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
});
