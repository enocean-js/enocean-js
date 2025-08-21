import Database from "better-sqlite3";
import os from "os";
import path from "path";
import * as EnoceanLib from "@enocean-js/enocean-js-lib";

const dbPath = path.join(os.homedir(), ".enocean-js/memory.sqlite");
const db = new Database(dbPath);

// This schema is designed to handle recognized and unrecognized devices/profiles.
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY,
    name TEXT,
    isRecognized INTEGER DEFAULT 0,
    lastSeen TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS profiles (
    profileId INTEGER PRIMARY KEY AUTOINCREMENT,
    deviceId TEXT NOT NULL,
    rorg TEXT NOT NULL,
    eep TEXT,
    lastData TEXT,
    lastRawPayload TEXT,
    lastSeen TEXT NOT NULL,
    FOREIGN KEY (deviceId) REFERENCES devices (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS packet_log (
    logId INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    senderId TEXT NOT NULL,
    rorg TEXT,
    payload TEXT,
    rssi INTEGER,
    isTeachIn INTEGER,
    isDecoded INTEGER DEFAULT 0,
    rawData TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS rorgs (
    rorg TEXT PRIMARY KEY,
    title TEXT
  );

  CREATE TABLE IF NOT EXISTS eeps (
    eep TEXT PRIMARY KEY,
    rorg TEXT NOT NULL,
    func TEXT NOT NULL,
    type TEXT NOT NULL,
    funcTitle TEXT,
    typeTitle TEXT,
    FOREIGN KEY (rorg) REFERENCES rorgs (rorg) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS virtual_devices (
    virtualDeviceId INTEGER PRIMARY KEY AUTOINCREMENT,
    senderId TEXT UNIQUE NOT NULL,
    name TEXT,
    eep TEXT,
    profile TEXT
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_device_rorg ON profiles (deviceId, rorg);
`);

class Memory {
  constructor() {
    this.stmts = {
      // EEP Metadata Statements
      upsertRorg: db.prepare(
        "INSERT OR REPLACE INTO rorgs (rorg, title) VALUES (?, ?)"
      ),
      upsertEep: db.prepare(
        "INSERT OR REPLACE INTO eeps (eep, rorg, func, type, funcTitle, typeTitle) VALUES (?, ?, ?, ?, ?, ?)"
      ),
      // Device Statements
      findDevice: db.prepare("SELECT * FROM devices WHERE id = ?"),
      insertDevice: db.prepare(
        "INSERT INTO devices (id, name, lastSeen) VALUES (?, ?, ?)"
      ),
      updateDeviceSeen: db.prepare(
        "UPDATE devices SET lastSeen = ? WHERE id = ?"
      ),
      setDeviceRecognized: db.prepare(
        "UPDATE devices SET isRecognized = 1 WHERE id = ?"
      ),
      setDeviceName: db.prepare("UPDATE devices SET name = ? WHERE id = ?"),
      removeDevice: db.prepare("DELETE FROM devices WHERE id = ?"),
      getDevice: db.prepare(`
        SELECT d.id, d.name, d.isRecognized, d.lastSeen, (
          SELECT json_group_array(json_object('rorg', p.rorg, 'eep', p.eep, 'lastData', json(p.lastData), 'lastRawPayload', p.lastRawPayload, 'lastSeen', p.lastSeen))
          FROM profiles p WHERE p.deviceId = d.id
        ) as profiles
        FROM devices d WHERE d.id = ?
      `),
      getAllDevices: db.prepare(`
        SELECT d.id, d.name, d.isRecognized, d.lastSeen, (
          SELECT json_group_array(json_object('rorg', p.rorg, 'eep', p.eep, 'lastData', json(p.lastData), 'lastRawPayload', p.lastRawPayload, 'lastSeen', p.lastSeen))
          FROM profiles p WHERE p.deviceId = d.id
        ) as profiles
        FROM devices d
      `),
      // Profile Statements
      findProfile: db.prepare(
        "SELECT * FROM profiles WHERE deviceId = ? AND rorg = ?"
      ),
      insertProfile: db.prepare(
        "INSERT INTO profiles (deviceId, rorg, lastRawPayload, lastSeen) VALUES (?, ?, ?, ?)"
      ),
      updateUnrecognizedProfile: db.prepare(
        "UPDATE profiles SET lastRawPayload = ?, lastSeen = ? WHERE profileId = ?"
      ),
      updateRecognizedProfile: db.prepare(
        "UPDATE profiles SET lastData = ?, lastRawPayload = ?, lastSeen = ? WHERE profileId = ?"
      ),
      learnEep: db.prepare(
        "UPDATE profiles SET eep = ? WHERE deviceId = ? AND rorg = ?"
      ),
      // Packet Log Statement
      logPacket: db.prepare(
        "INSERT INTO packet_log (timestamp, senderId, rorg, payload, rssi, isTeachIn, rawData, isDecoded) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      ),
      markPacketDecoded: db.prepare(
        "UPDATE packet_log SET isDecoded = 1 WHERE logId = ?"
      ),
      // Virtual Device Statements
      getAllVirtualSenderIds: db.prepare(
        "SELECT senderId FROM virtual_devices"
      ),
      insertVirtualDevice: db.prepare(
        "INSERT INTO virtual_devices (senderId, name, eep, profile) VALUES (?, ?, ?, ?)"
      ),
      removeVirtualDevice: db.prepare(
        "DELETE FROM virtual_devices WHERE senderId = ?"
      ),
      getVirtualDevice: db.prepare(
        "SELECT * FROM virtual_devices WHERE senderId = ?"
      ),
      getAllVirtualDevices: db.prepare("SELECT * FROM virtual_devices"),
    };
    this.syncEepMetadata();
  }

  syncEepMetadata() {
    const sync = db.transaction(() => {
      for (const rorgInfo of EnoceanLib.rorgs) {
        this.stmts.upsertRorg.run(rorgInfo.rorg, rorgInfo.title);
      }
      for (const eep of Object.values(EnoceanLib.EEP)) {
        if (!eep.eep || !eep.rorg_number) continue;
        const rorg = eep.rorg_number.replace("0x", "").toUpperCase();
        const func = eep.func_number.replace("0x", "").toUpperCase();
        const type = eep.number.replace("0x", "").toUpperCase();
        const fullEep = eep.eep.toUpperCase().replace(/-/g, "");
        this.stmts.upsertRorg.run(rorg, eep.rorg_title);
        this.stmts.upsertEep.run(
          fullEep,
          rorg,
          func,
          type,
          eep.func_title,
          eep.title
        );
      }
    });
    sync();
  }

  processPacket(packet) {
    const now = new Date().toISOString();
    const senderId = packet.senderId;
    const rorg = EnoceanLib.toHex(packet.RORG);
    const payload = EnoceanLib.toHex(packet.payload);
    const events = [];

    const logInfo = this.stmts.logPacket.run(
      now,
      senderId,
      rorg,
      payload,
      packet.RSSI,
      packet.teachIn ? 1 : 0,
      packet.toString(),
      0
    );
    const logId = logInfo.lastInsertRowid;

    db.transaction(() => {
      let device = this.stmts.findDevice.get(senderId);
      if (!device) {
        this.stmts.insertDevice.run(senderId, `Device ${senderId}`, now);
        events.push({ name: "new-device-seen", payload: { id: senderId } });
      } else {
        this.stmts.updateDeviceSeen.run(now, senderId);
      }

      let profile = this.stmts.findProfile.get(senderId, rorg);
      if (!profile) {
        this.stmts.insertProfile.run(senderId, rorg, payload, now);
        events.push({
          name: "new-profile-seen",
          payload: { id: senderId, rorg: rorg },
        });
        profile = this.stmts.findProfile.get(senderId, rorg);
      }

      if (profile.eep) {
        try {
          const decoded = packet.decode(profile.eep);
          this.stmts.updateRecognizedProfile.run(
            JSON.stringify(decoded),
            payload,
            now,
            profile.profileId
          );
          this.stmts.markPacketDecoded.run(logId);
          events.push({
            name: "decoded-data",
            payload: { id: senderId, rorg: rorg, eep: profile.eep, ...decoded },
          });
        } catch (e) {
          this.stmts.updateUnrecognizedProfile.run(
            payload,
            now,
            profile.profileId
          );
          events.push({
            name: "decode-error",
            payload: {
              id: senderId,
              rorg: rorg,
              eep: profile.eep,
              error: e.message,
            },
          });
        }
      } else {
        this.stmts.updateUnrecognizedProfile.run(
          payload,
          now,
          profile.profileId
        );
        events.push({
          name: "unrecognized-data",
          payload: { id: senderId, rorg: rorg, payload: payload },
        });
      }
    })();
    return events;
  }

  learnEep(deviceId, eep) {
    const rorg = eep.substring(0, 2).toUpperCase();
    db.transaction(() => {
      const now = new Date().toISOString();
      if (!this.stmts.findDevice.get(deviceId)) {
        this.stmts.insertDevice.run(deviceId, `Device ${deviceId}`, now);
      }
      if (!this.stmts.findProfile.get(deviceId, rorg)) {
        this.stmts.insertProfile.run(deviceId, rorg, "", now);
      }
      this.stmts.learnEep.run(eep, deviceId, rorg);
      this.stmts.setDeviceRecognized.run(deviceId);
    })();
  }

  getDevice(id) {
    const device = this.stmts.getDevice.get(id);
    if (device && device.profiles) {
      device.profiles = JSON.parse(device.profiles);
    }
    return device;
  }

  setDeviceName(id, name) {
    this.stmts.setDeviceName.run(name, id);
  }

  removeDevice(id) {
    this.stmts.removeDevice.run(id);
  }

  getAllDevices() {
    const devices = this.stmts.getAllDevices.all();
    return devices.map((d) => ({
      ...d,
      profiles: d.profiles ? JSON.parse(d.profiles) : [],
    }));
  }

  clearAllData() {
    db.exec(
      "DELETE FROM packet_log; DELETE FROM profiles; DELETE FROM devices; DELETE FROM virtual_devices;"
    );
  }

  createVirtualDevice(baseId, name, eep, profile = {}) {
    const usedIds = this.stmts.getAllVirtualSenderIds
      .all()
      .map((row) => parseInt(row.senderId, 16));
    const baseIdNum = parseInt(baseId, 16);
    let nextOffset = -1;

    for (let i = 0; i < 128; i++) {
      if (!usedIds.includes(baseIdNum + i)) {
        nextOffset = i;
        break;
      }
    }

    if (nextOffset === -1) {
      throw new Error(
        "Virtual device ID pool is exhausted. No free IDs available."
      );
    }

    const newSenderId = (baseIdNum + nextOffset)
      .toString(16)
      .toUpperCase()
      .padStart(8, "0");
    const profileString = JSON.stringify(profile);

    this.stmts.insertVirtualDevice.run(newSenderId, name, eep, profileString);
    return this.getVirtualDevice(newSenderId);
  }

  removeVirtualDevice(senderId) {
    return this.stmts.removeVirtualDevice.run(senderId);
  }

  getVirtualDevice(senderId) {
    const device = this.stmts.getVirtualDevice.get(senderId);
    if (device && device.profile) {
      device.profile = JSON.parse(device.profile);
    }
    return device;
  }

  getAllVirtualDevices() {
    const devices = this.stmts.getAllVirtualDevices.all();
    return devices.map((d) => ({
      ...d,
      profile: d.profile ? JSON.parse(d.profile) : {},
    }));
  }
}

export default Memory;
