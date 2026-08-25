import React from 'react';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import PropertyForm from '../../PropertyForm';
import { getPropertyById } from '@/services/propertyService';
import styles from '../../properties.module.css';

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'LANDLORD') redirect(`/${user.role.toLowerCase()}/dashboard`);

  const property = await getPropertyById(id);
  if (property.ownerId !== user.id) redirect(`/${user.role.toLowerCase()}/properties`);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Edit Property</h1>
      </div>
      <PropertyForm initialData={property} />
    </div>
  );
}
