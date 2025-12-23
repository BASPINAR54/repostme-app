import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExternalLink } from 'lucide-react-native';

export default function Index() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ExternalLink size={64} color="#10b981" />
        <Text style={styles.title}>RepostMe</Text>
        <Text style={styles.message}>
          Redirection vers la page de connexion...
        </Text>
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
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSafeArea: {
    backgroundColor: '#FFFFFF',
  },
});
