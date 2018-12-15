/*eslint-disable*/
import { ESP3Parser } from '@enocean-js/serialport-parser'
import { makeESP3Packet } from '@enocean-js/esp3-packets'
import { makeCommandSender } from '@enocean-js/serialport-sender'

const SerialPort = require('serialport')

const port = new SerialPort('/dev/ttyUSB1', { baudRate: 57600 })
const parser = port.pipe(new ESP3Parser({ maxBufferSize: 200 }))
const parser2 = port.pipe(new ESP3Parser({ maxBufferSize: 200 }))

parser.on('data', data => {
  console.log('1:', data.toString('hex'))
})

async function main () {
  var sender = makeCommandSender({port: port, parser: parser2})
  // var res = await sender.send('CO_WR_IDBASE', 'ff800000')
  var res = await sender.send('CO_RD_VERSION')
  console.log(res)
}
main()
