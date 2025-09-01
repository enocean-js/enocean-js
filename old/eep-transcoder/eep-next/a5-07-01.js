/**
 * EEP A5-07-01: Occupancy Sensor with Supply Voltage Monitor
 */
import { scale } from "../utils/scale.js";
import { getValue, setValue } from "../utils/byte-helpers";
import { encodeA5TeachIn } from "../utils/teach-in.js";

export const a50701 = {
  meta: {
    eep: "a5-07-01",
    rorg: "a5",
    func: "07",
    type: "01",
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
        optional: true,
        min: 0,
        max: 5.0,
      },
    ],
  }),
  decode: (payload) => {
    if (!payload || payload.byteLength !== 4) return null;
    const learnBit = getValue(payload, 28, 1) === 0;
    const voltageAvailable = getValue(payload, 31, 1) === 1;

    const occupancy = getValue(payload, 16, 8) >= 128;

    let voltage = null;
    if (voltageAvailable) {
      const rawVoltage = getValue(payload, 0, 8);
      if (rawVoltage <= 250) {
        voltage = parseFloat(scale(rawVoltage, [0, 250], [0, 5.0]).toFixed(1));
      }
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
      setValue(payload, 0xff, 16, 8); // PIR on
    } else {
      setValue(payload, 0, 16, 8); // PIR off
    }

    if (typeof data.voltage === "number") {
      setValue(payload, 1, 31, 1); // Set voltage availability bit
      const rawVoltage = Math.round(scale(data.voltage, [0, 5.0], [0, 250]));
      setValue(payload, rawVoltage, 0, 8);
    }

    // For data telegrams, the learn bit (DB0, bit 3) is always 1.
    setValue(payload, 1, 28, 1);

    return payload;
  },
  teachIn: (eep) => {
    return encodeA5TeachIn({ eep });
  },
};
