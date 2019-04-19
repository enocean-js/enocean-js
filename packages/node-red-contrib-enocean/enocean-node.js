const ESP3Parser = require('@enocean-js/serialport-parser').ESP3Parser
const SerialPort = require('serialport')
const ESP3Transfomer = require('@enocean-js/esp3-packets').ESP3Transformer
const SerialportSender = require('@enocean-js/serialport-sender').SerialportSender
const Commander = require('@enocean-js/common-command').Commander
const RadioERP1 = require('@enocean-js/radio-erp1').RadioERP1

module.exports = function (RED) {
  function EnOceanConfigNode (config) {
    RED.nodes.createNode(this, config)
    this.serialport = config.serialport
    this.port = null
    this.baseId = ''
    var node = this
    node.on('close', function (done) {
      node.port.close(done)
    })
    try {
      this.port = new SerialPort(this.serialport, { baudRate: 57600 })
      this.port.on('error', err => {
        if (err) {
          node.warn('could not open port. Most likely you are trying to open the same port twice.')
        }
      })
      this.transformer = new ESP3Transfomer()
      this.parser = new ESP3Parser()
      this.port.pipe(this.parser).pipe(this.transformer)
      this.sender = SerialportSender({ port: this.port, parser: new ESP3Parser()})
      this.commander = new Commander(this.sender)
      this.getBaseId = async function (x) {
        try {
          var res = await this.commander.getIdBase()
          node.baseId = parseInt(res.baseId.toString(), 16)
          if (x) {
            setActorNodeStatus(x)
          }
        } catch (err) {
          node.error('could not get Base ID')
        }
      }
      this.getBaseId()
    } catch (err) {
      console.log('err')
    }
  }
  RED.nodes.registerType('enocean-config-node', EnOceanConfigNode)

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

  function EnoceanActorNode (config) {
    RED.nodes.createNode(this, config)
    var ctx = this.context()
    var eep = ctx.get('eep')
    var sid = ctx.get('senderId')
    this.eep = (config.eep ? config.eep : eep || '').toLowerCase()
    this.senderId = (config.senderId ? config.senderId : sid || '').toLowerCase()
    this.direction = config.direction
    this.serialport = config.serialport
    this.teachInStatus = false
    this.status({ fill: 'grey', shape: 'ring', text: 'not initialized' })
    var node = this
    node.stopTeachIn = () => {
      node.teachInStatus = false
      clearTimeout(node.teachInInterval)
      clearInterval(node.blink)
      setActorNodeStatus(node)
    }
    node.startTeachIn = () => {
      var sec = 30
      var dot = true
      node.teachInStatus = true
      node.status({ fill: 'blue', shape: dot ? 'dot' : 'ring', text: `teach-in mode ${sec.toFixed(0)}s` })
      node.blink = setInterval(() => {
        sec -= 0.5
        dot = !dot
        node.status({ fill: 'blue', shape: dot ? 'dot' : 'ring', text: `teach-in mode ${sec.toFixed(0)}s` })
      }, 500)
      node.teachInInterval = setTimeout(() => {
        node.teachInStatus = false
        setActorNodeStatus(node)
        clearInterval(node.blink)
      }, sec * 1000)
    }
    node.receive = function () {
      node.startTeachIn()
    }
    node.on('input', msg => {
      if (msg.payload === true) {
        node.startTeachIn()
      } else {
        node.stopTeachIn()
      }
    })
    EnoceanListener(node, data => {
      if (data.senderId === node.senderId) {
        if (data.RORG !== 0xf6 && data.teachIn) return
        if (data.RORG.toString(16) !== node.eep.split('-')[0]) return
        node.send({
          payload: data.decode(node.eep, node.direction),
          meta: {
            senderId: data.senderId,
            RORG: data.RORG,
            eep: node.eep,
            RSSI: data.RSSI,
            payload: data.payload.toString(),
            subTelNum: data.subTelNum,
            raw: data.toString(),
            timestamp: Date.now()
          }
        })
      }
      if (this.teachInStatus === true) {
        if (data.teachIn) {
          this.eep = data.teachInInfo.eep.toString()
          this.senderId = data.teachInInfo.senderId
          node.context().set('eep', data.teachInInfo.eep.toString())
          node.context().set('senderId', data.teachInInfo.senderId)
          node.stopTeachIn()
          node.send({
            payload: {
              senderId: data.teachInInfo.senderId,
              eep: data.teachInInfo.eep.toString(),
              manufacturer: data.teachInInfo.manufacturer
            },
            meta: {
              senderId: data.teachInInfo.senderId,
              RORG: data.RORG,
              eep: data.teachInInfo.eep.toString(),
              RSSI: data.RSSI,
              payload: data.payload.toString(),
              subTelNum: data.subTelNum,
              raw: data.toString(),
              timestamp: Date.now()
            }
          })
        }
      }
    })
  }
  RED.nodes.registerType('enocean-actor', EnoceanActorNode)

  async function EnoceanListener (node, cb) {
    const transformer = new ESP3Transfomer()
    const parser = new ESP3Parser()
    const usb = RED.nodes.getNode(node.serialport)
    if (usb.baseId === '') {
      await usb.getBaseId(node)
    }
    // setActorNodeStatus(node)
    usb.transformer.on('data', cb)
  }

  function setActorNodeStatus (node) {
    const usb = RED.nodes.getNode(node.serialport)
    if (usb.baseId === '') {
      node.status({ fill: 'red', shape: 'dot', text: 'error: no baseId' })
    } else {
      if (node.senderId !== '' && node.eep !== '') {
        node.status({ fill: 'green', shape: 'dot', text: node.senderId })
      } else {
        node.status({ fill: 'grey', shape: 'dot', text: 'connected' })
      }
    }
  }

  // function EnoceanTeachInInfoNode(config) {
  //   RED.nodes.createNode(this,config);
  //   EnoceanListener(this,config,data=>{
  //     if(data.teachIn){
  //       node.send({payload: data.teachInInfo })
  //     }
  //   })
  // }
  // RED.nodes.registerType("enocean-teach-in-info", EnoceanTeachInInfoNode);
}
