/**
 * EEP A5-09-04: CO2 Sensor
 */
import { scale } from "../utils/scale.js";
import { ByteArray } from "@enocean-js/byte-array";
import { encodeA5TeachIn } from "../utils/teach-in.js";

export const a50904 = {
  meta: {
    eep: "a5-09-04",
    rorg: "a5",
    func: "09",
    type: "04",
    title: "CO2 Sensor",
    status: "released",
  },
  profile: () => ({
    type: "sensor",
    readings: [
      {
        name: "concentration",
        type: "number",
        unit: "ppm",
        min: 0,
        max: 2550,
      },
      {
        name: "temperature",
        type: "number",
        unit: "°C",
        optional: true,
        min: 0,
        max: 51.0,
      },
      {
        name: "humidity",
        type: "number",
        unit: "%",
        optional: true,
        min: 0,
        max: 100,
      },
    ],
  }),
  decode: (payload) => {
    if (!payload || payload.length !== 4) return null;
    const learnBit = payload.getValue(27, 1) === 0;
    const tempAvailable = payload.getValue(26, 1) === 1;
    const humidityAvailable = payload.getValue(25, 1) === 1;

    const concentration = parseFloat(
      scale(payload.getValue(8, 8), [0, 255], [0, 2550]).toFixed(0)
    );

    let temperature = null;
    if (tempAvailable) {
      temperature = parseFloat(
        scale(payload.getValue(16, 8), [0, 255], [0, 51.0]).toFixed(1)
      );
    }

    let humidity = null;
    if (humidityAvailable) {
      humidity = parseFloat(
        scale(payload.getValue(0, 8), [0, 200], [0, 100]).toFixed(1)
      );
    }

    return {
      learnBit,
      concentration,
      temperature,
      humidity,
    };
  },
  encode: (data) => {
    const payload = ByteArray.from([0, 0, 0, 0]);

    if (typeof data.concentration === "number") {
      payload.setValue(
        Math.round(scale(data.concentration, [0, 2550], [0, 255])),
        8,
        8
      );
    }
    if (typeof data.temperature === "number") {
      payload.setValue(1, 26, 1); // Set temp available bit
      payload.setValue(
        Math.round(scale(data.temperature, [0, 51.0], [0, 255])),
        16,
        8
      );
    }
    if (typeof data.humidity === "number") {
      payload.setValue(1, 25, 1); // Set humidity available bit
      payload.setValue(
        Math.round(scale(data.humidity, [0, 100], [0, 200])),
        0,
        8
      );
    }

    // For data telegrams, the learn bit (DB0, bit 3) is always 1.
    payload.setValue(1, 27, 1);

    return payload;
  },
  teachIn: (eep) => {
    return encodeA5TeachIn({ eep });
  },
};
