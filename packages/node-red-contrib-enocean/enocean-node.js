const ESP3Parser = require("@enocean-js/serialport-parser").ESP3Parser
const SerialPort = require('serialport')
const ESP3Transfomer = require("@enocean-js/esp3-packets").ESP3Transformer

module.exports = function(RED) {
  function EnOceanConfigNode(config) {
      RED.nodes.createNode(this,config);
      this.serialport = config.serialport;
      this.port = null
      try{
        console.log("hallo")
        this.port = new SerialPort(this.serialport, { baudRate: 57600 })
      }catch(err){
        console.log(err)
      }
  }
  RED.nodes.registerType("enocean-config-node",EnOceanConfigNode);

  function EnoceanActorNode(config) {
    RED.nodes.createNode(this,config);
    this.eep = config.eep
    this.senderId = config.senderid
    var node=this
    EnoceanListener(node,config,data=>{
      if(data.senderId===node.senderId){
        node.send({payload: data.decode(node.eep) })
      }
      if(node.senderId===""){
        console.log("unknown",data.teachIn)
        if(data.teachIn){
          console.log(data.teachInInfo)
          node.send({
            payload: {
              senderId:data.teachInInfo.senderId,
              eep:data.teachInInfo.eep.toString(),
            }
          })
        }
      }
    })
  }
  RED.nodes.registerType("enocean-actor",EnoceanActorNode);

  function EnoceanListener(node,config,cb){
    const transformer = new ESP3Transfomer()
    const parser = new ESP3Parser()
    const usb = RED.nodes.getNode(config.serialport)
    node.on('close', function (done) {
      usb.port.close(done);
    });
    usb.port.pipe(parser).pipe(transformer)
    transformer.on('data', cb)
  }

  // function EnoceanTeachInInfoNode(config) {
  //   RED.nodes.createNode(this,config);
  //   EnoceanListener(this,config,data=>{
  //     if(data.teachIn){
  //       node.send({payload: data.teachInInfo })
  //     }
  //   })
  // }
  // RED.nodes.registerType("enocean-teach-in-info", EnoceanTeachInInfoNode);
}
