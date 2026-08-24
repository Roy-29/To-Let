import React from 'react';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { getAuditLogs } from '@/services/auditService';
import AdminAuditList from './AdminAuditList';

export default async function AdminAuditPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') redirect('/dashboard');

  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const action = typeof searchParams.action === 'string' ? searchParams.action : undefined;
  const entityType = typeof searchParams.entityType === 'string' ? searchParams.entityType : undefined;

  const logsData = await getAuditLogs(user.id, { action, entityType }, page, 50);

  return <AdminAuditList initialData={logsData} currentFilters={{ action, entityType }} />;
}
