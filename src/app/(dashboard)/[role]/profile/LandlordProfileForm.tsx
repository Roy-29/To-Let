"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Card } from '@/components/ui/Card/Card';
import { updateLandlordProfileAction } from './actions';
import styles from './profile.module.css';

export default function LandlordProfileForm({ user, profile }: { user: any, profile: any }) {
  const [formData, setFormData] = useState({
    phone: profile.phone || '',
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateLandlordProfileAction(formData);
      alert('Profile updated successfully');
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Landlord Profile</h1>
        <p className={styles.subtitle}>Update your contact information.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className={styles.form}>
          
          <h2 className={styles.sectionTitle}>Account Details</h2>
          <div className={styles.formGrid}>
            <Input label="Full Name" value={user.name} disabled />
            <Input label="Email" value={user.email} disabled />
            <Input label="Unique Code" value={user.uniqueCode || ''} disabled />
            <Input 
              label="Phone Number" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
            />
          </div>

          <div className={styles.actions}>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
