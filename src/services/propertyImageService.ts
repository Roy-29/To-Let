import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { requireOwnership } from "@/lib/auth";
import type { PropertyImageSchemaInput } from "@/lib/validations";

export async function addPropertyImage(propertyId: string, userId: string, data: PropertyImageSchemaInput) {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new AppError("NOT_FOUND", "Property not found.");
  
  requireOwnership(property.ownerId, userId);

  return prisma.propertyImage.create({
    data: {
      propertyId,
      url: data.url,
      storagePath: data.storagePath,
      sortOrder: data.sortOrder ?? 0,
      isPrimary: data.isPrimary ?? false,
    },
  });
}

export async function removePropertyImage(imageId: string, userId: string) {
  const image = await prisma.propertyImage.findUnique({
    where: { id: imageId },
    include: { property: true },
  });

  if (!image) throw new AppError("NOT_FOUND", "Property image not found.");

  requireOwnership(image.property.ownerId, userId);

  await prisma.propertyImage.delete({ where: { id: imageId } });
}

export async function setPrimaryImage(imageId: string, propertyId: string, userId: string) {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new AppError("NOT_FOUND", "Property not found.");

  requireOwnership(property.ownerId, userId);

  const image = await prisma.propertyImage.findUnique({ where: { id: imageId } });
  if (!image || image.propertyId !== propertyId) {
    throw new AppError("NOT_FOUND", "Property image not found for this property.");
  }

  return prisma.$transaction(async (tx) => {
    await tx.propertyImage.updateMany({
      where: { propertyId, isPrimary: true },
      data: { isPrimary: false },
    });

    return tx.propertyImage.update({
      where: { id: imageId },
      data: { isPrimary: true },
    });
  });
}

export async function reorderImages(propertyId: string, userId: string, imageIdsInOrder: string[]) {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new AppError("NOT_FOUND", "Property not found.");
  
  requireOwnership(property.ownerId, userId);

  return prisma.$transaction(async (tx) => {
    const promises = imageIdsInOrder.map((id, index) =>
      tx.propertyImage.update({
        where: { id, propertyId }, // Ensures the image belongs to the property
        data: { sortOrder: index },
      })
    );
    return Promise.all(promises);
  });
}
