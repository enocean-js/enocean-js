/*eslint-disable*/
import { SerialportSender } from '@enocean-js/serialport-sender'
import { ESP3Parser } from '@enocean-js/serialport-parser'
import { CommonCommand } from '@enocean-js/esp3-packets'
import { pretty } from '@enocean-js/pretty-printer'

const SerialPort = require('serialport')

const port = new SerialPort('/dev/ttyUSB1', { baudRate: 57600 })

const parser=new ESP3Parser({ maxBufferSize: 2000 })
port.pipe(parser)
var sender = SerialportSender({port: port, parser: new ESP3Parser({ maxBufferSize: 2000 })})
var commander = CommonCommand.connect(sender)

parser.on("data",pretty.logESP3)
async function main () {
  
  console.log(await commander.setBaseId(0xffaaaa00))
  console.log(await commander.getBaseId())
  // console.log(await commander.setRepeater(0))
  // console.log(await commander.getRepeater())
  //console.log(await commander.addRepeatFilter ("rssi","apply",30))
  //console.log(await commander.deleteFilter(CONST.FILTER_SOURCE_ID,0xff00ff00))
  //console.log(await commander.enableFilters("or"))
  //console.log(await commander.enableWaitMaturity())
  //console.log(await commander.disableWaitMaturity())
  //console.log(await commander.enableSubTel())
  //console.log(await commander.sleep(100))
  // var addr = await commander.getMemoryAddress(0)
  // var memory = await commander.readMemory(addr.type,addr.address,addr.length)
  // process.stdout.write(` ${col(202)}0000\x1b[0m  `)
  // for(var i = 0;i<memory.data.length;i++){
  //   process.stdout.write(memory.data[i].toString(16).padStart(2,"0"))
  //   if(i%4 === 3) process.stdout.write(" ")
  //   if(i%32 === 31 && i!==memory.data.length-1) process.stdout.write(`\n ${col(202)}${i.toString(16).padStart(4,"0")}\x1b[0m  `)
  // }
  // process.stdout.write("\n")
  // var ex = await commander.readMemory(4,addr.address+63,4)
  // console.log(ex.data.toString("hex"))
  // console.log(await commander.writeMemory(4,addr.address+63,"ff830000"))
  // console.log(await commander.getBaseId())
}
main()
// function col(num){
//   return `\x1b[38;5;${num}m`
// }
