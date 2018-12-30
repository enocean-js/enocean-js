/* eslint-disable no-undef  */
// const ESP3Packet = require('../../').ESP3Packet
const RadioERP1 = require('../../').RadioERP1
const ByteArray = require('../../').ByteArray
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
    var radio = RadioERP1.from({ payload: '00000000' })
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
    radio = RadioERP1.from({ payload: '00' })
    assert.equal(radio.RORG, 0xf6, '1BS')
    radio = RadioERP1.from({ payload: '0000000000' })
    assert.equal(radio.RORG, 0xd2, 'VLD')
  })
  it('SHOULD allow to create learn telegrams (4BS)', () => {
    var radio = RadioERP1.from({ eep: 'a5-02-0a' })
    var decoded = radio.decode()
    assert.equal(decoded.eep.func, 0x02)
    assert.equal(decoded.eep.type, 0x0a)
    assert.equal(decoded.manufacturer.id, 0x0)
    assert.equal(decoded.eep.toString(), 'a5-02-0a')
    assert.equal(decoded.teachInType, '4BS')
  })
  it('SHOULD allow to create learn telegrams (1BS)', () => {
    var radio = RadioERP1.from({ eep: 'd5-00-01', senderId: 'aabbccdd' })
    var decoded = radio.decode()
    assert.equal(decoded.senderId, 'aabbccdd')
    assert.equal(decoded.eep.toString(), 'd5-00-01')
    assert.equal(decoded.teachInType, '1BS')
  })
  it('SHOULD type: 1BS', () => {
    radio = RadioERP1.from({ type: '1BS', eep: 'd5-00-01' })
    decoded = radio.teachInInfo
    assert.equal(decoded.senderId, '00000000')
    assert.equal(decoded.teachInType, '1BS')
  })
  it('SHOULD allow to create learn telegrams (RPS)', () => {
    var radio = RadioERP1.from({ eep: 'f6-02-01', senderId: 'aabbccdd' })
    var decoded = radio.teachInInfo
    assert.equal(decoded.senderId, 'aabbccdd')
    assert.equal(decoded.eep.toString(), 'f6-02-01')
    assert.equal(decoded.teachInType, 'RPS')

    radio = RadioERP1.from({ eep: 'f6-02-01', senderId: 'aabbccdd', RORG: 0xf6 })
    decoded = radio.teachInInfo
    assert.equal(decoded.senderId, 'aabbccdd')
    assert.equal(decoded.eep.toString(), 'f6-02-01')
    assert.equal(decoded.teachInType, 'RPS')
  })
  it('SHOULD Type: RPS', () => {
    radio = RadioERP1.from({ type: 'RPS', eep: 'f6-02-03' })
    decoded = radio.teachInInfo
    assert.equal(decoded.senderId, '00000000')
    assert.equal(decoded.eep.toString(), 'f6-02-01')
    assert.equal(decoded.teachInType, 'RPS')
  })
  describe('EEP decoding', () => {
    it('Value in single byte with reversed scale', () => {
      radio = RadioERP1.from({ payload: '0000ff08' })
      decoded = radio.decode('a5-02-01')
      assert.equal(decoded.TMP.value, -40)
    })
    it('Value in spread across bytes 10bit', () => {
      radio = RadioERP1.from({ payload: '00000008' })
      decoded = radio.decode('a5-02-30')
      assert.equal(decoded.TMP.value, 62.3)
    })
    it('multible values each in single byte', () => {
      radio = RadioERP1.from({ payload: [0, 250, 250, 0x08] })
      decoded = radio.decode('a5-04-02')
      assert.equal(decoded.TMP.value, 60)
      assert.equal(decoded.HUM.value, 100)
    })
    it('Enum values with range', () => {
      radio = RadioERP1.from({ payload: [100, 0, 0, 0x08] })
      decoded = radio.decode('a5-10-1f')
      assert.equal(decoded.FAN.min, 0)
      assert.equal(decoded.FAN.max, 144)
    })
    it('Enum with single value', () => {
      radio = RadioERP1.from({ payload: [0x11] })
      decoded = radio.decode('f6-05-01')
      assert.equal(decoded.WAS.value, 0x11)
      radio = RadioERP1.from({ payload: [0x21] })
      decoded = radio.decode('f6-05-01')
      assert.equal(decoded.WAS.value, null)
    })
    it('eep with complete ref to other eep', () => {
      radio = RadioERP1.from({ payload: [250, 0, 0, 0x08] })
      decoded = radio.decode('a5-10-1e')
      assert.equal(decoded.SV.value, 5)
    })
    it('eep bitmask enum', () => {
      radio = RadioERP1.from({ payload: 240, status: 0x20, RORG: 0xf6 })
      decoded = radio.decode('f6-10-00')
      assert.equal(decoded.WIN.description, 'down')
      radio = RadioERP1.from({ payload: 192, status: 0x20 })
      decoded = radio.decode('f6-10-00')
      assert.equal(decoded.WIN.description, 'side')
    })
    it('values with scale/unit point to other fields', () => {
      radio = RadioERP1.from({ payload: [0, 0, 1, 0x09] })
      decoded = radio.decode('a5-12-01')
      assert.equal(decoded.MR.value, 0.1, 'scale 1/10')
      assert.equal(decoded.MR.unit, 'kWh', 'unit kWh')

      radio = RadioERP1.from({ payload: [0, 0, 1, 0x08] })
      radio.payload = radio.payload.setSingleBit(29, 1)
      decoded = radio.decode('a5-12-01')
      assert.equal(decoded.MR.value, 1, 'scale 1/1')
      assert.equal(decoded.MR.unit, 'W', 'unit W')

      var val = ByteArray.from([0, 0, 0])
      val.setValue(34567, 0, 24)
      radio = RadioERP1.from({ payload: [val, 0x0a] })
      decoded = radio.decode('a5-12-01')
      assert.equal(decoded.MR.value, 345.67, 'scale 1/100')
    })
    it('various EEPs', () => {
      radio = RadioERP1.from({ payload: [0x02, 0x00, 0x0a, 0x0a] })
      decoded = radio.decode('a5-09-05')
      assert.equal(decoded.Conc.value, 512)
      radio = RadioERP1.from({ payload: [0x0f, 0x02, 0x00, 0x0a] })
      decoded = radio.decode('a5-09-0b')
      assert.equal(decoded.Ract.value.toFixed(1), 51.2)
    })
    it('RPS with diffrent status codes', () => {
      radio = RadioERP1.from({ payload: 0, status: 0x30 })
      decoded = radio.decode('f6-02-01')
      assert.equal(decoded.hasOwnProperty('SA'), true)
      radio = RadioERP1.from({ payload: 0, status: 0x20 })
      decoded = radio.decode('f6-02-01')
      assert.equal(decoded.hasOwnProperty('SA'), false)
    })
    it('4BS with direction', () => {
      radio = RadioERP1.from({ payload: [0x00, 0x00, 0x00, 0x08] })
      decoded = radio.decode('a5-11-05', 1)
      assert.equal(decoded.hasOwnProperty('WM'), false)
      decoded = radio.decode('a5-11-05', 2)
      assert.equal(decoded.hasOwnProperty('WM'), true)
    })
    it('a5-12-10', () => {
      radio = RadioERP1.from({ payload: [0x00, 0x00, 0x00, 0x08] })
      radio.payload = radio.payload.setSingleBit(29, 1)
      radio.payload = radio.payload.setValue(2, 30, 2)
      radio.payload = radio.payload.setValue(5000, 0, 24)
      decoded = radio.decode('a5-12-10')
      assert.equal(decoded.MR.value, 50)
      assert.equal(decoded.MR.unit, 'mA')
      radio.payload = radio.payload.setSingleBit(29, 0)
      radio.payload = radio.payload.setValue(0, 30, 2)
      decoded = radio.decode('a5-12-10')
      assert.equal(decoded.MR.unit, 'A.h')
      assert.equal(decoded.MR.value, 5000)
    })
    it('MSB-LSB splited fields', () => {
      radio = RadioERP1.from({ payload: [0x00, 0x00, 0x00, 0x08] })
      radio.payload = radio.payload.setValue(15, 4, 4)
      radio.payload = radio.payload.setValue(255, 16, 8)
      decoded = radio.decode('a5-13-06')
      assert.equal(decoded['LOT(MSB)'].value, 180)
      assert.equal(decoded['LAT(MSB)'].value, -90)

      radio = RadioERP1.from({ payload: [0x00, 0x00, 0x00, 0x08] })
      radio.payload = radio.payload.setValue(0, 29, 3)
      radio.payload = radio.payload.setValue(250, 16, 8)
      decoded = radio.decode('a5-13-10')
      assert.equal(decoded['SRA (MSB)'].value, 2000)
    })
  })
})
