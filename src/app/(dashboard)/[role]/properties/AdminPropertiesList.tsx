"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button/Button';
import Link from 'next/link';
import styles from '../users/users.module.css';

export default function AdminPropertiesList({ initialData, currentFilters }: { initialData: any, currentFilters: any }) {
  const router = useRouter();
  const [search, setSearch] = useState(currentFilters.search || '');
  const [status, setStatus] = useState(currentFilters.status || '');

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Property Moderation</h1>
      </div>

      <div className={styles.filters}>
        <input 
          type="text" 
          placeholder="Search properties or landlords..." 
          className={styles.input}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="PENDING_REVIEW">Pending Review</option>
          <option value="PUBLISHED">Published</option>
          <option value="REJECTED">Rejected</option>
          <option value="PAUSED">Paused</option>
          <option value="RENTED">Rented</option>
        </select>
        <Button variant="outline" onClick={applyFilters}>Filter</Button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>City</th>
              <th>Landlord</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialData.properties.map((p: any) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{p.city}</td>
                <td>{p.owner?.name}</td>
                <td>
                  <span className={`${styles.badge} ${p.status === 'PUBLISHED' ? styles.badgeActive : styles.badgeSuspended}`}>
                    {p.status}
                  </span>
                </td>
                <td>{new Date(p.updatedAt).toLocaleDateString()}</td>
                <td>
                  <div className={styles.actions}>
                    <Link href={`/properties/${p.id}`}>
                      <Button variant="outline" size="sm">Review</Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {initialData.properties.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No properties found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {initialData.totalPages > 1 && (
        <div className={styles.pagination}>
          <Button 
            variant="outline" 
            disabled={initialData.page <= 1}
            onClick={() => {
              const params = new URLSearchParams(window.location.search);
              params.set('page', (initialData.page - 1).toString());
              router.push(`/properties?${params.toString()}`);
            }}
          >
            Previous
          </Button>
          <span>Page {initialData.page} of {initialData.totalPages}</span>
          <Button 
            variant="outline" 
            disabled={initialData.page >= initialData.totalPages}
            onClick={() => {
              const params = new URLSearchParams(window.location.search);
              params.set('page', (initialData.page + 1).toString());
              router.push(`/properties?${params.toString()}`);
            }}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
