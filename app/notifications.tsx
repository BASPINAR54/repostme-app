import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ShoppingBag, LogOut, Bell, BellRing } from 'lucide-react-native';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { scheduleLocalNotification, registerForPushNotificationsAsync, savePushToken } from '../lib/pushNotifications';
import { NotificationCard } from '../components/NotificationCard';
import { EmptyState } from '../components/EmptyState';
import { PlatformNotification } from '../types';
import { router } from 'expo-router';

export default function NotificationsScreen() {
  const { user, signOut } = useAuth();
  const [notifications, setNotifications] = useState<PlatformNotification[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.is_read).length || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as PlatformNotification;

          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);

          scheduleLocalNotification(
            newNotification.title,
            newNotification.message,
            { notificationId: newNotification.id }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotifications();
  }, [user]);

  const handleNotificationPress = async (notification: PlatformNotification) => {
    if (!notification.is_read) {
      try {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notification.id);

        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    const actionUrl = notification.data?.action_url || getDefaultUrl(notification.type);
    router.push(`/webview?url=${encodeURIComponent(actionUrl)}`);
  };

  const getDefaultUrl = (type: string): string => {
    switch (type) {
      case 'proposal_received':
        return 'https://repostme.com/sell?tab=offres';
      case 'mission_accepted':
        return 'https://repostme.com/sell?tab=missions';
      case 'mission_deadline_24h':
        return 'https://repostme.com/sell?tab=missions&status=active';
      case 'buyer_contested_order':
        return 'https://repostme.com/sell?tab=missions&status=contested';
      case 'mission_completed':
        return 'https://repostme.com/sell?tab=mes-comptes';
      default:
        return 'https://repostme.com/buy?tab=catalogue';
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleRequestPermissions = async () => {
    try {
      console.log('=== DÉBUT DEMANDE PERMISSIONS ===');
      const pushToken = await registerForPushNotificationsAsync();
      console.log('Token reçu:', pushToken);

      if (pushToken && user?.id) {
        const saved = await savePushToken(user.id, pushToken);
        console.log('Token enregistré:', saved);

        Alert.alert(
          'Permissions accordées!',
          `Token enregistré: ${pushToken.substring(0, 30)}...`,
          [{ text: 'OK' }]
        );
      } else {
        console.log('Pas de token ou pas d\'utilisateur');
        Alert.alert(
          'Erreur',
          'Impossible d\'obtenir le token. Vérifiez les permissions dans Réglages → Notifications.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Erreur permissions:', error);
      Alert.alert('Erreur', error.message || 'Erreur inconnue', [{ text: 'OK' }]);
    }
  };

  const handleTestNotification = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('test_send_notification', {
        p_user_id: user.id,
        p_title: 'Test de notification',
        p_message: 'Ceci est une notification de test! Si vous la recevez, tout fonctionne correctement.',
      });

      if (error) throw error;

      if (data.success) {
        Alert.alert(
          'Notification envoyée!',
          'Vérifiez votre appareil. La notification devrait arriver dans quelques secondes.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Erreur', data.error || 'Impossible d\'envoyer la notification', [
          { text: 'OK' },
        ]);
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'envoi de la notification', [
        { text: 'OK' },
      ]);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.logoContainer}>
          <ShoppingBag size={24} color="#10b981" />
        </View>
        <Text style={styles.headerTitle}>RepostMe</Text>
      </View>

      <View style={styles.headerRight}>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.testButton}
          onPress={handleRequestPermissions}
        >
          <BellRing size={20} color="#ef4444" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.testButton}
          onPress={handleTestNotification}
        >
          <Bell size={20} color="#10b981" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationCard
            notification={item}
            onPress={handleNotificationPress}
          />
        )}
        contentContainerStyle={
          notifications.length === 0
            ? styles.emptyContainer
            : styles.listContent
        }
        ListEmptyComponent={<EmptyState />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#10b981"
            colors={['#10b981']}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  testButton: {
    padding: 8,
    marginRight: 4,
  },
  logoutButton: {
    padding: 8,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: 12,
  },
  emptyContainer: {
    flexGrow: 1,
  },
});
