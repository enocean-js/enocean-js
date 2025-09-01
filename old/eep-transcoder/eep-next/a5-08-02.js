/**
 * EEP A5-08-02: Light, Temperature, and Occupancy Sensor
 */
import { scale } from "../utils/scale.js";
import { getValue, setValue } from "../utils/byte-helpers";
import { encodeA5TeachIn } from "../utils/teach-in.js";

export const a50802 = {
  meta: {
    eep: "a5-08-02",
    rorg: "a5",
    func: "08",
    type: "02",
    title: "Light, Temperature, and Occupancy Sensor (0-1020lx)",
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
        max: 1020,
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
    const learnBit = getValue(payload, 28, 1) === 0;

    const voltage = parseFloat(
      scale(payload[0], [0, 255], [0, 5.1]).toFixed(1)
    );
    const illumination = parseFloat(
      scale(payload[1], [0, 255], [0, 1020]).toFixed(0)
    );
    const temperature = parseFloat(
      scale(payload[2], [0, 255], [0, 51]).toFixed(1)
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
      payload[0] = Math.round(scale(data.voltage, [0, 5.1], [0, 255]));
    }
    if (typeof data.illumination === "number") {
      payload[1] = Math.round(scale(data.illumination, [0, 1020], [0, 255]));
    }
    if (typeof data.temperature === "number") {
      payload[2] = Math.round(scale(data.temperature, [0, 51], [0, 255]));
    }
    if (data.occupancy === false) {
      // 0 = PIR on, so we set the bit if occupancy is false
      setValue(payload, 1, 30, 1);
    }
    if (data.occupancyButton) {
      setValue(payload, 1, 31, 1);
    }

    // For data telegrams, the learn bit (DB0, bit 3) is always 1.
    setValue(payload, 1, 28, 1);

    return payload;
  },
  teachIn: (eep) => {
    return encodeA5TeachIn({ eep });
  },
};
