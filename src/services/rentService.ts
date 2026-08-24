import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { requireOwnership } from "@/lib/auth";
import type { RentRecordCreateInput } from "@/lib/validations";

export async function createRentRecord(landlordId: string, data: RentRecordCreateInput) {
  const tenancy = await prisma.tenancy.findUnique({
    where: { id: data.tenancyId },
  });

  if (!tenancy) throw new AppError("NOT_FOUND", "Tenancy not found.");
  requireOwnership(tenancy.landlordId, landlordId);

  if (data.amount <= 0) {
    throw new AppError("INVALID_PAYMENT", "Rent amount must be greater than zero.");
  }

  const existing = await prisma.rentRecord.findUnique({
    where: {
      tenancyId_billingMonth: {
        tenancyId: data.tenancyId,
        billingMonth: data.billingMonth,
      },
    },
  });

  if (existing) {
    throw new AppError("RENT_RECORD_ALREADY_EXISTS", "Rent record already exists for this month.");
  }

  return prisma.rentRecord.create({
    data: {
      tenancyId: data.tenancyId,
      billingMonth: data.billingMonth,
      dueDate: data.dueDate,
      amount: data.amount,
      paidAmount: 0,
      status: "PENDING",
    },
  });
}

export async function getTenantRentRecords(tenantId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    prisma.rentRecord.findMany({
      where: { tenancy: { tenantId } },
      orderBy: { billingMonth: "desc" },
      skip,
      take: limit,
      include: { tenancy: { select: { landlordId: true, property: { select: { title: true } } } } },
    }),
    prisma.rentRecord.count({ where: { tenancy: { tenantId } } }),
  ]);

  return { records, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getLandlordRentRecords(landlordId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    prisma.rentRecord.findMany({
      where: { tenancy: { landlordId } },
      orderBy: { billingMonth: "desc" },
      skip,
      take: limit,
      include: { tenancy: { select: { property: { select: { title: true } }, tenant: { select: { name: true } } } } },
    }),
    prisma.rentRecord.count({ where: { tenancy: { landlordId } } }),
  ]);

  return { records, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getRentRecordById(recordId: string, userId: string) {
  const record = await prisma.rentRecord.findUnique({
    where: { id: recordId },
    include: {
      tenancy: {
        include: {
          property: { select: { title: true } },
          tenant: { select: { name: true } },
        }
      },
      payments: true,
    },
  });

  if (!record) throw new AppError("RENT_RECORD_NOT_FOUND", "Rent record not found.");
  
  if (record.tenancy.tenantId !== userId && record.tenancy.landlordId !== userId) {
    throw new AppError("FORBIDDEN", "You do not have access to this rent record.");
  }

  return record;
}

export async function updateRentStatus(recordId: string) {
  const record = await prisma.rentRecord.findUnique({
    where: { id: recordId },
  });

  if (!record) throw new AppError("RENT_RECORD_NOT_FOUND", "Rent record not found.");

  let newStatus = record.status;

  if (record.paidAmount >= record.amount) {
    newStatus = "PAID";
  } else if (record.paidAmount > 0) {
    newStatus = "PARTIAL";
  } else if (record.paidAmount === 0 && new Date() > record.dueDate) {
    newStatus = "OVERDUE";
  } else {
    newStatus = "PENDING";
  }

  if (newStatus !== record.status) {
    await prisma.rentRecord.update({
      where: { id: recordId },
      data: { status: newStatus },
    });
  }

  return newStatus;
}
