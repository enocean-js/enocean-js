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
      var senderId = this.serialport.baseId + parseInt(msg.payload.meta.channel)
      if (msg.payload.meta.type === 'teach-in') {
        // send teach-in
        var te = RadioERP1.makeTeachIn({ type: msg.payload['teach-in'].type, eep: msg.payload.meta.eep, senderId: senderId })
        await node.serialport.sender.send(te.toString())
        // followed by a data telegram
        var tel0 = RadioERP1.from({ rorg: parseInt(msg.payload.meta.eep.split('-')[0], 16), eep: msg.payload.meta.eep, payload: [0], id: senderId, direction: msg.payload.meta.direction || 1, data: msg.payload.meta.data || 0, status: msg.payload.meta.status || 0 })
        tel0.teachIn = false
        tel0.encode(msg.payload.data, { eep: msg.payload.meta.eep, direction: msg.payload.meta.direction || 1, data: msg.payload.meta.data || 0, status: msg.payload.meta.status || 0 })
        await node.serialport.sender.send(tel0.toString())
      } else {
        var tel = RadioERP1.from({ rorg: parseInt(msg.payload.meta.eep.split('-')[0], 16), eep: msg.payload.meta.eep, payload: [0], id: senderId, direction: msg.payload.meta.direction || 1, data: msg.payload.meta.data || 0, status: msg.payload.meta.status || 0 })
        tel.encode(msg.payload.data, { eep: msg.payload.meta.eep, direction: msg.payload.meta.direction || 1, data: msg.payload.meta.data || 0, status: msg.payload.meta.status || 0 })
        tel.teachIn = false
        await node.serialport.sender.send(tel.toString())
      }
    })
  }
  RED.nodes.registerType('enocean-out', EnOceanOutputNode)
}
