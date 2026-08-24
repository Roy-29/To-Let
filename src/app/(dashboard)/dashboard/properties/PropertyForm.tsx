"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Card } from '@/components/ui/Card/Card';
import { createPropertyAction, updatePropertyAction } from './formActions';
import styles from './propertyForm.module.css';

export default function PropertyForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const isEditing = !!initialData;
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    propertyType: initialData?.propertyType || 'APARTMENT',
    address: initialData?.address || '',
    area: initialData?.area || '',
    city: initialData?.city || '',
    rent: initialData?.rent || '',
    securityDeposit: initialData?.securityDeposit || '',
    bedrooms: initialData?.bedrooms || '',
    bathrooms: initialData?.bathrooms || '',
    size: initialData?.size || '',
    floor: initialData?.floor || '',
    totalFloors: initialData?.totalFloors || '',
    furnishingStatus: initialData?.furnishingStatus || 'UNFURNISHED',
    parking: initialData?.parking || false,
    rules: initialData?.rules || '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        rent: Number(formData.rent),
        securityDeposit: formData.securityDeposit ? Number(formData.securityDeposit) : undefined,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        size: formData.size ? Number(formData.size) : undefined,
        floor: formData.floor ? Number(formData.floor) : undefined,
        totalFloors: formData.totalFloors ? Number(formData.totalFloors) : undefined,
      };

      if (isEditing) {
        await updatePropertyAction(initialData.id, payload);
      } else {
        await createPropertyAction(payload);
      }
      router.push('/dashboard/properties');
    } catch (err: any) {
      alert(err.message || 'Failed to save property.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.sectionTitle}>Basic Info</h2>
        <div className={styles.grid2}>
          <Input label="Title *" name="title" value={formData.title} onChange={handleChange} required />
          <div className={styles.field}>
            <label className={styles.label}>Property Type *</label>
            <select name="propertyType" value={formData.propertyType} onChange={handleChange} className={styles.select}>
              <option value="APARTMENT">Apartment</option>
              <option value="HOUSE">House</option>
              <option value="ROOM">Room</option>
              <option value="SUBLET">Sublet</option>
              <option value="HOSTEL">Hostel</option>
              <option value="OFFICE">Office</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <h2 className={styles.sectionTitle}>Location</h2>
        <div className={styles.grid2}>
          <Input label="Address *" name="address" value={formData.address} onChange={handleChange} required />
          <Input label="Area" name="area" value={formData.area} onChange={handleChange} />
          <Input label="City *" name="city" value={formData.city} onChange={handleChange} required />
        </div>

        <h2 className={styles.sectionTitle}>Pricing</h2>
        <div className={styles.grid2}>
          <Input label="Monthly Rent *" name="rent" type="number" value={formData.rent} onChange={handleChange} required />
          <Input label="Security Deposit" name="securityDeposit" type="number" value={formData.securityDeposit} onChange={handleChange} />
        </div>

        <h2 className={styles.sectionTitle}>Details</h2>
        <div className={styles.grid3}>
          <Input label="Bedrooms *" name="bedrooms" type="number" value={formData.bedrooms} onChange={handleChange} required />
          <Input label="Bathrooms *" name="bathrooms" type="number" value={formData.bathrooms} onChange={handleChange} required />
          <Input label="Size (sqft)" name="size" type="number" value={formData.size} onChange={handleChange} />
          <Input label="Floor" name="floor" type="number" value={formData.floor} onChange={handleChange} />
          <Input label="Total Floors" name="totalFloors" type="number" value={formData.totalFloors} onChange={handleChange} />
          <div className={styles.field}>
            <label className={styles.label}>Furnishing Status</label>
            <select name="furnishingStatus" value={formData.furnishingStatus} onChange={handleChange} className={styles.select}>
              <option value="UNFURNISHED">Unfurnished</option>
              <option value="SEMI_FURNISHED">Semi-Furnished</option>
              <option value="FURNISHED">Furnished</option>
            </select>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" name="parking" checked={formData.parking} onChange={handleChange} />
            Parking Available
          </label>
        </div>

        <div className={styles.actions}>
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : (isEditing ? 'Update Property' : 'Create Property')}
          </Button>
        </div>
      </form>
    </Card>
  );
}
