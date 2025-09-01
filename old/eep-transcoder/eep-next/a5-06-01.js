/**
 * EEP A5-06-01: Light Sensor with dual ranges
 */
import { scale } from "../utils/scale.js";
import { ByteArray } from "@enocean-js/byte-array";
import { encodeA5TeachIn } from "../utils/teach-in.js";

export const a50601 = {
  meta: {
    eep: "a5-06-01",
    rorg: "a5",
    func: "06",
    type: "01",
    title: "Light Sensor (300 to 60,000lx)",
    status: "released",
  },
  profile: () => ({
    type: "sensor",
    readings: [
      {
        name: "illumination",
        type: "number",
        unit: "lx",
        min: 300,
        max: 60000,
      },
      { name: "voltage", type: "number", unit: "V", min: 0, max: 5.1 },
    ],
  }),
  decode: (payload) => {
    if (!payload || payload.length !== 4) return null;
    const learnBit = payload.getValue(27, 1) === 0;
    const rangeSelect = payload.getValue(24, 1) === 1;

    const voltage = parseFloat(
      scale(payload.getValue(0, 8), [0, 255], [0, 5.1]).toFixed(1)
    );

    let illumination;
    if (rangeSelect) {
      // Range is 300...30000 lx
      illumination = parseFloat(
        scale(payload.getValue(8, 8), [0, 255], [300, 30000]).toFixed(0)
      );
    } else {
      // Range is 600...60000 lx
      illumination = parseFloat(
        scale(payload.getValue(16, 8), [0, 255], [600, 60000]).toFixed(0)
      );
    }

    return {
      learnBit,
      illumination,
      voltage,
    };
  },
  encode: (data) => {
    const payload = ByteArray.from([0, 0, 0, 0]);

    if (typeof data.voltage === "number") {
      const rawVoltage = Math.round(scale(data.voltage, [0, 5.1], [0, 255]));
      payload.setValue(rawVoltage, 0, 8);
    }

    if (typeof data.illumination === "number") {
      // Automatically select the best range
      if (data.illumination <= 30000) {
        // Use range 300...30000 lx
        payload.setValue(1, 24, 1);
        const rawIllumination = Math.round(
          scale(data.illumination, [300, 30000], [0, 255])
        );
        payload.setValue(rawIllumination, 8, 8);
      } else {
        // Use range 600...60000 lx
        const rawIllumination = Math.round(
          scale(data.illumination, [600, 60000], [0, 255])
        );
        payload.setValue(rawIllumination, 16, 8);
      }
    }

    // For data telegrams, the learn bit (DB0, bit 3) is always 1.
    payload.setValue(1, 27, 1);

    return payload;
  },
  teachIn: (eep) => {
    return encodeA5TeachIn({ eep });
  },
};
