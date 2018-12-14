/* eslint-disable no-undef  */
// import { Packet } from '@enocean-js/esp3-packets'
// const assert = require('chai').assert
// var packets = {
//   0x00: 'ESP3Packet',
//   0x01: 'RadioERP1',
//   0x02: 'Response',
//   0x03: 'RadioSubTel',
//   0x04: 'Event',
//   0x05: 'CommonCommand',
//   0x06: 'SmartAckCommand',
//   0x07: 'RemoteManCommand',
//   0x09: 'RadioMessage',
//   0x0a: 'RadioERP2',
//   0x10: 'Radio802',
//   0x11: 'Command24'
// }
//
// describe('ERP3 Packets', () => {
//   it('created from packet type number should have matching header.packetType and constructors', () => {
//     for (var packetNr in packets) {
//       var p = Packet.from(packetNr)
//       assert.equal(p.packetType, packetNr, `Wrong header.packetType at ${packetNr}`)
//       assert.equal(p.constructor.name, packets[packetNr], 'Wrong Checksum for 00')
//     }
//   })
// })
