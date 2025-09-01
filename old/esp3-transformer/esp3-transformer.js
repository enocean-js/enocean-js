import { RadioERP1 } from "@enocean-js/radio-erp1";
import { CommonCommand } from "@enocean-js/common-command";
import { Response } from "@enocean-js/esp3-packets";
import { RadioERP2 } from "@enocean-js/esp3-packets";
import { Transform } from "stream";
const packetTypes = {
  0x01: RadioERP1,
  0x02: Response,
  0x05: CommonCommand,
  0x0a: RadioERP2,
};

export function transform(packet) {
  if (packet.packetType in packetTypes) {
    return packetTypes[packet.packetType].from(packet);
  }
  return packet;
}

class ESP3Transformer extends Transform {
  constructor(options) {
    super({ ...options, ...{ objectMode: true } });
  }

  _transform(chunk, encoding, cb) {
    let packet = chunk;
    if (chunk.packetType in packetTypes) {
      packet = packetTypes[chunk.packetType].from(chunk);
    }
    this.push(packet);
    cb();
  }
}
export { ESP3Transformer };
