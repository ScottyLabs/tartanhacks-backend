import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "dev" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "prod") {
  global.prisma = prisma;
}
