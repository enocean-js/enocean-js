/**
 * Copyright (c) 2025 Holger Will
 * Licensed under the MIT License
 * https://opensource.org/licenses/MIT
 * This file is part of the enocean-js project.
 */

import { describe, it, expect } from "vitest";
import {
  encodeA5TeachIn,
  isA5TeachIn,
  decodeA5TeachIn,
  decodeUTETeachIn,
  encodeUTETeachInResponse,
} from "./teach-in.js";
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
    expect(decoded.withEEPInfo).toBe(true);
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
    expect(decoded.withEEPInfo).toBe(true);
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
    expect(decoded.withEEPInfo).toBe(false);
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

describe("decodeUTETeachIn", () => {
  it("creates a UTE teach-in telegram", () => {
    //1000110
    let payload = new Uint8Array([
      0b10000000, 0b00000001, 0b00001000, 0b00000110, 0x05, 0x02, 0xd2,
    ]);
    const decoded = decodeUTETeachIn(payload);
    expect(decoded.bidi).to.be.true;
    expect(decoded.responseExpected).to.be.true;
    expect(decoded.manufacturer).toBe(0x46);
    expect(decoded.command).toBe("Query");
    expect(decoded.numChannels).toBe(1);
    expect(decoded.request).toBe("teachIn");
    expect(decoded.rorg).toBe(0xd2);
    expect(decoded.func).toBe(0x02);
    expect(decoded.type).toBe(0x05);
    const payload2 = encodeUTETeachInResponse(payload);
    expect(payload2[0]).toBe(0b10010001);
    expect(payload2[1]).toBe(1);
    expect(payload2[2]).toBe(payload[2]);
    expect(payload2[3]).toBe(payload[3]);
    expect(payload2[4]).toBe(payload[4]);
    expect(payload2[5]).toBe(payload[5]);
    expect(payload2[6]).toBe(payload[6]);
  });
});
