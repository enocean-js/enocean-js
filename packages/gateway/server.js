import express from "express";
import os from "os";
import { fileURLToPath } from "url";
import path from "path";
import { Enocean } from "@enocean-js/enocean";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clients = new Set();
const utils = Enocean.utils;

const enocean = new Enocean();

function sendSSE(eventName, data) {
  for (const client of clients) {
    const message = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
    client.res.write(message);
  }
}

for (const eventName of utils.EventNames) {
  enocean.on(eventName, (data) => {
    sendSSE(eventName, data);
  });
}

export function startServer() {
  const app = express();
  const ip = getLocalIp();
  const port = 0xc0de; // 49374 in decimal
  app.use(express.static(path.join(__dirname, "webroot")));
  app.use(
    express.static(path.join(__dirname, "node_modules/@enocean-js/utils/dist"))
  );
  app.get("/", (req, res) => {
    res.send("hallo");
  });
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
  app.get("/api/port_status", (req, res) => {
    if (enocean.port.isOpen) {
      enocean.emit("serialport-open");
    } else {
      enocean.emit("serialport-close");
    }
    res.json({
      isOpen: enocean.port ? enocean.port.isOpen : false,
    });
  });
  app.get("/api/list_ports", async (req, res) => {
    let portList = await enocean.listPorts();
    res.json({ ports: portList });
  });

  app.get("/api/events", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const client = { id: Date.now(), res };
    clients.add(client);
    console.log(`SSE client connected: ${client.id}`);
    //res.write("data: connected\n\n");
    req.on("close", () => {
      clients.delete(client);
      console.log(`SSE client disconnected: ${client.id}`);
      res.end();
    });
  });

  app.get("/api/start-teachin-mode", (req, res) => {
    res.json(enocean.teachInTimer.start());
  });

  app.get("/api/device-list", (req, res) => {
    res.json({ devices: enocean.memory.getAllDevices() });
  });

  app.listen(port, () => {
    console.log(`ENOCEAN Gateway listening at http://${ip}:${port}`);
  });
}

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
}
