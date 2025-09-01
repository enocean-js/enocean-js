/**
 * EEP A5-09-05: VOC Sensor
 */
import { ByteArray } from "@enocean-js/byte-array";
import { encodeA5TeachIn } from "../utils/teach-in.js";

const VOC_TYPES = {
  0: "VOCT (total)",
  1: "Formaldehyde",
  2: "Benzene",
  3: "Styrene",
  4: "Toluene",
  5: "Tetrachloroethylene",
  6: "Xylene",
  7: "n-Hexane",
  8: "n-Octane",
  9: "Cyclopentane",
  10: "Methanol",
  11: "Ethanol",
  12: "1-Pentanol",
  13: "Acetone",
  14: "ethylene Oxide",
  15: "Acetaldehyde ue",
  16: "Acetic Acid",
  17: "Propionice Acid",
  18: "Valeric Acid",
  19: "Butyric Acid",
  20: "Ammoniac",
  22: "Hydrogen Sulfide",
  23: "Dimethylsulfide",
};

export const a50905 = {
  meta: {
    eep: "a5-09-05",
    rorg: "a5",
    func: "09",
    type: "05",
    title: "VOC Sensor",
    status: "released",
  },
  profile: () => ({
    type: "sensor",
    readings: [
      { name: "concentration", type: "number", unit: "ppb" },
      { name: "vocType", type: "string" },
      { name: "multiplier", type: "number" },
    ],
  }),
  decode: (payload) => {
    if (!payload || payload.length !== 4) return null;
    const learnBit = (payload[3] & 0x08) >> 3 === 0;

    const rawConcentration = payload.getValue(0, 16);
    const vocId = payload.getValue(16, 8);
    const multiplierCode = payload.getValue(30, 2);

    const multipliers = [0.01, 0.1, 1, 10];
    const multiplier = multipliers[multiplierCode];

    const concentration = rawConcentration * multiplier;

    return {
      learnBit,
      concentration,
      vocType: VOC_TYPES[vocId] || "Unknown",
      multiplier,
    };
  },
  /**
   * TODO: Future Improvement
   * The encode function could be made smarter. Instead of requiring the user
   * to specify a multiplier, it could automatically select the best one
   * to maximize precision for the given concentration value.
   *
   * The logic would be:
   * 1. Iterate through the available multipliers [0.01, 0.1, 1, 10].
   * 2. For each multiplier, calculate the required raw value (concentration / multiplier).
   * 3. Choose the first multiplier that results in a raw value less than or equal to 65535.
   * This would make the API easier to use, as the user could just pass
   * the concentration and the function would handle the scaling.
   */
  encode: (data) => {
    const payload = ByteArray.from([0, 0, 0, 0]);
    const multipliers = { 0.01: 0, 0.1: 1, 1: 2, 10: 3 };

    // Default to multiplier of 1 if not provided
    const multiplier = data.multiplier || 1;
    const multiplierCode = multipliers[multiplier.toString()] || 2;

    if (typeof data.concentration === "number") {
      const rawConcentration = Math.round(data.concentration / multiplier);
      payload.setValue(rawConcentration, 0, 16);
      payload.setValue(multiplierCode, 30, 2);
    }

    if (typeof data.vocType === "string") {
      const vocId = Object.keys(VOC_TYPES).find(
        (key) => VOC_TYPES[key] === data.vocType
      );
      if (vocId) {
        payload.setValue(parseInt(vocId, 10), 16, 8);
      }
    }

    // For data telegrams, the learn bit (DB0, bit 3) is always 1.
    payload.setValue(1, 28, 1);

    return payload;
  },
  teachIn: (eep) => {
    return encodeA5TeachIn({ eep });
  },
};
