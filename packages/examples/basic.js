import { Enocean } from "@enocean-js/enocean";
import { toString } from "@enocean-js/utils";

const enocean = new Enocean({ path: "/dev/ttyUSB0", baudRate: 57600 });

enocean.on("radio-erp1", (data) => {
  console.log("Radio ERP1:", toString(data));
});
enocean.on("response", (data) => {
  console.log("Response:", toString(data));
});
enocean.on("ready", (data) => {
  console.log("Ready:", data);
});
