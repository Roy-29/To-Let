import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { createTestUser } from "./helpers";
import * as inquiryService from "@/services/inquiryService";
import { AppError } from "@/lib/errors";
import type { User, Property } from "@/generated/prisma/client";

describe("Inquiry Service", () => {
  let tenant: User;
  let tenant2: User;
  let landlord: User;
  let landlord2: User;
  let property: Property;

  beforeEach(async () => {
    tenant = await createTestUser({ email: "inq_tenant@test.com", role: "TENANT" });
    tenant2 = await createTestUser({ email: "inq_tenant2@test.com", role: "TENANT" });
    landlord = await createTestUser({ email: "inq_landlord@test.com", role: "LANDLORD" });
    landlord2 = await createTestUser({ email: "inq_landlord2@test.com", role: "LANDLORD" });

    property = await prisma.property.create({
      data: {
        ownerId: landlord.id,
        title: "Inquiry Property",
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

  it("tenant creates inquiry and landlord receives it", async () => {
    const inquiry = await inquiryService.createInquiry(tenant.id, {
      propertyId: property.id,
      message: "I am interested in this property.",
    });

    expect(inquiry.id).toBeDefined();
    expect(inquiry.tenantId).toBe(tenant.id);
    expect(inquiry.landlordId).toBe(landlord.id);

    // Check notifications
    const notifications = await prisma.notification.findMany({ where: { userId: landlord.id } });
    expect(notifications.length).toBe(1);
    expect(notifications[0].type).toBe("NEW_INQUIRY");

    // Landlord views inquiry
    const llInquiries = await inquiryService.getLandlordInquiries(landlord.id);
    expect(llInquiries.total).toBe(1);

    // Landlord marks viewed
    const viewed = await inquiryService.markInquiryViewed(inquiry.id, landlord.id);
    expect(viewed.status).toBe("VIEWED");

    // Tenant closes inquiry
    const closed = await inquiryService.closeInquiry(inquiry.id, tenant.id);
    expect(closed.status).toBe("CLOSED");
  });

  it("unrelated user cannot access inquiry", async () => {
    const inquiry = await inquiryService.createInquiry(tenant.id, {
      propertyId: property.id,
      message: "I am interested in this property.",
    });

    await expect(inquiryService.getInquiryById(inquiry.id, tenant2.id))
      .rejects.toThrowError(AppError);
    await expect(inquiryService.getInquiryById(inquiry.id, landlord2.id))
      .rejects.toThrowError(AppError);
  });

  it("tenant cannot create for unavailable property", async () => {
    const draftProp = await prisma.property.create({
      data: {
        ownerId: landlord.id,
        title: "Draft Property",
        propertyType: "APARTMENT",
        status: "DRAFT",
        address: "123 Test St",
        city: "Dhaka",
        rent: 20000,
        bedrooms: 2,
        bathrooms: 2,
      },
    });

    await expect(inquiryService.createInquiry(tenant.id, {
      propertyId: draftProp.id,
      message: "Hello",
    })).rejects.toThrowError(AppError);
  });
});
