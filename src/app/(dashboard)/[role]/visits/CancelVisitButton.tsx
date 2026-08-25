"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { cancelVisitAction } from './actions';

export default function CancelVisitButton({ visitId }: { visitId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleCancel() {
    if (!confirm('Are you sure you want to cancel this visit?')) return;
    
    setIsLoading(true);
    try {
      await cancelVisitAction(visitId);
    } catch (err) {
      alert('Could not cancel visit.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button 
      variant="danger" 
      size="sm" 
      onClick={handleCancel}
      disabled={isLoading}
      fullWidth
    >
      {isLoading ? 'Cancelling...' : 'Cancel'}
    </Button>
  );
}
