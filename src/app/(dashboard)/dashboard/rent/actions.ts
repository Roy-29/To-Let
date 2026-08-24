"use server";

import { createPayment } from '@/services/paymentService';
import { getCurrentUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function createManualPaymentAction(data: any) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'LANDLORD') throw new Error('Unauthorized');
  
  await createPayment(user.id, data);
  revalidatePath('/dashboard/rent');
}
