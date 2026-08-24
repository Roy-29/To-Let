"use server";

import { updateTenantProfile, updateLandlordProfile } from '@/services/userService';
import { getCurrentUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function updateTenantProfileAction(data: any) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  await updateTenantProfile(user.id, data);
  revalidatePath('/dashboard/profile');
}

export async function updateLandlordProfileAction(data: any) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'LANDLORD') throw new Error('Unauthorized');
  
  await updateLandlordProfile(user.id, data);
  revalidatePath('/dashboard/profile');
}
