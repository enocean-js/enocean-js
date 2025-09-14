import {
  html,
  css,
} from "https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js";
import { EnoceanJSElement } from "./enocean-js-element.js";
import "./material-icon.js";
import "./device.js";

const apiClient = EnoceanJSElement.apiClient;

class EnoceanDeviceList extends EnoceanJSElement {
  constructor() {
    super();
    this.devices = [];
    this.addDeviceVisible = false;
  }
  static properties = {
    devices: { type: Array },
    addDeviceVisible: { type: Boolean },
  };
  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe_new_device = apiClient.on("new-device-found", (event) => {
      event.device_id = event.input_id;
      event.profile = JSON.stringify(event.profile);
      this.devices = [event, ...this.devices];
    });
    this.unsubscribe_deleted = apiClient.on("device-deleted", (event) => {});
    apiClient.getAllDevices().then((resp) => {
      this.devices = resp.devices;
      console.log(this.devices);
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
      column-count: 2;
      column-gap: 10px;
      padding: 10px;
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
  `;
  deviceDeleted(e) {
    this.devices = this.devices.filter((d) => d.input_id != e.detail.id);
  }
  toggleAddDeviceWindow(e) {
    if (e.target === e.currentTarget) {
      this.addDeviceVisible = !this.addDeviceVisible;
    }
  }
  createNewDevice() {
    console.log("Create new device");
  }
  render() {
    return html`<div id="container">
        <material-icon
          class="${this.addDeviceVisible ? "hidden" : ""}"
          @click="${this.toggleAddDeviceWindow}"
          id="add_device_btn"
          icon="add"
          style="font-size:2em;"
        ></material-icon>
        <div id="device-list">
          ${this.devices.map(
            (device) =>
              html`<enocean-device
                @deleted="${this.deviceDeleted}"
                name="${device.name}"
                eep="${device.input_eep}"
                output_eep="${device.output_eep}"
                output_id="${device.output_id}"
                id="${device.input_id}"
                profile="${device.profile}"
                com_type="${device.type}"
                direction="${device.direction}"
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
            placeholder="leave empty to create virtual device"
          />
          <input type="text" placeholder="Device Name" />
          <select>
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
