import {
  html,
  css,
} from "https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js";
import { EnoceanJSElement } from "./enocean-js-element.js";
import "./material-icon.js";
import "./device.js";

const apiClient = EnoceanJSElement.apiClient;
const utils = EnoceanJSElement.utils;

class EnoceanDeviceList extends EnoceanJSElement {
  constructor() {
    super();
    this.devices = [];
    this.addDeviceVisible = false;
    this.newDevice = {
      id: utils.CREATE_NEW_DEVICE_FLAG,
      name: "",
      eep: "f6-02-01",
    };
    this.searchTerm = "";
  }
  static properties = {
    devices: { type: Array },
    addDeviceVisible: { type: Boolean },
    searchTerm: { type: String },
  };
  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe_new_device = apiClient.on("new-device-found", (event) => {
      this.devices = [...this.devices, event];
      this.addDeviceVisible = false;
    });
    this.unsubscribe_deleted = apiClient.on("device-deleted", (event) => {});
    apiClient.getAllDevices().then((resp) => {
      this.devices = resp.devices;
    });
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe_new_device(); // unsubscribe
    this.unsubscribe_deleted(); // unsubscribe
  }

  static styles = css`
    :host {
      display: block;
    }
    .line {
      color: #ddd;
      font-family: monospace;
    }
    .known-device,
    .value.boolean.true {
      color: var(--color-accent, #4caf50);
    }
    .unknown-device {
      color: var(--color-danger, #0e70c0ff);
    }
    .known-device-no-eep,
    .value.boolean.false {
      color: var(--color-danger, #f44336);
    }
    .key {
      color: var(--color-key, #0e70c0ff);
    }
    .value {
      color: var(--color-value, #03a9f4);
    }
    #container {
      height: calc(100vh - 40px);
      overflow: scroll;
    }
    #device-list {
      column-count: auto;
      column-width: 350px;
      column-gap: 10px;
      padding: 10px;
      column-fill: balance;
    }
    #device-list enocean-device:first-child {
      margin-top: -10px;
    }
    enocean-device {
      break-inside: avoid;
      display: block;
    }

    #add_device_btn {
      position: fixed;
      display: flex;
      justify-content: center;
      align-items: center;
      background: orange;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      color: white;
      padding: 5px;
      margin: 10px;
      cursor: pointer;
      bottom: 0;
      right: 0;
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
      z-index: 1000;
    }
    #add_device_container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
    }
    #add_device_container.hidden,
    #add_device_btn.hidden {
      display: none;
    }
    #add_device {
      background: white;
      border-radius: 10px;
      width: auto;
      height: auto;
      color: black;
      padding: 20px;
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
      z-index: 1001;
    }
    #add_device input,
    #add_device select {
      font-size: 1em;
      margin: 5px;
      padding: 5px;
    }

    #add_device_confirm {
      font-size: 1em;
      margin: 5px;
      padding: 5px 10px;
      background: orange;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
    #search {
      margin: 10px;
      padding: 5px;
      margin-left: 20px;
      font-size: 1.2em;
      border-radius: 5px;
      border: 1px solid black;
      width: calc(100% - 50px);
    }
  `;
  deviceDeleted(e) {
    apiClient.getAllDevices().then((resp) => {
      this.devices = resp.devices;
    });
  }
  toggleAddDeviceWindow(e) {
    if (e.target === e.currentTarget) {
      this.addDeviceVisible = !this.addDeviceVisible;
    }
  }
  async createNewDevice() {
    const response = await apiClient.addDevice(
      this.newDevice.id,
      this.newDevice.name,
      this.newDevice.eep
    );
    this.newDevice = {
      id: utils.CREATE_NEW_DEVICE_FLAG,
      name: "",
      eep: this.newDevice.eep,
    };
  }
  _onDeviceIdChange(e) {
    this.newDevice.id = e.target.value;
  }
  _onDeviceNameChange(e) {
    this.newDevice.name = e.target.value;
  }
  _onDeviceEEPChange(e) {
    this.newDevice.eep = e.target.value;
  }
  _onSearchChange(e) {
    console.log(this.searchTerm);
    this.searchTerm = e.target.value;
  }
  render() {
    const search = (this.searchTerm || "").toLowerCase();
    const devices = this.devices
      .filter((device) => {
        return (
          String(device.name || "")
            .toLowerCase()
            .includes(search) ||
          String(device.input_id || "")
            .toLowerCase()
            .includes(search) ||
          String(device.output_id || "")
            .toLowerCase()
            .includes(search) ||
          String(device.input_eep || "")
            .toLowerCase()
            .includes(search) ||
          String(device.output_eep || "")
            .toLowerCase()
            .includes(search) ||
          String(device.manufacturer || "")
            .toLowerCase()
            .includes(search)
        );
      })
      .reverse();
    return html`<div id="container">
        <input
          id="search"
          type="text"
          @input="${this._onSearchChange}"
          placeholder="Search devices..."
        />
        <material-icon
          class="${this.addDeviceVisible ? "hidden" : ""}"
          @click="${this.toggleAddDeviceWindow}"
          id="add_device_btn"
          icon="add"
          style="font-size:2em;"
        ></material-icon>
        <div id="device-list">
          ${devices.map(
            (device) =>
              html`<enocean-device
                @click="${this.deviceClicked}"
                @deleted="${this.deviceDeleted}"
                name="${device.name}"
                eep="${device.input_eep}"
                output_eep="${device.output_eep}"
                output_id="${device.output_id}"
                id="${device.input_id}"
                profile="${device.profile}"
                com_type="${device.type}"
                direction="${device.direction}"
                rssi="${device.rssi}"
                manufacturer="${device.manufacturer}"
              ></enocean-device>`
          )}
        </div>
      </div>
      <div
        id="add_device_container"
        @click="${this.toggleAddDeviceWindow}"
        class="${this.addDeviceVisible ? "" : "hidden"}"
      >
        <div id="add_device">
          <input
            type="text"
            @change="${this._onDeviceIdChange}"
            placeholder="leave empty to create virtual device"
          />
          <input
            @change="${this._onDeviceNameChange}"
            type="text"
            placeholder="Device Name"
          />
          <select @change="${this._onDeviceEEPChange}" value="f6-02-01">
            <option value="f6-02-01">f6-02-01 (Switch)</option>
            <option value="d2-01-0a">d2-01-0a (Wall Plug)</option>
            <option value="a5-10-03">a5-10-03 (Thermostat)</option>
          </select>
          <button id="add_device_confirm" @click="${this.createNewDevice}">
            Create
          </button>
        </div>
      </div>`;
  }
}
customElements.define("enocean-device-list", EnoceanDeviceList);
