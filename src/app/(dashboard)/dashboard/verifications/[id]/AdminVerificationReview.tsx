"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button/Button';
import Link from 'next/link';
import { approveLandlordAction, rejectLandlordAction } from '../actions';
import styles from '../../users/users.module.css';

export default function AdminVerificationReview({ profile }: { profile: any }) {
  const router = useRouter();
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const handleApprove = async () => {
    try {
      await approveLandlordAction(profile.userId);
      router.push('/dashboard/verifications');
    } catch (e) {
      alert("Error approving landlord");
    }
  };

  const handleReject = async () => {
    if (!rejectReason) {
      alert("Please provide a reason");
      return;
    }
    try {
      await rejectLandlordAction(profile.userId, rejectReason);
      router.push('/dashboard/verifications');
    } catch (e) {
      alert("Error rejecting landlord");
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Verification Detail</h1>
        <Link href="/dashboard/verifications" className={styles.input}>Back</Link>
      </div>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <h2>{profile.user.name}</h2>
        <p>Email: {profile.user.email}</p>
        <p>Phone: {profile.phone}</p>
        <p>Status: <span className={`${styles.badge} ${profile.verificationStatus === 'PENDING' ? styles.badgeSuspended : styles.badgeActive}`}>{profile.verificationStatus}</span></p>
        <p>Submitted: {new Date(profile.updatedAt).toLocaleString()}</p>
        
        {profile.documents && profile.documents.length > 0 && (
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
            <h3>Documents</h3>
            <ul>
              {profile.documents.map((doc: string, idx: number) => (
                <li key={idx}><a href={doc} target="_blank" rel="noopener noreferrer">{doc}</a></li>
              ))}
            </ul>
          </div>
        )}

        {profile.verificationStatus === 'PENDING' && (
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem', display: 'flex', gap: '1rem', flexDirection: 'column' }}>
            <h3>Actions</h3>
            {!isRejecting ? (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button onClick={handleApprove}>Approve</Button>
                <Button variant="danger" onClick={() => setIsRejecting(true)}>Reject</Button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', maxWidth: '400px' }}>
                <textarea 
                  className={styles.input} 
                  placeholder="Reason for rejection..." 
                  value={rejectReason} 
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                />
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Button variant="danger" onClick={handleReject}>Confirm Rejection</Button>
                  <Button variant="outline" onClick={() => setIsRejecting(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
