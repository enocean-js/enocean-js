import { SerialPort } from "serialport";
import * as EnoceanLib from "@enocean-js/enocean-js-lib";
import { EventEmitter } from "node:events";
import Memory from "./database.js";

const pretty = EnoceanLib.pretty;
const ESP3Parser = EnoceanLib.ESP3Parser;

const defaults = {
  timeout: 30, // seconds
  port: "/dev/ttyUSB0",
};

class Enocean extends EventEmitter {
  constructor(options) {
    super();
    this.options = { ...defaults, ...options };
    this.teachInMode = false;
    this.teachOutMode = false;
    this.memory = new Memory();

    if (!this.options.port) {
      this.emit("error", {
        code: 1,
        message: "No path provided for Enocean device",
      });
    } else {
      try {
        this.parser = new ESP3Parser();
        this.port = new SerialPort({
          path: this.options.port,
          baudRate: 57600,
        });
        this.port.pipe(this.parser);
        this.parser.on("data", this.onPacket.bind(this));
        this.parser.on("error", (err) =>
          this.emit("error", {
            code: 1000 + err.code,
            message: `Parser Error: ${err.name} (${err.desc})`,
          })
        );
        this.sender = EnoceanLib.SerialportSender({
          port: this.port,
          parser: new ESP3Parser(),
        });
        this.commander = new EnoceanLib.Commander(this.sender);
        setTimeout(async () => {
          const ret = await this.commander.getIdBase();
          this.baseId = ret.baseId;
          this.emit("ready", {
            baseId: this.baseId.toString("hex"),
            remainingWriteCycles: ret.remainingWriteCycles,
          });
        }, 0);
      } catch (err) {
        this.emit("error", {
          code: 2,
          text: `Error opening port ${this.options.port}: ${err.message}`,
        });
      }
    }
  }

  async onPacket(packet) {
    if (packet.constructor.name !== "RadioERP1") return;

    this.emit("packet", packet);

    // Handle Teach-In: This is a primary way to learn an EEP
    if (this.teachInMode && packet.teachIn) {
      const { eep } = packet.teachInInfo;
      const eepString = eep.toString();

      // For UTE, we must ensure a virtual device can be created BEFORE we learn the EEP.
      if (
        packet.teachInInfo.teachInType === "UTE" &&
        packet.teachInInfo.responseExpected === EnoceanLib.UTE_BIDIRECTIONAL
      ) {
        // Pre-flight check: try to reserve a virtual device ID.
        // We create it here and pass it to the response function.
        const partnerId = packet.senderId;
        const uteTwin = await this.createVirtualDevice(
          `UTE Twin for ${partnerId}`,
          eepString,
          { partnerId: partnerId }
        );

        if (!uteTwin) {
          this.emit("error", {
            code: 500,
            message: `Could not create a virtual device for UTE response to ${partnerId}. ID pool may be full. Pairing aborted.`,
          });
          return; // Abort before learning
        }
        // If successful, proceed with learning and responding.
        this.memory.learnEep(packet.senderId, eepString);
        this.emit("eep-learned", {
          id: packet.senderId,
          rorg: eepString.substring(0, 2),
          eep: eepString,
        });
        this.sendUteTeachInResponse(packet, uteTwin); // Pass the created twin
      } else {
        // For non-UTE teach-ins, just learn it directly.
        this.memory.learnEep(packet.senderId, eepString);
        this.emit("eep-learned", {
          id: packet.senderId,
          rorg: eepString.substring(0, 2),
          eep: eepString,
        });
      }
      return;
    }

    // Handle Teach-Out
    if (this.teachOutMode && packet.teachIn) {
      this.memory.removeDevice(packet.senderId);
      this.emit("removed-device", { id: packet.senderId });
      return;
    }

    const events = this.memory.processPacket(packet);
    events.forEach((event) => this.emit(event.name, event.payload));
  }

  async sendUteTeachInResponse(packet, uteTwin) {
    const partnerId = packet.senderId;

    const ret = EnoceanLib.RadioERP1.from({
      rorg: 0xd4,
      payload: packet.payload,
    });
    ret.senderId = uteTwin.senderId; // Use the passed virtual device's ID
    ret.destinationId = partnerId;
    ret.payload = ret.payload.setValue(1, 0, 1); // bidi
    ret.payload = ret.payload.setValue(1, 2, 2); // teach in successful
    ret.payload = ret.payload.setValue(1, 4, 4); // this is a teach in response
    await this.sender.send(ret.toString());
    this.emit("ute-response-sent", {
      to: partnerId,
      from: uteTwin.senderId,
    });
  }

  async learnEep(deviceId, eep) {
    this.memory.learnEep(deviceId, eep);
    this.emit("eep-learned", {
      id: deviceId,
      rorg: eep.substring(0, 2),
      eep: eep,
    });
  }

  async getDevice(id) {
    return this.memory.getDevice(id);
  }

  async setDeviceName(id, name) {
    this.memory.setDeviceName(id, name);
  }

  async removeDevice(id) {
    this.memory.removeDevice(id);
  }

  async getAllDevices() {
    return this.memory.getAllDevices();
  }

  async clearAllData() {
    this.memory.clearAllData();
  }

  // Virtual Device Management
  async createVirtualDevice(name, eep, profile) {
    if (!this.baseId) {
      throw new Error(
        "Base ID not yet available. Cannot create virtual device."
      );
    }
    return this.memory.createVirtualDevice(this.baseId, name, eep, profile);
  }

  async removeVirtualDevice(senderId) {
    return this.memory.removeVirtualDevice(senderId);
  }

  async getVirtualDevice(senderId) {
    return this.memory.getVirtualDevice(senderId);
  }

  async getAllVirtualDevices() {
    return this.memory.getAllVirtualDevices();
  }

  startTeachInMode() {
    let startTime = new Date();
    let endTime = new Date();
    endTime.setSeconds(startTime.getSeconds() + this.options.timeout);
    this.teachInMode = true;
    this.timeOutTimer = setTimeout(() => {
      this.teachInMode = false;
      this.emit("teach-in-mode-ended");
    }, this.options.timeout * 1000);
    const iv = setInterval(() => {
      if (!this.teachInMode) {
        clearInterval(iv);
        return;
      }
      this.emit(
        "teach-in-mode-timer",
        Math.round(Math.max(0, (endTime - new Date()) / 1000))
      );
    }, 1000);
  }
  stopTeachInMode() {
    clearTimeout(this.timeOutTimer);
    this.teachInMode = false;
    this.emit("teach-in-mode-ended");
  }
  startTeachOutMode() {
    let startTime = new Date();
    let endTime = new Date();
    endTime.setSeconds(startTime.getSeconds() + this.options.timeout);
    this.teachOutMode = true;
    this.timeOutTimer = setTimeout(() => {
      this.teachOutMode = false;
      this.emit("teach-out-mode-ended");
    }, this.options.timeout * 1000);
    const iv = setInterval(() => {
      if (!this.teachOutMode) {
        clearInterval(iv);
        return;
      }
      this.emit(
        "teach-out-mode-timer",
        Math.round(Math.max(0, (endTime - new Date()) / 1000))
      );
    }, 1000);
  }
  stopTeachOutMode() {
    clearTimeout(this.timeOutTimer);
    this.teachOutMode = false;
    this.emit("teach-out-mode-ended");
  }
}
export default Enocean;
export { Enocean, pretty };
