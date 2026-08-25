import React from 'react';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import TenantProfileForm from './TenantProfileForm';
import LandlordProfileForm from './LandlordProfileForm';
import { getTenantProfile, getLandlordProfile, getUserById } from '@/services/userService';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const userData = await getUserById(user.id);

  if (user.role === 'TENANT') {
    const profileData = await getTenantProfile(user.id);
    return <TenantProfileForm user={userData} profile={profileData} />;
  }

  if (user.role === 'LANDLORD') {
    const profileData = await getLandlordProfile(user.id);
    return <LandlordProfileForm user={userData} profile={profileData} />;
  }

  // Placeholder for ADMIN
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Admin Profile</h1>
      <p>Under construction.</p>
    </div>
  );
}
