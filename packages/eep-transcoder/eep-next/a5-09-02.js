/**
 * EEP A5-09-02: CO Sensor
 */
import { scale } from "../utils/scale.js";
import { getValue, setValue } from "../utils/byte-helpers";
import { encodeA5TeachIn } from "../utils/teach-in.js";

export const a50902 = {
  meta: {
    eep: "a5-09-02",
    rorg: "a5",
    func: "09",
    type: "02",
    title: "CO Sensor (0 to 1020ppm)",
    status: "released",
  },
  profile: () => ({
    type: "sensor",
    readings: [
      {
        name: "concentration",
        type: "number",
        unit: "ppm",
        min: 0,
        max: 1020,
        optional: true,
      },
      {
        name: "temperature",
        type: "number",
        unit: "°C",
        optional: true,
        min: 0,
        max: 51,
      },
      {
        name: "voltage",
        type: "number",
        unit: "V",
        min: 0,
        max: 5.1,
        optional: true,
      },
    ],
  }),
  decode: (payload) => {
    if (!payload || payload.byteLength !== 4) return null;
    const learnBit = getValue(payload, 27, 1) === 0;
    const tempAvailable = getValue(payload, 26, 1) === 1;

    const voltage = parseFloat(
      scale(getValue(payload, 0, 8), [0, 255], [0, 5.1]).toFixed(1)
    );
    const concentration = parseFloat(
      scale(getValue(payload, 8, 8), [0, 255], [0, 1020]).toFixed(0)
    );

    let temperature = null;
    if (tempAvailable) {
      temperature = parseFloat(
        scale(getValue(payload, 16, 8), [0, 255], [0, 51]).toFixed(1)
      );
    }

    return {
      learnBit,
      voltage,
      concentration,
      temperature,
    };
  },
  encode: (data) => {
    const payload = new Uint8Array(4);

    if (typeof data.voltage === "number") {
      setValue(
        payload,
        Math.round(scale(data.voltage, [0, 5.1], [0, 255])),
        0,
        8
      );
    }
    if (typeof data.concentration === "number") {
      setValue(
        payload,
        Math.round(scale(data.concentration, [0, 1020], [0, 255])),
        8,
        8
      );
    }
    if (typeof data.temperature === "number") {
      setValue(payload, 1, 26, 1); // Set temp available bit
      setValue(
        payload,
        Math.round(scale(data.temperature, [0, 51], [0, 255])),
        16,
        8
      );
    }

    // For data telegrams, the learn bit (DB0, bit 3) is always 1.
    setValue(payload, 1, 27, 1);

    return payload;
  },
  teachIn: (eep) => {
    return encodeA5TeachIn({ eep });
  },
};
