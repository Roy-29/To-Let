import React from 'react';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { getUsers } from '@/services/adminUserService';
import AdminUsersList from './AdminUsersList';

export default async function AdminUsersPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'ADMIN') {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>Forbidden</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const role = typeof searchParams.role === 'string' ? searchParams.role as any : undefined;
  const status = typeof searchParams.status === 'string' ? searchParams.status as any : undefined;
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;

  const usersData = await getUsers(user.id, { role, status, search }, page, 20);

  return <AdminUsersList initialData={usersData} currentFilters={{ role, status, search }} />;
}
