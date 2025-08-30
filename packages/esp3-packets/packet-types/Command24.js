import ESP3Packet from '../ESP3Packet'
import emptyPacket from '../EmptyPacketStructure.js'

export default class Command24 extends ESP3Packet {
  constructor (esp3Packet = emptyPacket) {
    super(esp3Packet)
    this.packetType = 0x11
    const commandTypes = [
      { number: 0, name: 'undefined' },
      { number: 1, name: 'SET_CHANNEL' },
      { number: 2, name: 'GET_CHANNEL' }
    ]
    this.commandType = commandTypes[this.data[0]]
    if (this.data[0] === 1) {
      this.channel = this.data[1]
    }
  }
}
