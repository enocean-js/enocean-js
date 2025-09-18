/**
 * EEP A5-10-03: Temperature Sensor, Set Point Control
 */
import {
  scale,
  setValue,
  getValue,
  checkAndThrow,
  DIRECTION_IN,
} from "@enocean-js/utils";

export const meta = {
  version: "1.0.0",
  eep: "a5-10-03",
  rorg: "a5",
  func: "10",
  type: "03",
  title: "Temperature Sensor, Set Point Control",
  communication_type: "uni",
};
export const SPEC = {
  meta,
  profile: (direction) => {
    const IN = {
      meta,
      props: [
        {
          name: "setPoint",
          type: "number",
          min: 0,
          max: 255,
          read: true,
          write: false,
          role: "value",
        },
        {
          name: "temperature",
          type: "number",
          unit: "°C",
          min: 0,
          max: 40,
          read: true,
          write: false,
          role: "value.temperature",
        },
      ],
    };

    const OUT = {
      meta,
      props: [
        {
          name: "setPoint",
          type: "number",
          min: 0,
          max: 255,
          read: false,
          write: true,
          role: "level.temperature",
          unit: "",
        },
        {
          name: "temperature",
          type: "number",
          unit: "°C",
          min: 0,
          max: 40,
          read: false,
          write: true,
          role: "value.temperature",
        },
      ],
    };
    return direction === DIRECTION_IN ? IN : OUT;
  },
  decode: (payload) => {
    checkAndThrow(payload, 4);
    const rawSetPoint = getValue(payload, 8, 8);
    const rawTemperature = getValue(payload, 16, 8);
    // Set point: linear 0...255
    // Temperature: linear 255...0 maps to 0...40°C
    return {
      setPoint: rawSetPoint,
      temperature: parseFloat(
        scale(rawTemperature, [255, 0], [0, 40]).toFixed(1)
      ),
    };
  },
  encode: (data) => {
    let payload = new Uint8Array(4);
    // Set point: direct mapping
    if (typeof data.setPoint === "number") {
      payload = setValue(payload, data.setPoint, 8, 8);
    }
    if (typeof data.temperature === "number") {
      // Temperature: scale 0...40°C to 255...0
      const rawTemp = Math.round(scale(data.temperature, [0, 40], [255, 0]));
      payload = setValue(payload, rawTemp, 16, 8);
    }

    payload = setValue(payload, 1, 28, 1);

    return payload;
  },
};
