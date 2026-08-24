"use server";

import { removeFavorite } from '@/services/favoriteService';
import { getCurrentUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function removeFavoriteAction(propertyId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  await removeFavorite(user.id, propertyId);
  revalidatePath('/dashboard/saved');
}
