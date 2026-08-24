import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { createTestUser } from "./helpers";
import * as visitService from "@/services/visitService";
import { AppError } from "@/lib/errors";
import type { User, Property } from "@/generated/prisma/client";

describe("Visit Service", () => {
  let tenant: User;
  let tenant2: User;
  let landlord: User;
  let property: Property;

  beforeEach(async () => {
    tenant = await createTestUser({ email: "visit_tenant@test.com", role: "TENANT" });
    tenant2 = await createTestUser({ email: "visit_tenant2@test.com", role: "TENANT" });
    landlord = await createTestUser({ email: "visit_landlord@test.com", role: "LANDLORD" });

    property = await prisma.property.create({
      data: {
        ownerId: landlord.id,
        title: "Visit Property",
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

  it("visit request lifecycle", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2);

    // Tenant requests visit
    const visit = await visitService.createVisitRequest(tenant.id, {
      propertyId: property.id,
      requestedDate: futureDate,
      requestedTime: "10:00",
      message: "Can I visit?",
    });

    expect(visit.status).toBe("REQUESTED");

    // Landlord receives notification
    const llNotifications = await prisma.notification.findMany({ where: { userId: landlord.id } });
    expect(llNotifications[0].type).toBe("VISIT_REQUEST");

    // Landlord accepts visit
    const accepted = await visitService.acceptVisit(visit.id, landlord.id);
    expect(accepted.status).toBe("ACCEPTED");

    // Tenant receives notification
    const tNotifications = await prisma.notification.findMany({ where: { userId: tenant.id } });
    expect(tNotifications[0].type).toBe("VISIT_ACCEPTED");

    // Landlord completes visit
    const completed = await visitService.completeVisit(visit.id, landlord.id);
    expect(completed.status).toBe("COMPLETED");

    // Invalid transition
    await expect(visitService.cancelVisit(visit.id, tenant.id)).rejects.toThrowError(AppError);
  });

  it("tenant cancels requested visit", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2);

    const visit = await visitService.createVisitRequest(tenant.id, {
      propertyId: property.id,
      requestedDate: futureDate,
      requestedTime: "10:00",
    });

    const cancelled = await visitService.cancelVisit(visit.id, tenant.id);
    expect(cancelled.status).toBe("CANCELLED");

    // Landlord cannot accept cancelled visit
    await expect(visitService.acceptVisit(visit.id, landlord.id)).rejects.toThrowError(AppError);
  });

  it("unauthorized access blocked", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2);

    const visit = await visitService.createVisitRequest(tenant.id, {
      propertyId: property.id,
      requestedDate: futureDate,
      requestedTime: "10:00",
    });

    await expect(visitService.getVisitById(visit.id, tenant2.id)).rejects.toThrowError(AppError);
    await expect(visitService.cancelVisit(visit.id, tenant2.id)).rejects.toThrowError(AppError);
  });
});
