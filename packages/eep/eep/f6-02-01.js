/**
 * Copyright (c) 2025 Holger Will
 * Licensed under the MIT License
 * https://opensource.org/licenses/MIT
 * This file is part of the enocean-js project.
 */

/**
 * EEP F6-02-01: Light and Blind Control - Application Style 1
 */
import { getValue, setValue, DIRECTION_IN } from "@enocean-js/utils";

export const meta = {
  version: "1.0.3",
  eep: "f6-02-01",
  rorg: "f6",
  func: "02",
  type: "01",
  title: "Light and Blind Control - Application Style 1",
  communication_type: "uni",
};
export const SPEC = {
  meta,
  profile: (direction) => {
    const IN = {
      meta,
      props: [
        {
          name: "Button1",
          type: "boolean",
          read: true,
          write: false,
          role: "indicator",
        },
        {
          name: "Button2",
          type: "boolean",
          read: true,
          write: false,
          role: "indicator",
        },
        {
          name: "Button3",
          type: "boolean",
          read: true,
          write: false,
          role: "indicator",
        },
        {
          name: "Button4",
          type: "boolean",
          read: true,
          write: false,
          role: "indicator",
        },
      ],
    };
    const OUT = {
      meta,
      props: [
        {
          name: "Button1",
          type: "boolean",
          read: false,
          write: true,
          role: "button",
          value: false,
        },
        {
          name: "Button2",
          type: "boolean",
          read: false,
          write: true,
          role: "button",
          value: false,
        },
        {
          name: "Button3",
          type: "boolean",
          read: false,
          write: true,
          role: "button",
          value: false,
        },
        {
          name: "Button4",
          type: "boolean",
          read: false,
          write: true,
          role: "button",
          value: false,
        },
      ],
    };
    return direction === DIRECTION_IN ? IN : OUT;
  },
  decode: (payload, status) => {
    if (typeof status === "number") {
      status = new Uint8Array([status]);
    }
    if (!payload || payload.length !== 1) {
      return null;
    }

    // T21=1 and NU=1/0 identify a PTM switch telegram
    // const t21 = getValue(status, 2, 1) === 1;

    const nu = getValue(status, 3, 1) === 1;
    const action = getValue(payload, 3, 1) === 1;
    if (nu) {
      const r1 = getValue(payload, 0, 3);
      const r2 = getValue(payload, 4, 3);
      const sa = getValue(payload, 7, 1) === 1;
      if (action) {
        return {
          props: [
            { name: "Button1", value: r1 === 0 || (r2 === 0 && sa) },
            { name: "Button2", value: r1 === 1 || (r2 === 1 && sa) },
            { name: "Button3", value: r1 === 2 || (r2 === 2 && sa) },
            { name: "Button4", value: r1 === 3 || (r2 === 3 && sa) },
            { name: "Multiple", value: false },
          ],
        };
      } else {
        return {
          props: [
            { name: "Button1", value: false },
            { name: "Button2", value: false },
            { name: "Button3", value: false },
            { name: "Button4", value: false },
            { name: "Multiple", value: false },
          ],
        };
      }
    } else {
      const r1 = getValue(payload, 0, 3);
      return {
        props: [
          { name: "Button1", value: false },
          { name: "Button2", value: false },
          { name: "Button3", value: false },
          { name: "Button4", value: false },
          { name: "Multiple", value: r1 == 3 && action },
        ],
      };
    }
  },
  encode: (data) => {
    let payload = new Uint8Array(1);
    let numberOfButtonsPressed = 0;
    let status = new Uint8Array(1);
    status = setValue(status, 1, 4, 4); // RC=1
    status = setValue(status, 1, 2, 1); // T21=1
    status = setValue(status, 1, 3, 1); // NU=1
    let encodeMutiple = (n, id) => {
      if (n > 1) {
        payload = setValue(payload, id, 4, 3);
      } else {
        payload = setValue(payload, id, 0, 3);
      }
      if (n > 2) {
        throw new Error("Only up to two buttons can be encoded");
      }
    };
    if (data.Button1 === true) {
      numberOfButtonsPressed++;
      encodeMutiple(numberOfButtonsPressed, 0);
    }
    if (data.Button2 === true) {
      numberOfButtonsPressed++;
      encodeMutiple(numberOfButtonsPressed, 1);
    }
    if (data.Button3 === true) {
      numberOfButtonsPressed++;
      encodeMutiple(numberOfButtonsPressed, 2);
    }
    if (data.Button4 === true) {
      numberOfButtonsPressed++;
      encodeMutiple(numberOfButtonsPressed, 3);
    }

    payload = setValue(payload, 1, 3, 1);

    if (numberOfButtonsPressed === 0) {
      status = setValue(status, 0, 3, 1); // NU=0
      payload = setValue(payload, 0, 3, 1);
    }
    if (numberOfButtonsPressed == 2) {
      // releases
      payload = setValue(payload, 1, 7, 1);
    }

    // For simplicity, we only encode a single action.
    // R2 and SA bits remain 0.
    return { payload, status: status[0] };
  },
};
