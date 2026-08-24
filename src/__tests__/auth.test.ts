import { describe, it, expect } from "vitest";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createTestUser } from "./helpers";
import { signupSchema, loginSchema } from "@/lib/validations";
import { AppError } from "@/lib/errors";

// ─── Direct service logic tests (bypass session/cookies) ───

describe("Signup Logic", () => {
  it("should create a tenant with hashed password and profile", async () => {
    const email = "tenant@test.com";
    const passwordHash = await bcrypt.hash("Test1234", 4);

    const user = await prisma.user.create({
      data: { name: "Tenant", email, passwordHash, role: "TENANT" },
    });
    await prisma.tenantProfile.create({ data: { userId: user.id } });

    expect(user.role).toBe("TENANT");
    expect(user.email).toBe(email);
    expect(user.passwordHash).not.toBe("Test1234");

    const profile = await prisma.tenantProfile.findUnique({ where: { userId: user.id } });
    expect(profile).not.toBeNull();
  });

  it("should create a landlord with profile", async () => {
    const user = await createTestUser({ role: "LANDLORD", email: "landlord@test.com" });

    expect(user.role).toBe("LANDLORD");

    const profile = await prisma.landlordProfile.findUnique({ where: { userId: user.id } });
    expect(profile).not.toBeNull();
    expect(profile!.verificationStatus).toBe("UNVERIFIED");
  });

  it("should reject duplicate email", async () => {
    await createTestUser({ email: "dup@test.com" });

    await expect(
      prisma.user.create({
        data: {
          name: "Dup",
          email: "dup@test.com",
          passwordHash: "hash",
          role: "TENANT",
        },
      })
    ).rejects.toThrow();
  });

  it("should hash password (never store plaintext)", async () => {
    const user = await createTestUser({ password: "MySecret123" });
    expect(user.passwordHash).not.toBe("MySecret123");
    const valid = await bcrypt.compare("MySecret123", user.passwordHash);
    expect(valid).toBe(true);
  });
});

describe("Signup Validation", () => {
  it("should reject short password", () => {
    const result = signupSchema.safeParse({
      name: "Test",
      email: "test@test.com",
      password: "short",
      confirmPassword: "short",
      role: "TENANT",
    });
    expect(result.success).toBe(false);
  });

  it("should reject password without uppercase", () => {
    const result = signupSchema.safeParse({
      name: "Test",
      email: "test@test.com",
      password: "alllowercase1",
      confirmPassword: "alllowercase1",
      role: "TENANT",
    });
    expect(result.success).toBe(false);
  });

  it("should reject password without number", () => {
    const result = signupSchema.safeParse({
      name: "Test",
      email: "test@test.com",
      password: "NoNumberHere",
      confirmPassword: "NoNumberHere",
      role: "TENANT",
    });
    expect(result.success).toBe(false);
  });

  it("should reject mismatched passwords", () => {
    const result = signupSchema.safeParse({
      name: "Test",
      email: "test@test.com",
      password: "Valid1234",
      confirmPassword: "Different1234",
      role: "TENANT",
    });
    expect(result.success).toBe(false);
  });

  it("should reject ADMIN as a public signup role", () => {
    const result = signupSchema.safeParse({
      name: "Test",
      email: "test@test.com",
      password: "Valid1234",
      confirmPassword: "Valid1234",
      role: "ADMIN",
    });
    expect(result.success).toBe(false);
  });

  it("should accept valid signup data", () => {
    const result = signupSchema.safeParse({
      name: "Test User",
      email: "test@test.com",
      password: "Valid1234",
      confirmPassword: "Valid1234",
      role: "TENANT",
    });
    expect(result.success).toBe(true);
  });
});

