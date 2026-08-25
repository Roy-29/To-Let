"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button/Button';
import { Card } from '@/components/ui/Card/Card';
import { Input } from '@/components/ui/Input/Input';
import { Select } from '@/components/ui/Select/Select';
import { createMaintenanceAction } from '../actions';
import styles from '../maintenance.module.css';

export default function NewMaintenanceRequestPage({ params }: { params: { role: string } }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('PLUMBING');
  const [priority, setPriority] = useState('LOW');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as any,
      priority: formData.get('priority') as any,
    };

    try {
      await createMaintenanceAction(data);
      router.push(`/${params.role}/maintenance`);
    } catch (err: any) {
      setError(err.message || 'Failed to submit request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>New Maintenance Request</h1>
        <p className={styles.subtitle}>Report a new issue for your property.</p>
      </div>

      <Card padding="lg" shadow="sm" style={{ maxWidth: '600px', marginTop: '2rem' }}>
        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Input 
            label="Title" 
            name="title" 
            required 
            placeholder="e.g. Leaking faucet in master bathroom"
          />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Category
            </label>
            <Select 
              name="category"
              value={category}
              onChange={setCategory}
              options={[
                { value: 'PLUMBING', label: 'Plumbing' },
                { value: 'ELECTRICAL', label: 'Electrical' },
                { value: 'AC', label: 'AC' },
                { value: 'APPLIANCE', label: 'Appliance' },
                { value: 'SECURITY', label: 'Security' },
                { value: 'CLEANING', label: 'Cleaning' },
                { value: 'OTHER', label: 'Other' },
              ]}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Priority
            </label>
            <Select 
              name="priority"
              value={priority}
              onChange={setPriority}
              options={[
                { value: 'LOW', label: 'Low' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'HIGH', label: 'High' },
                { value: 'URGENT', label: 'Urgent' },
              ]}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Description
            </label>
            <textarea 
              name="description" 
              required 
              rows={4}
              placeholder="Please describe the issue in detail..."
              style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
