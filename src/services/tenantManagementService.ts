import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";

export async function getLandlordTenants(landlordId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  // Tenants are users who have a tenancy with the landlord
  const [tenancies, total] = await Promise.all([
    prisma.tenancy.findMany({
      where: { landlordId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        tenant: { select: { id: true, name: true, email: true, tenantProfile: true } },
        property: { select: { id: true, title: true } },
      }
    }),
    prisma.tenancy.count({ where: { landlordId } }),
  ]);

  return {
    tenants: tenancies, // Returning the tenancy wrappers to provide context (which property etc)
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getTenantDetails(landlordId: string, tenantId: string) {
  // Check if tenant has any tenancy with landlord
  const tenancies = await prisma.tenancy.findMany({
    where: { landlordId, tenantId },
    include: {
      property: { select: { id: true, title: true } },
      agreement: true,
      rentRecords: { orderBy: { billingMonth: "desc" }, take: 5 },
      maintenanceRequests: { orderBy: { createdAt: "desc" }, take: 5 },
    }
  });

  if (tenancies.length === 0) {
    throw new AppError("TENANT_ACCESS_DENIED", "You do not have a rental relationship with this tenant.");
  }

  const tenant = await prisma.user.findUnique({
    where: { id: tenantId },
    select: {
      id: true,
      name: true,
      email: true,
      tenantProfile: true,
    }
  });

  return {
    tenant,
    tenancies,
  };
}

export async function getTenantRentHistory(landlordId: string, tenantId: string) {
  const tenancies = await prisma.tenancy.findMany({ where: { landlordId, tenantId }, select: { id: true } });
  if (tenancies.length === 0) {
    throw new AppError("TENANT_ACCESS_DENIED", "You do not have a rental relationship with this tenant.");
  }
  const tenancyIds = tenancies.map(t => t.id);

  return prisma.rentRecord.findMany({
    where: { tenancyId: { in: tenancyIds } },
    orderBy: { billingMonth: "desc" },
    include: { payments: true, tenancy: { select: { property: { select: { title: true } } } } },
  });
}

export async function getTenantMaintenanceHistory(landlordId: string, tenantId: string) {
  const tenancies = await prisma.tenancy.findMany({ where: { landlordId, tenantId }, select: { id: true } });
  if (tenancies.length === 0) {
    throw new AppError("TENANT_ACCESS_DENIED", "You do not have a rental relationship with this tenant.");
  }
  const tenancyIds = tenancies.map(t => t.id);

  return prisma.maintenanceRequest.findMany({
    where: { tenancyId: { in: tenancyIds } },
    orderBy: { createdAt: "desc" },
    include: { property: { select: { title: true } } },
  });
}
