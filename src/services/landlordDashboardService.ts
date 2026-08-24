import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";

export async function getLandlordProperties(landlordId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where: { ownerId: landlordId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        _count: { select: { applications: { where: { status: "SUBMITTED" } }, maintenanceRequests: { where: { status: "OPEN" } } } },
        tenancies: { where: { status: "ACTIVE" }, include: { tenant: { select: { name: true } } } },
      },
    }),
    prisma.property.count({ where: { ownerId: landlordId } }),
  ]);

  return {
    properties: properties.map(p => ({
      ...p,
      occupancyStatus: p.tenancies.length > 0 ? "OCCUPIED" : "VACANT",
      activeTenant: p.tenancies[0]?.tenant?.name || null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getLandlordPropertyOverview(propertyId: string, landlordId: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      tenancies: {
        where: { status: "ACTIVE" },
        include: {
          tenant: { select: { id: true, name: true, email: true } },
          agreement: true,
        }
      },
      applications: { where: { status: "SUBMITTED" } },
      maintenanceRequests: { where: { status: { in: ["OPEN", "ACKNOWLEDGED", "IN_PROGRESS"] } } },
    }
  });

  if (!property) throw new AppError("NOT_FOUND", "Property not found.");
  if (property.ownerId !== landlordId) throw new AppError("PROPERTY_ACCESS_DENIED", "You do not have access to this property.");

  const activeTenancy = property.tenancies[0] || null;

  return {
    property,
    occupancyStatus: activeTenancy ? "OCCUPIED" : "VACANT",
    activeTenant: activeTenancy?.tenant || null,
    activeTenancy,
    monthlyRent: activeTenancy ? activeTenancy.monthlyRent : property.rent,
    pendingApplications: property.applications.length,
    openMaintenanceRequests: property.maintenanceRequests.length,
  };
}

export async function getPropertyOccupancy(propertyId: string, landlordId: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: { tenancies: { where: { status: "ACTIVE" } } },
  });

  if (!property) throw new AppError("NOT_FOUND", "Property not found.");
  if (property.ownerId !== landlordId) throw new AppError("PROPERTY_ACCESS_DENIED", "Access denied.");

  return {
    occupancyStatus: property.tenancies.length > 0 ? "OCCUPIED" : "VACANT",
  };
}
