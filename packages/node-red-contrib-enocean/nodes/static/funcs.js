async function getContext (nodeID) {
  var res = await fetch('/context/node/' + nodeID)
  var json = await res.json()
  json.default.get = function (name) {
    return this[name].msg
  }.bind(json.default)
  return json.default
}

async function editprepare () {
  var node = this
  var sl = document.getElementById('eo-known-sensors')
  this.eeplist.forEach(item => {
    item.info = 'hallo'
    document.querySelector('#enocean-sensorlist').addItem(item)
  })

  document.querySelector('#enocean-sensorlist').addEventListener('change', async evt => {
    document.querySelector('#node-input-sensors').value = Date.now()
    // console.log(document.querySelector("#enocean-sensorlist").getList())
  })

  document.querySelector('#eo-lrn-btn').addEventListener('click', async evt => {
    // var res = await fetch("/inject/"+node.id,{method:"POST"})
    // setTimeout(async ()=>{
    //   var ctx = await getContext(node.id)
    //   document.querySelector("#eo-sensor-info").innerHTML = ctx.get("test")
    //   node.eeplist.push({senderId:"aabbccdd",eep:"f6-03-01"})
    //   var div = document.createElement("div")
    //   div.appendChild(document.createTextNode("aabbccdd"))
    //   sl.appendChild(div)
    //   //node.sensors = JSON.stringify(node.eeplist)
    //   document.querySelector("#node-input-sensors").value = JSON.stringify(node.eeplist)
    // },2500)
  })
}
