"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Card } from '@/components/ui/Card/Card';
import { updateTenantProfileAction } from './actions';
import styles from './profile.module.css';

export default function TenantProfileForm({ user, profile }: { user: any, profile: any }) {
  const [formData, setFormData] = useState({
    phone: profile.phone || '',
    preferredLocation: profile.preferredLocation || '',
    minimumBudget: profile.minimumBudget || '',
    maximumBudget: profile.maximumBudget || '',
    preferredPropertyType: profile.preferredPropertyType || '',
    bedrooms: profile.bedrooms || '',
    bathrooms: profile.bathrooms || '',
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        minimumBudget: formData.minimumBudget ? Number(formData.minimumBudget) : undefined,
        maximumBudget: formData.maximumBudget ? Number(formData.maximumBudget) : undefined,
        bedrooms: formData.bedrooms ? Number(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms ? Number(formData.bathrooms) : undefined,
      };
      await updateTenantProfileAction(payload);
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
        <h1 className={styles.title}>My Profile</h1>
        <p className={styles.subtitle}>Update your personal information and preferences.</p>
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

          <h2 className={styles.sectionTitle}>Rental Preferences</h2>
          <div className={styles.formGrid}>
            <Input 
              label="Preferred Location" 
              name="preferredLocation" 
              value={formData.preferredLocation} 
              onChange={handleChange} 
            />
            <Input 
              label="Preferred Property Type" 
              name="preferredPropertyType" 
              value={formData.preferredPropertyType} 
              onChange={handleChange} 
              placeholder="e.g. APARTMENT"
            />
            <Input 
              label="Min Budget" 
              name="minimumBudget" 
              type="number" 
              value={formData.minimumBudget} 
              onChange={handleChange} 
            />
            <Input 
              label="Max Budget" 
              name="maximumBudget" 
              type="number" 
              value={formData.maximumBudget} 
              onChange={handleChange} 
            />
            <Input 
              label="Bedrooms" 
              name="bedrooms" 
              type="number" 
              value={formData.bedrooms} 
              onChange={handleChange} 
            />
            <Input 
              label="Bathrooms" 
              name="bathrooms" 
              type="number" 
              value={formData.bathrooms} 
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
