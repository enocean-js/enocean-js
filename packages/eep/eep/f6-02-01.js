/**
 * EEP F6-02-01: Light and Blind Control - Application Style 1
 */
import { getValue, setValue } from "@enocean-js/utils";
export const f60201 = {
  meta: {
    eep: "f6-02-01",
    rorg: "f6",
    func: "02",
    type: "01",
    title: "Light and Blind Control - Application Style 1",
    status: "released",
  },
  profile: () => ({
    type: "switch",
    readings: [
      { name: "Button1", type: "boolean" },
      { name: "Button2", type: "boolean" },
      { name: "Button3", type: "boolean" },
      { name: "Button4", type: "boolean" },
      { name: "Multiple", type: "boolean" },
    ],
  }),
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
          Button1: r1 === 0 || (r2 === 0 && sa),
          Button2: r1 === 1 || (r2 === 1 && sa),
          Button3: r1 === 2 || (r2 === 2 && sa),
          Button4: r1 === 3 || (r2 === 3 && sa),
          Multiple: false,
        };
      } else {
        return {
          Button1: false,
          Button2: false,
          Button3: false,
          Button4: false,
          Multiple: false,
        };
      }
    } else {
      const r1 = getValue(payload, 0, 3);
      return {
        Button1: false,
        Button2: false,
        Button3: false,
        Button4: false,
        Multiple: r1 == 3 && action,
      };
    }
  },

  encode: (data) => {
    let payload = new Uint8Array(1);
    let numberOfButtonsPressed = 0;
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
      // releases
      payload = setValue(payload, 0, 3, 1);
    }
    if (numberOfButtonsPressed == 2) {
      // releases
      payload = setValue(payload, 1, 7, 1);
    }

    // For simplicity, we only encode a single action.
    // R2 and SA bits remain 0.
    return payload;
  },
  teachIn: () => {
    return new Uint8Array([0b00000000]);
  },
};
