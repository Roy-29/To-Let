import React from 'react';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { getReportById } from '@/services/reportService';
import AdminReportDetail from './AdminReportDetail';
import styles from '../../users/users.module.css';

export default async function AdminReportDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') redirect('/dashboard');

  let report;
  try {
    report = await getReportById(user.id, params.id);
  } catch (e) {
    return <div className={styles.container}><h1>Report Not Found</h1></div>;
  }

  return (
    <div className={styles.container}>
      <AdminReportDetail report={report} />
    </div>
  );
}
