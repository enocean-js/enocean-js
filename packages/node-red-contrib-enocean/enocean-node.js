
module.exports = function (RED) {
  RED.nodes.registerType('enocean-config-node', require('./nodes/enocean-config-node.js')(RED))
  RED.nodes.registerType('enocean-btn', require('./nodes/enocean-btn.js')(RED))
  RED.nodes.registerType('enocean-actor', require('./nodes/enocean-in.js')(RED))
  RED.nodes.registerType('enocean-out', require('./nodes/enocean-out.js')(RED))
}
