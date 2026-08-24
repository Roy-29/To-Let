import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { requireOwnership } from "@/lib/auth";

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  referenceType?: string,
  referenceId?: string
) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      referenceType,
      referenceId,
    },
  });
}

export async function getMyNotifications(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return {
    notifications,
    total,
    unreadCount,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function markNotificationRead(notificationId: string, userId: string) {
  const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notification) throw new AppError("NOT_FOUND", "Notification not found.");

  requireOwnership(notification.userId, userId);

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

export async function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}
