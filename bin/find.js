const ENOCEAN = require("../")
const EEP = ENOCEAN.EEP
for(eep in EEP){
  search(EEP[eep],eep)
}

function search(obj,eep){
  for(item in obj){
    if(item === "shortcut"){
      if(typeof obj.shortcut === "string"){
        if(hasLowerCase(obj.shortcut)){
          console.log(eep,obj.shortcut)
        }
      }
    } else {
      if(typeof obj[item] === "object"){
        search(obj[item],eep)
      }
    }
  }
}

function hasLowerCase(str) {
    return str.toUpperCase() != str;
}
