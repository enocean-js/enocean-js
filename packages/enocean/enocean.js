/**
 * Copyright (c) 2025 Holger Will
 * Licensed under the MIT License
 * https://opensource.org/licenses/MIT
 * This file is part of the enocean-js project.
 */
import { ESP3Parser } from "@enocean-js/serialport-parser";
import * as utils from "@enocean-js/utils";

import { EventEmitter } from "node:events";
import { SerialPort } from "serialport";

import { Memory } from "./modules/database.js";
import * as CC from "./modules/commands.js";
import { FlagSetTimer } from "./modules/flag-set-timer.js";

import { onPacket as erp1PacketHandler } from "./packet_handlers/radio_erp1.js";
import { ProfileManager } from "@enocean-js/eep";
const EEP = await ProfileManager.getInstance();

import merge from "lodash.merge";
import semver from "semver";

//import pkg from "./package.json" with { type: "json" };
function log(...args) {
  console.log(...args);
}

export class Enocean extends EventEmitter {
  constructor(options) {
    super();
    log("Starting enocean-js...");
    this.EEP = EEP;
    this.options = options || {};
    this.options.teachInTimeout = this.options.teachInTimeout || 60000; // ms
    this.systemInfo = {};
    this.packetHandlers = {};
    this.teachInModeActive = false;
    this.teachOutModeActive = false;
    this.port = null;
    this.parser = null;

    this.teachInTimer = new FlagSetTimer({
      enocean: this,
      flagName: "teachInModeActive",
      timeout: this.options.teachInTimeout,
      startEventName: "teach-in-started",
      stopEventName: "teach-in-stopped",
      countdownEventName: "teach-in-countdown",
      countdownInterval: 1000,
    });
    log("setting up memory");

    this.memory = new Memory({
      dbName: this.options.dbName || "default",
    });

    log("setting up serialport");
    // try to autodedetect serial port path

    if (options && options.serialPortPath) {
      this.memory.setMetadata("serialPortPath", options.serialPortPath);
    }

    const path = this.memory.getMetadata("serialPortPath");
    if (path) {
      this.openSerialPort(path);
    } else {
      log("No serial port path configured. trying to auto-detect");
      this.autoDetectPort();
    }

    log("registering packet handlers");
    this.registerPacketHandler(0x01, erp1PacketHandler); // Radio ERP1

    log("loading EEPs");

    this.memory.getAllDevices().forEach((dev) => {
      const profile = JSON.parse(dev.profile || "{}");
      if (dev.direction === 1) {
        const eeProfile = EEP.getEEP(dev.input_eep).profile(utils.DIRECTION_IN);
        if (semver.gt(eeProfile.meta.version, profile.meta.version)) {
          this.memory.setDeviceProfileEEP(
            dev.input_id,
            dev.input_eep,
            merge({}, profile, eeProfile)
          );
          console.log(
            `Updated profile for device ${dev.name} from ${profile.meta.version} to ${eeProfile.meta.version}`
          );
        }
      } else {
        const eeProfile = EEP.getEEP(dev.output_eep).profile(
          utils.DIRECTION_OUT
        );
        if (semver.gt(eeProfile.meta.version, profile.meta.version)) {
          this.memory.setDeviceOutputProfileEEP(
            dev.output_id,
            dev.output_eep,
            merge({}, profile, eeProfile)
          );
          console.log(
            `Updated profile for device ${dev.name} from ${profile.meta.version} to ${eeProfile.meta.version}`
          );
        }
      }
    });
    log("enocean-js started");
    // ---------------------------------------------------------------------------
    // Test code (memory available)
    // ---------------------------------------------------------------------------
    // console.log(EEP.getEEP("f6-02-01").profile("IN"));
    // this.memory.deleteDeviceByName("Test Switch");
    // console.log("Create test switch");
    // this.createVirtualDevice("Test Switch", "f6-02-01", "uni_out");
    // console.log(this.memory.getAllDevices());
    // console.log(this.memory.getNewId().toString(16).padStart(8, "0"));
    // console.log((4292987522.0).toString(16).padStart(8, "0"));
    // console.log(
    //   utils.decodeA5TeachIn(
    //     utils.erp1.getPayload(
    //       utils.fromString("55000a0701eba5441002a0ffd031060000ffffffff5000af")
    //     )
    //   )
    // );
    this.on("ready", (si) => {
      // more test code when everything is ready
    });
  }

