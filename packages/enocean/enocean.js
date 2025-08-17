import { SerialPort } from "serialport";
import * as EnoceanLib from "@enocean-js/enocean-js-lib";
import { EventEmitter } from "node:events";
import { Level } from "level";
import os from "os";
import path from "path";

const dbPath = path.join(os.homedir(), ".enocean-js/memory");
const db = new Level(dbPath);

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
        this.parser.on("error", (err) => {
          this.emit("error", {
            code: 1000 + err.code,
            message: `Parser Error: ${err.name} (${err.desc})`,
          });
        });
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
    if (packet.constructor.name === "RadioERP1") {
      this.emit("packet", packet);
      const id = packet.senderId;
      const value = await db.get(id);
      if (value !== undefined) {
        const device = JSON.parse(value);
        device.rssi = packet.RSSI;
        device.lastSeen = new Date().toISOString();
        device.lastData = packet.decode(device.eep);
        await db.put(id, JSON.stringify(device));
        this.emit("known-device-data", device);
      }
      if (this.teachInMode && packet.teachIn && value === undefined) {
        const eep = packet.teachInInfo.eep.toString();
        await this.setDevice(id, eep);
        this.emit("teach-in-device", {
          id: id,
          eep: eep,
          rssi: packet.RSSI,
          lastSeen: new Date().toISOString(),
        });
      }
      if (this.teachOutMode && packet.teachIn && value !== undefined) {
        const eep = packet.teachInInfo.eep.toString();
        await this.removeDevice(id);
        this.emit("teach-out-device", {
          id: id,
          eep: eep,
          rssi: packet.RSSI,
          lastSeen: new Date().toISOString(),
        });
      }
    }
  }
  async getDevice(id) {
    const knownKey = await db.get(id);
    if (knownKey !== undefined) {
      return JSON.parse(knownKey);
    }
    return undefined;
  }
  async setDevice(id, eep, data = {}) {
    await db.put(
      id,
      JSON.stringify({
        eep: eep,
        rssi: 0,
        lastSeen: new Date().toISOString(),
        lastData: data,
      })
    );
  }
  async removeDevice(id) {
    await db.del(id);
  }
  async getAllDevices() {
    const devices = [];
    for await (const [key, value] of db.iterator()) {
      devices.push({
        id: key,
        ...JSON.parse(value),
      });
    }
    return devices;
  }
  async clearDevices() {
    await db.clear();
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
