const SerialPort = require('serialport')
const Enocean = require('../')
const pretty = Enocean.pretty
const ESP3Parser = Enocean.ESP3Parser

const port = new SerialPort('/dev/ttyUSB0', { baudRate: 57600 })
const parser = new ESP3Parser()
port.pipe(parser)

const sender = Enocean.SerialportSender({ port: port, parser: new ESP3Parser() })
const Commander = new Enocean.Commander(sender)
let baseId

const init = async () => {
  const res = await Commander.getIdBase()
  baseId = parseInt(res.baseId.toString(), 16)
  console.log(res.baseId.toString())

  const btn = Enocean.RadioERP1.from({ rorg: 'f6', payload: [0], id: baseId + 1 })

  // Button A1 Down: LIGHT ON
  btn.payload = btn.encode({ R1: 0, EB: 1 }, { eep: 'f6-02-01', status: 0x30 })
  await sender.send(btn.toString())
  // release
  btn.payload = btn.encode({ R1: 0, EB: 0 }, { eep: 'f6-02-01', status: 0x20 })
  await sender.send(btn.toString())
  // Button A0 down LIGHT OFF
  btn.payload = btn.encode({ R1: 1, EB: 1 }, { eep: 'f6-02-01', status: 0x30 })
  await sender.send(btn.toString())
  // release
  btn.payload = btn.encode({ R1: 0, EB: 0 }, { eep: 'f6-02-01', status: 0x20 })
  await sender.send(btn.toString())
}
init()
parser.on('data', pretty.logESP3)
