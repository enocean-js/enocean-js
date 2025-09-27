import * as utils from "./utils.js";

const examples = [
  { rorg: "d0", raw: "55000807013dd0060a05193d310100ffffffff4300c3" },
  { rorg: "d0", raw: "55000807013dd0066405193d670000ffffffff5200d4" },
  { rorg: "d0", raw: "55000807013dd0066481000ff28000ffffffff3600a9" },
  { rorg: "d0", raw: "55000807013dd0060a05193d310000ffffffff4100fa" },
  { rorg: "d0", raw: "55000807013dd0066405193d670000ffffffff5200d4" },
  { rorg: "d0", raw: "55000807013dd0060a05193d310000ffffffff4000ef" },
  { rorg: "d0", raw: "55000807013dd0066405193d670000ffffffff5300c1" },
  { rorg: "d0", raw: "55000807013dd0060a05193d310000ffffffff4100fa" },
  { rorg: "d0", raw: "55000807013dd0066405193d670000ffffffff5300c1" },
  { rorg: "d0", raw: "55000807013dd0060a05193d310000ffffffff4000ef" },
  { rorg: "d0", raw: "55000807013dd0066481000fb78000ffffffff360029" },
  { rorg: "d0", raw: "55000807013dd0066405193d670000ffffffff5300c1" },
  { rorg: "d0", raw: "55000807013dd0060a05193d310100ffffffff4300c3" },
];

export const SIGNAL = {
  "d0-00-00": { name: "Reserved", decode: (payload) => {}, encode: () => {} },
  "d0-00-01": {
    name: "SMART Ack Mailbox empty",
    decode: (payload) => {},
    encode: () => {},
  },
  "d0-00-02": {
    name: "SMART ACK Mailbox does not exist",
    decode: (payload) => {},
    encode: () => {},
  },
  "d0-00-03": {
    name: "SMART ACK Reset: Trigger LRN Request",
    decode: (payload) => {},
    encode: () => {},
  },
  "d0-00-04": { name: "Trigger status message of device" },
  "d0-00-05": {
    name: "Last unicast-message acknowledge",
    decode: (payload) => {},
    encode: () => {},
  },
  "d0-00-06": {
    name: "Energy status of device",
    meta: {
      version: "1.0.0",
      eep: "d0-00-06",
      rorg: "d0",
      func: "00",
      type: "06",
      title: "Energy status of device",
    },
    profile: (direction) => {
      const IN = {
        meta: {
          version: "1.0.0",
          eep: "d0-00-06",
          rorg: "d0",
          func: "00",
          type: "06",
          title: "Energy status of device",
        },
        type: "sensor",
        props: [
          {
            name: "batteryLevel",
            type: "number",
            unit: "%",
            min: 0,
            max: 100,
            read: true,
            write: false,
          },
        ],
      };
      return IN;
    },
    decode: (payload) => {
      return {
        props: [{ name: "batteryLevel", value: payload[1], unit: "%" }],
      };
    },
    encode: (batteryLevelPercent) => {
      return { batteryLevel: new Uint8Array([0x06, batteryLevelPercent]) };
    },
  },
  "d0-00-07": {
    name: "Revision of device",
    meta: {
      version: "1.0.0",
      eep: "d0-00-07",
      rorg: "d0",
      func: "00",
      type: "07",
      title: "Revision of device",
    },
    profile: (direction) => {
      const IN = {
        meta: {
          version: "1.0.0",
          eep: "d0-00-07",
          rorg: "d0",
          func: "00",
          type: "07",
          title: "Revision of device",
        },
        type: "sensor",
        props: [
          {
            name: "SoftwareVersion",
            type: "string",
            unit: "",
            read: true,
            write: false,
          },
          {
            name: "HardwareVersion",
            type: "string",
            unit: "",
            read: true,
            write: false,
          },
        ],
      };
      return IN;
    },
    decode: (payload) => {
      return {
        props: [{ name: "SoftwareVersion", value: payload[1] }],
      };
    },
    encode: () => {},
  },
  "d0-00-08": { name: "Heartbeat", decode: (payload) => {}, encode: () => {} },
  "d0-00-09": {
    name: "RX-window open",
    decode: (payload) => {},
    encode: () => {},
  },
  "d0-00-0a": {
    name: "RX-channel quality",
    decode: (payload) => {},
    encode: () => {},
  },
  "d0-00-0b": {
    name: "Duty-cycle status",
    decode: (payload) => {},
    encode: () => {},
  },
  "d0-00-0c": {
    name: "Configuration of device changed",
    decode: (payload) => {},
    encode: () => {},
  },
  "d0-00-0d": {
    name: "Energy delivery of the harvester",
    decode: (payload) => {},
    encode: () => {},
  },
  "d0-00-0e": {
    name: "TX Mode off",
    decode: (payload) => {},
    encode: () => {},
  },
  "d0-00-0f": { name: "TX Mode on", decode: (payload) => {}, encode: () => {} },
  "d0-00-10": {
    name: "Backup battery status",
    decode: (payload) => {},
    encode: () => {},
  },
  "d0-00-11": {
    name: "Learn mode status",
    decode: (payload) => {},
    encode: () => {},
  },
  "d0-00-12": { name: "Product ID", decode: (payload) => {}, encode: () => {} },
  "d0-00-13": {
    name: "Date and Time",
    decode: (payload) => {},
    encode: () => {},
  },
};

export function decodeD0(telegram) {
  const rorg = utils.erp1.getRORG(telegram);
  if (rorg !== 0xd0) {
    throw new Error("Not a D0 telegram");
  }
  let payload = utils.erp1.getPayload(telegram);
  const mid = utils.getValue(payload, 0, 8);
  const eep = "d0-00-" + mid.toString(16).padStart(2, "0");
  const sig = SIGNAL[eep];
  if (!sig) {
    throw new Error(`Unknown SIG message ID ${mid}`);
  }
  return sig.decode(payload);
}
