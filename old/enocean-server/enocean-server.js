import express from "express";
import os from "os";
import { Enocean } from "@enocean-js/enocean";

const eo = new Enocean();
const port = 3311;
/**
 * Creates an Express router to wrap an Enocean instance, providing a REST API and SSE event stream.
 * @param {Enocean} eo The initialized Enocean instance.
 * @returns {express.Router} The configured Express router.
 */
export function createEnoceanRouter(eo) {
  const router = express.Router();
  router.use(express.json()); // Middleware to parse JSON bodies

  // --- REST API for Enocean Methods ---

  // Devices
  router.get("/devices", async (req, res) => {
    try {
      const devices = await eo.getAllDevices();
      res.json(devices);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.get("/devices/:id", async (req, res) => {
    try {
      const device = await eo.getDevice(req.params.id);
      device
        ? res.json(device)
        : res.status(404).json({ error: "Device not found" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.put("/devices/:id/name", async (req, res) => {
    try {
      await eo.setDeviceName(req.params.id, req.body.name);
      res.status(200).json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.put("/devices/:id/eep", async (req, res) => {
    try {
      await eo.learnEep(req.params.id, req.body.eep);
      res.status(200).json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.delete("/devices/:id", async (req, res) => {
    try {
      await eo.removeDevice(req.params.id);
      res.status(204).send();
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Virtual Devices
  router.get("/virtual-devices", async (req, res) => {
    try {
      const devices = await eo.getAllVirtualDevices();
      res.json(devices);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.post("/virtual-devices", async (req, res) => {
    try {
      const { name, eep, profile } = req.body;
      const newDevice = await eo.createVirtualDevice(name, eep, profile);
      res.status(201).json(newDevice);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.delete("/virtual-devices/:id", async (req, res) => {
    try {
      await eo.removeVirtualDevice(req.params.id);
      res.status(204).send();
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Control
  router.post("/control/teach-in/start", (req, res) => {
    eo.startTeachInMode();
    res.status(202).json({ message: "Teach-in mode started" });
  });

  router.post("/control/teach-in/stop", (req, res) => {
    eo.stopTeachInMode();
    res.status(202).json({ message: "Teach-in mode stopped" });
  });

  router.post("/control/teach-out/start", (req, res) => {
    eo.startTeachOutMode();
    res.status(202).json({ message: "Teach-out mode started" });
  });

  router.post("/control/teach-out/stop", (req, res) => {
    eo.stopTeachOutMode();
    res.status(202).json({ message: "Teach-out mode stopped" });
  });

  // --- Server-Sent Events (SSE) Endpoint ---

  const clients = new Set();
  const eventNames = [
    "packet",
    "eep-learned",
    "removed-device",
    "new-device-seen",
    "new-profile-seen",
    "decoded-data",
    "decode-error",
    "unrecognized-data",
    "ute-response-sent",
    "ready",
    "teach-in-mode-timer",
    "teach-in-mode-ended",
    "teach-out-mode-timer",
    "teach-out-mode-ended",
    "error",
  ];

  // Generic handler that forwards any of the specified events to all connected SSE clients.
  const sseHandler = (eventName, data) => {
    const message = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of clients) {
      client.res.write(message);
    }
  };

  // Attach the handler to all relevant events on the Enocean instance.
  eventNames.forEach((eventName) => {
    eo.on(eventName, (data) => sseHandler(eventName, data));
  });

  router.get("/events", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const client = { id: Date.now(), res };
    clients.add(client);
    console.log(`SSE client connected: ${client.id}`);

    req.on("close", () => {
      clients.delete(client);
      console.log(`SSE client disconnected: ${client.id}`);
      res.end();
    });
  });

  return router;
}

const app = express();

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

export function startServer(port, eo) {
  app.use(express.static("frontend"));
  app.use(
    express.static("node_modules/@enocean-js/enocean-js-browser-lib/dist")
  );
  app.use("/api", createEnoceanRouter(eo));
  app.listen(port, () => {
    console.log(`Server is running on http://${getLocalIp()}:${port}`);
  });
}
startServer(3311, eo);
