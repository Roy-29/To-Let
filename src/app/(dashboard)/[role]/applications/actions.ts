"use server";

import { withdrawApplication, reviewApplication, approveApplication, rejectApplication } from '@/services/applicationService';
import { getCurrentUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function withdrawApplicationAction(applicationId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'TENANT') throw new Error('Unauthorized');
  
  await withdrawApplication(applicationId, user.id);
  revalidatePath(`/${user.role.toLowerCase()}/applications`);
}

export async function reviewApplicationAction(applicationId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'LANDLORD') throw new Error('Unauthorized');
  
  await reviewApplication(applicationId, user.id);
  revalidatePath(`/${user.role.toLowerCase()}/applications`);
}

export async function approveApplicationAction(applicationId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'LANDLORD') throw new Error('Unauthorized');
  
  await approveApplication(applicationId, user.id);
  revalidatePath(`/${user.role.toLowerCase()}/applications`);
}

export async function rejectApplicationAction(applicationId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'LANDLORD') throw new Error('Unauthorized');
  
  await rejectApplication(applicationId, user.id);
  revalidatePath(`/${user.role.toLowerCase()}/applications`);
}
