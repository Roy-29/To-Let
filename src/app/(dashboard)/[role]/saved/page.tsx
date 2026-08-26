import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { listMyFavorites } from '@/services/favoriteService';
import { Card } from '@/components/ui/Card/Card';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import RemoveFavoriteButton from './RemoveFavoriteButton';
import styles from './saved.module.css';

export default async function SavedHomesPage({ searchParams }: { searchParams: { page?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'TENANT') redirect(`/${user.role.toLowerCase()}/dashboard`);

  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const { favorites, total } = await listMyFavorites(user.id, page, 12);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Saved Homes</h1>
        <p className={styles.subtitle}>You have {total} saved properties.</p>
      </div>

      {favorites.length > 0 ? (
        <div className={styles.grid}>
          {favorites.map((fav) => (
            <Card key={fav.id} className={styles.propertyCard} padding="none">
              <div className={styles.imagePlaceholder}>
                {fav.property.images?.[0] ? (
                  <Image 
                    src={fav.property.images[0].url} 
                    alt={fav.property.title} 
                    className={styles.image} 
                    width={400} 
                    height={250} 
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className={styles.noImage}>No Image</div>
                )}
              </div>
              <div className={styles.propertyInfo}>
                <div className={styles.priceRow}>
                  <span className={styles.price}>৳{fav.property.rent.toLocaleString()}</span>
                  <span className={styles.period}>/mo</span>
                </div>
                <h3 className={styles.propertyTitle}>{fav.property.title}</h3>
                <p className={styles.propertyLocation}>{fav.property.address}, {fav.property.city}</p>
                
                <div className={styles.features}>
                  <span>{fav.property.bedrooms} Bed</span>
                  <span>•</span>
                  <span>{fav.property.bathrooms} Bath</span>
                  <span>•</span>
                  <Badge variant={fav.property.status === 'PUBLISHED' ? 'success' : 'secondary'}>
                    {fav.property.status}
                  </Badge>
                </div>

                <div className={styles.actions}>
                  <Link href={`/properties/${fav.property.id}`} className={styles.actionLink}>
                    <Button variant="primary" fullWidth>View Details</Button>
                  </Link>
                  <RemoveFavoriteButton propertyId={fav.property.id} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div style={{marginTop: '2rem'}}>
          <EmptyState 
            title="No saved homes" 
            description="Properties you favorite will appear here." 
          />
          <div style={{marginTop: '1rem', textAlign: 'center'}}>
            <Link href="/properties">
              <Button>Browse Properties</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
