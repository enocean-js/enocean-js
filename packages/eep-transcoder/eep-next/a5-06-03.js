/**
 * EEP A5-06-03: Light Sensor (0 to 1000lx, 10-bit)
 */
import { scale } from "../utils/scale.js";
import { getValue, setValue } from "../utils/byte-helpers";
import { encodeA5TeachIn } from "../utils/teach-in.js";

export const a50603 = {
  meta: {
    eep: "a5-06-03",
    rorg: "a5",
    func: "06",
    type: "03",
    title: "Light Sensor (0 to 1000lx, 10-bit)",
    status: "released",
  },
  profile: () => ({
    type: "sensor",
    readings: [
      {
        name: "illumination",
        type: "number",
        unit: "lx",
        min: 0,
        max: 1000,
        optional: true,
      },
      {
        name: "voltage",
        type: "number",
        unit: "V",
        min: 0,
        max: 5.0,
        optional: true,
      },
    ],
  }),
  decode: (payload) => {
    if (!payload || payload.byteLength !== 4) return null;
    const learnBit = getValue(payload, 28, 1) === 0;

    const rawVoltage = payload[0];
    let voltage = null;
    if (rawVoltage <= 250) {
      voltage = parseFloat(scale(rawVoltage, [0, 250], [0, 5.0]).toFixed(1));
    }

    const rawIllumination = getValue(payload, 8, 10);
    let illumination = rawIllumination;
    if (rawIllumination === 1001) {
      illumination = "over range";
    }

    return {
      learnBit,
      illumination,
      voltage,
    };
  },
  encode: (data) => {
    const payload = new Uint8Array(4);

    if (typeof data.voltage === "number") {
      const rawVoltage = Math.round(scale(data.voltage, [0, 5.0], [0, 250]));
      payload[0] = rawVoltage;
    }

    if (data.illumination === "over range") {
      setValue(payload, 1001, 8, 10);
    } else if (typeof data.illumination === "number") {
      setValue(payload, data.illumination, 8, 10);
    }

    // For data telegrams, the learn bit (DB0, bit 3) is always 1.
    setValue(payload, 1, 28, 1);

    return payload;
  },
  teachIn: (eep) => {
    return encodeA5TeachIn({ eep });
  },
};
