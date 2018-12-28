/* eslint-disable no-undef  */
// const ESP3Packet = require('../../').ESP3Packet
const RadioERP1 = require('../../').RadioERP1
// const Response = require('../../').Response
const assert = require('chai').assert
describe('RadioERP1 packets', () => {
  it('SHOULD be creatable from ESP3Packets', () => {
    var radio = RadioERP1.from({ data: 'f630aabbccdd30', optionalData: '03ffffffffff00', packetType: 1 })
    // console.log(radio)
    assert.equal(radio.packetType, 1)
    assert.equal(radio.RORG, 0xf6, 'RORG')
    assert.equal(radio.payload[0], 0x30)
    assert.equal(radio.senderId, 'aabbccdd')
    assert.equal(radio.status, 0x30)
    assert.equal(radio.T21, 1, 'T21')
    assert.equal(radio.NU, 1, 'NU')
    assert.equal(radio.subTelNum, 3)
    assert.equal(radio.destinationId, 'ffffffff')
    assert.equal(radio.RSSI, 0xff)
    assert.equal(radio.securityLevel, 0)
    assert.equal(radio.teachIn, true)
    assert.equal(radio.decode('f6-02-03').RA.value, 0x30)
  })
  it('SHOULD be manipulable with interface methods', () => {
    var radio = RadioERP1.from({ payload: '00000000'})
    radio.RORG = 0xa5
    radio.payload = 0xaabbccdd
    assert.equal(radio.payload.toString(), 'aabbccdd')
    radio.status = 0
    assert.equal(radio.status, 0x0)
    radio.T21 = 1
    assert.equal(radio.T21, 1, 'T21')
    radio.NU = 1
    assert.equal(radio.NU, 1, 'NU')
    assert.equal(radio.status, 0x30)
    radio.senderId = 'ccddeeff'
    assert.equal(radio.senderId, 'ccddeeff')
    radio.subTelNum = 1
    assert.equal(radio.subTelNum, 3)
    radio.destinationId = 0xaaaaaaaa
    assert.equal(radio.destinationId, 'aaaaaaaa', 'destination')
    radio.RSSI = 0x80
    assert.equal(radio.RSSI, 0xff)
    radio.securityLeve = 1
    assert.equal(radio.securityLevel, 0)
    var radio = RadioERP1.from({ payload: '00'})
    assert.equal(radio.RORG, 0xf6, '1BS')
    var radio = RadioERP1.from({ payload: '0000000000'})
    assert.equal(radio.RORG, 0xd2, 'VLD')
  })
  it('SHOULD allow to create learn telegrams (4BS)', () => {
    var radio = RadioERP1.from({ eep: 'a5-02-0a'})
    var decoded = radio.decode()
    assert.equal(decoded.eep.func, 0x02)
    assert.equal(decoded.eep.type, 0x0a)
    assert.equal(decoded.manufacturer.id, 0x0)
    assert.equal(decoded.eep.toString(), 'a5-02-0a')
    assert.equal(decoded.teachInType, '4BS')
  })
  it('SHOULD allow to create learn telegrams (1BS)', () => {
    var radio = RadioERP1.from({ eep: 'd5-00-01', senderId: 'aabbccdd'})
    var decoded = radio.decode()
    assert.equal(decoded.senderId, 'aabbccdd')
    assert.equal(decoded.eep.toString(), 'd5-00-01')
    assert.equal(decoded.teachInType, '1BS')
  })
  it('SHOULD type: 1BS', () => {
    radio = RadioERP1.from({ type: '1BS', eep: 'd5-00-01'})
    decoded = radio.teachInInfo
    assert.equal(decoded.senderId, '00000000')
    assert.equal(decoded.teachInType, '1BS')
  })
  it('SHOULD allow to create learn telegrams (RPS)', () => {
    var radio = RadioERP1.from({ eep: 'f6-02-01', senderId: 'aabbccdd'})
    var decoded = radio.teachInInfo
    assert.equal(decoded.senderId, 'aabbccdd')
    assert.equal(decoded.eep.toString(), 'f6-02-01')
    assert.equal(decoded.teachInType, 'RPS')
  })
  it('SHOULD Type: RPS', () => {
    radio = RadioERP1.from({ type: 'RPS', eep: 'f6-02-03'})
    decoded = radio.teachInInfo
    assert.equal(decoded.senderId, '00000000')
    assert.equal(decoded.eep.toString(), 'f6-02-01')
    assert.equal(decoded.teachInType, 'RPS')
  })
  // describe('the Object returned from connect', () => {
  //   it('SHOULD have send method', () => {
  //     // var packet = ESP3Packet.from({ data: 'f630aabbccdd20', optionalData: '03ffffffffff00', packetType: 1 })
  //     const sender = {
  //       send (data) {
  //         var packet = ESP3Packet.from({ data: 0, packetType: 2 })
  //         assert.equal(data, ESP3Packet.from({ data: 'f630aabbccdd20', optionalData: '03ffffffffff00', packetType: 1 }).toString())
  //         return Response.from(packet)
  //       }
  //     }
  //     var erp = RadioERP1.connect(sender)
  //     var res = erp.send('f6', '30', 'aabbccdd', '20')
  //     assert.equal(res.returnCode, 0)
  //     assert.equal(res.returnMsg, 'RET_OK')
  //   })
  //   it('SHOULD have a status default = 0', () => {
  //     // var packet = ESP3Packet.from({ data: 'f630aabbccdd20', optionalData: '03ffffffffff00', packetType: 1 })
  //     const sender = {
  //       send (data) {
  //         var radio = RadioERP1.from(data)
  //         assert.equal(radio.status, 0)
  //       }
  //     }
  //     var erp = RadioERP1.connect(sender)
  //     erp.send('f6', '30', 'aabbccdd')
  //   })
  // })
})
