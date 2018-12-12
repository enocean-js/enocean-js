/* eslint-disable no-undef  */
import { toCRC8, getCRC8 } from '@enocean-js/crc8'
const assert = require('chai').assert

describe('CRC8 Calculation', () => {
  describe('with getCRC8(buffer)', () => {
    it('SHOULD turn any number of Bytes in a Buffer into a single Byte Checksum', function () {
      assert.equal(getCRC8(Buffer.from([0x0])), 0x0, 'Wrong Checksum for 00')
      assert.equal(getCRC8(Buffer.from([0x0, 0x1])), 0x7, 'Wrong Checksum for 0001')
      assert.equal(getCRC8(Buffer.from([0x2, 0x4, 0x7])), 0x97, 'Wrong Checksum for 020407')
      assert.equal(getCRC8(Buffer.from([0x0, 0x1, 0x0, 0x5])), 112, 'Wrong Checksum')
    })
    it('SHOULD work with regular Arrays', function () {
      assert.equal(getCRC8([0x0]), 0x0, 'Wrong Checksum for 00')
      assert.equal(getCRC8([0x0, 0x1]), 0x7, 'Wrong Checksum for 0001')
      assert.equal(getCRC8([0x2, 0x4, 0x7]), 0x97, 'Wrong Checksum for 020407')
      assert.equal(getCRC8([0x0, 0x1, 0x0, 0x5]), 112, 'Wrong Checksum')
    })
    it('SHOULD work with Uint8Arrays', function () {
      assert.equal(getCRC8(new Uint8Array([0x0])), 0x0, 'Wrong Checksum for 00')
      assert.equal(getCRC8(new Uint8Array([0x0, 0x1])), 0x7, 'Wrong Checksum for 0001')
      assert.equal(getCRC8(new Uint8Array([0x2, 0x4, 0x7])), 0x97, 'Wrong Checksum for 020407')
      assert.equal(getCRC8(new Uint8Array([0x0, 0x1, 0x0, 0x5])), 112, 'Wrong Checksum')
    })
  })
  describe('with buffer.reduce(toCRC8,0)', () => {
    it('SHOULD turn any number of Bytes in a Buffer into a single Byte Checksum', function () {
      assert.equal(Buffer.from([0x0]).reduce(toCRC8, 0), 0x0, 'Wrong Checksum for 00')
      assert.equal(Buffer.from([0x0, 0x1]).reduce(toCRC8, 0), 0x7, 'Wrong Checksum for 0001')
      assert.equal(Buffer.from([0x2, 0x4, 0x7]).reduce(toCRC8, 0), 0x97, 'Wrong Checksum for 020407')
      assert.equal(Buffer.from([0x0, 0x1, 0x0, 0x5]).reduce(toCRC8, 0), 112, 'Wrong Checksum')
    })
    it('SHOULD work with regular Arrays', function () {
      assert.equal([0x0].reduce(toCRC8, 0), 0x0, 'Wrong Checksum for 00')
      assert.equal([0x0, 0x1].reduce(toCRC8, 0), 0x7, 'Wrong Checksum for 0001')
      assert.equal([0x2, 0x4, 0x7].reduce(toCRC8, 0), 0x97, 'Wrong Checksum for 020407')
      assert.equal([0x0, 0x1, 0x0, 0x5].reduce(toCRC8, 0), 112, 'Wrong Checksum')
    })
    it('SHOULD work with Uint8Arrays', function () {
      assert.equal((new Uint8Array([0x0])).reduce(toCRC8, 0), 0x0, 'Wrong Checksum for 00')
      assert.equal((new Uint8Array([0x0, 0x1])).reduce(toCRC8, 0), 0x7, 'Wrong Checksum for 0001')
      assert.equal((new Uint8Array([0x2, 0x4, 0x7])).reduce(toCRC8, 0), 0x97, 'Wrong Checksum for 020407')
      assert.equal((new Uint8Array([0x0, 0x1, 0x0, 0x5])).reduce(toCRC8, 0), 112, 'Wrong Checksum')
    })
  })
})
