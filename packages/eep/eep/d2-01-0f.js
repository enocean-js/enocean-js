/**
 * EEP A5-10-03: Temperature Sensor, Set Point Control
 */
import { setValue, getValue } from "@enocean-js/utils";
export const meta = {
  version: "1.0.0",
  eep: "d2-01-0f",
  rorg: "d2",
  func: "01",
  type: "0e",
  title:
    "Electronic switches and dimmers with Energy Measurement and Local Control",
};

export const SPEC = {
  meta,
  profile: (direction, numChannels) => {
    const props = [
      {
        name: "channel",
        type: "number",
        desc: "No. of Channel",
        read: true,
        write: false,
      },
      {
        name: "status",
        type: "boolean",
        role: "switch",
        desc: "switch status",
        read: true,
        write: true,
      },
      {
        name: "dimLevel",
        type: "number",
        role: "level.dimmer",
        unit: "%",
        min: 0,
        max: 100,
        desc: "Dim level 0%..100%, 0 = off, >0 = on",
        read: true,
        write: true,
      },
      {
        name: "getStatus",
        type: "boolean",
        role: "button",
        desc: "Get current status",
        read: false,
        write: true,
      },
    ];
    const IN = { meta };
    IN.channels = [];
    for (let i = 0; i < numChannels; i++) {
      IN.channels.push({ name: `Channel_${i + 1}`, props: [...props] });
    }
    const OUT = {};
    return direction === "IN" ? IN : OUT;
  },
  decode: (payload) => {
    const cmd = getValue(payload, 4, 4);
    if (cmd == 4) {
      // Status response
      const rawDimLevel = getValue(payload, 17, 7);
      return {
        channel: getValue(payload, 11, 5),
        dimLevel: rawDimLevel,
        status: rawDimLevel > 0,
      };
    }
  },
  encode: (options, channel = 0) => {
    const ret = [];
    let payload;
    for (const action in options) {
      switch (action) {
        case "status":
          payload = new Uint8Array(3);
          payload = setValue(payload, 1, 4, 4); // cmd 0x01 command actuator set
          payload = setValue(payload, channel, 11, 5); // select channel
          payload = setValue(payload, 0, 8, 3); // set to value (Not supported: dim to value)
          payload = setValue(payload, options[action] ? 100 : 0, 17, 7); // value true/false
          ret.push(payload);
          console.log("Payload status", payload);
          break;
        case "dimLevel":
          payload = new Uint8Array(3);
          payload = setValue(payload, 1, 4, 4); // cmd 0x01 command actuator set
          payload = setValue(payload, channel, 11, 5); // select channel
          payload = setValue(payload, 0, 8, 3); // set to value
          payload = setValue(payload, options[action], 17, 7); // dim level
          ret.push(payload);
          break;
        case "getStatus":
          payload = new Uint8Array(2);
          payload = setValue(payload, 3, 4, 4); // cmd 0x03 status query
          payload = setValue(payload, channel, 11, 5);
          ret.push(payload);
          break;
      }
    }

    return { payload };
  },
};
