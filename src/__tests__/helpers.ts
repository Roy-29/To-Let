import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function createTestUser(
  overrides: {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    status?: string;
  } = {}
) {
  const {
    name = "Test User",
    email = `test-${Date.now()}@example.com`,
    password = "Test1234",
    role = "TENANT",
    status = "ACTIVE",
  } = overrides;

  const passwordHash = await bcrypt.hash(password, 4); // low rounds for speed

  const user = await prisma.user.create({
    data: { name, email: email.toLowerCase(), passwordHash, role, status },
  });

  if (role === "TENANT") {
    await prisma.tenantProfile.create({ data: { userId: user.id } });
  } else if (role === "LANDLORD") {
    await prisma.landlordProfile.create({ data: { userId: user.id } });
  }

  return { ...user, password };
}
