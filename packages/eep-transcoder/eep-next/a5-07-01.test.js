import { a50701 } from "./a5-07-01.js";
import { describe, it, expect } from "vitest";
import { setValue } from "../utils/byte-helpers.js";

describe("EEP A5-07-01", () => {
  it("should decode occupancy and voltage", () => {
    const payload = new Uint8Array(4);
    // Occupancy: 200 >= 128 -> true
    setValue(payload, 200, 16, 8);
    // Voltage: SVA bit (31) is 1, raw value 125
    setValue(payload, 1, 31, 1);
    setValue(payload, 125, 0, 8);
    // LRN bit (28) is 1 -> data telegram
    setValue(payload, 1, 28, 1);

    const decoded = a50701.decode(payload);
    expect(decoded).to.deep.equal({
      learnBit: false,
      occupancy: true,
      voltage: 2.5,
    });
  });

  it("should decode no occupancy and no voltage", () => {
    const payload = new Uint8Array(4);
    // Occupancy: 100 < 128 -> false
    setValue(payload, 100, 16, 8);
    // Voltage: SVA bit (31) is 0 (default)
    // LRN bit (28) is 1 -> data telegram
    setValue(payload, 1, 28, 1);

    const decoded = a50701.decode(payload);
    expect(decoded).to.deep.equal({
      learnBit: false,
      occupancy: false,
      voltage: null,
    });
  });

  it("should encode occupancy and voltage", () => {
    const encoded = a50701.encode({ occupancy: true, voltage: 2.5 });

    const expectedPayload = new Uint8Array(4);
    // occupancy true -> 0xff
    setValue(expectedPayload, 0xff, 16, 8);
    // voltage 2.5 -> raw 125, SVA bit (31) set
    setValue(expectedPayload, 1, 31, 1);
    setValue(expectedPayload, 125, 0, 8);
    // LRN bit (28) set
    setValue(expectedPayload, 1, 28, 1);

    expect(encoded).to.deep.equal(expectedPayload);
  });

  it("should encode no occupancy and no voltage", () => {
    const encoded = a50701.encode({ occupancy: false });

    const expectedPayload = new Uint8Array(4);
    // occupancy false -> 0x00
    setValue(expectedPayload, 0, 16, 8);
    // no voltage -> SVA bit (31) is 0 (default)
    // LRN bit (28) set
    setValue(expectedPayload, 1, 28, 1);

    expect(encoded).to.deep.equal(expectedPayload);
  });

  it("should handle learn telegrams", () => {
    // LRN bit (28) is 0
    const payload = new Uint8Array(4);
    const decoded = a50701.decode(payload);
    expect(decoded.learnBit).to.be.true;
  });
});
