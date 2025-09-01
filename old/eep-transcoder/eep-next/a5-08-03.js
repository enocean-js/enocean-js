/**
 * EEP A5-08-03: Light, Temperature, and Occupancy Sensor (Outdoor)
 */
import { scale } from "../utils/scale.js";
import { ByteArray } from "@enocean-js/byte-array";
import { encodeA5TeachIn } from "../utils/teach-in.js";

export const a50803 = {
  meta: {
    eep: "a5-08-03",
    rorg: "a5",
    func: "08",
    type: "03",
    title:
      "Light, Temperature, and Occupancy Sensor (-30°C to +50°C, 0-1530lx)",
    status: "released",
  },
  profile: () => ({
    type: "sensor",
    readings: [
      { name: "illumination", type: "number", unit: "lx" },
      { name: "temperature", type: "number", unit: "°C" },
      { name: "occupancy", type: "boolean" },
      { name: "occupancyButton", type: "boolean" },
      { name: "voltage", type: "number", unit: "V" },
    ],
  }),
  decode: (payload) => {
    if (!payload || payload.length !== 4) return null;
    const learnBit = (payload[3] & 0x08) >> 3 === 0;

    const voltage = parseFloat(
      scale(payload[0], [0, 255], [0, 5.1]).toFixed(1)
    );
    const illumination = parseFloat(
      scale(payload[1], [0, 255], [0, 1530]).toFixed(0)
    );
    const temperature = parseFloat(
      scale(payload[2], [0, 255], [-30, 50]).toFixed(1)
    );
    const occupancy = payload.getValue(30, 1) === 0; // 0 = PIR on
    const occupancyButton = payload.getValue(31, 1) === 1;

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
    const payload = ByteArray.from([0, 0, 0, 0]);

    if (typeof data.voltage === "number") {
      payload[0] = Math.round(scale(data.voltage, [0, 5.1], [0, 255]));
    }
    if (typeof data.illumination === "number") {
      payload[1] = Math.round(scale(data.illumination, [0, 1530], [0, 255]));
    }
    if (typeof data.temperature === "number") {
      payload[2] = Math.round(scale(data.temperature, [-30, 50], [0, 255]));
    }
    if (data.occupancy === false) {
      // 0 = PIR on, so we set the bit if occupancy is false
      payload.setValue(1, 30, 1);
    }
    if (data.occupancyButton) {
      payload.setValue(1, 31, 1);
    }

    // For data telegrams, the learn bit (DB0, bit 3) is always 1.
    payload.setValue(1, 28, 1);

    return payload;
  },
  teachIn: (eep) => {
    return encodeA5TeachIn({ eep });
  },
};
