#!/usr/bin/env node
var xml2js = require('xml2js')
var parseString = xml2js.parseString
var builder = new xml2js.Builder({headless: true, explicitRoot:false});
var fs = require('fs')
var util = require('util')
var path = require('path')
var xml = fs.readFileSync(path.join(__dirname, process.argv[2]))
parseString(xml,{trim: true, explicitArray: false}, function (err, result) {
  if (err) {
    console.log(err)
  }
  fixField(result)
  result.eep.profile.rorg.func.type.eep = `${result.eep.profile.rorg.number}-${result.eep.profile.rorg.func.number}-${result.eep.profile.rorg.func.type.number}`
  result.eep.profile.rorg.func.type.rorg_title = result.eep.profile.rorg.title
  result.eep.profile.rorg.func.type.rorg_number = result.eep.profile.rorg.number
  result.eep.profile.rorg.func.type.func_title = result.eep.profile.rorg.func.title
  result.eep.profile.rorg.func.type.func_number = result.eep.profile.rorg.func.number
  fs.writeFileSync(path.join(__dirname, process.argv[2]+".json"), JSON.stringify(result.eep.profile.rorg.func.type, null,2))
  //console.log(util.inspect(result.eep.profile.rorg.func.type, false, null))
})

function fixField (field) {
  if (typeof field === 'string') {
    return
  }
  for (const child in field) {
    if(child==="description"){
      field[child] = builder.buildObject( field[child]  ).replace("<root>","").replace("</root>","")
    }
    if (typeof field[child] === 'string') {
      if (!isNaN(field[child])) {
        // var nn
        if (field[child].substr(0, 2) === '0b') {
          field[child] = parseInt(field[child].substr(2), 2)
        } else {
          if (!isNaN(parseInt(field[child]))) {
            field[child] = parseInt(field[child])
            // console.log(field[child], parseInt(field[child]))
          }
        }
        //
      }
    } else {
      if (typeof field[child] === 'number') {
        console.log('ok')
      } else {
        if (Array.isArray(field[child])) {
          if (field[child].length === 1) {
            field[child] = field[child][0]
            fixField(field[child])
          } else {
            field[child].forEach(item => {
              fixField(item)
            })
          }
        } else {
          if (typeof field[child] === 'object') {
            fixField(field[child])
          }
        }
      }
    }
  }
}
