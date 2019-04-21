const RadioERP1 = require('@enocean-js/radio-erp1').RadioERP1
module.exports = RED => {
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
  return EnOceanButtonNode
}
