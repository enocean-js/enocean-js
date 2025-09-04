/**
 * Copyright (c) 2025 Holger Will
 * Licensed under the MIT License
 * https://opensource.org/licenses/MIT
 * This file is part of the enocean-js project.
 */
import Database from "better-sqlite3";
import os from "os";
import path from "path";

export class Memory {
  constructor(options) {
    this.options = options || { dbName: "default" };
    this.path = path.join(
      os.homedir(),
      `.enocean-js/${this.options.dbName}.sqlite`
    );
    console.log("DB Path:", this.path);
    this.db = new Database(this.path);
    this.initialize();
  }
  learn(senderId, eep, profile, name = "New Device") {
    this.db
      .prepare(
        "INSERT OR REPLACE INTO devices (id,device_id,name,eep,profile,last_seen) VALUES (?,?,?,?,?,?)"
      )
      .run(
        `${senderId}_${eep.split("-")[0]}`,
        senderId,
        name,
        eep,
        profile,
        Date.now()
      );
  }
  storeTelegram(senderId, eep, telegram) {
    this.db
      .prepare(
        "UPDATE device_eep SET last_telegram = ?, last_seen = CURRENT_TIMESTAMP WHERE device_id = ? AND eep = ?"
      )
      .run([telegram, senderId, eep]);
  }
  getDevice(id, rorg) {
    return this.db
      .prepare("SELECT * FROM devices WHERE id = ?")
      .get(id + "_" + rorg);
  }
  getAllDevices() {
    return this.db.prepare("SELECT * FROM devices").all();
  }

  createVirtualDevice(name, eep, profile) {
    const result = this.db
      .prepare(
        `WITH base AS (
          SELECT CAST( value AS INTEGER) as baseId FROM meta WHERE key = 'baseId'
        ),
        nums(n) AS (
          SELECT baseId + 1 FROM base
          UNION ALL
          SELECT n + 1 FROM nums, base WHERE n < baseId + 127
        )
        SELECT MIN(n) AS next_id
        FROM nums
        WHERE n NOT IN (SELECT id FROM virtual_devices);`
      )
      .get();
    this.db
      .prepare(
        "INSERT OR REPLACE INTO virtual_devices (id, name, eep, profile) VALUES (?, ?, ?, ?)"
      )
      .run(BigInt(result.next_id), name, eep, JSON.stringify(profile));
    return result.next_id.toString(16).padStart(8, "0");
  }
  setMetadata(key, value) {
    this.db
      .prepare("INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)")
      .run(key, value);
  }
  getMetadata(key) {
    const row = this.db
      .prepare("SELECT value FROM meta WHERE key = ?")
      .get(key);
    return row ? row.value : null;
  }
  initialize() {
    this.db.pragma("journal_mode = WAL");
    this.db.exec(
      "CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT)"
    );
    this.db.exec(`CREATE TABLE IF NOT EXISTS devices (
        id TEXT PRIMARY KEY,
        device_id TEXT,
        name TEXT,
        eep TEXT,
        profile TEXT,
        last_seen INTEGER DEFAULT CURRENT_TIMESTAMP,
        last_telegram TEXT
      )`);
    this.db.exec(`CREATE TABLE IF NOT EXISTS virtual_devices (
        id INTEGER PRIMARY KEY,
        name TEXT,
        eep TEXT,
        profile TEXT
      )`);
  }
}
