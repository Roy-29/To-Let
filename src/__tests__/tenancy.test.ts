import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { createTestUser } from "./helpers";
import * as applicationService from "@/services/applicationService";
import * as tenancyService from "@/services/tenancyService";
import { AppError } from "@/lib/errors";
import type { User, Property, RentalApplication } from "@/generated/prisma/client";

describe("Tenancy Service", () => {
  let tenant: User;
  let landlord: User;
  let property: Property;
  let application: RentalApplication;

  beforeEach(async () => {
    tenant = await createTestUser({ email: "tenancy_tenant@test.com", role: "TENANT" });
    landlord = await createTestUser({ email: "tenancy_landlord@test.com", role: "LANDLORD" });

    property = await prisma.property.create({
      data: {
        ownerId: landlord.id,
        title: "Tenancy Property",
        propertyType: "APARTMENT",
        status: "PUBLISHED",
        address: "123 Test St",
        city: "Dhaka",
        rent: 20000,
        bedrooms: 2,
        bathrooms: 2,
      },
    });

    application = await applicationService.createApplication(tenant.id, {
      propertyId: property.id,
    });
  });

  it("approved application creates tenancy and updates property", async () => {
    await applicationService.approveApplication(application.id, landlord.id);

    const tenancy = await tenancyService.createTenancy(landlord.id, {
      applicationId: application.id,
      startDate: new Date(),
      monthlyRent: 20000,
    });

    expect(tenancy.id).toBeDefined();
    expect(tenancy.status).toBe("ACTIVE");

    const updatedProp = await prisma.property.findUnique({ where: { id: property.id } });
    expect(updatedProp?.status).toBe("RENTED");

    // Tenant can view
    const tTenancies = await tenancyService.getTenantTenancy(tenant.id);
    expect(tTenancies.total).toBe(1);
  });

  it("unapproved application blocked from tenancy", async () => {
    // Left as SUBMITTED
    await expect(tenancyService.createTenancy(landlord.id, {
      applicationId: application.id,
      startDate: new Date(),
      monthlyRent: 20000,
    })).rejects.toThrowError(AppError);
  });

  it("active tenancy can be terminated", async () => {
    await applicationService.approveApplication(application.id, landlord.id);
    const tenancy = await tenancyService.createTenancy(landlord.id, {
      applicationId: application.id,
      startDate: new Date(),
      monthlyRent: 20000,
    });

    const terminated = await tenancyService.terminateTenancy(tenancy.id, landlord.id);
    expect(terminated.status).toBe("TERMINATED");

    const updatedProp = await prisma.property.findUnique({ where: { id: property.id } });
    expect(updatedProp?.status).toBe("PUBLISHED");
  });
});
