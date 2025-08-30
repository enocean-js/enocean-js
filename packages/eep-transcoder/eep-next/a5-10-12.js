/**
 * EEP A5-10-12: Temperature and Humidity Sensor and Set Point
 */
import { ByteArray } from "@enocean-js/byte-array";
import { encodeA5TeachIn } from "../utils/teach-in.js";
import { scale } from "../utils/scale.js";

export default {
  meta: {
    eep: "a5-10-12",
    rorg: "a5",
    func: "10",
    type: "12",
    title: "Temperature and Humidity Sensor and Set Point",
    status: "released",
  },
  profile: () => ({
    type: "room-operating-panel",
    readings: [
      { name: "temperature", type: "number", unit: "°C", min: 0, max: 40 },
      { name: "humidity", type: "number", unit: "%", min: 0, max: 100 },
      { name: "setPoint", type: "number", unit: "°C", min: 16, max: 24 },
    ],
    config: [
      { name: "setPointCenter", type: "number", unit: "°C", default: 20 },
      { name: "setPointOffset", type: "number", unit: "K", default: 4 },
    ],
  }),
  decode(payload, config = {}) {
    if (!payload || payload.length !== 4) {
      return null;
    }
    const data = new ByteArray(payload);
    const learnBit = data.getValue(28, 1) === 0;

    if (learnBit) {
      return { learnBit };
    }

    const { setPointCenter = 20, setPointOffset = 4 } = config;
    const setPointMin = setPointCenter - setPointOffset;
    const setPointMax = setPointCenter + setPointOffset;

    const temperature = parseFloat(
      scale(data.getValue(16, 8), [255, 0], [0, 40]).toFixed(1)
    );
    const humidity = parseFloat(
      scale(data.getValue(8, 8), [0, 250], [0, 100]).toFixed(1)
    );
    const setPoint = parseFloat(
      scale(data.getValue(0, 8), [0, 255], [setPointMin, setPointMax]).toFixed(
        1
      )
    );

    return {
      learnBit,
      temperature,
      humidity,
      setPoint,
    };
  },
  encode(data, config = {}) {
    const payload = new ByteArray(4);
    payload.setValue(1, 28, 1); // data telegram

    const { setPointCenter = 20, setPointOffset = 4 } = config;
    const setPointMin = setPointCenter - setPointOffset;
    const setPointMax = setPointCenter + setPointOffset;

    if (typeof data.temperature === "number") {
      const rawTemp = Math.round(scale(data.temperature, [0, 40], [255, 0]));
      payload.setValue(rawTemp, 16, 8);
    }
    if (typeof data.humidity === "number") {
      const rawHumidity = Math.round(scale(data.humidity, [0, 100], [0, 250]));
      payload.setValue(rawHumidity, 8, 8);
    }
    if (typeof data.setPoint === "number") {
      const rawSetPoint = Math.round(
        scale(data.setPoint, [setPointMin, setPointMax], [0, 255])
      );
      payload.setValue(rawSetPoint, 0, 8);
    }

    return payload;
  },
  teachIn(eep) {
    return encodeA5TeachIn({ eep });
  },
};
