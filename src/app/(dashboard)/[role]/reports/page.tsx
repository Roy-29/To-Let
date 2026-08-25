import React from 'react';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { getReports } from '@/services/reportService';
import AdminReportsList from './AdminReportsList';

export default async function AdminReportsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'ADMIN') redirect(`/${user.role.toLowerCase()}/dashboard`);

  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const status = typeof searchParams.status === 'string' ? searchParams.status : undefined;
  const targetType = typeof searchParams.targetType === 'string' ? searchParams.targetType : undefined;
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;

  const reportsData = await getReports(user.id, { status, targetType, search }, page, 20);

  return <AdminReportsList initialData={reportsData} currentFilters={{ status, targetType, search }} />;
}
