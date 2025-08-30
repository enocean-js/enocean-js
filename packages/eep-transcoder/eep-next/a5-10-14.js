/**
 * EEP A5-10-14: Temperature and Humidity Sensor, Day/Night Control
 */
import { getValue, setValue } from "../utils/byte-helpers";
import { encodeA5TeachIn } from "../utils/teach-in.js";
import { scale } from "../utils/scale.js";

export default {
  meta: {
    eep: "a5-10-14",
    rorg: "a5",
    func: "10",
    type: "14",
    title: "Temperature and Humidity Sensor, Day/Night Control",
    status: "released",
  },
  profile: () => ({
    type: "room-operating-panel",
    readings: [
      {
        name: "temperature",
        type: "number",
        unit: "°C",
        min: 0,
        max: 40,
        optional: true,
      },
      {
        name: "humidity",
        type: "number",
        unit: "%",
        min: 0,
        max: 100,
        optional: true,
      },
      { name: "dayMode", type: "boolean", optional: true },
    ],
  }),
  decode: (payload) => {
    if (!payload || payload.byteLength !== 4) {
      return null;
    }
    const learnBit = getValue(payload, 28, 1) === 0;

    if (learnBit) {
      return { learnBit };
    }

    const temperature = parseFloat(
      scale(getValue(payload, 16, 8), [255, 0], [0, 40]).toFixed(1)
    );
    const humidity = parseFloat(
      scale(getValue(payload, 8, 8), [0, 250], [0, 100]).toFixed(1)
    );
    const dayMode = getValue(payload, 31, 1) === 1;

    return {
      learnBit,
      temperature,
      humidity,
      dayMode,
    };
  },
  encode(data) {
    const payload = new Uint8Array(4);
    setValue(payload, 1, 28, 1); // data telegram

    if (typeof data.temperature === "number") {
      const rawTemp = Math.round(scale(data.temperature, [0, 40], [255, 0]));
      setValue(payload, rawTemp, 16, 8);
    }
    if (typeof data.humidity === "number") {
      const rawHumidity = Math.round(scale(data.humidity, [0, 100], [0, 250]));
      setValue(payload, rawHumidity, 8, 8);
    }
    if (typeof data.dayMode === "boolean") {
      setValue(payload, data.dayMode ? 1 : 0, 31, 1);
    }

    return payload;
  },
  teachIn(eep) {
    return encodeA5TeachIn({ eep });
  },
};
