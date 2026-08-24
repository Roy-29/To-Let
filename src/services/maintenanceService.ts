import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { requireOwnership } from "@/lib/auth";
import type { MaintenanceCreateInput, MaintenanceNoteInput } from "@/lib/validations";

export async function createMaintenanceRequest(tenantId: string, data: MaintenanceCreateInput) {
  const activeTenancy = await prisma.tenancy.findFirst({
    where: { tenantId, status: "ACTIVE" },
    include: { property: { select: { title: true, ownerId: true } } },
  });

  if (!activeTenancy) {
    throw new AppError("ACTIVE_TENANCY_REQUIRED", "You must have an active tenancy to create a maintenance request.");
  }

  return prisma.$transaction(async (tx) => {
    const request = await tx.maintenanceRequest.create({
      data: {
        tenantId,
        propertyId: activeTenancy.propertyId,
        tenancyId: activeTenancy.id,
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        status: "OPEN",
      },
    });

    await tx.notification.create({
      data: {
        userId: activeTenancy.property.ownerId,
        type: "MAINTENANCE_UPDATE",
        title: "New Maintenance Request",
        message: `New maintenance request submitted for ${activeTenancy.property.title}.`,
        referenceType: "MAINTENANCE_REQUEST",
        referenceId: request.id,
      },
    });

    return request;
  });
}

export async function getTenantMaintenanceRequests(tenantId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [requests, total] = await Promise.all([
    prisma.maintenanceRequest.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { property: { select: { title: true } } },
    }),
    prisma.maintenanceRequest.count({ where: { tenantId } }),
  ]);

  return { requests, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getLandlordMaintenanceRequests(landlordId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [requests, total] = await Promise.all([
    prisma.maintenanceRequest.findMany({
      where: { property: { ownerId: landlordId } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { property: { select: { title: true } }, tenant: { select: { name: true } } },
    }),
    prisma.maintenanceRequest.count({ where: { property: { ownerId: landlordId } } }),
  ]);

  return { requests, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getMaintenanceRequestById(requestId: string, userId: string, role: "TENANT" | "LANDLORD" | "ADMIN") {
  const request = await prisma.maintenanceRequest.findUnique({
    where: { id: requestId },
    include: {
      property: { select: { title: true, ownerId: true } },
      tenant: { select: { name: true } },
      notes: { orderBy: { createdAt: "asc" }, include: { author: { select: { name: true, role: true } } } },
    },
  });

  if (!request) throw new AppError("MAINTENANCE_NOT_FOUND", "Maintenance request not found.");

  if (role === "TENANT") requireOwnership(request.tenantId, userId);
  if (role === "LANDLORD") requireOwnership(request.property.ownerId, userId);
  
  return request;
}

export async function acknowledgeMaintenance(requestId: string, landlordId: string) {
  return updateMaintenanceStatus(requestId, landlordId, "LANDLORD", "OPEN", "ACKNOWLEDGED", "Request Acknowledged");
}

export async function startMaintenance(requestId: string, landlordId: string) {
  return updateMaintenanceStatus(requestId, landlordId, "LANDLORD", "ACKNOWLEDGED", "IN_PROGRESS", "Work Started");
}

export async function resolveMaintenance(requestId: string, landlordId: string) {
  return updateMaintenanceStatus(requestId, landlordId, "LANDLORD", "IN_PROGRESS", "RESOLVED", "Issue Resolved");
}

export async function closeMaintenance(requestId: string, tenantId: string) {
  return updateMaintenanceStatus(requestId, tenantId, "TENANT", "RESOLVED", "CLOSED", "Request Closed");
}

async function updateMaintenanceStatus(
  requestId: string,
  userId: string,
  role: "TENANT" | "LANDLORD",
  fromStatus: string,
  toStatus: string,
  title: string
) {
  const request = await prisma.maintenanceRequest.findUnique({
    where: { id: requestId },
    include: { property: { select: { title: true, ownerId: true } } },
  });

  if (!request) throw new AppError("MAINTENANCE_NOT_FOUND", "Maintenance request not found.");
  
  if (role === "TENANT") requireOwnership(request.tenantId, userId);
  if (role === "LANDLORD") requireOwnership(request.property.ownerId, userId);

  if (request.status !== fromStatus) {
    throw new AppError("INVALID_MAINTENANCE_TRANSITION", `Cannot transition from ${request.status} to ${toStatus}.`);
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.maintenanceRequest.update({
      where: { id: requestId },
      data: { status: toStatus },
    });

    const notifyUserId = role === "TENANT" ? request.property.ownerId : request.tenantId;

    await tx.notification.create({
      data: {
        userId: notifyUserId,
        type: "MAINTENANCE_UPDATE",
        title: title,
        message: `Maintenance request for ${request.property.title} is now ${toStatus}.`,
        referenceType: "MAINTENANCE_REQUEST",
        referenceId: request.id,
      },
    });

    return updated;
  });
}

export async function addMaintenanceNote(requestId: string, userId: string, data: MaintenanceNoteInput) {
  const request = await prisma.maintenanceRequest.findUnique({
    where: { id: requestId },
    include: { property: { select: { ownerId: true } } },
  });

  if (!request) throw new AppError("MAINTENANCE_NOT_FOUND", "Maintenance request not found.");

  // Check access: must be tenant or landlord of this property (or admin, handled at controller)
  if (request.tenantId !== userId && request.property.ownerId !== userId) {
    throw new AppError("MAINTENANCE_NOT_ACCESSIBLE", "You do not have access to add notes to this request.");
  }

  return prisma.maintenanceNote.create({
    data: {
      maintenanceRequestId: requestId,
      authorId: userId,
      note: data.note,
    },
  });
}
