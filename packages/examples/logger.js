import { Enocean, pretty } from "@enocean-js/enocean";

const eo = new Enocean({ port: "/dev/ttyUSB0" });

eo.on("ready", (data) => {
  console.log(data);
});

eo.on("data", (data) => {
  pretty.logESP3(data);
});
