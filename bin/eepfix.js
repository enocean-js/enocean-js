#!/usr/bin/env node
var fc = 0

const fs = require('fs')
const eepPath = 'packages/node_modules/@enocean-js/eep-transcoder/src/eep'
var eepfiles = fs.readdirSync(eepPath)
eepfiles.forEach(file => {
  var eepstr = fs.readFileSync(eepPath + '/' + file, 'utf8')
  eepstr = eepstr.replace(/"/g, '\\"')
  eepstr = eepstr.replace(/'/g, '"')
  var json = JSON.parse(eepstr.substr(21))
  fixField(json)
  console.log(json)
})

function fixField (field) {
  if (typeof field === 'string') {
    return
  }
  for (var child in field) {
    if (typeof field[child] === 'string') {
      if (!isNaN(field[child])) {
        var nn
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

      } else {
        if (Array.isArray(field[child])) {
          field[child].forEach(item => {
            fixField(item)
          })
        } else {
          if (typeof field[child] === 'object') {
            fixField(field[child])
          }
        }
      }
    }
  }
}
