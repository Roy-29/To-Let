"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button/Button';
import Link from 'next/link';
import { approvePropertyAction, rejectPropertyAction, requestPropertyChangesAction } from '../actions';
import styles from '../../users/users.module.css'; // Reusing for consistency
import propertyStyles from '../properties.module.css';

export default function AdminPropertyReview({ property, adminId }: { property: any, adminId: string }) {
  const router = useRouter();
  const [rejectReason, setRejectReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [isRequestingChanges, setIsRequestingChanges] = useState(false);

  const handleApprove = async () => {
    try {
      await approvePropertyAction(property.id);
      router.push('/admin/properties');
    } catch (e) {
      alert("Error approving property");
    }
  };

  const handleReject = async () => {
    if (!rejectReason) {
      alert("Please provide a reason");
      return;
    }
    try {
      await rejectPropertyAction(property.id, rejectReason);
      router.push('/admin/properties');
    } catch (e) {
      alert("Error rejecting property");
    }
  };

  const handleRequestChanges = async () => {
    if (!feedback) {
      alert("Please provide feedback");
      return;
    }
    try {
      await requestPropertyChangesAction(property.id, feedback);
      router.push('/admin/properties');
    } catch (e) {
      alert("Error requesting changes");
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Property Review</h1>
        <Link href={`/admin/properties`} className={styles.input}>Back</Link>
      </div>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <h2>{property.title}</h2>
        <p>Landlord: {property.owner?.name} ({property.owner?.email})</p>
        <p>Status: <span className={`${styles.badge} ${property.status === 'PUBLISHED' ? styles.badgeActive : styles.badgeSuspended}`}>{property.status}</span></p>
        <p>Location: {property.address}, {property.city}, {property.state} {property.zipCode}</p>
        <p>Rent: ${property.rentAmount} | Deposit: ${property.depositAmount}</p>
        <p>Bedrooms: {property.bedrooms} | Bathrooms: {property.bathrooms}</p>
        <p>Description: {property.description}</p>
        
        {property.status === 'PENDING_REVIEW' && (
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem', display: 'flex', gap: '1rem', flexDirection: 'column' }}>
            <h3>Actions</h3>
            
            {!isRejecting && !isRequestingChanges && (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button onClick={handleApprove}>Approve</Button>
                <Button variant="outline" onClick={() => setIsRequestingChanges(true)}>Request Changes</Button>
                <Button variant="danger" onClick={() => setIsRejecting(true)}>Reject</Button>
              </div>
            )}

            {isRejecting && (
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

            {isRequestingChanges && (
              <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', maxWidth: '400px' }}>
                <textarea 
                  className={styles.input} 
                  placeholder="Feedback for landlord..." 
                  value={feedback} 
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                />
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Button variant="outline" onClick={handleRequestChanges}>Submit Request</Button>
                  <Button variant="outline" onClick={() => setIsRequestingChanges(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
