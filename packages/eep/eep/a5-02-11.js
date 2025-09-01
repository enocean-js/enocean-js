/**
 * EEP A5-02-11: Temperature Sensor (-50°C to +30°C)
 */
import { scale, getValue, setValue, checkAndThrow } from "@enocean-js/utils";

export const a50211 = {
  meta: {
    eep: "a5-02-11",
    rorg: "a5",
    func: "02",
    type: "11",
    title: "Temperature Sensor (-50°C to +30°C)",
    status: "released",
  },
  profile: () => ({
    type: "sensor",
    readings: [
      { name: "temperature", type: "number", unit: "°C", min: -50, max: 30 },
    ],
  }),
  decode: (payload) => {
    checkAndThrow(payload, 4);
    const rawTemperature = getValue(payload, 16, 8);
    const isTeachIn = getValue(payload, 28, 1) === 0;

    return {
      temperature: parseFloat(
        scale(rawTemperature, [255, 0], [-50, 30]).toFixed(1)
      ),
      isTeachIn,
    };
  },
  encode: (data) => {
    let payload = new Uint8Array(4);
    const rawTemperature = Math.round(
      scale(data.temperature, [-50, 30], [255, 0])
    );

    payload = setValue(payload, rawTemperature, 16, 8);

    // For data telegrams, the learn bit (DB0, bit 3) is always 1.
    payload = setValue(payload, 1, 28, 1);

    return payload;
  },
};
