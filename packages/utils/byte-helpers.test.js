/**
 * Copyright (c) 2025 Holger Will
 * Licensed under the MIT License
 * https://opensource.org/licenses/MIT
 * This file is part of the enocean-js project.
 */
import { toString, fromString } from "./byte-helpers.js";
import { describe, it, expect } from "vitest";
import {
  setValue,
  getValue,
  getSpreadedValue,
  setSpreadedValue,
} from "./byte-helpers.js";

describe("toString/fromString roundtrip", () => {
  it("bin roundtrip", () => {
    const arr = new Uint8Array([0x12, 0x34, 0xab, 0xcd]);
    const str = toString(arr, "bin");
    expect(str).toBe("00010010001101001010101111001101");
    const arr2 = fromString(str, "bin");
    expect(Array.from(arr2)).toEqual(Array.from(arr));
  });

  it("dec roundtrip", () => {
    const arr = new Uint8Array([12, 34, 56, 78]);
    const str = toString(arr, "dec");
    expect(str).toBe("012034056078");
    const arr2 = fromString(str, "dec");
    expect(Array.from(arr2)).toEqual(Array.from(arr));
  });

  it("hex roundtrip", () => {
    const arr = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
    const str = toString(arr, "hex");
    expect(str).toBe("deadbeef");
    const arr2 = fromString(str, "hex");
    expect(Array.from(arr2)).toEqual(Array.from(arr));
  });
});

describe("setValue/getValue Monte Carlo roundtrip", () => {
  it("randomly encodes and decodes values at random positions and lengths", () => {
    for (let i = 0; i < 10000; i++) {
      const pos = Math.floor(Math.random() * 32);
      const len = Math.max(1, Math.floor(Math.random() * (32 - pos)));
      const maxVal = 2 ** len - 1;
      const val = Math.floor(Math.random() * (maxVal + 1));
      let payload = new Uint8Array(4);
      payload = setValue(payload, val, pos, len);
      const decoded = getValue(payload, pos, len);
      expect(decoded).toBe(val);
    }
  });
});

describe("getSpreadedValue", () => {
  it("decodes values spread across mutiple bytes", () => {
    const payload = new Uint8Array([0b11100000, 0b00000001, 0b00001010]);
    const val = getSpreadedValue(payload, [
      { bitOffset: 0, bitLength: 3 },
      { bitOffset: 15, bitLength: 1 },
      { bitOffset: 20, bitLength: 4 },
    ]);
    expect(val).toBe(0b000011111010);
    const rev = setSpreadedValue(new Uint8Array(3), val, [
      { bitOffset: 0, bitLength: 3 },
      { bitOffset: 15, bitLength: 1 },
      { bitOffset: 20, bitLength: 4 },
    ]);
    expect(Array.from(rev)).toEqual(Array.from(payload));
  });
});
