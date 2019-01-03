/*eslint-disable*/
const SerialPort = require('serialport')
const Enocean = require('../')
const ESP3Parser = Enocean.ESP3Parser
const ESP3Transformer = Enocean.ESP3Transformer
const port = new SerialPort('/dev/ttyUSB0', { baudRate: 57600 })
const parser = new ESP3Parser()
const transformer = new ESP3Transformer()
port.pipe(parser).pipe(transformer)

var known = {}

transformer.on('data', data => {
  if (data.constructor.name === "RadioERP1") {
    if(data.teachIn){
      var teachInInfo = data.teachInInfo
      if(!known.hasOwnProperty(teachInInfo.senderId)){
        known[data.senderId] = teachInInfo
      }
    }
    if(known.hasOwnProperty(data.senderId)){
      console.log(data.decode(known[data.senderId].eep.toString()))
    }
  }
})
