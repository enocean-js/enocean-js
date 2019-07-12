// const getEEP = require('@enocean-js/eep-transcoder').getEEP
const RadioERP1 = require('@enocean-js/radio-erp1').RadioERP1
const EO = require('@enocean-js/radio-erp1')

module.exports = RED => {
  function EnoceanActorNode (config) {
    RED.nodes.createNode(this, config)
    this.duration = config.teachInDuration
    this.name = config.name
    this.channel = config.channel
    this.adt = config.adt
    this.teachInStatus = false
    this.teachOutStatus = false
    this.status({ fill: 'grey', shape: 'ring', text: 'data' })
    if (!this.context().get('sensorList')) {
      this.context().set('sensorList', [])
    }
    this.sensors = this.context().get('sensorList')
    var node = this
    this.on('input', async function (m) {
      var msg = m
      if (msg.payload.eep) {
        msg.payload.eep = msg.payload.eep.toLowerCase()
      }
      if (msg.payload.senderId) {
        msg.payload.senderId = msg.payload.senderId.toLowerCase()
      }
      if (msg.payload.type && msg.payload.type === 'LRN' && msg.payload.duration) {
        node.startTeachIn(msg.payload.duration)
        return
      }
      if (msg.payload.type && msg.payload.type === 'LRN' && msg.payload.senderId && msg.payload.eep) {
        const known = this.sensors.filter(item => (item.senderId === msg.payload.senderId && item.eep === msg.payload.eep))
        if (known.length > 0) {
          known[0].name = msg.payload.name
          known[0].direction = msg.payload.direction
          node.context().set('sensorList', node.sensors)
        } else {
          saveSensor(node, msg.payload.senderId, msg.payload.eep, 0, msg.payload.name, msg.payload.direction)
        }
        return
      }
      if (msg.payload.type && msg.payload.type === 'DEL' && msg.payload.duration) {
        node.startTeachOut(msg.payload.duration)
        return
      }
      if (msg.payload.type && msg.payload.type === 'DEL' && msg.payload.senderId) {
        if (msg.payload.eep) {
          node.sensors = this.sensors.filter(item => !(item.senderId === msg.payload.senderId && item.eep === msg.payload.eep))
        } else {
          node.sensors = this.sensors.filter(item => !(item.senderId === msg.payload.senderId))
        }
        node.context().set('sensorList', node.sensors)
        return
      }
      if (typeof msg.payload === 'string' && msg.payload.substr(0, 2) === '55' && msg.payload.substr(8, 2) === '01') {
        msg.meta = { type: 'radio-erp1' }
      }
      if (msg.meta.type && msg.meta.type === 'radio-erp1') {
        try {
          msg.payload = RadioERP1.from(m.payload)
        } catch (err) {
          node.warn('not an ERP1 telegram')
        }
      }

      if (node.teachOutStatus === true) {
        if (msg.payload.teachIn) {
          const tei = msg.payload.teachInInfo
          node.sensors = this.sensors.filter(item => !(item.senderId === tei.senderId))
          node.context().set('sensorList', node.sensors)
          node.stopTeachOut()
          return
        }
      }
      if (node.teachInStatus === true) {
        if (msg.payload.teachIn) {
          const tei = msg.payload.teachInInfo
          if (tei.responseExpected === 0) {
            // var ret = RadioERP1.makeTeachIn()
            node.send([null, {
              payload: {
                data: {
                  type: 'UTE',
                  requestPayload: msg.payload.payload,
                  bidi: EO.UTE_BIDIRECTIONAL,
                  result: EO.UTE_TEACH_IN_SUCCESSFULL,
                  cmd: EO.UTE_CMD_RESPONSE,
                  destinationId: tei.senderId
                },
                meta: {
                  type: 'teach-in-response',
                  channel: node.channel
                }
              }
            }])
          }
          if (!node.sensors.find(item => (item.senderId === tei.senderId && item.eep === tei.eep.toString()))) {
            saveSensor(node, tei.senderId, tei.eep.toString(), msg.payload.RSSI)
            node.stopTeachIn()
          }
        }
      } else {
        if (!msg.payload.teachIn || msg.payload.RORG === 0xf6) {
          // not compatible with multible USB Sticks
          if (msg.payload.constructor.name === 'RadioERP1') {
            var listenerId = parseInt(this.context().global.get('enocean-base-id')) + parseInt(node.channel)
            if (node.adt && !(msg.payload.destinationId === listenerId.toString(16))) {
              return
            }
            this.sensors.filter(item => item.senderId === msg.payload.senderId).forEach(item => {
              if (item.eep.split('-')[0] === msg.payload.RORG.toString(16)) {
                node.status({ fill: 'green', shape: 'dot', text: 'data' })
                setTimeout(() => node.status({ fill: 'grey', shape: 'ring', text: 'data' }), 100)
                node.send([{
                  payload: msg.payload.decode(item.eep, item.direction),
                  meta: makeMeta(item.senderId, item.eep, msg.payload, item.name, node.name, msg),
                  topic: msg.topic
                }, null])
              } else {
                node.status({ fill: 'red', shape: 'dot', text: 'data' })
                setTimeout(() => node.status({ fill: 'grey', shape: 'ring', text: 'data' }), 100)
                node.warn(`received an unknown RORG (${msg.payload.RORG.toString(16)} instead of ${item.eep.split('-')[0]}) from a konwn Sensor (${item.senderId}).`)
              }
            })
          }
        }
      }
    })
    node.startTeachIn = startTeachIn.bind(node)
    node.stopTeachIn = stopTeachIn.bind(node)
    node.startTeachOut = startTeachOut.bind(node)
    node.stopTeachOut = stopTeachOut.bind(node)
  }
  RED.nodes.registerType('enocean-actor', EnoceanActorNode)
}

