import * as utils from "@enocean-js/utils";
import * as EEP from "@enocean-js/eep";

export async function onPacket(telegram) {
  const senderId = utils.erp1.getSenderId(telegram);
  const payload = utils.erp1.getPayload(telegram);
  const rorg = telegram[6].toString(16).padStart(2, "0");
  const status = telegram[7];
  const known = this.memory.getDevice(senderId, rorg);
  if (known) {
    try {
      // emit known device event without decoded data for a plugable decoder solution.
      // register dedicated decode handlers like express middleware wit a next() function?
      const eepID = known.eep.split("-").join("");
      const decoder = EEP[eepID];
      this.emit("device-data", {
        senderId: senderId,
        data: decoder.decode(payload, status),
        raw: telegram,
      });
    } catch (e) {
      this.emit("device-data", {
        senderId: senderId,
        data: { payload: payload, status: status },
        raw: telegram,
      });
      console.warn(`No EEP decoder for ${known.eep} found:${e.message}`);
    }
  } else {
    if (this.teachInModeActive) {
      handleTeachIn.call(this, senderId, payload, rorg, telegram);
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
          console.log("new device");
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
        case "a5":
          const teachInInfo = utils.decodeA5TeachIn(payload);
          if (!teachInInfo.withEEPInfo) {
            this.emit("teach-in-failed", {
              reason: "Can not teach in a5 teachIn telegrams without eep info",
            });
            return false;
          }
          let profile = null;
          try {
            console.log(teachInInfo);
            profile = EEP[teachInInfo.eep.replace(/-/g, "")].profile();
          } catch (e) {
            this.emit("teach-in-failed", {
              reason: "EEP not supported",
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
        default:
          return false;
      }
    }
  }
}
