import React, { useEffect } from 'react';
import { StyleSheet, Platform, View, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, router } from 'expo-router';
import { ExternalLink, ArrowLeft } from 'lucide-react-native';

export default function WebViewScreen() {
  const { url } = useLocalSearchParams<{ url: string }>();
  const decodedUrl = url ? decodeURIComponent(url) : 'https://repostme.com/buy?tab=catalogue';

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <View style={styles.webHeader}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.webTitle}>RepostMe</Text>
        </View>

        <View style={styles.webContent}>
          <ExternalLink size={48} color="#10b981" />
          <Text style={styles.webMessage}>
            Cette page s'ouvre mieux dans le navigateur
          </Text>
          <TouchableOpacity
            style={styles.openButton}
            onPress={() => window.open(decodedUrl, '_blank')}
          >
            <Text style={styles.openButtonText}>Ouvrir dans un nouvel onglet</Text>
            <ExternalLink size={16} color="#ffffff" style={{ marginLeft: 8 }} />
          </TouchableOpacity>

          <Text style={styles.urlText}>URL: {decodedUrl}</Text>
        </View>
      </View>
    );
  }

  return (
    <WebView
      source={{ uri: decodedUrl }}
      style={styles.webview}
      javaScriptEnabled
      domStorageEnabled
      sharedCookiesEnabled
    />
  );
}

const styles = StyleSheet.create({
  webview: {
    flex: 1,
  },
  webContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  webHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  webTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  webContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  webMessage: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1f2937',
    marginTop: 24,
    marginBottom: 32,
    textAlign: 'center',
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 24,
  },
  openButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  urlText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    maxWidth: 400,
  },
});
