export type NotificationChannel = "email" | "push";

export interface NotificationResource {
  resource_type: string;
  resource_id: string;
}

export interface Notification {
  identifier: string;
  subject: string;
  body: string;
  channel: NotificationChannel;
  created_at: string;
  read: boolean;
  resource: NotificationResource | null;
}

export interface PaginatedNotifications {
  data: Notification[];
  total: number;
  limit: number;
  offset: number;
}