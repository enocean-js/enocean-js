/* eslint-disable no-undef  */
const EO = require('../../')
const assert = require('chai').assert
ESP3Parser = EO.ESP3Parser
const esp3SimpleParser = new ESP3Parser()
const sinon = require('sinon')

const telegrams = [
  '55000a0701eba5c87f710fffdba5e40001ffffffff47000d', // 0 | _4BS_A5
  '55000707017ad509ffdba5ed0001ffffffff470096', // 1 | _1BS_D5
  '55000c070196d24000b00a010001a03d790001ffffffff5b0033', // 2 | _VLD_D2
  '55000707017af600ffd9b7812001ffffffff460050', // 3 | _RPS_F6
  '55000a0701eba540300287ffd9b7e50001ffffffff440016' // 4 | _4BS_Teach_In_A5
]

describe('serialport enocean parser', function () {
  describe('ESP3 Parser', function () {
    describe('from proper byte stream:', function () {
      it('can fetch all ESP3 packets', function () {
        const spy = sinon.spy()
        esp3SimpleParser.on('data', spy)
        for (let key in telegrams) {
          let telegramm = Buffer.from(telegrams[key], 'hex')
          esp3SimpleParser.write(telegramm)
          assert.deepEqual(spy.getCall(key).args[0].toString('hex'), telegramm.toString('hex'))
        }
        esp3SimpleParser.removeListener('data', spy)
      })

      it('can fetch all ESP3 packets in large byte stream', function () {
        const spy = sinon.spy()
        esp3SimpleParser.on('data', spy)
        const telegramsAsBuffer = telegrams.slice(0).map(telegramAsString => Buffer.from(telegramAsString, 'hex'))
        const largeByteStream = Buffer.concat(telegramsAsBuffer)

        esp3SimpleParser.write(largeByteStream)
        assert.equal(spy.callCount, telegrams.length, 'Received unexpected count of packets.')
        esp3SimpleParser.removeListener('data', spy)
      })
    })

    describe('from messy byte stream:', function () {
      /**
       * ESP3 defines: "If the Header does not match the CRC8H, the value 0x55 does not correspond to Sync.-Byte.
       * The next 0x55 within the data stream is picked and the verification repeated."
       */
      it('packets MUST be emitted, if messy bytes occur before the header was detected and there are at least 5 bytes to real sync byte', function () {
        const spy = sinon.spy()
        esp3SimpleParser.on('data', spy).on('error', err => err)
        const messyBytes = [
          '55a03d790001',
          '557017af60ff',
          '55a010001a03',
          '55af600ffd9b7812001f',
          '55707017af600ffd9b7812001ffc',
          '550707017ad509ffdba5ed0001ffffffdf'
        ]
        const messyBytesBetweenTelegramsAsBuffer = telegrams.slice(0).map(
          telegramAsString => Buffer.from(
            messyBytes[Math.floor(Math.random() * messyBytes.length)] + telegramAsString,
            'hex'
          )
        )
        const largeAndMessyByteStream = Buffer.concat(messyBytesBetweenTelegramsAsBuffer)

        esp3SimpleParser.write(largeAndMessyByteStream)
        assert.equal(spy.callCount, telegrams.length, 'Received unexpected count of packets.')
        esp3SimpleParser.removeListener('data', spy)
      })
      it('packet SHOULD be emitted, if not received in one go', function () {
        const spy = sinon.spy()
        esp3SimpleParser.on('data', spy)

        esp3SimpleParser.write(Buffer.from('55000a0701eba5', 'hex'))
        esp3SimpleParser.write(Buffer.from('c87f710fffdba5e40001ffffffff47000d', 'hex'))
        assert.equal(spy.called, true, '')
        esp3SimpleParser.removeListener('data', spy)
      })
      it('packet SHOULD NOT be emitted, if data or optional data is invalid', function () {
        const spy = sinon.spy()
        esp3SimpleParser.on('data', spy)

        const withBrokenCRC8Data = telegrams.slice(0).map(
          telegramAsString => Buffer.from(
            telegramAsString.substring(0, telegramAsString.length - 2) + '00',
            'hex'
          )
        )
        const byteStream = Buffer.concat(withBrokenCRC8Data)
        esp3SimpleParser.write(byteStream)
        assert.equal(spy.callCount, 0, 'Broken packets are emitted.')
        esp3SimpleParser.removeListener('data', spy)
      })
      it('packet SHOULD be emitted, if it starts in the middle of another packets header', function () {
        const spy = sinon.spy()
        esp3SimpleParser.on('data', spy)
        esp3SimpleParser.write(Buffer.from('55005500010005700838', 'hex')) // sync code in the middle of the header
        esp3SimpleParser.write(Buffer.from('55000100015500010005700838', 'hex')) // CRC8H is the sync code of the next packet
        assert.equal(spy.callCount, 2, '')
        esp3SimpleParser.removeListener('data', spy)
      })
      it('an Error SHOULD be thrown if the packet exeeds 1000 Bytes', function () {
        const spy = sinon.spy()
        esp3SimpleParser.on('error', spy)
        var buf = [0x55, 0xff, 0xff, 0xff, 0x01, 0x3d]
        for (var i = 0; i < 1001; i++) {
          buf.push(0)
        }
        esp3SimpleParser.write(Buffer.from(buf))
        assert.equal(spy.callCount, 1, '')
        esp3SimpleParser.removeListener('error', spy)
      })
      it('under siege', function () {
        const spy = sinon.spy()
        const parser = new ESP3Parser({ maxBufferSize: 32 })
        var ec = [0, 0, 0, 0, 0]
        parser.on('data', spy)
        parser.on('error', err => ec[err.code]++)
        for (var t = 1; t <= 1000; t++) {
          var buf = []
          for (var i = 0; i < 500; i++) {
            buf.push(Math.floor(Math.random() * 255))
          }
          parser.write(Buffer.from(buf))
          parser.write(Buffer.from('55005500010005700838', 'hex'))
          // assert.equal(errorSpy.callCount, t, `${esp3SimpleParser.currentESP3Packet.toString()} ind state ${esp3SimpleParser.state}`)
        }
        assert.isAbove(spy.callCount, 995, `${ec}`)
        parser.removeListener('error', spy)
        parser.removeListener('data', spy)
      })
    })
  })
})
