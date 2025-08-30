/*eslint-disable*/
import { ESP3Parser, ESP3CallbackParser, ESP3OptimizedParser } from '@enocean-js/serialport-parser'
// import { toCRC8 } from '@enocean-js/crc8'
// import { makeESP3Packet } from '@enocean-js/esp3-packets'
const parser1 = new ESP3OptimizedParser({ maxBufferSize: 200 })
const parser2 = new ESP3CallbackParser({ maxBufferSize: 200 })
const parser3 = new ESP3Parser({ maxBufferSize: 200 })

// var cb = x => {}
// parser3.on('data', console.log)
// parser3.on('error', console.log)
//
// parser3.write(Buffer.from('55005500010005700838', 'hex'))

function runTest (parser) {
  var cb = x => {}
  parser.on('data', cb)
  parser.on('error', cb)
  var t1 = new Date()
  for (var t = 0; t < 1000; t++) {
    var buf = []
    for (var i = 0; i < 1000; i++) {
      buf.push(Math.floor(Math.random() * 255))
    }
    parser.write(Buffer.from(buf))
    parser.write(Buffer.from('5500010005700838', 'hex'))
  }
  parser.removeListener('data', cb)
  parser.removeListener('error', cb)
  return ((new Date()) - t1) / 1000
}
function avg (arr) {
  return arr.reduce((x, y) => x + y) / arr.length
}
function makeTester (...args) {
  var results = []
  var parsers = []
  for (var i = 0; i < args.length; i++) {
    parsers.push(args[i])
    results[i] = []
  }
  return function () {
    for (var i = 0; i < 10; i++) {
      for (var p = 0; p < parsers.length; p++) {
        process.stdout.write(`test parser ${p} iteration ${i}\n`)
        var tr = runTest(parsers[p])
        results[p].push(tr)
      }
    }
    var res = []
    for (var y = 0; y < results.length; y++) {
      res.push(avg(results[y]))
    }
    return res
  }
}

var tester = makeTester(parser1, parser2, parser3)
console.log(tester())
