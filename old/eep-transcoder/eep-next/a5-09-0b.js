/**
 * EEP A5-09-0B: Radioactivity Sensor
 */
import { ByteArray } from "@enocean-js/byte-array";
import { encodeA5TeachIn } from "../utils/teach-in.js";
import { scale } from "../utils/scale.js";

const SCM_ENUM = [
  "0.001",
  "0.01",
  "0.1",
  "1",
  "10",
  "100",
  "1000",
  "10000",
  "100000",
];
const VUNIT_ENUM = ["μSv/h", "cpm", "Bq/L", "Bq/kg"];

export default {
  meta: {
    eep: "a5-09-0b",
    rorg: "a5",
    func: "09",
    type: "0b",
    title: "Radioactivity Sensor",
    status: "released",
  },
  profile: () => ({
    type: "sensor",
    readings: [
      { name: "radioactivity", type: "number" },
      { name: "voltage", type: "number", unit: "V" },
    ],
  }),
  decode: (payload) => {
    if (!payload || payload.length !== 4) {
      return null;
    }
    const data = new ByteArray(payload);
    const learnBit = data.getValue(28, 1) === 0;

    const supplyVoltageAvailable = data.getValue(31, 1) === 1;
    const scmIndex = data.getValue(24, 4);
    const vunitIndex = data.getValue(29, 2);
    const rawRadioactivity = data.getValue(8, 16);
    const multiplier = parseFloat(SCM_ENUM[scmIndex]);
    const radioactivity = parseFloat(
      (scale(rawRadioactivity, [0, 65535], [0, 6553]) * multiplier).toFixed(3)
    );

    let voltage = null;
    if (supplyVoltageAvailable) {
      voltage = parseFloat(
        scale(data.getValue(0, 4), [0, 15], [2.0, 5.0]).toFixed(1)
      );
    }

    return {
      learnBit,
      radioactivity,
      unit: VUNIT_ENUM[vunitIndex],
      voltage,
    };
  },
  encode(data) {
    const payload = new ByteArray(4);
    payload.setValue(1, 28, 1); // data telegram

    if (typeof data.voltage === "number") {
      payload.setValue(1, 31, 1);
      const scaledSV = Math.round(scale(data.voltage, [2.0, 5.0], [0, 15]));
      payload.setValue(scaledSV, 0, 4);
    } else {
      payload.setValue(0, 31, 1);
    }

    const vunitIndex = VUNIT_ENUM.indexOf(data.unit);
    payload.setValue(vunitIndex !== -1 ? vunitIndex : 0, 29, 2); // Default to 'μSv/h'

    if (typeof data.radioactivity === "number") {
      // Auto-detect best scale multiplier
      let scmIndex = SCM_ENUM.findIndex(
        (m) => data.radioactivity / parseFloat(m) <= 6553
      );
      if (scmIndex === -1) {
        scmIndex = SCM_ENUM.length - 1; // Use largest multiplier if value is too big
      }
      payload.setValue(scmIndex, 24, 4);

      const multiplier = parseFloat(SCM_ENUM[scmIndex]);
      const scaledRadioactivity = Math.round(
        scale(data.radioactivity / multiplier, [0, 6553], [0, 65535])
      );
      payload.setValue(scaledRadioactivity, 8, 16);
    }

    return payload;
  },
  teachIn(eep) {
    return encodeA5TeachIn({ eep });
  },
};
