import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Bell, Check } from 'lucide-react-native';
import { registerForPushNotificationsAsync } from '../lib/pushNotifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OnboardingScreen() {
  const [loading, setLoading] = useState(false);

  const handleEnableNotifications = async () => {
    try {
      setLoading(true);

      // Demander les permissions
      const token = await registerForPushNotificationsAsync();

      if (token) {
        // Marquer l'onboarding comme terminé
        await AsyncStorage.setItem('onboarding_completed', 'true');

        // Rediriger vers login ou notifications selon l'état de connexion
        router.replace('/');
      } else {
        Alert.alert(
          'Permissions refusées',
          'Vous pouvez toujours activer les notifications plus tard dans les réglages.'
        );

        // Marquer comme terminé quand même
        await AsyncStorage.setItem('onboarding_completed', 'true');
        router.replace('/');
      }
    } catch (error) {
      console.error('Erreur lors de l\'activation des notifications:', error);
      Alert.alert('Erreur', 'Impossible d\'activer les notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    // Marquer comme terminé
    await AsyncStorage.setItem('onboarding_completed', 'true');
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Bell size={80} color="#10b981" strokeWidth={1.5} />
        </View>

        <Text style={styles.title}>Bienvenue sur RepostMe</Text>

        <Text style={styles.description}>
          Recevez des notifications instantanées pour tous vos reposts et mises à jour importantes.
        </Text>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Check size={20} color="#10b981" />
            <Text style={styles.featureText}>Notifications en temps réel</Text>
          </View>
          <View style={styles.feature}>
            <Check size={20} color="#10b981" />
            <Text style={styles.featureText}>Suivi de vos reposts</Text>
          </View>
          <View style={styles.feature}>
            <Check size={20} color="#10b981" />
            <Text style={styles.featureText}>Mises à jour instantanées</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.enableButton]}
          onPress={handleEnableNotifications}
          disabled={loading}
        >
          <Bell size={20} color="#ffffff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>
            {loading ? 'Activation...' : 'Activer les notifications'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.skipButton]}
          onPress={handleSkip}
          disabled={loading}
        >
          <Text style={styles.skipButtonText}>Plus tard</Text>
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
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  features: {
    width: '100%',
    marginBottom: 40,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    fontWeight: '500',
  },
  button: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  enableButton: {
    backgroundColor: '#10b981',
  },
  skipButton: {
    backgroundColor: 'transparent',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  skipButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
});
