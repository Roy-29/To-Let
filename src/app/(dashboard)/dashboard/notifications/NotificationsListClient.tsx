"use client";

import React, { useState } from 'react';
import { markNotificationReadAction, markAllNotificationsReadAction } from './actions';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import styles from './notifications.module.css';

export default function NotificationsListClient({ notifications, unreadCount }: { notifications: any[], unreadCount: number }) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleMarkAll() {
    setIsLoading(true);
    try {
      await markAllNotificationsReadAction();
    } catch (err: any) {
      alert(err.message || 'Action failed.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMarkRead(id: string) {
    try {
      await markNotificationReadAction(id);
    } catch (err: any) {
      console.error(err);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Notifications</h1>
          <p className={styles.subtitle}>You have {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}.</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAll} disabled={isLoading}>
            Mark All as Read
          </Button>
        )}
      </div>

      <div className={styles.list}>
        {notifications.length > 0 ? (
          notifications.map(n => (
            <Card key={n.id} className={`${styles.notificationCard} ${n.isRead ? styles.read : styles.unread}`}>
              <div className={styles.notificationContent}>
                <div>
                  <h3 className={styles.notificationTitle}>{n.title}</h3>
                  <p className={styles.notificationMessage}>{n.message}</p>
                  <p className={styles.notificationDate}>{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.isRead && (
                  <Button variant="ghost" size="sm" onClick={() => handleMarkRead(n.id)}>
                    Mark as Read
                  </Button>
                )}
              </div>
            </Card>
          ))
        ) : (
          <EmptyState 
            title="All caught up!" 
            description="You don't have any notifications at the moment."
          />
        )}
      </div>
    </div>
  );
}
