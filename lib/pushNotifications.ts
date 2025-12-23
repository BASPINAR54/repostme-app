import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<
  string | null
> {
  let token = null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10b981',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permission for push notifications denied');
      return null;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

export async function savePushToken(userId: string, pushToken: string) {
  try {
    const { error } = await supabase
      .from('user_push_tokens')
      .upsert(
        {
          user_id: userId,
          push_token: pushToken,
          device_type: Platform.OS,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,push_token',
        }
      );

    if (error) {
      console.error('Error saving push token:', error);
      return false;
    }

    console.log('Push token saved successfully for user:', userId);
    return true;
  } catch (error) {
    console.error('Error saving push token:', error);
    return false;
  }
}

export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: any
) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Error scheduling local notification:', error);
  }
}
