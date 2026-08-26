import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button/Button';
import { Card } from '@/components/ui/Card/Card';
import { Input } from '@/components/ui/Input/Input';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import styles from './properties.module.css';
import { searchProperties } from '@/services/propertySearchService';

export const dynamic = 'force-dynamic';

export default async function PropertiesPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  // We use the search service with real parameters
  const params = await searchParams;
  const query = params.q || '';
  const propertyType = params.propertyType as any || undefined;
  const minRent = params.minPrice ? parseInt(params.minPrice) : undefined;
  const maxRent = params.maxPrice ? parseInt(params.maxPrice) : undefined;
  
  const results = await searchProperties({
    sortBy: "NEWEST",
    city: query ? query : undefined,
    propertyType,
    minRent,
    maxRent,
    page: 1,
    limit: 12
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Find Homes</h1>
        <p className={styles.subtitle}>Discover the perfect property for you</p>
      </div>

      <div className={styles.layout}>
        {/* Sidebar Filters */}
        <aside className={styles.sidebar}>
          <Card padding="md" shadow="sm">
            <h2 className={styles.filterTitle}>Filters</h2>
            <form className={styles.filterForm}>
              <Input 
                label="Search location" 
                name="q" 
                defaultValue={query} 
                placeholder="City, area..." 
              />
              
              <div className={styles.filterGroup}>
                <label className={styles.label}>Property Type</label>
                <select name="propertyType" className={styles.select} defaultValue={propertyType || ''}>
                  <option value="">Any Type</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="HOUSE">House</option>
                  <option value="ROOM">Room</option>
                </select>
              </div>

              <div className={styles.priceGroup}>
                <Input 
                  label="Min Price (৳)" 
                  name="minPrice" 
                  type="number" 
                  defaultValue={minRent} 
                  placeholder="0" 
                />
                <Input 
                  label="Max Price (৳)" 
                  name="maxPrice" 
                  type="number" 
                  defaultValue={maxRent} 
                  placeholder="Any" 
                />
              </div>

              <Button type="submit" fullWidth>Apply Filters</Button>
            </form>
          </Card>
        </aside>

        {/* Main Results */}
        <main className={styles.main}>
          <div className={styles.resultsHeader}>
            <span className={styles.resultsCount}>
              Showing <strong>{results.total}</strong> properties
            </span>
          </div>

          {results.properties.length > 0 ? (
            <div className={styles.propertyGrid}>
              {results.properties.map((property: any) => (
                <Link key={property.id} href={`/properties/${property.id}`}>
                  <Card className={styles.propertyCard} padding="none">
                    <div className={styles.imagePlaceholder}>
                      {property.images?.[0] ? (
                        <Image 
                          src={property.images[0].url} 
                          alt={property.title} 
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
                        <span className={styles.price}>৳ {property.rent.toLocaleString()}</span>
                        <span className={styles.period}>/ month</span>
                      </div>
                      <h3 className={styles.propertyTitle}>{property.title}</h3>
                      <p className={styles.propertyLocation}>{property.address}, {property.city}</p>
                      
                      <div className={styles.features}>
                        <span>{property.bedrooms} Bed</span>
                        <span>•</span>
                        <span>{property.bathrooms} Bath</span>
                        <span>•</span>
                        <span>{property.size} sqft</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState 
              title="No properties found" 
              description="Try adjusting your filters or search terms."
            />
          )}
        </main>
      </div>
    </div>
  );
}
