import React from 'react';
import Link from 'next/link';
import { getLandlordMaintenanceRequests } from '@/services/maintenanceService';
import { Card } from '@/components/ui/Card/Card';
import { Badge } from '@/components/ui/Badge/Badge';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import LandlordMaintenanceActions from './LandlordMaintenanceActions';
import styles from './maintenance.module.css';

export default async function LandlordMaintenance({ user, page }: { user: any, page: number }) {
  const { requests } = await getLandlordMaintenanceRequests(user.id, page, 20);

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
        <h1 className={styles.title}>Maintenance Requests</h1>
        <p className={styles.subtitle}>Review and manage repair requests from your tenants.</p>
      </div>

      <Card padding="none" className={styles.tableCard}>
        {requests.length > 0 ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Property & Tenant</th>
                  <th>Issue</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <div className={styles.propertyTitle}>{req.property.title}</div>
                      <div className={styles.tenantName}>{req.tenant.name}</div>
                    </td>
                    <td>
                      <div className={styles.reqTitle}>{req.title}</div>
                    </td>
                    <td>{req.category}</td>
                    <td>
                      <Badge variant={getPriorityVariant(req.priority)}>{req.priority}</Badge>
                    </td>
                    <td>
                      <Badge variant={getStatusVariant(req.status)}>{req.status}</Badge>
                    </td>
                    <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                    <td>
                      <LandlordMaintenanceActions requestId={req.id} status={req.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{marginTop: '2rem', marginBottom: '2rem'}}>
            <EmptyState 
              title="No maintenance requests" 
              description="Your properties currently have no open maintenance requests." 
            />
          </div>
        )}
      </Card>
    </div>
  );
}
