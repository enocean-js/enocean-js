/**
 * EEP A5-02-15: Temperature Sensor (-10°C to +70°C)
 */
import { scale } from "../utils/scale";
import { getValue, setValue } from "../utils/byte-helpers";
import { encodeA5TeachIn } from "../utils/teach-in";

export const a50215 = {
  meta: {
    eep: "a5-02-15",
    rorg: "a5",
    func: "02",
    type: "15",
    title: "Temperature Sensor (-10°C to +70°C)",
    status: "released",
  },
  profile: () => ({
    type: "sensor",
    readings: [
      {
        name: "temperature",
        type: "number",
        unit: "°C",
        min: -10,
        max: 70,
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
        scale(rawTemperature, [255, 0], [-10, 70]).toFixed(1)
      ),
      learnBit,
    };
  },
  encode: (data) => {
    const payload = new Uint8Array(4);
    const rawTemperature = Math.round(
      scale(data.temperature, [-10, 70], [255, 0])
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
