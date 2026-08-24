import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { createTestUser } from "./helpers";
import * as favoriteService from "@/services/favoriteService";
import { AppError } from "@/lib/errors";

import type { User, Property } from "@/generated/prisma/client";

describe("Favorite Service", () => {
  let tenant: User;
  let landlord: User;
  let property: Property;

  beforeEach(async () => {
    tenant = await createTestUser({ email: "fav_tenant1@test.com", role: "TENANT" });
    landlord = await createTestUser({ email: "fav_landlord@test.com", role: "LANDLORD" });
    
    property = await prisma.property.create({
      data: {
        ownerId: landlord.id,
        title: "Fav Property",
        propertyType: "APARTMENT",
        address: "123 Fav",
        city: "Dhaka",
        rent: 1000,
        bedrooms: 2,
        bathrooms: 1,
        status: "PUBLISHED",
      },
    });
  });

  it("tenant can favorite", async () => {
    const fav = await favoriteService.addFavorite(tenant.id, property.id);
    expect(fav.userId).toBe(tenant.id);
    expect(fav.propertyId).toBe(property.id);
  });

  it("tenant can unfavorite", async () => {
    await favoriteService.addFavorite(tenant.id, property.id);
    await favoriteService.removeFavorite(tenant.id, property.id);
    
    const isFav = await favoriteService.checkFavorite(tenant.id, property.id);
    expect(isFav).toBe(false);
  });

  it("duplicate favorite blocked", async () => {
    await favoriteService.addFavorite(tenant.id, property.id);
    await expect(favoriteService.addFavorite(tenant.id, property.id))
      .rejects.toThrowError(AppError);
  });
});
