import React from 'react';
import Link from 'next/link';
import { getTenantRentRecords } from '@/services/rentService';
import { Card } from '@/components/ui/Card/Card';
import { Badge } from '@/components/ui/Badge/Badge';
import { Button } from '@/components/ui/Button/Button';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import styles from './rent.module.css';

export default async function TenantRent({ user, page }: { user: any, page: number }) {
  const { records } = await getTenantRentRecords(user.id, page, 20);

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
        <h1 className={styles.title}>Rent & Payments</h1>
        <p className={styles.subtitle}>View your rent records and payment history.</p>
      </div>

      <Card padding="none" className={styles.tableCard}>
        {records.length > 0 ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Billing Month</th>
                  <th>Property</th>
                  <th>Amount Due</th>
                  <th>Amount Paid</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => {
                  // The tenant rent records usually include tenancy -> property
                  const propertyTitle = record.tenancy?.property?.title || 'Unknown Property';
                  const landlordId = record.tenancy?.landlordId;

                  return (
                    <tr key={record.id}>
                      <td>{record.billingMonth}</td>
                      <td>{propertyTitle}</td>
                      <td>৳{record.amount.toLocaleString()}</td>
                      <td>৳{record.paidAmount.toLocaleString()}</td>
                      <td>{new Date(record.dueDate).toLocaleDateString()}</td>
                      <td>
                        <Badge variant={getStatusVariant(record.status)}>{record.status}</Badge>
                      </td>
                      <td>
                        {record.status !== 'PAID' && landlordId && (
                          <Link href={`/dashboard/messages?user=${landlordId}`}>
                            <Button variant="outline" size="sm">Contact Landlord</Button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState 
            title="No rent records found" 
            description="You do not have any active rent records at this time." 
          />
        )}
      </Card>
    </div>
  );
}
