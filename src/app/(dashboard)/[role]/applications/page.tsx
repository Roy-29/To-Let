import React from 'react';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import TenantApplications from './TenantApplications';
import LandlordApplications from './LandlordApplications';

export default async function ApplicationsPage({ searchParams }: { searchParams: { page?: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const page = searchParams.page ? parseInt(searchParams.page) : 1;

  if (user.role === 'TENANT') {
    return <TenantApplications user={user} page={page} />;
  }

  if (user.role === 'LANDLORD') {
    return <LandlordApplications user={user} page={page} />;
  }

  // Placeholder for ADMIN
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Admin Applications</h1>
      <p>Under construction.</p>
    </div>
  );
}
