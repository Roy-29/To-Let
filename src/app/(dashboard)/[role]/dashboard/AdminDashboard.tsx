import React from 'react';
import { getPlatformOverview } from '@/services/platformAnalyticsService';
import { Card } from '@/components/ui/Card/Card';
import styles from './dashboard.module.css'; // existing styles should be reusable

export default async function AdminDashboard({ user }: { user: any }) {
  const overview = await getPlatformOverview(user.id);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome, {user.name}</h1>
        <p className={styles.subtitle}>Here is your platform overview</p>
      </div>

      <div className={styles.statsGrid}>
        <Card>
          <h3>Users</h3>
          <p className={styles.statLarge}>{overview.totalUsers}</p>
          <div className={styles.statDetails}>
            <span>{overview.tenants} Tenants</span> | <span>{overview.landlords} Landlords</span>
            <br/>
            <span>{overview.activeUsers} Active</span> | <span>{overview.suspendedUsers} Suspended</span>
          </div>
        </Card>

        <Card>
          <h3>Properties</h3>
          <p className={styles.statLarge}>{overview.totalProperties}</p>
          <div className={styles.statDetails}>
            <span>{overview.publishedProperties} Published</span> | <span>{overview.pendingProperties} Pending</span>
            <br/>
            <span>{overview.occupiedProperties} Rented</span>
          </div>
        </Card>

        <Card>
          <h3>Activity</h3>
          <div className={styles.statDetails}>
            <p><strong>{overview.activeTenancies}</strong> Active Tenancies</p>
            <p><strong>{overview.pendingApplications}</strong> Pending Applications</p>
            <p><strong>{overview.openReports}</strong> Open Reports</p>
            <p><strong>{overview.openMaintenance}</strong> Open Maintenance</p>
          </div>
        </Card>

        <Card>
          <h3>Monthly Rent Volume</h3>
          <p className={styles.statLarge}>${overview.monthlyRentVolume.toLocaleString()}</p>
          <p className={styles.subtitle}>Collected this month</p>
        </Card>
      </div>
    </div>
  );
}
