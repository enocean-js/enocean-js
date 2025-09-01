import * as EEP from "./eep.js";
import { describe, it, expect } from "vitest";

for (const key of Object.keys(EEP)) {
  let eep = EEP[key];
  describe(`EEP ${eep.meta.eep}`, () => {
    describe(`Meta object`, () => {
      it(`should have a non-empty title string`, () => {
        expect(eep.meta.title).to.be.a("string").and.not.to.be.empty;
      });

      it(`should have rorg, func, and type matching its EEP key`, () => {
        const eepSplit = eep.meta.eep.split("-");
        expect(eep.meta.rorg).to.equal(eepSplit[0]);
        expect(eep.meta.func).to.equal(eepSplit[1]);
        expect(eep.meta.type).to.equal(eepSplit[2]);
        expect(`${eep.meta.rorg}${eep.meta.func}${eep.meta.type}`).to.equal(
          key
        );
      });
    });
    describe(`Profile function`, () => {
      it(`should exist`, () => {
        expect(eep.profile).to.be.a("function");
      });
      it(`should return an object with type and readings`, () => {
        const profile = eep.profile();
        expect(profile).to.be.an("object");
        expect(profile.type).to.be.a("string").and.not.to.be.empty;
        expect(profile.readings).to.be.an("array").and.not.to.be.empty;
        for (const reading of profile.readings) {
          expect(reading.name).to.be.a("string").and.not.to.be.empty;
          expect(reading.type).to.be.a("string").and.not.to.be.empty;
          if (reading.unit) {
            expect(reading.unit).to.be.a("string").and.not.to.be.empty;
          }
          if (reading.min !== undefined && reading.max !== undefined) {
            expect(reading.min).to.be.a("number");
            expect(reading.max).to.be.a("number");
          }
        }
      });
    });

    const profile = eep.profile();
    if (eep.meta.rorg === "a5") {
      it(`should throw an error when decoding invalid payloads`, () => {
        expect(() => eep.decode()).to.throw();
        expect(() => eep.decode(null)).to.throw();
        expect(() => eep.decode(new Uint8Array(0))).to.throw();
        expect(() => eep.decode(new Uint8Array(3))).to.throw();
        expect(() => eep.decode(new Uint8Array(5))).to.throw();
      });
      it(`should NOT have a teachIn function`, () => {
        expect(eep.teachIn).to.be.undefined;
      });
      for (const reading of profile.readings) {
        if (reading.min !== undefined && reading.max !== undefined) {
          it(`should encode and decode the min ${reading.name}`, () => {
            const data = {};
            data[reading.name] = reading.min;
            const encoded = eep.encode(data);
            const decoded = eep.decode(encoded);
            expect(decoded[reading.name]).to.be.closeTo(reading.min, 0.1);
          });
          it(`should encode and decode the max ${reading.name}`, () => {
            const data = {};
            data[reading.name] = reading.max;
            const encodedMax = eep.encode(data);
            const decodedMax = eep.decode(encodedMax);
            expect(decodedMax[reading.name]).to.be.closeTo(reading.max, 0.1);
            expect(encodedMax).to.be.instanceOf(Uint8Array);
          });
          it(`should have bit 28 set to 1 (data telegram)`, () => {
            const data = new Uint8Array([0, 0, 0, 0b00001000]);
            const decoded = eep.decode(data);
            expect(decoded.isTeachIn).to.be.false; // learn bit should always be 1 in data telegrams
          });
        }
      }
    }
    if (eep.meta.rorg === "f6") {
      it(`it should decode button1 presses`, () => {
        const data = new Uint8Array([0b00011000]); // Button 1 pressed
        const status = new Uint8Array([0b00110000]); // T21=1, NU=1
        const decoded = eep.decode(data, status);

        expect(decoded.Button1).to.be.true;
        expect(decoded.Button2).to.be.false;
        expect(decoded.Button3).to.be.false;
        expect(decoded.Button4).to.be.false;
        expect(decoded.Multiple).to.be.false;
      });
      it(`it should decode button2 presses`, () => {
        const data = new Uint8Array([0b00111000]); // Button 1 pressed
        const status = new Uint8Array([0b00110000]); // T21=1, NU=1
        const decoded = eep.decode(data, status);
        expect(decoded.Button1).to.be.false;
        expect(decoded.Button2).to.be.true;
        expect(decoded.Button3).to.be.false;
        expect(decoded.Button4).to.be.false;
        expect(decoded.Multiple).to.be.false;
      });
      it(`it should decode button3 presses`, () => {
        const data = new Uint8Array([0b01011000]); // Button 1 pressed
        const status = new Uint8Array([0b00110000]); // T21=1, NU=1
        const decoded = eep.decode(data, status);
        expect(decoded.Button1).to.be.false;
        expect(decoded.Button2).to.be.false;
        expect(decoded.Button3).to.be.true;
        expect(decoded.Button4).to.be.false;
        expect(decoded.Multiple).to.be.false;
      });
      it(`it should decode button4 presses`, () => {
        const data = new Uint8Array([0b01111000]); // Button 1 pressed
        const status = new Uint8Array([0b00110000]); // T21=1, NU=1
        const decoded = eep.decode(data, status);
        expect(decoded.Button1).to.be.false;
        expect(decoded.Button2).to.be.false;
        expect(decoded.Button3).to.be.false;
        expect(decoded.Button4).to.be.true;
        expect(decoded.Multiple).to.be.false;
      });
      it(`it should decode release`, () => {
        const data = new Uint8Array([0b00001000]); // Button 1 pressed
        const status = new Uint8Array([0b00110000]); // T21=1, NU=1
        const decoded = eep.decode(data, status);
        expect(decoded.Button1).to.be.false;
        expect(decoded.Button2).to.be.false;
        expect(decoded.Button3).to.be.false;
        expect(decoded.Button4).to.be.false;
        expect(decoded.Multiple).to.be.false;
      });
      it(`it should decode button1 and button2 pressed simultaniously`, () => {
        const data = new Uint8Array([0b00010011]); // Button 1 pressed
        const status = new Uint8Array([0b00110000]); // T21=1, NU=1
        const decoded = eep.decode(data, status);
        expect(decoded.Button1).to.be.true;
        expect(decoded.Button2).to.be.true;
        expect(decoded.Button3).to.be.false;
        expect(decoded.Button4).to.be.false;
        expect(decoded.Multiple).to.be.false;
      });
      it(`it should decode Mutliple presses (NU=0)`, () => {
        const data = new Uint8Array([0b01110000]); // Button 1 pressed
        const status = new Uint8Array([0b00100000]); // T21=1, NU=1
        const decoded = eep.decode(data, status);
        expect(decoded.Button1).to.be.false;
        expect(decoded.Button2).to.be.false;
        expect(decoded.Button3).to.be.false;
        expect(decoded.Button4).to.be.false;
        expect(decoded.Multiple).to.be.true;
      });
      it(`it should encode button press`, () => {
        let encoded = eep.encode({ Button1: true });
        expect(encoded[0]).to.be.equal(0b00010000);
        encoded = eep.encode({ Button2: true });
        expect(encoded[0]).to.be.equal(0b00110000);
        encoded = eep.encode({ Button3: true });
        expect(encoded[0]).to.be.equal(0b01010000);
        encoded = eep.encode({ Button4: true });
        expect(encoded[0]).to.be.equal(0b01110000);
        encoded = eep.encode({});
        expect(encoded[0]).to.be.equal(0b00000000);
      });
      it(`it should encode mutiple button presses`, () => {
        let encoded = eep.encode({ Button1: true, Button2: true });
        expect(encoded[0]).to.be.equal(0b00010011);
      });
    }
  });
}
