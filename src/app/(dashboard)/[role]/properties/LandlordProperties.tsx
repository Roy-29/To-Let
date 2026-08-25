import React from 'react';
import Link from 'next/link';
import { getLandlordProperties } from '@/services/landlordDashboardService';
import { Card } from '@/components/ui/Card/Card';
import { Badge } from '@/components/ui/Badge/Badge';
import { Button } from '@/components/ui/Button/Button';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import PropertyStatusToggle from './PropertyStatusToggle';
import styles from './properties.module.css';

export default async function LandlordProperties({ user, page }: { user: any, page: number }) {
  const { properties } = await getLandlordProperties(user.id, page, 20);

  const getStatusVariant = (status: string) => {
    switch(status) {
      case 'PUBLISHED': return 'success';
      case 'PAUSED': return 'warning';
      case 'DRAFT': return 'secondary';
      case 'RENTED': return 'primary';
      case 'ARCHIVED': return 'error';
      default: return 'secondary';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Properties</h1>
          <p className={styles.subtitle}>Manage your property listings and occupancies.</p>
        </div>
        <Link href={`/${user.role.toLowerCase()}/properties/new`}>
          <Button variant="primary">Add Property</Button>
        </Link>
      </div>

      <Card padding="none" className={styles.tableCard}>
        {properties.length > 0 ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Occupancy</th>
                  <th>Rent</th>
                  <th>Applications</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((prop) => (
                  <tr key={prop.id}>
                    <td>
                      <Link href={`/${user.role.toLowerCase()}/properties/${prop.id}`} className={styles.propertyLink}>
                        {prop.title}
                      </Link>
                      <div className={styles.location}>{prop.city}</div>
                    </td>
                    <td>
                      <Badge variant={getStatusVariant(prop.status)}>{prop.status}</Badge>
                    </td>
                    <td>
                      <Badge variant={prop.occupancyStatus === 'OCCUPIED' ? 'success' : 'secondary'}>
                        {prop.occupancyStatus}
                      </Badge>
                      {prop.activeTenant && <div className={styles.subtext}>{prop.activeTenant}</div>}
                    </td>
                    <td>৳{prop.rent.toLocaleString()}</td>
                    <td>
                      {prop._count.applications} Pending
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Link href={`/${user.role.toLowerCase()}/properties/${prop.id}`}>
                          <Button variant="ghost" size="sm">Manage</Button>
                        </Link>
                        <Link href={`/${user.role.toLowerCase()}/properties/${prop.id}/edit`}>
                          <Button variant="outline" size="sm">Edit</Button>
                        </Link>
                        {/* We use a simple toggle for Publish/Pause if appropriate */}
                        <PropertyStatusToggle propertyId={prop.id} currentStatus={prop.status} />
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
              title="No properties found" 
              description="Add your first property to start receiving rental applications." 
            />
            <div style={{marginTop: '1rem', textAlign: 'center', marginBottom: '2rem'}}>
              <Link href={`/${user.role.toLowerCase()}/properties/new`}>
                <Button variant="primary">Add Property</Button>
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
