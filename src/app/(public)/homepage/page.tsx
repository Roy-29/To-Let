import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Card } from '@/components/ui/Card/Card';
import { HeroSearchForm } from '@/components/ui/HeroSearchForm/HeroSearchForm';
import styles from './page.module.css';
import { searchProperties } from '@/services/propertySearchService';

// This is a server component
export default async function HomePage() {
  // Fetch a few featured properties
  const featured = await searchProperties({
    sortBy: "NEWEST",
    page: 1,
    limit: 3
  });
  
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Find Your Perfect <span className="gradient-text">Thikana</span>
          </h1>
          <p className={styles.heroSubtitle}>
            The premium rental marketplace for Bangladesh. Discover homes, connect directly with landlords, and manage your tenancy seamlessly.
          </p>
          
          <Card className={styles.searchCard} padding="lg" shadow="md">
            <HeroSearchForm 
              className={styles.searchForm}
              inputGroupClassName={styles.searchInputGroup}
              controlsClassName={styles.searchControls}
            />
          </Card>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className={styles.featured}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Featured Properties</h2>
          <Link href="/properties">
            <Button variant="ghost">View all</Button>
          </Link>
        </div>
        
        <div className={styles.propertyGrid}>
          {featured.properties.length > 0 ? (
            featured.properties.map((property: any) => (
              <Card key={property.id} className={styles.propertyCard} padding="none">
                <div className={styles.imagePlaceholder}>
                  {/* Real image would go here. We're using placeholder block for now as per MVP */}
                  {property.images?.[0] ? (
                    <img src={property.images[0].url} alt={property.title} className={styles.image} />
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
            ))
          ) : (
            <p className={styles.emptyText}>No properties available right now.</p>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Own a property?</h2>
          <p className={styles.ctaSubtitle}>
            List your property on Thikana to find verified tenants and manage rent collection effortlessly.
          </p>
          <Link href="/login">
            <Button variant="secondary" size="lg">List Your Property</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
