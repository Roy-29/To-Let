import { getCurrentUser } from "./session";
import { AppError } from "./errors";

type UserRole = "TENANT" | "LANDLORD" | "ADMIN";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

async function getAuthenticatedUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new AppError("UNAUTHORIZED", "Authentication required.");
  }
  if (user.status === "SUSPENDED") {
    throw new AppError("ACCOUNT_SUSPENDED", "Your account has been suspended.");
  }
  if (user.status === "DELETED") {
    throw new AppError("UNAUTHORIZED", "Account not found.");
  }
  return user;
}

export async function requireAuth(): Promise<AuthUser> {
  return getAuthenticatedUser();
}

export async function requireRole(...roles: UserRole[]): Promise<AuthUser> {
  const user = await getAuthenticatedUser();
  if (!roles.includes(user.role as UserRole)) {
    throw new AppError("FORBIDDEN", "You do not have permission to perform this action.");
  }
  return user;
}

export async function requireTenant(): Promise<AuthUser> {
  return requireRole("TENANT");
}

export async function requireLandlord(): Promise<AuthUser> {
  return requireRole("LANDLORD");
}

export async function requireAdmin(): Promise<AuthUser> {
  return requireRole("ADMIN");
}

import { prisma } from "./db";

export function requireOwnership(resourceOwnerId: string, userId: string): void {
  if (resourceOwnerId !== userId) {
    throw new AppError("FORBIDDEN", "You do not have access to this resource.");
  }
}

export async function verifyAdmin(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true, status: true } });
  if (!user || user.role !== "ADMIN" || user.status !== "ACTIVE") {
    throw new AppError("FORBIDDEN", "Admin access required");
  }
}

export async function verifyLandlord(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true, status: true } });
  if (!user || user.role !== "LANDLORD" || user.status !== "ACTIVE") {
    throw new AppError("FORBIDDEN", "Landlord access required");
  }
}

export async function verifyTenant(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true, status: true } });
  if (!user || user.role !== "TENANT" || user.status !== "ACTIVE") {
    throw new AppError("FORBIDDEN", "Tenant access required");
  }
}
