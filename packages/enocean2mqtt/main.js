#!/usr/bin/env node

import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { connectMQTT } from "./enocean2mqtt.js"; // This would be your main application logic
import { startServer } from "./webserver.js";
import { Enocean } from "@enocean-js/enocean";

const eo = new Enocean();

function main() {
  const argv = yargs(hideBin(process.argv))
    .usage("Usage: $0 [options]")
    .option("mqtt-url", {
      alias: "m",
      describe: "MQTT broker URL",
      type: "string",
      demandOption: true,
      default: "mqtt://localhost:1883",
    })
    .option("mqtt-username", {
      alias: "u",
      describe: "MQTT username",
      type: "string",
    })
    .option("mqtt-password", {
      alias: "p",
      describe: "MQTT password",
      type: "string",
    })
    .option("serial-port", {
      alias: "s",
      describe: "Enocean gateway serial port",
      type: "string",
      demandOption: true,
    })
    .option("webserver", {
      alias: ["ws"],
      describe: "Start the webserver",
      type: "boolean",
      default: true,
    })
    .option("webserver-port", {
      alias: ["wp"],
      describe: "Webserver port",
      type: "number",
      default: 30207,
    })
    .help("h")
    .alias("h", "help")
    .version().argv;

  console.log("Starting enocean2mqtt with the following configuration:");
  console.log(`- MQTT URL: ${argv.mqttUrl}`);
  console.log(`- Serial Port: ${argv.serialPort}`);
  if (argv.webserver) {
    console.log(`- Webserver enabled on port: ${argv.webserverPort}`);
    startServer(argv.webserverPort, eo);
  } else {
    console.log("- Webserver disabled");
  }
  connectMQTT(eo);
  // Here you would instantiate and start your main application logic
  // const app = new Enocean2Mqtt({
  //   mqttUrl: argv.mqttUrl,
  //   mqttUsername: argv.mqttUsername,
  //   mqttPassword: argv.mqttPassword,
  //   serialPort: argv.serialPort
  // })
  // app.start()
}

main();
