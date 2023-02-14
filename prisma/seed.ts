import { PrismaClient, Settings } from "@prisma/client";
import { parameters } from "../src/settings.json";

const prisma = new PrismaClient();

type SettingsCreateInput = Omit<Settings, "id">;
type SettingsConfig = typeof parameters;
type SettingsKey = keyof SettingsConfig;

/**
 * Create the initial settings
 */
async function createSettings() {
  const settingsKeys = Object.keys(parameters) as SettingsKey[];
  const settingsInput = settingsKeys.reduce(
    (setting, key) => ({
      ...setting,
      [key]: parameters[key]["value"],
    }),
    {} as SettingsCreateInput
  );

  const settings = await prisma.settings.findFirst();
  if (settings == null) {
    await prisma.settings.create({
      data: settingsInput,
    });
  }
}

/**
 * Seed the database with initial entities
 */
async function main() {
  // Create settings
  await createSettings();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
