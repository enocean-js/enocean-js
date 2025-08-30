/**
 * EEP A5-10-0D: Temperature Sensor and Day/Night Control
 */
import { ByteArray } from "@enocean-js/byte-array";
import { encodeA5TeachIn } from "../utils/teach-in.js";
import { scale } from "../utils/scale.js";

export default {
  meta: {
    eep: "a5-10-0d",
    rorg: "a5",
    func: "10",
    type: "0d",
    title: "Temperature Sensor and Day/Night Control",
    status: "released",
  },
  profile: () => ({
    type: "room-operating-panel",
    readings: [
      { name: "temperature", type: "number", unit: "°C", min: 0, max: 40 },
      { name: "dayMode", type: "boolean" },
    ],
  }),
  decode: (payload) => {
    if (!payload || payload.length !== 4) {
      return null;
    }
    const data = new ByteArray(payload);
    const learnBit = data.getValue(28, 1) === 0;

    if (learnBit) {
      return { learnBit };
    }

    const temperature = parseFloat(
      scale(data.getValue(16, 8), [255, 0], [0, 40]).toFixed(1)
    );
    const dayMode = data.getValue(31, 1) === 1;

    return {
      learnBit,
      temperature,
      dayMode,
    };
  },
  encode(data) {
    const payload = new ByteArray(4);
    payload.setValue(1, 28, 1); // data telegram

    if (typeof data.temperature === "number") {
      const rawTemp = Math.round(scale(data.temperature, [0, 40], [255, 0]));
      payload.setValue(rawTemp, 16, 8);
    }
    if (typeof data.dayMode === "boolean") {
      payload.setValue(data.dayMode ? 1 : 0, 31, 1);
    }

    return payload;
  },
  teachIn(eep) {
    return encodeA5TeachIn({ eep });
  },
};
