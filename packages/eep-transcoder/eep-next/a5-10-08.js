/**
 * EEP A5-10-08: Temperature Sensor, Fan Speed and Occupancy Control
 */
import { getValue, setValue } from "../utils/byte-helpers";
import { encodeA5TeachIn } from "../utils/teach-in.js";
import { scale } from "../utils/scale.js";
import {
  decodeValueFromRangeMap,
  encodeValueFromRangeMap,
} from "../utils/range-map.js";

const FAN_SPEED_STAGES = {
  "Stage 3": [0, 144],
  "Stage 2": [145, 164],
  "Stage 1": [165, 189],
  "Stage 0": [190, 209],
  "Stage Auto": [210, 255],
};

export default {
  meta: {
    eep: "a5-10-08",
    rorg: "a5",
    func: "10",
    type: "08",
    title: "Temperature Sensor, Fan Speed and Occupancy Control",
    status: "released",
  },
  profile: () => ({
    type: "room-operating-panel",
    readings: [
      {
        name: "temperature",
        type: "number",
        unit: "°C",
        min: 0,
        max: 40,
        optional: true,
      },
      {
        name: "fanSpeed",
        type: "string",
        values: Object.keys(FAN_SPEED_STAGES),
        optional: true,
      },
      { name: "occupancy", type: "boolean", optional: true },
    ],
  }),
  decode(payload) {
    if (!payload || payload.byteLength !== 4) {
      return null;
    }
    const learnBit = getValue(payload, 28, 1) === 0;

    if (learnBit) {
      return { learnBit };
    }

    const temperature = parseFloat(
      scale(getValue(payload, 16, 8), [255, 0], [0, 40]).toFixed(1)
    );
    const fanSpeed = decodeValueFromRangeMap(
      getValue(payload, 0, 8),
      FAN_SPEED_STAGES
    );
    const occupancy = getValue(payload, 31, 1) === 0;

    return {
      learnBit,
      temperature,
      fanSpeed,
      occupancy,
    };
  },
  encode(data) {
    const payload = new Uint8Array(4);
    setValue(payload, 1, 28, 1); // data telegram

    if (typeof data.temperature === "number") {
      const rawTemp = Math.round(scale(data.temperature, [0, 40], [255, 0]));
      setValue(payload, rawTemp, 16, 8);
    }
    if (typeof data.fanSpeed === "string") {
      const rawFanSpeed = encodeValueFromRangeMap(
        data.fanSpeed,
        FAN_SPEED_STAGES,
        232
      ); // Default to 'Stage Auto'
      setValue(payload, rawFanSpeed, 0, 8);
    }
    if (typeof data.occupancy === "boolean") {
      setValue(payload, data.occupancy ? 0 : 1, 31, 1);
    }

    return payload;
  },
  teachIn(eep) {
    return encodeA5TeachIn({ eep });
  },
};
