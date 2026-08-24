import React from 'react';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { getPlatformAnalytics } from '@/services/platformAnalyticsService';
import { Card } from '@/components/ui/Card/Card';
import styles from '../dashboard.module.css';

export default async function AdminAnalyticsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') redirect('/dashboard');

  const year = typeof searchParams.year === 'string' ? parseInt(searchParams.year, 10) : new Date().getFullYear();
  const month = typeof searchParams.month === 'string' ? parseInt(searchParams.month, 10) : undefined;

  const analytics = await getPlatformAnalytics(user.id, { year, month });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Platform Analytics</h1>
        <p className={styles.subtitle}>Filtered for {month ? `${month}/` : ''}{year}</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <form style={{ display: 'flex', gap: '1rem' }} action="/dashboard/analytics">
          <select name="year" defaultValue={year} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
          <select name="month" defaultValue={month || ''} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <option value="">All Year</option>
            {[...Array(12)].map((_, i) => (
              <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
          <button type="submit" style={{ padding: '0.5rem 1rem', background: 'black', color: 'white', borderRadius: '4px' }}>Filter</button>
        </form>
      </div>

      <div className={styles.statsGrid}>
        <Card>
          <h3>New Users</h3>
          <p className={styles.statLarge}>{analytics.newUsers}</p>
        </Card>
        <Card>
          <h3>New Properties</h3>
          <p className={styles.statLarge}>{analytics.newProperties}</p>
          <div className={styles.statDetails}>
            <span>{analytics.publishedProperties} Published</span>
          </div>
        </Card>
        <Card>
          <h3>Applications</h3>
          <p className={styles.statLarge}>{analytics.newApplications}</p>
        </Card>
        <Card>
          <h3>Active Tenancies</h3>
          <p className={styles.statLarge}>{analytics.activeTenancies}</p>
        </Card>
        <Card>
          <h3>Maintenance Requests</h3>
          <p className={styles.statLarge}>{analytics.maintenanceRequests}</p>
        </Card>
        <Card>
          <h3>Reports</h3>
          <p className={styles.statLarge}>{analytics.reports}</p>
        </Card>
        <Card>
          <h3>Payment Volume</h3>
          <p className={styles.statLarge}>${analytics.rentVolume.toLocaleString()}</p>
          <div className={styles.statDetails}>
            <span>{analytics.successfulPayments} Successful Payments</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
