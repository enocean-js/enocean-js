/**
 * Copyright (c) 2025 Holger Will
 * Licensed under the MIT License
 * https://opensource.org/licenses/MIT
 * This file is part of the enocean-js project.
 */
import { getValue, subArray, setValue } from "./byte-helpers.js";
import { crc8 } from "./crc8.js";

export const PacketTypeNameMap = {
  0x01: { name: "Radio ERP1", eventName: "radio-erp1" },
  0x02: { name: "Response", eventName: "response" },
  0x03: { name: "Radio SubTel", eventName: "radio-subtel" },
  0x04: { name: "Event", eventName: "event" },
  0x05: { name: "Common Command", eventName: "common-command" },
  0x06: { name: "Smart Ack Command", eventName: "smart-ack-command" },
  0x07: { name: "Remote Management", eventName: "remote-management" },
  0x09: { name: "Radio Message", eventName: "radio-message" },
  0x0a: { name: "Radio ERP2", eventName: "radio-erp2" },
  0x0c: { name: "Command Accepted", eventName: "command-accepted" },
  0x10: { name: "Radio 802.15.4", eventName: "radio-802154" },
  0x11: { name: "2.4 Ghz Config", eventName: "2.4ghz-config" },
};

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

export function createESP3Telegram(type = 1) {
  let telegram = new Uint8Array(8);
  telegram[0] = 0x55; // Sync byte
  telegram[1] = 0x00; // Data length MSB
  telegram[2] = 0x01; // Data length LSB
  telegram[3] = 0x00; // Optional length
  telegram[4] = type; // Packet type
  telegram[5] = crc8(subArray(telegram, 1, 4)); // Header CRC8
  telegram[6] = 0x00; // Body (data + optional data)
  telegram[7] = crc8(subArray(telegram, 6, 1)); // Body CRC8
  return telegram;
}

function spliceUint8Array(arr1, arr2, rangeStart, rangeEnd) {
  const before = arr1.slice(0, rangeStart);
  const after = arr1.slice(rangeEnd + 1);
  return new Uint8Array([...before, ...arr2, ...after]);
}

export function setData(telegram, data) {
  const dataLength = data.length;
  const oldDataLength = getDataLength(telegram);
  const optionalLength = getOptionalDataLength(telegram);

  // Replace the data section (bytes 6 to 6+oldDataLength-1) with new data
  let newTelegram = spliceUint8Array(telegram, data, 6, 6 + oldDataLength - 1);

  // Update data length in header
  newTelegram = setValue(newTelegram, dataLength, 8, 16);

  // Recalculate CRCs
  newTelegram[5] = crc8(subArray(newTelegram, 1, 4)); // Header CRC8
  newTelegram[newTelegram.length - 1] = crc8(
    subArray(newTelegram, 6, dataLength + optionalLength)
  ); // Body CRC8

  return newTelegram;
}

export function setOptionalData(telegram, optionalData) {
  const optionalLength = optionalData.length;
  const dataLength = getDataLength(telegram);
  const oldOptionalLength = getOptionalDataLength(telegram);

  // Replace the optional data section (bytes 6+dataLength to 6+dataLength+oldOptionalLength-1)
  let newTelegram = spliceUint8Array(
    telegram,
    optionalData,
    6 + dataLength,
    6 + dataLength + oldOptionalLength - 1
  );

  // Update optional length in header
  newTelegram[3] = optionalLength;

  // Recalculate CRCs

  newTelegram[5] = crc8(subArray(newTelegram, 1, 4)); // Header CRC8
  newTelegram[newTelegram.length - 1] = crc8(
    subArray(newTelegram, 6, dataLength + optionalLength)
  ); // Body CRC8

  return newTelegram;
}

export function setPacketType(telegram, type) {
  const newTelegram = new Uint8Array(telegram.length);
  for (let i = 0; i < telegram.length; i++) {
    newTelegram[i] = telegram[i];
  }
  newTelegram[4] = type;
  newTelegram[5] = crc8(subArray(newTelegram, 1, 4)); // Header CRC8
  return newTelegram;
}
