/**
 * Test suite for the Settings Controller
 */

import * as SettingsController from "../controllers/SettingsController";
import { setup, shutdown } from "../index";

beforeAll(async () => {
  await setup();
});

afterAll(async () => {
  await shutdown();
});

describe("SettingsController", () => {
  describe("Singleton", () => {
    it("should exist", async () => {
      const instance = await SettingsController.getInstance();
      expect(instance).not.toBeNull();
    });
  });
});
