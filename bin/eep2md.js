#!/usr/bin/env node
// var fc = 0

const fs = require('fs')
const eepPath = 'packages/node_modules/@enocean-js/eep-transcoder/src/eep'
var eepfiles = fs.readdirSync(eepPath)
var docsPath = 'resources/enocean-specification/Enocean Equipment Profiles/'
var func = ''
var rorg = ''
var all = []
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

function datafieldTable (df) {
  var res = `| key | data | description | values |
| --- | --- | --- | --- |
  `
  df.forEach(item => {
    if (item.reserved) {
    } else {
      res += `| ${item.shortcut} | ${item.data} | ${item.description} | ${datafieldContent(item)} | \n`
    }
  })
  return res
}

function datafieldContent () {

}

function details (data) {
  var res = ''
  if (data.case) {
    if (data.case.length > 1) {
      if (data.case[0].condition) {
        data.case.forEach((item, index) => {
          res += `### case ${index}`
        })
      } else {
        res += `### spec broken`
      }
    } else {
      // most common case. just 1 case, no condition
      if (!Array.isArray(data.case)) {
        console.log('boom')
      } else {
        if (!Array.isArray(data.case[0].datafield)) {
          console.log(data.eep)
        } else {
          res += `${datafieldTable(data.case[0].datafield)}`
        }
      }
    }
  } else {
    if (data.ref) {
      res += `see [${data.ref}](${data.ref}.md)`
    } else {
      console.log('something went wrong')
    }
  }
  return res
}

eepfiles.forEach(file => {
  var eepstr = fs.readFileSync(eepPath + '/' + file, 'utf8')
  eepstr = eepstr.replace(/"/g, '\\"')
  eepstr = eepstr.replace(/'/g, '"')
  var json = JSON.parse(eepstr.substr(21))
  for (var n in json) {
    if (!all.find(x => x === n)) {
      all.push(n)
    }
  }
  if (json.rorg_number !== rorg) {
    rorg = json.rorg_number
    append(`* **${hexr(json.rorg_number)}** ${json.rorg_title} `)
  }
  if (json.func_number !== func) {
    func = json.func_number
    append(`    * **${hexr(json.rorg_number)}-${hexr(json.func_number)}** ${json.func_title} `)
  }
  append(`        * [**${json.eep}** ${json.title}](https://enocean-js.github.io/enocean-js/eeps/${json.eep}.md) `)
  fs.writeFileSync('docs/eeps/' + `${json.eep}.md`, `${eepTable(json)}\n${details(json)}
  `)
})
console.log(all.join('\n'))
