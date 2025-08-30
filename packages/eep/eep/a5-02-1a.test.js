import { a5021a } from "./a5-02-1a.js";
import { describe, it, expect } from "vitest";

describe("EEP a5-02-1a", () => {
  it("should decode a telegram with temperature around 80°C", () => {
    const payload = new Uint8Array([0, 0, 128, 8]);
    const decoded = a5021a.decode(payload);
    expect(decoded).to.deep.equal({
      learnBit: false,
      temperature: 79.8,
    });
  });

  it("should encode a telegram with temperature 80°C", () => {
    const encoded = a5021a.encode({ temperature: 80 });
    const payload = new Uint8Array([0, 0, 128, 8]);
    expect(encoded).to.deep.equal(payload);
  });

  it("should encode a telegram with temperature 40°C", () => {
    const encoded = a5021a.encode({ temperature: 40 });
    const payload = new Uint8Array([0, 0, 255, 8]);
    expect(encoded).to.deep.equal(payload);
  });

  it("should decode a telegram with temperature 40°C", () => {
    const payload = new Uint8Array([0, 0, 255, 8]);
    const decoded = a5021a.decode(payload);
    expect(decoded).to.deep.equal({
      learnBit: false,
      temperature: 40,
    });
  });

  it("should encode a telegram with temperature 120°C", () => {
    const encoded = a5021a.encode({ temperature: 120 });
    const payload = new Uint8Array([0, 0, 0, 8]);
    expect(encoded).to.deep.equal(payload);
  });

  it("should decode a telegram with temperature 120°C", () => {
    const payload = new Uint8Array([0, 0, 0, 8]);
    const decoded = a5021a.decode(payload);
    expect(decoded).to.deep.equal({
      learnBit: false,
      temperature: 120,
    });
  });
});
