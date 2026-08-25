import React from 'react';
import Link from 'next/link';
import { getTenantApplications } from '@/services/applicationService';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import WithdrawApplicationButton from './WithdrawApplicationButton';
import styles from './applications.module.css';

export default async function TenantApplications({ user, page }: { user: any, page: number }) {
  const { applications, total } = await getTenantApplications(user.id, page, 20);

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
        <h1 className={styles.title}>My Applications</h1>
        <p className={styles.subtitle}>Track the status of your rental applications.</p>
      </div>

      {applications.length > 0 ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Property</th>
                <th>Landlord</th>
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
                    <Link href={`/${user.role.toLowerCase()}/properties/${app.propertyId}`} className={styles.propertyLink}>
                      {app.property.title}
                    </Link>
                  </td>
                  <td>{app.landlord.name}</td>
                  <td>{app.moveInDate ? new Date(app.moveInDate).toLocaleDateString() : 'N/A'}</td>
                  <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Badge variant={getStatusVariant(app.status)}>{app.status}</Badge>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link href={`/${user.role.toLowerCase()}/messages?propertyId=${app.propertyId}`}>
                        <Button variant="ghost" size="sm">Message</Button>
                      </Link>
                      {(app.status === 'SUBMITTED' || app.status === 'UNDER_REVIEW') && (
                        <WithdrawApplicationButton applicationId={app.id} />
                      )}
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
            title="No applications yet" 
            description="Find a property you love and apply directly."
          />
          <div style={{marginTop: '1rem', textAlign: 'center'}}>
            <Link href={`/${user.role.toLowerCase()}/properties`}>
              <Button>Find Homes</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
