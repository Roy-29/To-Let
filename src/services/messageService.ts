import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import type { MessageCreateInput } from "@/lib/validations";

export async function sendMessage(senderId: string, data: MessageCreateInput) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: data.conversationId },
    select: { id: true, tenantId: true, landlordId: true, property: { select: { title: true } } },
  });

  if (!conversation) throw new AppError("NOT_FOUND", "Conversation not found.");

  if (conversation.tenantId !== senderId && conversation.landlordId !== senderId) {
    throw new AppError("FORBIDDEN", "You are not a participant in this conversation.");
  }

  const receiverId = conversation.tenantId === senderId ? conversation.landlordId : conversation.tenantId;

  return prisma.$transaction(async (tx) => {
    const message = await tx.message.create({
      data: {
        conversationId: conversation.id,
        senderId,
        message: data.message,
      },
    });

    await tx.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    await tx.notification.create({
      data: {
        userId: receiverId,
        type: "NEW_MESSAGE",
        title: "New Message Received",
        message: `You have received a new message regarding ${conversation.property.title}.`,
        referenceType: "MESSAGE",
        referenceId: message.id,
      },
    });

    return message;
  });
}

export async function getConversationMessages(conversationId: string, userId: string, page = 1, limit = 50) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) throw new AppError("NOT_FOUND", "Conversation not found.");

  if (conversation.tenantId !== userId && conversation.landlordId !== userId) {
    throw new AppError("FORBIDDEN", "You do not have access to this conversation.");
  }

  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        sender: { select: { id: true, name: true } },
      },
    }),
    prisma.message.count({ where: { conversationId } }),
  ]);

  return { messages, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function markMessageRead(messageId: string, userId: string) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: { conversation: true },
  });

  if (!message) throw new AppError("NOT_FOUND", "Message not found.");

  // The receiver of the message is the other participant in the conversation
  const receiverId = message.conversation.tenantId === message.senderId 
    ? message.conversation.landlordId 
    : message.conversation.tenantId;

  if (receiverId !== userId) {
    throw new AppError("FORBIDDEN", "You can only mark your received messages as read.");
  }

  return prisma.message.update({
    where: { id: messageId },
    data: { isRead: true },
  });
}
