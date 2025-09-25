/**
 * Copyright (c) 2025 Holger Will
 * Licensed under the MIT License
 * https://opensource.org/licenses/MIT
 * This file is part of the enocean-js project.
 */

import * as utils from "@enocean-js/utils";
import { ProfileManager } from "@enocean-js/eep";
import merge from "lodash.merge";

const EEP = await ProfileManager.getInstance();
function log(...args) {
  const tag = "[PACKET HANDLER - RADIO_ERP1]";
  console.log(tag, ...args);
}

export async function onPacket(telegram) {
  let ret = {
    input_id: utils.erp1.getSenderId(telegram),
    payload: utils.erp1.getPayload(telegram),
    input_rorg: utils.erp1.getRORG(telegram),
    rorgInfo: utils.erp1.getRORGInfo(telegram),
    status: utils.erp1.getStatus(telegram),
    signalStrength: utils.erp1.getSignalStrength(telegram),
    raw: telegram,
  };

  if (ret.input_rorg === 0xd0) {
    // D0 is a SIGNAL telegram, there are no eep profiles for it.
    // we can decode SIGNALS in any case, so we handle it here directly.
    handleD0.call(this, ret);
    return;
  }

  // Check if there is a device with the senderId and rorg know
  // Each device may support several unique RORGs, but only one type of RORG is assigned per device instance.
  const knownDevice = this.memory.getDeviceEntriesRORG(
    ret.input_id,
    ret.input_rorg
  );

  if (knownDevice) {
    // we know the device
    this.memory.storeRSSI(ret.input_id, ret.signalStrength);
    if (utils.isTeachIn(telegram) && ret.input_rorg != 0xf6) {
      // so we do not have to teach it in again,
      // should we emit?
      return;
    }
    let decoder = null;
    try {
      // Try to get EEP profile.

      decoder = EEP.getEEP(knownDevice.input_eep); /// EEP Lookup
      //console.log("Using EEP decoder", knownDevice.input_eep, decoder);
    } catch (e) {
      // If we fail to get the eep profile, let the upstream system know we can not decode the telegram.
      // instead push the raw payload upstream, it may get decoded there.
      this.emit("device-data-no-eep", ret);
      // also log a warning so we can suggest to implememt the missing EEP decoder.
      log(
        `[EEP MISSING] No EEP decoder for ${knownDevice.input_eep} found:${e.message}`
      );
      return;
    }
    // decode the payload
    const decoded = decoder.decode(
      ret.payload,
      ret.status,
      knownDevice.profile
    );
    // update the profile with the new values
    let profile = updatePropValues(knownDevice.profile, decoded);
    // store the new values in the memory
    this.memory.setDeviceProfileRORG(ret.input_id, ret.input_rorg, profile);
    // emit the decoded data
    ret.data = decoded;
    ret.profile = profile;
    ret = { ...knownDevice, ...ret };
    // finally emit the device data
    this.emit("device-data", ret);

    return;
  } else {
    // we do not know the device
    if (this.teachInModeActive) {
      //if we are in teachs in mode, try to teach it in
      handleTeachIn.call(this, ret);
    }
    // else just emit that we do not know the device
    this.emit("unknown-device", ret);
  }
}

// profile is a JSON.srtringified object
function updatePropValues(profile, decoded) {
  // copy profile to keep function pure
  let newProfile = JSON.parse(profile);
  // assume we have no channels
  let channel = newProfile.props;
  //but if we do have channels, use the props of the correct channel
  if (newProfile.channels) {
    channel = newProfile.channels[decoded.channel].props;
  }

  // now update the values of the properties in the profile
  decoded.props.forEach((item) => {
    const prop = channel.find((p) => p.name === item.name);
    if (prop) {
      merge(prop, item);
    }
  });

  // and return the updated profile
  return newProfile;
}

function handleTeachIn(packet) {
  if (this.teachInModeActive) {
    if (utils.isTeachIn(packet.raw)) {
      this.teachInTimer.stop();
      switch (packet.input_rorg) {
        case 0xf6:
          return handleF6TeachIn.call(this, packet);
        case 0xa5:
          return handleA5TeachIn.call(this, packet);
        case 0xd4:
          return handleUTETeachIn.call(this, packet);
        default:
          return false;
      }
    }
  }
}

function handleF6TeachIn(packet) {
  const profile = EEP.getEEP("f6-02-01").profile(utils.DIRECTION_IN);
  this.memory.memorize(
    packet.input_id,
    null,
    "uni",
    "New Device",
    "f6-02-01",
    null,
    profile,
    utils.DIRECTION_IN,
    "EnOcean GmbH"
  );

  this.emit("new-device-found", {
    ...packet,
    ...{
      input_eep: "f6-02-01",
      name: "New Device",
      type: "uni",
      profile: JSON.stringify(profile),
      direction: utils.DIRECTION_IN,
      manufacturer: "EnOcean GmbH",
    },
  });
  return true;
}

