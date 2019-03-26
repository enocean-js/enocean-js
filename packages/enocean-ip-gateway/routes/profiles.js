const Router = require('koa-better-router')
const router = Router({ prefix: '/profiles' }).loadMethods()
const eep2IP = require('@enocean-js/eep-transcoder').eep2IP

router.get('/*-*-*', async (ctx, next) => {
  ctx.setEOIHeader({
    content: 'profile',
    status: 200,
    code: 1000,
    message: 'OK'
  })

  var eep = ctx.path.replace('/profiles/', '')
  ctx.eoi_return_object.profile = eep2IP(eep)

  ctx.body = ctx.eoi_return_object
  return next()
})

router.get('/*', (ctx, next) => {
  ctx.setEOIHeader({
    content: 'profile',
    status: 400,
    code: 2000,
    message: `invalid URL '${ctx.request.path}'`
  })
  ctx.body = ctx.eoi_return_object
  return next()
})

module.exports = router
