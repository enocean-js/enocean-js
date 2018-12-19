/* eslint-disable no-undef  */
const ESP3Packet = require('../../').ESP3Packet
const RadioERP1 = require('../../').RadioERP1
const Response = require('../../').Response
const assert = require('chai').assert
describe('RadioERP1 packets', () => {
  it('SHOULD be creatable from ESP3Packets', () => {
    var packet = ESP3Packet.from({ data: 'f630aabbccdd20', optionalData: '03ffffffffff00', packetType: 1 })
    var radio = RadioERP1.from(packet)
    assert.equal(radio.packetType, 1)
    assert.equal(radio.RORG, 0xf6, 'RORG')
    assert.equal(radio.payload[0], 0x30)
    assert.equal(radio.senderId, 'aabbccdd')
    assert.equal(radio.status, 0x20)
    assert.equal(radio.subTelNum, 3)
    assert.equal(radio.destinationId, 'ffffffff')
    assert.equal(radio.RSSI, 0xff)
    assert.equal(radio.securityLevel, 0)
  })
  describe('the Object returned from connect', () => {
    it('SHOULD have send method', () => {
      // var packet = ESP3Packet.from({ data: 'f630aabbccdd20', optionalData: '03ffffffffff00', packetType: 1 })
      const sender = {
        send (data) {
          var packet = ESP3Packet.from({ data: 0, packetType: 2 })
          assert.equal(data, ESP3Packet.from({ data: 'f630aabbccdd20', optionalData: '03ffffffffff00', packetType: 1 }).toString())
          return Response.from(packet)
        }
      }
      var erp = RadioERP1.connect(sender)
      var res = erp.send('f6', '30', 'aabbccdd', '20')
      assert.equal(res.returnCode, 0)
      assert.equal(res.returnMsg, 'RET_OK')
    })
    it('SHOULD have a status default = 0', () => {
      // var packet = ESP3Packet.from({ data: 'f630aabbccdd20', optionalData: '03ffffffffff00', packetType: 1 })
      const sender = {
        send (data) {
          var packet = ESP3Packet.from(data)
          var radio = RadioERP1.from(packet)
          assert.equal(radio.status, 0)
        }
      }
      var erp = RadioERP1.connect(sender)
      erp.send('f6', '30', 'aabbccdd')
    })
  })
})
