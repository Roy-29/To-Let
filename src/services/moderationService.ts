import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { verifyAdmin } from "@/lib/auth";
import { logAudit } from "./auditService";
import { createNotification } from "./notificationService";

export async function getAllPropertiesForAdmin(adminId: string, filters: any, page = 1, limit = 20) {
  await verifyAdmin(adminId);
  const skip = (page - 1) * limit;

  const where: any = {};
  if (filters.status) where.status = filters.status;
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search } },
      { city: { contains: filters.search } },
      { address: { contains: filters.search } },
      { owner: { name: { contains: filters.search } } },
    ];
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: { owner: { select: { name: true, email: true } } },
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.property.count({ where }),
  ]);

  return { properties, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function approveProperty(adminId: string, propertyId: string) {
  await verifyAdmin(adminId);

  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new AppError("PROPERTY_NOT_FOUND", "Property not found");
  if (property.status !== "PENDING_REVIEW") throw new AppError("INVALID_MODERATION_TRANSITION", "Property not pending review");

  const updated = await prisma.property.update({
    where: { id: propertyId },
    data: { status: "PUBLISHED", rejectionReason: null, changeRequestReason: null },
  });

  await logAudit(adminId, "PROPERTY_APPROVED", "PROPERTY", propertyId);

  await createNotification(
    property.ownerId,
    "PROPERTY_APPROVED",
    "Property Approved",
    `Your property "${property.title}" has been approved and published.`,
    "PROPERTY",
    propertyId
  );

  return updated;
}

export async function rejectProperty(adminId: string, propertyId: string, reason: string) {
  await verifyAdmin(adminId);

  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new AppError("PROPERTY_NOT_FOUND", "Property not found");
  if (property.status !== "PENDING_REVIEW") throw new AppError("INVALID_MODERATION_TRANSITION", "Property not pending review");

  const updated = await prisma.property.update({
    where: { id: propertyId },
    data: { status: "REJECTED", rejectionReason: reason },
  });

  await logAudit(adminId, "PROPERTY_REJECTED", "PROPERTY", propertyId, { reason });

  await createNotification(
    property.ownerId,
    "PROPERTY_REJECTED",
    "Property Rejected",
    `Your property "${property.title}" was rejected: ${reason}`,
    "PROPERTY",
    propertyId
  );

  return updated;
}

export async function requestPropertyChanges(adminId: string, propertyId: string, feedback: string) {
  await verifyAdmin(adminId);

  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new AppError("PROPERTY_NOT_FOUND", "Property not found");
  if (property.status !== "PENDING_REVIEW") throw new AppError("INVALID_MODERATION_TRANSITION", "Property not pending review");

  const updated = await prisma.property.update({
    where: { id: propertyId },
    data: { status: "DRAFT", changeRequestReason: feedback },
  });

  await logAudit(adminId, "PROPERTY_CHANGE_REQUESTED", "PROPERTY", propertyId, { feedback });

  await createNotification(
    property.ownerId,
    "PROPERTY_CHANGE_REQUESTED",
    "Changes Requested for Property",
    `Admin requested changes for "${property.title}": ${feedback}`,
    "PROPERTY",
    propertyId
  );

  return updated;
}
