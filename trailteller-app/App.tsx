import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, StatusBar } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <Text style={styles.title}>🧭 TrailTeller</Text>
        <Text style={styles.subtitle}>We Plan, You Go.</Text>
        <Text style={styles.description}>
          Your AI Travel Planner is ready! 🚀
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    color: '#3498db',
    fontStyle: 'italic',
    marginBottom: 32,
  },
  description: {
    fontSize: 18,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});