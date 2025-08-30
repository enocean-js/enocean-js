import { describe, it, expect } from "vitest";
import { a50205 as eep } from "./a5-02-05.js";
import { getValue } from "../utils/byte-helpers.js";

describe("EEP A5-02-05: Temperature Sensor (0°C to +40°C)", () => {
  describe("decode()", () => {
    it("should return null if payload is invalid", () => {
      expect(eep.decode(null)).toBeNull();
      expect(eep.decode(new Uint8Array([0x00, 0x00, 0x00]))).toBeNull();
    });

    it("should decode the minimum temperature (0°C)", () => {
      // Raw value 255 => 0°C
      const payload = new Uint8Array([0x00, 0x00, 0xff, 0x08]);
      const decoded = eep.decode(payload);
      expect(decoded.temperature).toBe(0);
    });

    it("should decode a typical temperature (20°C)", () => {
      // Raw value 128 => 19.9°C (due to scaling/rounding)
      const payload = new Uint8Array([0x00, 0x00, 0x80, 0x08]);
      const decoded = eep.decode(payload);
      expect(decoded.temperature).toBe(19.9);
    });

    it("should decode the maximum temperature (40°C)", () => {
      // Raw value 0 => 40°C
      const payload = new Uint8Array([0x00, 0x00, 0x00, 0x08]);
      const decoded = eep.decode(payload);
      expect(decoded.temperature).toBe(40);
    });

    it("should correctly decode the learn bit", () => {
      // Data telegram: DB0, bit 3 is 1
      let payload = new Uint8Array([0x00, 0x00, 0x80, 0x08]);
      let decoded = eep.decode(payload);
      expect(decoded.learnBit).toBe(false);

      // Learn telegram: DB0, bit 3 is 0
      payload = new Uint8Array([0x00, 0x00, 0x80, 0x00]);
      decoded = eep.decode(payload);
      expect(decoded.learnBit).toBe(true);
    });
  });

  describe("encode()", () => {
    it("should encode the minimum temperature (0°C)", () => {
      const encoded = eep.encode({ temperature: 0 });
      // Raw value should be 255
      expect(getValue(encoded, 16, 8)).toBe(255);
      // Learn bit should be 1 for data telegrams
      expect(getValue(encoded, 28, 1)).toBe(1);
    });

    it("should encode a typical temperature (20°C)", () => {
      const encoded = eep.encode({ temperature: 20 });
      // Raw value should be 128
      expect(getValue(encoded, 16, 8)).toBe(128);
    });

    it("should encode the maximum temperature (40°C)", () => {
      const encoded = eep.encode({ temperature: 40 });
      // Raw value should be 0
      expect(getValue(encoded, 16, 8)).toBe(0);
    });
  });

  describe("profile", () => {
    it("should return the correct profile information", () => {
      const profile = eep.profile();
      expect(profile.type).toBe("sensor");
      expect(profile.readings).toEqual([
        { name: "temperature", type: "number", unit: "°C", min: 0, max: 40 },
      ]);
    });
  });
});
