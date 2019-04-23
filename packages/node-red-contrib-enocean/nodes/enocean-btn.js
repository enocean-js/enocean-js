const RadioERP1 = require('@enocean-js/radio-erp1').RadioERP1

module.exports = RED => {
  function EnOceanButtonNode (config) {
    RED.nodes.createNode(this, config)
    this.offset = config.offset
    this.serialport = RED.nodes.getNode(config.serialport)

    var node = this

    node.on('input', async function (msg) {
      node.btn = RadioERP1.from({ eep: 'f6-03-01', payload: [0], id: node.serialport.baseId + msg.payload.channel })
      func[msg.payload.event](node, msg.payload.button)
    })
  }
  return EnOceanButtonNode
}

var func = {
  'click': btnClick,
  'down': btnDown,
  'release': release
}

async function btnClick (node, btn) {
  await btnDown(node, btn)
  await release(node)
}

async function release (node) {
  node.btn.payload = node.btn.encode({ R1: 0, EB: 0 }, { eep: 'f6-03-01', status: 0x0 })
  await node.serialport.sender.send(node.btn.toString())
}

async function btnDown (node, btn) {
  node.btn.payload = node.btn.encode({ R1: btn, EB: 1 }, { eep: 'f6-03-01', status: 0x10 })
  await node.serialport.sender.send(node.btn.toString())
}
