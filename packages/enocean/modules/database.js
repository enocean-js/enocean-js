/**
 * Copyright (c) 2025 Holger Will
 * Licensed under the MIT License
 * https://opensource.org/licenses/MIT
 * This file is part of the enocean-js project.
 */
import Database from "better-sqlite3";
import os from "os";
import path from "path";
import * as utils from "@enocean-js/utils";

function log(...args) {
  const tag = "[CORE - DB]";
  console.log(tag, ...args);
}

export class Memory {
  constructor(options) {
    this.options = options || { dbName: "default" };
    this.path = path.join(
      os.homedir(),
      `.enocean-js/${this.options.dbName}.sqlite`
    );
    log("File Path:", this.path);
    this.db = new Database(this.path);
    this.initialize();
  }

  memorize(
    input_id,
    output_id,
    communication_type,
    name,
    input_eep,
    output_eep,
    profile,
    direction = utils.DIRECTION_IN,
    manufacturer = "EnOcean"
  ) {
    if (typeof profile === "object") {
      profile = JSON.stringify(profile);
    }
    return this.db
      .prepare(
        "INSERT OR REPLACE INTO devices2 (input_id,input_rorg,output_id,output_rorg,output_id_int,type,name,input_eep,output_eep,profile,last_seen,direction,manufacturer) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)"
      )
      .run(
        input_id,
        input_eep ? input_eep.split("-")[0] : "",
        output_id,
        output_eep ? output_eep.split("-")[0] : "",
        output_id ? BigInt(parseInt(output_id, 16)) : null,
        communication_type,
        name,
        input_eep,
        output_eep,
        profile,
        Date.now(),
        direction,
        manufacturer
      );
  }

  storeRSSI(senderId, rssi) {
    this.db
      .prepare(
        "UPDATE devices2 SET last_seen = CURRENT_TIMESTAMP, rssi = ? WHERE input_id = ?"
      )
      .run([rssi, senderId]);
  }

  getDeviceEntries(id) {
    return this.db
      .prepare("SELECT * FROM devices2 WHERE input_id = ? OR output_id = ?")
      .all(id, id);
  }

  getDeviceEntriesRORG(id, rorg) {
    if (typeof rorg === "number") {
      rorg = rorg.toString(16).padStart(2, "0");
    }
    return this.db
      .prepare(
        "SELECT * FROM devices2 WHERE (input_id = ? and input_rorg = ?) "
      )
      .get(id, rorg);
  }

  getDeviceEntriesEEP(id, eep) {
    return this.db
      .prepare(
        "SELECT * FROM devices2 WHERE (input_id = ? and input_eep = ?) OR (output_id = ? and output_eep = ?)"
      )
      .get(id, eep, id, eep);
  }

  setDeviceName(id, name) {
    this.db
      .prepare(
        "UPDATE devices2 SET name = ? WHERE input_id = ? OR output_id = ?"
      )
      .run([name, id, id]);
  }

  setDeviceProfileRORG(id, rorg, profile) {
    if (typeof rorg === "number") {
      rorg = rorg.toString(16).padStart(2, "0");
    }
    return this.db
      .prepare(
        "UPDATE devices2 SET profile = ? , last_seen = CURRENT_TIMESTAMP WHERE (input_id = ? AND input_rorg = ?) OR (output_id = ? AND output_rorg = ?)"
      )
      .run(JSON.stringify(profile), id, rorg, id, rorg);
  }

