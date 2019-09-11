// const RadioERP1 = require('@enocean-js/radio-erp1').RadioERP1

module.exports = RED => {
  function EnOceanButtonNode (config) {
    RED.nodes.createNode(this, config)
    // this.serialport = RED.nodes.getNode(config.serialport)
    this.encoding = config.encoding
    this.delay = config.delay
    var node = this
    node.payload = {
      meta: {
        eep: node.encoding,
        channel: 22,
        type: 'data'
      },
      data: {}
    }

    node.on('input', async function (msg) {
      // node.btn = RadioERP1.from({ eep: 'f6-03-01', payload: [0], id: node.serialport.baseId + msg.payload.channel })
      node.payload.meta.channel = msg.payload.channel
      func[msg.payload.event](node, msg.payload.button)
    })
  }
  RED.nodes.registerType('enocean-btn', EnOceanButtonNode)
}

var func = {
  click: btnClick,
  down: btnDown,
  release: release
}

async function btnClick (node, btn) {
  await btnDown(node, btn)
  await delay(node.delay)
  await release(node)
}

async function release (node) {
  node.payload.data = { R1: 0, EB: 0 }
  node.payload.meta.eep = node.encoding
  if (node.payload.meta.eep.split('-')[1] === '02') {
    node.payload.meta.status = 0b00100000
  } else {
    node.payload.meta.status = 0b00000000
  }
  node.send({ payload: node.payload })
  // node.btn.payload = node.btn.encode({ R1: 0, EB: 0 }, { eep: 'f6-03-01', status: 0x0 })
  // await node.serialport.sender.send(node.btn.toString())
}

async function btnDown (node, btn) {
  node.payload.data = { R1: btn, EB: 1 }
  node.payload.meta.eep = node.encoding
  if (node.payload.meta.eep.split('-')[1] === '02') {
    node.payload.meta.status = 0b00110000
  } else {
    node.payload.meta.status = 0b00010000
  }
  node.send({ payload: node.payload })
  // node.btn.payload = node.btn.encode({ R1: btn, EB: 1 }, { eep: 'f6-03-01', status: 0b00010000 })
  // await node.serialport.sender.send(node.btn.toString())
}

function delay (x) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, x)
  })
}
// {
//   "meta": {
//     "eep": "a5-12-04",
//     "channel": 3
//     "type": "data", // teach-in
//     "direction": 1,
//     "data": 0,
//     "status": 0
//   },
//   "teach-in":{
//     "type": "4BS"
//   },
//   "data": {
//     "TMP": 21
//   }
// }

// node.send()
