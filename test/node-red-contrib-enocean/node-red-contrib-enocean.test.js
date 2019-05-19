const SerialPort = require('@serialport/stream')
const MockBinding = require('@serialport/binding-mock')
// const helper = require('node-red-node-test-helper')
// const assert = require('chai').assert
// const sinon = require('sinon')

SerialPort.Binding = MockBinding
// const configNode = require('../../packages/node-red-contrib-enocean/nodes/enocean-config-node.js')
// const inputNode = require('../../packages/node-red-contrib-enocean/nodes/enocean-in.js')
// Create a port and enable the echo and recording.
MockBinding.createPort('/dev/testing2', { echo: true, record: true })
const port = new SerialPort('/dev/testing2')

port.on('data', console.log)
port.write(Buffer.from('hallo'))
// describe('enocean Node', function () {
//   beforeEach(function (done) {
//     helper.startServer(done)
//   })
//   afterEach(function (done) {
//     helper.unload()
//     helper.stopServer(done)
//   })
//   it('enocean-config-node', (done) => {
//     var flow = [{ id: 'n1', type: 'enocean-config-node', name: 'test name', serialport: '/dev/testing' } ]
//     helper.load(configNode, flow, async function () {
//       var n1 = helper.getNode('n1')
//       n1.parser.on('data', data => { console.log(data) })
//       n1.should.have.property('name', 'test name')
//       n1.should.have.property('serialport', '/dev/testing')
//       helper.request().get('/enocean-js/eep/f6-02-01').expect(200).expect(function (res) { console.log(res.body.eep === 'f6-02-01') })
//       // TODO: test the other endpoints
//     })
//     setTimeout(() => {
//       var n1 = helper.getNode('n1')
//       console.log(n1.port.isOpen)
//       done()
//     }, 1900)
//   })
//   // it('input-node', (done) => {
//   //   var flow = [
//   //     { id: 'n1', type: 'enocean-config-node', name: 'config', serialport: 'n1' },
//   //     { id: 'n2', type: 'enocean-in', name: 'input', serialport: '/dev/testing', 'wires': [['n3']]},
//   //     { id: 'n3', type: 'helper', name: 'helper' }
//   //   ]
//   //   helper.load([configNode, inputNode], flow, async function () {
//   //     var n1 = helper.getNode('n1')
//   //     // TODO: test the other endpoints
//   //   })
//   // })
// })
// [{"id":"689f319.1061dd","type":"tab","label":"Flow 3","disabled":false,"info":""},{"id":"723d0021.2919e","type":"enocean-in","z":"689f319.1061dd","serialport":"5ffd4f8d.f6fab","name":"","x":180,"y":200,"wires":[["f35732ed.6a31f"]]},{"id":"f35732ed.6a31f","type":"debug","z":"689f319.1061dd","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"false","x":360,"y":200,"wires":[]},{"id":"5ffd4f8d.f6fab","type":"enocean-config-node","z":"","serialport":"/dev/ttyUSB0"}]
