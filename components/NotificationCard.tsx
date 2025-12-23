import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell, CheckCircle, AlertCircle } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PlatformNotification } from '../types';

interface NotificationCardProps {
  notification: PlatformNotification;
  onPress: (notification: PlatformNotification) => void;
}

export function NotificationCard({
  notification,
  onPress,
}: NotificationCardProps) {
  const getIcon = () => {
    switch (notification.type) {
      case 'mission_completed':
        return <CheckCircle size={24} color="#10b981" />;
      case 'buyer_contested_order':
      case 'mission_deadline_24h':
        return <AlertCircle size={24} color="#ef4444" />;
      default:
        return <Bell size={24} color="#10b981" />;
    }
  };

  const getTimeAgo = () => {
    try {
      return formatDistanceToNow(new Date(notification.created_at), {
        addSuffix: true,
        locale: fr,
      });
    } catch {
      return 'récemment';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !notification.is_read && styles.unreadContainer,
      ]}
      onPress={() => onPress(notification)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>{getIcon()}</View>

      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {notification.title}
          </Text>
          {!notification.is_read && <View style={styles.unreadDot} />}
        </View>

        <Text style={styles.message} numberOfLines={2}>
          {notification.message}
        </Text>

        <Text style={styles.time}>{getTimeAgo()}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadContainer: {
    backgroundColor: '#f0fdf4',
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  message: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
    color: '#9ca3af',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginLeft: 8,
  },
});
