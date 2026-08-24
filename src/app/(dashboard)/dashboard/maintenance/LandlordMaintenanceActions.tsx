"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { acknowledgeMaintenanceAction, startMaintenanceAction, resolveMaintenanceAction } from './actions';
import styles from './maintenance.module.css';

export default function LandlordMaintenanceActions({ requestId, status }: { requestId: string, status: string }) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleAction(actionType: 'ACKNOWLEDGE' | 'START' | 'RESOLVE') {
    setIsLoading(true);
    try {
      if (actionType === 'ACKNOWLEDGE') {
        await acknowledgeMaintenanceAction(requestId);
      } else if (actionType === 'START') {
        await startMaintenanceAction(requestId);
      } else if (actionType === 'RESOLVE') {
        await resolveMaintenanceAction(requestId);
      }
    } catch (err: any) {
      alert(err.message || 'Action failed.');
    } finally {
      setIsLoading(false);
    }
  }

  if (status === 'RESOLVED' || status === 'CLOSED') {
    return null;
  }

  return (
    <div className={styles.actionButtons}>
      {status === 'OPEN' && (
        <Button size="sm" variant="outline" onClick={() => handleAction('ACKNOWLEDGE')} disabled={isLoading}>
          Acknowledge
        </Button>
      )}
      {status === 'ACKNOWLEDGED' && (
        <Button size="sm" variant="primary" onClick={() => handleAction('START')} disabled={isLoading}>
          Start Work
        </Button>
      )}
      {status === 'IN_PROGRESS' && (
        <Button size="sm" variant="primary" onClick={() => handleAction('RESOLVE')} disabled={isLoading}>
          Resolve
        </Button>
      )}
    </div>
  );
}
