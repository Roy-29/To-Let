import { describe, it, expect, beforeEach } from "vitest";
import { createTestUser } from "./helpers";
import * as propertyService from "@/services/propertyService";
import { AppError } from "@/lib/errors";

import type { User } from "@/generated/prisma/client";

describe("Property Service", () => {
  let landlord: User;
  let landlord2: User;

  beforeEach(async () => {
    landlord = await createTestUser({ email: "landlord1@test.com", role: "LANDLORD" });
    landlord2 = await createTestUser({ email: "landlord2@test.com", role: "LANDLORD" });
  });

  const validPropertyData = {
    title: "Test Property",
    propertyType: "APARTMENT" as const,
    address: "123 Test St",
    city: "Test City",
    rent: 1000,
    bedrooms: 2,
    bathrooms: 1,
    parking: false,
  };

  it("landlord creates property", async () => {
    const property = await propertyService.createProperty(landlord.id, validPropertyData);
    expect(property.id).toBeDefined();
    expect(property.status).toBe("DRAFT");
    expect(property.ownerId).toBe(landlord.id);
  });

  it("landlord updates own property", async () => {
    const property = await propertyService.createProperty(landlord.id, validPropertyData);
    const updated = await propertyService.updateProperty(property.id, landlord.id, { title: "Updated Title" });
    expect(updated.title).toBe("Updated Title");
  });

  it("landlord cannot update another landlord's property", async () => {
    const property = await propertyService.createProperty(landlord.id, validPropertyData);
    await expect(propertyService.updateProperty(property.id, landlord2.id, { title: "Hacked" }))
      .rejects.toThrowError(AppError);
  });

  it("landlord cannot delete another landlord's property", async () => {
    const property = await propertyService.createProperty(landlord.id, validPropertyData);
    await expect(propertyService.deleteProperty(property.id, landlord2.id))
      .rejects.toThrowError(AppError);
  });

  it("invalid status transition blocked (DRAFT to PAUSED)", async () => {
    const property = await propertyService.createProperty(landlord.id, validPropertyData);
    await expect(propertyService.pauseProperty(property.id, landlord.id))
      .rejects.toThrowError(AppError);
  });
});
