import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Bell } from 'lucide-react-native';

export function EmptyState() {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Bell size={64} color="#d1d5db" />
      </View>
      <Text style={styles.title}>Aucune notification</Text>
      <Text style={styles.message}>
        Vous recevrez ici toutes vos notifications de missions
      </Text>
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
  },
});