  registerPacketHandler(id, handler) {
    this.packetHandlers[id] = handler;
    this.on(utils.PacketTypeNameMap[id].eventName, handler.bind(this));
  }

  async init(baseIdResponse) {
    log("calling init()...");
    // init() gets called from openSerialPort()
    // Get more information about the enocean hardware module using common commands.
    const version = await CC.getVersion(this);
    const selfTestResult = await CC.selfTest(this);
    const frequencyInfo = await CC.getFrequencyInfo(this);

    // Setup memory (database) and get some information about it.
    // if you want to run mutiple instances of enocean-js you have to set different dbNames in the options.

    // Make sure the baseId is stored in the database and matches the one we got from the module.
    this.checkAndStoreBaseId(baseIdResponse);

    const numDevices = this.memory.getAllDevices().length;
    const dbInfo = { dbPath: this.memory.path, deviceCount: numDevices };

    // Store all the System information in this.systemInfo
    this.systemInfo = {
      ...baseIdResponse,
      ...version,
      ...selfTestResult,
      ...frequencyInfo,
      ...dbInfo,
      // enoceanVersion: pkg.version,
    };
    log("Enocean System Info:", JSON.stringify(this.systemInfo, null, 2));
    this.emit("ready", this.systemInfo);
  }

  closeSerialPort() {
    if (this.port && this.port.isOpen) {
      this.port.close();
    }
  }

  async openSerialPort(port, baudRate = 57600) {
    log(`Opening serial port ${port} with baudrate ${baudRate}...`);
    this.port = new SerialPort({
      path: port,
      baudRate: baudRate,
    });
    log("setup parser and pipe serialport to parser");
    // setup parser and pipe serialport to parser
    this.parser = new ESP3Parser();
    this.port.pipe(this.parser);

    this.port.on("open", () => {
      // Get base ID, init, and emit "ready" event
      log("Serial port opened");
      this.memory.setMetadata("serialPortPath", port);
      this.emit("serialport-open", { port: port, baudRate: baudRate });
      CC.getBaseId(this)
        .then(this.init.bind(this)) // calling init() after getting baseId
        .catch((error) => {
          this.emit("error", error);
        });
      // Handle parser events
      log("setup parser data handler");
      this.parser.on("data", this.handleData.bind(this));
      // this.on("response", (data) => { console.log("Response:", utils.toString(data)); });
    });
    this.port.on("close", () => {
      log("Serial port closed");
      this.port.removeAllListeners();
      this.parser.removeAllListeners();
      this.emit("serialport-close");
    });
    this.port.on("error", (error) => {
      log("Serial port error:", error);
      this.emit("error", error);
    });
  }
  async getBaseId() {
    let ret = await CC.getBaseId(this);
    return ret;
  }
  async listPorts() {
    let portList = await SerialPort.list();
    // portList = portList.filter((port) => {
    //   return port.vendorId != undefined && port.productId != undefined;
    // });
    return portList;
  }
  async autoDetectPort() {
    let ports = await this.listPorts();
    ports = ports.filter((p) => {
      return p.manufacturer && p.manufacturer.toLowerCase().includes("enocean");
    });
    if (ports.length === 0) {
      log("No enocean serial ports found, please call openSerialPort(path)!");
    } else if (ports.length === 1) {
      log("One enocean serial port found, saved and using it:", ports[0].path);
      this.openSerialPort(ports[0].path);
      this.memory.setMetadata("serialPortPath", ports[0].path);
    } else {
      log(
        "Multiple enocean serial ports found, please call openSerialPort(path)!"
      );
      ports.forEach((port) => {
        log(` - ${port.path} (${port.manufacturer || "unknown manufacturer"})`);
      });
    }
  }
  getProfile(eep, io = 1) {
    return EEP.getEEP(eep).profile(io);
  }

