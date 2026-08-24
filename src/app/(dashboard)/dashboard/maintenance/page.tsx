import React from 'react';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import TenantMaintenance from './TenantMaintenance';
import LandlordMaintenance from './LandlordMaintenance';

export default async function MaintenancePage({ searchParams }: { searchParams: { page?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const page = searchParams.page ? parseInt(searchParams.page) : 1;

  if (user.role === 'TENANT') {
    return <TenantMaintenance user={user} page={page} />;
  }
  if (user.role === 'LANDLORD') {
    return <LandlordMaintenance user={user} page={page} />;
  }

  // Placeholder for ADMIN
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Admin Maintenance</h1>
      <p>Under construction.</p>
    </div>
  );
}
