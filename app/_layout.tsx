import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { useFrameworkReady } from '../hooks/useFrameworkReady';
import { useAuth } from '../hooks/useAuth';

export default function RootLayout() {
  useFrameworkReady();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        const url = 'https://repostme.com/buy?tab=catalogue';
        router.replace(`/webview?url=${encodeURIComponent(url)}`);
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const url = 'https://repostme.com/buy?tab=catalogue';
        router.push(`/webview?url=${encodeURIComponent(url)}`);
      }
    );

    return () => subscription.remove();
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="notifications" />
        <Stack.Screen
          name="webview"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
