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

async function init(){
  var res = await Commander.getIdBase()
  baseId = parseInt(res.baseId.toString(), 16)
  console.log(res.baseId.toString())
}
var known = {}
const ESP3Packet = Enocean.ESP3Packet
transformer.on('data', async data => {
  //console.log(data.decode("d2-50-00"))
  if (data && data.constructor.name === "RadioERP1") {
    if(data.teachIn){
      var teachInInfo = data.teachInInfo
      console.log(teachInInfo,data.RSSI)
      if(!known.hasOwnProperty(teachInInfo.senderId)){
        if(baseId==="") await init()
        known[data.senderId] = teachInInfo
        radio = RadioERP1.from({ payload: [0], id: 'ff00ff00' })
        radio.payload = radio.encode({ MT: 0, RMT: 1 }, { eep: 'd2-50-00', data: 0})
        radio.senderId = 'ff00ff00'
        decoded = radio.decode('d2-50-00')

        var ret = RadioERP1.makeTeachIn({
          type: 'UTE',
          requestPayload: data.payload,
          bidi: Enocean.UTE_BIDIRECTIONAL,
          result: Enocean.UTE_TEACH_IN_SUCCESSFULL,
          cmd: Enocean.UTE_CMD_RESPONSE,
          destinationId: data.senderId,
          senderId: baseId + 1
        })
        //console.log(await sender.send(ret.toString()))
        //*******************************************************************************
      }
    }else{
      if(known.hasOwnProperty(data.senderId)){
        console.log(data.decode("d2-50-00"))
      }
    }
  }
})

var ret = RadioERP1.makeTeachIn({
  type: '4BS',
  eep: "a5-04-01",
  senderId: 0x11223344//baseId + 1
})
console.log(ret.teachInInfo)
radio = RadioERP1.from({ payload: [0x00, 0x00, 0x00, 0x08] })
radio.payload = radio.encode({HUM:50,TMP:22,TSN:1},{eep:"a5-04-01"})
radio.senderId = 0x11223344
console.log(radio.toString())
//transformer.write(ESP3Packet.from("55000d0701fdd480ff61000050d2050e0ed10001ffffffff34007b"))
//transformer.write(ESP3Packet.from("550014070165d24103003d00935000003c0f21c21c050e0d480001ffffffff4400a0"))
