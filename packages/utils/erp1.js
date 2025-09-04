/**
 * Copyright (c) 2025 Holger Will
 * Licensed under the MIT License
 * https://opensource.org/licenses/MIT
 * This file is part of the enocean-js project.
 */

import { getDataLength, subArray, toString } from "./utils.js";

export const RORGS = {
  0xf6: { name: "RPS", description: "Repeated Switch" },
  0xd5: { name: "1BS", description: "1 Byte Sensor" },
  0xa5: { name: "4BS", description: "4 Byte Sensor" },
  0xd2: { name: "VLD", description: "Variable Length Data" },
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
  let endOfData = getDataLength(telegram) + 6;
  return telegram[endOfData];
}

export function getPayload(telegram) {
  let endOfPayload = getDataLength(telegram) + 1;
  return subArray(telegram, 7, endOfPayload - 7);
}

export function getRORG(telegram) {
  return telegram[6];
}

export function getRORGName(telegram) {
  console.log(telegram[6], RORGS[telegram[6]]);
  return RORGS[telegram[6]].name;
}
