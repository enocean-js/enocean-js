/**
 * EEP A5-3F-7F: Universal and Manufacturer Specific Communication
 */
import { ByteArray } from "@enocean-js/byte-array";
import { encodeA5TeachIn } from "../utils/teach-in";

export const a53f7f = {
  meta: {
    eep: "a5-3f-7f",
    rorg: "a5",
    func: "3f",
    type: "7f",
    title: "Universal and Manufacturer Specific Communication",
    status: "released",
  },
  profile: () => ({
    type: "universal",
    readings: [{ name: "payload", type: "buffer" }],
  }),
  decode: (payload) => {
    if (!payload || payload.length !== 4) return null;
    const learnBit = (payload[3] & 0x08) >> 3 === 0;

    return {
      learnBit,
      payload: payload,
    };
  },
  encode: (data) => {
    if (!data || !data.payload || data.payload.length !== 4) {
      throw new Error("A 4-byte payload is required for A5-3F-7F encoding.");
    }
    const payload = ByteArray.from(data.payload);

    // For data telegrams, the learn bit (DB0, bit 3) is always 1.
    payload[3] |= 0x08;

    return payload;
  },
  teachIn: (eep) => {
    return encodeA5TeachIn({ eep });
  },
};
