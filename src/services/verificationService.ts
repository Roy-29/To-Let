import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { verifyAdmin, verifyLandlord } from "@/lib/auth";
import { logAudit } from "./auditService";
import { createNotification } from "./notificationService";

export async function submitVerification(landlordId: string) {
  await verifyLandlord(landlordId); // Ensures the caller is a landlord

  const profile = await prisma.landlordProfile.findUnique({ where: { userId: landlordId } });
  if (!profile) throw new AppError("USER_NOT_FOUND", "Landlord profile not found");

  if (profile.verificationStatus === "VERIFIED" || profile.verificationStatus === "PENDING") {
    throw new AppError("INVALID_MODERATION_TRANSITION", "Verification already pending or verified");
  }

  const updated = await prisma.landlordProfile.update({
    where: { userId: landlordId },
    data: { verificationStatus: "PENDING", rejectionReason: null },
  });

  // Notify admin queue (abstract concept, can notify admin users here)
  const admins = await prisma.user.findMany({ where: { role: "ADMIN", status: "ACTIVE" } });
  for (const admin of admins) {
    await createNotification(
      admin.id,
      "VERIFICATION_SUBMITTED",
      "New Landlord Verification",
      `Landlord ${landlordId} submitted verification.`,
      "USER",
      landlordId
    );
  }

  return updated;
}

export async function getPendingVerifications(adminId: string, page = 1, limit = 20) {
  await verifyAdmin(adminId);
  const skip = (page - 1) * limit;

  const [profiles, total] = await Promise.all([
    prisma.landlordProfile.findMany({
      where: { verificationStatus: "PENDING" },
      include: { user: { select: { name: true, email: true } } },
      skip,
      take: limit,
      orderBy: { updatedAt: "asc" },
    }),
    prisma.landlordProfile.count({ where: { verificationStatus: "PENDING" } }),
  ]);

  return { profiles, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function approveLandlord(adminId: string, landlordId: string) {
  await verifyAdmin(adminId);

  const profile = await prisma.landlordProfile.findUnique({ where: { userId: landlordId } });
  if (!profile || profile.verificationStatus !== "PENDING") {
    throw new AppError("INVALID_MODERATION_TRANSITION", "Landlord not pending verification");
  }

  const updated = await prisma.landlordProfile.update({
    where: { userId: landlordId },
    data: { verificationStatus: "VERIFIED" },
  });

  await logAudit(adminId, "LANDLORD_VERIFICATION_APPROVED", "USER", landlordId);

  await createNotification(
    landlordId,
    "VERIFICATION_APPROVED",
    "Verification Approved",
    "Your landlord profile has been verified.",
    "USER",
    landlordId
  );

  return updated;
}

export async function rejectLandlord(adminId: string, landlordId: string, reason: string) {
  await verifyAdmin(adminId);

  const profile = await prisma.landlordProfile.findUnique({ where: { userId: landlordId } });
  if (!profile || profile.verificationStatus !== "PENDING") {
    throw new AppError("INVALID_MODERATION_TRANSITION", "Landlord not pending verification");
  }

  const updated = await prisma.landlordProfile.update({
    where: { userId: landlordId },
    data: { verificationStatus: "REJECTED", rejectionReason: reason },
  });

  await logAudit(adminId, "LANDLORD_VERIFICATION_REJECTED", "USER", landlordId, { reason });

  await createNotification(
    landlordId,
    "VERIFICATION_REJECTED",
    "Verification Rejected",
    `Your verification was rejected: ${reason}`,
    "USER",
    landlordId
  );

  return updated;
}