function handleA5TeachIn(packet) {
  const teachInInfo = utils.decodeA5TeachIn(packet.payload);
  if (!teachInInfo.withEEPInfo) {
    this.emit("teach-in-failed", {
      reason: "Can not teach in a5 teachIn telegrams without eep info",
    });
    return false;
  }
  let profile = null;
  try {
    profile = EEP.getEEP(teachInInfo.eep).profile(utils.DIRECTION_IN);
  } catch (e) {
    log(`[EEP MISSING] No EEP decoder for ${teachInInfo.eep}`);
    this.emit("teach-in-failed", {
      ...packet,
      ...{
        reason: "EEP not supported",
        eep: teachInInfo.eep,
      },
    });
    return false;
  }
  this.memory.memorize(
    packet.input_id,
    null,
    "uni",
    "New Device",
    teachInInfo.eep,
    null,
    profile,
    utils.DIRECTION_IN,
    teachInInfo.manufacturer
  );

  this.emit("new-device-found", {
    ...packet,
    ...{
      input_eep: teachInInfo.eep,
      name: "New Device",
      type: "uni",
      profile: JSON.stringify(profile),
      direction: utils.DIRECTION_IN,
      manufacturer: teachInInfo.manufacturer,
    },
  });
  return true;
}

function handleUTETeachIn(packet) {
  let teachInInfo = utils.decodeUTETeachIn(packet.payload);
  const eep = teachInInfo.eep;
  let profile = null;
  try {
    // Try to get EEP profile.
    profile = EEP.getEEP(teachInInfo.eep).profile(
      utils.DIRECTION_IN,
      teachInInfo.numChannels
    );
  } catch (e) {
    // If we fail to get the eep profile, let the requesting device know that we can not handle it.
    let tel = utils.erp1.createERP1Telegram({
      rorg: 0xd4,
      payload: utils.encodeUTETeachInResponse(packet.payload, 3),
      senderId: this.baseId,
      destinationId: utils.fromString(packet.input_id),
    });
    // EEP NOT SUPPORTED MESSAGE
    this.send(tel);
    // let the uptsream system know we failed to teach in the device.
    this.emit("teach-in-failed", {
      ...packet,
      ...{
        reason: "EEP not supported",
        eep: teachInInfo.eep,
      },
    });
    // log a warning in the console.
    log(`[EEP MISSING] No EEP decoder for ${teachInInfo.eep}`);
    return false;
  }

  // we know the eep.

  let newId = this.memory.getNewId();

  newId = newId.hex;
  this.memory.memorize(
    packet.input_id,
    newId,
    "bidi",
    "New Device",
    eep,
    eep,
    profile,
    utils.DIRECTION_IN,
    teachInInfo.manufacturer
  );

  let tel = utils.erp1.createERP1Telegram({
    rorg: 0xd4,
    payload: utils.encodeUTETeachInResponse(packet.payload),
    senderId: utils.fromString(newId),
    destinationId: utils.fromString(packet.input_id),
  });
  this.send(tel);

  this.emit("new-device-found", {
    ...packet,
    ...{
      output_id: newId,
      input_eep: eep,
      output_eep: eep,
      type: "bidi",
      name: "New Device",
      profile: JSON.stringify(profile),
      direction: utils.DIRECTION_IN,
      manufacturer: teachInInfo.manufacturer,
    },
  });
}

function handleD0(packet) {
  //log("D0 SIGNAL telegram", packet);
  const payload = utils.erp1.getPayload(packet.raw);
  const mid = packet.payload[0];
  const midString = mid.toString(16).padStart(2, "0");
  const eep = "d0-00-" + midString;
  const knownDevice = this.memory.getDeviceEntriesEEP(packet.input_id, eep);

  if (knownDevice) {
    this.memory.storeRSSI(packet.input_id, packet.signalStrength);
    const decoded = utils.decodeD0(packet.raw);
    const profile = updatePropValues(
      JSON.stringify(EEP.getEEP(eep).profile(utils.DIRECTION_IN)),
      decoded
    );
    this.memory.setDeviceProfileEEP(packet.input_id, eep, profile);

    this.emit("device-data", {
      ...packet,
      ...{
        name: knownDevice.name,
        input_eep: "d0-00-" + eep,
        data: decoded,
        raw: packet.raw,
        profile: profile,
      },
    });
  } else {
    log("New D0 SIGNAL device found", packet.input_id, eep);
    let profile = EEP.getEEP(eep).profile(utils.DIRECTION_IN);
    const decoded = utils.decodeD0(packet.raw);

    profile = updatePropValues(JSON.stringify(profile), decoded);

    this.memory.memorize(
      packet.input_id,
      null,
      "uni",
      "New Device",
      "d0-00-" + midString,
      null,
      profile,
      utils.DIRECTION_IN,
      "Diverse"
    );

    this.emit("new-device-found", {
      ...packet,
      ...{
        type: "uni",
        eep: "d0-00-00",
        name: "New Device",
        profile: JSON.stringify(profile),
        direction: utils.DIRECTION_IN,
        manufacturer: diverse,
      },
    });
  }
}
