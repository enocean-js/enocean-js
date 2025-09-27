/**
 * Copyright (c) 2025 Holger Will
 * Licensed under the MIT License
 * https://opensource.org/licenses/MIT
 * This file is part of the enocean-js project.
 */

/**
 * SIGNAL d0-00-06: Energy status of device
 */
import { toString, getValue, setValue, DIRECTION_IN } from "@enocean-js/utils";

export const meta = {
  version: "1.0.0",
  eep: "d0-00-07",
  rorg: "d0",
  func: "00",
  type: "07",
  title: "Revision of device",
  communication_type: "uni",
};

export const SPEC = {
  meta,
  profile: (direction) => {
    const IN = {
      meta,
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
      props: [
        {
          name: "SoftwareVersion",
          value: toString(getValue(payload, 8, 32)),
        },
        {
          name: "HardwareVersion",
          value: toString(getValue(payload, 40, 32)),
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
