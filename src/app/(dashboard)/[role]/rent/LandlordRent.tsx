import React from 'react';
import { getLandlordRentRecords } from '@/services/rentService';
import { Card } from '@/components/ui/Card/Card';
import { Badge } from '@/components/ui/Badge/Badge';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import LandlordRentActions from './LandlordRentActions';
import styles from './rent.module.css';

export default async function LandlordRent({ user, page }: { user: any, page: number }) {
  const { records } = await getLandlordRentRecords(user.id, page, 20);

  const getStatusVariant = (status: string) => {
    switch(status) {
      case 'PAID': return 'success';
      case 'OVERDUE': return 'error';
      case 'PENDING': return 'warning';
      case 'PARTIALLY_PAID': return 'primary';
      default: return 'secondary';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Rent Management</h1>
        <p className={styles.subtitle}>Track rent collection across all your properties.</p>
      </div>

      <Card padding="none" className={styles.tableCard}>
        {records.length > 0 ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Property & Tenant</th>
                  <th>Month</th>
                  <th>Amount Due</th>
                  <th>Amount Paid</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => {
                  const dueAmount = record.amount - record.paidAmount;
                  return (
                    <tr key={record.id}>
                      <td>
                        <div className={styles.propertyTitle}>{record.tenancy.property.title}</div>
                        <div className={styles.tenantName}>{record.tenancy.tenant.name}</div>
                      </td>
                      <td>{record.billingMonth}</td>
                      <td>৳{record.amount.toLocaleString()}</td>
                      <td>৳{record.paidAmount.toLocaleString()}</td>
                      <td>
                        <Badge variant={getStatusVariant(record.status)}>{record.status}</Badge>
                      </td>
                      <td>
                        {dueAmount > 0 && (
                          <LandlordRentActions 
                            rentRecordId={record.id} 
                            tenancyId={record.tenancyId} 
                            dueAmount={dueAmount} 
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{marginTop: '2rem', marginBottom: '2rem'}}>
            <EmptyState 
              title="No rent records found" 
              description="Rent records will appear here once you have active tenancies." 
            />
          </div>
        )}
      </Card>
    </div>
  );
}
