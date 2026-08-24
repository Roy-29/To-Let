import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { requireOwnership } from "@/lib/auth";
import type { VisitCreateInput } from "@/lib/validations";

export async function createVisitRequest(tenantId: string, data: VisitCreateInput) {
  const property = await prisma.property.findUnique({
    where: { id: data.propertyId },
    select: { id: true, ownerId: true, status: true, title: true },
  });

  if (!property) throw new AppError("NOT_FOUND", "Property not found.");
  if (property.status !== "PUBLISHED") throw new AppError("PROPERTY_NOT_AVAILABLE", "Property is not available for visits.");
  
  if (property.ownerId === tenantId) throw new AppError("FORBIDDEN", "You cannot request a visit for your own property.");

  return prisma.$transaction(async (tx) => {
    const visit = await tx.visitRequest.create({
      data: {
        tenantId,
        propertyId: property.id,
        landlordId: property.ownerId,
        requestedDate: data.requestedDate,
        requestedTime: data.requestedTime,
        message: data.message,
        status: "REQUESTED",
      },
    });

    await tx.notification.create({
      data: {
        userId: property.ownerId,
        type: "VISIT_REQUEST",
        title: "New Visit Request",
        message: `You have received a new visit request for ${property.title}.`,
        referenceType: "VISIT_REQUEST",
        referenceId: visit.id,
      },
    });

    return visit;
  });
}

export async function getTenantVisits(tenantId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [visits, total] = await Promise.all([
    prisma.visitRequest.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        property: { select: { id: true, title: true, city: true, rent: true } },
        landlord: { select: { id: true, name: true } },
      },
    }),
    prisma.visitRequest.count({ where: { tenantId } }),
  ]);

  return { visits, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getLandlordVisits(landlordId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [visits, total] = await Promise.all([
    prisma.visitRequest.findMany({
      where: { landlordId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        property: { select: { id: true, title: true, city: true, rent: true } },
        tenant: { select: { id: true, name: true } },
      },
    }),
    prisma.visitRequest.count({ where: { landlordId } }),
  ]);

  return { visits, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getVisitById(visitId: string, userId: string) {
  const visit = await prisma.visitRequest.findUnique({
    where: { id: visitId },
    include: {
      property: { select: { id: true, title: true, city: true, rent: true } },
      tenant: { select: { id: true, name: true } },
      landlord: { select: { id: true, name: true } },
    },
  });

  if (!visit) throw new AppError("NOT_FOUND", "Visit request not found.");

  if (visit.tenantId !== userId && visit.landlordId !== userId) {
    throw new AppError("FORBIDDEN", "You do not have access to this visit request.");
  }

  return visit;
}

export async function acceptVisit(visitId: string, landlordId: string) {
  const visit = await prisma.visitRequest.findUnique({ 
    where: { id: visitId },
    include: { property: { select: { title: true } } }
  });
  if (!visit) throw new AppError("NOT_FOUND", "Visit request not found.");

  requireOwnership(visit.landlordId, landlordId);

  if (visit.status !== "REQUESTED") {
    throw new AppError("INVALID_STATUS_TRANSITION", "Only REQUESTED visits can be accepted.");
  }

  return prisma.$transaction(async (tx) => {
    const updatedVisit = await tx.visitRequest.update({
      where: { id: visitId },
      data: { status: "ACCEPTED" },
    });

    await tx.notification.create({
      data: {
        userId: visit.tenantId,
        type: "VISIT_ACCEPTED",
        title: "Visit Request Accepted",
        message: `Your visit request for ${visit.property.title} has been accepted.`,
        referenceType: "VISIT_REQUEST",
        referenceId: visit.id,
      },
    });

    return updatedVisit;
  });
}

export async function rejectVisit(visitId: string, landlordId: string) {
  const visit = await prisma.visitRequest.findUnique({ 
    where: { id: visitId },
    include: { property: { select: { title: true } } }
  });
  if (!visit) throw new AppError("NOT_FOUND", "Visit request not found.");

  requireOwnership(visit.landlordId, landlordId);

  if (visit.status !== "REQUESTED") {
    throw new AppError("INVALID_STATUS_TRANSITION", "Only REQUESTED visits can be rejected.");
  }

  return prisma.$transaction(async (tx) => {
    const updatedVisit = await tx.visitRequest.update({
      where: { id: visitId },
      data: { status: "REJECTED" },
    });

    await tx.notification.create({
      data: {
        userId: visit.tenantId,
        type: "VISIT_REJECTED",
        title: "Visit Request Rejected",
        message: `Your visit request for ${visit.property.title} has been rejected.`,
        referenceType: "VISIT_REQUEST",
        referenceId: visit.id,
      },
    });

    return updatedVisit;
  });
}

export async function cancelVisit(visitId: string, tenantId: string) {
  const visit = await prisma.visitRequest.findUnique({ 
    where: { id: visitId },
    include: { property: { select: { title: true } } }
  });
  if (!visit) throw new AppError("NOT_FOUND", "Visit request not found.");

  requireOwnership(visit.tenantId, tenantId);

  if (visit.status !== "REQUESTED" && visit.status !== "ACCEPTED") {
    throw new AppError("INVALID_STATUS_TRANSITION", "Only REQUESTED or ACCEPTED visits can be cancelled.");
  }

  return prisma.$transaction(async (tx) => {
    const updatedVisit = await tx.visitRequest.update({
      where: { id: visitId },
      data: { status: "CANCELLED" },
    });

    // Notify landlord if they had already accepted it, or generally let them know
    await tx.notification.create({
      data: {
        userId: visit.landlordId,
        type: "VISIT_CANCELLED",
        title: "Visit Cancelled",
        message: `The tenant cancelled their visit to ${visit.property.title}.`,
        referenceType: "VISIT_REQUEST",
        referenceId: visit.id,
      },
    });

    return updatedVisit;
  });
}

export async function completeVisit(visitId: string, landlordId: string) {
  const visit = await prisma.visitRequest.findUnique({ where: { id: visitId } });
  if (!visit) throw new AppError("NOT_FOUND", "Visit request not found.");

  requireOwnership(visit.landlordId, landlordId);

  if (visit.status !== "ACCEPTED") {
    throw new AppError("INVALID_STATUS_TRANSITION", "Only ACCEPTED visits can be marked as completed.");
  }

  return prisma.visitRequest.update({
    where: { id: visitId },
    data: { status: "COMPLETED" },
  });
}
