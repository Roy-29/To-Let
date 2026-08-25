"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { createManualPaymentAction } from './actions';

export default function LandlordRentActions({ rentRecordId, tenancyId, dueAmount }: { rentRecordId: string, tenancyId: string, dueAmount: number }) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleMarkAsPaid() {
    setIsLoading(true);
    try {
      await createManualPaymentAction({
        tenancyId,
        rentRecordId,
        amount: dueAmount,
        provider: 'CASH',
        metadata: 'Manual payment recorded by landlord',
      });
      alert('Payment recorded successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to record payment.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleMarkAsPaid} 
      disabled={isLoading || dueAmount <= 0}
    >
      {isLoading ? 'Processing...' : 'Mark as Paid'}
    </Button>
  );
}
