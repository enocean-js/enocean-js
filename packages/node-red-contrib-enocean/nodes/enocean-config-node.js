const ESP3Parser = require('@enocean-js/serialport-parser').ESP3Parser
const SerialPort = require('serialport')
const ESP3Transfomer = require('@enocean-js/esp3-packets').ESP3Transformer
const SerialportSender = require('@enocean-js/serialport-sender').SerialportSender
const Commander = require('@enocean-js/common-command').Commander
const getEEP = require('@enocean-js/eep-transcoder').getEEP
const path = require('path')

module.exports = RED => {
  function EnOceanConfigNode (config) {
    RED.nodes.createNode(this, config)
    this.serialport = config.serialport
    this.port = null
    this.baseId = ''
    makeTP(this)
    var node = this
    node.on('close', function (done) {
      node.port.removeListener('error', errorHandler)
      node.port.close(done)
      node.log('port closed')
    })
    try {
      openPort(node)
    } catch (err) {
      console.log(err)
    }
  }
  RED.nodes.registerType('enocean-config-node', EnOceanConfigNode)
  RED.httpAdmin.get('/enocean-js/info/:node/baseid/', function (req, res) {
    try {
      var node = RED.nodes.getNode(req.params.node)
      res.send({ baseId: node.serialport.baseId })
    } catch (err) {
      res.send({ baseId: 'unknown' })
    }
  })
  RED.httpAdmin.get('/enocean-js/port/list', async function (req, res) {
    res.send(await SerialPort.list())
  })
  RED.httpAdmin.get('/enocean-js/eep/:eep', function (req, res) {
    res.send(getEEP(req.params.eep))
  })
  RED.httpAdmin.get('/enocean-js/context/:node/set/:name/:value', function (req, res) {
    var n = RED.nodes.getNode(req.params.node)
    n.context().set(req.params.name, JSON.parse(req.params.value))
    n.sensors = n.context().get(req.params.name)
  })
  RED.httpAdmin.get('/enocean-js/:filename', function (req, res) {
    var options = {
      root: path.join(__dirname, '/static/'),
      dotfiles: 'deny'
    }
    res.sendFile(req.params.filename, options)
  })
}

function errorHandler (err) {
  if (err) {
    this.warn(err)
  }
}

async function openPort (node) {
  node.port = new SerialPort(node.serialport, { baudRate: 57600, autoOpen: false })
  node.port.open(async err => {
    if (err) {
      node.warn(err)
    } else {
      node.log('port opened')
      await node.getBaseId()
      node.log(`Your BaseID is ${node.baseId.toString(16)}`)
    }
  })
  node.port.on('error', errorHandler.bind(node))
  makeCommander(node)
  node.port.pipe(node.parser).on('error', err => {
    if (err) {
      console.log(err)
    }
  }).pipe(node.transformer).on('error', err => {
    if (err) {
      console.log(err)
    }
  })
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
      if (node.port.isOpen) {
        var res = await node.commander.getIdBase()
        node.baseId = parseInt(res.baseId.toString(), 16)
        var globalContext = node.context().global
        globalContext.set('enocean-base-id', node.baseId)
        if (x) {
          x.refreshState()
        }
        return true
      } else {
        node.warn('port is not open')
        return false
      }
    } catch (err) {
      console.log(err)
      return false
    }
  }
}
