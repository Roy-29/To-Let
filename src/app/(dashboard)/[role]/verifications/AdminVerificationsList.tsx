"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button/Button';
import Link from 'next/link';
import styles from '../users/users.module.css';

export default function AdminVerificationsList({ initialData }: { initialData: any }) {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Landlord Verifications</h1>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Submitted Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialData.profiles.map((p: any) => (
              <tr key={p.userId}>
                <td>{p.user.name}</td>
                <td>{p.user.email}</td>
                <td>{p.phone}</td>
                <td>
                  <span className={`${styles.badge} ${p.verificationStatus === 'PENDING' ? styles.badgeSuspended : styles.badgeActive}`}>
                    {p.verificationStatus}
                  </span>
                </td>
                <td>{new Date(p.updatedAt).toLocaleDateString()}</td>
                <td>
                  <div className={styles.actions}>
                    <Link href={`/verifications/${p.userId}`}>
                      <Button variant="outline" size="sm">Review</Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {initialData.profiles.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No pending verifications.</td>
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
              router.push(`/verifications?${params.toString()}`);
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
              router.push(`/verifications?${params.toString()}`);
            }}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
