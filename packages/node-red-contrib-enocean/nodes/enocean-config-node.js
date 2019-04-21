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
    var node = this
    node.on('close', function (done) {
      node.port.close(done)
    })
    try {
      node.port = new SerialPort(this.serialport, { baudRate: 57600 })
      node.port.on('error', err => {
        if (err) {
          node.warn('could not open port. Most likely you are trying to open the same port twice.')
        }
      })
      makeCommander(node)
      makeListener(node)
      node.getBaseId()
    } catch (err) {
      console.log('err')
    }
  }
  return EnOceanConfigNode
}


function makeListener(node){
  node.transformer = new ESP3Transfomer()
  node.parser = new ESP3Parser()
  node.port.pipe(this.parser).pipe(node.transformer)
}

function makeCommander(node){
  node.sender = SerialportSender({ port: node.port, parser: new ESP3Parser() })
  node.commander = new Commander(node.sender)
  node.getBaseId = async function (x) {
    try {
      var res = await this.commander.getIdBase()
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
