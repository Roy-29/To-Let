import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { loadEnvConfig } from "@next/env";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

neonConfig.webSocketConstructor = ws;

const globalForPrismaNeon = globalThis as unknown as { prismaNeon: InstanceType<typeof PrismaClient> };

function createPrismaClient() {
  let connectionString = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED;
  
  if (!connectionString || connectionString === "undefined" || connectionString === "null") {
    connectionString = "postgresql://neondb_owner:npg_ay0PKplmw6qL@ep-patient-cake-axzwphhh-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require";
  }

  // @prisma/adapter-neon in this version takes a config object, not a Pool instance
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrismaNeon.prismaNeon || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrismaNeon.prismaNeon = prisma;
}
