import { prisma } from "@/lib/db";

export async function getLandlordAnalytics(landlordId: string) {
  const properties = await prisma.property.findMany({
    where: { ownerId: landlordId },
    select: { id: true, status: true },
  });

  const totalProperties = properties.length;
  const publishedProperties = properties.filter(p => p.status === "PUBLISHED").length;
  const pausedProperties = properties.filter(p => p.status === "PAUSED").length;

  const activeTenancies = await prisma.tenancy.findMany({
    where: { landlordId, status: "ACTIVE" },
    select: { id: true, propertyId: true, monthlyRent: true, tenantId: true },
  });

  const occupiedProperties = new Set(activeTenancies.map(t => t.propertyId)).size;
  const vacantProperties = totalProperties - occupiedProperties;
  
  // Occupancy rate
  const occupancyRate = totalProperties > 0 ? (occupiedProperties / totalProperties) * 100 : 0;

  const activeTenants = new Set(activeTenancies.map(t => t.tenantId)).size;

  const pendingApplications = await prisma.rentalApplication.count({
    where: { landlordId, status: "SUBMITTED" },
  });

  const openMaintenanceRequests = await prisma.maintenanceRequest.count({
    where: { property: { ownerId: landlordId }, status: { in: ["OPEN", "ACKNOWLEDGED", "IN_PROGRESS"] } },
  });

  // Basic monthly snapshot for the current month
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const rentRecords = await prisma.rentRecord.findMany({
    where: { tenancy: { landlordId }, billingMonth: currentMonth },
  });

  const monthlyExpectedRent = activeTenancies.reduce((sum, t) => sum + t.monthlyRent, 0); // Expected from active tenancies
  const collectedRent = rentRecords.reduce((sum, r) => sum + r.paidAmount, 0);
  
  const pendingRent = rentRecords
    .filter(r => r.status === "PENDING" || r.status === "PARTIAL")
    .reduce((sum, r) => sum + (r.amount - r.paidAmount), 0);

  const overdueRent = rentRecords
    .filter(r => r.status === "OVERDUE")
    .reduce((sum, r) => sum + (r.amount - r.paidAmount), 0);

  return {
    totalProperties,
    publishedProperties,
    pausedProperties,
    vacantProperties,
    occupiedProperties,
    occupancyRate,
    activeTenants,
    pendingApplications,
    monthlyExpectedRent,
    collectedRent,
    pendingRent,
    overdueRent,
    openMaintenanceRequests,
  };
}

export async function getAdminAnalytics() {
  const [
    totalUsers,
    totalLandlords,
    totalTenants,
    totalProperties,
    publishedProperties,
    activeTenancies,
    pendingApplications,
    openMaintenanceRequests,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "LANDLORD" } }),
    prisma.user.count({ where: { role: "TENANT" } }),
    prisma.property.count(),
    prisma.property.count({ where: { status: "PUBLISHED" } }),
    prisma.tenancy.count({ where: { status: "ACTIVE" } }),
    prisma.rentalApplication.count({ where: { status: "SUBMITTED" } }),
    prisma.maintenanceRequest.count({ where: { status: { in: ["OPEN", "ACKNOWLEDGED", "IN_PROGRESS"] } } }),
  ]);

  // Rough estimation of occupied properties = count of distinct properties in active tenancies
  const activeT = await prisma.tenancy.findMany({
    where: { status: "ACTIVE" },
    select: { propertyId: true, monthlyRent: true },
  });

  const occupiedProperties = new Set(activeT.map(t => t.propertyId)).size;
  const monthlyRentVolume = activeT.reduce((sum, t) => sum + t.monthlyRent, 0);

  return {
    totalUsers,
    totalLandlords,
    totalTenants,
    totalProperties,
    publishedProperties,
    occupiedProperties,
    activeTenancies,
    monthlyRentVolume,
    pendingApplications,
    openMaintenanceRequests,
  };
}
