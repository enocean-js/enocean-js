const ESP3Parser = require("@enocean-js/serialport-parser").ESP3Parser
const SerialPort = require('serialport')
const ESP3Transfomer = require("@enocean-js/esp3-packets").ESP3Transformer

module.exports = function(RED) {
    function EnoceanNode(config) {
        RED.nodes.createNode(this,config);
        const port = new SerialPort('/dev/ttyUSB0', { baudRate: 57600 })
        const transformer = new ESP3Transfomer()
        const parser = new ESP3Parser()
        var node = this;
        port.pipe(parser).pipe(transformer)
        transformer.on('data', data=>{
          node.send({payload:data})
          node.log(data)
          node.log(node.bla)
          node.bla = "123"
        })
    }
    RED.nodes.registerType("enocean",EnoceanNode);
}
