/**
 * Copyright (c) 2025 Holger Will
 * Licensed under the MIT License
 * https://opensource.org/licenses/MIT
 * This file is part of the enocean-js project.
 */
import {
  crc8,
  getOptionalDataLength,
  getDataLength,
  getBodyCRC8,
  subArray,
  toString,
} from "@enocean-js/utils";
import * as CONST from "./parser-const.js";
import { Transform } from "stream";

class ESP3Parser extends Transform {
  constructor(options) {
    const opt = {
      ...options,
      ...{
        readableObjectMode: true,
        maxBufferSize: 65535,
        maxDataSize: 64,
        maxOptionalSize: 64,
      },
    };
    super(opt);
    this.options = opt;
    this.packet = [];
    this.state = CONST.WAIT_FOR_SYNC_BYTE;
    this.maxBufferSize = opt.maxBufferSize;
    this.maxDataSize = opt.maxDataSize;
    this.maxOptionalSize = opt.maxOptionalSize;
  }

  _transform(chunk, encoding, cb) {
    for (let offset = 0; offset < chunk.length; offset++) {
      const byte = chunk[offset];
      switch (this.state) {
        case CONST.WAIT_FOR_SYNC_BYTE:
          if (byte === 0x55) {
            this.packet = [0x55];
            this.state = CONST.FILL_HEADER;
          }
          break;
        case CONST.FILL_HEADER:
          this.packet.push(byte);
          if (this.packet.length < 5) {
            break;
          }
          this.state = CONST.CHECK_CRC8_HEADER;
          break;
        case CONST.CHECK_CRC8_HEADER:
          if (crc8(subArray(this.packet, 1, 4)) !== byte) {
            this.packet.push(byte);
            let syncCodeIndex = this.packet.findIndex((item, index) => {
              return item === 0x55 && index > 0;
            });

            if (syncCodeIndex > 1) {
              this.state = CONST.FILL_HEADER;
              while (syncCodeIndex > 0) {
                this.packet.shift();
                syncCodeIndex--;
              }
              break;
            }
            if (syncCodeIndex === 1) {
              this.state = CONST.CHECK_CRC8_HEADER;
              while (syncCodeIndex > 0) {
                this.packet.shift();
                syncCodeIndex--;
              }
              break;
            }
            this.emit("error", {
              code: CONST.WRONG_HEADER_CHECKSUM_ERROR,
              name: "WRONG_HEADER_CHECKSUM_ERROR",
              desc: "header checksum test failed",
            });
            this.state = CONST.WAIT_FOR_SYNC_BYTE;
            break;
          } else {
            this.packet.push(byte);
          }
          if (
            getDataLength(this.packet) > this.maxDataSize ||
            getOptionalDataLength(this.packet) > this.maxOptionalSize
          ) {
            this.emit("error", {
              code: CONST.ILLEGAL_PACKET_LENGTH_ERROR,
              name: "ILLEGAL_PACKET_LENGTH_ERROR",
              desc: "lenght and optional length should be smaller than 64 bytes each",
            });
            if (byte === 0x55) {
              this.packet = [0x55];
              this.state = CONST.FILL_HEADER;
              break;
            }
            let syncCodeIndex = this.packet.findIndex((item, index) => {
              return item === 0x55 && index > 0;
            });

            if (syncCodeIndex > 0) {
              this.state = CONST.FILL_HEADER;
              while (syncCodeIndex > 0) {
                this.packet.shift();
                syncCodeIndex--;
              }
              break;
            }
            this.state = CONST.WAIT_FOR_SYNC_BYTE;
            break;
          }

          if (
            getDataLength(this.packet) + getOptionalDataLength(this.packet) <=
            0
          ) {
            this.emit("error", {
              code: CONST.ILLEGAL_PACKET_LENGTH_ERROR,
              name: "ILLEGAL_PACKET_LENGTH_ERROR",
              desc: "there must be at least 1 byte of data or optional data, it can not be 0",
            });
            this.packet = [];
            this.state = CONST.WAIT_FOR_SYNC_BYTE;
            break;
          }
          this.state = CONST.FILL_DATA_OPTIONALDATA;
          break;
        case CONST.FILL_DATA_OPTIONALDATA:
          this.packet.push(byte);
          if (this.packet.length > this.maxBufferSize) {
            this.state = CONST.WAIT_FOR_SYNC_BYTE;
            this.emit("error", {
              code: CONST.BUFFER_OVERFLOW_ERROR,
              name: "BUFFER_OVERFLOW_ERROR",
              desc: `Max Buffer Size is ${this.maxBufferSize} Bytes`,
            });
            break;
          }
          if (
            this.packet.length <
            getDataLength(this.packet) + getOptionalDataLength(this.packet) + 6
          ) {
            break;
          }
          this.state = CONST.CHECK_CRC8_DATAS;
          break;
        case CONST.CHECK_CRC8_DATAS:
          this.state = CONST.WAIT_FOR_SYNC_BYTE;
          if (getBodyCRC8(this.packet) != byte) {
            this.emit("error", {
              code: 2,
              name: "WRONG_BODY_CHECKSUM",
              desc: "data checksum test failed",
            });
            break;
          } else {
            this.packet.push(byte);
          }
          this.push(this.packet);
          break;
      }
    }
    cb();
  }
}

export default ESP3Parser;
export { ESP3Parser };
