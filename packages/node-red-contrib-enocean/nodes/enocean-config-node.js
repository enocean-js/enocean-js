const ESP3Parser = require('@enocean-js/serialport-parser').ESP3Parser
const SerialPort = require('serialport')
const ESP3Transfomer = require('@enocean-js/esp3-packets').ESP3Transformer
const SerialportSender = require('@enocean-js/serialport-sender').SerialportSender
const Commander = require('@enocean-js/common-command').Commander

module.exports = RED => {
  function EnOceanConfigNode (config) {
    RED.nodes.createNode(this, config)
    this.serialport = config.serialport
    this.port = null
    this.baseId = ''
    makeTP(this)
    var node = this
    node.on('close', function (done) {
      node.port.close(done)
    })
    try {
      openPort(node)
    } catch (err) {
      console.log(err)
    }
  }
  return EnOceanConfigNode
}

function openPort (node) {
  node.port = new SerialPort(node.serialport, { baudRate: 57600 })
  node.port.on('error', err => {
    if (err) {
      node.warn('could not open port. Most likely you are trying to open the same port twice.')
    }
  })
  makeCommander(node)
  node.port.pipe(node.parser).pipe(node.transformer)
  node.getBaseId()
}

function makeTP (node) {
  node.transformer = new ESP3Transfomer()
  node.parser = new ESP3Parser()
}

function makeCommander (node) {
  node.sender = SerialportSender({ port: node.port, parser: new ESP3Parser() })
  node.commander = new Commander(node.sender)
  node.getBaseId = async function (x) {
    try {
      var res = await node.commander.getIdBase()
      node.baseId = parseInt(res.baseId.toString(), 16)
      if (x) {
        x.refreshState()
      }
    } catch (err) {
      console.log(err)
      node.error('could not get Base ID')
    }
  }
}
