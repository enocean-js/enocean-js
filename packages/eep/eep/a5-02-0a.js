/**
 * EEP a5-02-0a: Temperature Sensor (+50°C to +90°C)
 */
import { scale, getValue, setValue } from "@enocean-js/utils";

export const a5020a = {
  meta: {
    eep: "a5-02-0a",
    rorg: "a5",
    func: "02",
    type: "0a",
    title: "Temperature Sensor (+50°C to +90°C)",
  },
  profile: () => ({
    type: "sensor",
    readings: [
      {
        name: "temperature",
        type: "number",
        unit: "°C",
        min: 50,
        max: 90,
        optional: false,
      },
    ],
  }),
  decode: (payload) => {
    if (!payload || payload.byteLength !== 4) return null;
    const rawTemperature = getValue(payload, 16, 8);
    const learnBit = getValue(payload, 28, 1) === 0;

    return {
      temperature: parseFloat(
        scale(rawTemperature, [255, 0], [50, 90]).toFixed(1)
      ),
      learnBit,
    };
  },
  encode: (data) => {
    let payload = new Uint8Array(4);
    const rawTemperature = Math.round(
      scale(data.temperature, [50, 90], [255, 0])
    );

    payload = setValue(payload, rawTemperature, 16, 8);

    // For data telegrams, the learn bit (DB0, bit 3) is always 1.
    payload = setValue(payload, 1, 28, 1);

    return payload;
  },
};
