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

export function startServer(port) {
  app.use(express.static("webapp"));
  app.use(
    express.static("node_modules/@enocean-js/enocean-js-browser-lib/dist")
  );
  app.listen(port, () => {
    console.log(`Server is running on http://${getLocalIp()}:${port}`);
  });
}
