import React from 'react';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import TenantVisits from './TenantVisits';

export default async function VisitsPage({ searchParams }: { searchParams: { page?: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const page = searchParams.page ? parseInt(searchParams.page) : 1;

  if (user.role === 'TENANT') {
    return <TenantVisits user={user} page={page} />;
  }

  // Placeholder for LANDLORD
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Landlord Visits</h1>
      <p>Under construction in Batch 2.</p>
    </div>
  );
}
