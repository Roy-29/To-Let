"use server";

import { getCurrentUser } from "@/lib/session";
import { approveLandlord, rejectLandlord } from "@/services/verificationService";
import { revalidatePath } from "next/cache";

export async function approveLandlordAction(targetUserId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");
  await approveLandlord(user.id, targetUserId);
  revalidatePath("/verifications");
}

export async function rejectLandlordAction(targetUserId: string, reason: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");
  await rejectLandlord(user.id, targetUserId, reason);
  revalidatePath("/verifications");
}
