/**
 * EEP A5-10-03: Temperature Sensor, Set Point Control
 */
import {
  setValue,
  getValue,
  DIRECTION_IN,
  setSpreadedValue,
} from "@enocean-js/utils";
export const meta = {
  version: "1.0.3",
  eep: "d2-01-0e",
  rorg: "d2",
  func: "01",
  type: "0e",
  communication_type: "bidi",
  title:
    "Electronic switches and dimmers with Energy Measurement and Local Control",
};
const unitMap = {
  0: "Ws",
  1: "Wh",
  2: "kWh",
  3: "W",
  4: "kW",
};

export const SPEC = {
  meta,
  profile: (direction, numChannels) => {
    const props = [
      {
        name: "status",
        type: "boolean",
        role: "switch.power",
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
      {
        name: "getPower",
        type: "boolean",
        role: "button",
        desc: "Get current status",
        read: false,
        write: true,
      },
      {
        name: "getEnergy",
        type: "boolean",
        role: "button",
        desc: "Get current status",
        read: false,
        write: true,
      },
      {
        name: "power",
        type: "number",
        desc: "Instantaneous power consumption",
        write: false,
        read: true,
        role: "value.power",
      },
      {
        name: "energy",
        type: "number",
        desc: "Accumulated energy consumption",
        write: false,
        read: true,
        role: "value.power.consumption",
      },
      {
        name: "setMeasurement",
        type: "boolean",
        role: "button",
        desc: "Set measurement parameters",
        write: true,
        read: false,
      },
    ];
    const IN = { meta };
    IN.channels = [];
    for (let i = 0; i < numChannels; i++) {
      IN.channels.push({ name: `Channel_${i + 1}`, props: [...props] });
    }
    const OUT = {};
    return direction === DIRECTION_IN ? IN : OUT;
  },
  decode: (payload) => {
    const cmd = getValue(payload, 4, 4);
    if (cmd == 4) {
      // Status response
      const rawDimLevel = getValue(payload, 17, 7);
      return {
        channel: getValue(payload, 11, 5),
        props: [
          { name: "dimLevel", value: rawDimLevel },
          { name: "status", value: rawDimLevel > 0 },
        ],
      };
    }
    if (cmd == 7) {
      const unit = getValue(payload, 8, 3);
      let energy, power;
      if (unit < 3) {
        return {
          channel: getValue(payload, 11, 5),
          props: [
            {
              name: "energy",
              value: getValue(payload, 16, 32),
              unit: unitMap[unit],
            },
          ],
        };
      } else {
        return {
          channel: getValue(payload, 11, 5),
          props: [
            {
              name: "power",
              value: getValue(payload, 16, 32),
              unit: unitMap[unit],
            },
          ],
        };
      }
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
        case "getPower":
          payload = new Uint8Array(2);
          payload = setValue(payload, 6, 4, 4); // cmd 0x06 measurement query
          payload = setValue(payload, 1, 10, 1); // query power
          payload = setValue(payload, channel, 11, 5);
          ret.push(payload);
          break;
        case "getEnergy":
          payload = new Uint8Array(2);
          payload = setValue(payload, 6, 4, 4); // cmd 0x06 measurement query
          payload = setValue(payload, 0, 10, 1); // query energy
          payload = setValue(payload, channel, 11, 5);
          ret.push(payload);
          break;
        case "setMeasurement":
          payload = SPEC.setMeasurement(channel);
          ret.push(payload);
      }
    }

    return { payload };
  },
  init: (NumChannels) => {
    // Initialize the measurement settings

    for (let i = 0; i < NumChannels; i++) {
      SPEC.setMeasurement(i, true, 0, 1, 1, 1, 10);
      SPEC.setMeasurement(i, true, 1, 3, 1, 1, 10);
    }
  },
  setMeasurement: (
    channel,
    auto = true,
    mode = 1,
    unit = 3,
    delta = 1,
    minInterval = 1,
    maxInterval = 10
  ) => {
    let payload = new Uint8Array(6);
    payload = setValue(payload, 5, 4, 4); // cmd 0x06 measurement query
    payload = setValue(payload, auto == true ? 1 : 0, 8, 1); // query energy
    payload = setValue(payload, channel, 11, 5);
    payload = setValue(payload, mode, 10, 1); // mode (energy or power)
    if (mode == 1 && unit <= 2) {
      unit = 3;
    }
    payload = setValue(payload, unit, 21, 3); // mode==0 unit:0 = Ws unit:1 =Wh unit:2 =kWh; mode==1 unit:3 = W unit:4 = kW
    payload = setSpreadedValue(payload, delta, [
      { bitStart: 24, bitLength: 8 },
      { bitStart: 16, bitLength: 4 },
    ]);
    payload = setValue(payload, minInterval, 40, 8);
    payload = setValue(payload, Math.round(maxInterval / 10), 32, 8);
    console.log(payload);
    return payload;
  },
};
