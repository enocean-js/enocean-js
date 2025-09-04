/**
 * Copyright (c) 2025 Holger Will
 * Licensed under the MIT License
 * https://opensource.org/licenses/MIT
 * This file is part of the enocean-js project.
 */

import * as utils from "./utils.js";

export function encodeTeachIn({ eep, manufacturer = 0x7ff }) {
  const rorg = eep.split("-")[0];
  switch (rorg) {
    case "a5":
      return encodeA5TeachIn({ eep, manufacturer });
    default:
      return null;
  }
}

/**
 * Creates a payload for a 4BS (A5) teach-in telegram.
 * This is based on the EEP 2.6.5 specification.
 * Uses the reserved manufacturer ID for "unregistered" (0x7ff).
 *
 * @param {object} options
 * @param {string} options.eep - The EEP of the device (e.g., 'a5-02-01').
 * @returns {Uint8Array} The 4-byte payload for the teach-in telegram.
 */
export function encodeA5TeachIn({ eep, manufacturer = 0x7ff }) {
  const [, func, type] = eep.split("-").map((x) => parseInt(x, 16));
  let payload = new Uint8Array(4);
  let manId = 0x7ff;
  if (typeof manufacturer == "string") {
    manId = utils.getManufacturerIdByName(manufacturer);
  } else {
    manId = manufacturer;
  }
  // Set func (bits 0-5)
  payload = utils.setValue(payload, func, 0, 6);
  // Set type (bits 6-12)
  payload = utils.setValue(payload, type, 6, 7);
  // Set manufacturer ID (bits 13-23)
  payload = utils.setValue(payload, manId, 13, 11);
  // Set LRN Type bit (DB0, bit 7) to 1 - Telegram with EEP and Manufacturer ID
  payload = utils.setValue(payload, 1, 24, 1);
  // Set LRN bit (DB0, bit 3) to 0
  payload = utils.setValue(payload, 0, 28, 1);

  return payload;
}

/**
 * Checks if a given 4-byte payload is an A5 teach-in telegram.
 * According to the EEP 2.6.5 specification, the teach-in telegram is identified
 * by the LRN bit (DB0, bit 3, i.e. bit 28) being set to 0.
 *
 * @param {Uint8Array} payload - The 4-byte payload to check.
 * @returns {boolean} True if the payload is an A5 teach-in telegram, otherwise false.
 * @throws {Error} If the payload is not a valid 4-byte array.
 */
export function isA5TeachIn(payload) {
  if (!payload || payload.length !== 4) {
    throw new Error("Invalid payload for A5 teach-in check.");
  }
  const lrnBit = utils.getValue(payload, 28, 1);
  return lrnBit === 0;
}

export function isTeachIn(telegram) {
  if (utils.getPacketType(telegram) !== 1) {
    return false;
  }
  switch (utils.erp1.getRORGName(telegram)) {
    case "UTE":
      return true;
    case "RPS":
      return true;
    case "VLD":
      return false;
    case "4BS":
      return isA5TeachIn(utils.erp1.getPayload(telegram));
    default:
      // other teach in methosds not implemented yet
      return false;
  }
}

/**
 * Decodes a 4-byte A5 teach-in telegram payload according to the EEP 2.6.7 specification.
 * Validates the payload as a teach-in telegram and extracts EEP, manufacturer, and learn type information.
 * If the telegram does not contain EEP info (learn type 0), returns null for EEP and manufacturer.
 * Otherwise, returns the decoded EEP string, manufacturer name, learn type, and teach-in status.
 *
 * @param {Uint8Array} payload - The 4-byte payload to decode.
 * @returns {object} An object with properties:
 *   - eep: {string|null} The decoded EEP string (e.g., 'a5-02-01'), or null if not present.
 *   - manufacturer: {string|null} The manufacturer name, or null if not present.
 *   - learnType: {string} 'with EEP Info' or 'without EEP info'.
 *   - isTeachIn: {boolean} True if the payload is a teach-in telegram.
 * @throws {Error} If the payload is not a valid A5 teach-in telegram.
 */
export function decodeA5TeachIn(payload) {
  // check if it's a valid A5 teach-in payload
  if (!isA5TeachIn(payload)) {
    throw new Error("Not a valid A5 teach-in payload.");
  }
  // if lrnType is 0, it's a teach-in without EEP info
  const lrnType = utils.getValue(payload, 24, 1);
  if (lrnType === 0) {
    return {
      eep: null,
      manufacturer: null,
      withEEPInfo: false,
      isTeachIn: true,
    };
  }
  // extract func, type, manufacturer ID
  const func = utils.getValue(payload, 0, 6);
  const typ = utils.getValue(payload, 6, 7);
  const man = utils.getValue(payload, 13, 11);
  const lrnBit = utils.getValue(payload, 28, 1);

  return {
    eep: `a5-${func.toString(16).padStart(2, "0")}-${typ
      .toString(16)
      .padStart(2, "0")}`,
    manufacturer: utils.getManufacturerNameById(man),
    withEEPInfo: lrnType ? true : false,
    isTeachIn: lrnBit === 0 ? true : false,
  };
}
