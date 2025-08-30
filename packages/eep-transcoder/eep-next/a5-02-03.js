/**
 * EEP A5-02-03: Temperature Sensor (-20°C to +20°C)
 */
import { scale } from "../utils/scale";
import { getValue, setValue } from "../utils/byte-helpers";
import { encodeA5TeachIn } from "../utils/teach-in";

export const a50203 = {
  meta: {
    eep: "a5-02-03",
    rorg: "a5",
    func: "02",
    type: "03",
    title: "Temperature Sensor (-20°C to +20°C)",
    status: "released",
  },
  profile: () => ({
    type: "sensor",
    readings: [
      {
        name: "temperature",
        type: "number",
        unit: "°C",
        min: -20,
        max: 20,
        optional: true,
      },
    ],
  }),
  decode: (payload) => {
    if (!payload || payload.byteLength !== 4) return null;
    const rawTemperature = getValue(payload, 16, 8);
    const learnBit = getValue(payload, 28, 1) === 0;

    return {
      temperature: parseFloat(
        scale(rawTemperature, [255, 0], [-20, 20]).toFixed(1)
      ),
      learnBit,
    };
  },
  encode: (data) => {
    const payload = new Uint8Array(4);
    const rawTemperature = Math.round(
      scale(data.temperature, [-20, 20], [255, 0])
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