  createVirtualDevice(name, eep, direction = utils.DIRECTION_OUT) {
    const newId = this.memory.getNewId().hex;
    const profile = JSON.stringify(this.getProfile(eep, direction));
    const type = EEP.getEEP(eep).meta.type;
    let dev = this.memory.memorize(
      null,
      newId,
      type,
      name,
      null,
      eep,
      profile,
      direction
    );
    this.emit("new-device-found", {
      output_id: newId,
      output_eep: eep,
      input_id: null,
      input_eep: null,
      name: name,
      type: type,
      profile,
      direction,
    });
  }

  async handleData(data) {
    this.emit("data", data);
    this.emit(
      utils.PacketTypeNameMap[utils.getPacketType(data)].eventName, // radio-erp1, response, ...
      data
    );
  }
  async doAction(id, prop) {
    // first get the divice from db, if it has only one eep, use that info. that makse prop.eep optional.
    // if there are more than eep, rorg is enough.
    // if rorg is d0 or eep starts with d0, dont check db, just send the signal!
    if (prop.eep && prop.eep.startsWith("d0")) {
      const encoder = EEP.getEEP(prop.eep);
      const encoded = encoder.encode(prop);
      const tel = utils.erp1.createERP1Telegram({
        rorg: parseInt(prop.eep.split("-")[0], 16),
        senderId: utils.fromString(id),
        payload: encoded.payload,
        status: encoded.status || 0,
        destinationId: utils.fromString("ffffffff"),
      });
      return await this.send(tel);
    }
    const device = this.memory.getDeviceEntries(id)[0];
    console.log(device.output_eep);
    const encoder = EEP.getEEP(device.output_eep);
    const encoded = encoder.encode(prop);
    const tel = utils.erp1.createERP1Telegram({
      rorg: parseInt(device.output_eep.split("-")[0], 16),
      senderId: utils.fromString(id),
      payload: encoded.payload,
      status: encoded.status || 0,
      destinationId: utils.fromString("ffffffff"),
    });
    return await this.send(tel);
  }

  async send(telegram) {
    // TODO: validate telegram before sending (check length, datalength, optionallenght, and CRCs)
    if (typeof telegram === "string") {
      telegram = utils.fromString(telegram);
    }

    return new Promise((resolve, reject) => {
      const onResponse = (data) => {
        this.removeListener("error", onError);
        if (data[6] != 0) {
          log("error sending data");
          reject("data not sent");
        } else {
          log("sent successfuly");
          resolve({ success: true, data: data });
        }
      };
      const onError = (err) => {
        this.removeListener("response", onResponse);
        reject(err);
      };
      this.once("response", onResponse);
      this.once("error", onError);
      this.port.write(telegram);
    });
  }

  checkAndStoreBaseId(baseIdResponse) {
    // Check if the baseId stored in the DB matches the one we got from the module.
    // this can occure when your enocean usb stick or othe rharware breacks and you have to replace it.
    // In this case you can set the baseId of the new usb stick to the id of the old stick,
    // SHOULD WE AUTOFIX THIS HERE?
    const baseIdMem = this.memory.getMetadata("baseId");
    if (
      baseIdMem &&
      baseIdMem != parseInt("0x" + baseIdResponse.baseId, "hex")
    ) {
      // throw or autofix?
      throw new Error(
        `Base ID mismatch! Stored in DB: ${baseIdMem}, got from module: ${parseInt(
          "0x" + baseIdResponse.baseId,
          "hex"
        )}.`
      );
    } else {
      this.memory.setMetadata(
        "baseId",
        BigInt(parseInt("0x" + baseIdResponse.baseId, "hex"))
      );
    }
  }
}
Enocean.utils = utils;
