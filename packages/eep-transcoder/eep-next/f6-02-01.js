/**
 * EEP F6-02-01: Light and Blind Control - Application Style 1
 */
import { ByteArray } from "@enocean-js/byte-array";

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
    type: "rockerSwitch",
    channels: [
      {
        channel: 0,
        name: "A",
        buttons: ["AI", "A0"],
      },
      {
        channel: 1,
        name: "B",
        buttons: ["BI", "B0"],
      },
    ],
  }),
  decode: (payload, status) => {
    if (!payload || payload.length !== 1 || typeof status !== "number") {
      return null;
    }

    // T21=1 and NU=1/0 identify a PTM switch telegram
    const t21 = (status & 0b00000100) !== 0;
    if (!t21) return null;

    const data = payload[0];
    const nu = (status & 0b00001000) !== 0;
    const energyBow = (data & 0b00001000) !== 0;
    const action = energyBow ? "press" : "release";

    if (nu) {
      // N-message: Normal press/release of one or two buttons
      const buttonMap = ["AI", "A0", "BI", "B0"];
      const events = [];

      const r1 = (data & 0b01110000) >> 4;
      const r2 = data & 0b00000111;
      const sa = (data & 0b10000000) !== 0;

      // 1st action is always valid
      events.push({ action, button: buttonMap[r1] });

      // 2nd action is valid if SA bit is set
      if (sa) {
        events.push({ action, button: buttonMap[r2] });
      }
      return { events };
    } else {
      // U-message: Simultaneous press/release, used for teach-in
      return {
        events: [{ action, button: "multiple", type: "U-message" }],
      };
    }
  },
  encode: (data) => {
    const buttonMap = { AI: 0, A0: 1, BI: 2, B0: 3 };
    if (!data || !data.button || !(data.button in buttonMap)) {
      return null;
    }

    const payload = ByteArray.from([0]);
    const buttonCode = buttonMap[data.button];

    // Set R1 field (bits 4-6)
    payload[0] |= buttonCode << 4;

    // Set EB field (bit 3)
    if (data.action === "press") {
      payload[0] |= 0b00001000;
    }

    // For simplicity, we only encode a single action.
    // R2 and SA bits remain 0.
    return payload;
  },
  teachIn: () => {
    // F6 teach-in is an RPS telegram with data 0x00.
    // The status byte (NU=0) is handled by the packet constructor.
    return ByteArray.from([0x00]);
  },
};
