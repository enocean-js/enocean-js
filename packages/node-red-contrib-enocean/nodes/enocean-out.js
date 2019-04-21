const RadioERP1 = require('@enocean-js/radio-erp1').RadioERP1
module.exports = RED => {
  function EnOceanOutputNode (config) {
    RED.nodes.createNode(this, config)
    this.eep = config.eep
    this.offset = config.offset
    this.direction = config.direction
    this.data = config.data
    this.serialport = RED.nodes.getNode(config.serialport)
    var node = this
    node.on('input', async function (msg) {
      if (typeof msg.payload === 'string') {
        if (msg.payload === 'LRN') {
          var te = RadioERP1.makeTeachIn({ eep: node.eep, senderId: this.serialport.baseId + parseInt(node.offset) })
          await node.serialport.sender.send(te.toString())
          var tel0 = RadioERP1.from({ eep: node.eep, payload: [0, 0, 0, 8], id: this.serialport.baseId + parseInt(node.offset), direction: node.direction, data: node.data })
          tel0.payload = tel0.encode({}, { eep: node.eep, direction: node.direction, data: node.data })
          await node.serialport.sender.send(tel0.toString())
        }
      } else {
        var tel = RadioERP1.from({ eep: node.eep, payload: [0, 0, 0, 8], id: this.serialport.baseId + parseInt(node.offset), direction: node.direction, data: node.data })
        tel.payload = tel.encode(msg.payload, { eep: node.eep, direction: node.direction, data: node.data })
        await node.serialport.sender.send(tel.toString())
      }
    })
  }
  return EnOceanOutputNode
}
