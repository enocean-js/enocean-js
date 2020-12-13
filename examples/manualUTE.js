const SerialPort = require('serialport')
const Enocean = require('../packages')
const ESP3Parser = Enocean.ESP3Parser
const RadioERP1 = Enocean.RadioERP1
const ESP3Transformer = Enocean.ESP3Transformer
// change the serial port to fit your device
const port = new SerialPort('/dev/ttyUSB0', { baudRate: 57600 })
const parser = new ESP3Parser()
const transformer = new ESP3Transformer()
const sender = Enocean.SerialportSender({ port: port, parser: new ESP3Parser() })
const Commander = new Enocean.Commander(sender)
let baseId = ''

// add timestamp to the console logging
console.logCopy = console.log.bind(console)
console.log = function (data) {
  const currentDate = '[' + new Date().toISOString().replace(/z|t/gi, ' ').trim() + '] '
  this.logCopy(currentDate, data)
}

console.log('--- start ---')

port.pipe(parser).pipe(transformer)

async function init () {
  const res = await Commander.getIdBase()
  baseId = parseInt(res.baseId.toString(), 16)
  console.log('BaseId:' + res.baseId.toString())
}

// array to store the teached in deviced
const known = {}
// add the previously teached devices manually
// (there is no storage of teached devices yet)
known['050e0ed1'] = { eep: 'd2-50-00' }

// register on new data received
transformer.on('data', async data => {
  console.log('--- new Data! --- ')
  if (data && data.constructor.name === 'RadioERP1') {
    console.log('ERP1')
    console.log('Data: ' + data.toString())
    if (data.teachIn) {
      console.log('TeachIn')
      const teachInInfo = data.teachInInfo
      console.log('TeachIn telegram')
      if (!(teachInInfo.senderId in known)) {
        if (baseId === '') await init()
        known[data.senderId] = teachInInfo
        //* ****************************************************************************
        const ret = RadioERP1.from({ rorg: 0xd4, payload: data.payload })
        ret.senderId = baseId + 1
        ret.destinationId = data.senderId // the response needs to be sent directy to the device (no broadcast)
        // setValue (value, bitoffset, length)
        ret.payload = ret.payload.setValue(1, 0, 1) // bidi
        ret.payload = ret.payload.setValue(1, 2, 2) // teach in successful
        ret.payload = ret.payload.setValue(1, 4, 4) // this is a teach in response
        console.log('Response: ' + ret.toString())
        console.log('Sent: ' + await sender.send(ret.toString()))
        //* ******************************************************************************
      } else {
        console.log('TeachIn from already known sender')
      }
    } else {
      console.log('Data telegram')
      if (data.senderId in known) {
        console.log('Known sender: ' + data.senderId)
        console.log(data.decode(known[data.senderId].eep.toString()))
      }
    }
  } else {
    console.log('Non RadioERP1 data: ' + data.toString())
  }
})
