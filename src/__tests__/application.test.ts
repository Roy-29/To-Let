import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { createTestUser } from "./helpers";
import * as applicationService from "@/services/applicationService";
import { AppError } from "@/lib/errors";
import type { User, Property } from "@/generated/prisma/client";

describe("Application Service", () => {
  let tenant: User;
  let tenant2: User;
  let landlord: User;
  let property: Property;

  beforeEach(async () => {
    tenant = await createTestUser({ email: "app_tenant@test.com", role: "TENANT" });
    tenant2 = await createTestUser({ email: "app_tenant2@test.com", role: "TENANT" });
    landlord = await createTestUser({ email: "app_landlord@test.com", role: "LANDLORD" });

    property = await prisma.property.create({
      data: {
        ownerId: landlord.id,
        title: "App Property",
        propertyType: "APARTMENT",
        status: "PUBLISHED",
        address: "123 Test St",
        city: "Dhaka",
        rent: 20000,
        bedrooms: 2,
        bathrooms: 2,
      },
    });
  });

  it("tenant applies and landlord approves", async () => {
    // Submit
    const app = await applicationService.createApplication(tenant.id, {
      propertyId: property.id,
      moveInDate: new Date(),
    });
    expect(app.status).toBe("SUBMITTED");

    // Duplicate blocked
    await expect(applicationService.createApplication(tenant.id, {
      propertyId: property.id,
    })).rejects.toThrowError(AppError);

    // Review
    const reviewed = await applicationService.reviewApplication(app.id, landlord.id);
    expect(reviewed.status).toBe("UNDER_REVIEW");

    // Approve
    const approved = await applicationService.approveApplication(app.id, landlord.id);
    expect(approved.status).toBe("APPROVED");
  });

  it("tenant withdraws application", async () => {
    const app = await applicationService.createApplication(tenant.id, {
      propertyId: property.id,
    });
    const withdrawn = await applicationService.withdrawApplication(app.id, tenant.id);
    expect(withdrawn.status).toBe("WITHDRAWN");
  });

  it("invalid access blocked", async () => {
    const app = await applicationService.createApplication(tenant.id, {
      propertyId: property.id,
    });
    await expect(applicationService.getApplicationById(app.id, tenant2.id))
      .rejects.toThrowError(AppError);
    await expect(applicationService.approveApplication(app.id, tenant2.id))
      .rejects.toThrowError(AppError);
  });
});
