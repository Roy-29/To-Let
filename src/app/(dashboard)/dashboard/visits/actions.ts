"use server";

import { cancelVisit } from '@/services/visitService';
import { getCurrentUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function cancelVisitAction(visitId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  await cancelVisit(visitId, user.id);
  revalidatePath('/dashboard/visits');
}
