import React from 'react';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import LandlordProperties from './LandlordProperties';
import AdminPropertiesList from './AdminPropertiesList';
import TenantProperties from './TenantProperties';
import { getAllPropertiesForAdmin } from '@/services/moderationService';

export default async function PropertiesPage({ searchParams }: { searchParams: { page?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  if (user.role === 'ADMIN') {
    const page = searchParams.page ? parseInt(searchParams.page as string) : 1;
    const status = (searchParams as any).status as string | undefined;
    const search = (searchParams as any).search as string | undefined;
    
    const propertiesData = await getAllPropertiesForAdmin(user.id, { status, search }, page, 20);
    return <AdminPropertiesList initialData={propertiesData} currentFilters={{ status, search }} />;
  }

  if (user.role === 'TENANT') {
    return <TenantProperties searchParams={searchParams as any} role={user.role.toLowerCase()} />;
  }

  const page = searchParams.page ? parseInt(searchParams.page as string) : 1;
  return <LandlordProperties user={user} page={page} />;
}
