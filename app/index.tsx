import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExternalLink, Bell } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

export default function Index() {
  const insets = useSafeAreaInsets();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/notifications');
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading]);

  const handleTestNotification = async () => {
    try {
      const { data, error } = await supabase.rpc('test_push_notification', {
        p_title: 'Test Notification',
        p_body: 'Ceci est une notification de test!',
        p_data: { test: true }
      });

      if (error) throw error;

      if (Platform.OS === 'web') {
        alert('Notification envoyée! Vérifiez votre appareil mobile.');
      } else {
        Alert.alert('Succès', 'Notification envoyée!');
      }
    } catch (error) {
      console.error('Erreur:', error);
      if (Platform.OS === 'web') {
        alert('Erreur lors de l\'envoi: ' + (error as Error).message);
      } else {
        Alert.alert('Erreur', (error as Error).message);
      }
    }
  };

  if (loading) {
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
