import React from 'react';
import Link from 'next/link';
import { getTenantMaintenanceRequests } from '@/services/maintenanceService';
import { Card } from '@/components/ui/Card/Card';
import { Badge } from '@/components/ui/Badge/Badge';
import { Button } from '@/components/ui/Button/Button';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import styles from './maintenance.module.css';

export default async function TenantMaintenance({ user, page }: { user: any, page: number }) {
  const { requests } = await getTenantMaintenanceRequests(user.id, page, 20);

  const getStatusVariant = (status: string) => {
    switch(status) {
      case 'OPEN': return 'error';
      case 'ACKNOWLEDGED': return 'warning';
      case 'IN_PROGRESS': return 'primary';
      case 'RESOLVED': return 'success';
      case 'CLOSED': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch(priority) {
      case 'HIGH': return 'error';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Maintenance Requests</h1>
          <p className={styles.subtitle}>Report issues and track repairs for your current property.</p>
        </div>
        <Link href="/dashboard/maintenance/new">
          <Button variant="primary">New Request</Button>
        </Link>
      </div>

      <Card padding="none" className={styles.tableCard}>
        {requests.length > 0 ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td>{req.property.title}</td>
                    <td className={styles.reqTitle}>{req.title}</td>
                    <td>{req.category}</td>
                    <td>
                      <Badge variant={getPriorityVariant(req.priority)}>{req.priority}</Badge>
                    </td>
                    <td>
                      <Badge variant={getStatusVariant(req.status)}>{req.status.replace('_', ' ')}</Badge>
                    </td>
                    <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link href={`/dashboard/maintenance/${req.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState 
            title="No maintenance requests" 
            description="You have not submitted any maintenance requests." 
          />
        )}
      </Card>
    </div>
  );
}
