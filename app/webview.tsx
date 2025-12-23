import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams } from 'expo-router';

export default function WebViewScreen() {
  const { url } = useLocalSearchParams<{ url: string }>();
  const decodedUrl = url ? decodeURIComponent(url) : 'https://repostme.com/buy?tab=catalogue';

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
});
