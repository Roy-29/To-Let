import React from 'react';
import styles from './about.module.css';
import { Card } from '@/components/ui/Card/Card';

export const metadata = {
  title: 'About Us - Thikana',
  description: 'Learn more about Thikana, the premier property rental marketplace.',
};

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>About Thikana</h1>
          <p className={styles.subtitle}>
            Empowering tenants and landlords with a modern, trustworthy, and seamless rental experience.
          </p>
        </div>

        <div className={styles.content}>
          <Card className={styles.card}>
            <h2>Our Mission</h2>
            <p>
              At Thikana, we believe finding a home should be simple and transparent. We've built a 
              marketplace that removes the friction from renting, offering advanced tools for property 
              management, direct messaging, and secure application tracking.
            </p>
            
            <h2 style={{ marginTop: '2rem' }}>Why Choose Us?</h2>
            <ul className={styles.list}>
              <li><strong>Verified Listings:</strong> We ensure properties are genuine and accurately represented.</li>
              <li><strong>Direct Communication:</strong> Chat directly with landlords without hidden middlemen.</li>
              <li><strong>Smart Management:</strong> Landlords get an integrated ERP to manage tenants, rent, and maintenance.</li>
              <li><strong>Secure & Private:</strong> Your data and communication are always protected.</li>
            </ul>
          </Card>
        </div>
      </main>
    </div>
  );
}
