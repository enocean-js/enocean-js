/**
 * EEP A5-10-10: Temperature and Humidity Sensor, Set Point and Occupancy Control
 */
import { getValue, setValue } from "../utils/byte-helpers";
import { encodeA5TeachIn } from "../utils/teach-in.js";
import { scale } from "../utils/scale.js";

export default {
  meta: {
    eep: "a5-10-10",
    rorg: "a5",
    func: "10",
    type: "10",
    title: "Temperature and Humidity Sensor, Set Point and Occupancy Control",
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
      { name: "setPoint", type: "number", unit: "°C", optional: true },
      { name: "occupancy", type: "boolean", optional: true },
    ],
    config: [
      { name: "setPointCenter", type: "number", unit: "°C", default: 20 },
      { name: "setPointOffset", type: "number", unit: "K", default: 4 },
    ],
  }),
  decode(payload, config = {}) {
    if (!payload || payload.byteLength !== 4) {
      return null;
    }
    const learnBit = getValue(payload, 28, 1) === 0;

    if (learnBit) {
      return { learnBit };
    }

    const { setPointCenter = 20, setPointOffset = 4 } = config;
    const setPointMin = setPointCenter - setPointOffset;
    const setPointMax = setPointCenter + setPointOffset;

    const temperature = parseFloat(
      scale(getValue(payload, 16, 8), [255, 0], [0, 40]).toFixed(1)
    );
    const humidity = parseFloat(
      scale(getValue(payload, 8, 8), [0, 250], [0, 100]).toFixed(1)
    );
    const setPoint = parseFloat(
      scale(
        getValue(payload, 0, 8),
        [0, 255],
        [setPointMin, setPointMax]
      ).toFixed(1)
    );
    const occupancy = getValue(payload, 31, 1) === 0;

    return {
      learnBit,
      temperature,
      humidity,
      setPoint,
      occupancy,
    };
  },
  encode(data, config = {}) {
    const payload = new Uint8Array(4);
    setValue(payload, 1, 28, 1); // data telegram

    const { setPointCenter = 20, setPointOffset = 4 } = config;
    const setPointMin = setPointCenter - setPointOffset;
    const setPointMax = setPointCenter + setPointOffset;

    if (typeof data.temperature === "number") {
      const rawTemp = Math.round(scale(data.temperature, [0, 40], [255, 0]));
      setValue(payload, rawTemp, 16, 8);
    }
    if (typeof data.humidity === "number") {
      const rawHumidity = Math.round(scale(data.humidity, [0, 100], [0, 250]));
      setValue(payload, rawHumidity, 8, 8);
    }
    if (typeof data.setPoint === "number") {
      const rawSetPoint = Math.round(
        scale(data.setPoint, [setPointMin, setPointMax], [0, 255])
      );
      setValue(payload, rawSetPoint, 0, 8);
    }
    if (typeof data.occupancy === "boolean") {
      setValue(payload, data.occupancy ? 0 : 1, 31, 1);
    }

    return payload;
  },
  teachIn(eep) {
    return encodeA5TeachIn({ eep });
  },
};
