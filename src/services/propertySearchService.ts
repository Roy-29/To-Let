import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { Prisma } from "@/generated/prisma/client";
import type { PropertySearchInput } from "@/lib/validations";

export async function searchProperties(filters: PropertySearchInput) {
  const where: Prisma.PropertyWhereInput = {
    status: "PUBLISHED",
  };

  if (filters.city) where.city = { contains: filters.city };
  if (filters.area) where.area = { contains: filters.area };
  if (filters.propertyType) where.propertyType = filters.propertyType;
  if (filters.bedrooms !== undefined) where.bedrooms = { gte: filters.bedrooms };
  if (filters.bathrooms !== undefined) where.bathrooms = { gte: filters.bathrooms };
  if (filters.furnishingStatus) where.furnishingStatus = filters.furnishingStatus;
  if (filters.availableFrom) where.availableFrom = { lte: filters.availableFrom };

  if (filters.minRent || filters.maxRent) {
    where.rent = {};
    if (filters.minRent) where.rent.gte = filters.minRent;
    if (filters.maxRent) where.rent.lte = filters.maxRent;
  }

  const orderBy: Prisma.PropertyOrderByWithRelationInput =
    filters.sortBy === "PRICE_LOW_TO_HIGH"
      ? { rent: "asc" }
      : filters.sortBy === "PRICE_HIGH_TO_LOW"
        ? { rent: "desc" }
        : { createdAt: "desc" };

  const skip = (filters.page - 1) * filters.limit;

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy,
      skip,
      take: filters.limit,
      select: {
        id: true,
        title: true,
        propertyType: true,
        address: true,
        area: true,
        city: true,
        rent: true,
        bedrooms: true,
        bathrooms: true,
        size: true,
        furnishingStatus: true,
        availableFrom: true,
        createdAt: true,
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { url: true },
        },
      },
    }),
    prisma.property.count({ where }),
  ]);

  return {
    properties,
    total,
    page: filters.page,
    limit: filters.limit,
    totalPages: Math.ceil(total / filters.limit),
  };
}

export async function getPublicPropertyDetails(id: string) {
  const property = await prisma.property.findUnique({
    where: { id, status: "PUBLISHED" }, // Only return published properties
    select: {
      id: true,
      title: true,
      description: true,
      propertyType: true,
      address: true,
      area: true,
      city: true,
      rent: true,
      securityDeposit: true,
      bedrooms: true,
      bathrooms: true,
      size: true,
      floor: true,
      furnishingStatus: true,
      parking: true,
      rules: true,
      availableFrom: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      images: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, url: true, isPrimary: true },
      },
      owner: {
        select: {
          id: true,
          name: true,
          landlordProfile: {
            select: { verificationStatus: true }, // Don't expose private phone number publicly unless necessary
          },
        },
      },
    },
  });

  if (!property) {
    throw new AppError("NOT_FOUND", "Property not found or not available.");
  }

  return property;
}
