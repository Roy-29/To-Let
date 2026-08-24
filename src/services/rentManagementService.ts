import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";

export async function getExpectedMonthlyRent(landlordId: string, month: string) { // month format: "YYYY-MM"
  // Sum of amount from rent records for this month
  const result = await prisma.rentRecord.aggregate({
    where: { tenancy: { landlordId }, billingMonth: month },
    _sum: { amount: true },
  });
  return result._sum.amount || 0;
}

export async function getCollectedMonthlyRent(landlordId: string, month: string) {
  // Sum of paidAmount from rent records for this month
  const result = await prisma.rentRecord.aggregate({
    where: { tenancy: { landlordId }, billingMonth: month },
    _sum: { paidAmount: true },
  });
  return result._sum.paidAmount || 0;
}

export async function getPendingMonthlyRent(landlordId: string, month: string) {
  // Rent records where paidAmount < amount and not yet overdue (or just total amount - paidAmount)
  const records = await prisma.rentRecord.findMany({
    where: { tenancy: { landlordId }, billingMonth: month, status: { in: ["PENDING", "PARTIAL", "OVERDUE"] } },
  });
  
  return records.reduce((sum, record) => sum + (record.amount - record.paidAmount), 0);
}

export async function getOverdueMonthlyRent(landlordId: string, month: string) {
  const result = await prisma.rentRecord.aggregate({
    where: { tenancy: { landlordId }, billingMonth: month, status: "OVERDUE" },
    _sum: { amount: true, paidAmount: true },
  });
  const total = result._sum.amount || 0;
  const paid = result._sum.paidAmount || 0;
  return total - paid;
}

export async function getRentCollectionHistory(landlordId: string, limit = 12) {
  // This could aggregate per month, but for simplicity we fetch records and group them.
  const records = await prisma.rentRecord.findMany({
    where: { tenancy: { landlordId } },
    orderBy: { billingMonth: "desc" },
  });

  const history: Record<string, { expected: number; collected: number }> = {};
  
  for (const record of records) {
    if (!history[record.billingMonth]) {
      history[record.billingMonth] = { expected: 0, collected: 0 };
    }
    history[record.billingMonth].expected += record.amount;
    history[record.billingMonth].collected += record.paidAmount;
  }

  // Convert to array and slice
  const result = Object.entries(history)
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => b.month.localeCompare(a.month))
    .slice(0, limit);

  return result;
}

export async function getPropertyRentHistory(landlordId: string, propertyId: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId, ownerId: landlordId },
  });

  if (!property) throw new AppError("PROPERTY_ACCESS_DENIED", "Access denied.");

  return prisma.rentRecord.findMany({
    where: { tenancy: { propertyId } },
    orderBy: { billingMonth: "desc" },
    include: { tenancy: { select: { tenant: { select: { name: true } } } }, payments: true },
  });
}
