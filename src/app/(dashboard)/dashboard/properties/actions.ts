"use server";

import { pauseProperty, resumeProperty } from '@/services/propertyService';
import { approveProperty, rejectProperty, requestPropertyChanges } from '@/services/moderationService';
import { getCurrentUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function togglePropertyStatusAction(propertyId: string, action: 'PAUSE' | 'RESUME') {
  const user = await getCurrentUser();
  if (!user || user.role !== 'LANDLORD') throw new Error('Unauthorized');
  
  if (action === 'PAUSE') {
    await pauseProperty(propertyId, user.id);
  } else if (action === 'RESUME') {
    await resumeProperty(propertyId, user.id);
  }
  
  revalidatePath('/dashboard/properties');
}

export async function approvePropertyAction(propertyId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");
  await approveProperty(user.id, propertyId);
  revalidatePath("/dashboard/properties");
  revalidatePath(`/dashboard/properties/${propertyId}`);
}

export async function rejectPropertyAction(propertyId: string, reason: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");
  await rejectProperty(user.id, propertyId, reason);
  revalidatePath("/dashboard/properties");
  revalidatePath(`/dashboard/properties/${propertyId}`);
}

export async function requestPropertyChangesAction(propertyId: string, feedback: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");
  await requestPropertyChanges(user.id, propertyId, feedback);
  revalidatePath("/dashboard/properties");
  revalidatePath(`/dashboard/properties/${propertyId}`);
}
