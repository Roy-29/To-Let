import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { getLandlordAnalytics } from '@/services/analyticsService';
import styles from './dashboard.module.css';

export default async function LandlordDashboard({ user }: { user: any }) {
  const analytics = await getLandlordAnalytics(user.id);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Landlord Overview</h1>
      
      <div className={styles.metricsGrid}>
        <Card className={styles.metricCard}>
          <h3 className={styles.metricLabel}>Properties</h3>
          <p className={styles.metricValue}>{analytics.totalProperties}</p>
          <div className={styles.metricSubInfo}>
            <span>{analytics.occupiedProperties} Occupied</span>
            <span>•</span>
            <span>{analytics.vacantProperties} Vacant</span>
          </div>
          <Link href={`/${user.role.toLowerCase()}/properties`} className={styles.metricLink}>Manage Properties</Link>
        </Card>
        
        <Card className={styles.metricCard}>
          <h3 className={styles.metricLabel}>Active Tenants</h3>
          <p className={styles.metricValue}>{analytics.activeTenants}</p>
          <Link href={`/${user.role.toLowerCase()}/tenants`} className={styles.metricLink}>View Tenants</Link>
        </Card>

        <Card className={styles.metricCard}>
          <h3 className={styles.metricLabel}>Pending Applications</h3>
          <p className={styles.metricValue}>{analytics.pendingApplications}</p>
          <Link href={`/${user.role.toLowerCase()}/applications`} className={styles.metricLink}>Review Applications</Link>
        </Card>

        <Card className={styles.metricCard}>
          <h3 className={styles.metricLabel}>Maintenance</h3>
          <p className={styles.metricValue}>{analytics.openMaintenanceRequests}</p>
          <p className={styles.metricSubInfo}>Open Requests</p>
          <Link href={`/${user.role.toLowerCase()}/maintenance`} className={styles.metricLink}>View Maintenance</Link>
        </Card>
      </div>

      <div className={styles.sectionsGrid}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Rent Collection (Current Month)</h2>
            <Link href={`/${user.role.toLowerCase()}/rent`}><Button variant="ghost" size="sm">Manage Rent</Button></Link>
          </div>
          <Card padding="none">
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <p className={styles.itemTitle}>Expected</p>
                <p className={styles.itemTitle}>৳{analytics.monthlyExpectedRent.toLocaleString()}</p>
              </li>
              <li className={styles.listItem}>
                <p className={styles.itemTitle}>Collected</p>
                <p className={styles.itemTitle} style={{ color: 'var(--color-success)' }}>৳{analytics.collectedRent.toLocaleString()}</p>
              </li>
              <li className={styles.listItem}>
                <p className={styles.itemTitle}>Pending</p>
                <p className={styles.itemTitle} style={{ color: 'var(--color-warning)' }}>৳{analytics.pendingRent.toLocaleString()}</p>
              </li>
              <li className={styles.listItem}>
                <p className={styles.itemTitle}>Overdue</p>
                <p className={styles.itemTitle} style={{ color: 'var(--color-error)' }}>৳{analytics.overdueRent.toLocaleString()}</p>
              </li>
            </ul>
          </Card>
        </section>
      </div>
    </div>
  );
}
