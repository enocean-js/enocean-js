let Router = require('koa-better-router')
let router = Router({ prefix: '/devices' }).loadMethods()

router.get('/info', async (ctx, next) => {
  ctx.setEOIHeader({
    content: 'SystemInfo',
    status: 100,
    code: 1000,
    message: 'OK'
  })
  baseIdInfo = await ctx.commander.getIdBase()
  var version = await ctx.commander.getVersion()
  var frequency = await ctx.commander.getFrequency()
  if (frequency.returnCode === 2) {
    frequency.frequency = 'unknown'
  }
  ctx.eoi_return_object.systemInfo = {
    'version': `enocean-ip-gateway ${require('../package.json').version}`,
    'baseId': baseIdInfo.baseId.toString(),
    'possibleBaseIdChanges': baseIdInfo.remainingWriteCycles,
    'eurid': version.chipId.toString(),
    'frequency': frequency.frequency
  }

  ctx.body = ctx.eoi_return_object
  return next()
})

router.get('/*', (ctx, next) => {
  ctx.setEOIHeader({
    content: 'SystemInfo',
    status: 400,
    code: 2000,
    message: `invalid URL '${ctx.request.path}'`
  })
  ctx.body = ctx.eoi_return_object
  return next()
})

module.exports = router
const ESP3Parser = require('@enocean-js/serialport-parser').ESP3Parser
const SerialPort = require('serialport')
var serialPort = '/dev/ttyUSB0'
const port = new SerialPort(serialPort, { baudRate: 57600 })
port.on('open', () => { console.log(`${serialPort} open`) })
port.on('error', () => { port.close(); throw new Error(`could not open ${serialPort}`) })

const Transform = require('stream').Transform

class EOI extends Transform {
  constructor (options) {
    super({ ...options, ...{ objectMode: true } })
  }
  _transform (chunk, encoding, cb) {
    this.push(chunk.toString())
    cb()
  }
}
const eoi = new EOI()
const parser = new ESP3Parser()
port.pipe(parser).pipe(eoi)
router.get('/stream', (ctx, next) => {
  ctx.body = eoi
  // parser.on('data', data => {
  //   ctx.res.write(JSON.stringify(data) + '\r\n\r\n')
  // })
})
