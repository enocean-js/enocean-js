#!/usr/bin/env node
// var fc = 0

var Enocean = require('../')
for (var item in Enocean.EEP) {
  delete Enocean.EEP[item].description
  delete Enocean.EEP[item].title
  delete Enocean.EEP[item].rorg_title
  delete Enocean.EEP[item].rorg_number
  delete Enocean.EEP[item].func_title
  delete Enocean.EEP[item].func_number
  delete Enocean.EEP[item].submitter
  delete Enocean.EEP[item].originalIndex
  delete Enocean.EEP[item].number
  delete Enocean.EEP[item].status
  if (Array.isArray(Enocean.EEP[item].case)) {
    Enocean.EEP[item].case.forEach(c => {
      if (Array.isArray(c.datafield)) {
        c.datafield.forEach(d => {
          delete d.data
          delete d.description
          delete d.info
        })
      }
    })
  }
}
console.log(JSON.stringify(Enocean.EEP))
