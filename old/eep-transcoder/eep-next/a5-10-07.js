/**
 * EEP A5-10-07: Temperature Sensor, Fan Speed Control
 */
import { ByteArray } from "@enocean-js/byte-array";
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
    eep: "a5-10-07",
    rorg: "a5",
    func: "10",
    type: "07",
    title: "Temperature Sensor, Fan Speed Control",
    status: "released",
  },
  profile: () => ({
    type: "room-operating-panel",
    readings: [
      { name: "temperature", type: "number", unit: "°C", min: 0, max: 40 },
      { name: "fanSpeed", type: "string" },
    ],
  }),
  decode: (payload) => {
    if (!payload || payload.length !== 4) {
      return null;
    }
    const data = new ByteArray(payload);
    const learnBit = data.getValue(28, 1) === 0;

    if (learnBit) {
      return { learnBit };
    }

    const temperature = parseFloat(
      scale(data.getValue(16, 8), [255, 0], [0, 40]).toFixed(1)
    );
    const fanSpeed = decodeValueFromRangeMap(
      data.getValue(0, 8),
      FAN_SPEED_STAGES
    );

    return {
      learnBit,
      temperature,
      fanSpeed,
    };
  },
  encode(data) {
    const payload = new ByteArray(4);
    payload.setValue(1, 28, 1); // data telegram

    if (typeof data.temperature === "number") {
      const rawTemp = Math.round(scale(data.temperature, [0, 40], [255, 0]));
      payload.setValue(rawTemp, 16, 8);
    }
    if (typeof data.fanSpeed === "string") {
      const rawFanSpeed = encodeValueFromRangeMap(
        data.fanSpeed,
        FAN_SPEED_STAGES,
        232
      ); // Default to 'Stage Auto'
      payload.setValue(rawFanSpeed, 0, 8);
    }

    return payload;
  },
  teachIn(eep) {
    return encodeA5TeachIn({ eep });
  },
};
