module.exports = RED => {
  function EnoceanInNode (config) {
    RED.nodes.createNode(this, config)
    var ctx = this.context()
    var eep = ctx.get('eep')
    var sid = ctx.get('senderId')
    setSensor(this, config, eep, sid)

    this.direction = config.direction
    this.serialport = config.serialport
    this.teachInStatus = false

    this.status({ fill: 'grey', shape: 'ring', text: 'not initialized' })

    var node = this

    makeStateRefreshable(node, RED)
    makeLearner(node)
    makeInjectionable(node)

    EnoceanListener(node, makeEnoceanListenerCallback(node))
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

function setSensor (node, config, eep, sid) {
  node.eep = (config.eep ? config.eep : eep || '').toLowerCase()
  node.senderId = (config.senderid ? config.senderid : sid || '').toLowerCase()
}

function makeEnoceanListenerCallback (node) {
  return function (data) {
    node.send({
      payload: data
    })
    // if (data.senderId === node.senderId && isDataTelegram(node, data)) {
    //   node.status({ fill: 'green', shape: 'dot', text: node.senderId })
    //   setTimeout(() => node.status({ fill: 'green', shape: 'ring', text: node.senderId }), 100)
    //   node.send({
    //     payload: data.decode(node.eep, node.direction),
    //     meta: makeMeta(data.senderId, node.eep, data)
    //   })
    // }
    // if (node.teachInStatus === true) {
    //   if (data.teachIn) {
    //     saveSender(node, data.teachInInfo.senderId, data.teachInInfo.eep.toString())
    //     node.stopTeachIn()
    //     node.send({
    //       payload: {
    //         senderId: data.teachInInfo.senderId,
    //         eep: data.teachInInfo.eep.toString(),
    //         manufacturer: data.teachInInfo.manufacturer
    //       },
    //       meta: makeMeta(data.teachInInfo.senderId, data.teachInInfo.eep.toString(), data)
    //     })
    //   }
    // }
  }
}

function isDataTelegram (node, tel) {
  if (tel.constructor.name !== 'RadioERP1') {
    return false
  }
  if (tel.RORG !== 0xf6 && tel.teachIn) {
    return false
  }
  if (tel.RORG.toString(16) !== node.eep.split('-')[0]) {
    // telegram is either an UTE or MSC or some other non standard telegram
    // this might not be the right place to check it!
    return false
  }
  return true
}

function saveSender (node, sender, eep) {
  node.eep = eep
  node.senderId = sender
  node.context().set('eep', eep)
  node.context().set('senderId', sender)
}

function makeMeta (sender, eep, data) {
  return {
    senderId: sender,
    RORG: data.RORG,
    eep: eep,
    RSSI: data.RSSI,
    payload: data.payload.toString(),
    subTelNum: data.subTelNum,
    raw: data.toString(),
    timestamp: Date.now()
  }
}

function makeStateRefreshable (node, red) {
  node.refreshState = () => {
    const usb = red.nodes.getNode(node.serialport)
    if (usb.baseId === '') {
      node.status({ fill: 'red', shape: 'dot', text: 'error: no baseId' })
      return
    }
    if (node.senderId !== '' && node.eep !== '') {
      node.status({ fill: 'green', shape: 'ring', text: node.senderId })
    } else {
      node.status({ fill: 'grey', shape: 'dot', text: 'connected' })
    }
  }
}

function makeLearner (node) {
  node.stopTeachIn = () => {
    node.teachInStatus = false
    clearTimeout(node.teachInInterval)
    clearInterval(node.blink)
    node.refreshState()
  }
  node.startTeachIn = () => {
    if(node.teachInStatus === true){
      node.stopTeachIn()
      return
    }
    var sec = 30
    var dot = true
    node.teachInStatus = true
    node.status({ fill: 'blue', shape: 'dot', text: `teach-in mode ${sec.toFixed(0)}s` })
    node.blink = setInterval(() => {
      sec -= 0.5
      dot = !dot
      node.status({ fill: 'blue', shape: dot ? 'dot' : 'ring', text: `teach-in mode ${sec.toFixed(0)}s` })
    }, 500)
    node.teachInInterval = setTimeout(() => {
      node.teachInStatus = false
      node.refreshState()
      clearInterval(node.blink)
    }, sec * 1000)
  }
}

function makeInjectionable (node) {
  node.receive = function () {
    // this function gets called when the inject button is clicked
    node.startTeachIn()
  }
  node.on('input', msg => {
    if (msg.payload === true) {
      node.startTeachIn()
    } else {
      node.stopTeachIn()
    }
  })
}
