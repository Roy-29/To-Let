import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { requireOwnership } from "@/lib/auth";
import type { TenancyCreateInput } from "@/lib/validations";

export async function createTenancy(landlordId: string, data: TenancyCreateInput) {
  const application = await prisma.rentalApplication.findUnique({
    where: { id: data.applicationId },
    include: { property: { select: { id: true, status: true, ownerId: true, title: true } } },
  });

  if (!application) throw new AppError("APPLICATION_NOT_FOUND", "Application not found.");
  requireOwnership(application.landlordId, landlordId);

  if (application.status !== "APPROVED") {
    throw new AppError("APPLICATION_NOT_APPROVED", "Tenancy can only be created from an APPROVED application.");
  }

  if (application.property.status !== "PUBLISHED") {
    throw new AppError("PROPERTY_NOT_AVAILABLE", "Property is no longer available.");
  }

  const activeTenancy = await prisma.tenancy.findFirst({
    where: {
      propertyId: application.propertyId,
      status: { in: ["PENDING", "ACTIVE"] },
    },
  });

  if (activeTenancy) {
    throw new AppError("TENANCY_ALREADY_EXISTS", "An active tenancy already exists for this property.");
  }

  return prisma.$transaction(async (tx) => {
    const tenancy = await tx.tenancy.create({
      data: {
        tenantId: application.tenantId,
        propertyId: application.propertyId,
        landlordId: application.landlordId,
        startDate: data.startDate,
        endDate: data.endDate,
        monthlyRent: data.monthlyRent,
        securityDeposit: data.securityDeposit,
        status: "ACTIVE", // Or PENDING if it needs tenant acceptance first, but based on prompt ACTIVE -> RENTED. Let's say ACTIVE.
      },
    });

    await tx.property.update({
      where: { id: application.propertyId },
      data: { status: "RENTED" },
    });

    // Close other active applications for this property
    await tx.rentalApplication.updateMany({
      where: {
        propertyId: application.propertyId,
        id: { not: application.id },
        status: { in: ["SUBMITTED", "UNDER_REVIEW", "APPROVED"] },
      },
      data: { status: "REJECTED" },
    });

    await tx.notification.create({
      data: {
        userId: application.tenantId,
        type: "TENANCY_CREATED",
        title: "New Tenancy",
        message: `Your tenancy for ${application.property.title} has started.`,
        referenceType: "TENANCY",
        referenceId: tenancy.id,
      },
    });

    return tenancy;
  });
}

export async function getTenantTenancy(tenantId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [tenancies, total] = await Promise.all([
    prisma.tenancy.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { property: { select: { id: true, title: true, address: true, city: true } } },
    }),
    prisma.tenancy.count({ where: { tenantId } }),
  ]);
  return { tenancies, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getLandlordTenancies(landlordId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [tenancies, total] = await Promise.all([
    prisma.tenancy.findMany({
      where: { landlordId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { 
        property: { select: { id: true, title: true } },
        tenant: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.tenancy.count({ where: { landlordId } }),
  ]);
  return { tenancies, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getTenancyById(tenancyId: string, userId: string) {
  const tenancy = await prisma.tenancy.findUnique({
    where: { id: tenancyId },
    include: {
      property: true,
      tenant: { select: { id: true, name: true, email: true } },
      landlord: { select: { id: true, name: true, email: true } },
    },
  });

  if (!tenancy) throw new AppError("NOT_FOUND", "Tenancy not found.");
  if (tenancy.tenantId !== userId && tenancy.landlordId !== userId) {
    throw new AppError("FORBIDDEN", "You do not have access to this tenancy.");
  }
  return tenancy;
}

export async function endTenancy(tenancyId: string, userId: string, role: "TENANT" | "LANDLORD") {
  const tenancy = await prisma.tenancy.findUnique({
    where: { id: tenancyId },
    include: { property: { select: { id: true, title: true } } },
  });

  if (!tenancy) throw new AppError("NOT_FOUND", "Tenancy not found.");
  
  if (role === "TENANT") requireOwnership(tenancy.tenantId, userId);
  if (role === "LANDLORD") requireOwnership(tenancy.landlordId, userId);

  if (tenancy.status !== "ACTIVE" && tenancy.status !== "PENDING") {
    throw new AppError("TENANCY_NOT_ACTIVE", "Tenancy is already ended or terminated.");
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.tenancy.update({
      where: { id: tenancyId },
      data: { status: "ENDED", endDate: new Date() },
    });

    // Make property published again
    await tx.property.update({
      where: { id: tenancy.propertyId },
      data: { status: "PUBLISHED" },
    });

    const otherUser = role === "TENANT" ? tenancy.landlordId : tenancy.tenantId;
    await tx.notification.create({
      data: {
        userId: otherUser,
        type: "TENANCY_ENDED",
        title: "Tenancy Ended",
        message: `The tenancy for ${tenancy.property.title} has ended.`,
        referenceType: "TENANCY",
        referenceId: tenancy.id,
      },
    });

    return updated;
  });
}

export async function terminateTenancy(tenancyId: string, landlordId: string) {
  const tenancy = await prisma.tenancy.findUnique({
    where: { id: tenancyId },
    include: { property: { select: { id: true, title: true } } },
  });

  if (!tenancy) throw new AppError("NOT_FOUND", "Tenancy not found.");
  requireOwnership(tenancy.landlordId, landlordId);

  if (tenancy.status !== "ACTIVE" && tenancy.status !== "PENDING") {
    throw new AppError("TENANCY_NOT_ACTIVE", "Tenancy is already ended or terminated.");
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.tenancy.update({
      where: { id: tenancyId },
      data: { status: "TERMINATED", endDate: new Date() },
    });

    await tx.property.update({
      where: { id: tenancy.propertyId },
      data: { status: "PUBLISHED" },
    });

    await tx.notification.create({
      data: {
        userId: tenancy.tenantId,
        type: "TENANCY_TERMINATED",
        title: "Tenancy Terminated",
        message: `Your tenancy for ${tenancy.property.title} has been terminated.`,
        referenceType: "TENANCY",
        referenceId: tenancy.id,
      },
    });

    return updated;
  });
}
