"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { togglePropertyStatusAction } from './actions';

export default function PropertyStatusToggle({ propertyId, currentStatus }: { propertyId: string, currentStatus: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const isPublished = currentStatus === 'PUBLISHED';

  async function handleToggle() {
    setIsLoading(true);
    try {
      if (isPublished) {
        // Acts as "Unpublish"
        await togglePropertyStatusAction(propertyId, 'PAUSE');
      } else {
        // Direct publish
        await togglePropertyStatusAction(propertyId, 'PUBLISH');
      }
    } catch (err) {
      alert('Could not update property status.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button 
      variant={isPublished ? "secondary" : "primary"} 
      size="sm" 
      onClick={handleToggle}
      disabled={isLoading}
    >
      {isLoading ? 'Updating...' : isPublished ? 'Unpublish' : 'Publish'}
    </Button>
  );
}
