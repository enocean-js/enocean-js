/**
 * EEP A5-02-05: Temperature Sensor (-10°C to +30°C)
 */
import { scale, getValue, setValue, checkAndThrow } from "@enocean-js/utils";

export const a50205 = {
  meta: {
    eep: "a5-02-05",
    rorg: "a5",
    func: "02",
    type: "05",
    title: "Temperature Sensor (0°C to +40°C)",
    status: "released",
  },
  profile: () => ({
    type: "sensor",
    readings: [
      { name: "temperature", type: "number", unit: "°C", min: 0, max: 40 },
    ],
  }),
  decode: (payload) => {
    checkAndThrow(payload, 4);
    const rawTemperature = getValue(payload, 16, 8);
    const isTeachIn = getValue(payload, 28, 1) === 0;

    return {
      temperature: parseFloat(
        scale(rawTemperature, [255, 0], [0, 40]).toFixed(1)
      ),
      isTeachIn,
    };
  },
  encode: (data) => {
    let payload = new Uint8Array(4);
    const rawTemperature = Math.round(
      scale(data.temperature, [0, 40], [255, 0])
    );

    payload = setValue(payload, rawTemperature, 16, 8);
    // For data telegrams, the learn bit (DB0, bit 3) is always 1.
    payload = setValue(payload, 1, 28, 1);

    return payload;
  },
};
