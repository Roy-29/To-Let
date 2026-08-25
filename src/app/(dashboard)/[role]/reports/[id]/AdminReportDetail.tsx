"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button/Button';
import Link from 'next/link';
import { startReportReviewAction, resolveReportAction, dismissReportAction } from '../actions';
import styles from '../../users/users.module.css';

export default function AdminReportDetail({ report }: { report: any }) {
  const router = useRouter();
  const [resolutionNote, setResolutionNote] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);

  const handleStartReview = async () => {
    try {
      await startReportReviewAction(report.id);
    } catch (e) {
      alert("Error starting review");
    }
  };

  const handleResolve = async () => {
    if (!resolutionNote) {
      alert("Please provide a resolution note");
      return;
    }
    try {
      await resolveReportAction(report.id, resolutionNote);
      setIsResolving(false);
    } catch (e) {
      alert("Error resolving report");
    }
  };

  const handleDismiss = async () => {
    if (!resolutionNote) {
      alert("Please provide a dismissal note");
      return;
    }
    try {
      await dismissReportAction(report.id, resolutionNote);
      setIsDismissing(false);
    } catch (e) {
      alert("Error dismissing report");
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Report Detail</h1>
        <Link href={`/admin/reports`} className={styles.input}>Back</Link>
      </div>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <h2>Report for {report.targetType}</h2>
        <p>Reporter: {report.reporter?.name} ({report.reporter?.email})</p>
        <p>Target ID: {report.targetId}</p>
        <p>Status: <span className={`${styles.badge} ${report.status === 'OPEN' ? styles.badgeSuspended : (report.status === 'UNDER_REVIEW' ? '' : styles.badgeActive)}`}>{report.status}</span></p>
        <p>Reason: {report.reason}</p>
        <p>Description: {report.description}</p>
        <p>Created: {new Date(report.createdAt).toLocaleString()}</p>
        
        {(report.status === 'RESOLVED' || report.status === 'DISMISSED') && (
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
            <h3>Resolution</h3>
            <p>Resolved At: {report.resolvedAt ? new Date(report.resolvedAt).toLocaleString() : 'N/A'}</p>
            <p>Note: {report.resolutionNote}</p>
          </div>
        )}

        {(report.status === 'OPEN' || report.status === 'UNDER_REVIEW') && (
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem', display: 'flex', gap: '1rem', flexDirection: 'column' }}>
            <h3>Actions</h3>
            
            {!isResolving && !isDismissing && (
              <div style={{ display: 'flex', gap: '1rem' }}>
                {report.status === 'OPEN' && <Button onClick={handleStartReview}>Start Review</Button>}
                <Button variant="outline" onClick={() => setIsResolving(true)}>Resolve</Button>
                <Button variant="danger" onClick={() => setIsDismissing(true)}>Dismiss</Button>
              </div>
            )}

            {(isResolving || isDismissing) && (
              <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', maxWidth: '400px' }}>
                <textarea 
                  className={styles.input} 
                  placeholder="Note for resolution/dismissal..." 
                  value={resolutionNote} 
                  onChange={(e) => setResolutionNote(e.target.value)}
                  rows={4}
                />
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {isResolving ? (
                    <Button onClick={handleResolve}>Confirm Resolve</Button>
                  ) : (
                    <Button variant="danger" onClick={handleDismiss}>Confirm Dismiss</Button>
                  )}
                  <Button variant="outline" onClick={() => { setIsResolving(false); setIsDismissing(false); }}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
