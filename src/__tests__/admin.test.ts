import { describe, it, expect, beforeEach } from "vitest";
import { createTestUser } from "./helpers";
import * as adminUserService from "@/services/adminUserService";
import { AppError } from "@/lib/errors";
import type { User } from "@/generated/prisma/client";

describe("Admin User Management", () => {
  let admin: User;
  let tenant: User;

  beforeEach(async () => {
    admin = await createTestUser({ email: "admin1@test.com", role: "ADMIN" });
    tenant = await createTestUser({ email: "tenant_admin@test.com", role: "TENANT" });
  });

  it("admin can fetch users", async () => {
    const res = await adminUserService.getUsers(admin.id, {});
    expect(res.users.length).toBeGreaterThan(0);
  });

  it("non-admin cannot fetch users", async () => {
    await expect(adminUserService.getUsers(tenant.id, {}))
      .rejects.toThrowError(AppError);
  });

  it("admin can suspend and reactivate a user", async () => {
    const suspended = await adminUserService.suspendUser(admin.id, tenant.id);
    expect(suspended.status).toBe("SUSPENDED");

    // Cannot suspend already suspended
    await expect(adminUserService.suspendUser(admin.id, tenant.id))
      .rejects.toThrowError(AppError);

    const reactivated = await adminUserService.reactivateUser(admin.id, tenant.id);
    expect(reactivated.status).toBe("ACTIVE");

    // Cannot reactivate already active
    await expect(adminUserService.reactivateUser(admin.id, tenant.id))
      .rejects.toThrowError(AppError);
  });

  it("admin cannot suspend self", async () => {
    await expect(adminUserService.suspendUser(admin.id, admin.id))
      .rejects.toThrowError(AppError);
  });

  it("admin can soft delete a user", async () => {
    const deleted = await adminUserService.deleteUser(admin.id, tenant.id);
    expect(deleted.status).toBe("DELETED");
  });
});
