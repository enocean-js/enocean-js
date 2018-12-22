const SerialPort = require('serialport')
const Enocean = require('../')
const pretty = Enocean.pretty
const ESP3Parser = Enocean.ESP3Parser

const port = new SerialPort('/dev/ttyUSB0', { baudRate: 57600 })
const parser = new ESP3Parser()
port.pipe(parser)

parser.on('data', pretty.logESP3)
