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

  CREATE TABLE IF NOT EXISTS vdps (
    id TEXT PRIMARY KEY,
    name TEXT,
    profileName TEXT NOT NULL,
    state TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bindings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL UNIQUE,
    destination TEXT NOT NULL
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
      learnEep: db.prepare(`
        INSERT INTO profiles (deviceId, rorg, eep, lastSeen)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(deviceId, rorg) DO UPDATE SET
        eep = excluded.eep,
        lastSeen = excluded.lastSeen
      `),
      insertProfile: db.prepare(
        "INSERT INTO profiles (deviceId, rorg, lastRawPayload, lastSeen) VALUES (?, ?, ?, ?)"
      ),
      updateUnrecognizedProfile: db.prepare(
        "UPDATE profiles SET lastRawPayload = ?, lastSeen = ? WHERE profileId = ?"
      ),
      updateRecognizedProfile: db.prepare(
        "UPDATE profiles SET lastData = ?, lastRawPayload = ?, lastSeen = ? WHERE profileId = ?"
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
      // VDP Statements
      createVdp: db.prepare(
        "INSERT INTO vdps (id, name, profileName, state) VALUES (?, ?, ?, ?)"
      ),
      getVdp: db.prepare("SELECT * FROM vdps WHERE id = ?"),
      getAllVdps: db.prepare("SELECT * FROM vdps"),
      updateVdpState: db.prepare("UPDATE vdps SET state = ? WHERE id = ?"),
      deleteVdp: db.prepare("DELETE FROM vdps WHERE id = ?"),
      // Binding Statements
      createBinding: db.prepare(
        "INSERT OR REPLACE INTO bindings (source, destination) VALUES (?, ?)"
      ),
      getBindingForSource: db.prepare(
        "SELECT * FROM bindings WHERE source = ?"
      ),
      deleteBinding: db.prepare("DELETE FROM bindings WHERE id = ?"),
    };
    this.syncEepMetadata();
  }

  syncEepMetadata() {
    const sync = db.transaction(() => {
      for (const rorgInfo of EnoceanLib.rorgs) {
        this.stmts.upsertRorg.run(rorgInfo.rorg.toLowerCase(), rorgInfo.title);
      }
      for (const eep of Object.values(EnoceanLib.EEP)) {
        if (!eep.eep || !eep.rorg_number) continue;
        const rorg = eep.rorg_number.replace("0x", "").toLowerCase();
        const func = eep.func_number.replace("0x", "").toLowerCase();
        const type = eep.number.replace("0x", "").toLowerCase();
        const fullEep = eep.eep.toLowerCase().replace(/-/g, "");
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

  learnEep(deviceId, eep) {
    const rorg = eep.substring(0, 2).toLowerCase();
    db.transaction(() => {
      const now = new Date().toISOString();
      // 1. Ensure the parent device record exists.
      if (!this.stmts.findDevice.get(deviceId)) {
        this.stmts.insertDevice.run(deviceId, `Device ${deviceId}`, now);
      }
      // 2. Atomically insert or update the profile with the new EEP.
      //console.log("Learning EEP:", deviceId, rorg, eep);
      this.stmts.learnEep.run(deviceId, rorg, eep, now);
      //console.log(this.memory.findProfile(packet.senderId, "f6"));
      // 3. Mark the device as recognized.
      this.stmts.setDeviceRecognized.run(deviceId);
    })();
  }

  getDevice(id) {
    return this.stmts.findDevice.get(id);
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

  findDevice(id) {
    return this.stmts.findDevice.get(id);
  }

  insertDevice(id, name, lastSeen) {
    return this.stmts.insertDevice.run(id, name, lastSeen);
  }

  updateDeviceSeen(lastSeen, id) {
    return this.stmts.updateDeviceSeen.run(lastSeen, id);
  }

  findProfile(deviceId, rorg) {
    return this.stmts.findProfile.get(deviceId, rorg);
  }

  insertProfile(deviceId, rorg, lastRawPayload, lastSeen) {
    return this.stmts.insertProfile.run(
      deviceId,
      rorg,
      lastRawPayload,
      lastSeen
    );
  }

  updateRecognizedProfile(profileId, lastData, lastRawPayload, lastSeen) {
    return this.stmts.updateRecognizedProfile.run(
      profileId,
      lastData,
      lastRawPayload,
      lastSeen
    );
  }

  updateUnrecognizedProfile(profileId, lastRawPayload, lastSeen) {
    return this.stmts.updateUnrecognizedProfile.run(
      profileId,
      lastRawPayload,
      lastSeen
    );
  }

  clearAllData() {
    db.exec(
      "DELETE FROM packet_log; DELETE FROM profiles; DELETE FROM devices; DELETE FROM virtual_devices; DELETE FROM vdps; DELETE FROM bindings;"
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
    const newDevice = this.getVirtualDevice(newSenderId);
    // Parse the profile back to JSON before returning
    if (newDevice) {
      newDevice.profile = JSON.parse(newDevice.profile);
    }
    return newDevice;
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

  // --- VDP and Binding Methods ---

  createVdp(id, name, profileName, initialState) {
    this.stmts.createVdp.run(
      id,
      name,
      profileName,
      JSON.stringify(initialState)
    );
    return this.getVdp(id);
  }

  getVdp(id) {
    const vdp = this.stmts.getVdp.get(id);
    if (vdp) {
      vdp.state = JSON.parse(vdp.state);
    }
    return vdp;
  }

  getAllVdps() {
    const vdps = this.stmts.getAllVdps.all();
    return vdps.map((vdp) => ({
      ...vdp,
      state: JSON.parse(vdp.state),
    }));
  }

  updateVdpState(id, newState) {
    return this.stmts.updateVdpState.run(JSON.stringify(newState), id);
  }

  deleteVdp(id) {
    return this.stmts.deleteVdp.run(id);
  }

  createBinding(source, destination) {
    return this.stmts.createBinding.run(
      JSON.stringify(source),
      JSON.stringify(destination)
    );
  }

  getBindingForSource(source) {
    const binding = this.stmts.getBindingForSource.get(JSON.stringify(source));
    if (binding) {
      binding.source = JSON.parse(binding.source);
      binding.destination = JSON.parse(binding.destination);
    }
    return binding;
  }

  deleteBinding(id) {
    return this.stmts.deleteBinding.run(id);
  }
}

export default Memory;
