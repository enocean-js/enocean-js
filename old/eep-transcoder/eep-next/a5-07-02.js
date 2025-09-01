/**
 * EEP A5-07-02: Occupancy Sensor with Supply Voltage Monitor
 */
import { scale } from "../utils/scale.js";
import { getValue, setValue } from "../utils/byte-helpers";
import { encodeA5TeachIn } from "../utils/teach-in.js";

export const a50702 = {
  meta: {
    eep: "a5-07-02",
    rorg: "a5",
    func: "07",
    type: "02",
    title: "Occupancy Sensor with Supply voltage monitor",
    status: "released",
  },
  profile: () => ({
    type: "sensor",
    readings: [
      { name: "occupancy", type: "boolean", optional: true },
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
    const occupancy = getValue(payload, 24, 1) === 1;

    const rawVoltage = payload[0];
    let voltage = null;
    if (rawVoltage <= 250) {
      voltage = parseFloat(scale(rawVoltage, [0, 250], [0, 5.0]).toFixed(1));
    }

    return {
      learnBit,
      occupancy,
      voltage,
    };
  },
  encode: (data) => {
    const payload = new Uint8Array(4);

    if (data.occupancy) {
      setValue(payload, 1, 24, 1); // Motion detected
    } else {
      setValue(payload, 0, 24, 1); // Uncertain
    }

    if (typeof data.voltage === "number") {
      const rawVoltage = Math.round(scale(data.voltage, [0, 5.0], [0, 250]));
      payload[0] = rawVoltage;
    }

    // For data telegrams, the learn bit (DB0, bit 3) is always 1.
    setValue(payload, 1, 28, 1);

    return payload;
  },
  teachIn: (eep) => {
    return encodeA5TeachIn({ eep });
  },
};
