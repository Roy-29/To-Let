"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { withdrawApplicationAction } from './actions';

export default function WithdrawApplicationButton({ applicationId }: { applicationId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleWithdraw() {
    if (!confirm('Are you sure you want to withdraw this application?')) return;
    
    setIsLoading(true);
    try {
      await withdrawApplicationAction(applicationId);
    } catch (err) {
      alert('Could not withdraw application.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button 
      variant="danger" 
      size="sm" 
      onClick={handleWithdraw}
      disabled={isLoading}
    >
      {isLoading ? 'Withdrawing...' : 'Withdraw'}
    </Button>
  );
}
