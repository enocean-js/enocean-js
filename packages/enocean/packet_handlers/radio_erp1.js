import * as utils from "@enocean-js/utils";
import * as EEP from "@enocean-js/eep";

function log(...args) {
  const tag = "[PACKET HANDLER - RADIO_ERP1]";
  console.log(tag, ...args);
}

export async function onPacket(telegram) {
  const senderId = utils.erp1.getSenderId(telegram);
  const payload = utils.erp1.getPayload(telegram);
  const rorg = telegram[6].toString(16).padStart(2, "0");
  const status = telegram[7];
  const known = this.memory.getDevice(senderId, rorg);

  if (known.length) {
    try {
      // emit known device event without decoded data for a plugable decoder solution.
      // register dedicated decode handlers like express middleware wit a next() function?
      const eepID = known[0].eep.split("-").join("");
      const decoder = EEP[eepID];

      if (utils.isTeachIn(telegram) && rorg != "f6") {
        return;
      }
      this.memory.storeTelegram(
        senderId,
        known[0].eep,
        JSON.stringify({
          data: decoder.decode(payload, status),
          raw: telegram,
        })
      );
      this.emit("device-data", {
        name: known[0].name,
        eep: known[0].eep,
        senderId: senderId,
        data: decoder.decode(payload, status),
        raw: telegram,
        profile: decoder.profile(),
      });
      return;
    } catch (e) {
      this.emit("device-data", {
        eep: known[0].eep,
        senderId: senderId,
        data: { payload: payload, status: status },
        raw: telegram,
      });
      console.warn(`No EEP decoder for ${known.eep} found:${e.message}`);
      return;
    }
  } else {
    if (this.teachInModeActive) {
      handleTeachIn.call(this, senderId, payload, rorg, telegram);
    } else {
    }
    this.emit("unknown-device", {
      senderId: senderId,
      rorg: rorg,
      payload: payload,
      status: status,
      raw: telegram,
    });
  }
}

function handleTeachIn(senderId, payload, rorg, telegram) {
  if (this.teachInModeActive) {
    if (utils.isTeachIn(telegram)) {
      this.teachInTimer.stop();
      switch (rorg) {
        case "f6":
          return handleF6TeachIn.call(this, senderId);
        case "a5":
          return handleA5TeachIn.call(this, senderId, payload);
        case "d4":
          return handleUTETeachIn.call(this, senderId, payload, telegram);
        default:
          return false;
      }
    }
  }
}

function handleF6TeachIn(senderId) {
  EEP.f60201.profile();
  this.memory.learn(
    senderId,
    "f6-02-01",
    JSON.stringify(EEP.f60201.profile()),
    "New Device"
  );
  this.emit("new-device-found", {
    senderId,
    eep: "f6-02-01",
    profile: EEP.f60201.profile(),
  });
  return true;
}

function handleA5TeachIn(senderId, payload) {
  const teachInInfo = utils.decodeA5TeachIn(payload);
  if (!teachInInfo.withEEPInfo) {
    this.emit("teach-in-failed", {
      reason: "Can not teach in a5 teachIn telegrams without eep info",
    });
    return false;
  }
  let profile = null;
  try {
    profile = EEP[teachInInfo.eep.replace(/-/g, "")].profile();
  } catch (e) {
    this.emit("teach-in-failed", {
      reason: "EEP not supported",
      eep: teachInInfo.eep,
    });
    return false;
  }
  this.memory.learn(
    senderId,
    teachInInfo.eep,
    JSON.stringify(profile),
    "New Device"
  );
  this.emit("new-device-found", {
    senderId,
    eep: teachInInfo.eep,
    profile: profile,
  });
  return true;
}

function handleUTETeachIn(senderId, payload, telegram) {
  let teachInInfo = utils.decodeUTETeachIn(payload);

  const eep = `${teachInInfo.rorg
    .toString(16)
    .padStart(2, "0")}-${teachInInfo.func
    .toString(16)
    .padStart(2, "0")}-${teachInInfo.type.toString(16).padStart(2, "0")}`;

  let newId = this.memory.createVirtualDevice("New Virtual Device", eep, {});
  log({
    rorg: 0xd4,
    payload: utils.encodeUTETeachInResponse(payload),
    senderId: utils.fromString(newId),
    destinationId: utils.fromString(senderId),
  });
  let tel = utils.erp1.createERP1Telegram({
    rorg: 0xd4,
    payload: utils.encodeUTETeachInResponse(payload),
    senderId: utils.fromString(newId),
    destinationId: utils.fromString(senderId),
  });
  log(utils.toString(telegram));
  log(utils.toString(tel));
  this.send(tel);
}
