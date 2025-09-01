/**
 * EEP A5-09-0A: Hydrogen Gas Sensor
 */
import { scale } from "../utils/scale.js";
import { ByteArray } from "@enocean-js/byte-array";
import { encodeA5TeachIn } from "../utils/teach-in.js";

export const a5090a = {
  meta: {
    eep: "a5-09-0a",
    rorg: "a5",
    func: "09",
    type: "0a",
    title: "Hydrogen Gas Sensor",
    status: "released",
  },
  profile: () => ({
    type: "sensor",
    readings: [
      { name: "concentration", type: "number", unit: "ppm" },
      { name: "temperature", type: "number", unit: "°C" },
      { name: "voltage", type: "number", unit: "V" },
    ],
  }),
  decode: (payload) => {
    if (!payload || payload.length !== 4) return null;
    const learnBit = payload.getValue(28, 1) === 0;

    const tempAvailable = payload.getValue(30, 1) === 1;
    const voltageAvailable = payload.getValue(31, 1) === 1;

    const concentration = payload.getValue(0, 16);

    let temperature = null;
    if (tempAvailable) {
      temperature = parseFloat(
        scale(payload.getValue(16, 8), [0, 255], [-20, 60]).toFixed(1)
      );
    }

    let voltage = null;
    if (voltageAvailable) {
      voltage = parseFloat(
        scale(payload.getValue(24, 4), [0, 15], [2.0, 5.0]).toFixed(1)
      );
    }

    return {
      learnBit,
      concentration,
      temperature,
      voltage,
    };
  },
  encode: (data) => {
    const payload = ByteArray.from([0, 0, 0, 0]);

    if (typeof data.concentration === "number") {
      payload.setValue(data.concentration, 0, 16);
    }
    if (typeof data.temperature === "number") {
      payload.setValue(1, 30, 1); // Temp sensor available
      payload.setValue(
        Math.round(scale(data.temperature, [-20, 60], [0, 255])),
        16,
        8
      );
    }
    if (typeof data.voltage === "number") {
      payload.setValue(1, 31, 1); // Supply voltage available
      payload.setValue(
        Math.round(scale(data.voltage, [2.0, 5.0], [0, 15])),
        24,
        4
      );
    }

    // For data telegrams, the learn bit (DB0, bit 3) is always 1.
    payload.setValue(1, 28, 1);

    return payload;
  },
  teachIn: (eep) => {
    return encodeA5TeachIn({ eep });
  },
};
