import React from 'react';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import LandlordPropertyDetail from './LandlordPropertyDetail';
import AdminPropertyReview from './AdminPropertyReview';
import TenantPropertyDetail from './TenantPropertyDetail';
import styles from '../properties.module.css';

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'LANDLORD' && user.role !== 'ADMIN' && user.role !== 'TENANT') redirect(`/${user.role.toLowerCase()}/dashboard`);

  if (user.role === 'ADMIN') {
    const property = await prisma.property.findUnique({
      where: { id },
      include: { owner: true }
    });
    if (!property) return <div className={styles.container}>Property not found</div>;
    return (
      <div className={styles.container}>
        <AdminPropertyReview property={property} adminId={user.id} />
      </div>
    );
  }

  if (user.role === 'TENANT') {
    return (
      <div className={styles.container}>
        <TenantPropertyDetail propertyId={id} userId={user.id} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <LandlordPropertyDetail propertyId={id} userId={user.id} />
    </div>
  );
}
