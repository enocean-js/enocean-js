/**
 * EEP A5-10-04: Temperature Sensor, Set Point and Fan Speed Control
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
    eep: "a5-10-04",
    rorg: "a5",
    func: "10",
    type: "04",
    title: "Temperature Sensor, Set Point and Fan Speed Control",
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
      { name: "setPoint", type: "number", unit: "°C", optional: true },
      {
        name: "fanSpeed",
        type: "string",
        values: Object.keys(FAN_SPEED_STAGES),
        optional: true,
      },
    ],
    config: [
      { name: "setPointCenter", type: "number", unit: "°C", default: 20 },
      { name: "setPointOffset", type: "number", unit: "K", default: 4 },
    ],
  }),
  decode(payload, config = {}) {
    if (!payload || payload.byteLength !== 4) {
      return null;
    }
    const learnBit = getValue(payload, 28, 1) === 0;

    if (learnBit) {
      return { learnBit };
    }

    const { setPointCenter = 20, setPointOffset = 4 } = config;
    const setPointMin = setPointCenter - setPointOffset;
    const setPointMax = setPointCenter + setPointOffset;

    const temperature = parseFloat(
      scale(getValue(payload, 16, 8), [255, 0], [0, 40]).toFixed(1)
    );
    const setPoint = parseFloat(
      scale(
        getValue(payload, 8, 8),
        [0, 255],
        [setPointMin, setPointMax]
      ).toFixed(1)
    );
    const fanSpeed = decodeValueFromRangeMap(
      getValue(payload, 0, 8),
      FAN_SPEED_STAGES
    );

    return {
      learnBit,
      temperature,
      setPoint,
      fanSpeed,
    };
  },
  encode(data, config = {}) {
    const payload = new Uint8Array(4);
    setValue(payload, 1, 28, 1); // data telegram

    const { setPointCenter = 20, setPointOffset = 4 } = config;
    const setPointMin = setPointCenter - setPointOffset;
    const setPointMax = setPointCenter + setPointOffset;

    if (typeof data.temperature === "number") {
      const rawTemp = Math.round(scale(data.temperature, [0, 40], [255, 0]));
      setValue(payload, rawTemp, 16, 8);
    }
    if (typeof data.setPoint === "number") {
      const rawSetPoint = Math.round(
        scale(data.setPoint, [setPointMin, setPointMax], [0, 255])
      );
      setValue(payload, rawSetPoint, 8, 8);
    }
    if (typeof data.fanSpeed === "string") {
      const rawFanSpeed = encodeValueFromRangeMap(
        data.fanSpeed,
        FAN_SPEED_STAGES,
        232
      ); // Default to 'Stage Auto'
      setValue(payload, rawFanSpeed, 0, 8);
    }

    return payload;
  },
  teachIn(eep) {
    return encodeA5TeachIn({ eep });
  },
};
