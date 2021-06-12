/**
 * Test suite for the Settings Controller
 */

import * as SettingsController from "../../src/controllers/SettingsController";
import { setup, shutdown } from "../app";

beforeAll(async () => {
  await setup();
});

afterAll(async () => {
  await shutdown();
});

describe("SettingsContrller", () => {
  describe("Singleton", () => {
    it("should exist", async () => {
      const instance = await SettingsController.getInstance();
      expect(instance).not.toBeNull();
    });
  });
});
