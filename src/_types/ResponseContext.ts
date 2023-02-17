import type { PrismaClient } from "@prisma/client";
import { IUser } from "./User";

export interface ResponseContext extends Record<string, unknown> {
  prisma: PrismaClient;
  user: IUser;
}
