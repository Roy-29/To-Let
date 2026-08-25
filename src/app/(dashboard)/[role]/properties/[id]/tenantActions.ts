"use server";

import { createApplication } from '@/services/applicationService';
import { createVisitRequest } from '@/services/visitService';
import { getCurrentUser } from '@/lib/session';

export async function applyForPropertyAction(propertyId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'TENANT') throw new Error('Unauthorized');
  
  await createApplication(user.id, { propertyId });
}

export async function requestVisitAction({ propertyId, requestedDate, requestedTime }: { propertyId: string, requestedDate: Date, requestedTime: string }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'TENANT') throw new Error('Unauthorized');
  
  await createVisitRequest(user.id, { propertyId, requestedDate, requestedTime });
}
