/*eslint-disable*/
const SerialPort = require('serialport')
const Enocean = require('../')
const ESP3Parser = Enocean.ESP3Parser
//const decode = Enocean.decode
const port = new SerialPort('/dev/ttyUSB0', { baudRate: 57600 })
const parser = new ESP3Parser()
port.pipe(parser)

var known = {}

parser.on('data', data => {
  if (data.packetType === 1) {
    var telegram = Enocean.RadioERP1.from(data.toString())
    if(telegram.teachIn){
      var teachInInfo = telegram.teachInInfo
      if(!known.hasOwnProperty(teachInInfo.senderId)){
        known[telegram.senderId] = teachInInfo
      }
    }
    if(known.hasOwnProperty(telgram.senderId) && !telegram.teachIn){
      console.log(p.decode(known[telegram.senderId].eep.toString()))
    }
  }
})
