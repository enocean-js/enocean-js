import { ESP3Parser, ESP3AltParser } from '@enocean-js/serialport-parser'
// import { toCRC8 } from '@enocean-js/crc8'
// import { makeESP3Packet } from '@enocean-js/esp3-packets'
const parser1 = new ESP3Parser({ maxBufferSize: 120 })
const parser2 = new ESP3AltParser({ maxBufferSize: 120 })

function runTest (parser) {
  parser.on('data', data => { })
  parser.on('error', data => { })

  var t1 = new Date()
  for (var t = 0; t < 50000; t++) {
    var buf = []
    for (var i = 0; i < 1000; i++) {
      buf.push(Math.floor(Math.random() * 255))
    }
    parser.write(Buffer.from(buf))
    parser.write(Buffer.from('5500010005700838', 'hex'))
  }

  return ((new Date()) - t1) / 1000
}
console.log(runTest(parser1), 'Switch case')
console.log(runTest(parser2), 'callback')
