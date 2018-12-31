/* eslint-disable no-undef  */
const CommonCommand = require('../../').CommonCommand
const ByteArray = require('../../').ByteArray
const EO = require('../../')
const Response = require('../../').Response
const assert = require('chai').assert

describe('CommonCommand', () => {
  it('CO_WR_RESET', () => {
    var cc = CommonCommand.encode(EO.CO_WR_RESET)
    assert.equal(cc.commandType.name, 'CO_WR_RESET')
    assert.equal(cc.decode().commandCode, EO.CO_WR_RESET)
    assert.equal(cc.decode().command, cc.commandType.name)
  })
  it('CO_WR_SLEEP', () => {
    var args = ByteArray.from('00000000')
    args.setValue(900, 8, 24)
    var cc = CommonCommand.encode(EO.CO_WR_SLEEP, args)
    assert.equal(cc.commandType.name, 'CO_WR_SLEEP')
    assert.equal(cc.decode().period, 900)
    assert.equal(cc.decode().commandCode, EO.CO_WR_SLEEP)
    assert.equal(cc.decode().command, cc.commandType.name)
  })
  it('CO_RD_VERSION', () => {
    var cc = CommonCommand.encode(EO.CO_RD_VERSION)
    assert.equal(cc.commandType.name, 'CO_RD_VERSION')
    assert.equal(cc.decode().commandCode, EO.CO_RD_VERSION)
    assert.equal(cc.decode().command, cc.commandType.name)
    var res = Response.encode(EO.RET_OK, ['010203ff', '040506ff', '00000001', '00000002', 'ENOCEAN'.padEnd(16, String.fromCharCode(0))])
    var ret = res.decode(cc.commandType.responsDefinition)
    assert.equal(ret.appVersion.toString(), '010203ff')
    assert.equal(ret.apiVersion.toString(), '040506ff')
    assert.equal(ret.chipId, 1)
    assert.equal(ret.chipVersion, 2)
    assert.equal(ret.appDescription, 'ENOCEAN')
  })
  it('CO_RD_SYS_LOG', () => {
    var cc = CommonCommand.encode(EO.CO_RD_SYS_LOG)
    assert.equal(cc.commandType.name, 'CO_RD_SYS_LOG')
    assert.equal(cc.decode().commandCode, EO.CO_RD_SYS_LOG)
    assert.equal(cc.decode().command, cc.commandType.name)
    var res = Response.encode(EO.RET_OK, '0102030405060708090a', 'f1f2f3f4f5f6f7f8f9fa')
    var ret = res.decode(cc.commandType.responsDefinition)
    assert.equal(ret.apiLogCounter[0], 1)
    assert.equal(ret.apiLogCounter[9], 10)
    assert.equal(ret.appLogCounter[0], 0xf1)
    assert.equal(ret.appLogCounter[9], 0xfa)
  })
  it('CO_RD_IDBASE', () => {
    var cc = CommonCommand.encode(EO.CO_RD_IDBASE)
    assert.equal(cc.commandType.name, 'CO_RD_IDBASE')
    assert.equal(cc.decode().commandCode, EO.CO_RD_IDBASE)
    assert.equal(cc.decode().command, cc.commandType.name)
    var res = Response.encode(EO.RET_OK, 'ff00aabb', '01')
    var ret = res.decode(cc.commandType.responsDefinition)
    assert.equal(ret.baseId.toString(), 'ff00aabb')
    assert.equal(ret.remainingWriteCycles, 1)
  })
})
