/**
 * Test suite for the Settings Controller
 */

import { assert } from "chai";
import * as SettingsController from "../../src/controllers/SettingsController";

describe("SettingsContrller", () => {
  describe("Singleton", () => {
    it("should exist", async () => {
      const instance = await SettingsController.getInstance();
      assert.isOk(instance);
    });
  });
});
