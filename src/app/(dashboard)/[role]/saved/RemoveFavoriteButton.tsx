"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button/Button';
import { removeFavoriteAction } from './actions';

export default function RemoveFavoriteButton({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleRemove() {
    setIsLoading(true);
    try {
      await removeFavoriteAction(propertyId);
    } catch (err) {
      alert('Could not remove favorite.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button 
      variant="danger" 
      fullWidth 
      onClick={handleRemove}
      disabled={isLoading}
    >
      {isLoading ? 'Removing...' : 'Remove Saved Home'}
    </Button>
  );
}
