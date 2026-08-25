"use server";

import { pauseProperty, resumeProperty } from '@/services/propertyService';
import { approveProperty, rejectProperty, requestPropertyChanges } from '@/services/moderationService';
import { getCurrentUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function togglePropertyStatusAction(propertyId: string, action: 'PAUSE' | 'RESUME' | 'PUBLISH') {
  const user = await getCurrentUser();
  if (!user || user.role !== 'LANDLORD') throw new Error('Unauthorized');
  
  if (action === 'PAUSE') {
    await pauseProperty(propertyId, user.id);
  } else if (action === 'RESUME') {
    await resumeProperty(propertyId, user.id);
  } else if (action === 'PUBLISH') {
    const { publishProperty, getPropertyById } = await import('@/services/propertyService');
    const property = await getPropertyById(propertyId);
    if (property.ownerId !== user.id) throw new Error('Unauthorized');
    await publishProperty(propertyId);
  }
  
  revalidatePath(`/${user.role.toLowerCase()}/properties`);
  revalidatePath(`/${user.role.toLowerCase()}/properties/${propertyId}`);
}

export async function approvePropertyAction(propertyId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");
  await approveProperty(user.id, propertyId);
  revalidatePath("/properties");
  revalidatePath(`/properties/${propertyId}`);
}

export async function rejectPropertyAction(propertyId: string, reason: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");
  await rejectProperty(user.id, propertyId, reason);
  revalidatePath("/properties");
  revalidatePath(`/properties/${propertyId}`);
}

export async function requestPropertyChangesAction(propertyId: string, feedback: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");
  await requestPropertyChanges(user.id, propertyId, feedback);
  revalidatePath("/properties");
  revalidatePath(`/properties/${propertyId}`);
}
