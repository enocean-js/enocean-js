import * as utils from "@enocean-js/utils";
//console.log(EEP);
let x = new Uint8Array(4);
x = utils.setValue(x, 0xffa, 4, 10);
console.log(utils.toString(x, "hex"));
