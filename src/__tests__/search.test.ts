import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { createTestUser } from "./helpers";
import * as propertySearchService from "@/services/propertySearchService";

import type { User, Property } from "@/generated/prisma/client";

describe("Property Search Service", () => {
  let landlord: User;
  let draftProp: Property;
  let publishedProp1: Property;
  let publishedProp2: Property;

  beforeEach(async () => {
    landlord = await createTestUser({ email: "search_landlord@test.com", role: "LANDLORD" });
    
    draftProp = await prisma.property.create({
      data: {
        ownerId: landlord.id,
        title: "Draft Property",
        propertyType: "APARTMENT",
        address: "123 Draft",
        city: "Dhaka",
        rent: 1000,
        bedrooms: 2,
        bathrooms: 1,
        status: "DRAFT",
      },
    });

    publishedProp1 = await prisma.property.create({
      data: {
        ownerId: landlord.id,
        title: "Published 1",
        propertyType: "APARTMENT",
        address: "123 Pub",
        city: "Dhaka",
        rent: 2000,
        bedrooms: 3,
        bathrooms: 2,
        status: "PUBLISHED",
      },
    });

    publishedProp2 = await prisma.property.create({
      data: {
        ownerId: landlord.id,
        title: "Published 2",
        propertyType: "HOUSE",
        address: "456 Pub",
        city: "Sylhet",
        rent: 3000,
        bedrooms: 4,
        bathrooms: 3,
        status: "PUBLISHED",
      },
    });
  });

  it("public cannot see drafts in search, only published properties returned", async () => {
    const res = await propertySearchService.searchProperties({
      page: 1,
      limit: 10,
      sortBy: "NEWEST",
    });
    const ids = res.properties.map(p => p.id);
    expect(ids).not.toContain(draftProp.id);
    expect(ids).toContain(publishedProp1.id);
    expect(ids).toContain(publishedProp2.id);
  });

  it("public cannot see drafts in details, public can see published property", async () => {
    await expect(propertySearchService.getPublicPropertyDetails(draftProp.id))
      .rejects.toThrow();
    
    const details = await propertySearchService.getPublicPropertyDetails(publishedProp1.id);
    expect(details.id).toBe(publishedProp1.id);
  });

  it("filters work", async () => {
    const res = await propertySearchService.searchProperties({
      city: "Sylhet",
      page: 1,
      limit: 10,
      sortBy: "NEWEST",
    });
    expect(res.properties.length).toBe(1);
    expect(res.properties[0].id).toBe(publishedProp2.id);
  });

  it("sorting works", async () => {
    const res = await propertySearchService.searchProperties({
      page: 1,
      limit: 10,
      sortBy: "PRICE_HIGH_TO_LOW",
    });
    expect(res.properties[0].rent).toBeGreaterThanOrEqual(res.properties[1].rent);
  });

  it("pagination works", async () => {
    const res1 = await propertySearchService.searchProperties({
      page: 1,
      limit: 1,
      sortBy: "PRICE_LOW_TO_HIGH",
    });
    expect(res1.properties.length).toBe(1);
    
    const res2 = await propertySearchService.searchProperties({
      page: 2,
      limit: 1,
      sortBy: "PRICE_LOW_TO_HIGH",
    });
    expect(res2.properties.length).toBe(1);
    expect(res1.properties[0].id).not.toBe(res2.properties[0].id);
  });
});
