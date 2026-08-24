"use server";

import { createProperty, updateProperty } from '@/services/propertyService';
import { getCurrentUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { propertyCreateSchema, propertyUpdateSchema } from '@/lib/validations';

export async function createPropertyAction(data: any) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'LANDLORD') throw new Error('Unauthorized');
  
  const parsed = propertyCreateSchema.parse(data);
  await createProperty(user.id, parsed);
  revalidatePath('/dashboard/properties');
}

export async function updatePropertyAction(propertyId: string, data: any) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'LANDLORD') throw new Error('Unauthorized');
  
  const parsed = propertyUpdateSchema.parse(data);
  await updateProperty(propertyId, user.id, parsed);
  revalidatePath('/dashboard/properties');
  revalidatePath(`/dashboard/properties/${propertyId}`);
}
