import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, Platform, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { savePushToken, registerForPushNotificationsAsync } from '../lib/pushNotifications';

export default function WebViewScreen() {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializePushNotifications();
  }, []);

  const initializePushNotifications = async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        await AsyncStorage.setItem('pending_push_token', token);
        console.log('Push token obtenu:', token);
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des notifications:', error);
    }
  };

  const handleMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Message reçu de la WebView:', data);

      if (data.type === 'USER_LOGGED_IN' && data.userId) {
        console.log('Utilisateur connecté, ID:', data.userId);

        const pendingToken = await AsyncStorage.getItem('pending_push_token');

        if (pendingToken) {
          console.log('Enregistrement du push token pour l\'utilisateur...');
          const success = await savePushToken(data.userId, pendingToken);

          if (success) {
            console.log('Push token enregistré avec succès');
            await AsyncStorage.removeItem('pending_push_token');

            webViewRef.current?.postMessage(
              JSON.stringify({
                type: 'PUSH_TOKEN_REGISTERED',
                success: true,
              })
            );
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du traitement du message:', error);
    }
  };

  const injectedJavaScript = `
    (function() {
      window.sendToNative = function(type, data) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type, ...data }));
      };

      console.log('Bridge React Native installé');
    })();
    true;
  `;

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <iframe
          src="https://repostme.com/buy?tab=catalogue"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: 'https://repostme.com/buy?tab=catalogue' }}
        style={styles.webview}
        onMessage={handleMessage}
        injectedJavaScript={injectedJavaScript}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10b981" />
          </View>
        )}
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});
