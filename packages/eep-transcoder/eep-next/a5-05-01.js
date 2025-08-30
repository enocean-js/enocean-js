/**
 * EEP A5-05-01: Barometric Sensor
 */
import { scale } from "../utils/scale.js";
import { ByteArray } from "@enocean-js/byte-array";
import { encodeA5TeachIn } from "../utils/teach-in.js";

export const a50501 = {
  meta: {
    eep: "a5-05-01",
    rorg: "a5",
    func: "05",
    type: "01",
    title: "Barometric Sensor",
    status: "released",
  },
  profile: () => ({
    type: "sensor",
    readings: [
      { name: "barometer", type: "number", unit: "hPa", min: 500, max: 1150 },
      { name: "telegramType", type: "string" },
    ],
  }),
  decode: (payload) => {
    if (!payload || payload.length !== 4) return null;
    const learnBit = payload.getValue(27, 1) === 0;
    const telegramType = payload.getValue(24, 1) === 0 ? "heartbeat" : "event";
    const rawBarometer = payload.getValue(6, 10);

    return {
      learnBit,
      telegramType,
      barometer: parseFloat(
        scale(rawBarometer, [0, 1023], [500, 1150]).toFixed(1)
      ),
    };
  },
  encode: (data) => {
    const payload = ByteArray.from([0, 0, 0, 0]);

    if (typeof data.barometer === "number") {
      const rawBarometer = Math.round(
        scale(data.barometer, [500, 1150], [0, 1023])
      );
      payload.setValue(rawBarometer, 6, 10);
    }

    if (data.telegramType === "event") {
      payload.setValue(1, 24, 1);
    }

    // For data telegrams, the learn bit (DB0, bit 3) is always 1.
    payload.setValue(1, 27, 1);

    return payload;
  },
  teachIn: (eep) => {
    return encodeA5TeachIn({ eep });
  },
};
