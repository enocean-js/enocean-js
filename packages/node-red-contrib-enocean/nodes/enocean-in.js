module.exports = RED => {
  function EnoceanInNode (config) {
    RED.nodes.createNode(this, config)
    this.name = config.name
    this.serialport = config.serialport
    this.status({ fill: 'grey', shape: 'ring', text: 'not initialized' })
    var node = this
    makeStateRefreshable(node, RED)
    EnoceanListener(node, data => {
      node.status({ fill: 'green', shape: 'dot', text: 'data' })
      setTimeout(() => node.status({ fill: 'green', shape: 'ring', text: 'data' }), 100)
      node.send({
        payload: data
      })
    })
  }

  async function EnoceanListener (node, cb) {
    const usb = RED.nodes.getNode(node.serialport)
    if (usb.baseId === '') {
      await usb.getBaseId(node)
    }
    usb.transformer.on('data', cb)
  }
  RED.nodes.registerType('enocean-in', EnoceanInNode)
}

function makeStateRefreshable (node, red) {
  node.refreshState = () => {
    const usb = red.nodes.getNode(node.serialport)
    if (usb.baseId === '') {
      node.status({ fill: 'red', shape: 'dot', text: 'error: no baseId' })
    } else {
      node.status({ fill: 'green', shape: 'ring', text: 'data' })
    }
  }
}
