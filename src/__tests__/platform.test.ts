import { describe, it, expect, beforeEach } from "vitest";
import { createTestUser } from "./helpers";
import * as platformAnalyticsService from "@/services/platformAnalyticsService";
import { AppError } from "@/lib/errors";
import type { User } from "@/generated/prisma/client";

describe("Platform Analytics & Search", () => {
  let admin: User;
  let tenant: User;

  beforeEach(async () => {
    admin = await createTestUser({ email: "admin5@test.com", role: "ADMIN" });
    tenant = await createTestUser({ email: "platform_tenant@test.com", role: "TENANT" });
  });

  it("admin can fetch platform analytics", async () => {
    const stats = await platformAnalyticsService.getPlatformAnalytics(admin.id, {});
    expect(stats.newUsers).toBeGreaterThanOrEqual(2);
    expect(stats.successfulPayments).toBeDefined();
  });

  it("admin can fetch date-filtered analytics", async () => {
    const now = new Date();
    const stats = await platformAnalyticsService.getPlatformAnalytics(admin.id, {
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });
    expect(stats.newUsers).toBeGreaterThanOrEqual(0);
  });

  it("admin can search users", async () => {
    const res = await platformAnalyticsService.searchPlatform(admin.id, "platform_tenant", "users");
    expect(res.total).toBeGreaterThanOrEqual(1);
    const userResult = res.results[0] as User;
    expect(userResult.email).toBe("platform_tenant@test.com");
  });

  it("non-admin blocked from analytics and search", async () => {
    await expect(platformAnalyticsService.getPlatformAnalytics(tenant.id, {}))
      .rejects.toThrowError(AppError);

    await expect(platformAnalyticsService.searchPlatform(tenant.id, "platform", "users"))
      .rejects.toThrowError(AppError);
  });
});
