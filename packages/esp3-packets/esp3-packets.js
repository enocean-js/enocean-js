// import RemoteManCommand from './packet-types/RemoteManCommand.js'
// import RadioSubTel from './packet-types/RadioSubTel.js'
// import SmartAckCommand from './packet-types/SmartAckCommand.js'
// const Transform = require('stream').Transform

export * from "./packet-types/RadioERP2.js";
//export * from "@enocean-js/esp3-packet";
// import Command24 from './packet-types/Command24.js'
// import {Event} from './packet-types/Event.js'
// import Radio802 from './packet-types/Radio802.js'
//export * from "@enocean-js/radio-erp1";

//export * from "@enocean-js/common-command";
// import RadioMessage from './packet-types/RadioMessage.js'
export * from "./packet-types/Response.js";
export const rorgs = [
  { rorg: "F6", title: "Repeated Switch Communication" },
  { rorg: "D5", title: "1 Byte Communication" },
  { rorg: "A5", title: "4 Byte Communication" },
  { rorg: "D2", title: "Variable Length Data" },
  { rorg: "D1", title: "Manufacturer Specific Communication" },
  { rorg: "A6", title: "Addressing Destination Telegram" },
  { rorg: "C6", title: "Smart Ack Learn Request" },
  { rorg: "C7", title: "Smart Ack Learn Answer" },
  { rorg: "A7", title: "Smart Ack Reclaim" },
  { rorg: "C5", title: "Remote Management" },
  { rorg: "30", title: "Secure telegram" },
  { rorg: "31", title: "Secure telegram with R-ORG encapsulation" },
  { rorg: "D0", title: "Signal Telegram" },
];

export function getRorgTitle(rorg) {
  const entry = rorgs.find((item) => item.rorg === rorg);
  return entry ? entry.title : undefined;
}
