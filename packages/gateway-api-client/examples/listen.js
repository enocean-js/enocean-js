import { GatewayApiClient, utils } from "../gateway-api-client.js";

let client = new GatewayApiClient("http://192.168.178.109:49374");
const listenToId = "002b7cac";

let off = client.on("device-data", (telegram) => {
  if (telegram.input_id === listenToId) {
    if (telegram.data.Button1) {
      console.log("Button 1 was pressed");
    } else if (telegram.data.Button2) {
      console.log("Button 2 was pressed");
    } else if (telegram.data.Button3) {
      console.log("Button 3 was pressed");
    } else if (telegram.data.Button4) {
      console.log("Button 4 was pressed");
    } else {
      console.log("button was released");
    }
  }
});
