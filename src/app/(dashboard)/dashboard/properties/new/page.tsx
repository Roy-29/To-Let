import React from 'react';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import PropertyForm from '../PropertyForm';
import styles from '../properties.module.css';

export default async function NewPropertyPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'LANDLORD') redirect('/dashboard');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Add New Property</h1>
      </div>
      <PropertyForm />
    </div>
  );
}
