/* eslint no-undef: "off" */
/* eslint no-unused-vars: "off" */
async function getContext (nodeID) {
  const res = await fetch('/context/node/' + nodeID)
  const json = await res.json()
  json.default.get = function (name) {
    return JSON.parse(this[name].msg)
  }.bind(json.default)
  return json.default
}

async function editprepare () {
  const node = this
  const ctx = await getContext(node.id)
  const objSensorList = document.querySelector('#enocean-sensorlist')
  ctx.get('sensorList').forEach(item => {
    objSensorList.addItem(item)
  })
  document.querySelector('#enocean-sensorlist').addEventListener('change', async e => {
    await fetch(`/enocean-js/context/${node.id}/set/sensorList/${JSON.stringify(objSensorList.getList())}`)
  })
}
