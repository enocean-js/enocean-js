import { a50201 } from "./a5-02-01.js";
import { describe, it, expect } from "vitest";

describe("EEP a5-02-01", () => {
  it("should decode a telegram with temperature around -20°C", () => {
    // scale(-20, [-40, 0], [255, 0]) = 127.5, rounded to 128
    // scale(128, [255, 0], [-40, 0]) = -20.078... -> -20.1
    const payload = new Uint8Array([0, 0, 128, 8]);
    const decoded = a50201.decode(payload);
    expect(decoded).to.deep.equal({
      learnBit: false,
      temperature: -20.1,
    });
  });

  it("should encode a telegram with temperature -20°C", () => {
    const encoded = a50201.encode({ temperature: -20 });
    const payload = new Uint8Array([0, 0, 128, 8]);
    expect(encoded).to.deep.equal(payload);
  });

  it("should encode a telegram with temperature -40°C", () => {
    const encoded = a50201.encode({ temperature: -40 });
    const payload = new Uint8Array([0, 0, 255, 8]);
    expect(encoded).to.deep.equal(payload);
  });

  it("should decode a telegram with temperature -40°C", () => {
    const payload = new Uint8Array([0, 0, 255, 8]);
    const decoded = a50201.decode(payload);
    expect(decoded).to.deep.equal({
      learnBit: false,
      temperature: -40,
    });
  });

  it("should encode a telegram with temperature 0°C", () => {
    const encoded = a50201.encode({ temperature: 0 });
    const payload = new Uint8Array([0, 0, 0, 8]);
    expect(encoded).to.deep.equal(payload);
  });

  it("should decode a telegram with temperature 0°C", () => {
    const payload = new Uint8Array([0, 0, 0, 8]);
    const decoded = a50201.decode(payload);
    expect(decoded).to.deep.equal({
      learnBit: false,
      temperature: 0,
    });
  });
});
