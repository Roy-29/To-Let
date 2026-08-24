import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { requireOwnership } from "@/lib/auth";
import type { PropertyCreateInput, PropertyUpdateInput } from "@/lib/validations";

export async function createProperty(ownerId: string, data: PropertyCreateInput) {
  return prisma.property.create({
    data: {
      ...data,
      ownerId,
      status: "DRAFT",
    },
  });
}

export async function updateProperty(propertyId: string, userId: string, data: PropertyUpdateInput) {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });

  if (!property) {
    throw new AppError("NOT_FOUND", "Property not found.");
  }

  requireOwnership(property.ownerId, userId);

  return prisma.property.update({
    where: { id: propertyId },
    data,
  });
}

export async function getPropertyById(id: string) {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      owner: {
        select: {
          id: true,
          name: true,
          landlordProfile: {
            select: { verificationStatus: true, phone: true },
          },
        },
      },
    },
  });

  if (!property) {
    throw new AppError("NOT_FOUND", "Property not found.");
  }

  return property;
}



export async function getOwnerProperties(ownerId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { images: { where: { isPrimary: true }, take: 1 } },
    }),
    prisma.property.count({ where: { ownerId } }),
  ]);

  return { properties, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function submitForReview(propertyId: string, userId: string) {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });

  if (!property) throw new AppError("NOT_FOUND", "Property not found.");
  requireOwnership(property.ownerId, userId);

  if (property.status !== "DRAFT") {
    throw new AppError("INVALID_STATUS_TRANSITION", "Only draft properties can be submitted for review.");
  }

  return prisma.property.update({
    where: { id: propertyId },
    data: { status: "PENDING_REVIEW" },
  });
}

export async function deleteProperty(propertyId: string, userId: string) {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });

  if (!property) throw new AppError("NOT_FOUND", "Property not found.");
  requireOwnership(property.ownerId, userId);

  if (property.status === "RENTED") {
    throw new AppError("CONFLICT", "Cannot delete a rented property.");
  }

  await prisma.property.delete({ where: { id: propertyId } });
}

export async function publishProperty(propertyId: string) {
  // Typically an Admin action, but kept here for logical transition
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new AppError("NOT_FOUND", "Property not found.");

  if (property.status !== "PENDING_REVIEW" && property.status !== "DRAFT") {
    throw new AppError("INVALID_STATUS_TRANSITION", "Property cannot be published from its current status.");
  }

  return prisma.property.update({
    where: { id: propertyId },
    data: { status: "PUBLISHED" },
  });
}

export async function pauseProperty(propertyId: string, userId: string) {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new AppError("NOT_FOUND", "Property not found.");
  requireOwnership(property.ownerId, userId);

  if (property.status !== "PUBLISHED") {
    throw new AppError("INVALID_STATUS_TRANSITION", "Only published properties can be paused.");
  }

  return prisma.property.update({
    where: { id: propertyId },
    data: { status: "PAUSED" },
  });
}

export async function resumeProperty(propertyId: string, userId: string) {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new AppError("NOT_FOUND", "Property not found.");
  requireOwnership(property.ownerId, userId);

  if (property.status !== "PAUSED") {
    throw new AppError("INVALID_STATUS_TRANSITION", "Only paused properties can be resumed.");
  }

  return prisma.property.update({
    where: { id: propertyId },
    data: { status: "PUBLISHED" },
  });
}

export async function isPropertyAvailable(propertyId: string): Promise<boolean> {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { status: true },
  });

  if (!property) return false;
  return property.status === "PUBLISHED";
}
