import React from 'react';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import NotificationsList from './NotificationsList';

export default async function NotificationsPage({ searchParams }: { searchParams: { page?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const page = searchParams.page ? parseInt(searchParams.page) : 1;

  return <NotificationsList userId={user.id} page={page} />;
}
