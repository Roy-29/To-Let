import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { requireOwnership } from "@/lib/auth";
import type { ApplicationCreateInput } from "@/lib/validations";

export async function createApplication(tenantId: string, data: ApplicationCreateInput) {
  const property = await prisma.property.findUnique({
    where: { id: data.propertyId },
    select: { id: true, ownerId: true, status: true, title: true },
  });

  if (!property) throw new AppError("NOT_FOUND", "Property not found.");
  if (property.status !== "PUBLISHED") {
    throw new AppError("PROPERTY_NOT_AVAILABLE", "Property is not available for applications.");
  }
  if (property.ownerId === tenantId) {
    throw new AppError("FORBIDDEN", "You cannot apply for your own property.");
  }

  // Prevent duplicate active applications
  const existingApp = await prisma.rentalApplication.findFirst({
    where: {
      propertyId: property.id,
      tenantId,
      status: { in: ["SUBMITTED", "UNDER_REVIEW", "APPROVED"] },
    },
  });

  if (existingApp) {
    throw new AppError("APPLICATION_ALREADY_EXISTS", "You already have an active application for this property.");
  }

  return prisma.$transaction(async (tx) => {
    const application = await tx.rentalApplication.create({
      data: {
        tenantId,
        propertyId: property.id,
        landlordId: property.ownerId,
        moveInDate: data.moveInDate,
        message: data.message,
        status: "SUBMITTED",
      },
    });

    await tx.notification.create({
      data: {
        userId: property.ownerId,
        type: "APPLICATION_UPDATE",
        title: "New Rental Application",
        message: `You have received a new rental application for ${property.title}.`,
        referenceType: "RENTAL_APPLICATION",
        referenceId: application.id,
      },
    });

    return application;
  });
}

export async function getTenantApplications(tenantId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [applications, total] = await Promise.all([
    prisma.rentalApplication.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        property: { select: { id: true, title: true, city: true, rent: true } },
        landlord: { select: { id: true, name: true } },
      },
    }),
    prisma.rentalApplication.count({ where: { tenantId } }),
  ]);

  return { applications, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getLandlordApplications(landlordId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [applications, total] = await Promise.all([
    prisma.rentalApplication.findMany({
      where: { landlordId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        property: { select: { id: true, title: true, city: true, rent: true } },
        tenant: { select: { id: true, name: true } },
      },
    }),
    prisma.rentalApplication.count({ where: { landlordId } }),
  ]);

  return { applications, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getApplicationById(applicationId: string, userId: string) {
  const application = await prisma.rentalApplication.findUnique({
    where: { id: applicationId },
    include: {
      property: { select: { id: true, title: true, city: true, rent: true } },
      tenant: { select: { id: true, name: true } },
      landlord: { select: { id: true, name: true } },
    },
  });

  if (!application) throw new AppError("APPLICATION_NOT_FOUND", "Application not found.");

  if (application.tenantId !== userId && application.landlordId !== userId) {
    throw new AppError("FORBIDDEN", "You do not have access to this application.");
  }

  return application;
}

export async function reviewApplication(applicationId: string, landlordId: string) {
  const application = await prisma.rentalApplication.findUnique({ 
    where: { id: applicationId },
    include: { property: { select: { title: true } } }
  });
  if (!application) throw new AppError("APPLICATION_NOT_FOUND", "Application not found.");

  requireOwnership(application.landlordId, landlordId);

  if (application.status !== "SUBMITTED") {
    throw new AppError("INVALID_STATUS_TRANSITION", "Only SUBMITTED applications can be put under review.");
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.rentalApplication.update({
      where: { id: applicationId },
      data: { status: "UNDER_REVIEW" },
    });

    await tx.notification.create({
      data: {
        userId: application.tenantId,
        type: "APPLICATION_UPDATE",
        title: "Application Under Review",
        message: `Your application for ${application.property.title} is now under review.`,
        referenceType: "RENTAL_APPLICATION",
        referenceId: application.id,
      },
    });

    return updated;
  });
}

export async function approveApplication(applicationId: string, landlordId: string) {
  const application = await prisma.rentalApplication.findUnique({ 
    where: { id: applicationId },
    include: { property: { select: { title: true, status: true } } }
  });
  
  if (!application) throw new AppError("APPLICATION_NOT_FOUND", "Application not found.");
  requireOwnership(application.landlordId, landlordId);

  if (application.status !== "SUBMITTED" && application.status !== "UNDER_REVIEW") {
    throw new AppError("INVALID_STATUS_TRANSITION", "Application must be SUBMITTED or UNDER_REVIEW to be approved.");
  }

  if (application.property.status !== "PUBLISHED") {
    throw new AppError("PROPERTY_NOT_AVAILABLE", "Cannot approve application for an unavailable property.");
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.rentalApplication.update({
      where: { id: applicationId },
      data: { status: "APPROVED" },
    });

    await tx.notification.create({
      data: {
        userId: application.tenantId,
        type: "APPLICATION_UPDATE",
        title: "Application Approved!",
        message: `Your application for ${application.property.title} has been approved.`,
        referenceType: "RENTAL_APPLICATION",
        referenceId: application.id,
      },
    });

    return updated;
  });
}

export async function rejectApplication(applicationId: string, landlordId: string) {
  const application = await prisma.rentalApplication.findUnique({ 
    where: { id: applicationId },
    include: { property: { select: { title: true } } }
  });
  
  if (!application) throw new AppError("APPLICATION_NOT_FOUND", "Application not found.");
  requireOwnership(application.landlordId, landlordId);

  if (application.status !== "SUBMITTED" && application.status !== "UNDER_REVIEW") {
    throw new AppError("INVALID_STATUS_TRANSITION", "Application must be SUBMITTED or UNDER_REVIEW to be rejected.");
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.rentalApplication.update({
      where: { id: applicationId },
      data: { status: "REJECTED" },
    });

    await tx.notification.create({
      data: {
        userId: application.tenantId,
        type: "APPLICATION_UPDATE",
        title: "Application Status Update",
        message: `Your application for ${application.property.title} was not accepted at this time.`,
        referenceType: "RENTAL_APPLICATION",
        referenceId: application.id,
      },
    });

    return updated;
  });
}

export async function withdrawApplication(applicationId: string, tenantId: string) {
  const application = await prisma.rentalApplication.findUnique({ where: { id: applicationId } });
  
  if (!application) throw new AppError("APPLICATION_NOT_FOUND", "Application not found.");
  requireOwnership(application.tenantId, tenantId);

  if (application.status !== "SUBMITTED" && application.status !== "UNDER_REVIEW") {
    throw new AppError("INVALID_STATUS_TRANSITION", "You can only withdraw SUBMITTED or UNDER_REVIEW applications.");
  }

  return prisma.rentalApplication.update({
    where: { id: applicationId },
    data: { status: "WITHDRAWN" },
  });
}
