import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { createTestUser } from "./helpers";
import * as applicationService from "@/services/applicationService";
import * as tenancyService from "@/services/tenancyService";
import * as rentService from "@/services/rentService";
import * as paymentService from "@/services/paymentService";
import { AppError } from "@/lib/errors";
import type { User, Tenancy, RentRecord } from "@/generated/prisma/client";

describe("Payment Service", () => {
  let tenant: User;
  let landlord: User;
  let tenancy: Tenancy;
  let rentRecord: RentRecord;

  beforeEach(async () => {
    tenant = await createTestUser({ email: "pay_tenant@test.com", role: "TENANT" });
    landlord = await createTestUser({ email: "pay_landlord@test.com", role: "LANDLORD" });

    const property = await prisma.property.create({
      data: {
        ownerId: landlord.id,
        title: "Pay Property",
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

    rentRecord = await rentService.createRentRecord(landlord.id, {
      tenancyId: tenancy.id,
      billingMonth: "2024-02",
      dueDate: new Date(),
      amount: 20000,
    });
  });

  it("landlord records manual payment and updates rent status", async () => {
    const payment = await paymentService.createPayment(landlord.id, {
      tenancyId: tenancy.id,
      rentRecordId: rentRecord.id,
      amount: 20000,
    });
    
    expect(payment.status).toBe("SUCCESS");

    const updatedRent = await prisma.rentRecord.findUnique({ where: { id: rentRecord.id } });
    expect(updatedRent?.status).toBe("PAID");
    expect(updatedRent?.paidAmount).toBe(20000);

    const pNotification = await prisma.notification.findMany({ where: { userId: tenant.id } });
    expect(pNotification.some(n => n.type === "PAYMENT_SUCCESS")).toBe(true);
  });

  it("partial payment updates rent status to PARTIAL", async () => {
    await paymentService.createPayment(landlord.id, {
      tenancyId: tenancy.id,
      rentRecordId: rentRecord.id,
      amount: 10000,
    });
    
    const updatedRent = await prisma.rentRecord.findUnique({ where: { id: rentRecord.id } });
    expect(updatedRent?.status).toBe("PARTIAL");
    expect(updatedRent?.paidAmount).toBe(10000);
  });

  it("overpayment blocked", async () => {
    await expect(paymentService.createPayment(landlord.id, {
      tenancyId: tenancy.id,
      rentRecordId: rentRecord.id,
      amount: 30000,
    })).rejects.toThrowError(AppError);
  });
});
