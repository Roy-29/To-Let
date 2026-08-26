import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { createSession, destroySession, getCurrentUser } from "@/lib/session";
import { signupSchema, loginSchema, type SignupInput, type LoginInput } from "@/lib/validations";

const SALT_ROUNDS = 12;

function generateUniqueCode() {
  return "TK-" + crypto.randomBytes(3).toString("hex").toUpperCase();
}

export async function signup(input: SignupInput) {
  const parsed = signupSchema.parse(input);

  const existing = await prisma.user.findUnique({
    where: { email: parsed.email.toLowerCase() },
  });

  if (existing) {
    throw new AppError("ALREADY_EXISTS", "An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(parsed.password, SALT_ROUNDS);

  let uniqueCode = generateUniqueCode();
  let codeExists = true;
  while (codeExists) {
    const existingCode = await prisma.user.findUnique({ where: { uniqueCode } });
    if (existingCode) {
      uniqueCode = generateUniqueCode();
    } else {
      codeExists = false;
    }
  }

  const user = await prisma.$transaction(async (tx: any) => {
    const newUser = await tx.user.create({
      data: {
        name: parsed.name,
        email: parsed.email.toLowerCase(),
        passwordHash,
        role: parsed.role,
        uniqueCode,
      },
    });

    if (parsed.role === "TENANT") {
      await tx.tenantProfile.create({ data: { userId: newUser.id } });
    } else if (parsed.role === "LANDLORD") {
      await tx.landlordProfile.create({ data: { userId: newUser.id } });
    }

    return newUser;
  });

  await createSession(user.id);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    uniqueCode: user.uniqueCode,
  };
}

export async function login(input: LoginInput) {
  const parsed = loginSchema.parse(input);

  const user = await prisma.user.findUnique({
    where: { email: parsed.email.toLowerCase() },
  });

  // Use generic message to prevent account enumeration
  if (!user) {
    throw new AppError("UNAUTHORIZED", "Invalid email or password.");
  }

  if (user.status === "SUSPENDED") {
    throw new AppError("ACCOUNT_SUSPENDED", "Your account has been suspended.");
  }

  if (user.status === "DELETED") {
    throw new AppError("UNAUTHORIZED", "Invalid email or password.");
  }

  const valid = await bcrypt.compare(parsed.password, user.passwordHash);
  if (!valid) {
    throw new AppError("UNAUTHORIZED", "Invalid email or password.");
  }
  
  // Check if the user is logging in with the correct role
  if (parsed.role && user.role !== parsed.role) {
    throw new AppError("UNAUTHORIZED", `Account not found for role: ${parsed.role.toLowerCase()}`);
  }

  await createSession(user.id);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    uniqueCode: user.uniqueCode,
  };
}

export async function logout() {
  await destroySession();
}

export async function me() {
  const user = await getCurrentUser();
  return user;
}
