import { setValue, getValue, subArray } from "./byte-helpers";
import { crc8 } from "./crc8";

export function getSyncByte(telegram) {
  return getValue(telegram, 0, 8);
}

export function getHeader(telegram) {
  return subArray(telegram, 1, 4);
}

export function getDataLength(telegram) {
  return getValue(telegram, 8, 16);
}

export function getOptionalDataLength(telegram) {
  return telegram[3];
}

export function getPacketType(telegram) {
  return telegram[4];
}

export function getHeaderCRC8(telegram) {
  return telegram[5];
}

export function getBody(telegram) {
  const dataLength = getDataLength(telegram);
  const optionalLength = getOptionalDataLength(telegram);
  return subArray(telegram, 6, dataLength + optionalLength);
}

export function getBodyCRC8(telegram) {
  return crc8(getBody(telegram));
}
