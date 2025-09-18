/**
 * Copyright (c) 2025 Holger Will
 * Licensed under the MIT License
 * https://opensource.org/licenses/MIT
 * This file is part of the enocean-js project.
 */

import {
  getSyncByte,
  getOptionalDataLength,
  getPacketType,
  getHeaderCRC8,
  getBodyCRC8,
  createESP3Telegram,
  getDataLength,
  setData,
  setOptionalData,
  subArray,
  toString,
  fromString,
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
export function getSubTelNum(telegram) {
  return telegram[telegram.length - 8];
}
export function getSignalStrength(telegram) {
  return telegram[telegram.length - 3];
}
export function getSecurityLevel(telegram) {
  return telegram[telegram.length - 2];
}
export function getDestinationId(telegram) {
  return toString(subArray(telegram, telegram.length - 7, 4));
}

export function parse(telegram) {
  if (typeof telegram === "string") {
    telegram = fromString(telegram);
  }
  if (!telegram || telegram.length < 7) {
    throw new Error("Invalid telegram");
  }
  return {
    header: {
      length: getDataLength(telegram),
      optionalLength: getOptionalDataLength(telegram),
      paketType: getPacketType(telegram),
    },
    data: {
      rorg: getRORG(telegram),
      payload: getPayload(telegram),
      senderId: fromString(getSenderId(telegram)),
      status: getStatus(telegram),
    },
    optionalData: {
      subTelNum: getSubTelNum(telegram),
      destinationId: fromString(getDestinationId(telegram)),
      signalStrength: getSignalStrength(telegram),
      securityLevel: getSecurityLevel(telegram),
    },
    syncByte: getSyncByte(telegram),
    headerCRC: getHeaderCRC8(telegram),
    dataCRC: getBodyCRC8(telegram),
  };
}

export function toHTML(tel) {
  const telegram = parse(tel);
  return `
  <div class="erp1_telegram">
    <span class="erp1_syncByte">${toString(telegram.syncByte)}</span>
    <div class="erp1_header">
      <span class="erp1_length">${toString(telegram.header.length)}</span>
      <span class="erp1_optionalLength">${toString(
        telegram.header.optionalLength
      )}</span>
       <span class="erp1_packetType">${toString(
         telegram.header.paketType
       )}</span>
    </div>
    <span class="erp1_HeaderCRC">${toString(telegram.headerCRC)}</span>
    <div class="erp1_body">
      <div class="erp1_data">
        <span class="erp1_rorg">${toString(telegram.data.rorg)}</span>
        <span class="erp1_payload">${toString(telegram.data.payload)}</span>
        <span class="erp1_senderId">${toString(telegram.data.senderId)}</span>
        <span class="erp1_status">${toString(telegram.data.status)}</span>
      </div>
      <div class="erp1_optional_data">
        <span class="erp1_subTelNum">${toString(
          telegram.optionalData.subTelNum
        )}</span>
        <span class="erp1_destinationId">${toString(
          telegram.optionalData.destinationId
        )}</span>
        <span class="erp1_signalStrength">${toString(
          telegram.optionalData.signalStrength
        )}</span>
        <span class="erp1_securityLevel">${toString(
          telegram.optionalData.securityLevel
        )}</span>
      </div>
    </div>
    <span class="erp1_dataCRC">${toString(telegram.dataCRC)}</span>
  </div>`;
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

/**
 * Converts a raw 1-byte EnOcean RSSI value to a signal quality rating.
 * The rating is on a scale of 1 to 4, where 1 is excellent and 4 is poor.
 *
 * @param {number} rawRssiByte - The raw RSSI value (0-255) from the EnOcean telegram.
 * @returns {number} The signal quality rating (1-4). Returns 4 if the input is invalid.
 */
export function getSignalQualityRating(rawRssiByte) {
  // Ensure the input is a valid number.
  if (
    typeof rawRssiByte !== "number" ||
    rawRssiByte <= 0 ||
    rawRssiByte >= 255
  ) {
    return 0; // Return 'very poor' for invalid input.
  }

  // These thresholds are approximate and can be adjusted as needed.
  // The values represent a relative scale where higher is better.
  if (rawRssiByte >= 80) {
    return 4; // Excellent
  } else if (rawRssiByte >= 60) {
    return 3; // Good
  } else if (rawRssiByte >= 40) {
    return 2; // Fair
  } else if (rawRssiByte >= 20) {
    return 1; // Poor
  } else {
    return 0; // Very Poor (below 40)
  }
}
