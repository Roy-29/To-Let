import React from 'react';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import TenantDashboard from './TenantDashboard';
import LandlordDashboard from './LandlordDashboard';
import AdminDashboard from './AdminDashboard';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  if (user.role === 'TENANT') {
    return <TenantDashboard user={user} />;
  }

  if (user.role === 'LANDLORD') {
    return <LandlordDashboard user={user} />;
  }

  if (user.role === 'ADMIN') {
    return <AdminDashboard user={user} />;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Dashboard</h1>
      <p>Unknown role.</p>
    </div>
  );
}
