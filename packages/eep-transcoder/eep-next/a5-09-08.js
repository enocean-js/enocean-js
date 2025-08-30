/**
 * EEP A5-09-08: Pure CO2 Sensor
 */
import { scale } from "../utils/scale.js";
import { ByteArray } from "@enocean-js/byte-array";
import { encodeA5TeachIn } from "../utils/teach-in.js";

export const a50908 = {
  meta: {
    eep: "a5-09-08",
    rorg: "a5",
    func: "09",
    type: "08",
    title: "Pure CO2 Sensor",
    status: "released",
  },
  profile: () => ({
    type: "sensor",
    readings: [{ name: "co2", type: "number", unit: "ppm" }],
  }),
  decode: (payload) => {
    if (!payload || payload.length !== 4) return null;
    const learnBit = payload.getValue(28, 1) === 0;

    const co2 = parseFloat(
      scale(payload.getValue(16, 8), [0, 255], [0, 2000]).toFixed(0)
    );

    return {
      learnBit,
      co2,
    };
  },
  encode: (data) => {
    const payload = ByteArray.from([0, 0, 0, 0]);

    if (typeof data.co2 === "number") {
      payload.setValue(Math.round(scale(data.co2, [0, 2000], [0, 255])), 16, 8);
    }

    // For data telegrams, the learn bit (DB0, bit 3) is always 1.
    payload.setValue(1, 28, 1);

    return payload;
  },
  teachIn: (eep) => {
    return encodeA5TeachIn({ eep });
  },
};
