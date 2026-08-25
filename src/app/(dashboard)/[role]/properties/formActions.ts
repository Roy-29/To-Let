"use server";

import { createProperty, updateProperty } from '@/services/propertyService';
import { getCurrentUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { propertyCreateSchema, propertyUpdateSchema } from '@/lib/validations';
import { ZodError } from 'zod';

export async function createPropertyAction(data: any) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'LANDLORD') throw new Error('Unauthorized');
  
  try {
    const parsed = propertyCreateSchema.parse(data);
    await createProperty(user.id, parsed);
    revalidatePath(`/${user.role.toLowerCase()}/properties`);
  } catch (err: any) {
    if (err instanceof ZodError || err.name === 'ZodError') {
      const issues = err.errors || err.issues || [];
      throw new Error(issues.map((e: any) => `${e.path?.join('.') || 'field'}: ${e.message}`).join(', '));
    }
    throw err;
  }
}

export async function updatePropertyAction(propertyId: string, data: any) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'LANDLORD') throw new Error('Unauthorized');
  
  try {
    const parsed = propertyUpdateSchema.parse(data);
    await updateProperty(propertyId, user.id, parsed);
    revalidatePath(`/${user.role.toLowerCase()}/properties`);
    revalidatePath(`/properties/${propertyId}`);
  } catch (err: any) {
    if (err instanceof ZodError || err.name === 'ZodError') {
      const issues = err.errors || err.issues || [];
      throw new Error(issues.map((e: any) => `${e.path?.join('.') || 'field'}: ${e.message}`).join(', '));
    }
    throw err;
  }
}
