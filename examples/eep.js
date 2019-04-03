/*eslint-disable*/
const SerialPort = require('serialport')
const Enocean = require('../')
const ESP3Parser = Enocean.ESP3Parser
const RadioERP1 = Enocean.RadioERP1
const ESP3Transformer = Enocean.ESP3Transformer
const port = new SerialPort('/dev/ttyUSB0', { baudRate: 57600 })
const parser = new ESP3Parser()
const transformer = new ESP3Transformer()
const sender = Enocean.SerialportSender({ port: port, parser: new ESP3Parser() })
const Commander = new Enocean.Commander(sender)
const pretty = Enocean.pretty
var baseId=""

port.pipe(parser).pipe(transformer)

radio = RadioERP1.from({ payload: [0x00, 0x00, 0x00, 0x08] })
radio.payload = radio.encode({ COM: 1, TIM: 100 }, { eep: 'a5-38-08', data: 0 })
console.log(radio.toString())

decoded = radio.decode('d2-50-00')

async function init(){
  var res = await Commander.getIdBase()
  baseId = parseInt(res.baseId.toString(), 16)
  console.log(res.baseId.toString())
}
var known = {}
const ESP3Packet = Enocean.ESP3Packet
transformer.on('data', async data => {
  if (data && data.constructor.name === "RadioERP1") {
    if(data.teachIn){
      var teachInInfo = data.teachInInfo
      if(!known.hasOwnProperty(teachInInfo.senderId)){
        if(baseId==="") await init()
        known[data.senderId] = teachInInfo

        radio = RadioERP1.from({ payload: [0], id: 'ff00ff00' })
        radio.payload = radio.encode({ MT: 0, RMT: 1 }, { eep: 'd2-50-00', data: 0})
        radio.senderId = 'ff00ff00'
        
        decoded = radio.decode('d2-50-00')
        //*****************************************************************************
        var ret = RadioERP1.from({rorg: 0xa5,payload:data.payload})
        ret.senderId = baseId + 1
        ret.destinationId = data.senderId
        ret.payload = ret.payload.setValue(1,0,1) // bidi
        ret.payload = ret.payload.setValue(1,2,2) // teach in successful
        ret.payload = ret.payload.setValue(1,4,4) // this is a teach in response
        console.log(await sender.send(ret.toString()))
        //*******************************************************************************
      }
    }else{
      if(known.hasOwnProperty(data.senderId)){
        //console.log(data.decode(known[data.senderId].eep.toString()))
      }
    }
  }
})
//transformer.write(ESP3Packet.from("55000d0701fdd480ff61000050d2050e0ed10001ffffffff34007b"))
