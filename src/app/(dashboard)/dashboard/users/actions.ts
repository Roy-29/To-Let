"use server";

import { getCurrentUser } from "@/lib/session";
import { suspendUser, reactivateUser, deleteUser } from "@/services/adminUserService";
import { revalidatePath } from "next/cache";

export async function suspendUserAction(targetUserId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");
  await suspendUser(user.id, targetUserId);
  revalidatePath("/dashboard/users");
}

export async function reactivateUserAction(targetUserId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");
  await reactivateUser(user.id, targetUserId);
  revalidatePath("/dashboard/users");
}

export async function deleteUserAction(targetUserId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");
  await deleteUser(user.id, targetUserId);
  revalidatePath("/dashboard/users");
}
