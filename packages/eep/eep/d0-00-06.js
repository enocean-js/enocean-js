/**
 * Copyright (c) 2025 Holger Will
 * Licensed under the MIT License
 * https://opensource.org/licenses/MIT
 * This file is part of the enocean-js project.
 */

/**
 * SIGNAL d0-00-06: Energy status of device
 */
import { getValue, setValue, DIRECTION_IN } from "@enocean-js/utils";

export const meta = {
  version: "1.0.0",
  eep: "d0-00-06",
  rorg: "d0",
  func: "00",
  type: "06",
  title: "Energy status of device",
  communication_type: "uni",
};

export const SPEC = {
  meta,
  profile: (direction) => {
    const IN = {
      meta,
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
    const OUT = {
      meta,
      props: [
        {
          name: "batteryLevel",
          type: "number",
          unit: "%",
          min: 0,
          max: 100,
          read: false,
          write: true,
          value: 0,
        },
      ],
    };
    return direction === DIRECTION_IN ? IN : OUT;
  },
  decode: (payload) => {
    return {
      props: [
        {
          name: "batteryLevel",
          value: getValue(payload, 1, 8),
          unit: "%",
        },
      ],
    };
  },
  encode: (data) => {
    //??????????????????
    const batteryLevel = data.props.find((p) => p.name === "batteryLevel");
    return {
      payload: [0x06, batteryLevel ? batteryLevel.value : 0],
    };
  },
};
