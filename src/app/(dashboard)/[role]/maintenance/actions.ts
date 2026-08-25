"use server";

import { createMaintenanceRequest, closeMaintenance, acknowledgeMaintenance, startMaintenance, resolveMaintenance } from '@/services/maintenanceService';
import { getCurrentUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function createMaintenanceAction(data: any) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'TENANT') throw new Error('Unauthorized');
  
  await createMaintenanceRequest(user.id, data);
  revalidatePath(`/${user.role.toLowerCase()}/maintenance`);
}

export async function closeMaintenanceAction(requestId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'TENANT') throw new Error('Unauthorized');
  
  await closeMaintenance(requestId, user.id);
  revalidatePath(`/${user.role.toLowerCase()}/maintenance`);
}

export async function acknowledgeMaintenanceAction(requestId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'LANDLORD') throw new Error('Unauthorized');
  
  await acknowledgeMaintenance(requestId, user.id);
  revalidatePath(`/${user.role.toLowerCase()}/maintenance`);
}

export async function startMaintenanceAction(requestId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'LANDLORD') throw new Error('Unauthorized');
  
  await startMaintenance(requestId, user.id);
  revalidatePath(`/${user.role.toLowerCase()}/maintenance`);
}

export async function resolveMaintenanceAction(requestId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'LANDLORD') throw new Error('Unauthorized');
  
  await resolveMaintenance(requestId, user.id);
  revalidatePath(`/${user.role.toLowerCase()}/maintenance`);
}
