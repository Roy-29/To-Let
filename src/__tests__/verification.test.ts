import { describe, it, expect, beforeEach } from "vitest";
import { createTestUser } from "./helpers";
import * as verificationService from "@/services/verificationService";
import { AppError } from "@/lib/errors";
import type { User } from "@/generated/prisma/client";

describe("Landlord Verification", () => {
  let admin: User;
  let landlord: User;

  beforeEach(async () => {
    admin = await createTestUser({ email: "admin2@test.com", role: "ADMIN" });
    landlord = await createTestUser({ email: "unverified@test.com", role: "LANDLORD" });
  });

  it("landlord submits verification and admin approves", async () => {
    const submitted = await verificationService.submitVerification(landlord.id);
    expect(submitted.verificationStatus).toBe("PENDING");

    const pending = await verificationService.getPendingVerifications(admin.id);
    expect(pending.total).toBeGreaterThanOrEqual(1);

    const approved = await verificationService.approveLandlord(admin.id, landlord.id);
    expect(approved.verificationStatus).toBe("VERIFIED");

    // Cannot submit again
    await expect(verificationService.submitVerification(landlord.id))
      .rejects.toThrowError(AppError);
  });

  it("admin rejects verification", async () => {
    await verificationService.submitVerification(landlord.id);
    
    const rejected = await verificationService.rejectLandlord(admin.id, landlord.id, "Invalid ID");
    expect(rejected.verificationStatus).toBe("REJECTED");
    expect(rejected.rejectionReason).toBe("Invalid ID");

    // Landlord can submit again
    const resubmitted = await verificationService.submitVerification(landlord.id);
    expect(resubmitted.verificationStatus).toBe("PENDING");
  });

  it("invalid transitions", async () => {
    // Cannot approve before pending
    await expect(verificationService.approveLandlord(admin.id, landlord.id))
      .rejects.toThrowError(AppError);
  });

  it("non-admin blocked from moderation", async () => {
    await verificationService.submitVerification(landlord.id);
    await expect(verificationService.approveLandlord(landlord.id, landlord.id))
      .rejects.toThrowError(AppError);
  });
});
