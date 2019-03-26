/*eslint-disable*/
let Router = require('koa-better-router')
let router = Router({ prefix: '/system' }).loadMethods()

router.get('/info', async (ctx, next) => {
  ctx.setEOIHeader({
    content: 'SystemInfo',
    status: 200,
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
  ctx.status = 200
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
