/*eslint-disable*/
const SerialPort = require('serialport')
const Enocean = require('../')
const pretty = Enocean.pretty
const ESP3Parser = Enocean.ESP3Parser
//const decode = Enocean.decode
const port = new SerialPort('/dev/ttyUSB0', { baudRate: 57600 })
const parser = new ESP3Parser()
port.pipe(parser)

var known = {}

parser.on('data', data => {
  if (data.packetType === 1) {
    var p = Enocean.RadioERP1.from(data)
    if (p.senderId === '002a1d7e') console.log(p.decode('f6-01-01'))
    if (p.teachIn) {
      pretty.logESP3(data)
      console.log("TI",p.teachInInfo)
    }
    if (known.hasOwnProperty(p.senderId) && !p.teachIn) {
      console.log('hallo')
      console.log(p.decode(known[p.senderId]))
    }
    // if (p.senderId === '0006d1a6') console.log(p.decode('a5-'))
  }
})

// class MyButton {
//   constructor (id, parser) {
//     parser.on('data', data => {
//       if (data.packetType === 1) {
//         var p = Enocean.RadioERP1.from(data)
//         if (p.senderId === id) {
//           switch (p.decode('f6-02-03').RA.value) {
//             case 0x10:
//               this.onA1down()
//               break
//             case 0x30:
//               this.onA0down()
//               break
//             case 0x70:
//               this.onB0down()
//               break
//             case 0x50:
//               this.onB1down()
//               break
//             case 0x0:
//               this.onup()
//               break
//           }
//         }
//       }
//     })
//     this.onA1down = () => {}
//     this.onA0down = () => {}
//     this.onB1down = () => {}
//     this.onB0down = () => {}
//     this.onup = () => {}
//   }
// }
//
// var button = new MyButton('002a1d7e', parser)
// button.onA1down = function () { console.log('A1 was pressed') }

// var data = Enocean.ByteArray.from([12, 33, 211, 17])
// console.log(data.getValue(14, 10))
