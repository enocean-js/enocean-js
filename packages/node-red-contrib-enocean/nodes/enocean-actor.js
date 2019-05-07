// const getEEP = require('@enocean-js/eep-transcoder').getEEP

module.exports = RED => {
  function EnoceanActorNode (config) {
    RED.nodes.createNode(this, config)
    this.duration = config.teachInDuration
    this.name = config.name
    this.teachInStatus = false
    if (!this.context().get('sensorList')) {
      this.context().set('sensorList', [])
    }
    this.sensors = this.context().get('sensorList')
    var node = this
    this.on('input', async function (msg) {
      if (msg.payload.type && msg.payload.type === 'LRN') {
        node.startTeachIn(msg.payload.duration)
        return
      }
      if (node.teachInStatus === true) {
        if (msg.payload.teachIn) {
          let tei = msg.payload.teachInInfo
          if (!node.sensors.find(item => (item.senderId === tei.senderId && item.eep === tei.eep.toString()))) {
            node.sensors.push({
              senderId: tei.senderId,
              eep: tei.eep.toString(),
              rssi: msg.payload.RSSI,
              direction: msg.payload.direction || 1
            })
            node.context().set('sensorList', node.sensors)
            node.stopTeachIn()
          }
        }
      } else {
        if (!msg.payload.teachIn || msg.payload.RORG === 0xf6) {
          if (msg.payload.constructor.name === 'RadioERP1') {
            this.sensors.filter(item => item.senderId === msg.payload.senderId).forEach(item => {
              if (item.eep.split('-')[0] === msg.payload.RORG.toString(16)) {
                node.send({
                  payload: msg.payload.decode(item.eep, item.direction),
                  meta: makeMeta(item.senderId, item.eep, msg.payload, item.name || node.name)
                })
              } else {
                node.warn(`received an unknown RORG (${msg.payload.RORG.toString(16)} instead of ${item.eep.split('-')[0]}) from a konwn Sensor (${item.senderId}).`)
              }
            })
          }
        }
      }
    })
    node.startTeachIn = startTeachIn.bind(node)
    node.stopTeachIn = stopTeachIn.bind(node)
  }
  RED.nodes.registerType('enocean-actor', EnoceanActorNode)
}

function stopTeachIn () {
  let node = this
  node.teachInStatus = false
  clearTimeout(node.teachInInterval)
  clearInterval(node.blink)
  node.status({})
}

function startTeachIn (dur) {
  let node = this
  if (node.teachInStatus === true) {
    node.stopTeachIn()
    node.status({})
    return
  }
  let dot = true
  node.teachInStatus = true
  node.status({ fill: 'blue', shape: 'dot', text: `teach-in mode ${dur.toFixed(0)}s` })
  node.blink = setInterval(() => {
    dur -= 0.5
    dot = !dot
    node.status({ fill: 'blue', shape: dot ? 'dot' : 'ring', text: `teach-in mode ${dur.toFixed(0)}s` })
  }, 500)
  node.teachInInterval = setTimeout(() => {
    node.stopTeachIn()
  }, dur * 1000)
}
function makeMeta (sender, eep, data, name) {
  return {
    senderId: sender,
    RORG: data.RORG,
    eep: eep,
    RSSI: data.RSSI,
    payload: data.payload.toString(),
    subTelNum: data.subTelNum,
    raw: data.toString(),
    timestamp: Date.now(),
    name: name
  }
}
