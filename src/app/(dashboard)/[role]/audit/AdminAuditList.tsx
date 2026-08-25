"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button/Button';
import styles from '../users/users.module.css';

export default function AdminAuditList({ initialData, currentFilters }: { initialData: any, currentFilters: any }) {
  const router = useRouter();
  const [action, setAction] = useState(currentFilters.action || '');
  const [entityType, setEntityType] = useState(currentFilters.entityType || '');

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (action) params.set('action', action);
    if (entityType) params.set('entityType', entityType);
    router.push(`/audit?${params.toString()}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Audit Logs</h1>
      </div>

      <div className={styles.filters}>
        <input 
          type="text" 
          placeholder="Filter by Action (e.g. USER_SUSPENDED)" 
          className={styles.input}
          value={action}
          onChange={(e) => setAction(e.target.value)}
        />
        <select className={styles.select} value={entityType} onChange={(e) => setEntityType(e.target.value)}>
          <option value="">All Entities</option>
          <option value="USER">User</option>
          <option value="PROPERTY">Property</option>
          <option value="REPORT">Report</option>
        </select>
        <Button variant="outline" onClick={applyFilters}>Filter</Button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Entity Type</th>
              <th>Entity ID</th>
              <th>Metadata</th>
            </tr>
          </thead>
          <tbody>
            {initialData.logs.map((log: any) => (
              <tr key={log.id}>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
                <td>{log.actor?.name || log.actorId}</td>
                <td>{log.action}</td>
                <td>{log.entityType}</td>
                <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{log.entityId}</span></td>
                <td>
                  {log.metadata ? (
                    <pre style={{ margin: 0, fontSize: '0.75rem', maxWidth: '200px', overflowX: 'auto' }}>
                      {log.metadata}
                    </pre>
                  ) : 'N/A'}
                </td>
              </tr>
            ))}
            {initialData.logs.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No audit logs found.</td>
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
              router.push(`/audit?${params.toString()}`);
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
              router.push(`/audit?${params.toString()}`);
            }}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
