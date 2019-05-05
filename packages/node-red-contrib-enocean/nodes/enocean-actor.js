const getEEP = require('@enocean-js/eep-transcoder').getEEP
const path = require('path')
module.exports = RED => {
  function EnoceanActorNode (config) {
    RED.nodes.createNode(this, config)
    this.duration = config.teachInDuration
    this.name = config.name
    this.teachInStatus = flase
    // this.eepList = config.eepList
    var node = this
    //console.log("here we go")
    this.on("input", async function(data){
       if (node.teachInStatus === true) {
         if (data.teachIn) {
           node.context().set('learnedSensor', {
             senderId:data.teachInInfo.senderId, data.teachInInfo.eep.toString(), rssi: data.RSSI
           })
      //     saveSender(node, data.teachInInfo.senderId, data.teachInInfo.eep.toString())
      //     node.stopTeachIn()
      //     node.send({
      //       payload: {
      //         senderId: data.teachInInfo.senderId,
      //         eep: data.teachInInfo.eep.toString(),
      //         manufacturer: data.teachInInfo.manufacturer
      //       },
      //       meta: makeMeta(data.teachInInfo.senderId, data.teachInInfo.eep.toString(), data)
      //     })
         }
       }
    })
    this.receive = function (msg) {
      if(!msg){
        setTimeout(() => {
          node.context().set('test', Math.random())
        }, this.duration*1000)
      }
    }
  }

  RED.nodes.registerType('enocean-actor', EnoceanActorNode)

  RED.httpAdmin.get('/enocean-js/eep/:eep', function (req, res) {
    res.send(getEEP(req.params.eep))
  })
  RED.httpAdmin.get('/enocean-js/:filename', function (req, res) {
    var options = {
      root: path.join(__dirname, '/static/'),
      dotfiles: 'deny'
    }
    res.sendFile(req.params.filename, options)
  })

}
