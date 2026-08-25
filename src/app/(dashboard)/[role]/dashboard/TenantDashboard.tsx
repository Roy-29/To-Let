import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import { listMyFavorites } from '@/services/favoriteService';
import { getTenantApplications } from '@/services/applicationService';
import { getTenantVisits } from '@/services/visitService';
import { getMyNotifications } from '@/services/notificationService';
import { getTenantRentRecords } from '@/services/rentService';
import styles from './dashboard.module.css';

export default async function TenantDashboard({ user }: { user: any }) {
  // Fetch overview data
  const [
    favoritesReq,
    applicationsReq,
    visitsReq,
    notificationsReq,
    rentReq
  ] = await Promise.all([
    listMyFavorites(user.id, 1, 5),
    getTenantApplications(user.id, 1, 5),
    getTenantVisits(user.id, 1, 5),
    getMyNotifications(user.id, 1, 5),
    getTenantRentRecords(user.id, 1, 5)
  ]);

  const favoritesCount = favoritesReq.total;
  const activeApplications = applicationsReq.applications.filter((a: any) => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW').length;
  const upcomingVisits = visitsReq.visits.filter((v: any) => v.status === 'SCHEDULED').length;
  const unreadNotifications = notificationsReq.unreadCount;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Tenant Dashboard</h1>
      
      <div className={styles.metricsGrid}>
        <Card className={styles.metricCard}>
          <h3 className={styles.metricLabel}>Saved Properties</h3>
          <p className={styles.metricValue}>{favoritesCount}</p>
          <Link href={`/${user.role.toLowerCase()}/saved`} className={styles.metricLink}>View Saved</Link>
        </Card>
        
        <Card className={styles.metricCard}>
          <h3 className={styles.metricLabel}>Active Applications</h3>
          <p className={styles.metricValue}>{activeApplications}</p>
          <Link href={`/${user.role.toLowerCase()}/applications`} className={styles.metricLink}>View Applications</Link>
        </Card>

        <Card className={styles.metricCard}>
          <h3 className={styles.metricLabel}>Upcoming Visits</h3>
          <p className={styles.metricValue}>{upcomingVisits}</p>
          <Link href={`/${user.role.toLowerCase()}/visits`} className={styles.metricLink}>View Visits</Link>
        </Card>

        <Card className={styles.metricCard}>
          <h3 className={styles.metricLabel}>Unread Notifications</h3>
          <p className={styles.metricValue}>{unreadNotifications}</p>
          <Link href={`/${user.role.toLowerCase()}/notifications`} className={styles.metricLink}>View Notifications</Link>
        </Card>
      </div>

      <div className={styles.sectionsGrid}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Applications</h2>
            <Link href={`/${user.role.toLowerCase()}/applications`}><Button variant="ghost" size="sm">View All</Button></Link>
          </div>
          <Card padding="none">
            {applicationsReq.applications.length > 0 ? (
              <ul className={styles.list}>
                {applicationsReq.applications.slice(0, 3).map((app: any) => (
                  <li key={app.id} className={styles.listItem}>
                    <div>
                      <p className={styles.itemTitle}>{app.property.title}</p>
                      <p className={styles.itemSubtitle}>Applied on {new Date(app.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={
                      app.status === 'APPROVED' ? 'success' : 
                      app.status === 'REJECTED' ? 'error' : 
                      'secondary'
                    }>{app.status}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.emptyState}>No recent applications</div>
            )}
          </Card>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Upcoming Rent</h2>
            <Link href={`/${user.role.toLowerCase()}/rent`}><Button variant="ghost" size="sm">View All</Button></Link>
          </div>
          <Card padding="none">
            {rentReq.records.length > 0 ? (
              <ul className={styles.list}>
                {rentReq.records.slice(0, 3).map((record: any) => (
                  <li key={record.id} className={styles.listItem}>
                    <div>
                      <p className={styles.itemTitle}>৳{record.amount.toLocaleString()} - {record.billingMonth}</p>
                      <p className={styles.itemSubtitle}>Due {new Date(record.dueDate).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={
                      record.status === 'PAID' ? 'success' : 
                      record.status === 'OVERDUE' ? 'error' : 
                      'warning'
                    }>{record.status}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.emptyState}>No rent records found</div>
            )}
          </Card>
        </section>
      </div>
    </div>
  );
}
