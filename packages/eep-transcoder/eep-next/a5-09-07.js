/**
 * EEP A5-09-07: Particle Sensor (PM10, PM2.5, PM1)
 */
import { getValue, setValue } from "../utils/byte-helpers";
import { encodeA5TeachIn } from "../utils/teach-in.js";

export const a50907 = {
  meta: {
    eep: "a5-09-07",
    rorg: "a5",
    func: "09",
    type: "07",
    title: "Particles Sensor",
    status: "released",
  },
  profile: () => ({
    type: "sensor",
    readings: [
      {
        name: "pm10",
        type: "number",
        unit: "µg/m³",
        min: 0,
        max: 511,
        optional: true,
      },
      {
        name: "pm25",
        type: "number",
        unit: "µg/m³",
        min: 0,
        max: 511,
        optional: true,
      },
      {
        name: "pm1",
        type: "number",
        unit: "µg/m³",
        min: 0,
        max: 511,
        optional: true,
      },
    ],
  }),
  decode: (payload) => {
    if (!payload || payload.byteLength !== 4) return null;
    const learnBit = getValue(payload, 28, 1) === 0;

    const pm10active = getValue(payload, 29, 1) === 1;
    const pm25active = getValue(payload, 30, 1) === 1;
    const pm1active = getValue(payload, 31, 1) === 1;

    return {
      learnBit,
      pm10: pm10active ? getValue(payload, 0, 9) : null,
      pm25: pm25active ? getValue(payload, 9, 9) : null,
      pm1: pm1active ? getValue(payload, 18, 9) : null,
    };
  },
  encode: (data) => {
    const payload = new Uint8Array(4);

    if (typeof data.pm10 === "number") {
      setValue(payload, 1, 29, 1); // PM10 active
      setValue(payload, data.pm10, 0, 9);
    }
    if (typeof data.pm25 === "number") {
      setValue(payload, 1, 30, 1); // PM2.5 active
      setValue(payload, data.pm25, 9, 9);
    }
    if (typeof data.pm1 === "number") {
      setValue(payload, 1, 31, 1); // PM1 active
      setValue(payload, data.pm1, 18, 9);
    }

    // For data telegrams, the learn bit (DB0, bit 3) is always 1.
    setValue(payload, 1, 28, 1);

    return payload;
  },
  teachIn: (eep) => {
    return encodeA5TeachIn({ eep });
  },
};
