/*eslint-disable*/
import { SerialportSender } from '@enocean-js/serialport-sender'
import { ESP3Parser } from '@enocean-js/serialport-parser'
import { CommonCommand } from '@enocean-js/common-command'
import { RadioERP1, ESP3Packet } from '@enocean-js/esp3-packets'
import { pretty } from '@enocean-js/pretty-printer'
import { ByteArray } from '@enocean-js/byte-array'

const SerialPort = require('serialport')

const port = new SerialPort('/dev/ttyUSB0', { baudRate: 57600 })

const parser=new ESP3Parser({ maxBufferSize: 2000 })
port.pipe(parser)
var sender = SerialportSender({port: port, parser: new ESP3Parser({ maxBufferSize: 2000 })})

var commander = CommonCommand.connect(sender)
var erp = RadioERP1.connect(sender)

parser.on("data",data=>{
  if(data.packetType===1){
    //console.log(RadioERP1.from(data))
  }
})

async function main () {
  const base = (await commander.getBaseId())
  console.log(base.getRawPacket())
  const A0_DOWN = 0x10
  const A1_DOWN = 0x30
  const RELEASE = 0x00
  var id = parseInt(base.baseId,16)+1
  await erp.send(0xf6,A1_DOWN,id,0x20)
  await erp.send(0xf6,RELEASE,id,0x20)
  // console.log(await commander.setBaseId(0xffaaaa00))
  // console.log(await commander.getBaseId())
  // console.log(await commander.addRadioFilter("rorg","block",0xf6))
  // console.log(await commander.disableFilters())
  // console.log(await commander.setRepeater(0))
  // console.log(await commander.getRepeater())
  //console.log(await commander.addRepeatFilter ("rssi","apply",30))
  //console.log(await commander.deleteFilter(CONST.FILTER_SOURCE_ID,0xff00ff00))
  //console.log(await commander.enableFilters("or"))
  //console.log(await commander.enableWaitMaturity())
  //console.log(await commander.disableWaitMaturity())
  //console.log(await commander.enableSubTel())
  //console.log(await commander.sleep(100))
  //  var addr = await commander.getMemoryAddress(1)
  //  console.log(addr.type,addr.address,addr.length)
  //  var memory = await commander.readMemory(addr.type,addr.address,addr.length)
  //  process.stdout.write(` ${col(202)}0000\x1b[0m  `)
  // for(var i = 0;i<memory.data.length;i++){
  //   process.stdout.write(memory.data[i].toString(16).padStart(2,"0"))
  //   if(i%4 === 3) process.stdout.write(" ")
  //   if(i%32 === 31 && i!==memory.data.length-1) process.stdout.write(`\n ${col(202)}${i.toString(16).padStart(4,"0")}\x1b[0m  `)
  // }
  // process.stdout.write("\n")
  // var ex = await commander.readMemory(addr.type,addr.address,4)
  // console.log(ex.data.toString("hex"))
  // console.log(await commander.writeMemory(addr.type,addr.address,"7affffff"))
  // console.log(await commander.getBaseId())
}
main()
// function col(num){
//   return `\x1b[38;5;${num}m`
// }
