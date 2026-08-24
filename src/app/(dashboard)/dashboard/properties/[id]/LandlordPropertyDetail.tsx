import React from 'react';
import Link from 'next/link';
import { getLandlordPropertyOverview } from '@/services/landlordDashboardService';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import PropertyStatusToggle from '../PropertyStatusToggle';
import styles from '../properties.module.css';

export default async function LandlordPropertyDetail({ propertyId, userId }: { propertyId: string, userId: string }) {
  const overview = await getLandlordPropertyOverview(propertyId, userId);
  const { property, occupancyStatus, activeTenant, activeTenancy, pendingApplications, openMaintenanceRequests } = overview;

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{property.title}</h1>
          <p className={styles.subtitle}>{property.address}, {property.city}</p>
        </div>
        <div className={styles.actions}>
          <PropertyStatusToggle propertyId={property.id} currentStatus={property.status} />
          <Link href={`/dashboard/properties/${property.id}/edit`}>
            <Button variant="outline">Edit Property</Button>
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <Card>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>Status</h3>
          <p style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '0.5rem' }}>{property.status}</p>
        </Card>
        <Card>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>Occupancy</h3>
          <p style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '0.5rem' }}>{occupancyStatus}</p>
        </Card>
        <Card>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>Monthly Rent</h3>
          <p style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '0.5rem' }}>৳{property.rent.toLocaleString()}</p>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Active Tenant</h2>
            {activeTenant && (
              <Link href={`/dashboard/messages?user=${activeTenant.id}`}>
                <Button variant="ghost" size="sm">Message</Button>
              </Link>
            )}
          </div>
          <Card>
            {activeTenant ? (
              <div>
                <p style={{ fontWeight: 600 }}>{activeTenant.name}</p>
                <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>{activeTenant.email}</p>
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                  <p style={{ fontSize: '0.875rem' }}>
                    <strong>Lease:</strong> {activeTenancy.startDate ? new Date(activeTenancy.startDate).toLocaleDateString() : 'N/A'} to {activeTenancy.endDate ? new Date(activeTenancy.endDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--color-muted)' }}>No active tenant for this property.</p>
            )}
          </Card>
        </section>

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Action Items</h2>
          <Card padding="none">
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 500 }}>Pending Applications</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>{pendingApplications} applications await review</p>
                </div>
                <Link href="/dashboard/applications"><Button size="sm">Review</Button></Link>
              </li>
              <li style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 500 }}>Open Maintenance</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>{openMaintenanceRequests} active requests</p>
                </div>
                <Link href="/dashboard/maintenance"><Button size="sm">View</Button></Link>
              </li>
            </ul>
          </Card>
        </section>
      </div>
    </div>
  );
}
