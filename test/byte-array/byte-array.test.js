/* eslint-disable no-undef  */
const EO = require('../../')
const ByteArray = EO.ByteArray
const assert = require('chai').assert

describe('ByteArray', () => {
  it('SHOULD behave like an Array', () => {
    assert.equal((new ByteArray()).length, 0, `empty constructor results in non empty array`)
    assert.equal((new ByteArray(42)).length, 42, 'wrong array length')
    assert.equal((new ByteArray(1, 2, 3, 4))[2], 3, '...')
    var a = new ByteArray()
    a.push(5)
    assert.equal(a[0], 5, '...')
  })
  it('be able to turn strings into byte arrays', () => {
    var a = ByteArray.from('a1b2c3d4e5f6')
    assert.equal(a.length, 6, '...')
  })
  it('and arrays into strings', () => {
    var a = ByteArray.from('a1b2c3d4e5f6')
    assert.equal(a.toString('hex'), 'a1b2c3d4e5f6', '...')
    a = ByteArray.from([1, 2, 3])
    assert.equal(a.toString('hex'), '010203', '...')
    a = ByteArray.from([1])
    assert.equal(a.toString('hex'), '01', 'array')
    a = ByteArray.from('01')
    assert.equal(a.toString('hex'), '01', 'string')
  })
  it('SHOULD add a leading 0 when string does NOT contain an even number of chars', () => {
    assert.equal(ByteArray.from('1').toString('hex'), '01', 'not padded')
  })
  it('SHOULD throw when string contains a char that is a hex digit', () => {
    assert.throws(() => { ByteArray.from('xx') }, '0-9 a b c d e f')
  })
  it('SHOULD allow for mixed creation of Arrays', () => {
    var a = ByteArray.from('55', [1, 2, 3], 4, [5, 6, ['ff', 7]])
    assert.equal(a.toString('hex'), '55010203040506ff07', '...')
  })
  it('Should allow to set Subarrays', () => {
    var a = ByteArray.from('00112233')
    a.set('aa', 2)
    assert.equal(a.toString('hex'), '0011aa33', '...')
  })
  it('SHOULD turn numbers larger than 255 into a sequence of numbers smaller or equal to 255', () => {
    var a = ByteArray.from(0x11223344)
    assert.equal(a.toString('hex'), '11223344', '...')
  })
  it('SHOULD return ascii encoded strings by default', () => {
    var a = ByteArray.from(0x48414c4c4f)
    assert.equal(a.toString('ascii'), 'HALLO', '...')
  })
})
