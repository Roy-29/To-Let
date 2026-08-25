import React from 'react';
import { getMyNotifications } from '@/services/notificationService';
import NotificationsListClient from './NotificationsListClient';

export default async function NotificationsList({ userId, page }: { userId: string, page: number }) {
  const { notifications, unreadCount } = await getMyNotifications(userId, page, 50);

  return <NotificationsListClient notifications={notifications} unreadCount={unreadCount} />;
}
