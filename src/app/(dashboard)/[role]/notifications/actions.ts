"use server";

import { markNotificationRead, markAllNotificationsRead } from '@/services/notificationService';
import { getCurrentUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function markNotificationReadAction(notificationId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  await markNotificationRead(notificationId, user.id);
  revalidatePath(`/${user.role.toLowerCase()}/notifications`);
}

export async function markAllNotificationsReadAction() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  await markAllNotificationsRead(user.id);
  revalidatePath(`/${user.role.toLowerCase()}/notifications`);
}
