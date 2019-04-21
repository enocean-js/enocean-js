const RadioERP1 = require('@enocean-js/radio-erp1').RadioERP1

module.exports = function (RED) {
  RED.nodes.registerType('enocean-config-node', require('./nodes/enocean-config-node.js')(RED))

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
          var tel0 = RadioERP1.from({ eep: node.eep, payload: [0, 0, 0, 0], id: this.serialport.baseId + parseInt(node.offset), direction: node.direction, data: node.data })
          tel0.payload = tel0.encode({}, { eep: node.eep, direction: node.direction, data: node.data })
          await node.serialport.sender.send(tel0.toString())
        }
      } else {
        var tel = RadioERP1.from({ eep: node.eep, payload: [0, 0, 0, 0], id: this.serialport.baseId + parseInt(node.offset), direction: node.direction, data: node.data })
        tel.payload = tel.encode(msg.payload, { eep: node.eep, direction: node.direction, data: node.data })
        await node.serialport.sender.send(tel.toString())
      }
    })
  }
  RED.nodes.registerType('enocean-out', EnOceanOutputNode)

  function EnOceanButtonNode (config) {
    RED.nodes.createNode(this, config)
    this.offset = config.offset
    this.serialport = RED.nodes.getNode(config.serialport)
    var node = this

    node.on('input', async function (msg) {
      node.btn = RadioERP1.from({ eep: 'f6-02-01', payload: [0], id: node.serialport.baseId + parseInt(node.offset) })
      async function release () {
        node.btn.payload = node.btn.encode({ R1: 0, EB: 0 }, { eep: 'f6-02-01', status: 0x20 })
        await node.serialport.sender.send(node.btn.toString())
      }
      async function btnDown (btn) {
        node.btn.payload = node.btn.encode({ R1: btn, EB: 1 }, { eep: 'f6-02-01', status: 0x30 })
        await node.serialport.sender.send(node.btn.toString())
      }
      if (msg.payload === 'A0_down') {
        await btnDown(1)
      }
      if (msg.payload === 'A1_down') {
        await btnDown(0)
      }
      if (msg.payload === 'B0_down') {
        await btnDown(3)
      }
      if (msg.payload === 'B1_down') {
        await btnDown(2)
      }
      if (msg.payload === 'A0_click') {
        await btnDown(1)
        await release()
      }
      if (msg.payload === 'A1_click') {
        await btnDown(0)
        await release()
      }
      if (msg.payload === 'B0_click') {
        await btnDown(3)
        await release()
      }
      if (msg.payload === 'B1_click') {
        await btnDown(2)
        await release()
      }
      if (msg.payload === 'release') {
        await release()
      }
    })
  }
  RED.nodes.registerType('enocean-btn', EnOceanButtonNode)

  RED.nodes.registerType('enocean-actor', require('./nodes/enocean-in.js')(RED))
}
