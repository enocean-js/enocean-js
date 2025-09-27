/**
 * Copyright (c) 2025 Holger Will
 * Licensed under the MIT License
 * https://opensource.org/licenses/MIT
 * This file is part of the enocean-js project.
 */

/**
 * EEP F6-02-01: Light and Blind Control - Application Style 1
 */
import * as utils from "@enocean-js/utils";

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
    return direction === utils.DIRECTION_IN ? IN : OUT;
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

    const nu = utils.getValue(status, 3, 1) === 1;
    const action = utils.getValue(payload, 3, 1) === 1;
    if (nu) {
      const r1 = utils.getValue(payload, 0, 3);
      const r2 = utils.getValue(payload, 4, 3);
      const sa = utils.getValue(payload, 7, 1) === 1;
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
      const r1 = utils.getValue(payload, 0, 3);
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
  encode: (options) => {
    let payload = new Uint8Array(1);
    let numberOfButtonsPressed = 0;
    let status = new Uint8Array(1);
    status = utils.setValue(status, 0, 4, 4); // RC=1
    status = utils.setValue(status, 1, 2, 1); // T21=1
    status = utils.setValue(status, 1, 3, 1); // NU=1
    let encodeMutiple = (n, id) => {
      if (n > 1) {
        payload = utils.setValue(payload, id, 4, 3);
      } else {
        payload = utils.setValue(payload, id, 0, 3);
      }
      if (n > 2) {
        throw new Error("Only up to two buttons can be encoded");
      }
    };
    for (let i = 0; i < 4; i++) {
      let button = options.actions.find(
        (action) => action.name === `Button${i + 1}`
      );
      if (button && button.value === true) {
        numberOfButtonsPressed++;
        encodeMutiple(numberOfButtonsPressed, i);
      }
    }

    payload = utils.setValue(payload, 1, 3, 1);

    if (numberOfButtonsPressed === 0) {
      status = utils.setValue(status, 0, 3, 1); // NU=0
      payload = utils.setValue(payload, 0, 3, 1);
    }
    if (numberOfButtonsPressed == 2) {
      payload = utils.setValue(payload, 1, 7, 1);
    }

    const tel = utils.erp1.createERP1Telegram({
      rorg: 0xf6,
      senderId: utils.fromString(options.id),
      payload: payload,
      status: status,
      destinationId: utils.fromString("ffffffff"),
    });
    return tel;
  },
};
