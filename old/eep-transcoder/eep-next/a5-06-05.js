/**
 * EEP A5-06-05: Light Sensor (0 to 10,200lx)
 */
import { scale } from "../utils/scale.js";
import { getValue, setValue } from "../utils/byte-helpers";
import { encodeA5TeachIn } from "../utils/teach-in.js";

export const a50605 = {
  meta: {
    eep: "a5-06-05",
    rorg: "a5",
    func: "06",
    type: "05",
    title: "Light Sensor (0 to 10,200lx)",
    status: "released",
  },
  profile: () => ({
    type: "sensor",
    readings: [
      {
        name: "illumination",
        type: "number",
        unit: "lx",
        min: 0,
        max: 10200,
        optional: true,
      },
      {
        name: "voltage",
        type: "number",
        unit: "V",
        min: 0,
        max: 5.1,
        optional: true,
      },
    ],
  }),
  decode: (payload) => {
    if (!payload || payload.byteLength !== 4) return null;
    const learnBit = getValue(payload, 28, 1) === 0;
    const rangeSelect = getValue(payload, 31, 1) === 1;

    const voltage = parseFloat(
      scale(payload[0], [0, 255], [0, 5.1]).toFixed(1)
    );

    let illumination;
    if (rangeSelect) {
      // Range is 0...5100 lx
      illumination = parseFloat(
        scale(payload[1], [0, 255], [0, 5100]).toFixed(0)
      );
    } else {
      // Range is 0...10200 lx
      illumination = parseFloat(
        scale(payload[2], [0, 255], [0, 10200]).toFixed(0)
      );
    }

    return {
      learnBit,
      illumination,
      voltage,
    };
  },
  encode: (data) => {
    const payload = new Uint8Array(4);

    if (typeof data.voltage === "number") {
      const rawVoltage = Math.round(scale(data.voltage, [0, 5.1], [0, 255]));
      payload[0] = rawVoltage;
    }

    if (typeof data.illumination === "number") {
      // Automatically select the best range
      if (data.illumination <= 5100) {
        // Use range 0...5100 lx
        setValue(payload, 1, 31, 1);
        const rawIllumination = Math.round(
          scale(data.illumination, [0, 5100], [0, 255])
        );
        payload[1] = rawIllumination;
      } else {
        // Use range 0...10200 lx
        const rawIllumination = Math.round(
          scale(data.illumination, [0, 10200], [0, 255])
        );
        payload[2] = rawIllumination;
      }
    }

    // For data telegrams, the learn bit (DB0, bit 3) is always 1.
    setValue(payload, 1, 28, 1);

    return payload;
  },
  teachIn: (eep) => {
    return encodeA5TeachIn({ eep });
  },
};
