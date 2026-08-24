import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { AppError } from "@/lib/errors";
import { verifyAdmin } from "@/lib/auth";
import { logAudit } from "./auditService";
import type { AdminUserFilterInput } from "@/lib/validations";

export async function getUsers(adminId: string, filters: AdminUserFilterInput, page = 1, limit = 20) {
  await verifyAdmin(adminId); // ensures caller is admin

  const skip = (page - 1) * limit;
  const where: Prisma.UserWhereInput = {};

  if (filters.role) where.role = filters.role;
  if (filters.status) where.status = filters.status;
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search } },
      { email: { contains: filters.search } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getUserById(adminId: string, targetUserId: string) {
  await verifyAdmin(adminId);

  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      tenantProfile: true,
      landlordProfile: true,
    },
  });

  if (!user) {
    throw new AppError("USER_NOT_FOUND", "User not found");
  }

  return user;
}

export async function suspendUser(adminId: string, targetUserId: string) {
  await verifyAdmin(adminId);

  if (adminId === targetUserId) {
    throw new AppError("CANNOT_SUSPEND_SELF", "You cannot suspend your own account");
  }

  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target) throw new AppError("USER_NOT_FOUND", "User not found");
  if (target.status === "SUSPENDED") throw new AppError("USER_ALREADY_SUSPENDED", "User is already suspended");

  const suspendedUser = await prisma.user.update({
    where: { id: targetUserId },
    data: { status: "SUSPENDED" },
    select: { id: true, status: true },
  });

  await logAudit(adminId, "USER_SUSPENDED", "USER", targetUserId);

  return suspendedUser;
}

export async function reactivateUser(adminId: string, targetUserId: string) {
  await verifyAdmin(adminId);

  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target) throw new AppError("USER_NOT_FOUND", "User not found");
  if (target.status === "ACTIVE") throw new AppError("USER_ALREADY_ACTIVE", "User is already active");

  const activeUser = await prisma.user.update({
    where: { id: targetUserId },
    data: { status: "ACTIVE" },
    select: { id: true, status: true },
  });

  await logAudit(adminId, "USER_REACTIVATED", "USER", targetUserId);

  return activeUser;
}

export async function deleteUser(adminId: string, targetUserId: string) {
  await verifyAdmin(adminId);

  if (adminId === targetUserId) {
    throw new AppError("CANNOT_SUSPEND_SELF", "You cannot delete your own account");
  }

  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target) throw new AppError("USER_NOT_FOUND", "User not found");

  // Soft delete
  const deletedUser = await prisma.user.update({
    where: { id: targetUserId },
    data: { status: "DELETED" },
    select: { id: true, status: true },
  });

  await logAudit(adminId, "USER_DELETED", "USER", targetUserId);

  return deletedUser;
}
