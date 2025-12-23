import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const onboardingCompleted = await AsyncStorage.getItem('onboarding_completed');

      // Si l'onboarding n'a jamais été complété, aller sur l'écran d'onboarding
      if (!onboardingCompleted) {
        router.replace('/onboarding');
        return;
      }

      // Sinon, rediriger selon l'état de connexion
      setCheckingOnboarding(false);
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'onboarding:', error);
      setCheckingOnboarding(false);
    }
  };

  useEffect(() => {
    if (!checkingOnboarding) {
      // Aller directement sur la WebView après l'onboarding
      router.replace('/webview');
    }
  }, [checkingOnboarding]);

  if (checkingOnboarding) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={[styles.message, { marginTop: 16 }]}>Chargement...</Text>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 24,
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: '#3b82f6',
    marginBottom: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSafeArea: {
    backgroundColor: '#FFFFFF',
  },
});
