/**
 * EEP A5-08-01: Light, Temperature, and Occupancy Sensor
 */
import { scale } from "../utils/scale.js";
import { getValue, setValue } from "../utils/byte-helpers";
import { encodeA5TeachIn } from "../utils/teach-in.js";

export const a50801 = {
  meta: {
    eep: "a5-08-01",
    rorg: "a5",
    func: "08",
    type: "01",
    title: "Light, Temperature, and Occupancy Sensor",
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
        max: 510,
        optional: true,
      },
      {
        name: "temperature",
        type: "number",
        unit: "°C",
        min: 0,
        max: 51,
        optional: true,
      },
      { name: "occupancy", type: "boolean", optional: true },
      { name: "occupancyButton", type: "boolean", optional: true },
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

    const voltage = parseFloat(
      scale(getValue(payload, 0, 8), [0, 255], [0, 5.1]).toFixed(1)
    );
    const illumination = parseFloat(
      scale(getValue(payload, 8, 8), [0, 255], [0, 510]).toFixed(0)
    );
    const temperature = parseFloat(
      scale(getValue(payload, 16, 8), [0, 255], [0, 51]).toFixed(1)
    );
    const occupancy = getValue(payload, 30, 1) === 0; // 0 = PIR on
    const occupancyButton = getValue(payload, 31, 1) === 1;

    return {
      learnBit,
      voltage,
      illumination,
      temperature,
      occupancy,
      occupancyButton,
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
    if (typeof data.illumination === "number") {
      setValue(
        payload,
        Math.round(scale(data.illumination, [0, 510], [0, 255])),
        8,
        8
      );
    }
    if (typeof data.temperature === "number") {
      setValue(
        payload,
        Math.round(scale(data.temperature, [0, 51], [0, 255])),
        16,
        8
      );
    }
    if (data.occupancy === false) {
      // 0 = PIR on, so we set the bit if occupancy is false
      setValue(payload, 1, 30, 1);
    }
    if (data.occupancyButton) {
      setValue(payload, 1, 31, 1);
    }

    // For data telegrams, the learn bit (DB0, bit 3) is always 1.
    setValue(payload, 1, 27, 1);

    return payload;
  },
  teachIn: (eep) => {
    return encodeA5TeachIn({ eep });
  },
};
