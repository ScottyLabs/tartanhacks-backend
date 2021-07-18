/**
 * Test suite for the Settings Controller
 */

import * as SettingsController from "src/controllers/SettingsController";
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
      const instance = await SettingsController.getSettings();
      expect(instance).not.toBeNull();
    });
  });
});
