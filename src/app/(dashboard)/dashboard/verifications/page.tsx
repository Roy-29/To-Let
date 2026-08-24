import React from 'react';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { getPendingVerifications } from '@/services/verificationService';
import AdminVerificationsList from './AdminVerificationsList';

export default async function AdminVerificationsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') redirect('/dashboard');

  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const verificationsData = await getPendingVerifications(user.id, page, 20);

  return <AdminVerificationsList initialData={verificationsData} />;
}
