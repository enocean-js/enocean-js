/* eslint-disable no-undef  */
// const ESP3Packet = require('../../').ESP3Packet
const Response = require('../../').Response
const EO = require('../../')
const assert = require('chai').assert
describe('Response packets', () => {
  it('...', () => {
    var packet = Response.encode(EO.RET_OK, 'ffa08700', 9)
    var desc = {
      0: [
        {
          name: 'baseId',
          location: 'data',
          offset: 1,
          length: 4,
          retFunc: x => x.toString('hex')
        }, {
          name: 'remainingWriteCycles',
          location: 'optionalData',
          offset: 0,
          length: 1,
          retFunc: x => parseInt(x.toString(), 'hex')
        }, {
          name: 'test2',
          location: 'optionalData',
          retFunc: x => x
        }, {
          name: 'test3',
          value: 123
        }
      ]
    }
    var res = packet.decode(desc)
    assert.equal(res.baseId, 'ffa08700')
    assert.equal(res.remainingWriteCycles, 9)
    assert.equal(res.test2[0], 9)
    assert.equal(res.test3, 123)

    packet.decode()
    assert.equal(res.returnCode, 0)
    assert.equal(res.returnMsg, 'RET_OK')
  })
})
