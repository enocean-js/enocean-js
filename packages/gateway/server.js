import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import { Enocean } from "@enocean-js/enocean";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clients = new Set();
const utils = Enocean.utils;

function log(...args) {
  const tag = "[GATEWAY]";
  console.log(tag, ...args);
}

// option: { dbName: "mydb", teachInTimeout: 60000 , serialPortPath: "/dev/ttyUSB0", ip: "0.0.0.0", port: 0xc0de}
export class EnoceanGateway {
  constructor(options) {
    this.enocean = new Enocean(options);
    this.options = options || {};
    this.options.ip = this.options.ip || "0.0.0.0";
    this.options.port = this.options.port || 0xc0de; // 49374 in decimal
    this.options.serialPortPath = this.options.serialPortPath || null;

    this.app = express();
    for (const eventName of utils.EventNames) {
      this.enocean.on(eventName, (data) => {
        sendSSE(eventName, data);
      });
    }
  }
  start() {
    return startServer(
      this.app,
      this.enocean,
      this.options.ip,
      this.options.port
    );
  }
}

function sendSSE(eventName, data) {
  //log("SSE Event:", eventName, data);
  if (typeof data === "Uint8Array") {
    data = Array.from(data);
  }
  if (typeof data === "undefined") {
    data = {};
  }
  for (const client of clients) {
    const message = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
    client.res.write(message);
  }
}

