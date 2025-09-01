/**
 * EEP A5-02-1A: Temperature Sensor (+40°C to +120°C)
 */
import { scale, getValue, setValue, checkAndThrow } from "@enocean-js/utils";

export const a5021a = {
  meta: {
    eep: "a5-02-1a",
    rorg: "a5",
    func: "02",
    type: "1a",
    title: "Temperature Sensor (+40°C to +120°C)",
  },
  profile: () => ({
    type: "sensor",
    readings: [
      { name: "temperature", type: "number", unit: "°C", min: 40, max: 120 },
    ],
  }),
  decode: (payload) => {
    // check if payload is valid, otherwise throw an Error
    checkAndThrow(payload, 4);
    const rawTemperature = getValue(payload, 16, 8);
    const isTeachIn = getValue(payload, 28, 1) === 0;

    return {
      temperature: parseFloat(
        scale(rawTemperature, [255, 0], [40, 120]).toFixed(1)
      ),
      isTeachIn,
    };
  },
  encode: (data) => {
    let payload = new Uint8Array(4);
    const rawTemperature = Math.round(
      scale(data.temperature, [40, 120], [255, 0])
    );

    payload = setValue(payload, rawTemperature, 16, 8);

    // For data telegrams, the learn bit (DB0, bit 3) is always 1.
    payload = setValue(payload, 1, 28, 1);

    return payload;
  },
};
