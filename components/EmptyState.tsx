import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Bell, ExternalLink } from 'lucide-react-native';

export function EmptyState() {
  const handleOpenWebsite = async () => {
    try {
      const url = 'https://repostme.com/sell';
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Bell size={64} color="#d1d5db" />
      </View>
      <Text style={styles.title}>Aucune notification</Text>
      <Text style={styles.message}>
        Vous recevrez ici toutes vos notifications de missions
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleOpenWebsite}>
        <ExternalLink size={18} color="#10b981" />
        <Text style={styles.buttonText}>Accéder à RepostMe</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
});
