/**
 * EEP A5-02-08: Temperature Sensor (+30°C to +70°C)
 */
import { scale, getValue, setValue, checkAndThrow } from "@enocean-js/utils";

export const a50208 = {
  meta: {
    eep: "a5-02-08",
    rorg: "a5",
    func: "02",
    type: "08",
    title: "Temperature Sensor (+30°C to +70°C)",
    status: "released",
  },
  profile: () => ({
    type: "sensor",
    readings: [
      { name: "temperature", type: "number", unit: "°C", min: 30, max: 70 },
    ],
  }),
  decode: (payload) => {
    checkAndThrow(payload, 4);
    const rawTemperature = getValue(payload, 16, 8);
    const isTeachIn = getValue(payload, 28, 1) === 0;

    return {
      temperature: parseFloat(
        scale(rawTemperature, [255, 0], [30, 70]).toFixed(1)
      ),
      isTeachIn,
    };
  },
  encode: (data) => {
    let payload = new Uint8Array(4);
    const rawTemperature = Math.round(
      scale(data.temperature, [30, 70], [255, 0])
    );

    payload = setValue(payload, rawTemperature, 16, 8);

    // For data telegrams, the learn bit (DB0, bit 3) is always 1.
    payload = setValue(payload, 1, 28, 1);

    return payload;
  },
};
