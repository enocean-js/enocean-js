/*eslint-disable*/
module.exports = function (root, pathname, options) {
  if (typeof root !== 'string') {
    throw new TypeError('koa-better-serve: expect `root` to be string')
  }

  options =
  options = Object.assign({ root }, options)
  pathname = pathname || '/'

  if (kindOf(pathname) !== 'string') {
    throw new TypeError('koa-better-serve: expect `pathname` to be string')
  }

  return (ctx, next) => {
    const filepath = ctx.path.replace(pathname, '')

    return send(ctx, filepath, options).catch((er) => {
      /* istanbul ignore else */
      if (er.code === 'ENOENT' && er.status === 404) {
        return next()
      }
    })
  }
}
