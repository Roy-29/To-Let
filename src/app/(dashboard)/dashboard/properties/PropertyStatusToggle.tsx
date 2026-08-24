"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { togglePropertyStatusAction } from './actions';

export default function PropertyStatusToggle({ propertyId, currentStatus }: { propertyId: string, currentStatus: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const canPause = currentStatus === 'PUBLISHED';
  const canResume = currentStatus === 'PAUSED';

  if (!canPause && !canResume) return null;

  async function handleToggle() {
    setIsLoading(true);
    try {
      if (canPause) {
        await togglePropertyStatusAction(propertyId, 'PAUSE');
      } else if (canResume) {
        await togglePropertyStatusAction(propertyId, 'RESUME');
      }
    } catch (err) {
      alert('Could not update property status.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button 
      variant="secondary" 
      size="sm" 
      onClick={handleToggle}
      disabled={isLoading}
    >
      {isLoading ? 'Updating...' : canPause ? 'Pause' : 'Resume'}
    </Button>
  );
}
