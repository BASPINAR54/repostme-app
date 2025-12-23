import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExternalLink, Bell } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

export default function Index() {
  const insets = useSafeAreaInsets();

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

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ExternalLink size={64} color="#10b981" />
        <Text style={styles.title}>RepostMe</Text>
        <Text style={styles.message}>
          Redirection vers la page de connexion...
        </Text>

        <TouchableOpacity
          style={[styles.button, styles.testButton]}
          onPress={handleTestNotification}
        >
          <Bell size={20} color="#ffffff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Tester Notification</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            if (Platform.OS === 'web') {
              window.location.href = 'https://repostme.com/login';
            }
          }}
        >
          <Text style={styles.buttonText}>Ouvrir RepostMe</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.bottomSafeArea, { height: insets.bottom }]} />
    </View>
  );
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
