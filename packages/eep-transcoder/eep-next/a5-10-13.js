/**
 * EEP A5-10-13: Temperature and Humidity Sensor, Occupancy Control
 */
import { ByteArray } from "@enocean-js/byte-array";
import { encodeA5TeachIn } from "../utils/teach-in.js";
import { scale } from "../utils/scale.js";

export default {
  meta: {
    eep: "a5-10-13",
    rorg: "a5",
    func: "10",
    type: "13",
    title: "Temperature and Humidity Sensor, Occupancy Control",
    status: "released",
  },
  profile: () => ({
    type: "room-operating-panel",
    readings: [
      { name: "temperature", type: "number", unit: "°C", min: 0, max: 40 },
      { name: "humidity", type: "number", unit: "%", min: 0, max: 100 },
      { name: "occupancy", type: "boolean" },
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
    const humidity = parseFloat(
      scale(data.getValue(8, 8), [0, 250], [0, 100]).toFixed(1)
    );
    const occupancy = data.getValue(31, 1) === 0;

    return {
      learnBit,
      temperature,
      humidity,
      occupancy,
    };
  },
  encode(data) {
    const payload = new ByteArray(4);
    payload.setValue(1, 28, 1); // data telegram

    if (typeof data.temperature === "number") {
      const rawTemp = Math.round(scale(data.temperature, [0, 40], [255, 0]));
      payload.setValue(rawTemp, 16, 8);
    }
    if (typeof data.humidity === "number") {
      const rawHumidity = Math.round(scale(data.humidity, [0, 100], [0, 250]));
      payload.setValue(rawHumidity, 8, 8);
    }
    if (typeof data.occupancy === "boolean") {
      payload.setValue(data.occupancy ? 0 : 1, 31, 1);
    }

    return payload;
  },
  teachIn(eep) {
    return encodeA5TeachIn({ eep });
  },
};
