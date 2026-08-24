import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { requireOwnership } from "@/lib/auth";
import type { AgreementCreateInput, AgreementUpdateInput } from "@/lib/validations";

export async function createAgreement(landlordId: string, data: AgreementCreateInput) {
  const tenancy = await prisma.tenancy.findUnique({
    where: { id: data.tenancyId },
  });

  if (!tenancy) throw new AppError("NOT_FOUND", "Tenancy not found.");
  requireOwnership(tenancy.landlordId, landlordId);

  const existing = await prisma.rentalAgreement.findUnique({
    where: { tenancyId: data.tenancyId },
  });

  if (existing) {
    throw new AppError("ALREADY_EXISTS", "Agreement already exists for this tenancy.");
  }

  return prisma.rentalAgreement.create({
    data: {
      tenancyId: data.tenancyId,
      documentUrl: data.documentUrl,
      startDate: data.startDate,
      endDate: data.endDate,
      status: "DRAFT",
    },
  });
}

export async function getAgreement(tenancyId: string, userId: string) {
  const tenancy = await prisma.tenancy.findUnique({
    where: { id: tenancyId },
    include: { agreement: true },
  });

  if (!tenancy) throw new AppError("NOT_FOUND", "Tenancy not found.");
  if (tenancy.tenantId !== userId && tenancy.landlordId !== userId) {
    throw new AppError("FORBIDDEN", "You do not have access to this agreement.");
  }

  if (!tenancy.agreement) throw new AppError("AGREEMENT_NOT_FOUND", "Agreement not found.");
  return tenancy.agreement;
}

export async function updateAgreement(agreementId: string, userId: string, role: "TENANT" | "LANDLORD", data: AgreementUpdateInput) {
  const agreement = await prisma.rentalAgreement.findUnique({
    where: { id: agreementId },
    include: { tenancy: true },
  });

  if (!agreement) throw new AppError("AGREEMENT_NOT_FOUND", "Agreement not found.");
  
  if (role === "TENANT") requireOwnership(agreement.tenancy.tenantId, userId);
  if (role === "LANDLORD") requireOwnership(agreement.tenancy.landlordId, userId);

  if (agreement.status !== "DRAFT" && agreement.status !== "PENDING_SIGNATURE") {
    throw new AppError("INVALID_AGREEMENT_STATE", "Can only update agreement before it is active.");
  }

  // Handle status transition if signing
  let newStatus = agreement.status;
  
  const signedByTenant = data.signedByTenant ?? agreement.signedByTenant;
  const signedByLandlord = data.signedByLandlord ?? agreement.signedByLandlord;

  if (signedByTenant || signedByLandlord) {
    newStatus = "PENDING_SIGNATURE";
  }
  if (signedByTenant && signedByLandlord) {
    newStatus = "ACTIVE";
  }

  // Tenant can only sign for tenant, landlord can only sign for landlord
  if (role === "TENANT" && data.signedByLandlord !== undefined) {
    throw new AppError("FORBIDDEN", "Tenant cannot sign for landlord.");
  }
  if (role === "LANDLORD" && data.signedByTenant !== undefined) {
    throw new AppError("FORBIDDEN", "Landlord cannot sign for tenant.");
  }

  return prisma.rentalAgreement.update({
    where: { id: agreementId },
    data: {
      documentUrl: data.documentUrl !== undefined ? data.documentUrl : undefined,
      signedByTenant: data.signedByTenant !== undefined ? data.signedByTenant : undefined,
      signedByLandlord: data.signedByLandlord !== undefined ? data.signedByLandlord : undefined,
      status: newStatus,
    },
  });
}

export async function terminateAgreement(agreementId: string, landlordId: string) {
  const agreement = await prisma.rentalAgreement.findUnique({
    where: { id: agreementId },
    include: { tenancy: true },
  });

  if (!agreement) throw new AppError("AGREEMENT_NOT_FOUND", "Agreement not found.");
  requireOwnership(agreement.tenancy.landlordId, landlordId);

  if (agreement.status !== "ACTIVE") {
    throw new AppError("INVALID_AGREEMENT_STATE", "Only active agreements can be terminated.");
  }

  return prisma.rentalAgreement.update({
    where: { id: agreementId },
    data: { status: "TERMINATED", endDate: new Date() },
  });
}
