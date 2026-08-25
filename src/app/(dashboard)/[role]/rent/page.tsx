import React from 'react';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import TenantRent from './TenantRent';
import LandlordRent from './LandlordRent';

export default async function RentPage({ searchParams }: { searchParams: { page?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const page = searchParams.page ? parseInt(searchParams.page) : 1;

  if (user.role === 'TENANT') {
    return <TenantRent user={user} page={page} />;
  }
  if (user.role === 'LANDLORD') {
    return <LandlordRent user={user} page={page} />;
  }

  // Placeholder for ADMIN
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Admin Rent Management</h1>
      <p>Under construction.</p>
    </div>
  );
}
