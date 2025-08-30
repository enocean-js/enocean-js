import { ESP3Packet } from '../../esp3-packet/src/esp3-packet.js'
import * as CONST from './parser-const.js'

const Transform = require('stream').Transform

class ESP3CallbackParser extends Transform {
  constructor (options = { maxBufferSize: 65535 }) {
    super({ ...options, ...{ readableObjectMode: true } })
    this.currentESP3Packet = ESP3Packet.from()
    this.callbackForNextByte = this.waitForSyncByte
    this.maxBufferSize = options.maxBufferSize
  }

  _transform (chunk, encoding, cb) {
    for (let offset = 0; offset < chunk.length; offset++) {
      this.callbackForNextByte(chunk[offset])
    }
    cb()
  }

  waitForSyncByte (byte) {
    if (byte === 0x55) {
      this.currentESP3Packet = ESP3Packet.from(byte)
      this.callbackForNextByte = this.fillHeader
    }
  }

  fillHeader (byte) {
    this.currentESP3Packet.push(byte)
    if (this.currentESP3Packet.length < 5) {
      return
    }
    this.callbackForNextByte = this.checkCRC8Header
  }

  checkCRC8Header (byte) {
    this.currentESP3Packet.push(byte)
    if (!this.currentESP3Packet.isHeaderOK()) {
      let syncCodeIndex = this.currentESP3Packet.findIndex((item, index) => { return (item === 0x55) && (index > 0) })
      if (syncCodeIndex > 0) {
        this.callbackForNextByte = this.fillHeader
        while (syncCodeIndex > 0) {
          this.currentESP3Packet.shift()
          syncCodeIndex--
        }
        return
      }
      this.emit('error', {
        code: CONST.WRONG_HEADER_CHECKSUM_ERROR,
        name: 'WRONG_HEADER_CHECKSUM_ERROR',
        desc: 'header checksum test failed'
      })
      this.callbackForNextByte = this.waitForSyncByte
      return
    }
    if (this.currentESP3Packet.dataLength + this.currentESP3Packet.optionalLength <= 0) {
      this.emit('error', {
        code: CONST.ILLEGAL_PACKET_LENGTH_ERROR,
        name: 'ILLEGAL_PACKET_LENGTH_ERROR',
        desc: 'there must be at least 1 byte of data or optional data, it can not be 0'
      })
      this.callbackForNextByte = this.waitForSyncByte
      return
    }
    this.callbackForNextByte = this.fillDataAndOptionalData
  }

  fillDataAndOptionalData (byte) {
    this.currentESP3Packet.push(byte)
    if (this.currentESP3Packet.length > this.maxBufferSize) {
      this.callbackForNextByte = this.waitForSyncByte
      this.emit('error', {
        code: CONST.BUFFER_OVERFLOW_ERROR,
        name: 'BUFFER_OVERFLOW_ERROR',
        desc: `Max Buffer Size is ${this.maxBufferSize} Bytes`
      })
      return
    }
    if (this.currentESP3Packet.length < this.currentESP3Packet.dataLength + this.currentESP3Packet.optionalLength + 6) {
      return
    }
    this.callbackForNextByte = this.checkCRC8Datas
  }

  checkCRC8Datas (byte) {
    this.currentESP3Packet.push(byte)
    this.callbackForNextByte = this.waitForSyncByte
    if (!this.currentESP3Packet.isBodyOK()) {
      this.emit('error', {
        code: CONST.WRONG_BODY_CHECKSUM_ERROR,
        name: 'WRONG_BODY_CHECKSUM_ERROR',
        desc: 'data checksum test failed'
      })
      return
    }
    this.push(this.currentESP3Packet)
  }
}

export default ESP3CallbackParser
export { ESP3CallbackParser }
