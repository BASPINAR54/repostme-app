import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { registerForPushNotificationsAsync } from '../lib/pushNotifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OnboardingScreen() {
  const [loading, setLoading] = useState(false);

  const handleEnableNotifications = async () => {
    try {
      setLoading(true);

      const token = await registerForPushNotificationsAsync();

      if (token) {
        await AsyncStorage.setItem('pending_push_token', token);
      }

      await AsyncStorage.setItem('onboarding_completed', 'true');

      router.replace('/login');
    } catch (error) {
      console.error('Erreur lors de l\'activation des notifications:', error);
      await AsyncStorage.setItem('onboarding_completed', 'true');
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Bell size={100} color="#10b981" strokeWidth={1.5} />
        </View>

        <Text style={styles.title}>Soyez notifié instantanément</Text>
        <Text style={styles.description}>
          Recevez les notifications de nouvelles missions, validations et mises à jour importantes.
        </Text>

        <TouchableOpacity
          style={styles.enableButton}
          onPress={handleEnableNotifications}
          disabled={loading}
        >
          <Bell size={20} color="#ffffff" style={styles.buttonIcon} />
          <Text style={styles.enableButtonText}>
            {loading ? 'Activation...' : 'Activer les notifications'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#10b981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 17,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
    marginBottom: 48,
  },
  enableButton: {
    flexDirection: 'row',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonIcon: {
    marginRight: 10,
  },
  enableButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
});
