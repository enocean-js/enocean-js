/**
 * EEP A5-04-02: Temperature and Humidity Sensor (-20°C to +60°C and 0% to 100%)
 */
import { scale } from "../utils/scale";
import { ByteArray } from "@enocean-js/byte-array";
import { encodeA5TeachIn } from "../utils/teach-in";

export const a50402 = {
  meta: {
    eep: "a5-04-02",
    rorg: "a5",
    func: "04",
    type: "02",
    title: "Temp. and Humidity Sensor (-20°C to +60°C, 0% to 100%)",
    status: "released",
  },
  profile: () => ({
    type: "sensor",
    readings: [
      {
        name: "temperature",
        type: "number",
        unit: "°C",
        optional: true,
        min: -20,
        max: 60,
      },
      { name: "humidity", type: "number", unit: "%", min: 0, max: 100 },
    ],
  }),
  decode: (payload) => {
    if (!payload || payload.length !== 4) return null;
    const rawHumidity = payload.getValue(8, 8);
    const rawTemperature = payload.getValue(16, 8);
    const learnBit = payload.getValue(27, 1) === 0;
    const tempSensorAvailable = payload.getValue(25, 1) === 1;

    const decoded = { learnBit };

    if (tempSensorAvailable) {
      decoded.temperature = parseFloat(
        scale(rawTemperature, [0, 250], [-20, 60]).toFixed(1)
      );
    }

    decoded.humidity = parseFloat(
      scale(rawHumidity, [0, 250], [0, 100]).toFixed(1)
    );

    return decoded;
  },
  encode: (data) => {
    const payload = ByteArray.from([0, 0, 0, 0]);

    if (typeof data.temperature === "number") {
      const rawTemperature = Math.round(
        scale(data.temperature, [-20, 60], [0, 250])
      );
      payload.setValue(rawTemperature, 16, 8);
      payload.setValue(1, 25, 1); // Set T-Sensor available bit
    }

    if (typeof data.humidity === "number") {
      const rawHumidity = Math.round(scale(data.humidity, [0, 100], [0, 250]));
      payload.setValue(rawHumidity, 8, 8);
    }

    // For data telegrams, the learn bit (DB0, bit 3) is always 1.
    payload.setValue(1, 27, 1);

    return payload;
  },
  teachIn: (eep) => {
    return encodeA5TeachIn({ eep });
  },
};
