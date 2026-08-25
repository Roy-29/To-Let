"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { useRouter } from 'next/navigation';
import { applyForPropertyAction, requestVisitAction } from './tenantActions';
import Link from 'next/link';

export default function TenantPropertyActions({ propertyId, landlordId, userRole }: { propertyId: string, landlordId: string, userRole: string }) {
  const router = useRouter();
  const [isApplying, setIsApplying] = useState(false);
  const [isRequestingVisit, setIsRequestingVisit] = useState(false);

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await applyForPropertyAction(propertyId);
      alert('Application submitted successfully!');
      router.push(`/${userRole}/applications`);
    } catch (err: any) {
      alert(err.message || 'Failed to submit application.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleRequestVisit = async () => {
    const dateStr = window.prompt("Enter visit date (YYYY-MM-DD):");
    if (!dateStr) return;
    
    const timeStr = window.prompt("Enter visit time (HH:MM in 24hr format):");
    if (!timeStr) return;

    setIsRequestingVisit(true);
    try {
      await requestVisitAction({ propertyId, requestedDate: new Date(dateStr), requestedTime: timeStr });
      alert('Visit requested successfully!');
      router.push(`/${userRole}/visits`);
    } catch (err: any) {
      alert(err.message || 'Failed to request visit.');
    } finally {
      setIsRequestingVisit(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
      <Button fullWidth variant="primary" onClick={handleApply} disabled={isApplying}>
        {isApplying ? 'Applying...' : 'Apply Now'}
      </Button>
      <Button fullWidth variant="outline" onClick={handleRequestVisit} disabled={isRequestingVisit}>
        {isRequestingVisit ? 'Requesting...' : 'Request Visit'}
      </Button>
      <Link href={`/${userRole}/messages?propertyId=${propertyId}`} style={{ display: 'block', width: '100%' }}>
        <Button fullWidth variant="ghost">Message Landlord</Button>
      </Link>
    </div>
  );
}
