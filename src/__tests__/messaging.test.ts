import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { createTestUser } from "./helpers";
import * as conversationService from "@/services/conversationService";
import * as messageService from "@/services/messageService";
import { AppError } from "@/lib/errors";
import type { User, Property } from "@/generated/prisma/client";

describe("Messaging Service", () => {
  let tenant: User;
  let tenant2: User;
  let landlord: User;
  let landlord2: User;
  let property: Property;

  beforeEach(async () => {
    tenant = await createTestUser({ email: "msg_tenant@test.com", role: "TENANT" });
    tenant2 = await createTestUser({ email: "msg_tenant2@test.com", role: "TENANT" });
    landlord = await createTestUser({ email: "msg_landlord@test.com", role: "LANDLORD" });
    landlord2 = await createTestUser({ email: "msg_landlord2@test.com", role: "LANDLORD" });

    property = await prisma.property.create({
      data: {
        ownerId: landlord.id,
        title: "Message Property",
        propertyType: "APARTMENT",
        status: "PUBLISHED",
        address: "123 Test St",
        city: "Dhaka",
        rent: 20000,
        bedrooms: 2,
        bathrooms: 2,
      },
    });
  });

  it("creates conversation and prevents duplicates", async () => {
    const conv1 = await conversationService.getOrCreateConversation(tenant.id, property.id);
    expect(conv1.id).toBeDefined();

    const conv2 = await conversationService.getOrCreateConversation(tenant.id, property.id);
    expect(conv2.id).toBe(conv1.id);

    const convs = await conversationService.getMyConversations(tenant.id, "TENANT");
    expect(convs.total).toBe(1);
  });

  it("unrelated user blocked from conversation", async () => {
    const conv = await conversationService.getOrCreateConversation(tenant.id, property.id);

    await expect(conversationService.getConversationById(conv.id, tenant2.id))
      .rejects.toThrowError(AppError);
    await expect(conversationService.getConversationById(conv.id, landlord2.id))
      .rejects.toThrowError(AppError);
  });

  it("participants can send messages and read state works", async () => {
    const conv = await conversationService.getOrCreateConversation(tenant.id, property.id);

    // Tenant sends message
    const msg1 = await messageService.sendMessage(tenant.id, {
      conversationId: conv.id,
      message: "Hello landlord!",
    });
    expect(msg1.senderId).toBe(tenant.id);

    // Notifications for landlord
    const llNotifications = await prisma.notification.findMany({ where: { userId: landlord.id } });
    expect(llNotifications.length).toBe(1);
    expect(llNotifications[0].type).toBe("NEW_MESSAGE");

    // Landlord marks read
    const readMsg = await messageService.markMessageRead(msg1.id, landlord.id);
    expect(readMsg.isRead).toBe(true);

    // Landlord sends reply
    await messageService.sendMessage(landlord.id, {
      conversationId: conv.id,
      message: "Hello tenant!",
    });

    const messages = await messageService.getConversationMessages(conv.id, tenant.id);
    expect(messages.total).toBe(2);
  });

  it("non-participant blocked from sending message", async () => {
    const conv = await conversationService.getOrCreateConversation(tenant.id, property.id);

    await expect(messageService.sendMessage(tenant2.id, {
      conversationId: conv.id,
      message: "I am an interloper",
    })).rejects.toThrowError(AppError);
  });
});
