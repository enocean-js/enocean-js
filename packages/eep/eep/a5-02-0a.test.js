import { a5020a } from "./a5-02-0a.js";
import { describe, it, expect } from "vitest";

describe("EEP a5-02-0a", () => {
  it("should decode a telegram with temperature around 70°C", () => {
    // scale(70, [50, 90], [255, 0]) = 127.5, rounded to 128
    // scale(128, [255, 0], [50, 90]) = 69.92... -> 69.9
    const payload = new Uint8Array([0, 0, 128, 8]);
    const decoded = a5020a.decode(payload);
    expect(decoded).to.deep.equal({
      learnBit: false,
      temperature: 69.9,
    });
  });

  it("should encode a telegram with temperature 70°C", () => {
    const encoded = a5020a.encode({ temperature: 70 });
    const payload = new Uint8Array([0, 0, 128, 8]);
    expect(encoded).to.deep.equal(payload);
  });

  it("should encode a telegram with temperature 50°C", () => {
    const encoded = a5020a.encode({ temperature: 50 });
    const payload = new Uint8Array([0, 0, 255, 8]);
    expect(encoded).to.deep.equal(payload);
  });

  it("should decode a telegram with temperature 50°C", () => {
    const payload = new Uint8Array([0, 0, 255, 8]);
    const decoded = a5020a.decode(payload);
    expect(decoded).to.deep.equal({
      learnBit: false,
      temperature: 50,
    });
  });

  it("should encode a telegram with temperature 90°C", () => {
    const encoded = a5020a.encode({ temperature: 90 });
    const payload = new Uint8Array([0, 0, 0, 8]);
    expect(encoded).to.deep.equal(payload);
  });

  it("should decode a telegram with temperature 90°C", () => {
    const payload = new Uint8Array([0, 0, 0, 8]);
    const decoded = a5020a.decode(payload);
    expect(decoded).to.deep.equal({
      learnBit: false,
      temperature: 90,
    });
  });
});
