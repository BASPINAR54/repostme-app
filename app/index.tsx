import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Index() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: 'https://repostme.com/login' }}
        style={styles.webview}
        backgroundColor="#FFFFFF"
        contentInsetAdjustmentBehavior="automatic"
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
      />
      <View style={[styles.bottomSafeArea, { height: insets.bottom }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webview: {
    flex: 1,
  },
  bottomSafeArea: {
    backgroundColor: '#FFFFFF',
  },
});
