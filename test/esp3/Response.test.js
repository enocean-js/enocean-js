/* eslint-disable no-undef  */
const ESP3Packet = require('../../').ESP3Packet
const Response = require('../../').Response
const assert = require('chai').assert
describe('Response packets', () => {
  it('...', () => {
    var packet = ESP3Packet.from('5500050102db00ffa0870009e4')
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
    var res = Response.from(packet, desc)
    assert.equal(res.baseId, 'ffa08700')
    assert.equal(res.remainingWriteCycles, 9)
    assert.equal(res.test2[0], 9)
    assert.equal(res.test3, 123)
    assert.equal(res.getRawPacket(), '5500050102db00ffa0870009e4')
  })
})
