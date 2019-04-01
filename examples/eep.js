/*eslint-disable*/
const SerialPort = require('serialport')
const Enocean = require('../')
const ESP3Parser = Enocean.ESP3Parser
const ESP3Transformer = Enocean.ESP3Transformer
const port = new SerialPort('/dev/ttyUSB0', { baudRate: 57600 })
const parser = new ESP3Parser()
const transformer = new ESP3Transformer()
const sender = Enocean.SerialportSender({ port: port, parser: new ESP3Parser() })
const Commander = new Enocean.Commander(sender)
var baseId=""

port.pipe(parser).pipe(transformer)

async function init(){
  var res = await Commander.getIdBase()
  baseId = parseInt(res.baseId.toString(), 16)
  console.log(res.baseId.toString())
}
var known = {}
const ESP3Packet = Enocean.ESP3Packet
transformer.on('data', async data => {
  console.log(data.decode())
  if (data && data.constructor.name === "RadioERP1") {
    if(data.teachIn){
      var teachInInfo = data.teachInInfo
      if(!known.hasOwnProperty(teachInInfo.senderId)){
        if(baseId==="") await init()
        known[data.senderId] = teachInInfo
        data.senderId = baseId + 1 
        data.payload = data.payload.setValue(1,0,1) // bidi
        data.payload = data.payload.setValue(1,2,2) // teach in successful
        data.payload = data.payload.setValue(1,4,4) // this is a teach in response
        console.log(await sender.send(data.toString()))
      }
    }else{
      if(known.hasOwnProperty(data.senderId)){
        //console.log(data.decode(known[data.senderId].eep.toString()))
      }
    }
  }
})
transformer.write(ESP3Packet.from("55000d0701fdd480ff61000050d2050e0ed10001ffffffff34007b"))
