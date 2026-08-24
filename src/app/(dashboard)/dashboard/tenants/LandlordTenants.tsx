import React from 'react';
import Link from 'next/link';
import { getLandlordTenants } from '@/services/tenantManagementService';
import { Card } from '@/components/ui/Card/Card';
import { Badge } from '@/components/ui/Badge/Badge';
import { Button } from '@/components/ui/Button/Button';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import styles from './tenants.module.css';

export default async function LandlordTenants({ user, page }: { user: any, page: number }) {
  const { tenants } = await getLandlordTenants(user.id, page, 20);

  const getStatusVariant = (status: string) => {
    switch(status) {
      case 'ACTIVE': return 'success';
      case 'TERMINATED': return 'error';
      case 'EXPIRED': return 'secondary';
      default: return 'primary';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Tenants</h1>
        <p className={styles.subtitle}>Manage your renters and their tenancies.</p>
      </div>

      <Card padding="none" className={styles.tableCard}>
        {tenants.length > 0 ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tenant Name</th>
                  <th>Property</th>
                  <th>Lease Dates</th>
                  <th>Monthly Rent</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenancy) => (
                  <tr key={tenancy.id}>
                    <td>
                      <div className={styles.tenantName}>{tenancy.tenant.name}</div>
                      <div className={styles.tenantEmail}>{tenancy.tenant.email}</div>
                    </td>
                    <td>
                      <Link href={`/properties/${tenancy.propertyId}`} className={styles.propertyLink}>
                        {tenancy.property.title}
                      </Link>
                    </td>
                    <td>
                      {tenancy.startDate ? new Date(tenancy.startDate).toLocaleDateString() : 'N/A'} - <br/>
                      {tenancy.endDate ? new Date(tenancy.endDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>৳{tenancy.monthlyRent.toLocaleString()}</td>
                    <td>
                      <Badge variant={getStatusVariant(tenancy.status)}>{tenancy.status}</Badge>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Link href={`/dashboard/messages?user=${tenancy.tenantId}`}>
                          <Button variant="outline" size="sm">Message</Button>
                        </Link>
                        <Link href={`/dashboard/rent`}>
                          <Button variant="ghost" size="sm">Rentals</Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{marginTop: '2rem', marginBottom: '2rem'}}>
            <EmptyState 
              title="No active tenants" 
              description="You do not have any active tenancies yet." 
            />
          </div>
        )}
      </Card>
    </div>
  );
}
