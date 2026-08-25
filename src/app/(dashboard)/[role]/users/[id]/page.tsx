import React from 'react';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { getUserById } from '@/services/adminUserService';
import Link from 'next/link';
import styles from '../users.module.css';

export default async function AdminUserDetail({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'ADMIN') redirect(`/${user.role.toLowerCase()}/dashboard`);

  let targetUser;
  try {
    targetUser = await getUserById(user.id, params.id);
  } catch (e) {
    return <div className={styles.container}><h1>User Not Found</h1></div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>User Detail</h1>
        <Link href={`/${user.role.toLowerCase()}/users`} className={styles.input}>Back to Users</Link>
      </div>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <h2>{targetUser.name}</h2>
        <p>Email: {targetUser.email}</p>
        <p>Role: {targetUser.role}</p>
        <p>Status: <span className={`${styles.badge} ${targetUser.status === 'ACTIVE' ? styles.badgeActive : styles.badgeSuspended}`}>{targetUser.status}</span></p>
        <p>Created: {new Date(targetUser.createdAt).toLocaleString()}</p>
        
        {targetUser.tenantProfile && (
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
            <h3>Tenant Profile</h3>
            <p>Phone: {targetUser.tenantProfile.phone}</p>
          </div>
        )}
        
        {targetUser.landlordProfile && (
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
            <h3>Landlord Profile</h3>
            <p>Phone: {targetUser.landlordProfile.phone}</p>
            <p>Verification Status: {targetUser.landlordProfile.verificationStatus}</p>
          </div>
        )}
      </div>
    </div>
  );
}
