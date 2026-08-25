"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button/Button';
import Link from 'next/link';
import styles from '../users/users.module.css';

export default function AdminReportsList({ initialData, currentFilters }: { initialData: any, currentFilters: any }) {
  const router = useRouter();
  const [search, setSearch] = useState(currentFilters.search || '');
  const [status, setStatus] = useState(currentFilters.status || '');
  const [targetType, setTargetType] = useState(currentFilters.targetType || '');

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (targetType) params.set('targetType', targetType);
    router.push(`/reports?${params.toString()}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Reports Management</h1>
      </div>

      <div className={styles.filters}>
        <input 
          type="text" 
          placeholder="Search by reason..." 
          className={styles.input}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="RESOLVED">Resolved</option>
          <option value="DISMISSED">Dismissed</option>
        </select>
        <select className={styles.select} value={targetType} onChange={(e) => setTargetType(e.target.value)}>
          <option value="">All Target Types</option>
          <option value="PROPERTY">Property</option>
          <option value="USER">User</option>
          <option value="MESSAGE">Message</option>
        </select>
        <Button variant="outline" onClick={applyFilters}>Filter</Button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Reporter</th>
              <th>Target Type</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialData.reports.map((r: any) => (
              <tr key={r.id}>
                <td>{r.reporter?.name}</td>
                <td>{r.targetType}</td>
                <td>{r.reason}</td>
                <td>
                  <span className={`${styles.badge} ${r.status === 'OPEN' ? styles.badgeSuspended : (r.status === 'UNDER_REVIEW' ? '' : styles.badgeActive)}`}>
                    {r.status}
                  </span>
                </td>
                <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className={styles.actions}>
                    <Link href={`/reports/${r.id}`}>
                      <Button variant="outline" size="sm">Review</Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {initialData.reports.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No reports found.</td>
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
              router.push(`/reports?${params.toString()}`);
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
              router.push(`/reports?${params.toString()}`);
            }}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
