"use server";

import { sendMessage } from '@/services/messageService';
import { getCurrentUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function sendMessageAction(conversationId: string, message: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  await sendMessage(user.id, { conversationId, message });
  revalidatePath(`/${user.role.toLowerCase()}/messages`);
}
