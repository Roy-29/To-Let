import { prisma } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth";
import type { AnalyticsFilterInput } from "@/lib/validations";

export async function getPlatformOverview(adminId: string) {
  await verifyAdmin(adminId);

  const [
    totalUsers,
    tenants,
    landlords,
    activeUsers,
    suspendedUsers,
    totalProperties,
    publishedProperties,
    pendingProperties,
    occupiedProperties,
    activeTenancies,
    pendingApplications,
    openReports,
    openMaintenance,
    rentRecords
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "TENANT" } }),
    prisma.user.count({ where: { role: "LANDLORD" } }),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { status: "SUSPENDED" } }),
    prisma.property.count(),
    prisma.property.count({ where: { status: "PUBLISHED" } }),
    prisma.property.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.property.count({ where: { status: "RENTED" } }),
    prisma.tenancy.count({ where: { status: "ACTIVE" } }),
    prisma.rentalApplication.count({ where: { status: "SUBMITTED" } }),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.maintenanceRequest.count({ where: { status: "OPEN" } }),
    prisma.rentRecord.findMany({
      where: {
        status: { in: ["PAID", "PARTIAL"] },
        paidAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      },
      select: { paidAmount: true }
    })
  ]);

  const monthlyRentVolume = rentRecords.reduce((sum, r) => sum + r.paidAmount, 0);

  return {
    totalUsers,
    tenants,
    landlords,
    activeUsers,
    suspendedUsers,
    totalProperties,
    publishedProperties,
    pendingProperties,
    occupiedProperties,
    activeTenancies,
    pendingApplications,
    openReports,
    openMaintenance,
    monthlyRentVolume
  };
}

export async function getPlatformAnalytics(adminId: string, filters: AnalyticsFilterInput) {
  await verifyAdmin(adminId);

  let startDate: Date | undefined;
  let endDate: Date | undefined;

  if (filters.year) {
    const year = filters.year;
    const month = filters.month ? filters.month - 1 : 0; // 0-indexed for Date
    startDate = new Date(year, month, 1);
    
    if (filters.month) {
      endDate = new Date(year, month + 1, 1);
    } else {
      endDate = new Date(year + 1, 0, 1);
    }
  }

  const dateFilter = startDate && endDate ? {
    createdAt: {
      gte: startDate,
      lt: endDate,
    }
  } : {};

  const [
    newUsers,
    newProperties,
    publishedProperties,
    newApplications,
    activeTenancies,
    maintenanceRequests,
    reports,
  ] = await Promise.all([
    prisma.user.count({ where: dateFilter }),
    prisma.property.count({ where: dateFilter }),
    prisma.property.count({ where: { status: "PUBLISHED", ...dateFilter } }),
    prisma.rentalApplication.count({ where: dateFilter }),
    prisma.tenancy.count({ where: { status: "ACTIVE", ...dateFilter } }),
    prisma.maintenanceRequest.count({ where: dateFilter }),
    prisma.report.count({ where: dateFilter }),
  ]);

  const rentRecords = await prisma.rentRecord.findMany({
    where: { 
      status: { in: ["PAID", "PARTIAL"] },
      ...(startDate && endDate ? { paidAt: { gte: startDate, lt: endDate } } : {})
    },
    select: { paidAmount: true },
  });

  const successfulPayments = rentRecords.length; // Approximate, as one rent record could have multiple payments, but for basic analytics this suffices.
  const rentVolume = rentRecords.reduce((sum, r) => sum + r.paidAmount, 0);

  return {
    newUsers,
    newProperties,
    publishedProperties,
    newApplications,
    activeTenancies,
    maintenanceRequests,
    reports,
    successfulPayments,
    rentVolume,
  };
}

export async function searchPlatform(adminId: string, query: string, type: "users" | "properties" | "applications" | "reports", page = 1, limit = 20) {
  await verifyAdmin(adminId);
  const skip = (page - 1) * limit;

  if (type === "users") {
    const where = {
      OR: [
        { name: { contains: query } },
        { email: { contains: query } },
      ],
    };
    const [results, total] = await Promise.all([
      prisma.user.findMany({ where, skip, take: limit }),
      prisma.user.count({ where }),
    ]);
    return { results, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  if (type === "properties") {
    const where = {
      OR: [
        { title: { contains: query } },
        { city: { contains: query } },
      ],
    };
    const [results, total] = await Promise.all([
      prisma.property.findMany({ where, include: { owner: { select: { name: true } } }, skip, take: limit }),
      prisma.property.count({ where }),
    ]);
    return { results, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  if (type === "applications") {
    const where = {
      OR: [
        { tenant: { name: { contains: query } } },
        { landlord: { name: { contains: query } } },
      ],
    };
    const [results, total] = await Promise.all([
      prisma.rentalApplication.findMany({ where, include: { tenant: { select: { name: true } }, landlord: { select: { name: true } } }, skip, take: limit }),
      prisma.rentalApplication.count({ where }),
    ]);
    return { results, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  if (type === "reports") {
    const where = {
      OR: [
        { reason: { contains: query } },
        { targetType: { contains: query } },
      ],
    };
    const [results, total] = await Promise.all([
      prisma.report.findMany({ where, skip, take: limit }),
      prisma.report.count({ where }),
    ]);
    return { results, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  return { results: [], total: 0, page, limit, totalPages: 0 };
}
