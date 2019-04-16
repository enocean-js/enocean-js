#!/usr/bin/env node
// var fc = 0

const fs = require('fs')
const eepPath = 'packages/node_modules/@enocean-js/eep-transcoder/src/eep'
var eepfiles = fs.readdirSync(eepPath)
var docsPath = 'resources/enocean-specification/Enocean Equipment Profiles/'
var func = ''
var rorg = ''
fs.writeFileSync(docsPath + 'readme.md', '')
function append (data) {
  fs.appendFileSync(docsPath + 'readme.md', data + '\n')
}
function hexr (x) {
  return parseInt(x).toString(16).padStart(2, '0')
}

function eepTable (data) {
  var eepArray = data.eep.split('-')
  return `
|    |   |   |
| -- | - | - |
| rorg | ${eepArray[0]} | ${data.rorg_title} |
| func | ${eepArray[1]} | ${data.func_title} |
| type | ${eepArray[2]} | ${data.title} |
`
}

eepfiles.forEach(file => {
  var eepstr = fs.readFileSync(eepPath + '/' + file, 'utf8')
  eepstr = eepstr.replace(/"/g, '\\"')
  eepstr = eepstr.replace(/'/g, '"')
  var json = JSON.parse(eepstr.substr(21))
  if (json.rorg_number !== rorg) {
    rorg = json.rorg_number
    append(`* **${hexr(json.rorg_number)}** ${json.rorg_title} `)
  }
  if (json.func_number !== func) {
    func = json.func_number
    append(`    * **${hexr(json.rorg_number)}-${hexr(json.func_number)}** ${json.func_title} `)
  }
  append(`        * [**${json.eep}** ${json.title}](https://enocean-js.github.io/enocean-js/eeps/${json.eep}.md) `)
  fs.writeFileSync('docs/eeps/' + `${json.eep}.md`, `${eepTable(json)}`)
})
