import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import type { PaymentCreateInput } from "@/lib/validations";
import { updateRentStatus } from "./rentService";

export async function createPayment(userId: string, data: PaymentCreateInput) {
  const tenancy = await prisma.tenancy.findUnique({
    where: { id: data.tenancyId },
    include: { property: { select: { title: true } } },
  });

  if (!tenancy) throw new AppError("NOT_FOUND", "Tenancy not found.");
  
  if (data.amount <= 0) {
    throw new AppError("INVALID_PAYMENT", "Payment amount must be greater than zero.");
  }
  
  if (tenancy.tenantId !== userId && tenancy.landlordId !== userId) {
    throw new AppError("FORBIDDEN", "You do not have access to this tenancy.");
  }

  // Only landlord can manually record payments for MVP
  // Though tenant could also report it, requirements say "authorized users to mark rent as paid", Landlord limits applies based on prompt
  if (tenancy.landlordId !== userId && tenancy.tenantId === userId) {
    throw new AppError("FORBIDDEN", "Only landlord can manually record payments.");
  }

  let rentRecord = null;
  if (data.rentRecordId) {
    rentRecord = await prisma.rentRecord.findUnique({
      where: { id: data.rentRecordId },
    });

    if (!rentRecord) throw new AppError("RENT_RECORD_NOT_FOUND", "Rent record not found.");
    if (rentRecord.tenancyId !== tenancy.id) {
      throw new AppError("FORBIDDEN", "Rent record does not belong to this tenancy.");
    }

    if (rentRecord.paidAmount + data.amount > rentRecord.amount) {
      throw new AppError("PAYMENT_EXCEEDS_BALANCE", "Payment amount exceeds the due balance.");
    }
  }

  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        userId,
        tenancyId: tenancy.id,
        rentRecordId: data.rentRecordId,
        amount: data.amount,
        currency: "BDT",
        provider: data.provider || "CASH",
        providerTransactionId: data.providerTransactionId,
        status: "SUCCESS", // Manual payment is immediately successful
        metadata: data.metadata,
      },
    });

    if (rentRecord) {
      const newPaidAmount = rentRecord.paidAmount + data.amount;
      await tx.rentRecord.update({
        where: { id: rentRecord.id },
        data: { 
          paidAmount: newPaidAmount,
          paidAt: newPaidAmount >= rentRecord.amount ? new Date() : rentRecord.paidAt,
        },
      });
    }

    await tx.notification.create({
      data: {
        userId: tenancy.tenantId,
        type: "PAYMENT_SUCCESS",
        title: "Payment Recorded",
        message: `A payment of ${data.amount} BDT has been recorded for ${tenancy.property.title}.`,
        referenceType: "PAYMENT",
        referenceId: payment.id,
      },
    });

    return payment;
  }).then(async (payment) => {
    // Recalculate status outside transaction for simplicity, or we could do it inside.
    // The updateRentStatus will run in its own tx context.
    if (data.rentRecordId) {
      await updateRentStatus(data.rentRecordId);
    }
    return payment;
  });
}

export async function getPaymentById(paymentId: string, userId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      tenancy: { select: { tenantId: true, landlordId: true } },
    },
  });

  if (!payment) throw new AppError("NOT_FOUND", "Payment not found.");
  
  if (payment.tenancy.tenantId !== userId && payment.tenancy.landlordId !== userId) {
    throw new AppError("FORBIDDEN", "You do not have access to this payment.");
  }

  return payment;
}

export async function getTenantPayments(tenantId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: { tenancy: { tenantId } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { tenancy: { select: { property: { select: { title: true } } } } },
    }),
    prisma.payment.count({ where: { tenancy: { tenantId } } }),
  ]);

  return { payments, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getLandlordPayments(landlordId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: { tenancy: { landlordId } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { tenancy: { select: { property: { select: { title: true } }, tenant: { select: { name: true } } } } },
    }),
    prisma.payment.count({ where: { tenancy: { landlordId } } }),
  ]);

  return { payments, total, page, limit, totalPages: Math.ceil(total / limit) };
}
