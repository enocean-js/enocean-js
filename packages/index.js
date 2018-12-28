// Set options as a parameter, environment variable, or rc file.
/*eslint-disable */
var exp = {}
requireAll("@enocean-js/byte-array")
requireAll("@enocean-js/crc8")
requireAll("@enocean-js/esp3-packets")
requireAll("@enocean-js/esp3-packet")
requireAll("@enocean-js/radio-erp1")
requireAll("@enocean-js/common-command")
requireAll("@enocean-js/pretty-printer")
requireAll("@enocean-js/serialport-parser")
requireAll("@enocean-js/serialport-sender")
requireAll("@enocean-js/serialport-sender")
requireAll("@enocean-js/eep-transcoder")

function requireAll(st){
  var tmp = {}
  var e = require(st)
  for(var item in e){
    tmp[item] = e[item]
  }
  exp = {...tmp,...exp}
}

module.exports = exp
