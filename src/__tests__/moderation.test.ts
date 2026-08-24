import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { createTestUser } from "./helpers";
import * as propertyService from "@/services/propertyService";
import * as moderationService from "@/services/moderationService";
import { AppError } from "@/lib/errors";
import type { User, Property } from "@/generated/prisma/client";

describe("Property Moderation", () => {
  let admin: User;
  let landlord: User;
  let property: Property;

  beforeEach(async () => {
    admin = await createTestUser({ email: "admin3@test.com", role: "ADMIN" });
    landlord = await createTestUser({ email: "mod_landlord@test.com", role: "LANDLORD" });

    property = await prisma.property.create({
      data: {
        ownerId: landlord.id,
        title: "Mod Property",
        propertyType: "APARTMENT",
        status: "DRAFT",
        address: "123 Test St",
        city: "Dhaka",
        rent: 20000,
        bedrooms: 2,
        bathrooms: 2,
      },
    });
  });

  it("landlord requests review, admin approves", async () => {
    // Landlord submits for review
    await prisma.property.update({ where: { id: property.id }, data: { status: "PENDING_REVIEW" } });

    const pending = await moderationService.getAllPropertiesForAdmin(admin.id, { status: "PENDING_REVIEW" });
    expect(pending.total).toBeGreaterThanOrEqual(1);

    const approved = await moderationService.approveProperty(admin.id, property.id);
    expect(approved.status).toBe("PUBLISHED");
  });

  it("admin rejects property", async () => {
    await prisma.property.update({ where: { id: property.id }, data: { status: "PENDING_REVIEW" } });

    const rejected = await moderationService.rejectProperty(admin.id, property.id, "Inappropriate image");
    expect(rejected.status).toBe("REJECTED");
    expect(rejected.rejectionReason).toBe("Inappropriate image");
  });

  it("admin requests changes", async () => {
    await prisma.property.update({ where: { id: property.id }, data: { status: "PENDING_REVIEW" } });

    const changes = await moderationService.requestPropertyChanges(admin.id, property.id, "Please upload better images");
    expect(changes.status).toBe("DRAFT");
    expect(changes.changeRequestReason).toBe("Please upload better images");
  });

  it("non-admin blocked from moderation", async () => {
    await prisma.property.update({ where: { id: property.id }, data: { status: "PENDING_REVIEW" } });
    await expect(moderationService.approveProperty(landlord.id, property.id))
      .rejects.toThrowError(AppError);
  });
});
