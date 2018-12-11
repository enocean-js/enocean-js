/* eslint-disable no-undef  */
import getCRC8 from '@enocean-js/crc8'
const assert = require('chai').assert

describe('CRC8 Calculation', function () {
  it('SHOULD turn any number of Bytes into a single Byte Checksum', function () {
    assert.equal(getCRC8(Buffer.from([0x0])), 0x0, 'Wrong Checksum for 00')
    assert.equal(getCRC8(Buffer.from([0x0, 0x1])), 0x7, 'Wrong Checksum for 0001')
    assert.equal(getCRC8(Buffer.from([0x2, 0x4, 0x7])), 0x97, 'Wrong Checksum for 020407')
    var buf = Buffer.from([0x0, 0x1, 0x0, 0x5])
    assert.equal(getCRC8(buf), 112, 'Wrong Checksum')
  })
})
