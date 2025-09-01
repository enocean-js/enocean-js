import ESP3Packet from '../ESP3Packet'
import emptyPacket from '../EmptyPacketStructure.js'

export default class RadioMessage extends ESP3Packet {
  constructor (esp3Packet = emptyPacket) {
    esp3Packet.header.packetType = 0x09
    super(esp3Packet)
    this.RORG = this.data[0]
    this.content = this.data.slice(1, this.data.length)
    this.destinationID = this.optionalData.slice(0, 4).toString('hex')
    this.sourceID = this.optionalData.slice(4, 8).toString('hex')
    this.RSSI = this.optionalData[this.optionalData.length - 2]
    this.securityLevel = this.optionalData[this.optionalData.length - 1]
  }
}
