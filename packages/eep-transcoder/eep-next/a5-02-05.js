/**
 * EEP A5-02-05: Temperature Sensor (-10°C to +30°C)
 */
import { scale } from "../utils/scale";
import { getValue, setValue } from "../utils/byte-helpers.js";
import { encodeA5TeachIn } from "../utils/teach-in";

export const a50205 = {
  meta: {
    eep: "a5-02-05",
    rorg: "a5",
    func: "02",
    type: "05",
    title: "Temperature Sensor (0°C to +40°C)",
    status: "released",
  },
  profile: () => ({
    type: "sensor",
    readings: [
      { name: "temperature", type: "number", unit: "°C", min: 0, max: 40 },
    ],
  }),
  decode: (payload) => {
    if (!payload || payload.length !== 4) return null;
    const rawTemperature = getValue(payload, 16, 8);
    const learnBit = getValue(payload, 28, 1) === 0;

    return {
      temperature: parseFloat(
        scale(rawTemperature, [255, 0], [0, 40]).toFixed(1)
      ),
      learnBit,
    };
  },
  encode: (data) => {
    const payload = new Uint8Array(4);
    const rawTemperature = Math.round(
      scale(data.temperature, [0, 40], [255, 0])
    );

    setValue(payload, rawTemperature, 16, 8);
    // For data telegrams, the learn bit (DB0, bit 3) is always 1.
    setValue(payload, 1, 28, 1);

    return payload;
  },
  teachIn: (eep) => {
    return encodeA5TeachIn({ eep });
  },
};
