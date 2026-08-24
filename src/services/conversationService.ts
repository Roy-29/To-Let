import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";

export async function getOrCreateConversation(tenantId: string, propertyId: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true, ownerId: true },
  });

  if (!property) throw new AppError("NOT_FOUND", "Property not found.");
  if (property.ownerId === tenantId) throw new AppError("FORBIDDEN", "You cannot converse with yourself.");

  let conversation = await prisma.conversation.findUnique({
    where: {
      propertyId_tenantId_landlordId: {
        propertyId: property.id,
        tenantId,
        landlordId: property.ownerId,
      },
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        propertyId: property.id,
        tenantId,
        landlordId: property.ownerId,
      },
    });
  }

  return conversation;
}

export async function getMyConversations(userId: string, role: "TENANT" | "LANDLORD", page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const where = role === "TENANT" ? { tenantId: userId } : { landlordId: userId };

  const [conversations, total] = await Promise.all([
    prisma.conversation.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
      include: {
        property: { select: { id: true, title: true, city: true } },
        tenant: { select: { id: true, name: true } },
        landlord: { select: { id: true, name: true } },
      },
    }),
    prisma.conversation.count({ where }),
  ]);

  return { conversations, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getConversationById(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      property: { select: { id: true, title: true, city: true } },
      tenant: { select: { id: true, name: true } },
      landlord: { select: { id: true, name: true } },
    },
  });

  if (!conversation) throw new AppError("NOT_FOUND", "Conversation not found.");

  if (conversation.tenantId !== userId && conversation.landlordId !== userId) {
    throw new AppError("FORBIDDEN", "You do not have access to this conversation.");
  }

  return conversation;
}
