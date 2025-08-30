/**
 * EEP A5-02-08: Temperature Sensor (+30°C to +70°C)
 */
import { scale } from "../utils/scale";
import { ByteArray } from "@enocean-js/byte-array";
import { encodeA5TeachIn } from "../utils/teach-in";

export const a50208 = {
  meta: {
    eep: "a5-02-08",
    rorg: "a5",
    func: "02",
    type: "08",
    title: "Temperature Sensor (+30°C to +70°C)",
    status: "released",
  },
  profile: () => ({
    type: "sensor",
    readings: [
      { name: "temperature", type: "number", unit: "°C", min: 30, max: 70 },
    ],
  }),
  decode: (payload) => {
    if (!payload || payload.length !== 4) return null;
    const rawTemperature = payload.getValue(16, 8);
    const learnBit = payload.getValue(27, 1) === 0;

    return {
      temperature: parseFloat(
        scale(rawTemperature, [255, 0], [30, 70]).toFixed(1)
      ),
      learnBit,
    };
  },
  encode: (data) => {
    const payload = new ByteArray(4);
    const rawTemperature = Math.round(
      scale(data.temperature, [30, 70], [255, 0])
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
