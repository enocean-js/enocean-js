import { describe, it, expect } from "vitest";
import { encodeA5TeachIn, isA5TeachIn, decodeA5TeachIn } from "./teach-in.js";
import { setValue } from "./byte-helpers.js";
describe("teach-in.js", () => {
  it("encodes and decodes a teach-in telegram with EEP and manufacturer", () => {
    const eep = "a5-02-01";
    const manufacturer = 0x001;
    const payload = encodeA5TeachIn({ eep, manufacturer });

    expect(payload).toBeInstanceOf(Uint8Array);
    expect(payload.length).toBe(4);
    expect(isA5TeachIn(payload)).toBe(true);

    const decoded = decodeA5TeachIn(payload);
    expect(decoded.eep).toBe(eep);
    expect(decoded.manufacturer).toBe("PEHA");
    expect(decoded.learnType).toBe("with EEP Info");
    expect(decoded.isTeachIn).toBe(true);
  });

  it("encodes and decodes a teach-in telegram with manufacturer name", () => {
    const eep = "a5-02-01";
    const manufacturer = "PEHA";
    const payload = encodeA5TeachIn({ eep, manufacturer });

    expect(payload).toBeInstanceOf(Uint8Array);
    expect(payload.length).toBe(4);
    expect(isA5TeachIn(payload)).toBe(true);

    const decoded = decodeA5TeachIn(payload);
    expect(decoded.eep).toBe(eep);
    expect(decoded.manufacturer).toBe("PEHA");
    expect(decoded.learnType).toBe("with EEP Info");
    expect(decoded.isTeachIn).toBe(true);
  });

  it("encodes and decodes a teach-in telegram without EEP info", () => {
    // Create a payload with lrnType = 0
    let payload = new Uint8Array(4);
    payload[3] = 0; // All bits zero, lrnType and lrnBit are 0
    // Set lrnBit (bit 28) to 0 explicitly
    // Set lrnType (bit 24) to 0 explicitly
    expect(isA5TeachIn(payload)).toBe(true);

    const decoded = decodeA5TeachIn(payload);
    expect(decoded.eep).toBeNull();
    expect(decoded.manufacturer).toBeNull();
    expect(decoded.learnType).toBe("without EEP info");
    expect(decoded.isTeachIn).toBe(true);
  });

  it("throws for non-teach-in payloads", () => {
    let payload = new Uint8Array(4);
    payload = setValue(payload, 1, 28, 1);
    expect(() => decodeA5TeachIn(payload)).toThrow(
      "Not a valid A5 teach-in payload."
    );
    expect(isA5TeachIn(payload)).toBe(false);
  });

  it("throws for invalid payload length", () => {
    expect(() => isA5TeachIn(new Uint8Array(3))).toThrow();
    expect(() => decodeA5TeachIn(new Uint8Array(3))).toThrow();
  });
});
