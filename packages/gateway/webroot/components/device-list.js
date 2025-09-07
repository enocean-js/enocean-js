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
  }
  static properties = {
    devices: { type: Array },
  };
  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe_new_device = apiClient.on("new-device-found", (event) => {
      this.devices = [...this.devices, event];
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
      height: 80vh;
      overflow: scroll;
    }
  `;

  render() {
    return html`<div id="container">
      <div>
        ${this.devices.map(
          (device) =>
            html`<enocean-device
              name="${device.name}"
              eep="${device.eep}"
              id="${device.device_id}"
              profile="${device.profile}"
              last_telegram="${device.last_telegram}"
            ></enocean-device>`
        )}
      </div>
    </div>`;
  }
}
customElements.define("enocean-device-list", EnoceanDeviceList);
