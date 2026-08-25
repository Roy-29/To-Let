import React from 'react';
import { notFound } from 'next/navigation';
import { getPropertyById } from '@/services/propertyService';
import { Button } from '@/components/ui/Button/Button';
import { Card } from '@/components/ui/Card/Card';
import { Badge } from '@/components/ui/Badge/Badge';
import styles from '@/app/(public)/properties/[id]/property-details.module.css';
import TenantPropertyActions from './TenantPropertyActions';

export default async function TenantPropertyDetail({ propertyId, userId }: { propertyId: string, userId: string }) {
  let property;
  try {
    property = await getPropertyById(propertyId);
  } catch (err) {
    notFound();
  }

  return (
    <div className={styles.container}>
      <div className={styles.gallery}>
        <div className={styles.mainImage}>
          {property.images?.[0] ? (
            <img src={property.images[0].url} alt={property.title} className={styles.image} />
          ) : (
            <div className={styles.noImage}>No Image Available</div>
          )}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.mainColumn}>
          <div className={styles.header}>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>{property.title}</h1>
              <Badge variant={property.status === 'PUBLISHED' ? 'success' : 'secondary'}>
                {property.status}
              </Badge>
            </div>
            <p className={styles.location}>{property.address}, {property.city}</p>
          </div>

          <Card className={styles.section}>
            <h2 className={styles.sectionTitle}>Overview</h2>
            <div className={styles.features}>
              <div className={styles.featureItem}>
                <span className={styles.featureLabel}>Type</span>
                <span className={styles.featureValue}>{property.propertyType}</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureLabel}>Bedrooms</span>
                <span className={styles.featureValue}>{property.bedrooms}</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureLabel}>Bathrooms</span>
                <span className={styles.featureValue}>{property.bathrooms}</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureLabel}>Size</span>
                <span className={styles.featureValue}>{property.size} sqft</span>
              </div>
            </div>
          </Card>

          <Card className={styles.section}>
            <h2 className={styles.sectionTitle}>Description</h2>
            <p className={styles.description}>{property.description}</p>
          </Card>
        </div>

        <div className={styles.sidebar}>
          <Card padding="lg" shadow="md" className={styles.actionCard}>
            <div className={styles.priceRow}>
              <span className={styles.price}>৳ {property.rent.toLocaleString()}</span>
              <span className={styles.period}>/ month</span>
            </div>
            
            <div className={styles.depositRow}>
              <span className={styles.depositLabel}>Security Deposit</span>
              <span className={styles.depositValue}>
                {property.securityDeposit ? `৳${property.securityDeposit.toLocaleString()}` : 'None'}
              </span>
            </div>

            <TenantPropertyActions 
              propertyId={property.id} 
              landlordId={property.ownerId} 
              userRole="tenant" 
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
