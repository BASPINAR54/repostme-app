import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function Index() {
  return (
    <WebView
      source={{ uri: 'https://repostme.com/login' }}
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
