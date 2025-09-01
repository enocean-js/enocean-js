/**
 * Utility functions for EEP transcoding.
 * This module re-exports functions from various utility modules.
 */

export {
  getValue,
  setValue,
  setSingleBit,
  toString,
  fromString,
  checkAndThrow,
  subArray,
} from "./byte-helpers.js";
export { scale } from "./scale.js";
export {
  getManufacturerIdByName,
  getManufacturerNameById,
} from "./manufacturer.js";
export {
  encodeValueFromRangeMap,
  decodeValueFromRangeMap,
} from "./range-map.js";
export { encodeA5TeachIn, encodeTeachIn, decodeA5TeachIn } from "./teach-in.js";
export { crc8 } from "./crc8.js";
export {
  getSyncByte,
  getHeader,
  getDataLength,
  getOptionalDataLength,
  getPacketType,
  getHeaderCRC8,
  getBody,
  getBodyCRC8,
} from "./esp3.js";
