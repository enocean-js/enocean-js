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
    try {
      this.baseId = ''
      this.port = new SerialPort(this.serialport, { baudRate: 57600 })
      this.sender = SerialportSender({ port: this.port, parser: new ESP3Parser() })
      this.commander = new Commander(this.sender)
      var node = this
      this.getBaseId = async function () {
        var res = await this.commander.getIdBase()
        node.baseId = parseInt(res.baseId.toString(), 16)
      }
      this.getBaseId()
    } catch (err) {
      console.log(err)
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
        }
      } else {
        var tel = RadioERP1.from({ eep: node.eep, payload: [0, 0, 0, 0], senderId: this.serialport.baseId + parseInt(node.offset), direction: node.direction, data: node.data })
        tel.payload = tel.encode(msg.payload, { eep: node.eep, direction: node.direction, data: node.data })
        console.log(tel.toString())
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
    this.eep = config.eep
    this.senderId = config.senderid
    this.direction = config.direction
    var node = this
    if (node.senderId === '' || node.eep === '') {
      this.status({ fill: 'red', shape: 'ring', text: 'unknown EEP' })
    } else {
      this.status({ fill: 'green', shape: 'ring', text: 'listening' })
    }
    EnoceanListener(node, config, data => {
      if (data.senderId === node.senderId) {
        if (data.RORG !== 0xf6 && data.teachIn) return
        if (data.RORG.toString(16) !== node.eep.split('-')[0]) return
        node.send({
          payload: data.decode(node.eep, node.direction)
        })
      }
      if (node.senderId === '' || node.eep === '') {
        if (data.teachIn) {
          this.eep = config.eep
          this.senderId = config.senderid
          node.send({
            payload: {
              senderId: data.teachInInfo.senderId,
              eep: data.teachInInfo.eep.toString()
            }
          })
        }
      }
    })
  }
  RED.nodes.registerType('enocean-actor', EnoceanActorNode)

  function EnoceanListener (node, config, cb) {
    const transformer = new ESP3Transfomer()
    const parser = new ESP3Parser()
    const usb = RED.nodes.getNode(config.serialport)
    node.on('close', function (done) {
      usb.port.close(done)
    })
    usb.port.pipe(parser).pipe(transformer)
    transformer.on('data', cb)
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
