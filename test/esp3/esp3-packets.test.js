/* eslint-disable no-undef  */
const ESP3Packet = require('../../').ESP3Packet
const assert = require('chai').assert
describe('ESP3Packet', () => {
  it('SHOULD be creatable with new', () => {
    var packet = new ESP3Packet()
    assert.equal(packet.length, 0, `empty constructor results in non empty array`)
    assert.equal(packet.constructor.name, 'ESP3Packet', `empty constructor results in non empty array`)
  })
  it('SHOULD be creatable with a .from() function', () => {
    var packet = ESP3Packet.from([])
    assert.equal(packet.length, 0, `empty constructor results in non empty array`)
  })
  it('SHOULD support a subset of Array methods', () => {
    var packet = ESP3Packet.from([])
    assert.equal(packet.length, 0, `empty constructor results in non empty array`)
    packet.push(1, 2, 3)
    assert.equal(packet.length, 3, `push does not work as expected`)
    assert.equal(packet.toString(), '010203', `push does not work as expected`)
    packet.shift()
    assert.equal(packet.toString(), '0203', `shift does not work as expected`)
  })
  describe('when created from struct', () => {
    it('SHOULD return a default packet', () => {
      var packet = ESP3Packet.from({ data: [0] })
      assert.equal(packet.packetType, 1, `default packetType not 1`)
      assert.equal(packet.dataLength, 1, `default dataLenght not 1`)
      assert.equal(packet.length, 8, `length not 8`)
      assert.equal(packet.toString(), '55000100016c0000', `does not autofix crc8 for new packets`)
    })
    it('SHOULD return a readable JSON when stringified', () => {
      var packet = ESP3Packet.from({ data: [8], packetType: 5 })
      assert.equal(packet.toString(), '5500010005700838', `does not autofix crc8 for new packets`)
      var json = JSON.parse(JSON.stringify(packet))
      assert.equal(json.header.dataLength, 1)
      assert.equal(json.header.optionalLength, 0)
      assert.equal(json.header.packetType, 5)
      assert.equal(json.syncByte, 0x55)
      assert.equal(json.data[0], 8)
      assert.equal(json.crc8Header, 0x70)
      assert.equal(json.crc8Data, 0x38)
      assert.equal(json.optionalData.length, 0)
    })
    it('SHOULD also handle optional Data', () => {
      var packet = ESP3Packet.from({ data: [1], optionalData: [2, 3] })
      assert.equal(packet.packetType, 1, `default packetType not 1`)
      assert.equal(packet.dataLength, 1)
      assert.equal(packet.optionalLength, 2)
      assert.equal(packet.length, 10, `length not 10`)
      assert.equal(packet.isPacketOK(), true)
      assert.equal(packet.slice(6, 9)[0], 1)
      assert.equal(packet.slice(6, 9)[1], 2)
      assert.equal(packet.slice(6, 9)[2], 3)
    })
  })
})
