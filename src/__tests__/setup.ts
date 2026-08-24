import { prisma } from "@/lib/db";
import { afterAll, beforeEach } from "vitest";

// Clean all tables between tests (order matters for FK constraints)
beforeEach(async () => {
  await prisma.auditLog.deleteMany();
  await prisma.report.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.rentRecord.deleteMany();
  await prisma.rentalAgreement.deleteMany();
  await prisma.tenancy.deleteMany();
  await prisma.rentalApplication.deleteMany();
  await prisma.visitRequest.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.property.deleteMany();
  await prisma.session.deleteMany();
  await prisma.tenantProfile.deleteMany();
  await prisma.landlordProfile.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
