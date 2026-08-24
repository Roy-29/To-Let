"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button/Button';
import Link from 'next/link';
import { suspendUserAction, reactivateUserAction } from './actions';
import styles from './users.module.css';
export default function AdminUsersList({ initialData, currentFilters }: { initialData: any, currentFilters: any }) {
  const router = useRouter();
  const [search, setSearch] = useState(currentFilters.search || '');
  const [role, setRole] = useState(currentFilters.role || '');
  const [status, setStatus] = useState(currentFilters.status || '');
  const [targetUser, setTargetUser] = useState<any>(null);
  const [actionType, setActionType] = useState<'SUSPEND' | 'REACTIVATE' | null>(null);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (role) params.set('role', role);
    if (status) params.set('status', status);
    router.push(`/dashboard/users?${params.toString()}`);
  };

  const handleAction = async () => {
    if (!targetUser || !actionType) return;
    try {
      if (actionType === 'SUSPEND') {
        await suspendUserAction(targetUser.id);
      } else {
        await reactivateUserAction(targetUser.id);
      }
      setTargetUser(null);
      setActionType(null);
    } catch (e) {
      alert("An error occurred");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>User Management</h1>
      </div>

      <div className={styles.filters}>
        <input 
          type="text" 
          placeholder="Search by name or email" 
          className={styles.input}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className={styles.select} value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All Roles</option>
          <option value="TENANT">Tenant</option>
          <option value="LANDLORD">Landlord</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
        <Button variant="outline" onClick={applyFilters}>Filter</Button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialData.users.map((u: any) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <span className={`${styles.badge} ${u.status === 'ACTIVE' ? styles.badgeActive : styles.badgeSuspended}`}>
                    {u.status}
                  </span>
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className={styles.actions}>
                    <Link href={`/dashboard/users/${u.id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                    {u.status === 'ACTIVE' ? (
                      <Button variant="outline" size="sm" onClick={() => { setTargetUser(u); setActionType('SUSPEND'); }}>Suspend</Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => { setTargetUser(u); setActionType('REACTIVATE'); }}>Reactivate</Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {initialData.users.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No users found.</td>
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
              router.push(`/dashboard/users?${params.toString()}`);
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
              router.push(`/dashboard/users?${params.toString()}`);
            }}
          >
            Next
          </Button>
        </div>
      )}

    </div>
  );
}
