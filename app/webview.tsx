import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, Platform, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { savePushToken } from '../lib/pushNotifications';

export default function WebViewScreen() {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAndSendPushToken();
  }, []);

  const checkAndSendPushToken = async () => {
    const pendingToken = await AsyncStorage.getItem('pending_push_token');
    if (pendingToken) {
      console.log('Push token en attente:', pendingToken);
    }
  };

  const handleMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Message reçu de la WebView:', data);

      if (data.type === 'USER_LOGGED_IN' && data.userId) {
        console.log('Utilisateur connecté, ID:', data.userId);

        // Récupérer le push token en attente
        const pendingToken = await AsyncStorage.getItem('pending_push_token');

        if (pendingToken) {
          console.log('Enregistrement du push token pour l\'utilisateur...');
          const success = await savePushToken(data.userId, pendingToken);

          if (success) {
            console.log('Push token enregistré avec succès');
            // Supprimer le token en attente
            await AsyncStorage.removeItem('pending_push_token');

            // Notifier la WebView
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
      // Fonction pour envoyer des messages à React Native
      window.sendToNative = function(type, data) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type, ...data }));
      };

      // Écouter les événements de connexion
      // Votre site web devra appeler cette fonction après connexion :
      // window.sendToNative('USER_LOGGED_IN', { userId: 'xxx' });

      console.log('Bridge React Native installé');
    })();
    true;
  `;

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <iframe
          src="https://repostme.com"
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
        source={{ uri: 'https://repostme.com' }}
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
