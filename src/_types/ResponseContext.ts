import type { PrismaClient } from "@prisma/client";

export interface ResponseContext {
  prisma: PrismaClient;
}
