/**
 * EEP a5-02-02: Temperature Sensor (-30°C to +10°C)
 */

import { scale, getValue, setValue, checkAndThrow } from "@enocean-js/utils";
export const a50202 = {
  meta: {
    eep: "a5-02-02",
    rorg: "a5",
    func: "02",
    type: "02",
    title: "Temperature Sensor (-30°C to +10°C)",
    status: "released",
  },
  profile: () => ({
    type: "sensor",
    readings: [
      {
        name: "temperature",
        type: "number",
        unit: "°C",
        min: -30,
        max: 10,
        optional: true,
      },
    ],
  }),
  decode: (payload) => {
    // check if payload is valid, otherwise throw an Error
    checkAndThrow(payload, 4);
    const rawTemperature = getValue(payload, 16, 8);
    const isTeachIn = getValue(payload, 28, 1) === 0;

    return {
      temperature: parseFloat(
        scale(rawTemperature, [255, 0], [-30, 10]).toFixed(1)
      ),
      isTeachIn,
    };
  },
  encode: (data) => {
    let payload = new Uint8Array(4);
    // remap temperature to raw value
    const rawTemperature = Math.round(
      scale(data.temperature, [-30, 10], [255, 0])
    );
    // encode raw temperature
    payload = setValue(payload, rawTemperature, 16, 8);
    // set learn bit to 1 for data telegrams
    payload = setValue(payload, 1, 28, 1);
    return payload;
  },
};
