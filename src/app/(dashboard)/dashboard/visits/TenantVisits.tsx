import React from 'react';
import Link from 'next/link';
import { getTenantVisits } from '@/services/visitService';
import { Badge } from '@/components/ui/Badge/Badge';
import { Button } from '@/components/ui/Button/Button';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import CancelVisitButton from './CancelVisitButton';
import styles from './visits.module.css';

export default async function TenantVisits({ user, page }: { user: any, page: number }) {
  const { visits } = await getTenantVisits(user.id, page, 20);

  const upcoming = visits.filter(v => v.status === 'REQUESTED' || v.status === 'ACCEPTED');
  const past = visits.filter(v => v.status !== 'REQUESTED' && v.status !== 'ACCEPTED');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Property Visits</h1>
        <p className={styles.subtitle}>Manage your upcoming and past property visits.</p>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Upcoming Visits</h2>
        {upcoming.length > 0 ? (
          <div className={styles.grid}>
            {upcoming.map((visit) => (
              <div key={visit.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <Link href={`/properties/${visit.propertyId}`} className={styles.propertyLink}>
                    {visit.property.title}
                  </Link>
                  <Badge variant={visit.status === 'ACCEPTED' ? 'success' : 'warning'}>
                    {visit.status}
                  </Badge>
                </div>
                <div className={styles.details}>
                  <p><strong>Date:</strong> {new Date(visit.requestedDate).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {visit.requestedTime}</p>
                  <p><strong>Landlord:</strong> {visit.landlord.name}</p>
                </div>
                <div className={styles.actions}>
                  <Link href={`/dashboard/messages?user=${visit.landlordId}`}>
                    <Button variant="outline" size="sm" fullWidth>Message</Button>
                  </Link>
                  <CancelVisitButton visitId={visit.id} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyCard}>No upcoming visits scheduled.</div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Past / Cancelled Visits</h2>
        {past.length > 0 ? (
          <div className={styles.grid}>
            {past.map((visit) => (
              <div key={visit.id} className={`${styles.card} ${styles.pastCard}`}>
                <div className={styles.cardHeader}>
                  <Link href={`/properties/${visit.propertyId}`} className={styles.propertyLink}>
                    {visit.property.title}
                  </Link>
                  <Badge variant={
                    visit.status === 'COMPLETED' ? 'primary' : 
                    visit.status === 'REJECTED' ? 'error' : 'secondary'
                  }>
                    {visit.status}
                  </Badge>
                </div>
                <div className={styles.details}>
                  <p><strong>Date:</strong> {new Date(visit.requestedDate).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {visit.requestedTime}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyCard}>No past visits.</div>
        )}
      </section>
    </div>
  );
}
