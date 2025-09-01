/**
 * EEP A5-09-09: Pure CO2 Sensor with Power Failure Detection
 */
import { scale } from "../utils/scale.js";
import { getValue, setValue } from "../utils/byte-helpers";
import { encodeA5TeachIn } from "../utils/teach-in.js";

export const a50909 = {
  meta: {
    eep: "a5-09-09",
    rorg: "a5",
    func: "09",
    type: "09",
    title: "Pure CO2 Sensor with Power Failure Detection",
    status: "released",
  },
  profile: () => ({
    type: "sensor",
    readings: [
      {
        name: "co2",
        type: "number",
        unit: "ppm",
        min: 0,
        max: 2000,
        optional: true,
      },
      { name: "powerFailure", type: "boolean", optional: true },
    ],
  }),
  decode: (payload) => {
    if (!payload || payload.byteLength !== 4) return null;
    const learnBit = getValue(payload, 28, 1) === 0;

    const co2 = parseFloat(
      scale(getValue(payload, 16, 8), [0, 255], [0, 2000]).toFixed(0)
    );
    const powerFailure = getValue(payload, 29, 1) === 1;

    return {
      learnBit,
      co2,
      powerFailure,
    };
  },
  encode: (data) => {
    const payload = new Uint8Array(4);

    if (typeof data.co2 === "number") {
      setValue(
        payload,
        Math.round(scale(data.co2, [0, 2000], [0, 255])),
        16,
        8
      );
    }
    if (data.powerFailure) {
      setValue(payload, 1, 29, 1);
    }

    // For data telegrams, the learn bit (DB0, bit 3) is always 1.
    setValue(payload, 1, 28, 1);

    return payload;
  },
  teachIn: (eep) => {
    return encodeA5TeachIn({ eep });
  },
};
