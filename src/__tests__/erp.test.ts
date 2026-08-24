import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { createTestUser } from "./helpers";
import * as applicationService from "@/services/applicationService";
import * as tenancyService from "@/services/tenancyService";
import * as rentService from "@/services/rentService";
import * as landlordDashboardService from "@/services/landlordDashboardService";
import * as tenantManagementService from "@/services/tenantManagementService";
import * as analyticsService from "@/services/analyticsService";
import { AppError } from "@/lib/errors";
import type { User, Property, Tenancy } from "@/generated/prisma/client";

describe("ERP Services", () => {
  let tenant: User;
  let landlord: User;
  let otherLandlord: User;
  let property: Property;
  let tenancy: Tenancy;

  beforeEach(async () => {
    tenant = await createTestUser({ email: "erp_tenant@test.com", role: "TENANT" });
    landlord = await createTestUser({ email: "erp_landlord@test.com", role: "LANDLORD" });
    otherLandlord = await createTestUser({ email: "erp_other_landlord@test.com", role: "LANDLORD" });

    property = await prisma.property.create({
      data: {
        ownerId: landlord.id,
        title: "ERP Property",
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

  it("landlord dashboard retrieves correct occupancy", async () => {
    const overview = await landlordDashboardService.getLandlordPropertyOverview(property.id, landlord.id);
    expect(overview.occupancyStatus).toBe("OCCUPIED");
    expect(overview.activeTenant?.name).toBeDefined();

    // Terminate tenancy
    await tenancyService.terminateTenancy(tenancy.id, landlord.id);
    const updatedOverview = await landlordDashboardService.getLandlordPropertyOverview(property.id, landlord.id);
    expect(updatedOverview.occupancyStatus).toBe("VACANT");
  });

  it("landlord can view own tenant and not unrelated", async () => {
    const tenantDetails = await tenantManagementService.getTenantDetails(landlord.id, tenant.id);
    expect(tenantDetails.tenant?.id).toBe(tenant.id);

    // Unrelated landlord
    await expect(tenantManagementService.getTenantDetails(otherLandlord.id, tenant.id))
      .rejects.toThrowError(AppError);
  });

  it("analytics correctly calculates totals", async () => {
    // Current month rent record
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    await rentService.createRentRecord(landlord.id, {
      tenancyId: tenancy.id,
      billingMonth: currentMonth,
      dueDate: new Date(),
      amount: 20000,
    });

    const analytics = await analyticsService.getLandlordAnalytics(landlord.id);
    
    expect(analytics.totalProperties).toBe(1);
    expect(analytics.occupiedProperties).toBe(1);
    expect(analytics.occupancyRate).toBe(100);
    expect(analytics.activeTenants).toBe(1);
    expect(analytics.monthlyExpectedRent).toBe(20000);
    expect(analytics.pendingRent).toBe(20000);
  });
});
