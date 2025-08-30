/**
 * EEP A5-02-04: Temperature Sensor (-10°C to +30°C)
 */
import { scale } from "../utils/scale";
import { ByteArray } from "@enocean-js/byte-array";
import { encodeA5TeachIn } from "../utils/teach-in";

export const a50204 = {
  meta: {
    eep: "a5-02-04",
    rorg: "a5",
    func: "02",
    type: "04",
    title: "Temperature Sensor (-10°C to +30°C)",
    status: "released",
  },
  profile: () => ({
    type: "sensor",
    readings: [
      { name: "temperature", type: "number", unit: "°C", min: -10, max: 30 },
    ],
  }),
  decode: (payload) => {
    if (!payload || payload.length !== 4) return null;
    const rawTemperature = payload.getValue(16, 8);
    const learnBit = payload.getValue(27, 1) === 0;

    return {
      temperature: parseFloat(
        scale(rawTemperature, [255, 0], [-10, 30]).toFixed(1)
      ),
      learnBit,
    };
  },
  encode: (data) => {
    const payload = new ByteArray(4);
    const rawTemperature = Math.round(
      scale(data.temperature, [-10, 30], [255, 0])
    );

    payload.setValue(rawTemperature, 16, 8);

    // For data telegrams, the learn bit (DB0, bit 3) is always 1.
    payload.setValue(1, 28, 1);

    return payload;
  },
  teachIn: (eep) => {
    return encodeA5TeachIn({ eep });
  },
};
