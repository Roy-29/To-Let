import { describe, it, expect, beforeEach } from "vitest";
import { createTestUser } from "./helpers";
import * as reportService from "@/services/reportService";
import { AppError } from "@/lib/errors";
import type { User } from "@/generated/prisma/client";

describe("Report Moderation", () => {
  let admin: User;
  let user: User;

  beforeEach(async () => {
    admin = await createTestUser({ email: "admin4@test.com", role: "ADMIN" });
    user = await createTestUser({ email: "reporter@test.com", role: "TENANT" });
  });

  it("user creates report, admin resolves", async () => {
    const report = await reportService.createReport(user.id, {
      targetType: "PROPERTY",
      targetId: "prop123",
      reason: "FAKE_LISTING",
      description: "This listing is a scam",
    });

    expect(report.status).toBe("OPEN");

    const reports = await reportService.getReports(admin.id, {});
    expect(reports.total).toBeGreaterThanOrEqual(1);

    const review = await reportService.startReportReview(admin.id, report.id);
    expect(review.status).toBe("UNDER_REVIEW");

    const resolved = await reportService.resolveReport(admin.id, report.id, "Removed listing");
    expect(resolved.status).toBe("RESOLVED");
    expect(resolved.resolutionNote).toBe("Removed listing");
  });

  it("admin dismisses report", async () => {
    const report = await reportService.createReport(user.id, {
      targetType: "USER",
      targetId: "user123",
      reason: "SUSPICIOUS_USER",
    });

    await reportService.startReportReview(admin.id, report.id);

    const dismissed = await reportService.dismissReport(admin.id, report.id, "No evidence");
    expect(dismissed.status).toBe("DISMISSED");
    expect(dismissed.resolutionNote).toBe("No evidence");
  });

  it("invalid transitions", async () => {
    const report = await reportService.createReport(user.id, {
      targetType: "PROPERTY",
      targetId: "prop123",
      reason: "FAKE_LISTING",
    });

    await reportService.startReportReview(admin.id, report.id);
    await reportService.resolveReport(admin.id, report.id);

    // Cannot review resolved report
    await expect(reportService.startReportReview(admin.id, report.id))
      .rejects.toThrowError(AppError);
  });
});
