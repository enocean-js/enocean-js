import express from "express";
import os from "os";

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
  app.use(express.static("webapp"));
  app.use(
    express.static("node_modules/@enocean-js/enocean-js-browser-lib/dist")
  );

  app.get("/devices", (req, res) => {
    eo.memory.getAllDevices().then((devices) => {
      res.json(devices);
    });
  });
  app.get("/packet", (req, res) => {
    // Set headers for SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // The function that will format and send the data
    const handlePacket = (data) => {
      const formattedData = `event: packet\ndata: ${JSON.stringify(data)}\n\n`;
      res.write(formattedData);
    };

    // Attach the listener to the EventEmitter
    eo.on("packet", handlePacket);

    // Clean up the listener when the client disconnects
    req.on("close", () => {
      console.log("Client disconnected. Cleaning up listener.");
      // IMPORTANT: Use emitter.off() or emitter.removeListener()
      eo.off("packet", handlePacket);
      res.end(); // End the response
    });
  });
  app.listen(port, () => {
    console.log(`Server is running on http://${getLocalIp()}:${port}`);
  });
}
