/**
 * Copyright (c) 2025 Holger Will
 * Licensed under the MIT License
 * https://opensource.org/licenses/MIT
 * This file is part of the enocean-js project.
 */
import { describe, it, expect, vi } from "vitest";
import { ESP3Parser } from "./serialport-parser.js";
import { toString } from "@enocean-js/utils";
const telegrams = [
  "55000a0701eba5c87f710fffdba5e40001ffffffff47000d", // 0 | _4BS_A5
  "55000707017ad509ffdba5ed0001ffffffff470096", // 1 | _1BS_D5
  "55000c070196d24000b00a010001a03d790001ffffffff5b0033", // 2 | _VLD_D2
  "55000707017af600ffd9b7812001ffffffff460050", // 3 | _RPS_F6
  "55000a0701eba540300287ffd9b7e50001ffffffff440016", // 4 | _4BS_Teach_In_A5
];

describe("ESP3Parser", () => {
  it("should emit 'data' events in the correct order for each parsed ESP3 packet", () => {
    let parser = new ESP3Parser();
    let n = 0;
    parser.on("data", (data) => {
      expect(toString(data, "hex")).toBe(telegrams[n]);
      n++;
    });

    const telegramm = Buffer.from(telegrams.join(""), "hex");
    parser.write(telegramm);
  });
  it("should correctly parse ESP3 packets from a byte stream containing random messy data before each packet", function () {
    /**
     * ESP3 defines: "If the Header does not match the CRC8H, the value 0x55 does not correspond to Sync.-Byte.
     * The next 0x55 within the data stream is picked and the verification repeated."
     */
    const parser = new ESP3Parser();
    let n = 0;
    parser
      .on("data", (data) => {
        expect(toString(data, "hex")).toBe(telegrams[n]);
        n++;
      })
      .on("error", (err) => err);
    const messyBytes = [
      "55a03d790001aa",
      "557017af60ffd6",
      "55a010001a0300",
      "55af600ffd976789",
      "55707017af6045d300ff",
      "a50707017ad55fccbb3456",
    ];
    const messyBytesBetweenTelegramsAsBuffer = telegrams
      .slice(0)
      .map((telegramAsString) =>
        Buffer.from(
          messyBytes[Math.floor(Math.random() * messyBytes.length)] +
            telegramAsString,
          "hex"
        )
      );
    const largeAndMessyByteStream = Buffer.concat(
      messyBytesBetweenTelegramsAsBuffer
    );
    parser.write(largeAndMessyByteStream);
  });
  it("packet emitted data as one packet,even if not received in one go", function () {
    const parser = new ESP3Parser();
    parser.on("data", (data) => {
      expect(toString(data, "hex")).toBe(telegrams[0]);
    });

    parser.write(Buffer.from("55000a0701eba5", "hex"));
    parser.write(Buffer.from("c87f710fffdba5e40001ffffffff47000d", "hex"));
  });

  it("function properly under siege", async function () {
    let n = 0;
    let n2 = 0;
    function sendAndWaitForResponse(data) {
      let gotError = false;
      let gotData = false;
      n++;
      return new Promise((resolve, reject) => {
        const parser = new ESP3Parser({ maxBufferSize: 1000 });
        parser.once("data", (data) => {
          gotData = true;
          n2++;
          //console.log("resolving", n, n2);
          resolve(data);
        });
        parser.on("error", (err) => {
          gotError = true;
          //console.log("error", err);
          // ignore, should emit data after error in any case
        });
        for (let i = 0; i < data.length; i++) {
          parser.write(Buffer.from([data[i]]));
        }
        setTimeout(() => {
          if (!gotData) {
            console.log("rejecting");
            reject(toString(data, "hex"));
          }
        }, 10);
      });
    }

    let buf = [];

    for (let t = 1; t <= 10000; t++) {
      buf = [];
      for (let i = 0; i < 50; i++) {
        buf.push(Math.floor(Math.random() * 255));
      }
      let s = Buffer.concat([
        Buffer.from(buf),
        Buffer.from(telegrams[Math.round(Math.random() * 4)], "hex"),
      ]);
      try {
        await sendAndWaitForResponse(s);
      } catch (e) {
        console.log("No data for", e);
      }
    }
  }, 20000);
});
