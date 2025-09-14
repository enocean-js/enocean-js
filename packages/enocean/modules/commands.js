/**
 * Copyright (c) 2025 Holger Will
 * Licensed under the MIT License
 * https://opensource.org/licenses/MIT
 * This file is part of the enocean-js project.
 */
import * as utils from "@enocean-js/utils";

export async function getBaseId(eo) {
  try {
    const baseIdResponse = await eo.send("5500010005700838");
    const baseId = utils.subArray(baseIdResponse.data, 7, 4);
    return {
      baseId: utils.toString(baseId),
      remainingWriteCycles: baseIdResponse.data[11],
    };
  } catch (err) {
    return { baseId: "NOT SUPPORTED", remainingWriteCycles: "NOT SUPPORTED" };
  }
}

export async function setBaseId(eo) {
  // const baseIdResponse = await eo.send("5500010005700838");
  // const baseId = utils.subArray(baseIdResponse, 7, 4);
  // return {
  //   baseId: utils.toString(baseId),
  //   remainingWriteCycles: baseIdResponse[11],
  // };
}
export async function getVersion(eo) {
  try {
    const versionResponse = await eo.send("5500010005700309");
    const appVersion = utils.subArray(versionResponse.data, 7, 4);
    const softwareVersion = utils.subArray(versionResponse.data, 11, 4);
    const id = utils.subArray(versionResponse.data, 15, 4);
    const deviceVersion = utils.subArray(versionResponse.data, 19, 4);
    const appDescription = utils.subArray(versionResponse.data, 23, 16);

    return {
      appVersion: `${appVersion[0]}.${appVersion[1]}.${appVersion[2]}.${appVersion[3]}`,
      softwareVersion: `${softwareVersion[0]}.${softwareVersion[1]}.${softwareVersion[2]}.${softwareVersion[3]}`,
      hardwareId: utils.toString(id),
      deviceVersion: `${deviceVersion[0]}.${deviceVersion[1]}.${deviceVersion[2]}.${deviceVersion[3]}`,
      appDescription: new TextDecoder()
        .decode(appDescription)
        .replace(/\0/g, ""),
    };
  } catch (err) {
    return {
      appVersion: `NOT SUPPORTED`,
      softwareVersion: `NOT SUPPORTED`,
      hardwareId: "NOT SUPPORTED",
      deviceVersion: `NOT SUPPORTED`,
      appDescription: "NOT SUPPORTED",
    };
  }
}
export async function selfTest(eo) {
  try {
    const selfTestResponse = await eo.send("5500010005700612");
    return { selfTest: selfTestResponse.data[7] === 0 ? "OK" : "FAILED" };
  } catch (err) {
    return { selfTest: "NOT SUPPORTED" };
  }
}

export async function getFrequencyInfo(eo) {
  try {
    const freqResponse = await eo.send("55000100057025fb");
    const frequencyMap = {
      0x00: "315.000 Mhz",
      0x01: "868.300 Mhz",
      0x02: "902.875 Mhz",
      0x03: "921.400 Mhz",
      0x04: "928.350 Mhz",
      0x20: "2.4 Ghz",
    };
    const protocolMap = {
      0x00: "ERP1",
      0x01: "ERP2",
      0x10: "802.15.4",
      0x30: "Long Range",
    };
    return {
      frequency: frequencyMap[freqResponse.data[7]] || "UNKNOWN",
      protocol: protocolMap[freqResponse.data[8]] || "UNKNOWN",
    };
  } catch (err) {
    return { frequency: "NOT SUPPORTED", protocol: "NOT SUPPORTED" };
  }
}
