import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { createTestUser } from "./helpers";
import * as applicationService from "@/services/applicationService";
import * as tenancyService from "@/services/tenancyService";
import * as rentService from "@/services/rentService";
import { AppError } from "@/lib/errors";
import type { User, Tenancy } from "@/generated/prisma/client";

describe("Rent Service", () => {
  let tenant: User;
  let landlord: User;
  let tenancy: Tenancy;

  beforeEach(async () => {
    tenant = await createTestUser({ email: "rent_tenant@test.com", role: "TENANT" });
    landlord = await createTestUser({ email: "rent_landlord@test.com", role: "LANDLORD" });

    const property = await prisma.property.create({
      data: {
        ownerId: landlord.id,
        title: "Rent Property",
        propertyType: "APARTMENT",
        status: "PUBLISHED",
        address: "123 Test St",
        city: "Dhaka",
        rent: 20000,
        bedrooms: 2,
        bathrooms: 2,
      },
    });

    const application = await applicationService.createApplication(tenant.id, { propertyId: property.id });
    await applicationService.approveApplication(application.id, landlord.id);
    tenancy = await tenancyService.createTenancy(landlord.id, {
      applicationId: application.id,
      startDate: new Date(),
      monthlyRent: 20000,
    });
  });

  it("creates rent record and prevents duplicates", async () => {
    const record = await rentService.createRentRecord(landlord.id, {
      tenancyId: tenancy.id,
      billingMonth: "2024-01",
      dueDate: new Date(),
      amount: 20000,
    });
    expect(record.status).toBe("PENDING");

    await expect(rentService.createRentRecord(landlord.id, {
      tenancyId: tenancy.id,
      billingMonth: "2024-01",
      dueDate: new Date(),
      amount: 20000,
    })).rejects.toThrowError(AppError);
  });
});
