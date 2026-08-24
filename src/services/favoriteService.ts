import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { Prisma } from "@/generated/prisma/client";

export async function addFavorite(userId: string, propertyId: string) {
  try {
    return await prisma.favorite.create({
      data: {
        userId,
        propertyId,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError("DUPLICATE_FAVORITE", "Property is already in your favorites.");
    }
    throw error;
  }
}

export async function removeFavorite(userId: string, propertyId: string) {
  try {
    await prisma.favorite.delete({
      where: {
        userId_propertyId: {
          userId,
          propertyId,
        },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      // Ignore or throw NOT_FOUND depending on preference. Ignoring is safe.
      return;
    }
    throw error;
  }
}

export async function checkFavorite(userId: string, propertyId: string): Promise<boolean> {
  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_propertyId: {
        userId,
        propertyId,
      },
    },
  });

  return !!favorite;
}

export async function listMyFavorites(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [favorites, total] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        property: {
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
            furnishingStatus: true,
            status: true,
            images: {
              where: { isPrimary: true },
              take: 1,
              select: { url: true },
            },
          },
        },
      },
    }),
    prisma.favorite.count({ where: { userId } }),
  ]);

  return {
    favorites,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
