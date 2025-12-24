import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export default function Index() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkAuthAndOnboarding();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const checkAuthAndOnboarding = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        router.replace('/notifications');
        return;
      }

      const onboardingCompleted = await AsyncStorage.getItem('onboarding_completed');

      if (onboardingCompleted === 'true') {
        router.replace('/login');
      } else {
        router.replace('/onboarding');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      router.replace('/onboarding');
    } finally {
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});
