import ESP3Packet from '../ESP3Packet'
import emptyPacket from '../EmptyPacketStructure.js'

export default class Radio802 extends ESP3Packet {
  constructor (esp3Packet = emptyPacket) {
    esp3Packet.header.packetType = 0x10
    super(esp3Packet)
    this.RSSI = this.optionalData[0]
  }
}
