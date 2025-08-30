/**
 * EEP A5-02-30: 10 Bit Temperature Sensor (-40°C to +62.3°C)
 */
import { scale } from "../utils/scale";
import { ByteArray } from "@enocean-js/byte-array";
import { encodeA5TeachIn } from "../utils/teach-in";

export const a50230 = {
  meta: {
    eep: "a5-02-30",
    rorg: "a5",
    func: "02",
    type: "30",
    title: "10 Bit Temperature Sensor (-40°C to +62.3°C)",
    status: "released",
  },
  profile: () => ({
    type: "sensor",
    readings: [
      {
        name: "temperature",
        type: "number",
        unit: "°C",
        min: -40,
        max: 62.3,
      },
    ],
  }),
  decode: (payload) => {
    if (!payload || payload.length !== 4) return null;
    const rawTemperature = payload.getValue(14, 10);
    const learnBit = payload.getValue(27, 1) === 0;

    return {
      temperature: parseFloat(
        scale(rawTemperature, [1023, 0], [-40, 62.3]).toFixed(2)
      ),
      learnBit,
    };
  },
  encode: (data) => {
    const payload = ByteArray.from([0, 0, 0, 0]);
    const rawTemperature = Math.round(
      scale(data.temperature, [-40, 62.3], [1023, 0])
    );

    payload.setValue(rawTemperature, 14, 10);

    // For data telegrams, the learn bit (DB0, bit 3) is always 1.
    payload.setValue(1, 27, 1);

    return payload;
  },
  teachIn: (eep) => {
    return encodeA5TeachIn({ eep });
  },
};
