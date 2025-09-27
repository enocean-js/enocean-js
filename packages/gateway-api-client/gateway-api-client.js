export * as utils from "@enocean-js/utils";
function log(...args) {
  const tag = "[GATEWAY-API-CLIENT]";
  console.log(tag, ...args);
}

let EventSource;
if (typeof window === "undefined") {
  EventSource = (await import("eventsource")).EventSource;
} else {
  EventSource = window.EventSource;
}

export class GatewayApiClient {
  constructor(url = "") {
    this.url = url;
    this.eventSource = new EventSource(this.url + "/api/events");
    this.eventSource.onopen = () => {
      log("Connected to Gateway API at", this.url || "default");
    };
  }

  static getInstance(url = "") {
    if (!GatewayApiClient._instance) {
      GatewayApiClient._instance = new GatewayApiClient(url);
    }
    return GatewayApiClient._instance;
  }

  static _instance = null;
  async openPort(options) {
    const openPortResponse = await fetch(
      `${this.url}/api/open_port?port=${options}`
    );
    return await openPortResponse.json();
  }
  async closePort() {
    const closePortResponse = await fetch(`${this.url}/api/close_port`);
    return await closePortResponse.json();
  }
  async isPortOpen() {
    const portStatusResponse = await fetch(`${this.url}/api/port_status`);
    return (await portStatusResponse.json()).isOpen;
  }

  async listPorts() {
    const portsResponse = await fetch(`${this.url}/api/list_ports`);
    return (await portsResponse.json()).ports;
  }

  async send(telegram) {
    const resSendTelegram = await fetch(`${this.url}/api/send-telegram`, {
      method: "POST",
      body: JSON.stringify(telegram),
      headers: { "Content-Type": "application/json" },
    });
  }

  on(event, callback) {
    const wrapper = (e) => {
      callback(JSON.parse(e.data));
    };
    this.eventSource.addEventListener(event, wrapper);
    return () => {
      this.eventSource.removeEventListener(event, wrapper);
    };
  }
  once(event, callback) {
    const wrapper = (e) => {
      callback(JSON.parse(e.data));
      this.eventSource.removeEventListener(event, wrapper);
    };
    this.eventSource.addEventListener(event, wrapper);
  }

  async getBaseId() {
    const resBaseId = await fetch(`${this.url}/api/base-id`);
    return await resBaseId.json();
  }
  async getSystemInfo() {
    const resSystemInfo = await fetch(`${this.url}/api/system-info`);
    return await resSytemInfo.json();
  }
  async getMetadata(key) {
    const resMeta = await fetch(
      `${this.url}/api/meta?key=${encodeURIComponent(key)}`
    );
    const ret = await resMeta.text();
    return ret;
  }
  async getAllMetadata() {
    const resAllMeta = await fetch(`${this.url}/api/all-meta`);
    return await resAllMeta.json();
  }
  async setMetadata(key, value) {
    const res = await fetch(
      `${this.url}/api/set-meta?key=${encodeURIComponent(
        key
      )}&value=${encodeURIComponent(value)}`
    );
    return {};
  }
  async startTeachIn(timeout) {
    let resTeachIn = await fetch(
      `${this.url}/api/start-teachin-mode${
        timeout ? `?timeout=${timeout}` : ""
      } `
    );
    return await resTeachIn.json();
  }
  async stopTeachIn() {
    let resStopTeachIn = await fetch(`${this.url}/api/stop-teachin-mode`);
    return await resStopTeachIn.json();
  }
  async startTeachOut(timeout) {
    let resTeachOut = await fetch(
      `${this.url}/api/start-teachout-mode${
        timeout ? `?timeout=${timeout}` : ""
      } `
    );
    return await resTeachOut.json();
  }
  async stopTeachOut() {
    let resStopTeachOut = await fetch(`${this.url}/api/stop-teachout-mode`);
    return await resStopTeachOut.json();
  }

  async getAllDevices() {
    const resDeviceList = await fetch(`${this.url}/api/device-list`);
    return await resDeviceList.json();
  }
  async getDevice(id, key = null) {
    const resDevice = await fetch(
      `${this.url}/api/device/${id}${key ? "?key=" + key : ""}`
    );
    return await resDevice.json();
  }
  async setDeviceName(id, name) {
    const res = await fetch(
      `${this.url}/api/device/${id}/name/set?name=${encodeURIComponent(name)}`
    );
    return await res.json();
  }
  async addDevice(id = "new", name, eep) {
    const res = await fetch(`/api/device/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eep, name }),
    });

    return await res.json();
  }
  async removeDevice(id, eep) {
    const resDeleteDevice = await fetch(`${this.url}/api/device/${id}`, {
      method: "DELETE",
      body: JSON.stringify({ eep }),
      headers: { "Content-Type": "application/json" },
    });
    return await resDeleteDevice.json();
  }
  async doAction(options) {
    const resDoAction = await fetch(`${this.url}/api/action/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options),
    });
    return await resDoAction.json();
  }
  async editDevice(id, params) {
    const resUpdateDevice = await fetch(`${this.url}/api/device/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
  }

  async getAllVirtualDevices() {
    const resVirtualDeviceList = await fetch(
      `${this.url}/api/virtual-device-list`
    );
    return await resVirtualDeviceList.json();
  }
  async getVirtualDevice(id) {
    const resVirtualDevice = await fetch(
      `${this.url}/api/virtual-device/${id}`
    );
    return await resVirtualDevice.json();
  }
  async addVirtualDevice(name, eep, profile) {
    const resAddVirtualDevice = await fetch(`${this.url}/api/virtual-device`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return await resAddVirtualDevice.text();
  }
  async removeVirtualDevice(id) {
    // Not implemented yet
  }
  async editVirtualDevice(id, params) {
    // Not implemented yet
  }

  async getProfile(eep) {
    const resProfile = await fetch(`${this.url}/api/profile/${eep}`);
    return await resProfile.json();
  }
}