export function startServer(app, enocean, ip, port) {
  app.use(express.static(path.join(__dirname, "webroot")));
  app.use(
    express.static(path.join(__dirname, "node_modules/@enocean-js/utils/dist"))
  );
  app.use(
    express.static(
      path.join(__dirname, "node_modules/@enocean-js/gateway-api-client/dist")
    )
  );
  app.use(express.json());
  // API: openPort
  app.get("/api/open_port", (req, res) => {
    const port = req.query.port || "/dev/ttyUSB0";
    if (enocean.port && enocean.port.isOpen) {
      return res.json({ success: false, error: "Port already open" });
    }
    enocean.openSerialPort(port);
    const successHandler = (info) => {
      enocean.port.off("error", errorHandler);
      res.json({ success: true, ...info });
    };
    const errorHandler = (error) => {
      enocean.off("open", successHandler);
      res.json({ success: false, error: error.message });
    };
    enocean.once("ready", successHandler);
    enocean.port.once("error", errorHandler);
  });

  // API: closePort
  app.get("/api/close_port", (req, res) => {
    if (enocean.port && enocean.port.isOpen) {
      enocean.closeSerialPort();
      enocean.port.once("close", () => {
        res.json({ success: true });
      });
    } else {
      res.json({ success: false, error: "Port not open" });
    }
  });

  //API: isPortOpen
  app.get("/api/port_status", (req, res) => {
    if (enocean.port && enocean.port.isOpen) {
      enocean.emit("serialport-open");
      res.json({
        isOpen: true,
      });
    } else {
      enocean.emit("serialport-close");
      res.json({
        isOpen: false,
      });
    }
  });

  // API: listPorts
  app.get("/api/list_ports", async (req, res) => {
    let portList = await enocean.listPorts();
    res.json({ ports: portList });
  });

  // Event Stream endpoint (Server Send Events) - EventSource can connect here
  app.get("/api/events", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const client = { id: Date.now(), res };
    clients.add(client);
    log(`SSE client connected: ${client.id}`);
    //res.write("data: connected\n\n");
    req.on("close", () => {
      clients.delete(client);
      log(`SSE client disconnected: ${client.id}`);
      res.end();
    });
  });

  // API: startTeachIn
  app.get("/api/start-teachin-mode", (req, res) => {
    log("Starting teach-in mode");
    const timeout = req.query.timeout || null;
    res.json(enocean.teachInTimer.start(timeout));
  });

  // API: stopTeachIn
  app.get("/api/stop-teachin-mode", (req, res) => {
    res.json(enocean.teachInTimer.stop());
  });

  // API: startTeachOut
  app.get("/api/start-teachout-mode", (req, res) => {
    const timeout = req.query.timeout || null;
    res.json(enocean.teachOutTimer.start(timeout));
  });

  // API: stopTeachOut
  app.get("/api/stop-teachout-mode", (req, res) => {
    res.json(enocean.teachOutTimer.stop());
  });

  // API: getBaseId
  app.get("/api/base-id", async (req, res) => {
    res.json(await enocean.getBaseId());
  });

  // API: getSystemInfo
  app.get("/api/system-info", (req, res) => {
    res.json(enocean.systemInfo);
  });

  // API: getMeta
  app.get("/api/meta", (req, res) => {
    const key = req.query.key;
    const ret = enocean.memory.getMetadata(key);
    res.send(ret);
  });

  app.get("/api/all-meta", (req, res) => {
    return res.json(enocean.memory.getAllMetadata());
  });

  // API: setMeta
  app.get("/api/set-meta", (req, res) => {
    const { key, value } = req.query;
    enocean.memory.setMetadata(key, value);
    res.json({ success: true });
  });

  // API: getAllDevices
  app.get("/api/device-list", (req, res) => {
    res.json({ devices: enocean.memory.getGroupedDevices() });
  });

  // API: setDeviceName
  app.get("/api/device/:id/name/set", (req, res) => {
    const id = req.params.id;
    const name = req.query.name;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, error: "Missing device name parameter" });
    }
    enocean.memory.setDeviceName(id, name);
    res.json({ success: true });
  });

  // API: getDevice
  app.get("/api/device/:id", (req, res) => {
    const id = req.query.id;
    const key = req.query.key ? req.query.key : null;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, error: "Missing device id parameter" });
    }
    const device = enocean.memory.getDeviceById(id, key);
    if (device) {
      res.json({ success: true, device });
    } else {
      res.status(404).json({ success: false, error: "Device not found" });
    }
  });

  // API: addDevice
  app.post(
    "/api/device/" + utils.CREATE_NEW_DEVICE_FLAG,
    express.json(),
    async (req, res) => {
      let result = await enocean.createVirtualDevice(
        req.body.name,
        req.body.eep,
        utils.DIRECTION_OUT
      );
      res.json({ success: true });
    }
  );
  app.post("/api/device/:id", express.json(), (req, res) => {
    const eep = req.body.eep;
    const profile = enocean.getProfile(eep, 1); // just to check if EEP is valid
    const type = enocean.EEP.getEEP(eep).meta.communication_type;
    const name = req.body.name || "New Device";

    res.json(
      enocean.memory.memorize(
        req.params.id,
        null,
        type,
        name,
        eep,
        null,
        profile,
        utils.DIRECTION_IN
      )
    );
    enocean.emit("new-device-found", {
      output_id: null,
      output_eep: null,
      input_id: req.params.id,
      input_eep: eep,
      name: name,
      type: type,
      profile: JSON.stringify(profile),
      direction: 1,
    });
  });

  // API: removeDevice
  app.delete("/api/device/:id", express.json(), (req, res) => {
    const eep = req.body.eep || null;
    const id = req.params.id;
    const result = enocean.memory.deleteDevice(id, eep);
    res.json({ success: true, result });
  });

  // API: getAllVirtualDevices
  app.get("/api/virtual-device-list", (req, res) => {
    res.json({ devices: [] });
  });

  // API: addVirtualDevice
  app.post("/api/virtual-device", express.json(), (req, res) => {
    const device = this.createVirtualDevice(
      req.body.name,
      req.body.eep,
      req.body.io
    );
    res.json({ success: true, device: device });
  });

  // API: removeVirtualDevice
  app.delete("/api/virtual-device/:id", express.json(), (req, res) => {
    const id = req.params.id;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, error: "Missing virtual device id parameter" });
    }
    const result = enocean.memory.deleteVirtualDevice(id);
    if (result.changes > 0) {
      res.json({ success: true });
    } else {
      res
        .status(404)
        .json({ success: false, error: "Virtual Device not found" });
    }
  });

  app.get("/api/profile/:eep", (req, res) => {
    const eep = req.params.eep;
    res.json(enocean.getProfile(eep));
  });

  app.put("/api/pipe", () => {
    const packet = req.body;
    if (typeof packet === "string") {
      packet = utils.fromString(packet);
    }
    enocean.emit("data", packet);
  });

  app.post("/api/action/:id", async (req, res) => {
    const id = req.params.id;
    const prop = req.body;
    res.json(await enocean.doAction(id, prop));
  });

  return new Promise((resolve, reject) => {
    app.listen(port, ip, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
      log(`Server started, listening at http://${ip}:${port}`);
    });
  });
}
