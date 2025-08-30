/**
 * EEP A5-02-19: Temperature Sensor (+30°C to +110°C)
 */
import { scale } from "../utils/scale";
import { getValue, setValue } from "../utils/byte-helpers";
import { encodeA5TeachIn } from "../utils/teach-in";

export const a50219 = {
  meta: {
    eep: "a5-02-19",
    rorg: "a5",
    func: "02",
    type: "19",
    title: "Temperature Sensor (+30°C to +110°C)",
    status: "released",
  },
  profile: () => ({
    type: "sensor",
    readings: [
      {
        name: "temperature",
        type: "number",
        unit: "°C",
        min: 30,
        max: 110,
        optional: true,
      },
    ],
  }),
  decode: (payload) => {
    if (!payload || payload.byteLength !== 4) return null;
    const rawTemperature = getValue(payload, 16, 8);
    const learnBit = getValue(payload, 27, 1) === 0;

    return {
      temperature: parseFloat(
        scale(rawTemperature, [255, 0], [30, 110]).toFixed(1)
      ),
      learnBit,
    };
  },
  encode: (data) => {
    const payload = new Uint8Array(4);
    const rawTemperature = Math.round(
      scale(data.temperature, [30, 110], [255, 0])
    );

    setValue(payload, rawTemperature, 16, 8);

    // For data telegrams, the learn bit (DB0, bit 3) is always 1.
    setValue(payload, 1, 27, 1);

    return payload;
  },
  teachIn: (eep) => {
    return encodeA5TeachIn({ eep });
  },
};
