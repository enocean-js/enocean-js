import { LitElement } from "https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js";
import { GatewayApiClient, utils } from "../gateway-api-client.js";

class EnoceanJSElement extends LitElement {
  utils = utils;
  static apiClient = new GatewayApiClient();
}

export { EnoceanJSElement };
