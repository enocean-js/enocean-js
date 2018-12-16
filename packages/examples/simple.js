/*eslint-disable*/
import { SerialportSender } from '@enocean-js/serialport-sender'
import { ESP3Parser } from '@enocean-js/serialport-parser'
import { CommonCommand } from '@enocean-js/esp3-packets'

const SerialPort = require('serialport')

const port = new SerialPort('/dev/ttyUSB1', { baudRate: 57600 })

var sender = SerialportSender({port: port, parser: new ESP3Parser({ maxBufferSize: 200 })})
var commander = CommonCommand.connect(sender)


async function main () {
  // var res = await sender.send('CO_WR_IDBASE', 'ff800000')
  // var res = await comander.send('CO_WR_RESET')
  console.log(await commander.getVersion())
}
main()
