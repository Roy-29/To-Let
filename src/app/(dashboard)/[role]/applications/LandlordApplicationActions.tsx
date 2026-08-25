"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { reviewApplicationAction, approveApplicationAction, rejectApplicationAction } from './actions';
import styles from './applications.module.css';

export default function LandlordApplicationActions({ applicationId, status }: { applicationId: string, status: string }) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleAction(actionType: 'REVIEW' | 'APPROVE' | 'REJECT') {
    setIsLoading(true);
    try {
      if (actionType === 'REVIEW') {
        await reviewApplicationAction(applicationId);
      } else if (actionType === 'APPROVE') {
        await approveApplicationAction(applicationId);
      } else if (actionType === 'REJECT') {
        await rejectApplicationAction(applicationId);
      }
    } catch (err: any) {
      alert(err.message || 'Action failed.');
    } finally {
      setIsLoading(false);
    }
  }

  if (status === 'APPROVED' || status === 'REJECTED' || status === 'WITHDRAWN') {
    return null;
  }

  return (
    <div className={styles.actionButtons}>
      {status === 'SUBMITTED' && (
        <Button size="sm" variant="outline" onClick={() => handleAction('REVIEW')} disabled={isLoading}>
          Mark Under Review
        </Button>
      )}
      {(status === 'SUBMITTED' || status === 'UNDER_REVIEW') && (
        <>
          <Button size="sm" variant="primary" onClick={() => handleAction('APPROVE')} disabled={isLoading}>
            Approve
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleAction('REJECT')} disabled={isLoading}>
            Reject
          </Button>
        </>
      )}
    </div>
  );
}
