import React from 'react';
import Link from 'next/link';
import { getLandlordApplications } from '@/services/applicationService';
import { Badge } from '@/components/ui/Badge/Badge';
import { Button } from '@/components/ui/Button/Button';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import LandlordApplicationActions from './LandlordApplicationActions';
import styles from './applications.module.css';

export default async function LandlordApplications({ user, page }: { user: any, page: number }) {
  const { applications } = await getLandlordApplications(user.id, page, 20);

  const getStatusVariant = (status: string) => {
    switch(status) {
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      case 'WITHDRAWN': return 'secondary';
      case 'UNDER_REVIEW': return 'warning';
      default: return 'primary';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Received Applications</h1>
        <p className={styles.subtitle}>Review and manage rental applications for your properties.</p>
      </div>

      {applications.length > 0 ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Property</th>
                <th>Tenant</th>
                <th>Move-in Date</th>
                <th>Applied On</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <Link href={`/properties/${app.propertyId}`} className={styles.propertyLink}>
                      {app.property.title}
                    </Link>
                  </td>
                  <td>{app.tenant.name}</td>
                  <td>{app.moveInDate ? new Date(app.moveInDate).toLocaleDateString() : 'N/A'}</td>
                  <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Badge variant={getStatusVariant(app.status)}>{app.status}</Badge>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link href={`/dashboard/messages?user=${app.tenantId}`}>
                        <Button variant="ghost" size="sm">Message</Button>
                      </Link>
                      <LandlordApplicationActions applicationId={app.id} status={app.status} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{marginTop: '2rem'}}>
          <EmptyState 
            title="No applications received" 
            description="You haven't received any applications for your properties yet."
          />
        </div>
      )}
    </div>
  );
}
