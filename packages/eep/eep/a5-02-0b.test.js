import { a5020b } from "./a5-02-0b.js";
import { describe, it, expect } from "vitest";

describe("EEP a5-02-0b", () => {
  it("should decode a telegram with temperature around 80°C", () => {
    // scale(80, [60, 100], [255, 0]) = 127.5, rounded to 128
    // scale(128, [255, 0], [60, 100]) = 79.84... -> 79.8
    const payload = new Uint8Array([0, 0, 128, 8]);
    const decoded = a5020b.decode(payload);
    expect(decoded).to.deep.equal({
      learnBit: false,
      temperature: 79.9,
    });
  });

  it("should encode a telegram with temperature 80°C", () => {
    const encoded = a5020b.encode({ temperature: 80 });
    const payload = new Uint8Array([0, 0, 128, 8]);
    expect(encoded).to.deep.equal(payload);
  });

  it("should encode a telegram with temperature 60°C", () => {
    const encoded = a5020b.encode({ temperature: 60 });
    const payload = new Uint8Array([0, 0, 255, 8]);
    expect(encoded).to.deep.equal(payload);
  });

  it("should decode a telegram with temperature 60°C", () => {
    const payload = new Uint8Array([0, 0, 255, 8]);
    const decoded = a5020b.decode(payload);
    expect(decoded).to.deep.equal({
      learnBit: false,
      temperature: 60,
    });
  });

  it("should encode a telegram with temperature 100°C", () => {
    const encoded = a5020b.encode({ temperature: 100 });
    const payload = new Uint8Array([0, 0, 0, 8]);
    expect(encoded).to.deep.equal(payload);
  });

  it("should decode a telegram with temperature 100°C", () => {
    const payload = new Uint8Array([0, 0, 0, 8]);
    const decoded = a5020b.decode(payload);
    expect(decoded).to.deep.equal({
      learnBit: false,
      temperature: 100,
    });
  });
});