  setDeviceProfileEEP(id, eep, profile) {
    return this.db
      .prepare(
        "UPDATE devices2 SET profile = ? , last_seen = CURRENT_TIMESTAMP WHERE input_id = ? AND input_eep = ?"
      )
      .run(JSON.stringify(profile), id, eep);
  }
  setDeviceOutputProfileEEP(id, eep, profile) {
    return this.db
      .prepare(
        "UPDATE devices2 SET profile = ? , last_seen = CURRENT_TIMESTAMP WHERE output_id = ? AND output_eep = ?"
      )
      .run(JSON.stringify(profile), id, eep);
  }
  deleteDevice(id, eep) {
    console.log("delete device", id, eep);
    return this.db
      .prepare(
        "DELETE FROM devices2 WHERE (input_id = ? and input_eep = ?) OR (output_id = ? and output_eep = ?)"
      )
      .run(id, eep, id, eep);
  }
  deleteDeviceByName(name) {
    return this.db.prepare("DELETE FROM devices2 WHERE name = ?").run(name);
  }
  getAllDevices() {
    return this.db.prepare("SELECT * FROM devices2").all();
  }
  getGroupedDevices() {
    return this.db
      .prepare("SELECT * FROM devices2")
      .all()
      .reduce((accumulator, current) => {
        const inputId = current.input_id;
        const outputId = current.output_id;
        const direction = current.direction;
        if (direction === 1) {
          if (!accumulator[inputId]) {
            accumulator[inputId] = [];
          }
          accumulator[inputId].push(current);
        } else {
          if (!accumulator[outputId]) {
            accumulator[outputId] = [];
          }
          accumulator[outputId].push(current);
        }
        return accumulator;
      }, {});
  }
  getVirtualDevice(id) {
    return this.db
      .prepare("SELECT * FROM devices2 WHERE output_id = ?")
      .get(id);
  }

  deleteVirtualDevice(id) {
    return this.db
      .prepare("DELETE FROM devices2 WHERE output_id like ?")
      .run(id);
  }

  getNewId() {
    // Get baseId or default to 0
    const baseRow = this.db
      .prepare(
        "SELECT CAST(value AS INTEGER) as baseId FROM meta WHERE key = 'baseId'"
      )
      .get();

    const baseId =
      baseRow && typeof baseRow.baseId === "number" ? baseRow.baseId : 0;
    // Find next available ID in range
    const result = this.db
      .prepare(
        `
      WITH nums(n) AS (
        SELECT ? + 1
        UNION ALL
        SELECT n + 1 FROM nums WHERE n < ? + 127
      )
      SELECT MIN(n) AS next_id
      FROM nums
      WHERE n NOT IN (SELECT output_id_int FROM devices2 WHERE output_id_int IS NOT NULL)
    `
      )
      .get(BigInt(baseId), BigInt(baseId));
    const nextId = result.next_id;
    return { int: nextId, hex: nextId.toString(16).padStart(8, "0") };
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
  getAllMetadata() {
    const data = this.db.prepare("SELECT * FROM meta").all();
    return data
      .map((item) => ({ [item.key]: item.value }))
      .reduce((a, b) => ({ ...a, ...b }), {});
  }
  initialize() {
    this.db.pragma("journal_mode = WAL");
    this.db.exec(
      "CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT)"
    );
    this.db.exec(`CREATE TABLE IF NOT EXISTS devices2 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        input_id TEXT,
        input_rorg TEXT,
        output_id TEXT,
        output_rorg TEXT,
        output_id_int INTERGER,
        type Text ,
        direction INTERGER,
        name TEXT,
        input_eep TEXT,
        output_eep TEXT,
        profile TEXT,
        last_seen INTEGER DEFAULT CURRENT_TIMESTAMP,
        rssi INTEGER,
        manufacturer TEXT
      )`);

    //this.db.exec("ALTER TABLE devices2 ADD COLUMN manufacturer TEXT");
    /*this.db.exec(
      "UPDATE devices2 SET direction = 1 WHERE type = 'bidi_in' OR type ='uni_in'"
    );
    this.db.exec(
      "UPDATE devices2 SET direction = 0 WHERE type = 'bidi_out' OR type ='uni_out'"
    );
    this.db.exec(
      "UPDATE devices2 SET type = 'bidi' WHERE type = 'bidi_in' OR type = 'bidi_out'"
    );

    this.db.exec(
      "UPDATE devices2 SET type = 'uni' WHERE type = 'uni_in' OR type = 'uni_out' "
    ); */

    //this.db.exec("DELETE FROM devices2 where input_rorg = 'd0'");
    //this.getNewId();
  }
}
