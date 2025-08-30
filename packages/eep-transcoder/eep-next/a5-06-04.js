/**
 * EEP A5-06-04: Curtain Wall Brightness Sensor
 */
import { scale } from "../utils/scale.js";
import { getValue, setValue } from "../utils/byte-helpers";
import { encodeA5TeachIn } from "../utils/teach-in.js";

export const a50604 = {
  meta: {
    eep: "a5-06-04",
    rorg: "a5",
    func: "06",
    type: "04",
    title: "Curtain Wall Brightness Sensor",
    status: "released",
  },
  profile: () => ({
    type: "sensor",
    readings: [
      {
        name: "illumination",
        type: "number",
        unit: "lx",
        min: 0,
        max: 65535,
        optional: true,
      },
      {
        name: "temperature",
        type: "number",
        unit: "°C",
        min: -20,
        max: 60,
        optional: true,
      },
      {
        name: "energyStorage",
        type: "number",
        unit: "%",
        min: 0,
        max: 100,
        optional: true,
      },
    ],
  }),
  decode: (payload) => {
    if (!payload || payload.byteLength !== 4) return null;
    const learnBit = getValue(payload, 28, 1) === 0;
    const tempAvailable = getValue(payload, 30, 1) === 1;
    const energyAvailable = getValue(payload, 31, 1) === 1;

    const illumination = getValue(payload, 8, 16);

    let temperature = null;
    if (tempAvailable) {
      temperature = parseFloat(
        scale(payload[0], [0, 255], [-20, 60]).toFixed(1)
      );
    }

    let energyStorage = null;
    if (energyAvailable) {
      energyStorage = parseFloat(
        scale(getValue(payload, 24, 4), [0, 15], [0, 100]).toFixed(0)
      );
    }

    return {
      learnBit,
      illumination,
      temperature,
      energyStorage,
    };
  },
  encode: (data) => {
    const payload = new Uint8Array(4);

    if (typeof data.illumination === "number") {
      setValue(payload, data.illumination, 8, 16);
    }

    if (typeof data.temperature === "number") {
      setValue(payload, 1, 30, 1); // Set temperature availability bit
      const rawTemp = Math.round(scale(data.temperature, [-20, 60], [0, 255]));
      payload[0] = rawTemp;
    }

    if (typeof data.energyStorage === "number") {
      setValue(payload, 1, 31, 1); // Set energy storage availability bit
      const rawEnergy = Math.round(
        scale(data.energyStorage, [0, 100], [0, 15])
      );
      setValue(payload, rawEnergy, 24, 4);
    }

    // For data telegrams, the learn bit (DB0, bit 3) is always 1.
    setValue(payload, 1, 28, 1);

    return payload;
  },
  teachIn: (eep) => {
    return encodeA5TeachIn({ eep });
  },
};
