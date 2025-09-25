import { GatewayApiClient, utils } from "../gateway-api-client.js";

let client = new GatewayApiClient("http://192.168.178.109:49374");

client.eventSource.onopen = async () => {
  await client.doAction("ffe1ca84", { Button1: true });
  await client.doAction("ffe1ca84", {});
  client.eventSource.close();
};
