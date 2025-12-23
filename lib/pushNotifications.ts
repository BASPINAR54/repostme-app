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

  console.log('=== Début registerForPushNotificationsAsync ===');
  console.log('Platform.OS:', Platform.OS);
  console.log('Device.isDevice:', Device.isDevice);

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10b981',
    });
  }

  // TOUJOURS demander les permissions, même si Device.isDevice est false
  console.log('Vérification des permissions...');
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  console.log('Status actuel:', existingStatus);
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    console.log('Demande de permissions...');
    const { status } = await Notifications.requestPermissionsAsync();
    console.log('Permissions accordées:', status);
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Permission for push notifications denied');
    return null;
  }

  console.log('Récupération du token...');
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    token = tokenData.data;
    console.log('Token obtenu:', token);
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
    return null;
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
