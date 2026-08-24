import { describe, it, expect, beforeEach } from "vitest";
import { createTestUser } from "./helpers";
import * as notificationService from "@/services/notificationService";
import { AppError } from "@/lib/errors";
import type { User } from "@/generated/prisma/client";

describe("Notification Service", () => {
  let user1: User;
  let user2: User;

  beforeEach(async () => {
    user1 = await createTestUser({ email: "notif1@test.com", role: "TENANT" });
    user2 = await createTestUser({ email: "notif2@test.com", role: "TENANT" });
  });

  it("creates and retrieves notifications", async () => {
    await notificationService.createNotification(
      user1.id,
      "TEST_TYPE",
      "Test Title",
      "Test Message"
    );

    const { notifications, unreadCount, total } = await notificationService.getMyNotifications(user1.id);
    expect(total).toBe(1);
    expect(unreadCount).toBe(1);
    expect(notifications[0].isRead).toBe(false);

    // Get unread count
    const count = await notificationService.getUnreadNotificationCount(user1.id);
    expect(count).toBe(1);
  });

  it("marks notification as read", async () => {
    const notif = await notificationService.createNotification(
      user1.id,
      "TEST_TYPE",
      "Test Title",
      "Test Message"
    );

    await notificationService.markNotificationRead(notif.id, user1.id);

    const count = await notificationService.getUnreadNotificationCount(user1.id);
    expect(count).toBe(0);
  });

  it("prevents unauthorized access to read", async () => {
    const notif = await notificationService.createNotification(
      user1.id,
      "TEST_TYPE",
      "Test Title",
      "Test Message"
    );

    await expect(notificationService.markNotificationRead(notif.id, user2.id))
      .rejects.toThrowError(AppError);
  });

  it("marks all notifications as read", async () => {
    await notificationService.createNotification(user1.id, "TEST", "T1", "M1");
    await notificationService.createNotification(user1.id, "TEST", "T2", "M2");

    let count = await notificationService.getUnreadNotificationCount(user1.id);
    expect(count).toBe(2);

    await notificationService.markAllNotificationsRead(user1.id);

    count = await notificationService.getUnreadNotificationCount(user1.id);
    expect(count).toBe(0);
  });
});
