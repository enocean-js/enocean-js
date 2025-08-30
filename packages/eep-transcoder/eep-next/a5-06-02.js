/**
 * EEP A5-06-02: Light Sensor with dual ranges (0-1020lx)
 */
import { scale } from "../utils/scale.js";
import { ByteArray } from "@enocean-js/byte-array";
import { encodeA5TeachIn } from "../utils/teach-in.js";

export const a50602 = {
  meta: {
    eep: "a5-06-02",
    rorg: "a5",
    func: "06",
    type: "02",
    title: "Light Sensor (0 to 1,020lx)",
    status: "released",
  },
  profile: () => ({
    type: "sensor",
    readings: [
      { name: "illumination", type: "number", unit: "lx" },
      { name: "voltage", type: "number", unit: "V" },
    ],
  }),
  decode: (payload) => {
    if (!payload || payload.length !== 4) return null;
    const learnBit = (payload[3] & 0x08) >> 3 === 0;
    const rangeSelect = (payload[3] & 0x01) === 1;

    const voltage = parseFloat(
      scale(payload[0], [0, 255], [0, 5.1]).toFixed(1)
    );

    let illumination;
    if (rangeSelect) {
      // Range is 0...510 lx
      illumination = parseFloat(
        scale(payload[1], [0, 255], [0, 510]).toFixed(0)
      );
    } else {
      // Range is 0...1020 lx
      illumination = parseFloat(
        scale(payload[2], [0, 255], [0, 1020]).toFixed(0)
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
      payload[0] = rawVoltage;
    }

    if (typeof data.illumination === "number") {
      // Automatically select the best range
      if (data.illumination <= 510) {
        // Use range 0...510 lx
        payload[3] |= 0x01;
        const rawIllumination = Math.round(
          scale(data.illumination, [0, 510], [0, 255])
        );
        payload[1] = rawIllumination;
      } else {
        // Use range 0...1020 lx
        const rawIllumination = Math.round(
          scale(data.illumination, [0, 1020], [0, 255])
        );
        payload[2] = rawIllumination;
      }
    }

    // For data telegrams, the learn bit (DB0, bit 3) is always 1.
    payload.setValue(1, 28, 1);

    return payload;
  },
  teachIn: (eep) => {
    return encodeA5TeachIn({ eep });
  },
};
