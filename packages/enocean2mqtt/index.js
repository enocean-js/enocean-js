import { Enocean, pretty } from "@enocean-js/enocean";

const eo = new Enocean();

//eo.startTeachInMode();
eo.startTeachOutMode();
eo.on("ready", (data) => {
  console.log(data);
});

eo.on("packet", (data) => {
  pretty.logESP3(data);
});

eo.on("known-device-data", (data) => {
  console.log("Received packet from known device", data);
});

eo.on("teach-in-mode-timer", (data) => {
  console.log(data);
});

eo.on("teach-in-mode-ended", () => {
  console.log("Teach-in mode ended");
});

eo.on("teach-in-device", (data) => {
  console.log("new teach-in device", data);
});

eo.on("teach-out-mode-timer", (data) => {
  console.log(data);
});

eo.on("teach-out-mode-ended", () => {
  console.log("Teach-out mode ended");
});

eo.on("teach-out-device", (data) => {
  console.log("teach-out device", data);
});
