import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError("NOT_FOUND", "User not found.");
  }

  return user;
}

export async function getTenantProfile(userId: string) {
  const profile = await prisma.tenantProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new AppError("NOT_FOUND", "Tenant profile not found.");
  }

  return profile;
}

export async function getLandlordProfile(userId: string) {
  const profile = await prisma.landlordProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new AppError("NOT_FOUND", "Landlord profile not found.");
  }

  return profile;
}

export async function updateTenantProfile(
  userId: string,
  data: {
    phone?: string;
    profileImage?: string;
    preferredLocation?: string;
    minimumBudget?: number;
    maximumBudget?: number;
    preferredPropertyType?: string;
    bedrooms?: number;
    bathrooms?: number;
    moveInDate?: Date;
    occupancyType?: string;
  }
) {
  return prisma.tenantProfile.update({
    where: { userId },
    data,
  });
}

export async function updateLandlordProfile(
  userId: string,
  data: {
    phone?: string;
    profileImage?: string;
  }
) {
  return prisma.landlordProfile.update({
    where: { userId },
    data,
  });
}
