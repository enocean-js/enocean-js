/**
 * EEP A5-04-03: Temperature and Humidity Sensor (-20°C to +60°C, 10-bit)
 */
import { scale } from "../utils/scale";
import { ByteArray } from "@enocean-js/byte-array";
import { encodeA5TeachIn } from "../utils/teach-in";

export const a50403 = {
  meta: {
    eep: "a5-04-03",
    rorg: "a5",
    func: "04",
    type: "03",
    title: "Temp. and Humidity Sensor (-20°C to +60°C, 10-bit)",
    status: "released",
  },
  profile: () => ({
    type: "sensor",
    readings: [
      { name: "temperature", type: "number", unit: "°C", min: -20, max: 60 },
      { name: "humidity", type: "number", unit: "%", min: 0, max: 100 },
      { name: "telegramType", type: "string" },
    ],
  }),
  decode: (payload) => {
    if (!payload || payload.length !== 4) return null;
    const rawHumidity = payload.getValue(0, 8);
    const rawTemperature = payload.getValue(14, 10);
    const learnBit = payload.getValue(27, 1) === 0;
    const telegramType = payload.getValue(24, 1) === 0 ? "heartbeat" : "event";

    return {
      learnBit,
      telegramType,
      temperature: parseFloat(
        scale(rawTemperature, [0, 1023], [-20, 60]).toFixed(2)
      ),
      humidity: parseFloat(scale(rawHumidity, [0, 255], [0, 100]).toFixed(1)),
    };
  },
  encode: (data) => {
    const payload = ByteArray.from([0, 0, 0, 0]);

    if (typeof data.temperature === "number") {
      const rawTemperature = Math.round(
        scale(data.temperature, [-20, 60], [0, 1023])
      );
      payload.setValue(rawTemperature, 14, 10);
    }

    if (typeof data.humidity === "number") {
      const rawHumidity = Math.round(scale(data.humidity, [0, 100], [0, 255]));
      payload.setValue(rawHumidity, 0, 8);
    }

    if (data.telegramType === "event") {
      payload.setValue(1, 24, 1);
    }

    // For data telegrams, the learn bit (DB0, bit 3) is always 1.
    payload.setValue(1, 27, 1);

    return payload;
  },
  teachIn: (eep) => {
    return encodeA5TeachIn({ eep });
  },
};
