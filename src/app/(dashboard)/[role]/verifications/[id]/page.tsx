import React from 'react';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import AdminVerificationReview from './AdminVerificationReview';
import styles from '../../users/users.module.css';

export default async function AdminVerificationDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'ADMIN') redirect(`/${user.role.toLowerCase()}/dashboard`);

  const landlordProfile = await prisma.landlordProfile.findUnique({
    where: { userId: params.id },
    include: { user: true }
  });

  if (!landlordProfile) {
    return <div className={styles.container}><h1>Landlord Profile Not Found</h1></div>;
  }

  return (
    <div className={styles.container}>
      <AdminVerificationReview profile={landlordProfile} />
    </div>
  );
}
