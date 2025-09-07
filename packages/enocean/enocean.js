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
import * as EEP from "@enocean-js/eep";

//import pkg from "./package.json" with { type: "json" };
function log(...args) {
  const tag = "[CORE - enocean.js]";
  console.log(tag, ...args);
}

export class Enocean extends EventEmitter {
  constructor(options) {
    super({ wildcard: true });
    this.options = options || {};
    this.options.teachInTimeout = this.options.teachInTimeout || 60000; // ms
    this.hwInfo = {};

    this.memory = new Memory({
      dbName: this.options.dbName || "default",
    });

    if (options && options.serialPortPath) {
      this.memory.setMetadata("serialPortPath", options.serialPortPath);
    }

    const path = this.memory.getMetadata("serialPortPath");
    if (path) {
      this.openSerialPort(path);
    }

    this.teachInModeActive = false;
    this.teachOutModeActive = false;

    this.teachInTimer = new FlagSetTimer({
      enocean: this,
      flagName: "teachInModeActive",
      timeout: this.options.teachInTimeout,
      startEventName: "teach-in-started",
      stopEventName: "teach-in-stopped",
      countdownEventName: "teach-in-countdown",
      countdownInterval: 1000,
    });

    this.packetHandlers = {};
    this.registerPacketHandler(0x01, erp1PacketHandler); // Radio ERP1
  }

  registerPacketHandler(id, handler) {
    this.packetHandlers[id] = handler;
    this.on(utils.PacketTypeNameMap[id].eventName, handler.bind(this));
  }

  async init(baseIdResponse) {
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

    // Store all the hardware information in this.hwInfo
    this.hwInfo = {
      ...baseIdResponse,
      ...version,
      ...selfTestResult,
      ...frequencyInfo,
      ...dbInfo,
      // enoceanVersion: pkg.version,
    };
    //log("Enocean hardware info:", this.hwInfo);
    this.emit("ready", this.hwInfo);
  }

  closeSerialPort() {
    if (this.port && this.port.isOpen) {
      this.port.close();
    }
  }

  async openSerialPort(port, baudRate = 57600) {
    this.port = new SerialPort({
      path: port,
      baudRate: baudRate,
    });

    // setup parser and pipe serialport to parser
    this.parser = new ESP3Parser();
    this.port.pipe(this.parser);

    this.port.on("open", () => {
      // Get base ID, init, and emit "ready" event
      this.emit("serialport-open", { port: port, baudRate: baudRate });
      CC.getBaseId(this)
        .then(this.init.bind(this))
        .catch((error) => {
          this.emit("error", error);
        });
      // Handle parser events
      this.parser.on("data", this.handleData.bind(this));
      // this.on("response", (data) => { console.log("Response:", utils.toString(data)); });
    });
    this.port.on("close", () => {
      this.port.removeAllListeners();
      this.parser.removeAllListeners();
      this.emit("serialport-close");
    });
    this.port.on("error", (error) => {
      this.emit("error", error);
    });
  }
  async getBaseId() {
    return await CC.getBaseId(this);
  }
  async listPorts() {
    let portList = await SerialPort.list();
    portList = portList.filter((port) => {
      return port.vendorId != undefined && port.productId != undefined;
    });
    return portList;
  }
  getProfile(eep) {
    const eepid = eep.split("-").join("");
    return EEP[eepid].profile();
  }

  async handleData(data) {
    this.emit("data", data);
    this.emit(
      utils.PacketTypeNameMap[utils.getPacketType(data)].eventName, // radio-erp1, response, ...
      data
    );
  }

  async send(telegram) {
    // TODO: validate telegram before sending (check length, datalength, optionallenght, and CRCs)
    if (typeof telegram === "string") {
      telegram = utils.fromString(telegram);
    }
    return new Promise((resolve, reject) => {
      const onResponse = (data) => {
        this.off("error", onError);
        resolve(data);
      };
      const onError = (err) => {
        this.off("response", onResponse);
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
