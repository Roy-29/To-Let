import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { createTestUser } from "./helpers";
import * as propertyService from "@/services/propertyService";

import type { User, Property } from "@/generated/prisma/client";

describe("Property Availability", () => {
  let landlord: User;
  let draftProp: Property;
  let publishedProp: Property;
  let pausedProp: Property;
  let rentedProp: Property;
  let expiredProp: Property;

  beforeEach(async () => {
    landlord = await createTestUser({ email: "avail_landlord@test.com", role: "LANDLORD" });
    
    draftProp = await prisma.property.create({
      data: {
        ownerId: landlord.id, title: "Draft", propertyType: "APARTMENT", address: "1", city: "C", rent: 1, bedrooms: 1, bathrooms: 1,
        status: "DRAFT",
      },
    });
    
    publishedProp = await prisma.property.create({
      data: {
        ownerId: landlord.id, title: "Published", propertyType: "APARTMENT", address: "2", city: "C", rent: 1, bedrooms: 1, bathrooms: 1,
        status: "PUBLISHED",
      },
    });

    pausedProp = await prisma.property.create({
      data: {
        ownerId: landlord.id, title: "Paused", propertyType: "APARTMENT", address: "3", city: "C", rent: 1, bedrooms: 1, bathrooms: 1,
        status: "PAUSED",
      },
    });

    rentedProp = await prisma.property.create({
      data: {
        ownerId: landlord.id, title: "Rented", propertyType: "APARTMENT", address: "4", city: "C", rent: 1, bedrooms: 1, bathrooms: 1,
        status: "RENTED",
      },
    });

    expiredProp = await prisma.property.create({
      data: {
        ownerId: landlord.id, title: "Expired", propertyType: "APARTMENT", address: "5", city: "C", rent: 1, bedrooms: 1, bathrooms: 1,
        status: "EXPIRED",
      },
    });
  });

  it("published available property passes", async () => {
    expect(await propertyService.isPropertyAvailable(publishedProp.id)).toBe(true);
  });

  it("paused property fails", async () => {
    expect(await propertyService.isPropertyAvailable(pausedProp.id)).toBe(false);
  });

  it("rented property fails", async () => {
    expect(await propertyService.isPropertyAvailable(rentedProp.id)).toBe(false);
  });

  it("expired property fails", async () => {
    expect(await propertyService.isPropertyAvailable(expiredProp.id)).toBe(false);
  });
  
  it("draft property fails", async () => {
    expect(await propertyService.isPropertyAvailable(draftProp.id)).toBe(false);
  });
});
