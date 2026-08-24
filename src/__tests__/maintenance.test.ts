import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { createTestUser } from "./helpers";
import * as applicationService from "@/services/applicationService";
import * as tenancyService from "@/services/tenancyService";
import * as maintenanceService from "@/services/maintenanceService";
import { AppError } from "@/lib/errors";
import type { User, Property } from "@/generated/prisma/client";

describe("Maintenance Service", () => {
  let tenant: User;
  let landlord: User;
  let property: Property;

  beforeEach(async () => {
    tenant = await createTestUser({ email: "maint_tenant@test.com", role: "TENANT" });
    landlord = await createTestUser({ email: "maint_landlord@test.com", role: "LANDLORD" });

    property = await prisma.property.create({
      data: {
        ownerId: landlord.id,
        title: "Maint Property",
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
    await tenancyService.createTenancy(landlord.id, {
      applicationId: application.id,
      startDate: new Date(),
      monthlyRent: 20000,
    });
  });

  it("active tenant creates request and landlord processes it", async () => {
    const request = await maintenanceService.createMaintenanceRequest(tenant.id, {
      title: "Leaky Faucet",
      description: "The kitchen faucet is leaking",
      category: "PLUMBING",
      priority: "LOW",
    });

    expect(request.status).toBe("OPEN");

    // Landlord acknowledges
    const ack = await maintenanceService.acknowledgeMaintenance(request.id, landlord.id);
    expect(ack.status).toBe("ACKNOWLEDGED");

    // Landlord starts
    const prog = await maintenanceService.startMaintenance(request.id, landlord.id);
    expect(prog.status).toBe("IN_PROGRESS");

    // Landlord resolves
    const res = await maintenanceService.resolveMaintenance(request.id, landlord.id);
    expect(res.status).toBe("RESOLVED");

    // Tenant closes
    const cls = await maintenanceService.closeMaintenance(request.id, tenant.id);
    expect(cls.status).toBe("CLOSED");
  });

  it("non-tenant blocked from creating request", async () => {
    const otherTenant = await createTestUser({ email: "other_tenant@test.com", role: "TENANT" });
    await expect(maintenanceService.createMaintenanceRequest(otherTenant.id, {
      title: "Leaky Faucet",
      description: "The kitchen faucet is leaking",
      category: "PLUMBING",
      priority: "LOW",
    })).rejects.toThrowError(AppError);
  });

  it("invalid state transitions blocked", async () => {
    const request = await maintenanceService.createMaintenanceRequest(tenant.id, {
      title: "Broken AC",
      description: "AC is not cooling",
      category: "AC",
      priority: "HIGH",
    });

    // Try to resolve before acknowledging
    await expect(maintenanceService.resolveMaintenance(request.id, landlord.id))
      .rejects.toThrowError(AppError);
  });

  it("notes preserve history", async () => {
    const request = await maintenanceService.createMaintenanceRequest(tenant.id, {
      title: "Leaky Faucet",
      description: "The kitchen faucet is leaking",
      category: "PLUMBING",
      priority: "LOW",
    });

    await maintenanceService.addMaintenanceNote(request.id, tenant.id, { note: "Note 1" });
    await maintenanceService.addMaintenanceNote(request.id, landlord.id, { note: "Note 2" });

    const req = await maintenanceService.getMaintenanceRequestById(request.id, tenant.id, "TENANT");
    expect(req.notes.length).toBe(2);
    expect(req.notes[0].note).toBe("Note 1");
    expect(req.notes[1].note).toBe("Note 2");
  });
});
