import React from 'react';
import { notFound } from 'next/navigation';
import { getPropertyById } from '@/services/propertyService';
import { getCurrentUser } from '@/lib/session';
import { Button } from '@/components/ui/Button/Button';
import { Card } from '@/components/ui/Card/Card';
import { Badge } from '@/components/ui/Badge/Badge';
import styles from './property-details.module.css';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const property = await getPropertyById(params.id);
    return {
      title: `${property.title} | Thikana`,
      description: `Rent this ${property.bedrooms} bed, ${property.bathrooms} bath ${property.propertyType.toLowerCase()} in ${property.area}, ${property.city} for ৳${property.rent.toLocaleString()}/month.`,
      openGraph: {
        title: `${property.title} | Thikana`,
        description: `Rent this ${property.bedrooms} bed ${property.propertyType.toLowerCase()} in ${property.area}.`,
        images: property.images?.[0] ? [property.images[0].url] : [],
      },
    };
  } catch {
    return {
      title: 'Property Not Found | Thikana',
    };
  }
}

export default async function PropertyDetailsPage({ params }: { params: { id: string } }) {
  let property;
  try {
    property = await getPropertyById(params.id);
  } catch (err) {
    notFound();
  }

  const user = await getCurrentUser();
  const isOwner = user?.id === property.ownerId;
  const isTenant = user?.role === 'TENANT';

  return (
    <div className={styles.container}>
      {/* Gallery */}
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

            <hr className={styles.divider} />

            <div className={styles.actions}>
              {isOwner ? (
                <Button fullWidth variant="secondary">Manage Property</Button>
              ) : isTenant ? (
                <>
                  <Button fullWidth variant="primary">Apply Now</Button>
                  <Button fullWidth variant="outline">Request Visit</Button>
                  <Button fullWidth variant="ghost">Message Landlord</Button>
                </>
              ) : (
                <Button fullWidth variant="primary">Log in to Apply</Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
