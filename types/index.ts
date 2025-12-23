export interface User {
  id: string;
  email: string;
  username?: string;
  role: string;
}

export interface Profile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
}

export interface PlatformNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: {
    action_url?: string;
    [key: string]: any;
  };
  is_read: boolean;
  created_at: string;
}

export interface UserPushToken {
  id: string;
  user_id: string;
  push_token: string;
  device_type: string;
  created_at: string;
  updated_at: string;
}

export type NotificationType =
  | 'proposal_received'
  | 'mission_accepted'
  | 'mission_deadline_24h'
  | 'buyer_contested_order'
  | 'mission_completed';
