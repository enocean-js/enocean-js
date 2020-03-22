const RadioERP1 = require('@enocean-js/radio-erp1').RadioERP1
// const Response = require('@enocean-js/esp3-packets').Response
module.exports = RED => {
  function EnOceanOutputNode (config) {
    RED.nodes.createNode(this, config)
    this.logOutput = config.logOutput
    this.serialport = RED.nodes.getNode(config.serialport)
    var node = this
    node.on('input', async function (msg) {
      if (node.serialport.baseId === '') {
        var suc = await node.serialport.getBaseId(node)
        if (!suc) {
          return
        }
      }
      if (typeof msg.payload === 'string') {
        await enoSend(node, msg.payload)
        return
      }
      var senderId = this.serialport.baseId + parseInt(msg.payload.meta.channel)
      if (msg.payload.meta.type === 'teach-in-response') {
        msg.payload.data.senderId = senderId
        var ret = RadioERP1.makeTeachIn(msg.payload.data)
        await enoSend(node, ret.toString())
        return
      }
      msg.payload.meta.eep = msg.payload.meta.eep.toLowerCase()
      for (var field in msg.payload.data) {
        var val = msg.payload.data[field]
        delete msg.payload.data[field]
        msg.payload.data[field.toUpperCase()] = val
      }
      if (msg.payload.meta.type === 'teach-in') {
        // send teach-in
        var te = RadioERP1.makeTeachIn({ ...msg.payload['teach-in'], ...{ senderId: senderId, eep: msg.payload.meta.eep } })
        await enoSend(node, te.toString())
        // followed by a data telegram
        var tel0 = RadioERP1.from({ rorg: parseInt(msg.payload.meta.eep.split('-')[0], 16), eep: msg.payload.meta.eep, payload: [0], id: senderId, direction: msg.payload.meta.direction || 1, data: msg.payload.meta.data || 0, status: msg.payload.meta.status || 0 })
        if (msg.payload.meta.eep.split('-')[0] !== 'f6' && msg.payload.meta.eep.split('-')[0] !== 'd2') {
          tel0.teachIn = false
        }
        tel0.encode(msg.payload.data, { eep: msg.payload.meta.eep, direction: msg.payload.meta.direction || 1, data: msg.payload.meta.data || 0, status: msg.payload.meta.status || 0 })
        await enoSend(node, tel0.toString())
      } else {
        var tel = RadioERP1.from({ rorg: parseInt(msg.payload.meta.eep.split('-')[0], 16), eep: msg.payload.meta.eep, payload: [0], id: senderId, direction: msg.payload.meta.direction || 1, data: msg.payload.meta.data || 0, status: msg.payload.meta.status || 0 })
        tel.encode(msg.payload.data, { eep: msg.payload.meta.eep, direction: msg.payload.meta.direction || 1, data: msg.payload.meta.data || 0, status: msg.payload.meta.status || 0 })
        if (msg.payload.meta.eep.split('-')[0] !== 'f6' && msg.payload.meta.eep.split('-')[0] !== 'd2') {
          tel.teachIn = false
        }
        tel.destinationId = msg.payload.meta.destinationId || 'ffffffff'
        await enoSend(node, tel.toString())
      }
    })
  }
  RED.nodes.registerType('enocean-out', EnOceanOutputNode)
}

async function enoSend (node, data) {
  var res = await node.serialport.sender.send(data)
  // var res = Response.from(ret)
  if (res.responseType !== 'RET_OK') {
    node.warn(res.responseType)
  }
  if (node.logOutput) {
    node.send({
      payload: data,
      return: res
    })
  }
}
