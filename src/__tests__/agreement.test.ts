import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { createTestUser } from "./helpers";
import * as applicationService from "@/services/applicationService";
import * as tenancyService from "@/services/tenancyService";
import * as agreementService from "@/services/agreementService";
import { AppError } from "@/lib/errors";
import type { User, Property, Tenancy } from "@/generated/prisma/client";

describe("Agreement Service", () => {
  let tenant: User;
  let landlord: User;
  let property: Property;
  let tenancy: Tenancy;

  beforeEach(async () => {
    tenant = await createTestUser({ email: "agr_tenant@test.com", role: "TENANT" });
    landlord = await createTestUser({ email: "agr_landlord@test.com", role: "LANDLORD" });

    property = await prisma.property.create({
      data: {
        ownerId: landlord.id,
        title: "Agr Property",
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

  it("creates agreement and both parties sign", async () => {
    const agreement = await agreementService.createAgreement(landlord.id, {
      tenancyId: tenancy.id,
      startDate: new Date(),
    });
    expect(agreement.status).toBe("DRAFT");

    // Tenant signs
    const signedTenant = await agreementService.updateAgreement(agreement.id, tenant.id, "TENANT", {
      signedByTenant: true,
    });
    expect(signedTenant.status).toBe("PENDING_SIGNATURE");

    // Landlord signs
    const signedBoth = await agreementService.updateAgreement(agreement.id, landlord.id, "LANDLORD", {
      signedByLandlord: true,
    });
    expect(signedBoth.status).toBe("ACTIVE");
  });

  it("invalid transitions and signatures blocked", async () => {
    const agreement = await agreementService.createAgreement(landlord.id, {
      tenancyId: tenancy.id,
      startDate: new Date(),
    });

    // Tenant tries to sign for landlord
    await expect(agreementService.updateAgreement(agreement.id, tenant.id, "TENANT", {
      signedByLandlord: true,
    })).rejects.toThrowError(AppError);
  });
});
