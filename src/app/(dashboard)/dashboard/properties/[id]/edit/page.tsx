import React from 'react';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import PropertyForm from '../../PropertyForm';
import { getPropertyById } from '@/services/propertyService';
import styles from '../../properties.module.css';

export default async function EditPropertyPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'LANDLORD') redirect('/dashboard');

  const property = await getPropertyById(params.id);
  if (property.ownerId !== user.id) redirect('/dashboard/properties');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Edit Property</h1>
      </div>
      <PropertyForm initialData={property} />
    </div>
  );
}
