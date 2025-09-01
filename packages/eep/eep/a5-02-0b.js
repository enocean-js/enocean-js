/**
 * EEP A5-02-0B: Temperature Sensor (+60°C to +100°C)
 */
import { scale, getValue, setValue, checkAndThrow } from "@enocean-js/utils";

export const a5020b = {
  meta: {
    eep: "a5-02-0b",
    rorg: "a5",
    func: "02",
    type: "0b",
    title: "Temperature Sensor (+60°C to +100°C)",
  },
  profile: () => ({
    type: "sensor",
    readings: [
      { name: "temperature", type: "number", unit: "°C", min: 60, max: 100 },
    ],
  }),
  decode: (payload) => {
    // check if payload is valid, otherwise throw an Error
    checkAndThrow(payload, 4);
    const rawTemperature = getValue(payload, 16, 8);
    const isTeachIn = getValue(payload, 28, 1) === 0;

    return {
      temperature: parseFloat(
        scale(rawTemperature, [255, 0], [60, 100]).toFixed(1)
      ),
      isTeachIn,
    };
  },
  encode: (data) => {
    let payload = new Uint8Array(4);
    const rawTemperature = Math.round(
      scale(data.temperature, [60, 100], [255, 0])
    );

    payload = setValue(payload, rawTemperature, 16, 8);

    // For data telegrams, the learn bit (DB0, bit 3) is always 1.
    payload = setValue(payload, 1, 28, 1);

    return payload;
  },
};
