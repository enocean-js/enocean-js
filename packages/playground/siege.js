import { ESP3Parser, ESP3AltParser } from '@enocean-js/serialport-parser'
// import { toCRC8 } from '@enocean-js/crc8'
// import { makeESP3Packet } from '@enocean-js/esp3-packets'
const parser1 = new ESP3Parser({ maxBufferSize: 1200 })
const parser2 = new ESP3AltParser({ maxBufferSize: 1200 })

function runTest (parser) {
  var cb = x => {}
  parser.on('data', cb)
  parser.on('error', cb)

  var t1 = new Date()
  for (var t = 0; t < 50000; t++) {
    var buf = []
    for (var i = 0; i < 1000; i++) {
      buf.push(Math.floor(Math.random() * 255))
    }
    parser.write(Buffer.from(buf))
    parser.write(Buffer.from('5500010005700838', 'hex'))
    if (t % 5000 === 0)process.stdout.write('.')
  }
  parser.removeListener('data', cb)
  parser.removeListener('error', cb)
  return ((new Date()) - t1) / 1000
}

process.stdout.write('Switch case')
process.stdout.write(`finished in ${runTest(parser1)}\n`)
process.stdout.write('Callback')
process.stdout.write(`finished in ${runTest(parser2)}\n`)
