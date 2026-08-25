import React from 'react';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import LandlordTenants from './LandlordTenants';

export default async function TenantsPage({ searchParams }: { searchParams: { page?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'LANDLORD') redirect(`/${user.role.toLowerCase()}/dashboard`);

  const page = searchParams.page ? parseInt(searchParams.page) : 1;

  return <LandlordTenants user={user} page={page} />;
}
