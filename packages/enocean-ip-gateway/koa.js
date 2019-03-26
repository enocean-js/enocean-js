var Koa = require('koa')
var app = new Koa()
const send = require('koa-send')

var Commander = require('@enocean-js/common-command').Commander
const ESP3Parser = require('@enocean-js/serialport-parser').ESP3Parser
const SerialportSender = require('@enocean-js/serialport-sender').SerialportSender
const SerialPort = require('serialport')
var serialPort = '/dev/ttyUSB0'
var commander
var baseIdInfo = {}
const port = new SerialPort(serialPort, { baudRate: 57600 })

port.on('open', async () => {
  console.log(`${serialPort} open`)
  commander = new Commander(new SerialportSender({ port: port }))
  baseIdInfo = await commander.getIdBase()
})

port.on('error', () => { port.close(); throw new Error(`could not open ${serialPort}`) })

const systemRoutes = require('./routes/system.js')
const profileRoutes = require('./routes/profiles.js')

app.use((ctx, next) => {
  ctx.commander = commander
  ctx.eoi_return_object = {
    header: {
      status: 404,
      code: 2001,
      message: `'${ctx.request.path}' not found`,
      content: '',
      gateway: `enocean-ip-gateway`,
      timestamp: (new Date())
    }
  }
  ctx.setEOIHeader = (header) => {
    ctx.eoi_return_object.header = {
      ...ctx.eoi_return_object.header,
      ...header
    }
  }
  return next()
})

app.use(async (ctx, next) => {
  if (ctx.path === '/') ctx.path = '/index.html'
  try {
    await send(ctx, ctx.path, { root: __dirname + '/static' })
  } catch (err) {
    return next()
  }
})

app.use(systemRoutes.middleware())
app.use(profileRoutes.middleware())
app.use(async (ctx, next) => {
  ctx.status = 200
  ctx.body = ctx.eoi_return_object
})

app.listen(4444, () => {
  console.log('Try out /, /foobar, /api/foobar and /api')
})
