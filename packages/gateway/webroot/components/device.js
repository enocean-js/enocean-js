import {
  LitElement,
  html,
  css,
} from "https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js";
import { EnoceanJSElement } from "./enocean-js-element.js";
import "./material-icon.js";
import "./prop.js";

const apiClient = EnoceanJSElement.apiClient;
const utils = EnoceanJSElement.utils;

const deviceIconMap = {
  "f6-02-01": "switch",
  "a5-10-03": "thermostat",
  "d2-01-*": "smart_outlet",
  "d0-00-06": "battery_android_frame_4",
  "d0-00-*": "notifications_active",
  "*-*-*": "general_device",
};

function getDeviceIcon(eep) {
  const eepStr = (eep || "").toLowerCase();
  if (deviceIconMap[eepStr]) return deviceIconMap[eepStr]; // direct match first

  const parts = eepStr.split("-");
  const patterns = [`${parts[0]}-${parts[1]}-*`, `${parts[0]}-*-*`, `*-*-*`];
  for (const pattern of patterns) {
    if (deviceIconMap[pattern]) {
      return deviceIconMap[pattern];
    }
  }
  return undefined;
}
class EnoceanDevice extends EnoceanJSElement {
  constructor() {
    super();
    this.profile = {};
    this.last_telegram = JSON.stringify({
      data: { data: { name: "foo", type: "bar" } },
    });
  }
  static styles = css`
    :host {
      display: block;
      font-family: sans-serif;
    }
    .device {
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
      margin: 10px;
      border-radius: 10px;
    }
    .data {
      padding: 10px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 5px;
      border-radius: 10px 10px 0 0;
      display: flex;
      gap: 10px;
      font-weight: bold;
      font-size: 1.2em;
      background: #38a;
      color: white;
    }
    .header.new {
      background: #3a8;
    }
    .info {
      font-size: 0.8em;
      align-self: center;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 5px 10px;
      border-radius: 0 0 10px 10px;
      font-size: 0.7em;
      color: #888;
      text-align: right;
    }
    .delete {
      cursor: pointer;
      color: #f44;
    }
    #name {
      font-size: 1em;
      font-weight: bold;
      border: none;
      background: transparent;
      color: white;
      width: 100%;
    }
    #name:focus {
      outline: none;
    }
    .new-device {
      border: 2px dashed var(--color-accent, #4caf50);
    }
    .input {
      color: var(--color-accent, #23ecf3ff);
    }
    .output {
      color: var(--color-accent2, #e9993fff);
    }
    .outid {
      color: goldenrod;
    }
    .inid {
      color: seagreen;
    }
  `;
  static properties = {
    profile: { type: String },
    name: { type: String },
    eep: { type: String },
    id: { type: String },
    com_type: { type: String },
    output_eep: { type: String },
    output_id: { type: String },
    direction: { type: Number },
    rssi: { type: Number },
    manufacturer: { type: String },
  };
  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe_known = apiClient.on("device-data", (event) => {
      if (event.input_id == this.id) {
        this.profile = JSON.stringify(event.profile);
        this.rssi = event.signalStrength;
        //this.requestUpdate();
      }
    });
  }

  async setName(e) {
    const newName = e.target.value;
    await apiClient.setDeviceName(
      this.direction === 1 ? this.id : this.output_id,
      newName
    );
    this.name = newName;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe_known(); // unsubscribe
  }

  deleteDevice() {
    const id = this.direction == 1 ? this.id : this.output_id;
    const eep = this.direction == 1 ? this.eep : this.output_eep;
    return async () => {
      if (confirm(`Are you sure to delete device ${id} (${eep})?`)) {
        await apiClient.removeDevice(id, eep);
        this.dispatchEvent(
          new CustomEvent("deleted", {
            detail: { id: id, eep: eep, device: this },
            bubbles: true,
            composed: true,
          })
        );
      }
    };
  }

  render() {
    console.log(this.profile);
    const profile = JSON.parse(this.profile || "{}");
    let channels = [];
    if (profile.channels) {
      channels = profile.channels;
    } else {
      channels = [profile];
    }

    return html` <div class="device ">
      <div class="header ${this.name == "New Device" ? "new" : ""} ">
        <material-icon icon="${getDeviceIcon(this.eep)}"></material-icon>
        <input
          id="name"
          type="text"
          @change="${this.setName}"
          value="${this.name}"
        />
        ${this.direction == 1
          ? html`<material-icon
              icon="signal_cellular_${utils.erp1.getSignalQualityRating(
                this.rssi
              )}_bar"
              title="-${100 - this.rssi}dBm"
            ></material-icon>`
          : ""}
        <material-icon
          icon="${this.com_type == "bidi"
            ? "swap_vert"
            : this.direction == 1
            ? "arrow_downward"
            : "arrow_upward"}"
          class="${this.direction == 1 ? "input" : "output"}"
        ></material-icon>

        <material-icon
          icon="delete"
          class="delete"
          @click="${this.deleteDevice()}"
        ></material-icon>
      </div>
      <div class="data">
        ${channels.map((ch, index) => {
          return html`<div>
            ${channels.length == 1 ? "" : html`<div>Channel ${index + 1}</div>`}
            ${ch.props.map(
              (prop) => html`<enocean-prop
                .prop="${prop}"
                deviceId="${this.id}"
                eep="${this.eep}"
                output_id="${this.output_id}"
                output_eep="${this.output_eep}"
                channel="${index + 1}"
              ></enocean-prop>`
            )}
          </div>`;
        })}
      </div>
      <div class="footer">
        <div>${this.manufacturer}</div>
        <div>
          ${this.com_type == "bidi"
            ? html`<span class="outid">${this.output_id} · </span>`
            : ""}
          ${this.direction == 1
            ? html`<span class="inid">${this.id}</span> · ${this.eep}`
            : html`<span class="outid">${this.output_id}</span> ·
                ${this.output_eep}`}
        </div>
      </div>
    </div>`;
  }
}
customElements.define("enocean-device", EnoceanDevice);
