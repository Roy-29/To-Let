import React from 'react';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import LandlordPropertyDetail from './LandlordPropertyDetail';
import AdminPropertyReview from './AdminPropertyReview';
import styles from '../properties.module.css';

export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'LANDLORD' && user.role !== 'ADMIN')) redirect('/dashboard');

  if (user.role === 'ADMIN') {
    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: { owner: true }
    });
    if (!property) return <div className={styles.container}>Property not found</div>;
    return (
      <div className={styles.container}>
        <AdminPropertyReview property={property} adminId={user.id} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <LandlordPropertyDetail propertyId={params.id} userId={user.id} />
    </div>
  );
}
