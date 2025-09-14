/**
 * Copyright (c) 2025 Holger Will
 * Licensed under the MIT License
 * https://opensource.org/licenses/MIT
 * This file is part of the enocean-js project.
 */

import {
  createESP3Telegram,
  getDataLength,
  setData,
  setOptionalData,
  subArray,
  toString,
} from "./utils.js";

export const UTE_BIDIRECTIONAL = 0;
export const UTE_UNIDIRECTIONAL = 1;
export const UTE_TEACH_IN_SUCCESSFULL = 1;
export const UTE_DELETION_SUCCESSFULL = 2;
export const UTE_EEP_NOT_SUPPORTED = 3;
export const UTE_TEACH_IN_NOT_ACCEPTED = 0;
export const UTE_QUERY_TEACH_IN_REQUEST = 0;
export const UTE_QUERY_DELETION_REQUEST = 1;
export const UTE_QUERY_TEACH_IN_OR_DELETION = 2;
export const UTE_QUERY_NOT_USED = 3;
export const UTE_CMD_QUERY = 0;
export const UTE_CMD_RESPONSE = 1;

export const RORGS = {
  0xf6: { name: "RPS", description: "Repeated Switch" },
  0xd5: { name: "1BS", description: "1 Byte Sensor" },
  0xa5: { name: "4BS", description: "4 Byte Sensor" },
  0xd2: { name: "VLD", description: "Variable Length Data" },
  0xd0: { name: "SIG", description: "Signal Telegram" },
  0xd1: { name: "MSC", description: "Multi Sensor Command" },
  0xd4: { name: "UTE", description: "Universal Teach-in" },
  0xa6: { name: "ADT", description: "Addressing Destination Telegram" },
  0xc6: { name: "SM_LRN_REQ", description: "Smart ACK Learn Request" },
  0xc7: { name: "SM_LRN_ANS", description: "Smart ACT Learn Response" },
  0xa7: { name: "SM_REC", description: "Smart ACK Reclaim" },
  0xc5: { name: "SYS_EX", description: "Remote Management" },
  0x30: { name: "SEC", description: "Secure Telegram" },
  0x31: {
    name: "SEC_ENCAPS",
    description: "Secure Telegram with R-ORG encapsulation",
  },
};

export function getSenderId(telegram) {
  let endOfData = getDataLength(telegram) + 6;
  return toString(subArray(telegram, endOfData - 5, 4));
}

export function getStatus(telegram) {
  let endOfData = getDataLength(telegram) + 5;
  return telegram[endOfData];
}

export function getPayload(telegram) {
  let endOfPayload = getDataLength(telegram) + 1;
  return subArray(telegram, 7, endOfPayload - 7);
}

export function getRORG(telegram) {
  return telegram[6];
}

export function getRORGInfo(telegram) {
  //console.log(telegram[6], RORGS[telegram[6]]);
  return RORGS[telegram[6]];
}

export function getSignalStrength(telegram) {
  return telegram[telegram.length - 3];
}

export function getDestinationId(telegram) {
  return toString(subArray(telegram, telegram.length - 7, 4));
}

export function createERP1Telegram({
  rorg = 0xa5,
  payload = new Uint8Array(4),
  senderId = new Uint8Array(4),
  status = 0,
  subTelNum = 0x03,
  destinationId = new Uint8Array([0xff, 0xff, 0xff, 0xff]),
  rssi = 0xff,
  securityLevel = 0x00,
}) {
  let tel = createESP3Telegram(1);
  let data = new Uint8Array([rorg, ...payload, ...senderId, status]);
  let optionalData = new Uint8Array([
    subTelNum,
    ...destinationId,
    rssi,
    securityLevel,
  ]);
  tel = setData(tel, data);
  tel = setOptionalData(tel, optionalData);
  return tel;
}
