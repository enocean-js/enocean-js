import { GatewayApiClient, utils } from "../gateway-api-client.js";

let client = new GatewayApiClient("http://192.168.178.109:49374");

let off = client.on("data", (data) => {
  console.log("Data event:", utils.toString(data));
});