function saveSensor (node, id, eep, rssi = 0, name = '', direction = 1) {
  const newSensor = {
    senderId: id,
    eep: eep,
    rssi: rssi,
    direction: direction,
    name: name
  }
  node.sensors.push(newSensor)
  node.context().set('sensorList', node.sensors)
}

function stopTeachIn () {
  const node = this
  node.teachInStatus = false
  clearTimeout(node.teachInInterval)
  clearInterval(node.blink)
  node.status({ fill: 'grey', shape: 'ring', text: 'data' })
}

function startTeachIn (dur) {
  const node = this
  if (node.teachInStatus === true || node.teachOutStatus === true) {
    node.stopTeachIn()
    node.stopTeachOut()
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

function stopTeachOut () {
  const node = this
  node.teachOutStatus = false
  clearTimeout(node.teachOutInterval)
  clearInterval(node.blink)
  node.status({ fill: 'grey', shape: 'ring', text: 'data' })
}

function startTeachOut (dur) {
  const node = this
  if (node.teachInStatus === true || node.teachOutStatus === true) {
    node.stopTeachIn()
    node.stopTeachOut()
    node.status({})
    return
  }
  let dot = true
  node.teachOutStatus = true
  node.status({ fill: 'red', shape: 'dot', text: `teach-out mode ${dur.toFixed(0)}s` })
  node.blink = setInterval(() => {
    dur -= 0.5
    dot = !dot
    node.status({ fill: 'red', shape: dot ? 'dot' : 'ring', text: `teach-out mode ${dur.toFixed(0)}s` })
  }, 500)
  node.teachOutInterval = setTimeout(() => {
    node.stopTeachOut()
  }, dur * 1000)
}

function makeMeta (sender, eep, data, name, group, msg) {
  msg.meta.destinationId = data.destinationId
  msg.meta.subTelNum = data.subTelNum
  msg.meta.rssi = data.RSSI
  msg.meta.timestamp = Date.now()
  msg.meta.status = data.status
  msg.meta.type = 'radio-erp1'
  msg.meta.rorg = data.RORG
  msg.meta.eep = eep
  msg.meta.payload = data.payload.toString()
  msg.meta.senderId = sender
  msg.meta.raw = data.toString()
  msg.meta.name = name
  msg.meta.actorName = group
  msg.meta.raw = data.toString()
  return msg.meta
}
