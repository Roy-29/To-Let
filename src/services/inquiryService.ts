import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { requireOwnership } from "@/lib/auth";
import type { InquiryCreateInput } from "@/lib/validations";

export async function createInquiry(tenantId: string, data: InquiryCreateInput) {
  const property = await prisma.property.findUnique({
    where: { id: data.propertyId },
    select: { id: true, ownerId: true, status: true, title: true },
  });

  if (!property) throw new AppError("NOT_FOUND", "Property not found.");
  if (property.status !== "PUBLISHED") throw new AppError("PROPERTY_NOT_AVAILABLE", "Property is not available for inquiries.");
  
  if (property.ownerId === tenantId) throw new AppError("FORBIDDEN", "You cannot inquire about your own property.");

  return prisma.$transaction(async (tx) => {
    const inquiry = await tx.inquiry.create({
      data: {
        tenantId,
        propertyId: property.id,
        landlordId: property.ownerId,
        message: data.message,
        status: "NEW",
      },
    });

    await tx.notification.create({
      data: {
        userId: property.ownerId,
        type: "NEW_INQUIRY",
        title: "New Inquiry Received",
        message: `You have received a new inquiry for ${property.title}.`,
        referenceType: "INQUIRY",
        referenceId: inquiry.id,
      },
    });

    return inquiry;
  });
}

export async function getTenantInquiries(tenantId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [inquiries, total] = await Promise.all([
    prisma.inquiry.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        property: { select: { id: true, title: true, city: true, rent: true } },
        landlord: { select: { id: true, name: true } },
      },
    }),
    prisma.inquiry.count({ where: { tenantId } }),
  ]);

  return { inquiries, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getLandlordInquiries(landlordId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [inquiries, total] = await Promise.all([
    prisma.inquiry.findMany({
      where: { landlordId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        property: { select: { id: true, title: true, city: true, rent: true } },
        tenant: { select: { id: true, name: true } },
      },
    }),
    prisma.inquiry.count({ where: { landlordId } }),
  ]);

  return { inquiries, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getInquiryById(inquiryId: string, userId: string) {
  const inquiry = await prisma.inquiry.findUnique({
    where: { id: inquiryId },
    include: {
      property: { select: { id: true, title: true, city: true, rent: true } },
      tenant: { select: { id: true, name: true } },
      landlord: { select: { id: true, name: true } },
    },
  });

  if (!inquiry) throw new AppError("NOT_FOUND", "Inquiry not found.");

  if (inquiry.tenantId !== userId && inquiry.landlordId !== userId) {
    throw new AppError("FORBIDDEN", "You do not have access to this inquiry.");
  }

  return inquiry;
}

export async function markInquiryViewed(inquiryId: string, landlordId: string) {
  const inquiry = await prisma.inquiry.findUnique({ where: { id: inquiryId } });
  if (!inquiry) throw new AppError("NOT_FOUND", "Inquiry not found.");

  requireOwnership(inquiry.landlordId, landlordId);

  if (inquiry.status !== "NEW") {
    throw new AppError("INVALID_STATUS_TRANSITION", "Inquiry is already viewed or responded.");
  }

  return prisma.inquiry.update({
    where: { id: inquiryId },
    data: { status: "VIEWED" },
  });
}

export async function closeInquiry(inquiryId: string, userId: string) {
  const inquiry = await prisma.inquiry.findUnique({ where: { id: inquiryId } });
  if (!inquiry) throw new AppError("NOT_FOUND", "Inquiry not found.");

  if (inquiry.tenantId !== userId && inquiry.landlordId !== userId) {
    throw new AppError("FORBIDDEN", "You do not have access to close this inquiry.");
  }

  return prisma.inquiry.update({
    where: { id: inquiryId },
    data: { status: "CLOSED" },
  });
}