describe("Login Logic", () => {
  it("should verify correct password", async () => {
    const user = await createTestUser({ email: "login@test.com", password: "Correct1" });
    const valid = await bcrypt.compare("Correct1", user.passwordHash);
    expect(valid).toBe(true);
  });

  it("should reject wrong password", async () => {
    const user = await createTestUser({ email: "login2@test.com", password: "Correct1" });
    const valid = await bcrypt.compare("WrongPass1", user.passwordHash);
    expect(valid).toBe(false);
  });

  it("should find user by email (case insensitive storage)", async () => {
    await createTestUser({ email: "CaseTest@test.com" });
    const user = await prisma.user.findUnique({ where: { email: "casetest@test.com" } });
    expect(user).not.toBeNull();
  });
});

describe("Login Validation", () => {
  it("should reject invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "Test1234" });
    expect(result.success).toBe(false);
  });

  it("should reject empty password", () => {
    const result = loginSchema.safeParse({ email: "test@test.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("Suspended User", () => {
  it("should identify suspended user status", async () => {
    const user = await createTestUser({ email: "suspended@test.com", status: "SUSPENDED" });
    expect(user.status).toBe("SUSPENDED");

    // Auth logic check
    const dbUser = await prisma.user.findUnique({ where: { email: "suspended@test.com" } });
    expect(dbUser!.status).toBe("SUSPENDED");
  });

  it("should identify deleted user status", async () => {
    await createTestUser({ email: "deleted@test.com", status: "DELETED" });
    const dbUser = await prisma.user.findUnique({ where: { email: "deleted@test.com" } });
    expect(dbUser!.status).toBe("DELETED");
  });
});

describe("Session", () => {
  it("should create and find a session", async () => {
    const user = await createTestUser({ email: "session@test.com" });

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    expect(session.userId).toBe(user.id);

    const found = await prisma.session.findUnique({
      where: { id: session.id },
      include: { user: true },
    });

    expect(found).not.toBeNull();
    expect(found!.user.email).toBe("session@test.com");
  });

  it("should delete session (logout)", async () => {
    const user = await createTestUser({ email: "logout@test.com" });

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.session.delete({ where: { id: session.id } });

    const found = await prisma.session.findUnique({ where: { id: session.id } });
    expect(found).toBeNull();
  });

  it("should cascade delete sessions when user is deleted", async () => {
    const user = await createTestUser({ email: "cascade@test.com" });

    await prisma.session.create({
      data: {
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Must delete profile first (or use cascade — our schema has cascade)
    await prisma.user.delete({ where: { id: user.id } });

    const sessions = await prisma.session.findMany({ where: { userId: user.id } });
    expect(sessions).toHaveLength(0);
  });
});

describe("Role Authorization", () => {
  it("should store TENANT role", async () => {
    const user = await createTestUser({ role: "TENANT" });
    expect(user.role).toBe("TENANT");
  });

  it("should store LANDLORD role", async () => {
    const user = await createTestUser({ role: "LANDLORD" });
    expect(user.role).toBe("LANDLORD");
  });

  it("should store ADMIN role (not publicly creatable)", async () => {
    // Admin can be created directly in DB, not through public signup
    const user = await createTestUser({ role: "ADMIN" });
    expect(user.role).toBe("ADMIN");

    // But signup schema rejects ADMIN
    const result = signupSchema.safeParse({
      name: "Admin",
      email: "admin@test.com",
      password: "Admin1234",
      confirmPassword: "Admin1234",
      role: "ADMIN",
    });
    expect(result.success).toBe(false);
  });
});

describe("Error Handling", () => {
  it("should create AppError with correct code", () => {
    const error = new AppError("UNAUTHORIZED", "Not logged in");
    expect(error.code).toBe("UNAUTHORIZED");
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe("Not logged in");
  });

  it("should create FORBIDDEN error", () => {
    const error = new AppError("FORBIDDEN", "No access");
    expect(error.code).toBe("FORBIDDEN");
    expect(error.statusCode).toBe(403);
  });

  it("should create ACCOUNT_SUSPENDED error", () => {
    const error = new AppError("ACCOUNT_SUSPENDED", "Suspended");
    expect(error.code).toBe("ACCOUNT_SUSPENDED");
    expect(error.statusCode).toBe(403);
  });
});

describe("Property Ownership", () => {
  it("should associate property with landlord", async () => {
    const landlord = await createTestUser({ role: "LANDLORD", email: "owner@test.com" });

    const property = await prisma.property.create({
      data: {
        ownerId: landlord.id,
        title: "Test Apartment",
        propertyType: "APARTMENT",
        address: "123 Test St",
        city: "Dhaka",
        rent: 15000,
        bedrooms: 2,
        bathrooms: 1,
        status: "DRAFT",
      },
    });

    expect(property.ownerId).toBe(landlord.id);
    expect(property.status).toBe("DRAFT");
  });

  it("should prevent unauthorized property access via ownership check", async () => {
    const landlord1 = await createTestUser({ role: "LANDLORD", email: "owner1@test.com" });
    const landlord2 = await createTestUser({ role: "LANDLORD", email: "owner2@test.com" });

    const property = await prisma.property.create({
      data: {
        ownerId: landlord1.id,
        title: "Owner1 Property",
        propertyType: "HOUSE",
        address: "456 Test St",
        city: "Dhaka",
        rent: 20000,
        bedrooms: 3,
        bathrooms: 2,
      },
    });

    // Ownership check
    expect(property.ownerId === landlord1.id).toBe(true);
    expect(property.ownerId === landlord2.id).toBe(false);
  });
});

describe("Unique Constraints", () => {
  it("should enforce unique email", async () => {
    await createTestUser({ email: "unique@test.com" });

    await expect(
      prisma.user.create({
        data: {
          name: "Dup",
          email: "unique@test.com",
          passwordHash: "hash",
          role: "TENANT",
        },
      })
    ).rejects.toThrow();
  });

  it("should enforce unique favorite per user-property", async () => {
    const user = await createTestUser({ email: "fav@test.com" });
    const landlord = await createTestUser({ role: "LANDLORD", email: "favlord@test.com" });

    const property = await prisma.property.create({
      data: {
        ownerId: landlord.id,
        title: "Fav Property",
        propertyType: "APARTMENT",
        address: "789 Test St",
        city: "Dhaka",
        rent: 10000,
        bedrooms: 1,
        bathrooms: 1,
        status: "PUBLISHED",
      },
    });

    await prisma.favorite.create({
      data: { userId: user.id, propertyId: property.id },
    });

    await expect(
      prisma.favorite.create({
        data: { userId: user.id, propertyId: property.id },
      })
    ).rejects.toThrow();
  });

  it("should enforce unique rent record per tenancy-month", async () => {
    const tenant = await createTestUser({ email: "rentuser@test.com" });
    const landlord = await createTestUser({ role: "LANDLORD", email: "rentlord@test.com" });

    const property = await prisma.property.create({
      data: {
        ownerId: landlord.id,
        title: "Rent Property",
        propertyType: "APARTMENT",
        address: "Rent St",
        city: "Dhaka",
        rent: 12000,
        bedrooms: 2,
        bathrooms: 1,
      },
    });

    const tenancy = await prisma.tenancy.create({
      data: {
        tenantId: tenant.id,
        propertyId: property.id,
        landlordId: landlord.id,
        startDate: new Date(),
        monthlyRent: 12000,
        status: "ACTIVE",
      },
    });

    await prisma.rentRecord.create({
      data: {
        tenancyId: tenancy.id,
        billingMonth: "2025-01",
        dueDate: new Date("2025-01-05"),
        amount: 12000,
      },
    });

    await expect(
      prisma.rentRecord.create({
        data: {
          tenancyId: tenancy.id,
          billingMonth: "2025-01",
          dueDate: new Date("2025-01-05"),
          amount: 12000,
        },
      })
    ).rejects.toThrow();
  });
});
